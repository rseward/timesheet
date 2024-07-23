import enum
from sqlalchemy import Column, Date, DateTime, Integer, String, Enum, Text, \
    Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
#from sqlalchemy.ext.declarative import declarative_base
#Base = declarative_base()
from . import Base

# Enum + alembic hints
# https://stackoverflow.com/questions/47206201/how-to-use-enum-with-sqlalchemy-and-alembic


class TimeFormat(enum.Enum):
    tf12 = "12"
    tf24 = "24"


class LdapSearchScope(enum.Enum):
    base = "base"
    sub = "sub"
    one = "one"


class ProjectStatus(enum.Enum):
    pending = "Pending"
    started = "Started"
    suspended = "Suspended"


class TaskStatus(enum.Enum):
    pending = "Pending"
    assigned = "Assigned"
    started = "Started"
    suspended = "Suspended"
    complete = "Complete"


TimeFormatType: Enum = Enum(
    TimeFormat,
    name="time_format_type",
    create_constraint=True,
    metadata=Base.metadata,
    validate_strings=True,
)

LdapSearchScopeType: enum = Enum(
    LdapSearchScope,
    name="ldap_search_scope_type",
    create_constraint=True,
    metadata=Base.metadata,
    validate_strings=True,
)

ProjectStatusType: enum = Enum(
    ProjectStatus,
    name="project_status_type",
    create_constraint=True,
    metadata=Base.metadata,
    validate_strings=True,
)

TaskStatusType: enum = Enum(
    TaskStatus,
    name="task_type",
    create_constraint=True,
    metadata=Base.metadata,
    validate_strings=True,
)


class Assignment(Base):
    __tablename__ = "assignments"

    project_id: Mapped[int] = mapped_column(ForeignKey("project.project_id"), nullable=False)
    username = Column(String(32), primary_key=True, nullable=False)


class BillingEvent(Base):
    __tablename__ = "billing_event"

    uid = Column(String(36), primary_key=True)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    trans_num = Column(Integer, nullable=False)
    project_id: Mapped[int] = mapped_column(ForeignKey("project.project_id"), nullable=False)
    task_id: Mapped[int] = mapped_column(ForeignKey("task.task_id"), nullable=False)
    log_message = Column(String(255))


class Client(Base):
    __tablename__ = "client"

    client_id = Column(Integer, primary_key=True, autoincrement=True)
    organisation = Column(String(64))
    description = Column(String(255))
    address1 = Column(String(128))
    address2 = Column(String(128))
    city = Column(String(60))
    state = Column(String(80))
    country = Column(String(2))
    postal_code = Column(String(13))
    contact_first_name = Column(String(128))
    contact_last_name = Column(String(128))
    username = Column(String(32))
    contact_email = Column(String(128))
    phone_number = Column(String(20))
    fax_number = Column(String(20))
    gsm_number = Column(String(20))
    http_url = Column(String(128))


class Project(Base):
    __tablename__ = "project"

    project_id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(200), nullable=False)
    client_id: Mapped[int] = mapped_column(ForeignKey("client.client_id"), nullable=False)
    description = Column(String(256))
    start_date = Column(Date, nullable=False)
    deadline = Column(Date, nullable=False)
    http_link = Column(String(128))
    proj_status = Column(Enum("Pending", "Started", "Suspended"), nullable=False)
    proj_leader = Column(String(32))


class Task(Base):
    __tablename__ = "task"

    task_id = Column(Integer, primary_key=True, autoincrement=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("project.project_id"), nullable=False)
    name = Column(String(128), nullable=False)
    description = Column(Text)
    assigned = Column(DateTime, nullable=True)
    started = Column(DateTime, nullable=True)
    suspended = Column(DateTime, nullable=True)
    completed = Column(DateTime, nullable=True)
    http_link = Column(String(128))
    status = Column(
        Enum("Pending", "Assigned", "Started", "Suspended", "Complete"), nullable=False
    )

class User(Base):
    __tablename__ = "user"
    
    user_id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String, nullable=False)
    name = Column(String(128), nullable=False)
    password = Column(String(64), nullable=False)
    
"""
Table to store JWT tokens associated with user accounts.
"""
class UserToken(Base):
    __tablename__ = "user_token"
    
    user_token_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.user_id")) 
    access_token = Column(String(450), index=True)
    refresh_token = Column(String(450), nullable=True)
    active = Column(Boolean)
    create_date = Column(DateTime, nullable=False)
    
    