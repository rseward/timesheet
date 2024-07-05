import sqlalchemy
import bluestone.timesheet.config as cfg
from bluestone.timesheet.data.models import Base, Client, User
from bluestone.timesheet.jsonmodels import ClientJson, UserJson

from .basedao import BaseDao
from .tokendao import UserTokenDao
from .clientdao import ClientDao

daofactory = None
def getDaoFactory():
    global daofactory

    if not (daofactory):
        daofactory = DaoFactory()
    return daofactory


class DaoFactory(object):
    def __init__(self):
        self.engine = sqlalchemy.create_engine(cfg.getSqlalchemyUrl(), echo=True)
        from sqlalchemy.orm import sessionmaker

        self.Session = sessionmaker(bind=self.engine)
        Base.metadata.create_all(self.engine)

        self.clientDao = None
        self.userDao = None
        self.userTokenDao = None

    def getClientDao(self):
        if not (self.clientDao):
            self.clientDao = ClientDao(self.Session)

        return self.clientDao
    
    def getUserDao(self):
        if not (self.userDao):
            self.userDao = UserDao(self.Session)
            
        return self.userDao
    
    def getUserTokenDao(self):
        if not (self.userTokenDao):
            self.userTokenDao = UserTokenDao(self.Session)
            
        return self.userTokenDao



class UserDao(BaseDao):
    def getAll(self):
        return self.getSession().query(User).all()
    
    def getByEmail(self, email) -> User:
        q = self.getSession().query(User)
        return q.filter(User.email == email.lower()).first()
    
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
        
        

