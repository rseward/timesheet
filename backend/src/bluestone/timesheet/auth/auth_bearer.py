# pip install pyjwt
import jwt
import logging
from jwt.exceptions import InvalidTokenError
from fastapi import HTTPException, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials


logger = logging.getLogger("main")

# TODO: refactor this into a environment vars or a different location
ACCESS_TOKEN_EXPIRE_MINUTES = 30  # 30 minutes
REFRESH_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 7 days
JWT_SECRET_KEY_ALGORITHMS = "HS256"
JWT_SECRET_KEY = "9a1gBPmYvQJ%j85DjPps|0XovfUEe6s@ntvg5:rtN891"   # should be kept secret
JWT_REFRESH_SECRET_KEY = "Yvl7juxbwe8qSCaV6h6@#$%^@&gu5YwCi78h8StYmWWQFRN"

def decodeJWT(jwtoken: str):
    try:
        # Decode and verify the token
        payload = jwt.decode(jwtoken, JWT_SECRET_KEY, JWT_SECRET_KEY_ALGORITHMS)
        return payload
    except InvalidTokenError:
        return None

def decodeJWTRefresh(jwtrefresh: str):
    try:
        # Decode and verify the token
        payload = jwt.decode(jwtrefresh, JWT_REFRESH_SECRET_KEY, JWT_SECRET_KEY_ALGORITHMS)
        return payload
    except InvalidTokenError:
        return None


class JWTBearer(HTTPBearer):
    def __init__(self, auto_error: bool = True):
        super(JWTBearer, self).__init__(auto_error=auto_error)

    async def __call__(self, request: Request):
        credentials: HTTPAuthorizationCredentials = await super(JWTBearer, self).__call__(request)
        if credentials:
            if not credentials.scheme == "Bearer":
                raise HTTPException(status_code=403, detail="Invalid authentication scheme.")
            if not self.verify_jwt(credentials.credentials):
                raise HTTPException(status_code=403, detail="Invalid token or expired token.")
            return credentials.credentials
        else:
            raise HTTPException(status_code=403, detail="Invalid authorization code.")

    def verify_jwt(self, jwtoken: str) -> bool:
        isTokenValid: bool = False

        try:
            payload = decodeJWT(jwtoken)
        except:
            payload = None
        if payload:
            isTokenValid = True
        logger.info(f"verify_jwt()={isTokenValid}")
        return isTokenValid

jwt_bearer = JWTBearer()
