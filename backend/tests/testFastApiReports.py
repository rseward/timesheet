#!/usr/bin/env python
"""Tests for the Reports API endpoints.

Requires a running backend server with test data.
"""

import unittest
import requests
import pickle

BASE_URL = "http://127.0.0.1:8000/api/reports"


class TestReportsApi(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        try:
            with open("../frontend/flet/user-creds.pickle", "rb") as inf:
                creds = pickle.load(inf)
                JWT = creds["access_token"]
            cls.headers = {"Authorization": f"Bearer {JWT}"}
        except FileNotFoundError:
            cls.headers = {}

    def test_list_report_types(self):
        """GET /api/reports/ returns available report types."""
        res = requests.get(f"{BASE_URL}/", headers=self.headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("reports", data)
        reports = data["reports"]
        self.assertEqual(len(reports), 3)
        types = [r["type"] for r in reports]
        self.assertIn("time-period", types)
        self.assertIn("client-period", types)
        self.assertIn("timekeeper-period", types)

    def test_list_clients(self):
        """GET /api/reports/clients returns client list."""
        res = requests.get(f"{BASE_URL}/clients", headers=self.headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("clients", data)
        self.assertIsInstance(data["clients"], list)

    def test_list_timekeepers(self):
        """GET /api/reports/timekeepers returns timekeeper list."""
        res = requests.get(f"{BASE_URL}/timekeepers", headers=self.headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("timekeepers", data)
        self.assertIsInstance(data["timekeepers"], list)

    def test_list_projects(self):
        """GET /api/reports/projects returns project list."""
        res = requests.get(f"{BASE_URL}/projects", headers=self.headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("projects", data)
        self.assertIsInstance(data["projects"], list)

    def test_time_period_report(self):
        """GET /api/reports/time-period returns report data."""
        res = requests.get(
            f"{BASE_URL}/time-period",
            params={"start_date": "2025-01-01", "end_date": "2025-12-31"},
            headers=self.headers,
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["report_type"], "time-period")
        self.assertEqual(data["start_date"], "2025-01-01")
        self.assertEqual(data["end_date"], "2025-12-31")
        self.assertIn("summary", data)
        self.assertIn("rows", data)
        self.assertIsInstance(data["rows"], list)
        self.assertIn("total_hours", data["summary"])
        self.assertIn("total_rows", data["summary"])

        # Validate row structure if rows exist
        if data["rows"]:
            row = data["rows"][0]
            for key in ("client", "resource", "date", "hours", "bill_rate", "task", "project"):
                self.assertIn(key, row)

    def test_time_period_report_invalid_date(self):
        """GET /api/reports/time-period with bad date returns 400."""
        res = requests.get(
            f"{BASE_URL}/time-period",
            params={"start_date": "not-a-date", "end_date": "2025-12-31"},
            headers=self.headers,
        )
        self.assertEqual(res.status_code, 400)

    def test_time_period_report_reversed_dates(self):
        """GET /api/reports/time-period with start > end returns 400."""
        res = requests.get(
            f"{BASE_URL}/time-period",
            params={"start_date": "2025-12-31", "end_date": "2025-01-01"},
            headers=self.headers,
        )
        self.assertEqual(res.status_code, 400)

    def test_time_period_report_missing_params(self):
        """GET /api/reports/time-period without required params returns 422."""
        res = requests.get(f"{BASE_URL}/time-period", headers=self.headers)
        self.assertEqual(res.status_code, 422)

    def test_time_period_report_csv(self):
        """GET /api/reports/time-period/csv returns CSV."""
        res = requests.get(
            f"{BASE_URL}/time-period/csv",
            params={"start_date": "2025-01-01", "end_date": "2025-12-31"},
            headers=self.headers,
        )
        self.assertEqual(res.status_code, 200)
        self.assertIn("text/csv", res.headers.get("content-type", ""))
        content = res.text
        self.assertIn("Client,Resource,Date,Hours,Billing Rate,Task,Project", content)

    def test_client_period_report(self):
        """GET /api/reports/client-period returns report data."""
        # First get a valid client_id
        clients_res = requests.get(f"{BASE_URL}/clients", headers=self.headers)
        clients = clients_res.json().get("clients", [])
        if not clients:
            self.skipTest("No clients in database")

        client_id = clients[0]["client_id"]
        res = requests.get(
            f"{BASE_URL}/client-period",
            params={"start_date": "2025-01-01", "end_date": "2025-12-31", "client_id": client_id},
            headers=self.headers,
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["report_type"], "client-period")
        self.assertIn("summary", data)
        self.assertIn("rows", data)

    def test_timekeeper_period_report(self):
        """GET /api/reports/timekeeper-period returns report data."""
        tk_res = requests.get(f"{BASE_URL}/timekeepers", headers=self.headers)
        timekeepers = tk_res.json().get("timekeepers", [])
        if not timekeepers:
            self.skipTest("No timekeepers in database")

        timekeeper_id = timekeepers[0]["timekeeper_id"]
        res = requests.get(
            f"{BASE_URL}/timekeeper-period",
            params={"start_date": "2025-01-01", "end_date": "2025-12-31", "timekeeper_id": timekeeper_id},
            headers=self.headers,
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["report_type"], "timekeeper-period")
        self.assertIn("summary", data)
        self.assertIn("rows", data)

    def test_summary_zero_results(self):
        """Report with no matching data returns proper zero summary."""
        # Use a far-future date range unlikely to have data
        res = requests.get(
            f"{BASE_URL}/time-period",
            params={"start_date": "2099-01-01", "end_date": "2099-01-31"},
            headers=self.headers,
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["summary"]["total_hours"], 0.0)
        self.assertEqual(data["summary"]["total_rows"], 0)
        self.assertEqual(data["rows"], [])


if __name__ == "__main__":
    unittest.main()