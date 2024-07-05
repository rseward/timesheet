
import os.path
import requests
import pickle
import datetime

"""
Authentication services.
"""

baseurl="http://127.0.0.1:8000"
PFILE="user-creds.pickle"

class BaseService(object):
    
    def __init__(self):
        self.baseurl = baseurl
        self.pfile = PFILE
    
    def loadcreds(self):
        if os.path.exists(self.pfile):
            with open(self.pfile, "rb") as inf:
                return pickle.load(inf)
            
        return None
        
