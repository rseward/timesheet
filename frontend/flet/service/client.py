
from icecream import ic

import os.path
import requests
import pickle
import datetime
import time
import json

"""
Clients services.
"""
from .base import BaseService

#baseurl="{baseurl}/api/clients"
PFILE="user-creds.pickle"

class ClientService(BaseService):
    
    
    def __init__(self, creds):
        super().__init__(creds)
        self.clienturl = f"{self.baseurl}/api/clients"

    def getClient(self, id):
        #time.sleep(5)
        res = self.getSession().get(f"{self.clienturl}/{id}")
        client = None
        if res.status_code == 200:
            print(res.json())
            client = res.json()["client"]
                    
        ic(client)
        return client

    
    def getClients(self, active=False):
        #time.sleep(5)
        params={"active":active}
        res = self.getSession().get(f"{self.clienturl}/", params=params)
        rows = []
        if res.status_code == 200:
            print(res.json())
            clients = res.json()["clients"]
            
            for key in clients.keys():
                rows.append( clients[key] ) 
        else:
            rows = None
        
        print(rows)
        
        return rows
    
    def save(self, client: dict):
        posturl=f"{self.clienturl}/"
        
        ic(client)
        if client.get("client_id", None) is not None:
            ic("put")
            res = self.getSession().put(posturl,json=client)
        else:
            ic("post")
            #myjson=json.dumps(client, indent=2)
            #ic(myjson)
            res = self.getSession().post(posturl,json=client)
            
        return res

    def inactivateClient(self, id: str):
        ic(f"inactivateClient({id})")
        res = self.getSession().delete(f"{self.clienturl}/{id}")
        ic(res)

        return res
        



    