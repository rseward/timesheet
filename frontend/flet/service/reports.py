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