import sqlalchemy
import bluestone.timesheet.config as cfg
from bluestone.timesheet.data.models import *
from bluestone.timesheet.jsonmodels import *

daofactory=None
def getDaoFactory():
    global daofactory
    
    if not(daofactory):
        daofactory=DaoFactory()
    return daofactory
    

class DaoFactory(object):
    
    def __init__(self):
        self.engine = sqlalchemy.create_engine(cfg.getSqlalchemyUrl(), echo=True)
        from sqlalchemy.orm import sessionmaker
        self.Session = sessionmaker( bind=self.engine )
        Base.metadata.create_all( self.engine )
        
        self.clientDao = None
        
        
    def getClientDao(self):
        if not(self.clientDao):
            self.clientDao = ClientDao(self.Session)
            
        return self.clientDao
        
class BaseDao(object):
    def __init__(self, session):
        self.Session = session
        self.session = self.Session()
            
            
class ClientDao(BaseDao):
    def getAll(self):
        return self.session.query(Client).all()
            
    def getById(self, aid):
        q = self.session.query(Client)
        return q.filter(Client.client_id == aid).first()
            
    def toJson(self, db: Client):
            j = ClientJson()
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
            
            
    
            

        
        
    