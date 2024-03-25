# coding: utf-8
from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()
metadata = Base.metadata

class Assignment(Base):
    __tablename__ = 'assignments'

    proj_id = Column(Integer, primary_key=True, nullable=False)
    username = Column(String(32), primary_key=True, nullable=False)

class BillingEvent(Base):
    __tablename__ = 'billing_event'

    uid = Column(String(32), primary_key=True)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    trans_num = Column(Integer, nullable=False)
    proj_id = Column(Integer, nullable=False)
    task_id = Column(Integer, nullable=False)
    log_message = Column(String(255))

class Client(Base):
    __tablename__ = 'client'

    client_id = Column(Integer, primary_key=True)
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
    __tablename__ = 'project'

    proj_id = Column(Integer, primary_key=True)
    title = Column(String(200), nullable=False)
    client_id = Column(Integer, nullable=False)
    description = Column(String(256))
    start_date = Column(Date, nullable=False)
    deadline = Column(Date, nullable=False)
    http_link = Column(String(128))
    proj_status = Column(Enum('pending', 'started', 'suspended'), nullable=False)
    proj_leader = Column(String(32))


class Task(Base):
    __tablename__ = 'task'

    task_id = Column(Integer, primary_key=True)
    proj_id = Column(Integer, nullable=False)
    name = Column(String(128), nullable=False)
    description = Column(Text)
    assigned = Column(DateTime, nullable=False)
    started = Column(DateTime, nullable=False)
    suspended = Column(DateTime, nullable=False)
    completed = Column(DateTime, nullable=False)
    status = Column(Enum('pending', 'assigned', 'started', 'suspended', 'complete'), nullable=False)

