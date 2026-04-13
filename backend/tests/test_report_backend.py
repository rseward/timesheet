#!/usr/bin/env python3
"""
Backend pytest tests for the Reports module.

Tests the report generation logic at multiple levels:
  1. Pure-function unit tests (_calculate_hours, _compute_summary)
  2. Database-backed integration tests (_build_*_rows) using in-memory SQLite
  3. FastAPI TestClient endpoint tests (with JWT bypass)

No running server required — all tests are self-contained.

Run with:
    cd /home/openclaw/src/github/timesheet/backend
    TIMESHEET_SA_URL="sqlite://" pytest tests/test_report_backend.py -v
"""

import datetime
import json
import os
import uuid
from unittest.mock import patch, MagicMock

import pytest
import jwt as pyjwt
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# ---------------------------------------------------------------------------
# Ensure the config module can resolve the SA URL before anything imports it
# ---------------------------------------------------------------------------
os.environ.setdefault("TIMESHEET_SA_URL", "sqlite://")

from bluestone.timesheet.data.models import (
    Base,
    BillingEvent,
    Client,
    Project,
    Task,
    Timekeeper,
    User,
    UserToken,
)
from bluestone.timesheet.data.daos import DaoFactory

# ---------------------------------------------------------------------------
# Import the functions under test from the reports router
# ---------------------------------------------------------------------------
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'fastapi'))
import api.routers.reports as reports_router

# ============================================================================
# Fixtures
# ============================================================================


@pytest.fixture()
def engine():
    """Create a file-based SQLite engine with all tables.

    Using a temp file instead of :memory: so the DB can be accessed
    from the TestClient thread (SQLite :memory: is thread-locked).
    """
    import tempfile
    tmp = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
    db_path = tmp.name
    tmp.close()

    eng = create_engine(f"sqlite:///{db_path}", echo=False)
    Base.metadata.create_all(eng)
    yield eng
    Base.metadata.drop_all(eng)
    eng.dispose()
    os.unlink(db_path)


@pytest.fixture()
def session(engine):
    """Provide a scoped SQLAlchemy session."""
    Session = sessionmaker(bind=engine)
    sess = Session()
    yield sess
    sess.close()


@pytest.fixture()
def dao_factory(engine, session, monkeypatch):
    """Create a DaoFactory wired to the in-memory engine.

    We patch the global getDaoFactory so the reports router uses our test DB.
    """
    factory = DaoFactory.__new__(DaoFactory)
    factory.engine = engine
    factory.Session = sessionmaker(bind=engine)
    factory.clientDao = None
    factory.userDao = None
    factory.userTokenDao = None
    factory.userPreferenceDao = None
    factory.projectDao = None
    factory.taskDao = None
    factory.eventDao = None
    factory.holidayDao = None
    factory.timekeeperDao = None

    # Patch the module-level 'daos' in reports router
    monkeypatch.setattr(reports_router, "daos", factory)
    yield factory


