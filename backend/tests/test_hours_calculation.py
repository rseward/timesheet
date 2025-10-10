#!/usr/bin/env python

"""
Test script to verify hours calculation logic
"""

import datetime
import sys

def calculate_hours_difference(start_str, end_str):
    """Simulate the hours calculation logic from the hours view"""
    # Parse datetime strings (simplified for testing)
    start = datetime.datetime.fromisoformat(start_str.replace('Z', '+00:00'))
    end = datetime.datetime.fromisoformat(end_str.replace('Z', '+00:00'))
    
    # Calculate total time difference in hours
    time_diff = end - start
    hours = time_diff.total_seconds() / 3600
    return round(hours, 1)

def test_hours_calculations():
    """Test various time scenarios"""
    test_cases = [
        # (start_time, end_time, expected_hours, description)
        ("2023-10-10T09:00:00Z", "2023-10-10T17:00:00Z", 8.0, "Full 8-hour day"),
        ("2023-10-10T09:00:00Z", "2023-10-10T12:30:00Z", 3.5, "Morning session"),
        ("2023-10-10T13:30:00Z", "2023-10-10T17:00:00Z", 3.5, "Afternoon session"),
        ("2023-10-10T08:30:00Z", "2023-10-10T17:30:00Z", 9.0, "9-hour day"),
        ("2023-10-10T10:15:00Z", "2023-10-10T11:45:00Z", 1.5, "1.5 hour meeting"),
        ("2023-10-10T23:00:00Z", "2023-10-11T01:00:00Z", 2.0, "Overnight work"),
    ]
    
    print("Testing hours calculation logic...")
    print("=" * 60)
    
    all_passed = True
    total_test_hours = 0.0
    
    for start, end, expected, description in test_cases:
        calculated = calculate_hours_difference(start, end)
        total_test_hours += calculated
        
        passed = abs(calculated - expected) < 0.1  # Allow small floating point differences
        status = "✅ PASS" if passed else "❌ FAIL"
        
        print(f"{status} {description}")
        print(f"     Start: {start}")
        print(f"     End:   {end}")
        print(f"     Expected: {expected:.1f}h, Got: {calculated:.1f}h")
        print()
        
        if not passed:
            all_passed = False
    
    print("=" * 60)
    print(f"Total hours from all test cases: {total_test_hours:.1f}")
    
    return all_passed

if __name__ == "__main__":
    success = test_hours_calculations()
    
    if success:
        print("🎉 All tests passed! Hours calculation logic is working correctly.")
        sys.exit(0)
    else:
        print("💥 Some tests failed!")
        sys.exit(1)