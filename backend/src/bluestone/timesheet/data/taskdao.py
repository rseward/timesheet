from bluestone.timesheet.data.models import Task, Project
from bluestone.timesheet.jsonmodels import TaskJson

from .basedao import BaseDao

class TaskDao(BaseDao):
    def getAll(self, client_id = None, project_id=None, include_inactive=False):
        q = self.getSession().query(Task, Project.title)
        if client_id is not None:
            q = q.filter( Project.client_id == client_id)        
        q = q.filter( Task.project_id == Project.project_id)
        if project_id is not None:
            q = q.filter(Task.project_id == project_id)
        q = q.filter(Project.active)
        if not include_inactive:
            q = q.filter(Task.active)
        return q.all()

    def getById(self, aid) -> Task:
        q = self.getSession().query(Task, Project.title)
        q = q.filter( Task.project_id == Project.project_id)
        return q.filter(Task.task_id == aid).first()

    def _getById(self, aid) -> Task:
        q = self.getSession().query(Task)
        q = q.filter( Task.project_id == Project.project_id)
        return q.filter(Task.task_id == aid).first()


    def update(self, db: Task, js: TaskJson) -> Task:
        urec = self.toModel(js, db)

        self.save(urec)

        return urec

    def delete(self, project_id: int) -> None:
        dbrec = self._getById(project_id)
        if dbrec is not None:
            #self.getSession().delete(dbrec)
            dbrec.active = False
            self.save(dbrec)

    def toDict(self, db: Task) -> dict:
        d = {}
        d["task_id"] = db.task_id
        d["project_id"] = db.project_id
        d["name"] = db.name
        d["description"] = db.description
        d["assigned"] = db.assigned
        d["started"] = db.started
        d["suspended"] = db.suspended
        d["completed"] = db.completed
        d["status"] = db.status
        d["http_link"] = db.http_link
        d["active"] = db.active

        return d

    def toJson(self, db: Task, project_name: str = None) -> TaskJson:
        j = TaskJson(**self.toDict(db))
        j.task_id = db.task_id
        j.project_id = db.project_id
        j.name = db.name
        j.description = db.description
        j.description = db.description
        j.assigned = db.assigned
        j.started = db.started
        j.suspended = db.suspended
        j.completed = db.completed
        j.status = db.status
        j.http_link = db.http_link
        j.project_name = project_name
        j.active = db.active

        return j

    def toModel(self, j: TaskJson, db: Task | None = None) -> Task:
        if not (db):
            db = Task()
            db.task_id = j.task_id

        db.project_id = j.project_id
        db.name = j.name
        db.description = j.description
        db.assigned = j.assigned
        db.started = j.started
        db.suspended = j.suspended
        db.completed = j.completed
        db.status = j.status
        db.http_link = j.http_link
        db.active = j.active

        return db
