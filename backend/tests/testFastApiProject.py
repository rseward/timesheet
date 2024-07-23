#!/usr/bin/env python

import unittest
import requests
import pickle

baseurl="http://127.0.0.1:8000/api"

class TestFastApiProject(unittest.TestCase):
        def setUp(self):
            JWT="weyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MjAzNDg3ODIsInN1YiI6IjEifQ.CwrV8ZkzZZJuTxJFyf7pKaGvYUoaSBDz_LNyzwWvdWc"
            with open("../frontend/flet/user-creds.pickle", "rb") as inf:
                creds=pickle.load(inf)
                JWT=creds["access_token"]
            self.headers = {"Authorization": f"Bearer {JWT}"}
    
        #@unittest.SkipTest
        def testGetProjects(self):
            res = requests.get(f"{baseurl}/projects/", headers=self.headers).json()
            print( res )
            self.assertTrue("projects" in res.keys(),"Unable to pull list of projects")

        #@unittest.SkipTest
        def testGetProjectById(self):
            res = requests.get(f"{baseurl}/projects/1", headers=self.headers).json()
            print( res )            
            self.assertTrue("project" in res.keys(),"Unable to find project_id=1")
            
                        
        @unittest.SkipTest
        def testPostProject(self):
            print(f"testPostProject: {baseurl}/projects/")
            project = {
             'project_id': 0,
             'client_id': 2,
             'title': "LandLord",
             'description': "ASP.NET migration project",
             'start_date': "2024-05-13", # T18:25:43-05:00",
             'deadline': "2025-05-13", # T18:25:43-05:00",             
             'http_link': "http://google.com/",
             'proj_status': "Pending",
             'proj_leader': "rseward"
            }            
            res=requests.post(f"{baseurl}/projects/", json=project, headers=self.headers).json()
            print(res)
            self.assertTrue(  "added" in res.keys(), "failed to add project with project_id=0" )
        
        @unittest.SkipTest
        def testPutProject(self):
            print(f"testPutProject: {baseurl}/projects/")
            project = {
             'project_id': 2,
             'client_id': 1,
             'title': "Timesheet",
             'description': "Timesheet GitHub Project",
             'start_date': "2024-05-13", # T18:25:43-05:00",
             'deadline': "2023-05-13", # T18:25:43-05:00",
             'http_link': "https://github.com/rseward/timesheet.git",
             'proj_status': "Pending",
             'proj_leader': "rseward"
            }            
            res=requests.put(f"{baseurl}/projects/", json=project, headers=self.headers).json()
            print(res)
            self.assertTrue(  "updated" in res.keys(), "failed to add project with project_id=1" )
            
                                    

if __name__ == "__main__":
            unittest.main()
