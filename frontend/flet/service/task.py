
from icecream import ic

import os.path
import requests
import pickle
import datetime
import time
import json

"""
Tasks services.
"""
from .base import BaseService

#baseurl="{baseurl}/api/tasks"
PFILE="user-creds.pickle"

class TaskService(BaseService):
    
    
    def __init__(self, creds):
        super().__init__(creds)
        self.taskurl = f"{self.baseurl}/api/tasks"

    def getTask(self, id):
        #time.sleep(5)
        res = self.getSession().get(f"{self.taskurl}/{id}")
        task = None
        if res.status_code == 200:
            print(res.json())
            task = res.json()["task"]
                    
        ic(task)
        return task

    
    def getTasks(self, client_id = None, project_id = None):
        #time.sleep(5)
        params = {}
        params["client_id"] = client_id
        params["project_id"] = project_id
        res = self.getSession().get(f"{self.taskurl}/", params=params)
        rows = []
        if res.status_code == 200:
            print(res.json())
            tasks = res.json()["tasks"]
            
            for key in tasks.keys():
                rows.append( tasks[key] ) 
        else:
            rows = None
        
        print(rows)
        
        return rows
    
    def save(self, task: dict):
        posturl=f"{self.taskurl}/"
        
        if len(task.get("assigned", None)) == 0:
            task["assigned"] = None
        if len(task.get("started", None)) == 0:
            task["started"] = None
        if len(task.get("suspended", None)) == 0:
            task["suspended"] = None
        if len(task.get("completed", None)) == 0:
            task["completed"] = None
        
        ic(task)
        if task.get("task_id", None) is not None:
            ic("put")
            res = self.getSession().put(posturl,json=task)
        else:
            ic("post")
            #myjson=json.dumps(task, indent=2)
            #ic(myjson)
            res = self.getSession().post(posturl,json=task)
            
        return res
        



    