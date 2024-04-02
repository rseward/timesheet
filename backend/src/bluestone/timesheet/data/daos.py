import sqlalchemy
import bluestone.timesheet.config as cfg
from bluestone.timesheet.data.models import Base, Client
from bluestone.timesheet.jsonmodels import ClientJson

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

    def getClientDao(self):
        if not (self.clientDao):
            self.clientDao = ClientDao(self.Session)

        return self.clientDao


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


class ClientDao(BaseDao):
    def getAll(self):
        return self.session.query(Client).all()

    def getById(self, aid) -> Client:
        q = self.session.query(Client)
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
