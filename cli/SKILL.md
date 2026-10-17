---
name: timesheet-cli
description: Use the timesheet CLI to enter and manage time entries on behalf of a user. The CLI mirrors the timesheet API endpoints for clients, projects, tasks, timekeepers, holidays, and time entries.
version: 0.1.0
---

# Timesheet CLI Skill

Use the timesheet CLI (`cli/timesheet.py`) to interact with the timesheet API on behalf of a user. The CLI is a Python Click-based tool that mirrors the timesheet REST API endpoints, allowing an agent to discover clients, projects, tasks, and create time entries.

## Prerequisites

1. **Python 3.10+** with `click` and `requests` installed:
   ```
   pip install -r cli/requirements.txt
   ```

2. **TIMESHEET_API_URL** environment variable set to the running timesheet instance:
   ```
   export TIMESHEET_API_URL=http://timesheet.bluestone-consulting.net
   # or use the direct host:port
   export TIMESHEET_API_URL=http://192.168.1.66:8082
   ```

3. **Login** once to cache the JWT token:
   ```
   python3 cli/timesheet.py login --username rseward@bluestone-consulting.com --password <password>
   ```
   The token is cached to `~/.timesheet-token` and reused for all subsequent commands.
   **Token lifetime**: The JWT expires approximately 30 minutes after login. If the token
   expires, the CLI will print "Token expired or invalid" and clear the token file. The
   user must run `login` again (the agent cannot do this -- it requires the user's password).
   Plan batch operations to complete within the token window, or ask the user to re-login
   if you encounter a 401 mid-task.

## CLI Command Reference

### Auth
| Command | Description |
|---------|-------------|
| `timesheet login -u <email> -p <password>` | Login and cache JWT token |
| `timesheet logout` | Logout and clear cached token |
| `timesheet whoami` | Show current user info |
| `timesheet health` | Check API health (no auth required) |

### Clients
| Command | Description |
|---------|-------------|
| `timesheet clients list` | List all active clients |
| `timesheet clients list --all` | Include inactive clients |
| `timesheet clients get <client_id>` | Get a specific client |

### Projects
| Command | Description |
|---------|-------------|
| `timesheet projects list` | List all active projects |
| `timesheet projects list -c <client_id>` | Filter by client |
| `timesheet projects get <project_id>` | Get a specific project |

### Tasks
| Command | Description |
|---------|-------------|
| `timesheet tasks list` | List all active tasks |
| `timesheet tasks list -p <project_id>` | Filter by project |
| `timesheet tasks list -c <client_id>` | Filter by client |
| `timesheet tasks get <task_id>` | Get a specific task |

### Timekeepers
| Command | Description |
|---------|-------------|
| `timesheet timekeepers list` | List all timekeepers |
| `timesheet timekeepers get <timekeeper_id>` | Get a specific timekeeper |

### Holidays
| Command | Description |
|---------|-------------|
| `timesheet holidays check -c <client_id> -d <YYYY-MM-DD>` | Check if a date is a holiday |
| `timesheet holidays federal` | List all federal holidays |
| `timesheet holidays client <client_id>` | List holidays for a client |

### Time Entries (Billing Events)
| Command | Description |
|---------|-------------|
| `timesheet entries list` | List time entries (supports `-c`, `-p`, `-s`, `-e`, `-t`, `--all`, `-f` filters) |
| `timesheet entries list -f table` | List entries in a human-readable table with hours and totals |
| `timesheet entries list -f summary` | List entries in a compact summary format |
| `timesheet entries get <uid>` | Get a specific entry |
| `timesheet entries create -p <project_id> -k <task_id> -t <timekeeper_id> -s <start> -e <end> -m <description>` | Create a new entry |
| `timesheet entries update --uid <uid> [options]` | Update an existing entry (supports `--trans-num`) |
| `timesheet entries delete <uid>` | Delete (deactivate) an entry |
| `timesheet entries next-trans-num <timekeeper_id> <project_id> <task_id>` | Get next transaction number |

### Time Entry Helpers
| Command | Description |
|---------|-------------|
| `timesheet time-entry next-date -t <timekeeper_id> [-c <client_id>] [-p <project_id>]` | Compute next available work date |
| `timesheet time-entry default-times -t <timekeeper_id>` | Get default start/end work times |
| `timesheet time-entry week-info -t <timekeeper_id> -w <YYYY-MM-DD>` | Check if a week has entries, get previous week data |
| `timesheet time-entry copy-week -t <timekeeper_id> -s <source_monday> -w <target_monday>` | Copy entries between weeks (skips holidays) |
| `timesheet time-entry find-source-week -t <timekeeper_id> -w <target_monday> -p <project_id> [-k <task_id>]` | Find most recent week with matching entries |
| `timesheet time-entry create-week -t <tk_id> -p <project_id> -k <task_id> -w <monday> -s HH:MM -e HH:MM -m "desc" [--lunch-breaks JSON] [--holidays -c <client_id>]` | Create a full week of entries with optional lunch breaks and holiday skipping |

## Agent Workflow: "Enter my time for Client, Project for the week"

When a user asks you to enter time for a client and project, follow this workflow:

### Step 1: Discover IDs

If the user names a client (e.g. "Bluestone Consulting"), find the client ID:
```
timesheet clients list
```
Match the client by name in the `organisation` field. Note the `client_id`.

Then find the project ID:
```
timesheet projects list -c <client_id>
```
Match the project by name in the `title` field. Note the `project_id`.

Then find available tasks:
```
timesheet tasks list -p <project_id>
```
This shows all tasks for that project. Ask the user which task(s) they performed and how many hours per day.

### Step 2: Determine the Timekeeper ID

Get the user's timekeeper ID from the whoami command:
```
timesheet whoami
```
The response includes the `user_id`. The timekeeper ID may be the same as the user ID, or you can look it up:
```
timesheet timekeepers list
```
Match by name or email. Note the `timekeeper_id`.

### Step 3: Determine Default Times

Get the user's preferred working hours:
```
timesheet time-entry default-times -t <timekeeper_id>
```
This returns `{"start_time": "09:00", "end_time": "17:00"}` (or whatever the user has configured).

### Step 4: Check for Holidays

For each day of the target week, check if it's a holiday:
```
timesheet holidays check -c <client_id> -d 2026-10-13
```
Skip holidays when creating entries. Also skip weekends (Saturday/Sunday) by default unless the user specifies otherwise.

### Step 5: Get the Next Transaction Number (optional)

The `entries create` command automatically fetches the next transaction number
if `--trans-num` is omitted. You only need to call `next-trans-num` explicitly
if you want to see the number before creating the entry:

```
timesheet entries next-trans-num <timekeeper_id> <project_id> <task_id>
```

### Step 6: Create Time Entries

For each work day, create an entry:
```
timesheet entries create \
  -p <project_id> \
  -k <task_id> \
  -t <timekeeper_id> \
  -s "2026-10-13T09:00:00" \
  -e "2026-10-13T17:00:00" \
  -m "Worked on project setup and client meeting"
```

The `start_time` and `end_time` format is `YYYY-MM-DDTHH:MM:SS` (ISO 8601 without timezone).

If the user worked different hours on different days, create separate entries for each day with the appropriate times and descriptions.

### Step 7: Verify

List the entries you just created in table format for easy verification:
```
timesheet entries list -p <project_id> -s 2026-10-13 -e 2026-10-17 -f table
```

Confirm the entries match what the user requested.

## Preferred Workflow: create-week (batch entry)

For creating a full week of entries at once, use the `create-week` command
instead of creating entries one by one. This is faster, handles trans_num
auto-assignment, and supports lunch breaks and holiday skipping.

### Simple week (no lunch breaks)
```
timesheet time-entry create-week \
  -t <timekeeper_id> \
  -p <project_id> \
  -k <task_id> \
  -w 2026-10-12 \
  -s 09:00 -e 17:00 \
  -m "Resolve Production Ingestion Issues"
```

### Week with lunch breaks (Tue/Wed Lansing days)
```
timesheet time-entry create-week \
  -t <timekeeper_id> \
  -p <project_id> \
  -k <task_id> \
  -w 2026-10-12 \
  -s 09:00 -e 17:00 \
  -m "Resolve Production Ingestion Issues" \
  --lunch-breaks '{"tue":{"start":"11:30","end":"12:30"},"wed":{"start":"12:00","end":"13:00"}}'
```

When lunch breaks are provided, the day is split into two entries (AM/PM)
with a gap, and the PM end time is extended by the lunch duration to
maintain the same total billable hours (e.g. 1h lunch = work until 6 PM).

### Week with holiday skipping
```
timesheet time-entry create-week \
  -t <timekeeper_id> \
  -p <project_id> \
  -k <task_id> \
  -w 2026-10-12 \
  -s 09:00 -e 17:00 \
  -m "Resolve Production Ingestion Issues" \
  --holidays -c <client_id>
```

The output includes a summary with created_count, total_hours, and the
details of each entry. Verify with `entries list -f table` afterwards.

## Alternative: Copy Week

If the user says "copy last week's hours" for a project, use the copy-week flow:

1. Find the current week's Monday date.
2. Search backwards for a source week:
   ```
   timesheet time-entry find-source-week -t <timekeeper_id> -w <this_monday> -p <project_id> [-k <task_id>]
   ```
3. If found, copy the entries:
   ```
   timesheet time-entry copy-week -t <timekeeper_id> -s <source_monday> -w <this_monday>
   ```
4. Verify with `timesheet entries list`.

## Output Format

All commands output JSON to stdout. Errors go to stderr with a non-zero exit code. Parse the JSON output to extract IDs and data needed for subsequent commands.

## Pitfalls

- **Token expiration**: The JWT expires approximately 30 minutes after login. If you get "Token expired or invalid", ask the user to run `timesheet login` again. The token file (`~/.timesheet-token`) is automatically cleared on 401 errors. Plan batch operations to complete within the token window.
- **Date format**: All dates use ISO 8601 (`YYYY-MM-DD` or `YYYY-MM-DDTHH:MM:SS`). Week start dates must be Mondays.
- **Timekeeper ID vs User ID**: These may differ. Always check `timekeepers list` if unsure.
- **Weekend entries**: The copy-week feature skips weekends automatically. For manual entry, the agent should ask the user if they want weekend entries or skip them.
- **Holiday skipping**: Always check holidays for the target week before creating entries. The `holidays check` command takes a client_id and date. The `create-week` command supports `--holidays -c <client_id>` to skip holidays automatically.
- **trans_num required by API**: The DB column `trans_num` is NOT NULL. The CLI auto-fetches the next available trans_num via the `/api/events/nextid/` endpoint when `--trans-num` is not provided on both `create` and `update`. The server-side `event_add` and `event_update` endpoints also auto-assign/preserve trans_num (after the server rebuild). If you pass `--trans-num` explicitly, ensure it's the correct next number to avoid conflicts.
- **Rob's lunch pattern**: Rob works 8 billable hours every day. On Tuesdays and Wednesdays (Lansing days) he takes a non-billable lunch break. Always ask for the lunch start/end times on those days, then split the day into two entries with a gap, extending the end time to compensate (e.g. 1h lunch = work until 6 PM instead of 5 PM). Other weekdays are typically a single 09:00-17:00 entry. Use `create-week --lunch-breaks` to handle this automatically.
- **TIMESHEET_API_URL not set**: The CLI will exit with an error if the env var is missing. Set it in the shell profile or export it before running commands.