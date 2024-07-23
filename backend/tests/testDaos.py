#!/usr/bin/env python3

import sqlalchemy
import unittest
import bluestone.timesheet.config as cfg
from bluestone.timesheet.data.models import *
from bluestone.timesheet.data.daos import getDaoFactory

class testModels(unittest.TestCase):
    def setUp(self):
        print( "SQLAlchemy version = %s" % sqlalchemy.__version__ )
        """            
        self.engine = sqlalchemy.create_engine(cfg.getSqlalchemyUrl(), echo=True)
        from sqlalchemy.orm import sessionmaker
        self.Session = sessionmaker( bind=self.engine )
        Base.metadata.create_all( self.engine )
        """
        
    def testClientDao(self):
        daos = getDaoFactory()
        clientdao = daos.getClientDao()
        
        for client in clientdao.getAll():
            print(client)
            
        client = clientdao.getById(1)
        self.assertTrue(client!=None)
        
    def testUserDao(self):
        daos = getDaoFactory()
        userdao = daos.getUserDao()
        
        for user in userdao.getAll():
            print(user)
            
        user = userdao.getById(1)
        self.assertTrue(user!=None)
        
    def testProjectDao(self):
        daos = getDaoFactory()
        projectdao = daos.getProjectDao()
        
        for project in projectdao.getAll():
            print(project)
            
        project = projectdao.getById(1)
        self.assertTrue(project!=None)

    def testTaskDao(self):
        daos = getDaoFactory()
        taskdao = daos.getTaskDao()
        
        for task in taskdao.getAll():
            print(task)
            
        task = taskdao.getById(1)
        self.assertTrue(task!=None)

    def testBillingEventDao(self):
        daos = getDaoFactory()
        eventdao = daos.getBillingEventDao()
        
        for event in eventdao.getAll():
            print(event)
            
        event = eventdao.getById("c851bab2-aacd-4bda-a528-03731b7c9945")
        self.assertTrue(event!=None)

        
if __name__ == "__main__":
    unittest.main()