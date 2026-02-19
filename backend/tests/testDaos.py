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

        clientdao = self.daos.getClientDao()
        self.client = Client()
        self.client.organisation = "Test Organisation"
        self.client.description = "DAO test client"
        self.client.address1 = "1 Test St."
        self.client.city = "Ann Arbor"
        self.client.state = "MI"
        self.client.country = "US"
        self.client.postal_code = "48104"
        self.client.contact_first_name = "Test"
        self.client.contact_last_name = "User"
        self.client.username = "testuser"
        self.client.contact_email = "test@example.com"
        self.client.phone_number = "555-555-5555"
        self.client.active = True
        clientdao.save(self.client)
        clientdao.commit()
        clientdao.refresh(self.client)

        userdao = self.daos.getUserDao()
        self.user = User()
        self.user.email = "testdao@example.com"
        self.user.name = "DAO Test User"
        self.user.password = "testpassword"
        self.user.active = True
        userdao.save(self.user)
        userdao.commit()
        userdao.refresh(self.user)

        projectdao = self.daos.getProjectDao()
        self.project = Project()
        self.project.title = "Test Project"
        self.project.client_id = self.client.client_id
        self.project.description = "DAO test project"
        self.project.start_date = datetime.date(2024, 1, 1)
        self.project.deadline = datetime.date(2025, 12, 31)
        self.project.http_link = "http://example.com"
        self.project.proj_status = "Pending"
        self.project.proj_leader = "testuser"
        self.project.active = True
        projectdao.save(self.project)
        projectdao.commit()
        projectdao.refresh(self.project)

        taskdao = self.daos.getTaskDao()
        self.task = Task()
        self.task.project_id = self.project.project_id
        self.task.name = "Test Task"
        self.task.description = "DAO test task"
        self.task.status = "Pending"
        self.task.active = True
        taskdao.save(self.task)
        taskdao.commit()
        taskdao.refresh(self.task)

    def tearDown(self):
        session = self.daos.getTaskDao().getSession()

        task = session.query(Task).filter(Task.task_id == self.task.task_id).first()
        if task:
            session.delete(task)
            session.commit()

        project = session.query(Project).filter(Project.project_id == self.project.project_id).first()
        if project:
            session.delete(project)
            session.commit()

        user = session.query(User).filter(User.user_id == self.user.user_id).first()
        if user:
            session.delete(user)
            session.commit()

        client = session.query(Client).filter(Client.client_id == self.client.client_id).first()
        if client:
            session.delete(client)
            session.commit()

    def testClientDao(self):
        clientdao = self.daos.getClientDao()
        for client in clientdao.getAll():
            print(client)
        client = clientdao.getById(self.client.client_id)
        self.assertTrue(client != None)

    def testUserDao(self):
        userdao = self.daos.getUserDao()
        for user in userdao.getAll():
            print(user)
        user = userdao.getById(self.user.user_id)
        self.assertTrue(user != None)

    def testProjectDao(self):
        projectdao = self.daos.getProjectDao()
        for project in projectdao.getAll():
            print(project)
        project = projectdao.getById(self.project.project_id)
        self.assertTrue(project != None)

    def testTaskDao(self):
        taskdao = self.daos.getTaskDao()
        for task in taskdao.getAll():
            print(task)
        task = taskdao.getById(self.task.task_id)
        self.assertTrue(task != None)

    def testBillingEventDao(self):
        daos = getDaoFactory()
        eventdao = daos.getBillingEventDao()
        events = eventdao.getAll()
        print(f"Found {len(events)} billing events")
        self.assertIsNotNone(events)


if __name__ == "__main__":
    unittest.main()
