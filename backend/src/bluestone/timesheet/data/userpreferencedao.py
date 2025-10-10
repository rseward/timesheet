from bluestone.timesheet.data.models import UserPreference
from bluestone.timesheet.jsonmodels import UserPreferenceJson
from cachetools.func import ttl_cache
from typing import List, Optional

from .basedao import BaseDao

class UserPreferenceDao(BaseDao):
    def getAll(self) -> List[UserPreference]:
        q = self.getSession().query(UserPreference)
        return q.all()
    
    def getByUserId(self, user_id: int) -> List[UserPreference]:
        """Get all preferences for a specific user"""
        q = self.getSession().query(UserPreference)
        return q.filter(UserPreference.user_id == user_id).all()
    
    def getByUserIdAndKey(self, user_id: int, preference_key: str) -> Optional[UserPreference]:
        """Get a specific preference for a user"""
        q = self.getSession().query(UserPreference)
        return q.filter(UserPreference.user_id == user_id, 
                       UserPreference.preference_key == preference_key).first()
    
    @ttl_cache(ttl=10)
    def getById(self, user_preference_id: int) -> UserPreference:
        q = self.getSession().query(UserPreference)
        return q.filter(UserPreference.user_preference_id == user_preference_id).first()
        
    def update(self, db: UserPreference, js: UserPreferenceJson) -> UserPreference:
        urec = self.toModel(js, db)
        self.save(urec)
        return urec

    def setPreference(self, user_id: int, preference_key: str, preference_value: str) -> UserPreference:
        """Set or update a preference for a user"""
        existing = self.getByUserIdAndKey(user_id, preference_key)
        
        if existing:
            existing.preference_value = preference_value
            self.save(existing)
            return existing
        else:
            new_pref = UserPreference()
            new_pref.user_id = user_id
            new_pref.preference_key = preference_key
            new_pref.preference_value = preference_value
            self.save(new_pref)
            return new_pref

    def deletePreference(self, user_id: int, preference_key: str) -> bool:
        """Delete a specific preference for a user"""
        existing = self.getByUserIdAndKey(user_id, preference_key)
        if existing:
            self.getSession().delete(existing)
            return True
        return False
        
    def toModel(self, j: UserPreferenceJson, db: UserPreference = None) -> UserPreference:
        if not db:
            db = UserPreference()
            db.user_preference_id = j.user_preference_id

        db.user_id = j.user_id
        db.preference_key = j.preference_key
        db.preference_value = j.preference_value
        
        return db
        
    def toDict(self, db: UserPreference) -> dict:
        d = {}
        d["user_preference_id"] = db.user_preference_id
        d["user_id"] = db.user_id
        d["preference_key"] = db.preference_key
        d["preference_value"] = db.preference_value
        
        return d
        
    def toJson(self, db: UserPreference) -> UserPreferenceJson:
        j = UserPreferenceJson(**self.toDict(db))
        return j