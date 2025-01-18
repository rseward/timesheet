import flet as ft

import os.path
import requests
import pickle
import datetime
from icecream import ic

from .base import BaseService, baseurl

"""
Authentication services.
"""

#baseurl="http://{127.0.0.1:8000}"
PFILE="user-creds.pickle"


def loadcreds():
    if os.path.exists(PFILE):
        with open(PFILE, "rb") as inf:
            return pickle.load(inf)
        
def is_authenticated(page: ft.Page):
    # See if we might still have valid credentials
    if page.session.get("creds"):
        return True
    
    creds = loadcreds()
    if creds is None:
        return False
    utcnow = datetime.datetime.now(datetime.UTC)
    lastauth = creds.get("authenticated_utc", None)
    if lastauth is not None:
        elapsed=(utcnow-lastauth).seconds
        print(f"is_authenticated={elapsed}")
        if elapsed < (30*60):
            page.session.set("creds", creds)
            return True

    if page.session.contains_key("creds"):
        page.session.remove("creds")
    return False
    

def login(page: ft.Page, username: str, password: str, rememberme: bool):
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
        page.session.set("creds", creds)
        
        return True
    
    return False

class AuthService(BaseService):
    
    def refresh(self, page: ft.Page):
        
        if is_authenticated(page) == False:
            ic("not logged in")
            return False

        oldcreds = page.session.get("creds")
        params = {
            "refreshtoken": oldcreds.get("refresh_token")
        }
        res = self.getSession().get(f"{self.baseurl}/refresh", params=params)
        
        if res.status_code == 200:
            # save the tokens for use on subsequent requests
            creds=res.json()
            print(f"{creds}")
            
            if oldcreds.get("username", None):
                creds["username"]=oldcreds.get("username")
                
            creds["authenticated_utc"]=datetime.datetime.now(datetime.UTC)
            with open(PFILE, "wb") as outf:
                pickle.dump(creds, outf)
            page.session.set("creds", creds)
            self.logoutSession()
            
            ic("refresh success")
            return True
        
        ic("refresh failed")
        return False


    def logout(self, page: ft.Page):
        res = self.getSession().get(f"{self.baseurl}/logout")
        ic(res) 
        serverLogoutSuccess=False
        if res.status_code == 200:
            serverLogoutSucess=True    
            
        page.session.remove("creds")
        os.system("rm -f {PFILE}")        
        page.go("/login")
        
        if serverLogoutSuccess:
            return (True, 200, "success")
        else:
            ic(res.content)
            return (False, res.status_code, res.content)
        