def _seed_test_data(session):
    """Insert a minimal set of test data and return the IDs created."""
    # Client
    client = Client(
        client_id=1,
        organisation="TestCorp",
        description="Test client",
        address1="1 Main St",
        city="Ann Arbor",
        state="MI",
        country="US",
        postal_code="48108",
        contact_first_name="Alice",
        contact_last_name="Smith",
        username="asmith",
        contact_email="alice@testcorp.com",
        phone_number="555-0100",
        active=True,
    )
    session.add(client)

    # Second client for multi-client tests
    client2 = Client(
        client_id=2,
        organisation="OtherCorp",
        description="Another client",
        address1="2 Oak Ave",
        city="Ypsilanti",
        state="MI",
        country="US",
        postal_code="48197",
        contact_first_name="Bob",
        contact_last_name="Jones",
        username="bjones",
        contact_email="bob@othercorp.com",
        phone_number="555-0200",
        active=True,
    )
    session.add(client2)

    # Timekeeper
    tk = Timekeeper(
        timekeeper_id=1,
        username="jdoe",
        first_name="John",
        last_name="Doe",
        email="jdoe@test.com",
        bill_rate=150.0,
    )
    session.add(tk)

    # Project
    proj = Project(
        project_id=1,
        title="Project Alpha",
        client_id=1,
        description="First project",
        start_date=datetime.date(2025, 1, 1),
        deadline=datetime.date(2025, 12, 31),
        http_link="http://example.com",
        proj_status="Started",
        proj_leader="jdoe",
        active=True,
    )
    session.add(proj)

    proj2 = Project(
        project_id=2,
        title="Project Beta",
        client_id=2,
        description="Second project",
        start_date=datetime.date(2025, 1, 1),
        deadline=datetime.date(2025, 12, 31),
        http_link="http://example.com/beta",
        proj_status="Started",
        proj_leader="jdoe",
        active=True,
    )
    session.add(proj2)

    # Task
    task = Task(
        task_id=1,
        project_id=1,
        name="Development",
        status="Started",
        active=True,
    )
    session.add(task)

    task2 = Task(
        task_id=2,
        project_id=2,
        name="Consulting",
        status="Started",
        active=True,
    )
    session.add(task2)

    # BillingEvents
    events = [
        BillingEvent(
            uid=str(uuid.uuid4()),
            start_time=datetime.datetime(2025, 2, 1, 9, 0, 0),
            end_time=datetime.datetime(2025, 2, 1, 17, 0, 0),
            trans_num=1,
            timekeeper_id=1,
            project_id=1,
            task_id=1,
            log_message="Coded feature A",
            active=True,
        ),
        BillingEvent(
            uid=str(uuid.uuid4()),
            start_time=datetime.datetime(2025, 2, 2, 9, 0, 0),
            end_time=datetime.datetime(2025, 2, 2, 12, 30, 0),
            trans_num=2,
            timekeeper_id=1,
            project_id=1,
            task_id=1,
            log_message="Code review",
            active=True,
        ),
        BillingEvent(
            uid=str(uuid.uuid4()),
            start_time=datetime.datetime(2025, 3, 15, 10, 0, 0),
            end_time=datetime.datetime(2025, 3, 15, 14, 0, 0),
            trans_num=3,
            timekeeper_id=1,
            project_id=2,
            task_id=2,
            log_message="Client meeting",
            active=True,
        ),
        # Inactive event — should be excluded
        BillingEvent(
            uid=str(uuid.uuid4()),
            start_time=datetime.datetime(2025, 2, 3, 9, 0, 0),
            end_time=datetime.datetime(2025, 2, 3, 17, 0, 0),
            trans_num=4,
            timekeeper_id=1,
            project_id=1,
            task_id=1,
            log_message="Inactive entry",
            active=False,
        ),
    ]
    session.add_all(events)
    session.commit()

    return {
        "client_id": 1,
        "client2_id": 2,
        "timekeeper_id": 1,
        "project_id": 1,
        "project2_id": 2,
    }


@pytest.fixture()
def seeded_session(session):
    """Session with test data seeded."""
    _seed_test_data(session)
    return session


# ============================================================================
# 1. Pure-function unit tests: _calculate_hours
# ============================================================================


