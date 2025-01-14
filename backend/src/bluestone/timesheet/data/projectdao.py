import sqlalchemy
import bluestone.timesheet.config as cfg
from bluestone.timesheet.data.models import Base, Project, Client
from bluestone.timesheet.jsonmodels import ProjectJson

from .basedao import BaseDao

class ProjectDao(BaseDao):
    def getAll(self, include_inactive=False):
        q = self.getSession().query(Project, Client.organisation)
        q = q.filter( Project.client_id == Client.client_id)
        if not include_inactive:
            q = q.filter(Project.active == True)
        q = q.filter(Client.active == True)
        
        return q.all()

    def getById(self, aid) -> Project:
        q = self.getSession().query(Project, Client.organisation)
        q = q.filter( Project.client_id == Client.client_id)    
        return q.filter(Project.project_id == aid).first()

    def _getById(self, aid) -> Project:
        q = self.getSession().query(Project)
        return q.filter(Project.project_id == aid).first()


    def getByClientId(self, aid) -> Project:
        q = self.getSession().query(Project, Client.organisation)
        q = q.filter( Project.client_id == Client.client_id)
        q = q.filter(Project.active == True)
        return q.filter(Project.client_id == aid).all()

    def update(self, db: Project, js: ProjectJson) -> Project:
        urec = self.toModel(js, db)

        self.save(urec)

        return urec

    def delete(self, project_id: int) -> None:
        dbrec = self._getById(project_id)
        if dbrec is not None:
            #self.getSession().delete(dbrec)
            dbrec.active = False
            self.save(dbrec)

    def toDict(self, db: Project) -> dict:
        d = {}
        d["project_id"] = db.project_id
        d["title"] = db.title
        d["client_id"] = db.client_id
        d["description"] = db.description
        d["start_date"] = db.start_date
        d["deadline"] = db.deadline
        d["http_link"] = db.http_link
        d["proj_status"] = db.proj_status
        d["proj_leader"] = db.proj_leader
        d["active"] = db.active

        return d

    def toJson(self, db: Project, client_name: str) -> ProjectJson:
        j = ProjectJson(**self.toDict(db))
        j.project_id = db.project_id
        j.title = db.title
        j.client_id = db.client_id
        j.description = db.description
        j.start_date = db.start_date
        j.deadline = db.deadline
        j.http_link = db.http_link
        j.proj_status = db.proj_status
        j.proj_leader = db.proj_leader
        j.client_name = client_name
        j.active = db.active

        return j

    def toModel(self, j: ProjectJson, db: Project | None = None) -> Project:
        if not (db):
            db = Project()
            db.project_id = j.project_id

        db.title = j.title
        db.client_id = j.client_id
        db.description = j.description
        db.start_date = j.start_date
        db.deadline = j.deadline
        db.http_link = j.http_link
        db.proj_status = j.proj_status
        db.proj_leader = j.proj_leader
        db.active = j.active

        return db
