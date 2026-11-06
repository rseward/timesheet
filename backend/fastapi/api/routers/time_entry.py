"""Smart date defaulting for Time Entry (Ticket #56).

Computes the next available work day when the Time Entry modal opens:
- Starts from the most recent date with billing entries
- Finds next Mon-Fri
- Skips days with existing entries ending after 4:55 PM
- Skips holidays (client-specific or federal)
"""

import datetime
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from bluestone.timesheet.auth.auth_bearer import JWTBearer
from bluestone.timesheet.data.daos import getDaoFactory

daos = getDaoFactory()

router = APIRouter(
    prefix="/api/time-entry",
    tags=["time-entry"],
    responses={404: {"description": "Not found"}},
)


def is_workday(date: datetime.date) -> bool:
    """Check if date is a work day (Mon-Fri)."""
    return date.weekday() < 5  # 0=Monday, 4=Friday


def is_holiday(date: datetime.date, client_id: Optional[int] = None) -> bool:
    """Check if date is a holiday for client or federal.
    
    Holidays stored with client_id=0 are federal holidays.
    When client_id is provided, checks both client-specific AND federal holidays.
    When client_id is None or 0, checks only federal holidays.
    """
    HolidayDao = daos.getHolidayDao()
    if not HolidayDao:
        return False
    
    # checkDateIsHoliday handles both client-specific and federal (client_id=0)
    # in a single query using an OR clause
    holiday = HolidayDao.checkDateIsHoliday(client_id or 0, date)
    return holiday is not None


def get_holiday_info(date: datetime.date, client_id: Optional[int] = None) -> Optional[dict]:
    """Get holiday details if date is a holiday, else return None.
    
    Returns dict with: name, description, is_federal, client_id
    """
    HolidayDao = daos.getHolidayDao()
    if not HolidayDao:
        return None
    
    holiday = HolidayDao.checkDateIsHoliday(client_id or 0, date)
    if holiday is None:
        return None
    
    return {
        "name": holiday.name,
        "description": holiday.description,
        "is_federal": holiday.client_id == 0,
        "client_id": holiday.client_id,
        "holiday_date": date.isoformat()
    }


def enforce_holiday_restriction(entry_date: datetime.date, client_id: Optional[int] = None) -> None:
    """Raise HTTPException if the given date is a holiday for the client.
    
    This is the shared enforcement function that all time-entry endpoints
    should call to prevent time entries on holidays (Ticket #297).
    
    Args:
        entry_date: The date to check
        client_id: The client ID for client-specific holiday checking.
                   If None, only federal holidays are checked.
    
    Raises:
        HTTPException: 400 if the date is a holiday
    """
    holiday_info = get_holiday_info(entry_date, client_id)
    if holiday_info:
        holiday_type = "federal" if holiday_info["is_federal"] else "client-specific"
        raise HTTPException(
            status_code=400,
            detail=(
                f"Cannot create or modify time entries for {entry_date.isoformat()} "
                f"because it is a {holiday_type} holiday: {holiday_info['name']}. "
                f"Holiday time entry restrictions are enforced for this client."
            )
        )


def _get_client_id_for_project(project_id: int) -> Optional[int]:
    """Look up the client_id for a given project_id.
    
    Returns None if the project doesn't exist or client_id can't be determined.
    """
    ProjectDao = daos.getProjectDao()
    if not ProjectDao:
        return None
    result = ProjectDao._getById(project_id)
    if result:
        return result.client_id
    return None


def has_late_entry(date: datetime.date, timekeeper_id: int,
                   client_id: Optional[int] = None,
                   project_id: Optional[int] = None) -> bool:
    """Check if timekeeper has an entry on date ending after 4:55 PM.

    Returns True if there's an existing entry that ends after 4:55 PM.
    """
    BillingEventDao = daos.getBillingEventDao()
    if not BillingEventDao:
        return False

    # Get all entries for the date
    start_dt = datetime.datetime.combine(date, datetime.time(0, 0))
    end_dt = datetime.datetime.combine(date, datetime.time(23, 59, 59))

    # getAll returns tuples of (BillingEvent, project_title, task_name)
    # Note: include_inactive=True to get all entries (active and inactive)
    results = BillingEventDao.getAll(start_date=start_dt, end_date=end_dt, include_inactive=True)

    # Check if any entry ends after 4:55 PM (16:55)
    threshold_time = datetime.time(16, 55)
    for row in results:
        # SQLAlchemy Row - access by index
        # Row structure: (BillingEvent, project_title, task_name)
        event = row[0]  # First element is the BillingEvent object

        # Filter by timekeeper_id and check end time
        if event.timekeeper_id == timekeeper_id:
            if event.end_time:
                end_time = event.end_time.time() if hasattr(event.end_time, 'time') else event.end_time
                if end_time > threshold_time:
                    return True

    return False