class TestCalculateHours:
    """Tests for reports._calculate_hours."""

    def test_full_eight_hour_day(self):
        start = datetime.datetime(2025, 1, 1, 9, 0, 0)
        end = datetime.datetime(2025, 1, 1, 17, 0, 0)
        assert reports_router._calculate_hours(start, end) == 8.0

    def test_half_day(self):
        start = datetime.datetime(2025, 1, 1, 9, 0, 0)
        end = datetime.datetime(2025, 1, 1, 13, 0, 0)
        assert reports_router._calculate_hours(start, end) == 4.0

    def test_fractional_hours(self):
        start = datetime.datetime(2025, 1, 1, 9, 0, 0)
        end = datetime.datetime(2025, 1, 1, 10, 30, 0)
        assert reports_router._calculate_hours(start, end) == 1.5

    def test_minutes_rounding(self):
        """10 minutes = 0.1667h → rounded to 0.2."""
        start = datetime.datetime(2025, 1, 1, 9, 0, 0)
        end = datetime.datetime(2025, 1, 1, 9, 10, 0)
        assert reports_router._calculate_hours(start, end) == 0.2

    def test_overnight_shift(self):
        start = datetime.datetime(2025, 1, 1, 22, 0, 0)
        end = datetime.datetime(2025, 1, 2, 6, 0, 0)
        assert reports_router._calculate_hours(start, end) == 8.0

    def test_zero_duration(self):
        dt = datetime.datetime(2025, 1, 1, 12, 0, 0)
        assert reports_router._calculate_hours(dt, dt) == 0.0

    def test_one_second(self):
        start = datetime.datetime(2025, 1, 1, 12, 0, 0)
        end = datetime.datetime(2025, 1, 1, 12, 0, 1)
        # 1/3600 ≈ 0.0003, rounds to 0.0 at 1 decimal
        assert reports_router._calculate_hours(start, end) == 0.0

    def test_nine_hour_day(self):
        start = datetime.datetime(2025, 6, 1, 8, 30, 0)
        end = datetime.datetime(2025, 6, 1, 17, 30, 0)
        assert reports_router._calculate_hours(start, end) == 9.0

    def test_meeting_duration(self):
        start = datetime.datetime(2025, 3, 10, 10, 15, 0)
        end = datetime.datetime(2025, 3, 10, 11, 45, 0)
        assert reports_router._calculate_hours(start, end) == 1.5


# ============================================================================
# 2. Pure-function unit tests: _compute_summary
# ============================================================================


class TestComputeSummary:
    """Tests for reports._compute_summary."""

    def test_empty_rows(self):
        result = reports_router._compute_summary([])
        assert result["total_hours"] == 0.0
        assert result["total_rows"] == 0
        assert result["unique_resources"] == 0
        assert result["unique_projects"] == 0
        assert result["unique_clients"] == 0
        assert result["date_range"]["start"] is None
        assert result["date_range"]["end"] is None

    def test_single_row(self):
        rows = [{
            "client": "Acme",
            "resource": "Jane Doe",
            "date": "2025-03-01",
            "hours": 8.0,
            "bill_rate": 150.0,
            "task": "Coding",
            "project": "Alpha",
        }]
        result = reports_router._compute_summary(rows)
        assert result["total_hours"] == 8.0
        assert result["total_rows"] == 1
        assert result["unique_resources"] == 1
        assert result["unique_projects"] == 1
        assert result["unique_clients"] == 1
        assert result["date_range"]["start"] == "2025-03-01"
        assert result["date_range"]["end"] == "2025-03-01"

    def test_multiple_rows_totals(self):
        rows = [
            {"client": "A", "resource": "Jane", "date": "2025-01-01", "hours": 4.0, "bill_rate": 100, "task": "t1", "project": "P1"},
            {"client": "A", "resource": "Jane", "date": "2025-01-02", "hours": 3.5, "bill_rate": 100, "task": "t2", "project": "P1"},
            {"client": "B", "resource": "Bob", "date": "2025-01-03", "hours": 2.0, "bill_rate": 200, "task": "t3", "project": "P2"},
        ]
        result = reports_router._compute_summary(rows)
        assert result["total_hours"] == 9.5
        assert result["total_rows"] == 3
        assert result["unique_resources"] == 2
        assert result["unique_projects"] == 2
        assert result["unique_clients"] == 2

    def test_date_range_ordering(self):
        rows = [
            {"client": "X", "resource": "R", "date": "2025-06-15", "hours": 1, "bill_rate": 0, "task": "t", "project": "P"},
            {"client": "X", "resource": "R", "date": "2025-01-01", "hours": 2, "bill_rate": 0, "task": "t", "project": "P"},
            {"client": "X", "resource": "R", "date": "2025-12-31", "hours": 3, "bill_rate": 0, "task": "t", "project": "P"},
        ]
        result = reports_router._compute_summary(rows)
        assert result["date_range"]["start"] == "2025-01-01"
        assert result["date_range"]["end"] == "2025-12-31"

    def test_duplicate_resources_counted_once(self):
        rows = [
            {"client": "A", "resource": "Jane", "date": "2025-01-01", "hours": 5, "bill_rate": 0, "task": "t", "project": "P1"},
            {"client": "A", "resource": "Jane", "date": "2025-01-02", "hours": 3, "bill_rate": 0, "task": "t", "project": "P1"},
            {"client": "A", "resource": "Jane", "date": "2025-01-03", "hours": 2, "bill_rate": 0, "task": "t", "project": "P2"},
        ]
        result = reports_router._compute_summary(rows)
        assert result["unique_resources"] == 1
        assert result["unique_projects"] == 2

    def test_hours_rounding(self):
        """Total hours should be rounded to 1 decimal place."""
        rows = [
            {"client": "X", "resource": "R", "date": "2025-01-01", "hours": 1.15, "bill_rate": 0, "task": "t", "project": "P"},
            {"client": "X", "resource": "R", "date": "2025-01-02", "hours": 2.15, "bill_rate": 0, "task": "t", "project": "P"},
        ]
        result = reports_router._compute_summary(rows)
        # 1.15 + 2.15 = 3.30 → round(3.3, 1) = 3.3
        assert result["total_hours"] == 3.3

    def test_none_project_excluded_from_unique_count(self):
        rows = [
            {"client": "A", "resource": "R", "date": "2025-01-01", "hours": 1, "bill_rate": 0, "task": "t", "project": None},
            {"client": "A", "resource": "R", "date": "2025-01-02", "hours": 2, "bill_rate": 0, "task": "t", "project": "P1"},
        ]
        result = reports_router._compute_summary(rows)
        assert result["unique_projects"] == 1

    def test_none_client_excluded_from_unique_count(self):
        rows = [
            {"client": None, "resource": "R", "date": "2025-01-01", "hours": 1, "bill_rate": 0, "task": "t", "project": "P"},
            {"client": "A", "resource": "R", "date": "2025-01-02", "hours": 2, "bill_rate": 0, "task": "t", "project": "P"},
        ]
        result = reports_router._compute_summary(rows)
        assert result["unique_clients"] == 1


