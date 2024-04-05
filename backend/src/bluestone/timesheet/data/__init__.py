
from sqlalchemy.orm import declarative_base

Base = declarative_base() # model base class

# Following pattern from async PDF

from .models import Assignment
from .models import BillingEvent
from .models import Client
from .models import Project
from .models import Task


