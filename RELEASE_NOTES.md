# Timesheet Release Notes

## Version 0.3.4 - October 2026

- **Timesheet CLI for Agent Integration**: A new Python CLI tool (`cli/timesheet.py`) lets AI agents — or power users — interact with the timesheet API from the command line. It supports listing clients, projects, tasks, and timekeepers, checking holidays, and creating or managing time entries. A companion `SKILL.md` provides step-by-step workflows so an agent can enter a full week of time on a user's behalf.
- **Time Entry API Improvements**: The time entries list endpoint now supports filtering by timekeeper ID. When creating a new entry without a transaction number, one is auto-assigned; when updating an entry, the existing transaction number is preserved if a new value isn't supplied. This makes bulk entry creation from the CLI and other integrations more reliable.
- **Container Deployment Fixes**: The Docker image now starts correctly thanks to fixes to PYTHONPATH, the uvicorn working directory, and the SQLite connection URL (which must use four slashes for an absolute path). Alembic migrations on container startup now handle pre-existing schemas gracefully.
- **Pre-built Image Documentation**: The README now documents deploying from pre-built `ghcr.io` images, including the critical four-slash caveat for `TIMESHEET_SA_URL` and a full walkthrough in `docs/deploy-podman2024.md`.

## Version 0.3.3 - October 2026

- **Copy Last Week's Hours**: When the Time Entry screen is empty and you have a Client and Project selected, a new purple "Copy Last Week's Hours" button appears. It searches backwards up to 12 weeks for the most recent week with matching entries and copies them into the current week, automatically skipping holidays.
- **Predictive Time Entry Fix**: The copy-week feature in the time entry modal now works for all logged-in users instead of only user ID 1. Timekeeper ID is now pulled from your active session.
- **Admin Backup & Restore**: A new Admin page provides database backup (download a gzipped snapshot) and restore (upload a previous backup) functionality, accessible from the dashboard and profile dropdown.
- **Copy Description to Clipboard**: A copy icon now appears on hover in the Description column of the Time Entry page, letting you quickly copy entry descriptions to your clipboard.
- **Container Database Migrations**: The Docker container now runs Alembic database migrations automatically on startup, ensuring the schema is always up to date on both fresh and existing databases.
- **Improved Navigation**: Admin links have been added to the dashboard, profile dropdown, and inline navigation menus. Reports view navigation has also been improved.

## Version 0.3.2 - April 2026

- **New Report Templates**: You can now create and save customizable report templates. This makes it easier to generate standard reports with consistent settings.
- **Improved Report Management**: The report interface has been updated across both the Web and Flet applications. You can now more easily view and manage your saved report configurations.
- **System Enhancements**: We've updated the underlying database structure and backend services to ensure smoother and more reliable report generation.

## Version 0.3.1 - April 2026

- You can now generate three types of reports: by client, by timekeeper, or by date range, with filtering by project or person.
- Report results can be exported as CSV files for use in spreadsheets or other tools.
- The reports page has been redesigned with clearer dialogs, loading indicators, and feature highlights for each report type.
- Report summaries now show total hours, entries, resources, projects, and clients at a glance.

## Version 0.3.0 - January 2026

- Improved dashboard usability. Clicking can be done anywhere on the activity/task button

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
