"""Smart date defaulting for Time Entry (Ticket #56).

Computes the next available work day when the Time Entry modal opens:
- Finds next Mon-Fri
- Skips days with existing entries ending ≥5PM
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
    """
    HolidayDao = daos.getHolidayDao()
    if not HolidayDao:
        return False
    
    # Check client-specific holidays
    if client_id:
        holidays = HolidayDao.getAll(client_id=client_id, year=date.year)
        if any(h.holiday_date == date for h in holidays):
            return True
    
    # Check federal holidays (client_id=0)
    federal_holidays = HolidayDao.getFederalHolidays(year=date.year)
    if any(h.holiday_date == date for h in federal_holidays):
        return True
    
    return False


def has_late_entry(date: datetime.date, timekeeper_id: int, 
                   client_id: Optional[int] = None, 
                   project_id: Optional[int] = None) -> bool:
    """Check if timekeeper has an entry on date ending ≥5PM.
    
    Returns True if there's an existing entry that ends at 5PM or later.
    """
    BillingEventDao = daos.getBillingEventDao()
    
    # Get all entries for the date
    start_dt = datetime.datetime.combine(date, datetime.time(0, 0))
    end_dt = datetime.datetime.combine(date, datetime.time(23, 59, 59))
    
    events = BillingEventDao.get_by_timekeeper_and_range(
        timekeeper_id, start_dt, end_dt
    )
    
    # Check if any entry ends ≥5PM (17:00)
    threshold_time = datetime.time(17, 0)
    for event in events:
        if event.end_time:
            end_time = event.end_time.time() if hasattr(event.end_time, 'time') else event.end_time
            if end_time >= threshold_time:
                return True
    
    return False


def compute_next_available_date(timekeeper_id: int, 
                                 client_id: Optional[int] = None,
                                 project_id: Optional[int] = None,
                                 start_from: Optional[datetime.date] = None) -> Dict[str, Any]:
    """Compute the next available date for time entry.
    
    Algorithm:
    1. Start from given date (or today)
    2. Find next work day (Mon-Fri)
    3. Check if holiday → skip
    4. Check if has late entry (≥5PM) → skip
    5. Return first available date
    
    Returns:
        Dict with computed date and reason
    """
    if start_from is None:
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
    - Finds next Mon-Fri
    - Skips holidays (client-specific or federal)
    - Skips days with entries ending ≥5PM
    
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
    week_start_date: str = Query(..., description="Start date of the week to check (YYYY-MM-DD)")
) -> Dict[str, Any]:
    """Get information about a week's time entries and offer to copy from previous week.
    
    Returns:
        - has_entries: bool - whether the week already has time entries
        - previous_week_entries: list - entries from the previous week (for copy feature)
        - holidays: list - holidays in the target week (to avoid copying to those days)
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
    
    # Get holidays for the target week
    holidays = []
    current_date = week_start
    while current_date <= week_end:
        # Check both client-specific and federal holidays
        federal_check = HolidayDao.checkDateIsHoliday(0, current_date) if HolidayDao else None
        if federal_check:
            holidays.append({
                "date": current_date.isoformat(),
                "name": federal_check.name,
                "is_federal": True
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
    target_week_start: str = Query(..., description="Target week start date (YYYY-MM-DD)")
) -> Dict[str, Any]:
    """Copy time entries from one week to another, skipping holidays.
    
    This implements the "Predictive Time Entry" feature:
    1. When entering data for a new week with no entries
    2. Offer to copy hours from the previous week
    3. Skip any days that might be holidays
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
    
    # Get source week entries
    source_end = source_start + relativedelta(days=6)
    src_start_dt = datetime.datetime.combine(source_start, datetime.time(0, 0))
    src_end_dt = datetime.datetime.combine(source_end, datetime.time(23, 59, 59))
    
    source_entries = BillingEventDao.get_by_timekeeper_and_range(
        timekeeper_id, src_start_dt, src_end_dt
    )
    
    # Get holidays in target week
    target_holidays = set()
    target_end = target_start + relativedelta(days=6)
    current_date = target_start
    while current_date <= target_end:
        if HolidayDao and HolidayDao.checkDateIsHoliday(0, current_date):
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
