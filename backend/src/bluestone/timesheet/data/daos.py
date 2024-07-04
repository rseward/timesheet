import sqlalchemy
import bluestone.timesheet.config as cfg
from bluestone.timesheet.data.models import Base, Client, User
from bluestone.timesheet.jsonmodels import ClientJson, UserJson

daofactory = None

from .tokendao import UserTokenDao

def getDaoFactcory():
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

    def getClientDao(self):
        if not (self.clientDao):
            self.clientDao = ClientDao(self.Session)

        return self.clientDao
    
    def getUserDao(self):
        if not (self.userDao):
            self.userDao = UserDao(self.Session)
            
        return self.userDao
    
    def getUserTokenDao(self):
        if not (self.tokenDao):
            self.userTokenDao = UserTokenDao(self.Session)
            
        return self.userTokenDao



class BaseDao(object):
    def __init__(self, session):
        self.Session = session
        self.session = self.Session()

    def getSession(self):
        if not (self.session):
            self.session = self.Session()
        return self.session

    def save(self, dataobj, merge=False):
        session = self.getSession()

        obj = dataobj
        if merge and dataobj not in session:
            obj = session.merge(dataobj)

        session.add(obj)
        return obj

    def commit(self, flush=False):
        if flush:
            self.getSession().flush()
        self.getSession().commit()

    def rollback(self):
        self.getSession().rollback()


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
        
        

class ClientDao(BaseDao):
    def getAll(self):
        return self.getSession().query(Client).all()

    def getById(self, aid) -> Client:
        q = self.getSession().query(Client)
        return q.filter(Client.client_id == aid).first()

    def update(self, db: Client, js: ClientJson) -> Client:
        urec = self.toModel(js, db)

        self.save(urec)

        return urec

    def delete(self, client_id: int) -> None:
        dbrec = self.getById(client_id)
        if dbrec is not None:
            self.getSession().delete(dbrec)

    def toDict(self, db: Client) -> dict:
        d = {}
        d["client_id"] = db.client_id
        d["organisation"] = db.organisation
        d["description"] = db.description
        d["address1"] = db.address1
        d["address2"] = db.address2
        d["city"] = db.city
        d["state"] = db.state
        d["country"] = db.country
        d["postal_code"] = db.postal_code
        d["contact_first_name"] = db.contact_first_name
        d["contact_last_name"] = db.contact_last_name
        d["username"] = db.username
        d["contact_email"] = db.contact_email
        d["phone_number"] = db.phone_number
        d["fax_number"] = db.fax_number
        d["gsm_number"] = db.gsm_number
        d["http_url"] = db.http_url

        return d

    def toJson(self, db: Client) -> ClientJson:
        j = ClientJson(**self.toDict(db))
        j.client_id = db.client_id
        j.organisation = db.organisation
        j.description = db.description
        j.address1 = db.address1
        j.address2 = db.address2
        j.city = db.city
        j.state = db.state
        j.country = db.country
        j.postal_code = db.postal_code
        j.contact_first_name = db.contact_first_name
        j.contact_last_name = db.contact_last_name
        j.username = db.username
        j.contact_email = db.contact_email
        j.phone_number = db.phone_number
        j.fax_number = db.fax_number
        j.gsm_number = db.gsm_number
        j.http_url = db.http_url

        return j

    def toModel(self, j: ClientJson, db: Client | None = None) -> Client:
        if not (db):
            db = Client()
            db.client_id = j.client_id

        db.organisation = j.organisation
        db.description = j.description
        db.address1 = j.address1
        db.address2 = j.address2
        db.city = j.city
        db.state = j.state
        db.country = j.country
        db.postal_code = j.postal_code
        db.contact_first_name = j.contact_first_name
        db.contact_last_name = j.contact_last_name
        db.username = j.username
        db.contact_email = j.contact_email
        db.phone_number = j.phone_number
        db.fax_number = j.fax_number
        db.gsm_number = j.gsm_number
        db.http_url = j.http_url

        return db
