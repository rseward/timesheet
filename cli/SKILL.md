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
   The token is cached to `~/.timesheet-token` and reused for all subsequent commands. If the token expires, the CLI will print an error telling you to login again.

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
| `timesheet entries list` | List time entries (supports `-c`, `-p`, `-s`, `-e`, `-t` filters) |
| `timesheet entries get <uid>` | Get a specific entry |
| `timesheet entries create -p <project_id> -k <task_id> -t <timekeeper_id> -s <start> -e <end> -m <description>` | Create a new entry |
| `timesheet entries update --uid <uid> [options]` | Update an existing entry |
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

If the API requires a trans_num:
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

List the entries you just created:
```
timesheet entries list -p <project_id> -s 2026-10-13 -e 2026-10-17
```

Confirm the entries match what the user requested.

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

- **Token expiration**: If you get "Token expired or invalid", run `timesheet login` again. The token file (`~/.timesheet-token`) is automatically cleared on 401 errors.
- **Date format**: All dates use ISO 8601 (`YYYY-MM-DD` or `YYYY-MM-DDTHH:MM:SS`). Week start dates must be Mondays.
- **Timekeeper ID vs User ID**: These may differ. Always check `timekeepers list` if unsure.
- **Weekend entries**: The copy-week feature skips weekends automatically. For manual entry, the agent should ask the user if they want weekend entries or skip them.
- **Holiday skipping**: Always check holidays for the target week before creating entries. The `holidays check` command takes a client_id and date.
- **TIMESHEET_API_URL not set**: The CLI will exit with an error if the env var is missing. Set it in the shell profile or export it before running commands.