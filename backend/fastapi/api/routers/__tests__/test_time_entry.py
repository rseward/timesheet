"""Unit tests for Time Entry smart date defaulting (Ticket #56).

Tests the smart date computation algorithm:
- Work day detection (Mon-Fri)
- Holiday skipping
- Late entry detection (>4:55 PM)
- Next available date computation
"""

import pytest
import datetime
from unittest.mock import Mock, MagicMock, patch
from api.routers.time_entry import (
    is_workday,
    is_holiday,
    has_late_entry,
    compute_next_available_date,
    get_next_available_date,
    get_default_times
)


class TestIsWorkday:
    """Test work day detection (Monday-Friday)."""
    
    def test_monday_is_workday(self):
        # Monday (weekday 0)
        date = datetime.date(2026, 3, 16)  # Monday
        assert is_workday(date) is True
    
    def test_friday_is_workday(self):
        # Friday (weekday 4)
        date = datetime.date(2026, 3, 20)  # Friday
        assert is_workday(date) is True
    
    def test_saturday_not_workday(self):
        # Saturday (weekday 5)
        date = datetime.date(2026, 3, 21)  # Saturday
        assert is_workday(date) is False
    
    def test_sunday_not_workday(self):
        # Sunday (weekday 6)
        date = datetime.date(2026, 3, 22)  # Sunday
        assert is_workday(date) is False
    
    def test_all_weekdays(self):
        """Test all 7 days of the week."""
        # Start from a Monday
        base = datetime.date(2026, 3, 16)
        
        for i in range(7):
            date = base + datetime.timedelta(days=i)
            expected = i < 5  # Mon-Fri are work days
            assert is_workday(date) == expected, f"Day {i} ({date}) failed"


class TestIsHoliday:
    """Test holiday detection."""
    
    def test_no_holiday_dao_returns_false(self):
        """Graceful degradation when HolidayDao not available."""
        with patch('api.routers.time_entry.daos') as mock_daos:
            mock_daos.getHolidayDao.return_value = None
            
            date = datetime.date(2026, 7, 4)  # Independence Day
            result = is_holiday(date, client_id=1)
            
            assert result is False
    
    def test_client_holiday_detected(self):
        """Detect client-specific holiday."""
        with patch('api.routers.time_entry.daos') as mock_daos:
            mock_holiday_dao = Mock()
            mock_daos.getHolidayDao.return_value = mock_holiday_dao
            
            # Mock holiday data
            mock_holiday = Mock()
            mock_holiday.date = datetime.date(2026, 7, 4)
            mock_holiday_dao.get_holidays_for_client.return_value = [mock_holiday]
            
            date = datetime.date(2026, 7, 4)
            result = is_holiday(date, client_id=1)
            
            assert result is True
            mock_holiday_dao.get_holidays_for_client.assert_called_with(1, 2026)
    
    def test_federal_holiday_detected(self):
        """Detect federal holiday (client_id=0)."""
        with patch('api.routers.time_entry.daos') as mock_daos:
            mock_holiday_dao = Mock()
            mock_daos.getHolidayDao.return_value = mock_holiday_dao
            
            # Mock federal holiday
            mock_holiday = Mock()
            mock_holiday.date = datetime.date(2026, 12, 25)  # Christmas
            mock_holiday_dao.get_holidays_for_client.return_value = [mock_holiday]
            
            date = datetime.date(2026, 12, 25)
            result = is_holiday(date, client_id=5)  # Any client
            
            assert result is True
    
    def test_not_a_holiday(self):
        """Regular day is not a holiday."""
        with patch('api.routers.time_entry.daos') as mock_daos:
            mock_holiday_dao = Mock()
            mock_daos.getHolidayDao.return_value = mock_holiday_dao
            
            # No holidays in March
            mock_holiday_dao.get_holidays_for_client.return_value = []
            
            date = datetime.date(2026, 3, 17)
            result = is_holiday(date, client_id=1)
            
            assert result is False


