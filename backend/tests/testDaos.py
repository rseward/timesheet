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
        
if __name__ == "__main__":
    unittest.main()