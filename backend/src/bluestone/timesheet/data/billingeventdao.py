import sqlalchemy
import bluestone.timesheet.config as cfg
from bluestone.timesheet.data.models import Base, BillingEvent, Project, Task
from bluestone.timesheet.jsonmodels import BillingEventJson
import uuid

from .basedao import BaseDao

class BillingEventDao(BaseDao):
    def getAll(self, client_id = None, project_id = None, start_date = None, end_date = None, include_inactive=False):
        q = self.getSession().query(BillingEvent, Project.title, Task.name)
        q = q.filter(BillingEvent.project_id == Project.project_id)
        q = q.filter(BillingEvent.task_id == Task.task_id)
        if client_id is not None:
            q = q.filter(Project.client_id == client_id)
        if project_id is not None:
            q = q.filter(BillingEvent.project_id == project_id)
        if start_date is not None:
            q = q.filter(BillingEvent.start_time >= start_date)
        if end_date is not None:
            q = q.filter(BillingEvent.start_time <= end_date)
        if not include_inactive:
            q = q.filter(BillingEvent.active == True)
        print(q)
        return q.all()
    
    def save(self, dbrec):
        if dbrec.uid is None:
            dbrec.uid = str(uuid.uuid4())
        return super().save(dbrec)
        

    def getById(self, aid: str) -> BillingEvent:
        print(aid)
        q = self.getSession().query(BillingEvent, Project.title, Task.name)
        q = q.filter(BillingEvent.project_id == Project.project_id)
        q = q.filter(BillingEvent.task_id == Task.task_id)
        
        return q.filter(BillingEvent.uid == aid).first()

    def update(self, db: BillingEvent, js: BillingEventJson) -> BillingEvent:
        urec = self.toModel(js, db)

        self.save(urec)

        return urec

    def delete(self, uid: str) -> None:
        assert isinstance(uid, str), "uid must be a string"
        q = self.getSession().query(BillingEvent)
        q = q.filter(BillingEvent.uid == uid)
        dbrec = q.first()
        if dbrec is not None:
            #self.getSession().delete(dbrec)
            dbrec.active = False
            self.save(dbrec)

    def toDict(self, db: BillingEvent) -> dict:
        d = {}
        d["uid"] = db.uid
        d["project_id"] = db.project_id
        d["task_id"] = db.task_id
        d["start_time"] = db.start_time
        d["end_time"] = db.end_time
        d["trans_num"] = db.trans_num
        d["log_message"] = db.log_message
        d["active"] = db.active

        return d

    def toJson(self, db: BillingEvent, project_name: str = None, task_name:str = None) -> BillingEventJson:
        j = BillingEventJson(**self.toDict(db))
        j.uid = db.uid
        j.project_id = db.project_id
        j.task_id = db.task_id
        j.start_time = db.start_time
        j.end_time = db.end_time
        j.trans_num = db.trans_num
        j.log_message = db.log_message
        j.project_name = project_name
        j.task_name = task_name
        j.active = db.active

        return j

    def toModel(self, j: BillingEventJson, db: BillingEvent | None = None) -> BillingEvent:
        if not (db):
            db = BillingEvent()
            db.uid = j.uid

        db.project_id = j.project_id
        db.task_id = j.task_id
        db.start_time = j.start_time
        db.end_time = j.end_time
        db.trans_num = j.trans_num
        db.log_message = j.log_message
        db.active = j.active

        return db