# ============================================================================
# 3. Database-backed tests: _build_*_rows functions
# ============================================================================


class TestBuildTimePeriodRows:
    """Tests for reports._build_time_period_rows with real DB queries."""

    def test_returns_active_events_in_range(self, dao_factory, seeded_session):
        start = datetime.datetime(2025, 1, 1, 0, 0, 0)
        end = datetime.datetime(2025, 12, 31, 23, 59, 59)
        rows = reports_router._build_time_period_rows(start, end)
        # Should get 3 active events (excludes the inactive one)
        assert len(rows) == 3

    def test_excludes_inactive_events(self, dao_factory, seeded_session):
        start = datetime.datetime(2025, 1, 1, 0, 0, 0)
        end = datetime.datetime(2025, 12, 31, 23, 59, 59)
        rows = reports_router._build_time_period_rows(start, end)
        tasks = [r["task"] for r in rows]
        assert "Inactive entry" not in tasks

    def test_filters_by_date_range(self, dao_factory, seeded_session):
        # Only February events
        start = datetime.datetime(2025, 2, 1, 0, 0, 0)
        end = datetime.datetime(2025, 2, 28, 23, 59, 59)
        rows = reports_router._build_time_period_rows(start, end)
        assert len(rows) == 2
        for r in rows:
            assert r["date"].startswith("2025-02")

    def test_no_results_outside_range(self, dao_factory, seeded_session):
        start = datetime.datetime(2024, 1, 1, 0, 0, 0)
        end = datetime.datetime(2024, 12, 31, 23, 59, 59)
        rows = reports_router._build_time_period_rows(start, end)
        assert rows == []

    def test_row_structure(self, dao_factory, seeded_session):
        start = datetime.datetime(2025, 1, 1, 0, 0, 0)
        end = datetime.datetime(2025, 12, 31, 23, 59, 59)
        rows = reports_router._build_time_period_rows(start, end)
        row = rows[0]
        for key in ("client", "resource", "date", "hours", "bill_rate", "task", "project"):
            assert key in row, f"Missing key: {key}"

    def test_hours_calculation_in_rows(self, dao_factory, seeded_session):
        start = datetime.datetime(2025, 2, 1, 0, 0, 0)
        end = datetime.datetime(2025, 2, 28, 23, 59, 59)
        rows = reports_router._build_time_period_rows(start, end)
        # 9-17 = 8.0, 9-12:30 = 3.5
        hours = sorted([r["hours"] for r in rows])
        assert 3.5 in hours
        assert 8.0 in hours

    def test_resource_name_format(self, dao_factory, seeded_session):
        start = datetime.datetime(2025, 1, 1, 0, 0, 0)
        end = datetime.datetime(2025, 12, 31, 23, 59, 59)
        rows = reports_router._build_time_period_rows(start, end)
        assert all(r["resource"] == "John Doe" for r in rows)

    def test_bill_rate_populated(self, dao_factory, seeded_session):
        start = datetime.datetime(2025, 1, 1, 0, 0, 0)
        end = datetime.datetime(2025, 12, 31, 23, 59, 59)
        rows = reports_router._build_time_period_rows(start, end)
        assert all(r["bill_rate"] == 150.0 for r in rows)


