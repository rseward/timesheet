#!/usr/bin/env python3

import sqlalchemy
import unittest
import datetime
import bluestone.timesheet.config as cfg
from bluestone.timesheet.data.models import *
from bluestone.timesheet.data.daos import getDaoFactory


class testModels(unittest.TestCase):
    def setUp(self):
        print("SQLAlchemy version = %s" % sqlalchemy.__version__)
        self.daos = getDaoFactory()

        # Create a test client
        clientdao = self.daos.getClientDao()
        self.client = Client()
        self.client.organisation = "BillingEvent Test Org"
        self.client.description = "Billing event DAO test client"
        self.client.address1 = "1 Test St."
        self.client.city = "Ann Arbor"
        self.client.state = "MI"
        self.client.country = "US"
        self.client.postal_code = "48104"
        self.client.contact_first_name = "Test"
        self.client.contact_last_name = "User"
        self.client.username = "betestuser"
        self.client.contact_email = "betest@example.com"
        self.client.phone_number = "555-555-5555"
        self.client.active = True
        clientdao.save(self.client)
        clientdao.commit()
        clientdao.refresh(self.client)

        # Create a test project
        projectdao = self.daos.getProjectDao()
        self.project = Project()
        self.project.title = "BillingEvent Test Project"
        self.project.client_id = self.client.client_id
        self.project.description = "Billing event DAO test project"
        self.project.start_date = datetime.date(2024, 1, 1)
        self.project.deadline = datetime.date(2025, 12, 31)
        self.project.http_link = "http://example.com"
        self.project.proj_status = "Pending"
        self.project.proj_leader = "betestuser"
        self.project.active = True
        projectdao.save(self.project)
        projectdao.commit()
        projectdao.refresh(self.project)

        # Create a test task
        taskdao = self.daos.getTaskDao()
        self.task = Task()
        self.task.project_id = self.project.project_id
        self.task.name = "BillingEvent Test Task"
        self.task.description = "Billing event DAO test task"
        self.task.status = "Pending"
        self.task.active = True
        taskdao.save(self.task)
        taskdao.commit()
        taskdao.refresh(self.task)

        # Create a test billing event (using timekeeper_id=1 seeded by migration)
        eventdao = self.daos.getBillingEventDao()
        self.event = BillingEvent()
        self.event.start_time = datetime.datetime(2024, 4, 1, 9, 0, 0)
        self.event.end_time = datetime.datetime(2024, 4, 1, 10, 0, 0)
        self.event.trans_num = 1
        self.event.project_id = self.project.project_id
        self.event.task_id = self.task.task_id
        self.event.timekeeper_id = 1
        self.event.log_message = "Test billing event"
        self.event.active = True
        eventdao.save(self.event)
        eventdao.commit()

    def tearDown(self):
        session = self.daos.getBillingEventDao().getSession()

        ev = session.query(BillingEvent).filter(BillingEvent.uid == self.event.uid).first()
        if ev:
            session.delete(ev)
            session.commit()

        task = session.query(Task).filter(Task.task_id == self.task.task_id).first()
        if task:
            session.delete(task)
            session.commit()

        project = session.query(Project).filter(Project.project_id == self.project.project_id).first()
        if project:
            session.delete(project)
            session.commit()

        client = session.query(Client).filter(Client.client_id == self.client.client_id).first()
        if client:
            session.delete(client)
            session.commit()

    def testBillingEventDao(self):
        eventdao = self.daos.getBillingEventDao()

        events = eventdao.getAll()
        print(f"Found {len(events)} billing events")
        for (event, project_name, task_name) in events:
            jrow = eventdao.toJson(event, project_name, task_name)
            print(jrow)

        result = eventdao.getById(self.event.uid)
        self.assertIsNotNone(result)
        (event, project_name, task_name) = result
        self.assertEqual(event.uid, self.event.uid)
        self.assertEqual(event.log_message, "Test billing event")

    def testNextTransNum(self):
        eventdao = self.daos.getBillingEventDao()
        nextid = eventdao.nextTransNum(
            timekeeper_id=1,
            project_id=self.project.project_id,
            task_id=self.task.task_id,
        )
        print(f"{nextid=}")
        self.assertTrue(nextid > 0)


if __name__ == "__main__":
    unittest.main()