class TestHasLateEntry:
    """Test late entry detection (entries ending >4:55 PM)."""
    
    def test_no_billing_event_dao_returns_false(self):
        """Graceful degradation when BillingEventDao not available."""
        with patch('api.routers.time_entry.daos') as mock_daos:
            mock_daos.getBillingEventDao.return_value = None
            
            date = datetime.date(2026, 3, 17)
            result = has_late_entry(date, timekeeper_id=1)
            
            assert result is False
    
    def test_no_entries_returns_false(self):
        """No entries on date means no late entry."""
        with patch('api.routers.time_entry.daos') as mock_daos:
            mock_event_dao = Mock()
            mock_daos.getBillingEventDao.return_value = mock_event_dao
            
            mock_event_dao.get_by_timekeeper_and_range.return_value = []
            
            date = datetime.date(2026, 3, 17)
            result = has_late_entry(date, timekeeper_id=1)
            
            assert result is False
    
    def test_early_entry_returns_false(self):
        """Entry ending at or before 4:55 PM is not late."""
        with patch('api.routers.time_entry.daos') as mock_daos:
            mock_event_dao = Mock()
            mock_daos.getBillingEventDao.return_value = mock_event_dao

            # Mock entry ending at 4:55 PM (exactly at threshold)
            mock_entry = Mock()
            mock_entry.end_time = datetime.datetime(2026, 3, 17, 16, 55)
            mock_event_dao.get_by_timekeeper_and_range.return_value = [mock_entry]

            date = datetime.date(2026, 3, 17)
            result = has_late_entry(date, timekeeper_id=1)

            assert result is False
    
    def test_late_entry_returns_true(self):
        """Entry ending after 4:55 PM is late."""
        with patch('api.routers.time_entry.daos') as mock_daos:
            mock_event_dao = Mock()
            mock_daos.getBillingEventDao.return_value = mock_event_dao

            # Mock entry ending at 4:56 PM (one minute after threshold)
            mock_entry = Mock()
            mock_entry.end_time = datetime.datetime(2026, 3, 17, 16, 56)
            mock_event_dao.get_by_timekeeper_and_range.return_value = [mock_entry]

            date = datetime.date(2026, 3, 17)
            result = has_late_entry(date, timekeeper_id=1)

            assert result is True
    
    def test_late_entry_after_5pm_returns_true(self):
        """Entry ending after 5PM is late."""
        with patch('api.routers.time_entry.daos') as mock_daos:
            mock_event_dao = Mock()
            mock_daos.getBillingEventDao.return_value = mock_event_dao
            
            # Mock entry ending at 6:30 PM
            mock_entry = Mock()
            mock_entry.end_time = datetime.datetime(2026, 3, 17, 18, 30)
            mock_event_dao.get_by_timekeeper_and_range.return_value = [mock_entry]
            
            date = datetime.date(2026, 3, 17)
            result = has_late_entry(date, timekeeper_id=1)
            
            assert result is True
    
    def test_multiple_entries_one_late(self):
        """Multiple entries, one is late."""
        with patch('api.routers.time_entry.daos') as mock_daos:
            mock_event_dao = Mock()
            mock_daos.getBillingEventDao.return_value = mock_event_dao
            
            # Mock entries: one early, one late
            mock_entry_early = Mock()
            mock_entry_early.end_time = datetime.datetime(2026, 3, 17, 14, 0)
            
            mock_entry_late = Mock()
            mock_entry_late.end_time = datetime.datetime(2026, 3, 17, 17, 30)
            
            mock_event_dao.get_by_timekeeper_and_range.return_value = [
                mock_entry_early, mock_entry_late
            ]
            
            date = datetime.date(2026, 3, 17)
            result = has_late_entry(date, timekeeper_id=1)
            
            assert result is True


class TestComputeNextAvailableDate:
    """Test the main smart date computation algorithm."""
    
    def test_today_is_available(self):
        """Today is available (work day, no holidays, no late entries)."""
        with patch('api.routers.time_entry.is_holiday', return_value=False):
            with patch('api.routers.time_entry.has_late_entry', return_value=False):
                result = compute_next_available_date(
                    timekeeper_id=1,
                    start_from=datetime.date(2026, 3, 16)  # Monday
                )
                
                assert result['date'] == '2026-03-16'
                assert result['reason'] == 'next_available_workday'
                assert result['iterations'] == 1
    
    def test_skip_weekend(self):
        """Skip Saturday and Sunday."""
        with patch('api.routers.time_entry.is_holiday', return_value=False):
            with patch('api.routers.time_entry.has_late_entry', return_value=False):
                # Start from Saturday
                result = compute_next_available_date(
                    timekeeper_id=1,
                    start_from=datetime.date(2026, 3, 21)  # Saturday
                )
                
                assert result['date'] == '2026-03-23'  # Monday
                assert result['iterations'] == 2  # Sat, Sun skipped
    
    def test_skip_holiday(self):
        """Skip holiday."""
        with patch('api.routers.time_entry.is_holiday', side_effect=[True, False]):
            with patch('api.routers.time_entry.has_late_entry', return_value=False):
                result = compute_next_available_date(
                    timekeeper_id=1,
                    start_from=datetime.date(2026, 7, 4)  # Holiday
                )
                
                assert result['date'] == '2026-07-06'  # Monday after holiday
                assert result['iterations'] == 2  # Holiday + weekend
    
    def test_skip_late_entry_day(self):
        """Skip day with late entry."""
        with patch('api.routers.time_entry.is_holiday', return_value=False):
            with patch('api.routers.time_entry.has_late_entry', side_effect=[True, False]):
                result = compute_next_available_date(
                    timekeeper_id=1,
                    start_from=datetime.date(2026, 3, 16)
                )
                
                assert result['date'] == '2026-03-17'
                assert result['iterations'] == 2  # First day had late entry
    
    def test_complex_scenario(self):
        """Complex scenario: holiday + weekend + late entry."""
        # Scenario: Start Friday, next Monday is holiday, Tuesday has late entry
        with patch('api.routers.time_entry.is_holiday', side_effect=[False, True, False, False]):
            with patch('api.routers.time_entry.has_late_entry', side_effect=[False, False, True, False]):
                result = compute_next_available_date(
                    timekeeper_id=1,
                    start_from=datetime.date(2026, 3, 13)  # Friday
                )
                
                # Friday: OK but let's say we want next
                # Saturday: skip (weekend)
                # Sunday: skip (weekend)
                # Monday: holiday
                # Tuesday: late entry
                # Wednesday: available!
                assert result['date'] == '2026-03-18'  # Wednesday
                assert result['iterations'] >= 3
    
    def test_max_iterations_safety(self):
        """Safety limit prevents infinite loop."""
        with patch('api.routers.time_entry.is_workday', return_value=False):
            # Force all days to be non-workdays (shouldn't happen)
            result = compute_next_available_date(
                timekeeper_id=1,
                start_from=datetime.date(2026, 3, 16)
            )
            
            assert result['iterations'] <= 365
            assert 'reason' in result
    
    def test_default_start_from_today(self):
        """Default start_from is today."""
        today = datetime.date.today()
        
        with patch('api.routers.time_entry.is_holiday', return_value=False):
            with patch('api.routers.time_entry.has_late_entry', return_value=False):
                result = compute_next_available_date(timekeeper_id=1)
                
                # Should start from today
                assert result['checked_from'] == today.isoformat()


