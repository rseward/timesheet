#!/usr/bin/env python

import unittest
import requests
import pickle

baseurl = "http://127.0.0.1:8000/api"


class TestFastApiHoliday(unittest.TestCase):
    def setUp(self):
        JWT = "weyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MjAzNDg3ODIsInN1YiI6IjEifQ.CwrV8ZkzZZJuTxJFyf7pKaGvYUoaSBDz_LNyzwWvdWc"
        with open("../frontend/flet/user-creds.pickle", "rb") as inf:
            creds = pickle.load(inf)
            JWT = creds["access_token"]
        self.headers = {"Authorization": f"Bearer {JWT}"}

    # --- GET /api/holidays/ ---

    #@unittest.SkipTest
    def testGetHolidays(self):
        res = requests.get(f"{baseurl}/holidays/", headers=self.headers).json()
        print(res)
        self.assertIn("holidays", res, "Unable to pull list of holidays")

    #@unittest.SkipTest
    def testGetHolidaysFilterByYear(self):
        res = requests.get(f"{baseurl}/holidays/", params={"year": 2025}, headers=self.headers).json()
        print(res)
        self.assertIn("holidays", res, "Unable to pull list of holidays filtered by year")

    #@unittest.SkipTest
    def testGetHolidaysFilterByClient(self):
        res = requests.get(f"{baseurl}/holidays/", params={"client_id": 1}, headers=self.headers).json()
        print(res)
        self.assertIn("holidays", res, "Unable to pull list of holidays filtered by client_id")

    #@unittest.SkipTest
    def testGetHolidaysIncludeInactive(self):
        res = requests.get(f"{baseurl}/holidays/", params={"active": False}, headers=self.headers).json()
        print(res)
        self.assertIn("holidays", res, "Unable to pull list of holidays including inactive")

    # --- GET /api/holidays/federal ---

    #@unittest.SkipTest
    def testGetFederalHolidays(self):
        res = requests.get(f"{baseurl}/holidays/federal", headers=self.headers).json()
        print(res)
        self.assertIn("holidays", res, "Unable to pull list of federal holidays")

    #@unittest.SkipTest
    def testGetFederalHolidaysWithYear(self):
        res = requests.get(f"{baseurl}/holidays/federal", params={"year": 2025}, headers=self.headers).json()
        print(res)
        self.assertIn("holidays", res, "Unable to pull federal holidays filtered by year")

    # --- GET /api/holidays/client/{client_id} ---

    #@unittest.SkipTest
    def testGetClientHolidays(self):
        res = requests.get(f"{baseurl}/holidays/client/1", headers=self.headers).json()
        print(res)
        self.assertIn("holidays", res, "Unable to pull holidays for client_id=1")

    #@unittest.SkipTest
    def testGetClientHolidaysWithYear(self):
        res = requests.get(f"{baseurl}/holidays/client/1", params={"year": 2025}, headers=self.headers).json()
        print(res)
        self.assertIn("holidays", res, "Unable to pull holidays for client_id=1 filtered by year")

    # --- GET /api/holidays/check-date ---

    #@unittest.SkipTest
    def testCheckDateResponseShape(self):
        res = requests.get(
            f"{baseurl}/holidays/check-date",
            params={"client_id": 1, "date": "2025-12-25"},
            headers=self.headers,
        ).json()
        print(res)
        self.assertIn("is_holiday", res, "check-date response missing 'is_holiday' key")
        self.assertIn("date", res, "check-date response missing 'date' key")
        self.assertIn("holiday_type", res, "check-date response missing 'holiday_type' key")
        self.assertIn("message", res, "check-date response missing 'message' key")

    #@unittest.SkipTest
    def testCheckDateIsNotHoliday(self):
        # Use a date very unlikely to be a holiday
        res = requests.get(
            f"{baseurl}/holidays/check-date",
            params={"client_id": 1, "date": "2025-06-17"},
            headers=self.headers,
        ).json()
        print(res)
        self.assertIn("is_holiday", res, "check-date response missing 'is_holiday' key")
        self.assertFalse(res["is_holiday"], "2025-06-17 should not be a holiday")
        self.assertIsNone(res["holiday_name"], "holiday_name should be None for non-holiday")

    # --- GET /api/holidays/{holiday_id} ---

    #@unittest.SkipTest
    def testGetHolidayById(self):
        res = requests.get(f"{baseurl}/holidays/1", headers=self.headers).json()
        print(res)
        self.assertIn("holiday", res, "Unable to find holiday_id=1")

    #@unittest.SkipTest
    def testGetHolidayByIdNotFound(self):
        res = requests.get(f"{baseurl}/holidays/999999", headers=self.headers)
        print(res.json())
        self.assertEqual(res.status_code, 404, "Expected 404 for non-existent holiday")

    # --- POST /api/holidays/ ---

    #@unittest.SkipTest
    def testPostHoliday(self):
        print(f"testPostHoliday: {baseurl}/holidays/")
        holiday = {
            "holiday_id": 0,
            "client_id": 1,
            "holiday_date": "2030-06-15",
            "name": "Test Holiday",
            "description": "A test holiday added by unit tests",
            "is_federal": False,
            "active": True,
        }
        res = requests.post(f"{baseurl}/holidays/", json=holiday, headers=self.headers).json()
        print(res)
        self.assertIn("added", res, "Failed to add holiday with holiday_id=0")

    #@unittest.SkipTest
    def testPostFederalHoliday(self):
        print(f"testPostFederalHoliday: {baseurl}/holidays/")
        holiday = {
            "holiday_id": 0,
            "client_id": 0,
            "holiday_date": "2030-07-04",
            "name": "Independence Day 2030",
            "description": "Federal Holiday - Independence Day",
            "is_federal": True,
            "active": True,
        }
        res = requests.post(f"{baseurl}/holidays/", json=holiday, headers=self.headers).json()
        print(res)
        self.assertIn("added", res, "Failed to add federal holiday")

    # --- PUT /api/holidays/ ---

    #@unittest.SkipTest
    def testPutHoliday(self):
        print(f"testPutHoliday: {baseurl}/holidays/")
        holiday = {
            "holiday_id": 1,
            "client_id": 1,
            "holiday_date": "2025-12-25",
            "name": "Christmas Day (Updated)",
            "description": "Christmas Day Holiday - Updated",
            "is_federal": False,
            "active": True,
        }
        res = requests.put(f"{baseurl}/holidays/", json=holiday, headers=self.headers).json()
        print(res)
        self.assertIn("updated", res, "Failed to update holiday with holiday_id=1")

    #@unittest.SkipTest
    def testPutHolidayNotFound(self):
        holiday = {
            "holiday_id": 999999,
            "client_id": 1,
            "holiday_date": "2025-12-25",
            "name": "Ghost Holiday",
            "description": "Should not exist",
            "is_federal": False,
            "active": True,
        }
        res = requests.put(f"{baseurl}/holidays/", json=holiday, headers=self.headers)
        print(res.json())
        self.assertEqual(res.status_code, 404, "Expected 404 when updating non-existent holiday")

    # --- DELETE /api/holidays/{holiday_id} ---

    @unittest.SkipTest
    def testDeleteHoliday(self):
        res = requests.delete(f"{baseurl}/holidays/1", headers=self.headers).json()
        print(res)
        self.assertIn("deleted", res, "Failed to delete holiday with holiday_id=1")

    #@unittest.SkipTest
    def testDeleteHolidayNotFound(self):
        res = requests.delete(f"{baseurl}/holidays/999999", headers=self.headers)
        print(res.json())
        self.assertEqual(res.status_code, 400, "Expected 400 when deleting non-existent holiday")


if __name__ == "__main__":
    unittest.main()
