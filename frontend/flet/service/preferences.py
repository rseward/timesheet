from icecream import ic

import os.path
import requests
import pickle
import datetime
import time
import json

"""
Preferences services.
"""
from .base import BaseService

class PreferencesService(BaseService):
    
    def __init__(self, creds):
        super().__init__(creds)
        self.preferencesurl = f"{self.baseurl}/api/preferences"

    def getUserPreferences(self, user_id):
        """Get all preferences for a user"""
        res = self.getSession().get(f"{self.preferencesurl}/user/{user_id}")
        preferences = {}
        if res.status_code == 200:
            print(res.json())
            preferences = res.json()["preferences"]
        else:
            ic(f"Error getting preferences: {res.status_code}")
            ic(res.text)
                    
        ic(preferences)
        return preferences

    def getUserPreferencesWithDefaults(self, user_id):
        """Get user preferences with defaults applied"""
        res = self.getSession().get(f"{self.preferencesurl}/user/{user_id}/defaults")
        preferences = {}
        if res.status_code == 200:
            print(res.json())
            preferences = res.json()["preferences"]
        else:
            ic(f"Error getting preferences with defaults: {res.status_code}")
            ic(res.text)
                    
        ic(preferences)
        return preferences

    def getUserPreference(self, user_id, preference_key):
        """Get a specific preference for a user"""
        res = self.getSession().get(f"{self.preferencesurl}/user/{user_id}/{preference_key}")
        preference = None
        if res.status_code == 200:
            print(res.json())
            result = res.json()
            preference = {
                "key": result["preference_key"],
                "value": result["preference_value"]
            }
        elif res.status_code == 404:
            # Preference not found, return None
            preference = None
        else:
            ic(f"Error getting preference: {res.status_code}")
            ic(res.text)
                    
        ic(preference)
        return preference

    def setUserPreference(self, user_id, preference_key, preference_value):
        """Set a single preference for a user"""
        posturl = f"{self.preferencesurl}/user/{user_id}"
        
        data = {
            "preference_key": preference_key,
            "preference_value": preference_value
        }
        
        ic(data)
        res = self.getSession().post(posturl, json=data)
            
        return res

    def setUserPreferencesBulk(self, user_id, preferences_dict):
        """Set multiple preferences for a user"""
        puturl = f"{self.preferencesurl}/user/{user_id}/bulk"
        
        ic(preferences_dict)
        res = self.getSession().put(puturl, json=preferences_dict)
            
        return res

    def deleteUserPreference(self, user_id, preference_key):
        """Delete a preference for a user"""
        ic(f"deleteUserPreference({user_id}, {preference_key})")
        res = self.getSession().delete(f"{self.preferencesurl}/user/{user_id}/{preference_key}")
        ic(res)

        return res