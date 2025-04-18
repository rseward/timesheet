from bluestone.timesheet.data.models import User, UserToken
from bluestone.timesheet.jsonmodels import UserTokenJson

from .basedao import BaseDao

class UserTokenDao(BaseDao):
    def getAll(self):
        return self.getSession().query(UserToken).all()
        
    def getById(self, id) -> UserToken:
        q = self.getSession().query(UserToken)
        return q.filter(UserToken.user_token_id == id).first()

    def getByUserId(self, user_id: int):
        q = self.getSession().query(UserToken)
        q = q.filter(UserToken.user_id == user_id)
        return q.all()
    
    def getByUserIdAndRefresh(self, user_id: int, refreshtoken: str):
        q = self.getSession().query(UserToken)
        q = q.filter(UserToken.user_id == user_id)
        q = q.filter(UserToken.refresh_token == refreshtoken)
        return q.all()
        
    def update(self, db: UserToken, js: UserTokenJson) -> User:
        urec = self.toModel(js, db)

        self.save(urec)
        return urec
    
    def toModel(self, j: UserTokenJson, db: UserToken):
        if not (db):
            db = UserToken()
            db.user_token_id = j.user_token_id

        db.user_id = j.user_id
        db.access_token = j.access_token
        db.refresh_token = j.refresh_token
        db.active = j.active
        db.create_date = j.create_date

        
    def toDict(self, db: User) -> dict:
        d = {}
        d["user_token_id"] = db.user_token_id
        d["user_id"] = db.user_id
        d["access_token"] = db.access_token
        d["refresh_token"] = db.refresh_token
        d["active"] = db.active
        d["create_date"] = db.create_date
        
        return d
        
        
    def toJson(self, db: UserToken) -> UserTokenJson:
        j = UserTokenJson(**self.toDict(db))
        j.user_token_id = db.user_token_id
        j.user_id = db.user_id
        j.access_token = db.access_token
        j.refresh_token = db.refresh_token
        j.active = db.active
        j.create_date = db.create_date
        
        return j
