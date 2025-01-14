
from icecream import ic

import os.path
import requests
import pickle
import datetime
import time
import json

"""
Projects services.
"""
from .base import BaseService

baseurl="{baseurl}/api/projects"
PFILE="user-creds.pickle"

class ProjectService(BaseService):
    
    
    def __init__(self, creds):
        super().__init__(creds)
        self.projecturl = f"{self.baseurl}/api/projects"

    def getProject(self, id):
        #time.sleep(5)
        res = self.getSession().get(f"{self.projecturl}/{id}")
        project = None
        if res.status_code == 200:
            print(res.json())
            project = res.json()["project"]
                    
        ic(project)
        return project

    
    def getProjects(self, client_id = None, active=False):
        #time.sleep(5)
        params={"active":active}
        if client_id is not None:
            params["client_id"]=client_id
        res = self.getSession().get(f"{self.projecturl}/", params=params)
        rows = []
        if res.status_code == 200:
            print(res.json())
            projects = res.json()["projects"]
            
            for key in projects.keys():
                rows.append( projects[key] ) 
        else:
            rows = None
        
        print(rows)
        
        return rows
    
    def save(self, project: dict):
        posturl=f"{self.projecturl}/"
        
        ic(project)
        if project.get("project_id", None) is not None:
            ic("put")
            res = self.getSession().put(posturl,json=project)
        else:
            ic("post")
            #myjson=json.dumps(project, indent=2)
            #ic(myjson)
            res = self.getSession().post(posturl,json=project)
            
        return res

    def inactivateProject(self, id: str):
        ic(f"inactivateProject({id})")
        res = self.getSession().delete(f"{self.projecturl}/{id}")
        ic(res)

        return res
        



    