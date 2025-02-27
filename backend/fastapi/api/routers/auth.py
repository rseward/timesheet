import datetime
import logging
import jwt
from fastapi import FastAPI, APIRouter, Depends, HTTPException, status, Request
import api.schemas.authmodels
import api.depends.daofactory

from bluestone.timesheet.data.daos import DaoFactory, getDaoFactory
from bluestone.timesheet.data.models import UserToken
from bluestone.timesheet.auth.utils import verify_password, create_access_token, create_refresh_token
from bluestone.timesheet.auth.auth_bearer import decodeJWTRefresh, decodeJWT, JWTBearer, JWT_SECRET_KEY_ALGORITHMS, REFRESH_TOKEN_EXPIRE_MINUTES

logger = logging.getLogger("main")

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
        logger.info(f"User with username={creds.username} does not exist.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST ,
            detail="Username/Password does not match."
        )
    
    hashed_pass = dbrec.password
    
    if not verify_password(creds.password, hashed_pass):
        logger.info(f"User with username={creds.username} password does not match.")
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
def logout(request: Request, dependecies=Depends(JWTBearer())):
    daos: DaoFactory = getDaoFactory()
    
    logger.info(f"{request.headers}")
    payload = None
    try:
        token=request.headers['Authorization'].split(" ")[1]
        logger.info(token)
        payload = decodeJWT(token)
    except:
        pass
    
    if not(payload):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid token"
        )
    user_id = payload['sub']
    tokenDao = daos.getUserTokenDao()
    token_records = tokenDao.getByUserId(user_id)
    expiredtokens=[]
    for trecord in token_records:
        print(f"trecord={trecord}")
        tzinfo = trecord.create_date.tzinfo
        if (datetime.datetime.now(tzinfo)  - trecord.create_date).days >1:
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
    
router.get(
    "/userinfo",
    response_model=dict[str,str]
)
def userinfo(dependecies=Depends(JWTBearer())):
    """End point to verify credentials are still valid."""
    
    daos: DaoFactory = getDaoFactory()
    token=dependecies
    payload = jwt.decode(token, algorithms=JWT_SECRET_KEY_ALGORITHMS)
    user_id = payload('sub')
    userDao = DaoFactory.getUserDao()
    user = userDao.getById(user_id)
    
    return { "user": userDao.toJson(user) }

router.get(
    "/refresh",
    response_model=dict[str,str]
)
def refresh(refreshtoken: str): # , dependecies=Depends(JWTBearer())):
    daos: DaoFactory = getDaoFactory()
    
    user = None
    payload = decodeJWTRefresh(refreshtoken)
    user_id = payload['sub']
    
    userDao = daos.getUserDao()
    user = userDao.getById(user_id)
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid refresh token."
        )
        
    tokenDao = daos.getUserTokenDao()
    token_records = tokenDao.getByUserIdAndRefresh(user.user_id, refreshtoken)
    valid=False
    for trecord in token_records:
        print(f"trecord={trecord}")
        create_date = trecord.create_date
        tzinfo = create_date.tzinfo
        if (datetime.datetime.now(tzinfo)  - trecord.create_date).days * (60*24) <= REFRESH_TOKEN_EXPIRE_MINUTES:
            valid=True

    if not(valid):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Expired or invalid refresh token."
        )
        
    access=create_access_token(user.user_id)
    refresh=create_refresh_token(user.user_id)
    
    tokenDao = daos.getUserTokenDao()
    tokenRec = UserToken(user_id=user.user_id, access_token=access, refresh_token=refresh, active=True, create_date = datetime.datetime.now(datetime.UTC) )
    tokenDao.save(tokenRec)
    tokenDao.commit()
    
    result = api.schemas.authmodels.TokenSchema(
        access_token=access, 
        refresh_token=refresh
        )
    
    return result
    