
import enum
from sqlalchemy import Enum
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

# Enum + alembic hints
# https://stackoverflow.com/questions/47206201/how-to-use-enum-with-sqlalchemy-and-alembic

class TimeFormat(enum.Enum):
    tf12 = '12'
    tf24 = '24'

class LdapSearchScope(enum.Enum):
    base = 'base'
    sub = 'sub'
    one = 'one'

class ProjectStatus(enum.Enum):
    pending = 'Pending'
    started = 'Started'
    suspended = 'Suspended'

class TaskStatus(enum.Enum):
    pending = 'Pending'
    assigned = 'Assigned'
    started = 'Started'
    suspended = 'Suspended'
    complete = 'Complete'
    

TimeFormatType: Enum = Enum(
    TimeFormat,
    name="time_format_type",
    create_constraint=True,
    metadata=Base.metadata,
    validate_strings=True
    )

LdapSearchScopeType: enum = Enum(
    LdapSearchScope,
    name="ldap_search_scope_type",
    create_constraint=True,
    metadata=Base.metadata,
    validate_strings=True
    )

ProjectStatusType: enum = Enum(
    ProjectStatus,
    name="project_status_type",
    create_constraint=True,
    metadata=Base.metadata,
    validate_strings=True
    )

TaskStatusType: enum = Enum(
    TaskStatus,
    name="task_type",
    create_constraint=True,
    metadata=Base.metadata,
    validate_strings=True
    )
    

    