def compute_next_available_date(timekeeper_id: int,
                                 client_id: Optional[int] = None,
                                 project_id: Optional[int] = None,
                                 start_from: Optional[datetime.date] = None) -> Dict[str, Any]:
    """Compute the next available date for time entry.

    Algorithm:
    1. Find the most recent date with billing entries for this timekeeper
    2. Start from that date (or today if no entries exist)
    3. Find next work day (Mon-Fri)
    4. Check if holiday → skip
    5. Check if has late entry (>4:55 PM) → skip
    6. Return first available date

    Returns:
        Dict with computed date and reason
    """
    if start_from is None:
        # Find the most recent billing entry date
        BillingEventDao = daos.getBillingEventDao()
        if BillingEventDao:
            # Get entries from the past 90 days to find the most recent
            end_date = datetime.date.today()
            start_date = end_date - datetime.timedelta(days=90)
            start_dt = datetime.datetime.combine(start_date, datetime.time(0, 0))
            end_dt = datetime.datetime.combine(end_date, datetime.time(23, 59, 59))

            # getAll returns tuples of (BillingEvent, project_title, task_name)
            # Note: include_inactive=True to get all entries (active and inactive)
            results = BillingEventDao.getAll(start_date=start_dt, end_date=end_dt, include_inactive=True)

            # Filter by timekeeper_id and find the most recent entry date
            if results:
                most_recent_date = None
                for row in results:
                    # SQLAlchemy Row - access by index or column name
                    # Row structure: (BillingEvent, project_title, task_name)
                    event = row[0]  # First element is the BillingEvent object

                    # Filter by timekeeper_id
                    if event.timekeeper_id == timekeeper_id:
                        event_date = event.start_time.date() if hasattr(event.start_time, 'date') else event.start_time
                        if most_recent_date is None or event_date > most_recent_date:
                            most_recent_date = event_date

                if most_recent_date:
                    start_from = most_recent_date
                else:
                    start_from = datetime.date.today()
            else:
                start_from = datetime.date.today()
        else:
            start_from = datetime.date.today()

    current = start_from
    max_iterations = 365  # Safety limit
    iterations = 0
    
    while iterations < max_iterations:
        iterations += 1
        
        # Check if work day
        if not is_workday(current):
            current += datetime.timedelta(days=1)
            continue
        
        # Check if holiday
        if is_holiday(current, client_id):
            current += datetime.timedelta(days=1)
            continue
        
        # Check if has late entry
        if has_late_entry(current, timekeeper_id, client_id, project_id):
            current += datetime.timedelta(days=1)
            continue
        
        # Found available date
        return {
            "date": current.isoformat(),
            "reason": "next_available_workday",
            "checked_from": start_from.isoformat(),
            "iterations": iterations
        }
    
    # Should not reach here, but safety fallback
    return {
        "date": current.isoformat(),
        "reason": "fallback_after_max_iterations",
        "checked_from": start_from.isoformat(),
        "iterations": iterations
    }


@router.get(
    "/next-date",
    response_model=Dict[str, Any],
    dependencies=[Depends(JWTBearer())],
)
def get_next_available_date(
    timekeeper_id: int = Query(..., description="Timekeeper user ID"),
    client_id: Optional[int] = Query(None, description="Client ID (for holiday checking)"),
    project_id: Optional[int] = Query(None, description="Project ID"),
    start_from: Optional[str] = Query(None, description="Start date (ISO format, default: today)")
) -> Dict[str, Any]:
    """Compute next available date for time entry.

    Implements smart date defaulting (Ticket #56):
    - Starts from the most recent date with billing entries
    - Finds next Mon-Fri
    - Skips holidays (client-specific or federal)
    - Skips days with entries ending after 4:55 PM

    Returns the first available date for new time entry.
    """
    start_date = None
    if start_from:
        try:
            start_date = datetime.date.fromisoformat(start_from)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use ISO format (YYYY-MM-DD)")
    
    return compute_next_available_date(
        timekeeper_id=timekeeper_id,
        client_id=client_id,
        project_id=project_id,
        start_from=start_date
    )


