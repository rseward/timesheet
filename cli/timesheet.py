#!/usr/bin/env python3
"""Timesheet CLI client.

A Click-based CLI that mirrors the timesheet API endpoints, allowing
agents (or humans) to query clients, projects, tasks, timekeepers,
holidays, and create/manage time entries.

Configuration:
  TIMESHEET_API_URL  Base URL of the timesheet API (e.g. http://localhost:8082)

Authentication:
  Run `timesheet login --username <user> --password <pass>` once.
  The JWT access token is cached to ~/.timesheet-token and reused
  for subsequent commands.
"""

import json
import os
import sys
from pathlib import Path

import click
import requests

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

TOKEN_FILE = Path.home() / ".timesheet-token"
DEFAULT_TIMEOUT = 30


def get_api_url():
    url = os.environ.get("TIMESHEET_API_URL")
    if not url:
        click.echo("Error: TIMESHEET_API_URL environment variable is not set.", err=True)
        click.echo("Example: export TIMESHEET_API_URL=http://localhost:8082", err=True)
        sys.exit(1)
    return url.rstrip("/")


def get_token():
    if not TOKEN_FILE.exists():
        click.echo("Error: Not logged in. Run 'timesheet login' first.", err=True)
        sys.exit(1)
    token = TOKEN_FILE.read_text().strip()
    if not token:
        click.echo("Error: Token file is empty. Run 'timesheet login' again.", err=True)
        sys.exit(1)
    return token


def save_token(token):
    TOKEN_FILE.write_text(token)
    TOKEN_FILE.chmod(0o600)


def clear_token():
    if TOKEN_FILE.exists():
        TOKEN_FILE.unlink()


# ---------------------------------------------------------------------------
# HTTP helpers
# ---------------------------------------------------------------------------

def _request(method, path, params=None, json_body=None, auth=True, **kwargs):
    """Make an API request and return parsed JSON."""
    url = get_api_url() + path
    headers = {}
    if auth:
        headers["Authorization"] = f"Bearer {get_token()}"

    try:
        resp = requests.request(
            method, url,
            params=params, json=json_body,
            headers=headers,
            timeout=DEFAULT_TIMEOUT,
            **kwargs,
        )
    except requests.ConnectionError:
        click.echo(f"Error: Cannot connect to {url}", err=True)
        sys.exit(1)
    except requests.Timeout:
        click.echo(f"Error: Request timed out ({DEFAULT_TIMEOUT}s)", err=True)
        sys.exit(1)

    if resp.status_code == 401:
        click.echo("Error: Token expired or invalid. Run 'timesheet login' again.", err=True)
        clear_token()
        sys.exit(1)

    if resp.status_code == 403:
        click.echo(f"Error: Forbidden (403). {resp.text}", err=True)
        sys.exit(1)

    if resp.status_code >= 400:
        try:
            detail = resp.json().get("detail", resp.text)
        except Exception:
            detail = resp.text
        click.echo(f"Error ({resp.status_code}): {detail}", err=True)
        sys.exit(1)

    if resp.status_code == 204 or not resp.text:
        return None

    return resp.json()


def _print_json(data):
    """Pretty-print JSON to stdout."""
    click.echo(json.dumps(data, indent=2, default=str))


# ---------------------------------------------------------------------------
# CLI groups
# ---------------------------------------------------------------------------

@click.group()
@click.version_option(version="0.1.0")
def cli():
    """Timesheet CLI - manage time entries via the timesheet API."""
    pass


# --- Auth ------------------------------------------------------------------

@cli.command()
@click.option("--username", "-u", prompt=True, help="Username (email)")
@click.option("--password", "-p", prompt=True, hide_input=True, help="Password")
def login(username, password):
    """Login and cache the JWT token."""
    url = get_api_url() + "/api/login"
    try:
        resp = requests.get(url, params={"username": username, "password": password}, timeout=DEFAULT_TIMEOUT)
    except requests.ConnectionError:
        click.echo(f"Error: Cannot connect to {url}", err=True)
        sys.exit(1)

    if resp.status_code != 200:
        try:
            detail = resp.json().get("detail", resp.text)
        except Exception:
            detail = resp.text
        click.echo(f"Login failed ({resp.status_code}): {detail}", err=True)
        sys.exit(1)

    data = resp.json()
    token = data.get("access_token")
    if not token:
        click.echo("Login succeeded but no access_token in response.", err=True)
        sys.exit(1)

    save_token(token)
    click.echo("Login successful. Token cached to ~/.timesheet-token")


