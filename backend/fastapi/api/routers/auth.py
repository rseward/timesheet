import datetime

import jwt
from fastapi import FastAPI, APIRouter, Depends, HTTPException, status
import api.schemas.authmodels
import api.depends.daofactory

from bluestone.timesheet.data.daos import DaoFactory, getDaoFactory
from bluestone.timesheet.data.models import UserToken
from bluestone.timesheet.auth.utils import verify_password, create_access_token, create_refresh_token
from bluestone.timesheet.auth.auth_bearer import JWTBearer, JWT_SECRET_KEY_ALGORITHMS

"""
User authentication end points.
"""

router = APIRouter(
    prefix="",
    tags=["auth_root"],
    responses={404: {"description": "Not found"}},
)

router.get(
    "/login",
    response_model=api.schemas.authmodels.TokenSchema
)
def login(creds: api.schemas.authmodels.LoginRequest):
    daos: DaoFactory = getDaoFactory()
    userDao = daos.getUserDao()
    dbrec = userDao.getByEmail(creds.username)
    
    if dbrec is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username/Password does not match.")
    hashed_pass = dbrec.password
    
    if not verify_password(creds.password, hashed_pass):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username/Password does not match."
        )
    
    access=create_access_token(dbrec.user_id)
    refresh=create_refresh_token(dbrec.user_id)
    
    tokenDao = daos.getUserTokenDao()
    tokenRec = UserToken(user_id=dbrec.user_id, access_token=access, refresh_token=refresh, active=True, create_date = datetime.datetime.now(datetime.UTC) )
    tokenDao.save(tokenRec)
    tokenDao.commit()
    
    result = api.schemas.authmodels.TokenSchema(
        access_token=access, 
        refresh_token=refresh
        )
    
    return result
    
router.get(
    "/logout",
    response_model=dict[str,str]
)
def logout(dependecies=Depends(JWTBearer())):
    daos: DaoFactory = getDaoFactory()
    token=dependecies
    payload = jwt.decode(token, algorithms=JWT_SECRET_KEY_ALGORITHMS)
    user_id = payload('sub')
    tokenDao = daos.getTokenDao()
    token_records = tokenDao.getByUserId(user_id)
    expiredtokens=[]
    for trecord in token_records:
        print(f"trecord={trecord}")
        if (datetime.datetime.now(datetime.UTC)  - trecord.create_date).days >1:
            expiredtokens.append(trecord)
        else:
            # mark non-expired tokens as inactive
            trecord.active = False
            tokenDao.save(trecord)
            
    if len(expiredtokens)>0:
        # delete expired tokens
        for expired in expiredtokens:
            tokenDao.delete(expired)
    tokenDao.commit()
    
    return { "message": "Logout Successful"}
    
    