class TestBuildClientPeriodRows:
    """Tests for reports._build_client_period_rows."""

    def test_filters_by_client(self, dao_factory, seeded_session):
        start = datetime.datetime(2025, 1, 1, 0, 0, 0)
        end = datetime.datetime(2025, 12, 31, 23, 59, 59)
        rows = reports_router._build_client_period_rows(start, end, client_id=1)
        assert len(rows) == 2  # Two active events for client 1
        assert all(r["client"] == "TestCorp" for r in rows)

    def test_other_client(self, dao_factory, seeded_session):
        start = datetime.datetime(2025, 1, 1, 0, 0, 0)
        end = datetime.datetime(2025, 12, 31, 23, 59, 59)
        rows = reports_router._build_client_period_rows(start, end, client_id=2)
        assert len(rows) == 1
        assert rows[0]["client"] == "OtherCorp"

    def test_filter_by_project(self, dao_factory, seeded_session):
        start = datetime.datetime(2025, 1, 1, 0, 0, 0)
        end = datetime.datetime(2025, 12, 31, 23, 59, 59)
        rows = reports_router._build_client_period_rows(start, end, client_id=1, project_id=1)
        assert len(rows) == 2  # Both events for client 1 are on project 1

    def test_no_matching_project(self, dao_factory, seeded_session):
        start = datetime.datetime(2025, 1, 1, 0, 0, 0)
        end = datetime.datetime(2025, 12, 31, 23, 59, 59)
        # Client 1 has no events on project 2
        rows = reports_router._build_client_period_rows(start, end, client_id=1, project_id=2)
        assert rows == []

    def test_nonexistent_client(self, dao_factory, seeded_session):
        start = datetime.datetime(2025, 1, 1, 0, 0, 0)
        end = datetime.datetime(2025, 12, 31, 23, 59, 59)
        rows = reports_router._build_client_period_rows(start, end, client_id=999)
        assert rows == []


