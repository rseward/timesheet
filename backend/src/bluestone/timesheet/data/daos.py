import sqlalchemy
import bluestone.timesheet.config as cfg
from bluestone.timesheet.data.models import Base, Client, User
from bluestone.timesheet.jsonmodels import ClientJson, UserJson

from .basedao import BaseDao
from .userdao import UserDao
from .tokendao import UserTokenDao
from .clientdao import ClientDao
from .projectdao import ProjectDao
from .taskdao import TaskDao
from .billingeventdao import BillingEventDao


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
        self.projectDao = None
        self.taskDao = None
        self.eventDao = None

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
    
    def getProjectDao(self):
        if not (self.projectDao):
            self.projectDao = ProjectDao(self.Session)
            
        return self.projectDao
    
    def getTaskDao(self):
        if not (self.taskDao):
            self.taskDao = TaskDao(self.Session)
            
        return self.taskDao

    def getBillingEventDao(self):
        if not (self.eventDao):
            self.eventDao = BillingEventDao(self.Session)
            
        return self.eventDao
        
        

