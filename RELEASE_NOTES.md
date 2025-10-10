# Timesheet Release Notes

## Version 0.2.0 - October 2025

### New Features
- **User Preferences System**: Store and manage personal work hour preferences (start_time, end_time)
- **Preferences UI**: New preferences page accessible from user profile with time input controls  
- **Total Hours Display**: Automatic calculation and display of total hours for current date range in hours view
- **Smart Hour Entry Defaults**: New hour entries auto-populate with user's preferred start/end times instead of fixed values

### Improvements
- **Enhanced Form Behavior**: Hour entry dialog now closes automatically after save and refreshes the hours list
- **Better Time Calculations**: Fixed hours calculation to handle overnight work and multi-day spans correctly
- **Robust Error Handling**: Graceful fallbacks when preferences unavailable, improved validation for time inputs

### Technical Enhancements
- **Database Schema**: New `user_preferences` table with Alembic migration support
- **API Endpoints**: Complete preferences REST API with bulk operations and default value handling
- **Frontend Integration**: Full preferences service integration in Flet UI with proper authentication checks

### Bug Fixes
- **Initialization Order**: Fixed Flet startup crash when accessing uninitialized attributes
- **Form Refresh**: Resolved issue where hours list wouldn't refresh after adding/editing entries
- **Authentication Timing**: Fixed preferences service creation before user session availability

---

## Version 0.1.0 - Initial Release
- Basic timesheet functionality with client, project, task, and billing event management
- FastAPI backend with SQLAlchemy/Alembic database support
- Flet Python GUI frontend with authentication
- Time tracking and reporting capabilities