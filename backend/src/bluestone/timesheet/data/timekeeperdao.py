from bluestone.timesheet.data.models import Timekeeper
from bluestone.timesheet.jsonmodels import TimekeeperJson

from .basedao import BaseDao


class TimekeeperDao(BaseDao):
    def getAll(self, include_inactive=False):
        # Timekeeper table doesn't have an 'active' column, so return all
        q = self.getSession().query(Timekeeper)
        return q.all()

    def getById(self, aid) -> Timekeeper:
        q = self.getSession().query(Timekeeper)
        return q.filter(Timekeeper.timekeeper_id == aid).first()

    def toDict(self, db: Timekeeper) -> dict:
        d = {}
        d["timekeeper_id"] = db.timekeeper_id
        d["username"] = db.username
        d["first_name"] = db.first_name
        d["last_name"] = db.last_name
        d["email"] = db.email
        d["bill_rate"] = db.bill_rate
        d["phone"] = db.phone
        return d

    def toJson(self, db: Timekeeper) -> TimekeeperJson:
        j = TimekeeperJson(**self.toDict(db))
        j.timekeeper_id = db.timekeeper_id
        j.username = db.username
        j.first_name = db.first_name
        j.last_name = db.last_name
        j.email = db.email
        j.bill_rate = db.bill_rate
        j.phone = db.phone
        return j

    def toModel(self, j: TimekeeperJson, db: Timekeeper | None = None) -> Timekeeper:
        if not db:
            db = Timekeeper()
            db.timekeeper_id = j.timekeeper_id

        db.username = j.username
        db.first_name = j.first_name
        db.last_name = j.last_name
        db.email = j.email
        db.bill_rate = j.bill_rate
        db.phone = j.phone
        return db