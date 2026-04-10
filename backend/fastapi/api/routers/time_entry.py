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
