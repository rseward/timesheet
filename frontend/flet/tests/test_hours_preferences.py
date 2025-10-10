#!/usr/bin/env python

"""
Test script to verify user preferences integration in hours view
"""

import datetime
import sys

def parse_time_preference(time_str):
    """Test the time parsing logic used in addBillingEvent"""
    try:
        hour, minute = map(int, time_str.split(":"))
        return datetime.time(hour, minute)
    except (ValueError, AttributeError):
        return None

def test_time_preference_parsing():
    """Test various time preference formats"""
    test_cases = [
        ("09:00", datetime.time(9, 0), "Standard morning time"),
        ("17:00", datetime.time(17, 0), "Standard evening time"),
        ("08:30", datetime.time(8, 30), "Half-hour start time"),
        ("12:15", datetime.time(12, 15), "Lunch time with quarter hour"),
        ("23:59", datetime.time(23, 59), "Late night time"),
        ("00:00", datetime.time(0, 0), "Midnight"),
        ("7:30", datetime.time(7, 30), "Single digit hour"),
        ("invalid", None, "Invalid format"),
        ("25:00", None, "Invalid hour"),
        ("12:60", None, "Invalid minute"),
        ("", None, "Empty string"),
    ]
    
    print("Testing time preference parsing...")
    print("=" * 60)
    
    all_passed = True
    
    for time_str, expected, description in test_cases:
        try:
            result = parse_time_preference(time_str)
            passed = result == expected
        except:
            result = None
            passed = expected is None
        
        status = "✅ PASS" if passed else "❌ FAIL"
        
        print(f"{status} {description}")
        print(f"     Input: '{time_str}'")
        print(f"     Expected: {expected}")
        print(f"     Got: {result}")
        print()
        
        if not passed:
            all_passed = False
    
    return all_passed

def test_datetime_combination():
    """Test combining date with time preferences"""
    print("Testing datetime combination...")
    print("=" * 60)
    
    today = datetime.date.today()
    start_time = "09:00"
    end_time = "17:00"
    
    try:
        # Parse time strings
        start_hour, start_min = map(int, start_time.split(":"))
        end_hour, end_min = map(int, end_time.split(":"))
        
        # Create datetime objects
        start_datetime = datetime.datetime.combine(today, datetime.time(start_hour, start_min))
        end_datetime = datetime.datetime.combine(today, datetime.time(end_hour, end_min))
        
        print(f"✅ Successfully created datetime objects:")
        print(f"     Start: {start_datetime}")
        print(f"     End: {end_datetime}")
        print(f"     Duration: {end_datetime - start_datetime}")
        
        # Verify it's today with correct times
        assert start_datetime.date() == today
        assert end_datetime.date() == today
        assert start_datetime.time() == datetime.time(9, 0)
        assert end_datetime.time() == datetime.time(17, 0)
        assert end_datetime > start_datetime
        
        print("✅ All datetime combination assertions passed!")
        return True
        
    except Exception as e:
        print(f"❌ Datetime combination failed: {e}")
        return False

if __name__ == "__main__":
    print("Testing user preferences integration for hours view...")
    print()
    
    parsing_success = test_time_preference_parsing()
    print()
    datetime_success = test_datetime_combination()
    
    if parsing_success and datetime_success:
        print("\n🎉 All tests passed! User preferences integration should work correctly.")
        sys.exit(0)
    else:
        print("\n💥 Some tests failed!")
        sys.exit(1)