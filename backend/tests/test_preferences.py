#!/usr/bin/env python

"""
Simple test script for the preferences API.
This tests the complete flow without authentication for now.
"""

import sys
import os

# Add the src directory to Python path (go up one level from tests to backend, then to src)
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

# Set environment variable for database (go up one level from tests to backend)
os.environ['TIMESHEET_SQLITE'] = os.path.join(os.path.dirname(__file__), '..', 'timesheet.sqlite')
os.environ['TIMESHEET_SA_URL'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), '..', 'timesheet.sqlite')}"

from bluestone.timesheet.data.daos import getDaoFactory

def test_preferences_dao():
    """Test the UserPreferenceDao directly"""
    print("Testing UserPreferenceDao...")
    
    # Get DAO factory
    daos = getDaoFactory()
    pref_dao = daos.getUserPreferenceDao()
    user_dao = daos.getUserDao()
    
    # Check if we have any users, if not create a test user
    users = user_dao.getAll()
    if not users:
        print("No users found, creating test user...")
        from bluestone.timesheet.data.models import User
        test_user = User()
        test_user.email = "test@example.com"
        test_user.name = "Test User"
        test_user.password = "password123"  # In real app this would be hashed
        test_user.active = True
        
        user_dao.save(test_user)
        user_dao.commit()
        print(f"Created test user with ID: {test_user.user_id}")
        test_user_id = test_user.user_id
    else:
        test_user_id = users[0].user_id
        print(f"Using existing user with ID: {test_user_id}")
    
    # Test setting preferences
    print("\n1. Setting start_time preference...")
    start_pref = pref_dao.setPreference(test_user_id, "start_time", "09:00")
    pref_dao.commit()
    print(f"Set start_time: {start_pref.preference_key} = {start_pref.preference_value}")
    
    print("\n2. Setting end_time preference...")
    end_pref = pref_dao.setPreference(test_user_id, "end_time", "17:00")
    pref_dao.commit()
    print(f"Set end_time: {end_pref.preference_key} = {end_pref.preference_value}")
    
    # Test getting all preferences
    print("\n3. Getting all preferences for user...")
    all_prefs = pref_dao.getByUserId(test_user_id)
    for pref in all_prefs:
        print(f"  {pref.preference_key}: {pref.preference_value}")
    
    # Test getting specific preference
    print("\n4. Getting specific preference...")
    start_time_pref = pref_dao.getByUserIdAndKey(test_user_id, "start_time")
    if start_time_pref:
        print(f"Found start_time: {start_time_pref.preference_value}")
    else:
        print("start_time preference not found")
    
    # Test updating existing preference
    print("\n5. Updating start_time preference...")
    updated_pref = pref_dao.setPreference(test_user_id, "start_time", "08:30")
    pref_dao.commit()
    print(f"Updated start_time to: {updated_pref.preference_value}")
    
    # Test JSON conversion
    print("\n6. Testing JSON conversion...")
    json_pref = pref_dao.toJson(updated_pref)
    print(f"JSON: user_id={json_pref.user_id}, key={json_pref.preference_key}, value={json_pref.preference_value}")
    
    print("\nPreferences DAO test completed successfully!")
    return test_user_id

def test_preferences_with_defaults():
    """Test the default values functionality"""
    print("\nTesting preferences with defaults...")
    
    daos = getDaoFactory()
    pref_dao = daos.getUserPreferenceDao()
    
    # Use a new user ID that doesn't exist
    non_existent_user_id = 999
    
    # Get preferences for non-existent user
    prefs = pref_dao.getByUserId(non_existent_user_id)
    print(f"Preferences for non-existent user: {len(prefs)} found")
    
    # Convert to dictionary like the API does
    pref_dict = {}
    for pref in prefs:
        pref_dict[pref.preference_key] = pref.preference_value
    
    # Apply defaults
    if "start_time" not in pref_dict:
        pref_dict["start_time"] = "09:00"
    if "end_time" not in pref_dict:
        pref_dict["end_time"] = "17:00"
    
    print(f"Preferences with defaults: {pref_dict}")

if __name__ == "__main__":
    try:
        test_user_id = test_preferences_dao()
        test_preferences_with_defaults()
        print("\nAll tests passed! ✅")
    except Exception as e:
        print(f"Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)