class TestBuildTimekeeperPeriodRows:
    """Tests for reports._build_timekeeper_period_rows."""

    def test_filters_by_timekeeper(self, dao_factory, seeded_session):
        start = datetime.datetime(2025, 1, 1, 0, 0, 0)
        end = datetime.datetime(2025, 12, 31, 23, 59, 59)
        rows = reports_router._build_timekeeper_period_rows(start, end, timekeeper_id=1)
        assert len(rows) == 3  # All 3 active events belong to timekeeper 1

    def test_nonexistent_timekeeper(self, dao_factory, seeded_session):
        start = datetime.datetime(2025, 1, 1, 0, 0, 0)
        end = datetime.datetime(2025, 12, 31, 23, 59, 59)
        rows = reports_router._build_timekeeper_period_rows(start, end, timekeeper_id=999)
        assert rows == []

    def test_date_filter_applies(self, dao_factory, seeded_session):
        # Only March
        start = datetime.datetime(2025, 3, 1, 0, 0, 0)
        end = datetime.datetime(2025, 3, 31, 23, 59, 59)
        rows = reports_router._build_timekeeper_period_rows(start, end, timekeeper_id=1)
        assert len(rows) == 1
        assert rows[0]["date"].startswith("2025-03")

    def test_excludes_inactive(self, dao_factory, seeded_session):
        start = datetime.datetime(2025, 1, 1, 0, 0, 0)
        end = datetime.datetime(2025, 12, 31, 23, 59, 59)
        rows = reports_router._build_timekeeper_period_rows(start, end, timekeeper_id=1)
        tasks = [r["task"] for r in rows]
        assert "Inactive entry" not in tasks


# ============================================================================
# 4. FastAPI TestClient endpoint tests
# ============================================================================

# Create a valid JWT for the test client to pass auth checks
_JWT_SECRET = "9a1gBPmYvQJ%j85DjPps|0XovfUEe6s@ntvg5:rtN891"
_JWT_ALGO = "HS256"


def _make_test_token(user_id: int = 1) -> str:
    payload = {
        "sub": str(user_id),
        "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=1),
    }
    return pyjwt.encode(payload, _JWT_SECRET, algorithm=_JWT_ALGO)


@pytest.fixture()
def app_client(dao_factory, seeded_session, monkeypatch, engine):
    """Create a FastAPI TestClient with auth bypassed via valid JWT."""
    from fastapi.testclient import TestClient
    # Import the app from backend/fastapi/main.py (on sys.path as fastapi dir)
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'fastapi'))
    import main as fastapi_main
    fastapi_app = fastapi_main.app

    # Patch the global daos in the main module and all routers to use our test factory
    monkeypatch.setattr(fastapi_main, "daos", dao_factory)
    monkeypatch.setattr(reports_router, "daos", dao_factory)
    # Patch other routers that might be hit (clients, projects, timekeepers endpoints)
    try:
        import api.routers.client as client_router
        monkeypatch.setattr(client_router, "daos", dao_factory)
    except Exception:
        pass
    try:
        import api.routers.project as project_router
        monkeypatch.setattr(project_router, "daos", dao_factory)
    except Exception:
        pass
    try:
        import api.routers.timekeeper as tk_router
        monkeypatch.setattr(tk_router, "daos", dao_factory)
    except Exception:
        pass

    # Override the config SA URL so any new DaoFactory uses our test DB
    db_url = f"sqlite:///{engine.url.database}"
    monkeypatch.setenv("TIMESHEET_SA_URL", db_url)

    client = TestClient(fastapi_app)
    return client


@pytest.fixture()
def auth_headers():
    """Provide Authorization headers with a valid test JWT."""
    token = _make_test_token()
    return {"Authorization": f"Bearer {token}"}