@router.get(
    "/default-times",
    response_model=Dict[str, str],
    dependencies=[Depends(JWTBearer())],
)
def get_default_times(
    timekeeper_id: int = Query(..., description="Timekeeper user ID")
) -> Dict[str, str]:
    """Get default start/end times for timekeeper.
    
    Returns user's preferred working hours from preferences.
    Falls back to 9AM-5PM if not configured.
    """
    PreferencesDao = daos.getPreferencesDao()
    if PreferencesDao:
        prefs = PreferencesDao.get_by_timekeeper(timekeeper_id)
        if prefs:
            return {
                "start_time": prefs.default_start_time or "09:00",
                "end_time": prefs.default_end_time or "17:00"
            }
    
    # Fallback defaults
    return {
        "start_time": "09:00",
        "end_time": "17:00"
    }


@router.get(
    "/week-info",
    response_model=Dict[str, Any],
    dependencies=[Depends(JWTBearer())],
)
def get_week_info(
    timekeeper_id: int = Query(..., description="Timekeeper user ID"),
    week_start_date: str = Query(..., description="Start date of the week to check (YYYY-MM-DD)"),
    client_id: Optional[int] = Query(None, description="Client ID (for client-specific holiday checking)")
) -> Dict[str, Any]:
    """Get information about a week's time entries and offer to copy from previous week.
    
    Returns:
        - has_entries: bool - whether the week already has time entries
        - previous_week_entries: list - entries from the previous week (for copy feature)
        - holidays: list - holidays in the target week (both federal AND client-specific)
    """
    import datetime
    from dateutil.relativedelta import relativedelta
    
    try:
        week_start = datetime.date.fromisoformat(week_start_date)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use ISO format (YYYY-MM-DD)")
    
    # Ensure week_start is a Monday
    if week_start.weekday() != 0:
        raise HTTPException(status_code=400, detail="week_start_date must be a Monday")
    
    # Calculate previous week's Monday
    previous_week_start = week_start - relativedelta(weeks=1)
    previous_week_end = week_start - relativedelta(days=1)
    
    BillingEventDao = daos.getBillingEventDao()
    HolidayDao = daos.getHolidayDao()
    ProjectDao = daos.getProjectDao()
    
    # Check if week already has entries
    week_end = week_start + relativedelta(days=6)
    start_dt = datetime.datetime.combine(week_start, datetime.time(0, 0))
    end_dt = datetime.datetime.combine(week_end, datetime.time(23, 59, 59))
    
    current_entries = BillingEventDao.get_by_timekeeper_and_range(
        timekeeper_id, start_dt, end_dt
    )
    has_entries = len(current_entries) > 0
    
    # Get previous week's entries (only for Mon-Fri work days)
    prev_start_dt = datetime.datetime.combine(previous_week_start, datetime.time(0, 0))
    prev_end_dt = datetime.datetime.combine(previous_week_end, datetime.time(23, 59, 59))
    
    previous_entries = BillingEventDao.get_by_timekeeper_and_range(
        timekeeper_id, prev_start_dt, prev_end_dt
    )
    
    # Infer client_id from first previous entry's project if not provided
    effective_client_id = client_id
    if effective_client_id is None and previous_entries and ProjectDao:
        first_project = ProjectDao._getById(previous_entries[0].project_id)
        if first_project:
            effective_client_id = first_project.client_id
    
    # Get holidays for the target week - check BOTH client-specific AND federal
    # Previously only checked federal (client_id=0), missing client-specific holidays (Ticket #297)
    holidays = []
    current_date = week_start
    while current_date <= week_end:
        holiday_check = HolidayDao.checkDateIsHoliday(effective_client_id or 0, current_date) if HolidayDao else None
        if holiday_check:
            holidays.append({
                "date": current_date.isoformat(),
                "name": holiday_check.name,
                "is_federal": holiday_check.client_id == 0,
                "client_id": holiday_check.client_id
            })
        current_date += datetime.timedelta(days=1)
    
    # Format previous week entries for copying
    entries_to_copy = []
    for entry in previous_entries:
        entry_date = entry.start_time.date() if hasattr(entry.start_time, 'date') else entry.start_time
        
        # Skip weekends
        if entry_date.weekday() >= 5:
            continue
        
        # Check if this day would be a holiday in the target week
        is_holiday = any(h["date"] == entry_date.isoformat() for h in holidays)
        if is_holiday:
            continue
        
        # Calculate day offset (how many days from Monday)
        day_offset = (entry_date.weekday())  # 0=Monday, 4=Friday
        
        entries_to_copy.append({
            "project_id": entry.project_id,
            "task_id": entry.task_id,
            "day_offset": day_offset,  # 0-4 for Mon-Fri
            "start_time": entry.start_time.isoformat() if hasattr(entry.start_time, 'isoformat') else str(entry.start_time),
            "end_time": entry.end_time.isoformat() if hasattr(entry.end_time, 'isoformat') else str(entry.end_time),
            "log_message": entry.log_message,
            "trans_num": entry.trans_num
        })
    
    return {
        "week_start_date": week_start_date,
        "has_entries": has_entries,
        "current_entry_count": len(current_entries),
        "previous_week_entries": entries_to_copy,
        "previous_week_start": previous_week_start.isoformat(),
        "holidays": holidays,
        "can_copy": len(entries_to_copy) > 0
    }