@cli.command()
def logout():
    """Logout and clear the cached token."""
    try:
        _request("GET", "/api/logout")
    except SystemExit:
        pass
    clear_token()
    click.echo("Logged out. Token cleared.")


@cli.command(name="whoami")
def whoami():
    """Show current user info from the cached token."""
    data = _request("GET", "/api/userinfo")
    _print_json(data)


# --- Clients ---------------------------------------------------------------

@cli.group()
def clients():
    """List and manage clients."""
    pass


@clients.command(name="list")
@click.option("--all", "include_all", is_flag=True, help="Include inactive clients")
def clients_list(include_all):
    """List all clients."""
    params = {}
    if include_all:
        params["active"] = False
    data = _request("GET", "/api/clients/", params=params)
    _print_json(data)


@clients.command(name="get")
@click.argument("client_id", type=int)
def clients_get(client_id):
    """Get a specific client by ID."""
    data = _request("GET", f"/api/clients/{client_id}")
    _print_json(data)


# --- Projects --------------------------------------------------------------

@cli.group()
def projects():
    """List and manage projects."""
    pass


@projects.command(name="list")
@click.option("--client-id", "-c", type=int, help="Filter by client ID")
@click.option("--all", "include_all", is_flag=True, help="Include inactive projects")
def projects_list(client_id, include_all):
    """List all projects, optionally filtered by client."""
    params = {}
    if client_id:
        params["client_id"] = client_id
    if include_all:
        params["active"] = False
    data = _request("GET", "/api/projects/", params=params)
    _print_json(data)


@projects.command(name="get")
@click.argument("project_id", type=int)
def projects_get(project_id):
    """Get a specific project by ID."""
    data = _request("GET", f"/api/projects/{project_id}")
    _print_json(data)


# --- Tasks -----------------------------------------------------------------

@cli.group()
def tasks():
    """List and manage tasks."""
    pass


@tasks.command(name="list")
@click.option("--project-id", "-p", type=int, help="Filter by project ID")
@click.option("--client-id", "-c", type=int, help="Filter by client ID")
@click.option("--all", "include_all", is_flag=True, help="Include inactive tasks")
def tasks_list(project_id, client_id, include_all):
    """List all tasks, optionally filtered by project or client."""
    params = {}
    if project_id:
        params["project_id"] = project_id
    if client_id:
        params["client_id"] = client_id
    if include_all:
        params["active"] = False
    data = _request("GET", "/api/tasks/", params=params)
    _print_json(data)


@tasks.command(name="get")
@click.argument("task_id", type=int)
def tasks_get(task_id):
    """Get a specific task by ID."""
    data = _request("GET", f"/api/tasks/{task_id}")
    _print_json(data)


# --- Timekeepers -----------------------------------------------------------

@cli.group()
def timekeepers():
    """List timekeepers."""
    pass


@timekeepers.command(name="list")
def timekeepers_list():
    """List all timekeepers."""
    data = _request("GET", "/api/timekeepers/")
    _print_json(data)


@timekeepers.command(name="get")
@click.argument("timekeeper_id", type=int)
def timekeepers_get(timekeeper_id):
    """Get a specific timekeeper by ID."""
    data = _request("GET", f"/api/timekeepers/{timekeeper_id}")
    _print_json(data)


# --- Holidays --------------------------------------------------------------

@cli.group()
def holidays():
    """Check holidays."""
    pass


@holidays.command(name="check")
@click.option("--client-id", "-c", type=int, required=True, help="Client ID")
@click.option("--date", "-d", required=True, help="Date to check (YYYY-MM-DD)")
def holidays_check(client_id, date):
    """Check if a specific date is a holiday for a client."""
    data = _request("GET", "/api/holidays/check-date", params={"client_id": client_id, "date": date})
    _print_json(data)


@holidays.command(name="federal")
def holidays_federal():
    """List all federal holidays."""
    data = _request("GET", "/api/holidays/federal")
    _print_json(data)


