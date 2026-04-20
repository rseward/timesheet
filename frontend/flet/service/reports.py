from icecream import ic

import os.path
import requests
import pickle
import datetime
import time
import json

"""
Reports services.
"""
from .base import BaseService

PFILE = "user-creds.pickle"


class ReportsService(BaseService):

    def __init__(self, creds):
        super().__init__(creds)
        self.reportsurl = f"{self.baseurl}/api/reports"

    def _extract_list(self, data, key):
        """Extract a list from API response, handling both list and dict formats."""
        items = data.get(key, [])
        if isinstance(items, list):
            return items
        elif isinstance(items, dict):
            return list(items.values())
        return []

    def getTimekeepers(self):
        """Fetch all timekeepers for dropdowns."""
        res = self.getSession().get(f"{self.reportsurl}/timekeepers")
        if res.status_code == 200:
            return self._extract_list(res.json(), "timekeepers")
        ic(f"getTimekeepers failed: {res.status_code}")
        return []

    def getClients(self):
        """Fetch all clients for dropdowns."""
        res = self.getSession().get(f"{self.reportsurl}/clients")
        if res.status_code == 200:
            return self._extract_list(res.json(), "clients")
        ic(f"getClients failed: {res.status_code}")
        return []

    def getProjects(self, client_id=None):
        """Fetch projects, optionally filtered by client."""
        params = {}
        if client_id is not None:
            params["client_id"] = client_id
        res = self.getSession().get(f"{self.reportsurl}/projects", params=params)
        if res.status_code == 200:
            return self._extract_list(res.json(), "projects")
        ic(f"getProjects failed: {res.status_code}")
        return []

    def getClientPeriodReport(self, start_date, end_date, client_id, project_id=None):
        """Run Client Period Report."""
        params = {
            "start_date": start_date,
            "end_date": end_date,
            "client_id": client_id,
        }
        if project_id is not None:
            params["project_id"] = project_id
        res = self.getSession().get(f"{self.reportsurl}/client-period", params=params)
        ic(res.status_code)
        if res.status_code == 200:
            return res.json()
        return None

    def getTimekeeperPeriodReport(self, start_date, end_date, timekeeper_id):
        """Run TimeKeeper Period Report."""
        params = {
            "start_date": start_date,
            "end_date": end_date,
            "timekeeper_id": timekeeper_id,
        }
        res = self.getSession().get(f"{self.reportsurl}/timekeeper-period", params=params)
        ic(res.status_code)
        if res.status_code == 200:
            return res.json()
        return None

    def getTimePeriodReport(self, start_date, end_date):
        """Run Time Period Report."""
        params = {
            "start_date": start_date,
            "end_date": end_date,
        }
        res = self.getSession().get(f"{self.reportsurl}/time-period", params=params)
        ic(res.status_code)
        if res.status_code == 200:
            return res.json()
        return None

    def getClientPeriodCsv(self, start_date, end_date, client_id, project_id=None):
        """Download Client Period Report as CSV."""
        params = {
            "start_date": start_date,
            "end_date": end_date,
            "client_id": client_id,
        }
        if project_id is not None:
            params["project_id"] = project_id
        res = self.getSession().get(f"{self.reportsurl}/client-period/csv", params=params)
        if res.status_code == 200:
            return res.text
        return None

    def getTimekeeperPeriodCsv(self, start_date, end_date, timekeeper_id):
        """Download TimeKeeper Period Report as CSV."""
        params = {
            "start_date": start_date,
            "end_date": end_date,
            "timekeeper_id": timekeeper_id,
        }
        res = self.getSession().get(f"{self.reportsurl}/timekeeper-period/csv", params=params)
        if res.status_code == 200:
            return res.text
        return None

    def getTimePeriodCsv(self, start_date, end_date):
        """Download Time Period Report as CSV."""
        params = {
            "start_date": start_date,
            "end_date": end_date,
        }
        res = self.getSession().get(f"{self.reportsurl}/time-period/csv", params=params)
        if res.status_code == 200:
            return res.text
        return None

    # ─── Excel export methods ────────────────────────────────────────────

    def downloadExcel(self, report_type, start_date, end_date, **kwargs):
        """Download a report as Excel (.xlsx). Returns (filepath, error).

        report_type: 'client-period', 'timekeeper-period', 'time-period'
        kwargs: client_id, project_id, timekeeper_id, template_id as needed
        """
        import tempfile, os

        params = {"start_date": start_date, "end_date": end_date}
        # Add type-specific params
        if report_type == "client-period":
            params["client_id"] = kwargs.get("client_id")
            if kwargs.get("project_id"):
                params["project_id"] = kwargs["project_id"]
        elif report_type == "timekeeper-period":
            params["timekeeper_id"] = kwargs.get("timekeeper_id")
        if kwargs.get("template_id"):
            params["template_id"] = kwargs["template_id"]

        res = self.getSession().get(
            f"{self.reportsurl}/{report_type}/excel",
            params=params,
        )
        if res.status_code == 200:
            tmpdir = tempfile.gettempdir()
            fname = f"report_{report_type}_{start_date}_{end_date}.xlsx"
            fpath = os.path.join(tmpdir, fname)
            with open(fpath, "wb") as f:
                f.write(res.content)
            return fpath, None
        return None, f"Excel download failed: {res.status_code}"

    # ─── Template management methods ─────────────────────────────────────

    def getTemplates(self, report_type=None):
        """Fetch available report templates, optionally filtered by report type."""
        params = {}
        if report_type:
            params["report_type"] = report_type
        res = self.getSession().get(f"{self.reportsurl}/templates", params=params)
        if res.status_code == 200:
            return res.json().get("templates", [])
        ic(f"getTemplates failed: {res.status_code}")
        return []

    def uploadTemplate(self, name, report_type, file_path, description=None, created_by=None):
        """Upload an Excel template file."""
        import os
        filename = os.path.basename(file_path)
        with open(file_path, "rb") as f:
            files = {"file": (filename, f, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}
            data = {"name": name, "report_type": report_type}
            if description:
                data["description"] = description
            if created_by:
                data["created_by"] = created_by
            res = self.getSession().post(f"{self.reportsurl}/templates", files=files, data=data)
        if res.status_code == 200:
            return res.json()
        ic(f"uploadTemplate failed: {res.status_code}")
        return None

    def deleteTemplate(self, template_id):
        """Delete a report template."""
        res = self.getSession().delete(f"{self.reportsurl}/templates/{template_id}")
        if res.status_code == 200:
            return res.json()
        ic(f"deleteTemplate failed: {res.status_code}")
        return None