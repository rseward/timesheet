
import os.path
import requests
import pickle
import datetime

"""
Authentication services.
"""

baseurl="http://127.0.0.1:8000"
PFILE="user-creds.pickle"


def loadcreds():
    if os.path.exists(PFILE):
        with open(PFILE, "rb") as inf:
            return pickle.load(inf)
        
def is_authenticated():
    # See if we might still have valid credentials
    creds = loadcreds()
    utcnow = datetime.datetime.now(datetime.UTC)
    lastauth = creds.get("authenticated_utc", None)
    if lastauth is not None:
        elapsed=(utcnow-lastauth).seconds
        print(f"is_authenticated={elapsed}")
        if elapsed < (30*60):
            return True
    return False
    

def login(username: str, password: str, rememberme: bool):
    params={
        "username": username,
        "password": password
    }
    
    res = requests.get(f"{baseurl}/login", params=params)
    
    if res.status_code == 200:
        # save the tokens for use on subsequent requests
        creds=res.json()
        print(f"{creds}")
        
        if rememberme:
            creds["username"]=username
            
        creds["authenticated_utc"]=datetime.datetime.now(datetime.UTC)
        with open(PFILE, "wb") as outf:
            pickle.dump(creds, outf)
            
        return True
    
    return False
            
    
    