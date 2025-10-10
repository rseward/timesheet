from fastapi import FastAPI, APIRouter, Depends, HTTPException
from typing import Dict, List

import pprint
import sqlalchemy
import bluestone.timesheet.config as cfg
from bluestone.timesheet.data.models import *
from bluestone.timesheet.jsonmodels import *
from bluestone.timesheet.auth.auth_bearer import JWTBearer, JWT_SECRET_KEY_ALGORITHMS

from bluestone.timesheet.data.daos import getDaoFactory
from api.depends.auth import validate_is_authenticated

daos = getDaoFactory()

router = APIRouter(
    prefix="/api/preferences",
    tags=["preferences"],
    responses={404: {"description": "Not found"}},
)

@router.get(
    "/user/{user_id}",
    response_model=dict[str, dict[str, str]],
    dependencies=[Depends(JWTBearer())],    
)
def get_user_preferences(user_id: int) -> dict[str, dict[str, str]]:
    """Get all preferences for a specific user"""
    userPrefDao = daos.getUserPreferenceDao()
    preferences = userPrefDao.getByUserId(user_id)
    
    # Convert to dictionary format for easier frontend consumption
    pref_dict = {}
    for pref in preferences:
        pref_dict[pref.preference_key] = pref.preference_value
    
    return {"preferences": pref_dict}

@router.get(
    "/user/{user_id}/{preference_key}",
    response_model=dict[str, str],
    dependencies=[Depends(JWTBearer())],    
)
def get_user_preference(user_id: int, preference_key: str) -> dict[str, str]:
    """Get a specific preference for a user"""
    userPrefDao = daos.getUserPreferenceDao()
    preference = userPrefDao.getByUserIdAndKey(user_id, preference_key)
    
    if not preference:
        raise HTTPException(status_code=404, detail=f"Preference '{preference_key}' not found for user {user_id}")
    
    return {"preference_key": preference.preference_key, "preference_value": preference.preference_value}

@router.post(
    "/user/{user_id}",
    response_model=dict[str, UserPreferenceJson],
    dependencies=[Depends(JWTBearer())],    
)
def set_user_preference(user_id: int, preference_data: Dict[str, str]) -> dict[str, UserPreferenceJson]:
    """Set or update a preference for a user. Expects JSON like: {"preference_key": "start_time", "preference_value": "09:00"}"""
    userPrefDao = daos.getUserPreferenceDao()
    
    preference_key = preference_data.get("preference_key")
    preference_value = preference_data.get("preference_value")
    
    if not preference_key:
        raise HTTPException(status_code=400, detail="preference_key is required")
    
    try:
        db_pref = userPrefDao.setPreference(user_id, preference_key, preference_value)
        userPrefDao.commit()
        
        return {"preference": userPrefDao.toJson(db_pref)}
    except Exception as e:
        userPrefDao.rollback()
        raise HTTPException(status_code=400, detail=f"Error setting preference: {str(e)}")

@router.put(
    "/user/{user_id}/bulk",
    response_model=dict[str, List[UserPreferenceJson]],
    dependencies=[Depends(JWTBearer())],    
)
def set_user_preferences_bulk(user_id: int, preferences: Dict[str, str]) -> dict[str, List[UserPreferenceJson]]:
    """Set multiple preferences for a user at once. Expects JSON like: {"start_time": "09:00", "end_time": "17:00"}"""
    userPrefDao = daos.getUserPreferenceDao()
    
    try:
        updated_prefs = []
        for key, value in preferences.items():
            db_pref = userPrefDao.setPreference(user_id, key, value)
            updated_prefs.append(userPrefDao.toJson(db_pref))
        
        userPrefDao.commit()
        
        return {"preferences": updated_prefs}
    except Exception as e:
        userPrefDao.rollback()
        raise HTTPException(status_code=400, detail=f"Error setting preferences: {str(e)}")

@router.delete(
    "/user/{user_id}/{preference_key}",
    response_model=dict[str, str],
    dependencies=[Depends(JWTBearer())],    
)
def delete_user_preference(user_id: int, preference_key: str) -> dict[str, str]:
    """Delete a specific preference for a user"""
    userPrefDao = daos.getUserPreferenceDao()
    
    try:
        success = userPrefDao.deletePreference(user_id, preference_key)
        if not success:
            raise HTTPException(status_code=404, detail=f"Preference '{preference_key}' not found for user {user_id}")
        
        userPrefDao.commit()
        return {"message": f"Preference '{preference_key}' deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        userPrefDao.rollback()
        raise HTTPException(status_code=400, detail=f"Error deleting preference: {str(e)}")

@router.get(
    "/user/{user_id}/defaults",
    response_model=dict[str, dict[str, str]],
    dependencies=[Depends(JWTBearer())],    
)
def get_user_preferences_with_defaults(user_id: int) -> dict[str, dict[str, str]]:
    """Get user preferences with default values for start_time and end_time if not set"""
    userPrefDao = daos.getUserPreferenceDao()
    preferences = userPrefDao.getByUserId(user_id)
    
    # Convert to dictionary
    pref_dict = {}
    for pref in preferences:
        pref_dict[pref.preference_key] = pref.preference_value
    
    # Set defaults if not present
    if "start_time" not in pref_dict:
        pref_dict["start_time"] = "09:00"
    if "end_time" not in pref_dict:
        pref_dict["end_time"] = "17:00"
    
    return {"preferences": pref_dict}