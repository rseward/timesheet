
from icecream import ic

import os.path
import requests
import pickle
import datetime
import time
import json

"""
BillingEvents services.
"""
from .base import BaseService, baseurl

baseurl="{baseurl}/api/events"
PFILE="user-creds.pickle"

class BillingEventService(BaseService):
    
    
    def __init__(self, creds):
        super().__init__(creds)
        self.eventurl = f"{self.baseurl}/api/events"

    def getBillingEvent(self, uid):
        #time.sleep(5)
        res = self.getSession().get(f"{self.eventurl}/{uid}")
        event = None
        if res.status_code == 200:
            print(res.json())
            event = res.json()["event"]
                    
        ic(event)
        return event

    
    def getBillingEvents(self, client_id=None, project_id=None, start_date=None, end_date=None):
        #time.sleep(5)
        params={}
        if client_id is not None:
            params["client_id"]=client_id
        if project_id is not None:
            params["project_id"]=project_id
        if start_date is not None:
            params["start_date"]=start_date
        if end_date is not None:
            params["end_date"]=end_date
            
        ic(f"getBillingEvents{params}")
        
        res = self.getSession().get(f"{self.eventurl}/", params=params)
        rows = []
        if res.status_code == 200:
            print(res.json())
            events = res.json()["events"]
            
            for key in events.keys():
                rows.append( events[key] ) 
        else:
            rows = None
        
        print(rows)
        
        return rows
    
    def save(self, event: dict):
        posturl=f"{self.eventurl}/"
                
        ic(event)
        if event.get("uid", None) is not None:
            ic("put")
            res = self.getSession().put(posturl,json=event)
        else:
            ic("post")
            #myjson=json.dumps(event, indent=2)
            #ic(myjson)
            res = self.getSession().post(posturl,json=event)
            
        return res

    def inactivateBillingEvent(self, uid):
        ic(f"inactivateBillingEvent({uid})")
        res = self.getSession().delete(f"{self.eventurl}/{uid}")
        ic(res)

        return res

    def getNextTransNum(self, timekeeper_id, project_id, task_id):
        res = self.getSession().get(f"{self.eventurl}/nextid/{timekeeper_id}/{project_id}/{task_id}")
        return res.json()["next_trans_num"]

        



    