@holidays.command(name="client")
@click.argument("client_id", type=int)
def holidays_client(client_id):
    """List holidays for a specific client."""
    data = _request("GET", f"/api/holidays/client/{client_id}")
    _print_json(data)


# --- Time Entries (Billing Events) -----------------------------------------

@cli.group()
def entries():
    """List, create, update, and delete time entries."""
    pass


@entries.command(name="list")
@click.option("--client-id", "-c", type=int, help="Filter by client ID")
@click.option("--project-id", "-p", type=int, help="Filter by project ID")
@click.option("--start-date", "-s", help="Start date (YYYY-MM-DD)")
@click.option("--end-date", "-e", help="End date (YYYY-MM-DD)")
@click.option("--timekeeper-id", "-t", type=int, help="Filter by timekeeper ID")
@click.option("--all", "include_all", is_flag=True, help="Include inactive entries")
def entries_list(client_id, project_id, start_date, end_date, timekeeper_id, include_all):
    """List time entries with optional filters."""
    params = {}
    if client_id:
        params["client_id"] = client_id
    if project_id:
        params["project_id"] = project_id
    if start_date:
        params["start_date"] = start_date
    if end_date:
        params["end_date"] = end_date
    if include_all:
        params["active"] = False
    data = _request("GET", "/api/events/", params=params)
    _print_json(data)


@entries.command(name="get")
@click.argument("uid")
def entries_get(uid):
    """Get a specific time entry by UID."""
    data = _request("GET", f"/api/events/{uid}")
    _print_json(data)


@entries.command(name="create")
@click.option("--project-id", "-p", type=int, required=True, help="Project ID")
@click.option("--task-id", "-k", type=int, required=True, help="Task ID")
@click.option("--timekeeper-id", "-t", type=int, required=True, help="Timekeeper ID")
@click.option("--start-time", "-s", required=True, help="Start time (YYYY-MM-DDTHH:MM:SS)")
@click.option("--end-time", "-e", required=True, help="End time (YYYY-MM-DDTHH:MM:SS)")
@click.option("--log-message", "-m", default="", help="Description of work performed")
@click.option("--trans-num", type=int, help="Transaction number (auto-assigned if omitted)")
def entries_create(project_id, task_id, timekeeper_id, start_time, end_time, log_message, trans_num):
    """Create a new time entry."""
    body = {
        "project_id": project_id,
        "task_id": task_id,
        "timekeeper_id": timekeeper_id,
        "start_time": start_time,
        "end_time": end_time,
        "log_message": log_message,
        "active": True,
    }
    if trans_num is not None:
        body["trans_num"] = trans_num
    data = _request("POST", "/api/events/", json_body=body)
    _print_json(data)


@entries.command(name="update")
@click.option("--uid", required=True, help="Entry UID")
@click.option("--project-id", "-p", type=int, help="Project ID")
@click.option("--task-id", "-k", type=int, help="Task ID")
@click.option("--timekeeper-id", "-t", type=int, help="Timekeeper ID")
@click.option("--start-time", "-s", help="Start time (YYYY-MM-DDTHH:MM:SS)")
@click.option("--end-time", "-e", help="End time (YYYY-MM-DDTHH:MM:SS)")
@click.option("--log-message", "-m", help="Description of work performed")
def entries_update(uid, project_id, task_id, timekeeper_id, start_time, end_time, log_message):
    """Update an existing time entry."""
    # Fetch existing entry to merge changes
    existing = _request("GET", f"/api/events/{uid}")
    event = existing.get("event", existing)

    body = {
        "uid": uid,
        "project_id": project_id if project_id is not None else event.get("project_id"),
        "task_id": task_id if task_id is not None else event.get("task_id"),
        "timekeeper_id": timekeeper_id if timekeeper_id is not None else event.get("timekeeper_id"),
        "start_time": start_time if start_time is not None else event.get("start_time"),
        "end_time": end_time if end_time is not None else event.get("end_time"),
        "log_message": log_message if log_message is not None else event.get("log_message", ""),
        "active": event.get("active", True),
    }
    data = _request("PUT", "/api/events/", json_body=body)
    _print_json(data)


@entries.command(name="delete")
@click.argument("uid")
def entries_delete(uid):
    """Delete (deactivate) a time entry."""
    _request("DELETE", f"/api/events/{uid}")
    click.echo(f"Entry {uid} deleted.")


