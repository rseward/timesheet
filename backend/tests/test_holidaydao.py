#!/usr/bin/env python

"""
Test script for Holiday DAO.
Tests the holiday data access layer following existing project patterns.
"""

import sys
import os
import datetime

# Add src directory to Python path (go up one level from tests to backend, then to src)
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

# Set environment variable for database (go up one level from tests to backend)
os.environ['TIMESHEET_SQLITE'] = os.path.join(os.path.dirname(__file__), '..', 'timesheet.sqlite')
os.environ['TIMESHEET_SA_URL'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), '..', 'timesheet.sqlite')}"

from bluestone.timesheet.data.daos import getDaoFactory
from bluestone.timesheet.data.models import Holiday
from bluestone.timesheet.jsonmodels import HolidayJson


def test_holiday_dao():
    """Test HolidayDao directly"""
    print("Testing HolidayDao...")
    
    # Get DAO factory
    daos = getDaoFactory()
    holiday_dao = daos.getHolidayDao()
    user_dao = daos.getUserDao()
    client_dao = daos.getClientDao()
    
    # Check if we have any clients, if not create a test client
    clients = client_dao.getAll()
    if not clients:
        print("No clients found, creating test client...")
        from bluestone.timesheet.data.models import Client
        test_client = Client()
        test_client.organisation = "Test Client for Holidays"
        test_client.active = True
        client_dao.save(test_client)
        client_dao.commit()
        print(f"Created test client with ID: {test_client.client_id}")
        test_client_id = test_client.client_id
    else:
        test_client_id = clients[0].client_id
        print(f"Using existing client with ID: {test_client_id}")
    
    # Test creating a holiday
    print("\n1. Creating holiday...")
    holiday_json = HolidayJson(
        client_id=test_client_id,
        holiday_date=datetime.date(2025, 12, 25),
        name="Christmas Day",
        description="Christmas Day Holiday",
        is_federal=False,
        active=True
    )
    db_holiday = holiday_dao.toModel(holiday_json)
    holiday_dao.save(db_holiday)
    holiday_dao.commit()
    print(f"Created holiday with ID: {db_holiday.holiday_id}")
    
    # Test getting by ID
    print("\n2. Getting holiday by ID...")
    fetched_holiday = holiday_dao.getById(db_holiday.holiday_id)
    if fetched_holiday:
        print(f"Found holiday: {fetched_holiday.name} on {fetched_holiday.holiday_date}")
    else:
        print("Failed to find holiday by ID")
    
    # Test getting all holidays
    print("\n3. Getting all holidays...")
    all_holidays = holiday_dao.getAll()
    print(f"Found {len(all_holidays)} holidays")
    
    # Test getting federal holidays
    print("\n4. Getting federal holidays...")
    # Create a federal holiday
    federal_json = HolidayJson(
        client_id=0,  # Federal holidays have client_id=0
        holiday_date=datetime.date(2025, 1, 1),
        name="New Year's Day",
        description="Federal Holiday - New Year",
        is_federal=True,
        active=True
    )
    db_federal = holiday_dao.toModel(federal_json)
    holiday_dao.save(db_federal)
    holiday_dao.commit()
    print(f"Created federal holiday with ID: {db_federal.holiday_id}")
    
    federal_holidays = holiday_dao.getFederalHolidays()
    print(f"Found {len(federal_holidays)} federal holidays")
    
    # Test checking if a date is a holiday
    print("\n5. Checking if date is a holiday...")
    holiday_check = holiday_dao.checkDateIsHoliday(test_client_id, datetime.date(2025, 12, 25))
    if holiday_check:
        print(f"Date 2025-12-25 IS a holiday: {holiday_check.name}")
    else:
        print("Date 2025-12-25 is NOT a holiday")
    
    # Test JSON conversion
    print("\n6. Testing JSON conversion...")
    json_data = holiday_dao.toJson(db_holiday)
    print(f"JSON: holiday_id={json_data.holiday_id}, name={json_data.name}, date={json_data.holiday_date}")
    
    # Test dict conversion
    print("\n7. Testing dict conversion...")
    dict_data = holiday_dao.toDict(db_holiday)
    print(f"Dict: holiday_id={dict_data['holiday_id']}, name={dict_data['name']}, date={dict_data['holiday_date']}")
    
    # Test updating a holiday
    print("\n8. Updating holiday...")
    update_json = HolidayJson(
        holiday_id=db_holiday.holiday_id,
        client_id=test_client_id,
        holiday_date=datetime.date(2025, 12, 25),
        name="Christmas Day (Updated)",
        description="Updated description",
        is_federal=False,
        active=True
    )
    updated_holiday = holiday_dao.update(db_holiday, update_json)
    print(f"Updated holiday name to: {updated_holiday.name}")
    
    # Test soft delete (set active=False)
    print("\n9. Soft deleting holiday...")
    holiday_dao.delete(db_holiday.holiday_id)
    holiday_dao.commit()
    
    deleted_holiday = holiday_dao.getById(db_holiday.holiday_id)
    if deleted_holiday and not deleted_holiday.active:
        print(f"Holiday soft-deleted successfully (active={deleted_holiday.active})")
    else:
        print("Failed to soft delete holiday")
    
    print("\nHoliday DAO test completed successfully!")
    return db_holiday.holiday_id


def test_federal_holiday_with_date_filter():
    """Test getting federal holidays with year filter"""
    print("\nTesting federal holidays with year filter...")
    
    daos = getDaoFactory()
    holiday_dao = daos.getHolidayDao()
    
    # Create federal holidays for different years
    for year in [2024, 2025, 2026]:
        federal_json = HolidayJson(
            client_id=0,
            holiday_date=datetime.date(year, 7, 4),
            name=f"Independence Day {year}",
            description=f"Federal Holiday - Independence Day",
            is_federal=True,
            active=True
        )
        db_federal = holiday_dao.toModel(federal_json)
        holiday_dao.save(db_federal)
        holiday_dao.commit()
        print(f"Created federal holiday for {year} with ID: {db_federal.holiday_id}")
    
    # Get holidays for specific year
    print(f"\nGetting federal holidays for 2025...")
    holidays_2025 = holiday_dao.getFederalHolidays(year=2025)
    print(f"Found {len(holidays_2025)} holidays for 2025")
    for holiday in holidays_2025:
        print(f"  - {holiday.name}: {holiday.holiday_date}")


if __name__ == "__main__":
    try:
        holiday_id = test_holiday_dao()
        test_federal_holiday_with_date_filter()
        print("\nAll tests passed! ✅")
    except Exception as e:
        print(f"Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