@router.post(
    "/copy-week",
    response_model=Dict[str, Any],
    dependencies=[Depends(JWTBearer())],
)
def copy_week_entries(
    timekeeper_id: int = Query(..., description="Timekeeper user ID"),
    source_week_start: str = Query(..., description="Source week start date (YYYY-MM-DD)"),
    target_week_start: str = Query(..., description="Target week start date (YYYY-MM-DD)"),
    client_id: Optional[int] = Query(None, description="Client ID (for client-specific holiday checking)")
) -> Dict[str, Any]:
    """Copy time entries from one week to another, skipping holidays.
    
    This implements the "Predictive Time Entry" feature:
    1. When entering data for a new week with no entries
    2. Offer to copy hours from the previous week
    3. Skip any days that might be holidays (both federal AND client-specific)
    
    If client_id is not provided, it is inferred from the first source entry's
    project_id (Ticket #297).
    """
    import datetime
    from dateutil.relativedelta import relativedelta
    import uuid
    
    try:
        source_start = datetime.date.fromisoformat(source_week_start)
        target_start = datetime.date.fromisoformat(target_week_start)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use ISO format (YYYY-MM-DD)")
    
    # Ensure both are Mondays
    if source_start.weekday() != 0 or target_start.weekday() != 0:
        raise HTTPException(status_code=400, detail="Both dates must be Mondays")
    
    HolidayDao = daos.getHolidayDao()
    BillingEventDao = daos.getBillingEventDao()
    ProjectDao = daos.getProjectDao()
    
    # Get source week entries
    source_end = source_start + relativedelta(days=6)
    src_start_dt = datetime.datetime.combine(source_start, datetime.time(0, 0))
    src_end_dt = datetime.datetime.combine(source_end, datetime.time(23, 59, 59))
    
    source_entries = BillingEventDao.get_by_timekeeper_and_range(
        timekeeper_id, src_start_dt, src_end_dt
    )
    
    # Infer client_id from first source entry's project if not provided
    effective_client_id = client_id
    if effective_client_id is None and source_entries and ProjectDao:
        first_project = ProjectDao._getById(source_entries[0].project_id)
        if first_project:
            effective_client_id = first_project.client_id
    
    # Get holidays in target week - check BOTH client-specific AND federal
    # Previously only checked federal (client_id=0), missing client-specific holidays (Ticket #297)
    target_holidays = set()
    target_end = target_start + relativedelta(days=6)
    current_date = target_start
    while current_date <= target_end:
        if HolidayDao and HolidayDao.checkDateIsHoliday(effective_client_id or 0, current_date):
            target_holidays.add(current_date)
        current_date += datetime.timedelta(days=1)
    
    # Copy entries
    created_entries = []
    skipped_entries = []
    
    for entry in source_entries:
        source_date = entry.start_time.date() if hasattr(entry.start_time, 'date') else entry.start_time
        
        # Skip weekends
        if source_date.weekday() >= 5:
            continue
        
        # Calculate day offset from Monday (0-4)
        day_offset = source_date.weekday()
        
        # Calculate target date
        target_date = target_start + datetime.timedelta(days=day_offset)
        
        # Skip if target date is a holiday
        if target_date in target_holidays:
            skipped_entries.append({
                "source_date": source_date.isoformat(),
                "target_date": target_date.isoformat(),
                "reason": "holiday",
                "project_id": entry.project_id,
                "task_id": entry.task_id
            })
            continue
        
        # Calculate time difference to shift the entry
        time_diff = entry.start_time - datetime.datetime.combine(source_date, datetime.time(0, 0))
        
        # Create new entry for target date
        new_start = datetime.datetime.combine(target_date, datetime.time(0, 0)) + time_diff
        new_end = new_start + (entry.end_time - entry.start_time)
        
        # Get next trans_num for the new entry
        next_trans = BillingEventDao.nextTransNum(
            timekeeper_id, entry.project_id, entry.task_id
        )
        
        # Create new billing event
        new_entry = BillingEvent()
        new_entry.uid = str(uuid.uuid4())
        new_entry.timekeeper_id = timekeeper_id
        new_entry.project_id = entry.project_id
        new_entry.task_id = entry.task_id
        new_entry.start_time = new_start
        new_entry.end_time = new_end
        new_entry.trans_num = next_trans
        new_entry.log_message = entry.log_message
        new_entry.active = True
        
        BillingEventDao.save(new_entry)
        
        created_entries.append({
            "uid": new_entry.uid,
            "date": target_date.isoformat(),
            "project_id": entry.project_id,
            "task_id": entry.task_id,
            "start_time": new_start.isoformat(),
            "end_time": new_end.isoformat(),
            "trans_num": next_trans
        })
    
    return {
        "success": True,
        "source_week_start": source_week_start,
        "target_week_start": target_week_start,
        "created_count": len(created_entries),
        "skipped_count": len(skipped_entries),
        "created_entries": created_entries,
        "skipped_entries": skipped_entries
    }


