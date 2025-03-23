#!/usr/bin/env python

import unittest
import requests
import pickle

baseurl="http://127.0.0.1:8080/api"

class TestFastApiBillingEvent(unittest.TestCase):
    def setUp(self):
        JWT="weyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MjAzNDg3ODIsInN1YiI6IjEifQ.CwrV8ZkzZZJuTxJFyf7pKaGvYUoaSBDz_LNyzwWvdWc"
        with open("../frontend/flet/user-creds.pickle", "rb") as inf:
            creds=pickle.load(inf)
            JWT=creds["access_token"]
        self.headers = {"Authorization": f"Bearer {JWT}"}

    @unittest.SkipTest
    def testGetBillingEvents(self):
        res = requests.get(f"{baseurl}/events/", headers=self.headers).json()
        print( res )
        self.assertTrue("events" in res.keys(),"Unable to pull list of events")

    #@unittest.SkipTest
    def testGetBillingEventById(self):
        uid="c851bab2-aacd-4bda-a528-03731b7c9945"
        res = requests.get(f"{baseurl}/events/{uid}", headers=self.headers).json()
        print( res )            
        self.assertTrue("event" in res.keys(),f"Unable to find uid={uid}")
        
                    
    @unittest.SkipTest
    def testPostBillingEvent(self):
        print(f"testPostBillingEvent: {baseurl}/events/")
        event = {
            'uid': None,
            'start_time': "2024-05-13T18:00:00-05:00",
            'end_time': "2025-05-13T20:30:00-05:00",
            "trans_num": 1,
            'project_id': 2,
            'task_id': 5,
            'log_message': "Analyze the migration lots of code!"
        }            
        res=requests.post(f"{baseurl}/events/", json=event, headers=self.headers).json()
        print(res)
        self.assertTrue(  "added" in res.keys(), "failed to add event with uid=0" )
    
    @unittest.SkipTest
    def testPutBillingEvent(self):
        print(f"testPutBillingEvent: {baseurl}/events/")
        event = {
            'uid': "c851bab2-aacd-4bda-a528-03731b7c9945",
            'start_time': "2024-05-13T18:00:00-05:00",
            'end_time': "2025-05-13T20:30:00-05:00",
            "trans_num": 1,
            'project_id': 2,
            'task_id': 5,
            'log_message': "Analyze the migration lots of code!"
        }            
        res=requests.put(f"{baseurl}/events/", json=event, headers=self.headers).json()
        print(res)
        self.assertTrue(  "updated" in res.keys(), "failed to add event with uid=1" )

    def testNextTransNum(self):
        print(f"testNextTransNum: {baseurl}/events/nextid/")
        timekeeper_id=1
        project_id=6
        task_id=19
        res=requests.get(f"{baseurl}/events/nextid/{timekeeper_id}/{project_id}/{task_id}", headers=self.headers).json()
        nextid = res["next_trans_num"]
        print(res)
        print(f"{nextid=}")
        self.assertTrue(nextid>0)
            
if __name__ == "__main__":
    unittest.main()
