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
    pending = "pending"
    started = "started"
    suspended = "suspended"
    complete = "complete"


class AssignmentJson(BaseModel):
    proj_id: int
    username: constr(max_length=32)


class BillingEventJson(BaseModel):
    uid: constr(max_length=32)
    start_time: datetime.datetime
    end_time: datetime.datetime
    trans_num: int
    proj_id: int
    task_id: int
    log_message: constr(max_length=255)


class ClientJson(BaseModel):
    client_id: int
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


class ProjectJson(BaseModel):
    proj_id: int
    title: constr(max_length=200)
    client_id: int
    description: constr(max_length=256)
    start_date: datetime.date
    deadline: Optional[datetime.datetime] = None
    http_link: constr(max_length=128)
    proj_status: ProjectStatusEnum
    proj_leader: constr(max_length=32)


class TaskJson(BaseModel):
    task_id: int
    proj_id: int
    name: constr(max_length=128)
    description: Optional[str] = None
    assigned: Optional[datetime.datetime] = None
    started: Optional[datetime.datetime] = None
    suspended: Optional[datetime.datetime] = None
    completed: Optional[datetime.datetime] = None
    status: TaskStatusEnum

class UserJson(BaseModel):
    user_id: int
    email: constr(max_length=128)
    name: str
    password: constr(max_length=64)

class UserTokenJson(BaseModel):
    user_token_id: int
    user_id: int
    access_token: constr(max_length=450)
    refresh_token: constr(max_length=450)
    active: Optional[bool] = True
    create_date: Optional[datetime.datetime] = None
