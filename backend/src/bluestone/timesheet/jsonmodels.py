from pydantic import BaseModel
from typing import Optional  # , List
from enum import Enum
import datetime
from pydantic import constr

"""
These are the project pydantic models, they are meant to enforce input validations and constraints. Also to handle marshalling the data
to and from JSON to be sent to browser. Currently the project has one set of pydantic models, but in the future it might add other sets to 
enforce different constraints for other contexts.

The project also has a set of SQLAlchemy models focused on marshalling model data to and from the database.

 The project is structured this way to allow each set of models to perform their primary purposes to the best of their capability. 

"""

class ProjectStatusEnum(str, Enum):
    pending = "Pending"
    started = "Started"
    suspended = "Suspended"


class TaskStatusEnum(str, Enum):
    pending = "Pending"
    started = "Started"
    suspended = "Suspended"
    complete = "Complete"


class AssignmentJson(BaseModel):
    project_id: int = None
    username: constr(max_length=32)


class BillingEventJson(BaseModel):
    uid: Optional[constr(max_length=36)] = None
    start_time: datetime.datetime
    end_time: datetime.datetime
    trans_num: Optional[int] = None
    project_id: int
    task_id: int
    log_message: constr(max_length=255)
    project_name: Optional[str] = None
    task_name: Optional[str] = None    
    active: Optional[bool] = True
    timekeeper_id: int


class ClientJson(BaseModel):
    client_id: Optional[int] = None
    organisation: str
    description: Optional[str]
    address1: str
    address2: Optional[str] = None
    city: str
    state: str
    country: str
    postal_code: str
    contact_first_name: str
    contact_last_name: str
    username: str
    contact_email: str
    phone_number: str
    fax_number: Optional[str] = None
    gsm_number: Optional[str] = None
    http_url: Optional[str] = None
    active: Optional[bool] = True


class ProjectJson(BaseModel):
    project_id: Optional[int] = None
    title: constr(max_length=200)
    client_id: int
    description: constr(max_length=256)
    start_date: datetime.date
    deadline: Optional[datetime.datetime] = None
    http_link: constr(max_length=128)
    proj_status: ProjectStatusEnum
    proj_leader: constr(max_length=32)
    client_name: Optional[str] = None
    active: Optional[bool] = True


class TaskJson(BaseModel):
    task_id:  Optional[int] = None
    project_id: int
    name: constr(max_length=128)
    description: Optional[str] = None
    assigned: Optional[datetime.datetime] = None
    started: Optional[datetime.datetime] = None
    suspended: Optional[datetime.datetime] = None
    completed: Optional[datetime.datetime] = None
    status: TaskStatusEnum
    http_link: Optional[constr(max_length=128)] = None
    project_name: Optional[str] = None
    active: Optional[bool] = True


class UserJson(BaseModel):
    user_id: Optional[int] = None
    email: constr(max_length=128)
    name: str
    password: constr(max_length=64)

class UserTokenJson(BaseModel):
    user_token_id: Optional[int] = None
    user_id: int
    access_token: constr(max_length=450)
    refresh_token: constr(max_length=450)
    active: Optional[bool] = True
    create_date: Optional[datetime.datetime] = None

class UserPreferenceJson(BaseModel):
    user_preference_id: Optional[int] = None
    user_id: int
    preference_key: constr(max_length=64)
    preference_value: Optional[constr(max_length=255)] = None


class HolidayJson(BaseModel):
    holiday_id: Optional[int] = None
    client_id: int
    holiday_date: datetime.date
    name: constr(max_length=128)
    description: Optional[str] = None
    is_federal: Optional[bool] = False
    active: Optional[bool] = True
    client_name: Optional[str] = None


class TimekeeperJson(BaseModel):
    timekeeper_id: Optional[int] = None
    username: constr(max_length=32)
    first_name: constr(max_length=32)
    last_name: constr(max_length=32)
    email: constr(max_length=128)
    bill_rate: Optional[float] = None
    phone: Optional[constr(max_length=32)] = None


class ReportRowJson(BaseModel):
    """A single row in a report result set."""
    client: Optional[str] = None
    resource: str
    date: str
    hours: float
    bill_rate: Optional[float] = None
    task: Optional[str] = None
    project: Optional[str] = None


class ClientPeriodReportRequest(BaseModel):
    start_date: datetime.date
    end_date: datetime.date
    client_id: int
    project_id: Optional[int] = None


class TimekeeperPeriodReportRequest(BaseModel):
    start_date: datetime.date
    end_date: datetime.date
    timekeeper_id: int


class TimePeriodReportRequest(BaseModel):
    start_date: datetime.date
    end_date: datetime.date
