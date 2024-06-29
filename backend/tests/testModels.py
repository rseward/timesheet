#!/usr/bin/env python3

import sqlalchemy
import unittest
import bluestone.timesheet.config as cfg
from bluestone.timesheet.data.models import *

class testModels(unittest.TestCase):
    def setUp(self):
        print( "SQLAlchemy version = %s" % sqlalchemy.__version__ )
                    
        self.engine = sqlalchemy.create_engine(cfg.getSqlalchemyUrl(), echo=True)
        from sqlalchemy.orm import sessionmaker
        self.Session = sessionmaker( bind=self.engine )
        Base.metadata.create_all( self.engine )


    #@unittest.skip("Focus rob, focus")
    def testModels(self):
        session = self.Session()

        models = [
                Assignment,
                BillingEvent,
                Client,
                Project,
                Task,
                User
        ]
                

        if True:
            for model in models:
                print( session.query(model).first() )

            print( "Found %s models!" % len(models) )
                                                                                                    
    

if __name__ == "__main__":
    unittest.main()
    
