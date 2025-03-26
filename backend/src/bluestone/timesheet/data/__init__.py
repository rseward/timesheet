
from sqlalchemy.orm import declarative_base

# Following pattern from async PDF

Base = declarative_base() # model base class

from .models import Assignment
from .models import BillingEvent
from .models import Client
from .models import Project
from .models import Task
from .models import User
from .models import UserToken
from .models import Timekeeper



