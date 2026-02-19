from bluestone.timesheet.data.models import Holiday
from bluestone.timesheet.jsonmodels import HolidayJson

from .basedao import BaseDao

class HolidayDao(BaseDao):
    def getAll(self, include_inactive=False, client_id=None, year=None):
        q = self.getSession().query(Holiday)
        if not include_inactive:
            q = q.filter(Holiday.active)
        if client_id is not None:
            q = q.filter(Holiday.client_id == client_id)
        if year is not None:
            from sqlalchemy import extract
            q = q.filter(extract('year', Holiday.holiday_date) == year)
        return q.all()

    def getById(self, holiday_id) -> Holiday:
        q = self.getSession().query(Holiday)
        return q.filter(Holiday.holiday_id == holiday_id).first()

    def getByClientAndDate(self, client_id, date) -> Holiday:
        q = self.getSession().query(Holiday)
        return q.filter(Holiday.client_id == client_id, Holiday.holiday_date == date).first()

    def getHolidaysForDateRange(self, start_date, end_date, client_id):
        q = self.getSession().query(Holiday)
        q = q.filter(Holiday.active)
        q = q.filter(Holiday.holiday_date >= start_date, Holiday.holiday_date <= end_date)
        q = q.filter(Holiday.client_id == client_id)
        return q.all()

    def getFederalHolidays(self, year=None, include_inactive=False):
        q = self.getSession().query(Holiday)
        q = q.filter(Holiday.client_id == 0)
        if not include_inactive:
            q = q.filter(Holiday.active)
        if year is not None:
            from sqlalchemy import extract
            q = q.filter(extract('year', Holiday.holiday_date) == year)
        return q.all()

    def update(self, db: Holiday, js: HolidayJson) -> Holiday:
        urec = self.toModel(js, db)
        self.save(urec)
        return urec

    def delete(self, holiday_id: int) -> None:
        dbrec = self.getById(holiday_id)
        if dbrec is not None:
            dbrec.active = False
            self.save(dbrec)

    def toDict(self, db: Holiday) -> dict:
        d = {}
        d["holiday_id"] = db.holiday_id
        d["client_id"] = db.client_id
        d["holiday_date"] = db.holiday_date.isoformat() if db.holiday_date else None
        d["name"] = db.name
        d["description"] = db.description
        d["is_federal"] = db.is_federal
        d["active"] = db.active
        return d

    def toJson(self, db: Holiday) -> HolidayJson:
        j = HolidayJson(**self.toDict(db))
        j.holiday_id = db.holiday_id
        j.client_id = db.client_id
        j.holiday_date = db.holiday_date
        j.name = db.name
        j.description = db.description
        j.is_federal = db.is_federal
        j.active = db.active
        return j

    def toModel(self, j: HolidayJson, db: Holiday | None = None) -> Holiday:
        if not (db):
            db = Holiday()
            db.holiday_id = j.holiday_id

        db.client_id = j.client_id
        db.holiday_date = j.holiday_date
        db.name = j.name
        db.description = j.description
        db.is_federal = j.is_federal
        db.active = j.active

        return db

    def checkDateIsHoliday(self, client_id, date):
        q = self.getSession().query(Holiday)
        q = q.filter(Holiday.active)
        q = q.filter(Holiday.holiday_date == date)
        
        from sqlalchemy import or_
        q = q.filter(or_(Holiday.client_id == client_id, Holiday.client_id == 0))
        
        return q.first()
