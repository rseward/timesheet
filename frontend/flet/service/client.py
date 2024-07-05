
import os.path
import requests
import pickle
import datetime
import time

"""
Clients services.
"""
from .base import BaseService

baseurl="http://127.0.0.1:8000/api/clients"
PFILE="user-creds.pickle"

class ClientService(BaseService):
    
    
    def __init__(self):
        super().__init__()
        self.clienturl = f"{self.baseurl}/api/clients"
    
    def getClients(self):
        #time.sleep(5)
        res = requests.get(f"{self.clienturl}/")
        rows = []
        if res.status_code == 200:
            print(res.json())
            clients = res.json()["clients"]
            
            for key in clients.keys():
                rows.append( clients[key] ) 
        else:
            return []
        
        print(rows)
        
        '''
        rows=[
            { 
             "organisation": "earthmatrix",
             "city": "Milan",
             "state": "MI",
             "contact_email": "klambert@earthmatrix.net",
             "url": "https://earthmatrix.net/"
             },
            { 
             "organisation": "Amberian Corp.",
             "city": "Granger",
             "state": "IN",
             "contact_email": "ckirgios@amberian.com",
             "url": "https://amberian.com/"
             },            
            ]
    '''
        return rows



    