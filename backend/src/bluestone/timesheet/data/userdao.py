import sqlalchemy
import bluestone.timesheet.config as cfg
from bluestone.timesheet.data.models import Base, User
from bluestone.timesheet.jsonmodels import UserJson
from cachetools.func import ttl_cache

from .basedao import BaseDao

class UserDao(BaseDao):
    def getAll(self):
        return self.getSession().query(User).all()
    
    def getByEmail(self, email) -> User:
        q = self.getSession().query(User)
        return q.filter(User.email == email.lower()).first()
    
    @ttl_cache(ttl=10)
    def getById(self, id) -> User:
        q = self.getSession().query(User)
        return q.filter(User.user_id == id).first()
        
    def update(self, db: User, js: UserJson) -> User:
        urec = self.toModel(js, db)

        self.save(urec)
        return urec
    
    def toModel(self, j: UserJson, db: User):
        if not (db):
            db = User()
            db.user_id = j.user_id

        db.email = j.email
        db.name = j.name
        db.password = j.password
        db.name = j.name
        
    def toDict(self, db: User) -> dict:
        d = {}
        d["user_id"] = db.user_id
        d["email"] = db.email
        d["name"] = db.name
        d["password"] = db.password
        
        return d
        
        
    def toJson(self, db: User) -> UserJson:
        j = UserJson(**self.toDict(db))
        #j.user_id = db.user_id
        #j.email = db.email
        #j.name = db.name
        
        return j