class TestGetNextAvailableDate:
    """Test the FastAPI endpoint."""
    
    def test_valid_request(self):
        """Valid request returns computed date."""
        with patch('api.routers.time_entry.compute_next_available_date') as mock_compute:
            mock_compute.return_value = {
                'date': '2026-03-18',
                'reason': 'next_available_workday',
                'iterations': 1
            }
            
            result = get_next_available_date(
                timekeeper_id=1,
                client_id=5,
                project_id=10
            )
            
            assert result['date'] == '2026-03-18'
            mock_compute.assert_called_once()
    
    def test_invalid_date_format(self):
        """Invalid date format raises HTTPException."""
        with pytest.raises(Exception) as exc_info:
            get_next_available_date(
                timekeeper_id=1,
                start_from="not-a-date"
            )
        
        assert "Invalid date format" in str(exc_info.value)


class TestGetDefaultTimes:
    """Test default times endpoint."""
    
    def test_preferences_available(self):
        """Return user preferences when available."""
        with patch('api.routers.time_entry.daos') as mock_daos:
            mock_prefs_dao = Mock()
            mock_daos.getPreferencesDao.return_value = mock_prefs_dao
            
            mock_prefs = Mock()
            mock_prefs.default_start_time = "08:30"
            mock_prefs.default_end_time = "16:30"
            mock_prefs_dao.get_by_timekeeper.return_value = mock_prefs
            
            result = get_default_times(timekeeper_id=1)
            
            assert result == {
                'start_time': '08:30',
                'end_time': '16:30'
            }
    
    def test_preferences_not_available_fallback(self):
        """Fallback to 9AM-5PM when preferences not available."""
        with patch('api.routers.time_entry.daos') as mock_daos:
            mock_daos.getPreferencesDao.return_value = None
            
            result = get_default_times(timekeeper_id=1)
            
            assert result == {
                'start_time': '09:00',
                'end_time': '17:00'
            }
    
    def test_preferences_partial(self):
        """Partial preferences use fallback for missing values."""
        with patch('api.routers.time_entry.daos') as mock_daos:
            mock_prefs_dao = Mock()
            mock_daos.getPreferencesDao.return_value = mock_prefs_dao
            
            mock_prefs = Mock()
            mock_prefs.default_start_time = None  # Not set
            mock_prefs.default_end_time = "16:00"
            mock_prefs_dao.get_by_timekeeper.return_value = mock_prefs
            
            result = get_default_times(timekeeper_id=1)
            
            assert result == {
                'start_time': '09:00',  # Fallback
                'end_time': '16:00'
            }


class TestIntegration:
    """Integration tests with mocked DAOs."""
    
    def test_full_algorithm_with_mocks(self):
        """Test complete algorithm with all dependencies mocked."""
        with patch('api.routers.time_entry.daos') as mock_daos:
            # Setup mocks
            mock_holiday_dao = Mock()
            mock_event_dao = Mock()
            mock_daos.getHolidayDao.return_value = mock_holiday_dao
            mock_daos.getBillingEventDao.return_value = mock_event_dao
            
            # No holidays
            mock_holiday_dao.get_holidays_for_client.return_value = []
            
            # No late entries
            mock_event_dao.get_by_timekeeper_and_range.return_value = []
            
            # Test: Monday should be available
            result = compute_next_available_date(
                timekeeper_id=1,
                client_id=5,
                start_from=datetime.date(2026, 3, 16)  # Monday
            )
            
            assert result['date'] == '2026-03-16'
            assert result['reason'] == 'next_available_workday'
