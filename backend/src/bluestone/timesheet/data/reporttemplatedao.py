from bluestone.timesheet.data.models import ReportTemplate
from .basedao import BaseDao


class ReportTemplateDao(BaseDao):
    def getAll(self, report_type=None, include_inactive=False):
        q = self.getSession().query(ReportTemplate)
        if not include_inactive:
            q = q.filter(ReportTemplate.active)
        if report_type is not None:
            q = q.filter(ReportTemplate.report_type == report_type)
        return q.order_by(ReportTemplate.name).all()

    def getById(self, template_id) -> ReportTemplate:
        q = self.getSession().query(ReportTemplate)
        return q.filter(ReportTemplate.template_id == template_id).first()

    def delete(self, template_id: int) -> None:
        dbrec = self.getById(template_id)
        if dbrec is not None:
            self.getSession().delete(dbrec)
            self.commit()

    def toDict(self, db: ReportTemplate) -> dict:
        d = {}
        d["template_id"] = db.template_id
        d["name"] = db.name
        d["description"] = db.description
        d["report_type"] = db.report_type
        d["filename"] = db.filename
        d["created_by"] = db.created_by
        d["created_at"] = db.created_at.isoformat() if db.created_at else None
        d["active"] = db.active
        return d