@entries.command(name="next-trans-num")
@click.argument("timekeeper_id", type=int)
@click.argument("project_id", type=int)
@click.argument("task_id", type=int)
def entries_next_trans_num(timekeeper_id, project_id, task_id):
    """Get the next transaction number for a timekeeper/project/task."""
    data = _request("GET", f"/api/events/nextid/{timekeeper_id}/{project_id}/{task_id}")
    _print_json(data)


# --- Time Entry Helpers (smart date, week info, copy week) -----------------

@cli.group(name="time-entry")
def time_entry_group():
    """Smart date defaulting, week info, and copy-week features."""
    pass


@time_entry_group.command(name="next-date")
@click.option("--timekeeper-id", "-t", type=int, required=True, help="Timekeeper ID")
@click.option("--client-id", "-c", type=int, help="Client ID (for holiday checking)")
@click.option("--project-id", "-p", type=int, help="Project ID")
@click.option("--start-from", "-s", help="Start date (YYYY-MM-DD, default: today)")
def time_entry_next_date(timekeeper_id, client_id, project_id, start_from):
    """Compute the next available date for a new time entry."""
    params = {"timekeeper_id": timekeeper_id}
    if client_id:
        params["client_id"] = client_id
    if project_id:
        params["project_id"] = project_id
    if start_from:
        params["start_from"] = start_from
    data = _request("GET", "/api/time-entry/next-date", params=params)
    _print_json(data)


@time_entry_group.command(name="default-times")
@click.option("--timekeeper-id", "-t", type=int, required=True, help="Timekeeper ID")
def time_entry_default_times(timekeeper_id):
    """Get default start/end times for a timekeeper."""
    data = _request("GET", "/api/time-entry/default-times", params={"timekeeper_id": timekeeper_id})
    _print_json(data)


@time_entry_group.command(name="week-info")
@click.option("--timekeeper-id", "-t", type=int, required=True, help="Timekeeper ID")
@click.option("--week-start", "-w", required=True, help="Week start date (YYYY-MM-DD, must be Monday)")
def time_entry_week_info(timekeeper_id, week_start):
    """Get week info: has entries, previous week entries, holidays."""
    data = _request("GET", "/api/time-entry/week-info", params={
        "timekeeper_id": timekeeper_id,
        "week_start_date": week_start,
    })
    _print_json(data)


@time_entry_group.command(name="copy-week")
@click.option("--timekeeper-id", "-t", type=int, required=True, help="Timekeeper ID")
@click.option("--source-week", "-s", required=True, help="Source week start (YYYY-MM-DD, Monday)")
@click.option("--target-week", "-w", required=True, help="Target week start (YYYY-MM-DD, Monday)")
def time_entry_copy_week(timekeeper_id, source_week, target_week):
    """Copy time entries from one week to another, skipping holidays."""
    data = _request("POST", "/api/time-entry/copy-week", params={
        "timekeeper_id": timekeeper_id,
        "source_week_start": source_week,
        "target_week_start": target_week,
    })
    _print_json(data)


@time_entry_group.command(name="find-source-week")
@click.option("--timekeeper-id", "-t", type=int, required=True, help="Timekeeper ID")
@click.option("--target-week", "-w", required=True, help="Target week start (YYYY-MM-DD, Monday)")
@click.option("--project-id", "-p", type=int, required=True, help="Project ID to match")
@click.option("--task-id", "-k", type=int, help="Optional task ID to further filter")
@click.option("--max-weeks-back", type=int, default=12, help="Max weeks to search back (default 12)")
def time_entry_find_source_week(timekeeper_id, target_week, project_id, task_id, max_weeks_back):
    """Find the most recent week with entries matching project/task."""
    params = {
        "timekeeper_id": timekeeper_id,
        "target_week_start": target_week,
        "project_id": project_id,
        "max_weeks_back": max_weeks_back,
    }
    if task_id:
        params["task_id"] = task_id
    data = _request("GET", "/api/time-entry/find-source-week", params=params)
    _print_json(data)


# --- Health ----------------------------------------------------------------

@cli.command()
def health():
    """Check API health."""
    data = _request("GET", "/api/health", auth=False)
    _print_json(data)


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    cli()