class TestReportsEndpoints:
    """Integration tests for the /api/reports/* endpoints via TestClient."""

    def test_list_report_types(self, app_client, auth_headers):
        res = app_client.get("/api/reports/", headers=auth_headers)
        assert res.status_code == 200
        data = res.json()
        assert "reports" in data
        assert len(data["reports"]) == 3
        types = {r["type"] for r in data["reports"]}
        assert types == {"time-period", "client-period", "timekeeper-period"}

    def test_time_period_report(self, app_client, auth_headers):
        res = app_client.get(
            "/api/reports/time-period",
            params={"start_date": "2025-01-01", "end_date": "2025-12-31"},
            headers=auth_headers,
        )
        assert res.status_code == 200
        data = res.json()
        assert data["report_type"] == "time-period"
        assert data["start_date"] == "2025-01-01"
        assert data["end_date"] == "2025-12-31"
        assert "summary" in data
        assert "rows" in data
        assert data["summary"]["total_rows"] == 3

    def test_time_period_report_invalid_date(self, app_client, auth_headers):
        res = app_client.get(
            "/api/reports/time-period",
            params={"start_date": "not-a-date", "end_date": "2025-12-31"},
            headers=auth_headers,
        )
        assert res.status_code == 400

    def test_time_period_report_reversed_dates(self, app_client, auth_headers):
        res = app_client.get(
            "/api/reports/time-period",
            params={"start_date": "2025-12-31", "end_date": "2025-01-01"},
            headers=auth_headers,
        )
        assert res.status_code == 400

    def test_time_period_report_missing_params(self, app_client, auth_headers):
        res = app_client.get("/api/reports/time-period", headers=auth_headers)
        assert res.status_code == 422

    def test_time_period_report_narrow_range(self, app_client, auth_headers):
        """Only February should match."""
        res = app_client.get(
            "/api/reports/time-period",
            params={"start_date": "2025-02-01", "end_date": "2025-02-28"},
            headers=auth_headers,
        )
        assert res.status_code == 200
        data = res.json()
        assert data["summary"]["total_rows"] == 2

    def test_time_period_report_csv(self, app_client, auth_headers):
        res = app_client.get(
            "/api/reports/time-period/csv",
            params={"start_date": "2025-01-01", "end_date": "2025-12-31"},
            headers=auth_headers,
        )
        assert res.status_code == 200
        assert "text/csv" in res.headers.get("content-type", "")
        lines = res.text.strip().split("\n")
        # Header + 3 data rows
        assert len(lines) == 4
        assert "Client" in lines[0]

    def test_client_period_report(self, app_client, auth_headers):
        res = app_client.get(
            "/api/reports/client-period",
            params={"start_date": "2025-01-01", "end_date": "2025-12-31", "client_id": 1},
            headers=auth_headers,
        )
        assert res.status_code == 200
        data = res.json()
        assert data["report_type"] == "client-period"
        assert data["client_id"] == 1
        assert data["summary"]["total_rows"] == 2

    def test_client_period_report_with_project_filter(self, app_client, auth_headers):
        res = app_client.get(
            "/api/reports/client-period",
            params={
                "start_date": "2025-01-01",
                "end_date": "2025-12-31",
                "client_id": 1,
                "project_id": 1,
            },
            headers=auth_headers,
        )
        assert res.status_code == 200
        data = res.json()
        assert data["summary"]["total_rows"] == 2

    def test_client_period_report_csv(self, app_client, auth_headers):
        res = app_client.get(
            "/api/reports/client-period/csv",
            params={"start_date": "2025-01-01", "end_date": "2025-12-31", "client_id": 1},
            headers=auth_headers,
        )
        assert res.status_code == 200
        assert "text/csv" in res.headers.get("content-type", "")

    def test_timekeeper_period_report(self, app_client, auth_headers):
        res = app_client.get(
            "/api/reports/timekeeper-period",
            params={"start_date": "2025-01-01", "end_date": "2025-12-31", "timekeeper_id": 1},
            headers=auth_headers,
        )
        assert res.status_code == 200
        data = res.json()
        assert data["report_type"] == "timekeeper-period"
        assert data["timekeeper_id"] == 1
        assert data["summary"]["total_rows"] == 3

    def test_timekeeper_period_report_csv(self, app_client, auth_headers):
        res = app_client.get(
            "/api/reports/timekeeper-period/csv",
            params={"start_date": "2025-01-01", "end_date": "2025-12-31", "timekeeper_id": 1},
            headers=auth_headers,
        )
        assert res.status_code == 200
        assert "text/csv" in res.headers.get("content-type", "")

    def test_list_clients(self, app_client, auth_headers):
        res = app_client.get("/api/reports/clients", headers=auth_headers)
        assert res.status_code == 200
        data = res.json()
        assert "clients" in data
        assert isinstance(data["clients"], list)
        assert len(data["clients"]) >= 2

    def test_list_timekeepers(self, app_client, auth_headers):
        res = app_client.get("/api/reports/timekeepers", headers=auth_headers)
        assert res.status_code == 200
        data = res.json()
        assert "timekeepers" in data
        assert len(data["timekeepers"]) >= 1

    def test_list_projects(self, app_client, auth_headers):
        res = app_client.get("/api/reports/projects", headers=auth_headers)
        assert res.status_code == 200
        data = res.json()
        assert "projects" in data
        assert len(data["projects"]) >= 2

    def test_list_projects_filtered_by_client(self, app_client, auth_headers):
        res = app_client.get(
            "/api/reports/projects",
            params={"client_id": 1},
            headers=auth_headers,
        )
        assert res.status_code == 200
        data = res.json()
        assert all(p["client_id"] == 1 for p in data["projects"])

    def test_no_auth_returns_403(self, app_client):
        """Endpoints requiring JWT should reject unauthenticated requests."""
        res = app_client.get("/api/reports/time-period")
        # 403 from JWTBearer or 401 depending on middleware
        assert res.status_code in (401, 403)

    def test_summary_zero_results(self, app_client, auth_headers):
        res = app_client.get(
            "/api/reports/time-period",
            params={"start_date": "2099-01-01", "end_date": "2099-01-31"},
            headers=auth_headers,
        )
        assert res.status_code == 200
        data = res.json()
        assert data["summary"]["total_hours"] == 0.0
        assert data["summary"]["total_rows"] == 0
        assert data["rows"] == []


