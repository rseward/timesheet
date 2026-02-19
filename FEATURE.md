This file lists features for the current release. If the feature section contains empty square brackets. The feature is still pending implementation.
Otherwise assume it is complete.

# [x] Holiday feature.

Add a holiday feature. Support the configuration of client specific holidays for each calendar year.

This same holiday table should allow Federal Holidays to be entered as well. The federal holidays will be stored as client_id=0

To implement this feature follow all the existing patterns for the project's code base.

## Holiday entry

On the client edit window, provide a button to navigate to the holiday entry screen.

The holiday entry screen will behave and look like other entry screens. E.g. time entries.

On the dashboard page, create an Admin navigation area like the "Clients - Manage your clients" nav area.

The Admin screen will provide a link to Manage Federal Holidays. Holidays entered on this page will be applied to client_id=0 e.g. federal holidays.

## Time Entry

Disable the entry of hours on a Federal or Client Holiday. When the user attempts to use a holiday date display a message stating the Day is a holiday
for the specific client or indicate it is a Federal Holiday if that is the case.

# [x] User Dashboard Useability Change

On the vue.js "web" user dashboard frontend, many options are presented to the user to perform tasks such as:
  - View all clients
  - View all projects
  - View reports
  - View all tasks
  - Track Time

Currently the app only brings the user to the activity when the text of the link is clicked. E.g. "Track time"

This should be changed such that clicking any where in the box describing the task is clickable.
E.g. the icon representing the task is clickable, the white space of the box describing the task is clickable, the hero text describing the task is clickable and
the text of the task should be all clickable and take the user to the task activity screen.

Please implement this usability improvement.
