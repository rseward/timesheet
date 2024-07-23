
import os.path
import requests
import pickle
import datetime
import requests

"""
Authentication services.
"""

baseurl="http://127.0.0.1:8080"
PFILE="user-creds.pickle"

class BaseService(object):
    
    def __init__(self, creds):
        self.baseurl = baseurl
        self.pfile = PFILE
        self.creds = creds
        self.session = None
        
        
    def getSession(self):
        # TODO: make the session object a singleton, so that is easier to reset the requests.session
        if not(self.session):
            assert self.creds is not None, "Service created before authentication?"
            jwt=self.creds["access_token"]
            self.session = requests.Session()
            self.session.headers.update({"Authorization": f"Bearer {jwt}"})
        return self.session
    
    def logoutSession(self):
        # TODO all the open services with request.sessions need to be closed and reopened.
        self.creds = None
        self.session = None
    
    def loadcreds(self):
        if os.path.exists(self.pfile):
            with open(self.pfile, "rb") as inf:
                return pickle.load(inf)
                
            
        return None
        