# ============================================================================
# 5. Edge-case & boundary tests
# ============================================================================


class TestEdgeCases:
    """Edge-case tests for report logic."""

    def test_calculate_hours_sub_second(self):
        """Sub-second durations round to 0.0."""
        start = datetime.datetime(2025, 1, 1, 12, 0, 0)
        end = datetime.datetime(2025, 1, 1, 12, 0, 0, 500000)  # 0.5s
        assert reports_router._calculate_hours(start, end) == 0.0

    def test_compute_summary_with_negative_hours_row(self):
        """If a row somehow has negative hours, summary should still total correctly."""
        rows = [
            {"client": "A", "resource": "R", "date": "2025-01-01", "hours": 5.0, "bill_rate": 0, "task": "t", "project": "P"},
            {"client": "A", "resource": "R", "date": "2025-01-02", "hours": -1.0, "bill_rate": 0, "task": "t", "project": "P"},
        ]
        result = reports_router._compute_summary(rows)
        assert result["total_hours"] == 4.0

    def test_build_time_period_boundary_start(self, dao_factory, seeded_session):
        """Event starting exactly at start_date should be included."""
        start = datetime.datetime(2025, 2, 1, 9, 0, 0)
        end = datetime.datetime(2025, 12, 31, 23, 59, 59)
        rows = reports_router._build_time_period_rows(start, end)
        assert len(rows) >= 1

    def test_build_time_period_just_before_event(self, dao_factory, seeded_session):
        """Event starting 1 second after range start should be included."""
        start = datetime.datetime(2025, 2, 1, 8, 59, 59)
        end = datetime.datetime(2025, 12, 31, 23, 59, 59)
        rows = reports_router._build_time_period_rows(start, end)
        assert any(r["date"] == "2025-02-01" for r in rows)

    def test_client_period_invalid_date(self, app_client, auth_headers):
        res = app_client.get(
            "/api/reports/client-period",
            params={"start_date": "bad", "end_date": "2025-12-31", "client_id": 1},
            headers=auth_headers,
        )
        assert res.status_code == 400

    def test_timekeeper_period_reversed_dates(self, app_client, auth_headers):
        res = app_client.get(
            "/api/reports/timekeeper-period",
            params={"start_date": "2025-12-31", "end_date": "2025-01-01", "timekeeper_id": 1},
            headers=auth_headers,
        )
        assert res.status_code == 400