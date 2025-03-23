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
        

    def testBillingEventDao(self):
        daos = getDaoFactory()
        eventdao = daos.getBillingEventDao()
        
        for row in eventdao.getAll():
            (event, project_name, task_name) = row
            print(row)
            jrow = eventdao.toJson(event, project_name, task_name)
            print(jrow)
            
        event = eventdao.getById("c851bab2-aacd-4bda-a528-03731b7c9945")
        self.assertTrue(event!=None)
        
    def testBillingEventDao(self):
        daos = getDaoFactory()
        eventdao = daos.getBillingEventDao()
        
        for row in eventdao.getAll():
            (event, project_name, task_name) = row
            print(row)
            jrow = eventdao.toJson(event, project_name, task_name)
            print(jrow)
            
        event = eventdao.getById("c851bab2-aacd-4bda-a528-03731b7c9945")
        self.assertTrue(event!=None)

    def testNextTransNum(self):
        daos = getDaoFactory()
        eventdao = daos.getBillingEventDao()
        nextid = eventdao.nextTransNum(timekeeper_id=1, project_id=6, task_id=19)
        print(f"{nextid=}")
        self.assertTrue(nextid>0)
        
        

        
if __name__ == "__main__":
    unittest.main()