@router.get(
    "/find-source-week",
    response_model=Dict[str, Any],
    dependencies=[Depends(JWTBearer())],
)
def find_source_week(
    timekeeper_id: int = Query(..., description="Timekeeper user ID"),
    target_week_start: str = Query(..., description="Target week start date (YYYY-MM-DD, a Monday)"),
    project_id: int = Query(..., description="Project ID to match"),
    task_id: int = Query(None, description="Optional task ID to further filter"),
    max_weeks_back: int = Query(12, description="Maximum weeks to search back (default 12)")
) -> Dict[str, Any]:
    """Find the most recent week (searching backwards) that has time entries
    matching the given project (and optionally task) for the specified timekeeper.

    This supports the "Copy Last Week's Hours" button on the empty state:
    instead of only checking the immediately previous week, it searches
    backwards up to max_weeks_back weeks to find a week with matching entries.
    """
    import datetime
    from dateutil.relativedelta import relativedelta

    try:
        target_start = datetime.date.fromisoformat(target_week_start)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use ISO format (YYYY-MM-DD)")

    if target_start.weekday() != 0:
        raise HTTPException(status_code=400, detail="target_week_start must be a Monday")

    BillingEventDao = daos.getBillingEventDao()

    # Search backwards week by week
    for week_offset in range(1, max_weeks_back + 1):
        source_start = target_start - relativedelta(weeks=week_offset)
        source_end = source_start + relativedelta(days=6)
        src_start_dt = datetime.datetime.combine(source_start, datetime.time(0, 0))
        src_end_dt = datetime.datetime.combine(source_end, datetime.time(23, 59, 59))

        entries = BillingEventDao.get_by_timekeeper_project_range(
            timekeeper_id,
            project_id=project_id,
            task_id=task_id,
            start_dt=src_start_dt,
            end_dt=src_end_dt
        )

        if entries:
            # Found the most recent week with matching entries
            return {
                "found": True,
                "source_week_start": source_start.isoformat(),
                "entry_count": len(entries),
                "weeks_back": week_offset
            }

    return {
        "found": False,
        "source_week_start": None,
        "entry_count": 0,
        "weeks_back": max_weeks_back
    }
