from cachetools.func import ttl_cache
#from bluestone.timesheet.data.daos import getDaoFactory

class BaseDao(object):
    def __init__(self, session):
        self.Session = session
        self.session = self.Session()
    
    @ttl_cache(ttl=10)
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
        
    def refresh(self, dbrec):
        self.getSession().refresh(dbrec)
        
        return dbrec
    
    def delete(self, dbrec):
        self.getSession().delete(dbrec)

    def flush(self):
        self.getSession().flush()
