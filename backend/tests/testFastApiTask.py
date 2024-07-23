#!/usr/bin/env python

import unittest
import requests
import pickle

baseurl="http://127.0.0.1:8000/api"

class TestFastApiTask(unittest.TestCase):
        def setUp(self):
            JWT="weyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MjAzNDg3ODIsInN1YiI6IjEifQ.CwrV8ZkzZZJuTxJFyf7pKaGvYUoaSBDz_LNyzwWvdWc"
            with open("../frontend/flet/user-creds.pickle", "rb") as inf:
                creds=pickle.load(inf)
                JWT=creds["access_token"]
            self.headers = {"Authorization": f"Bearer {JWT}"}
    
        #@unittest.SkipTest
        def testGetTasks(self):
            res = requests.get(f"{baseurl}/tasks/", headers=self.headers).json()
            print( res )
            self.assertTrue("tasks" in res.keys(),"Unable to pull list of tasks")

        #@unittest.SkipTest
        def testGetTaskById(self):
            res = requests.get(f"{baseurl}/tasks/1", headers=self.headers).json()
            print( res )            
            self.assertTrue("task" in res.keys(),"Unable to find task_id=1")
            
                        
        #@unittest.SkipTest
        def testPostTask(self):
            print(f"testPostTask: {baseurl}/tasks/")
            task = {
             'task_id': 0,
             'project_id': 2,
             'name': "Add support for fractional quantities",
             'description': "Test the waters for making ASP.NET mods",
             'assigned': "2024-05-13", # T18:25:43-05:00",
             'started': "2025-05-13", # T18:25:43-05:00",             
             'suspended': None,
             'http_link': None,
             'status': "Pending"
            }            
            res=requests.post(f"{baseurl}/tasks/", json=task, headers=self.headers).json()
            print(res)
            self.assertTrue(  "added" in res.keys(), "failed to add task with task_id=0" )
        
        #@unittest.SkipTest
        def testPutTask(self):
            print(f"testPutTask: {baseurl}/tasks/")
            task = {
             'task_id': 1,
             'project_id': 2,
             'name': "Add support for fractional quantities is really hard",
             'description': "Test the waters for making ASP.NET mods",
             'assigned': "2024-05-13", # T18:25:43-05:00",
             'started': "2024-05-13", # T18:25:43-05:00",             
             'suspended': None,
             'http_link': None,
             'status': "Pending"
            }            
            res=requests.put(f"{baseurl}/tasks/", json=task, headers=self.headers).json()
            print(res)
            self.assertTrue(  "updated" in res.keys(), "failed to add task with task_id=1" )
            
                                    

if __name__ == "__main__":
            unittest.main()
