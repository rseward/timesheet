#!/usr/bin/env python

import unittest
import os

from sqlalchemy import create_engine, text

class testSqlalchemySqlite(unittest.TestCase):

    def testSqlalchemy(self):
        url = os.getenv( "TIMESHEET_SA_URL" )
        print( url )
        e = create_engine( url )
        c = e.connect()

        rows = c.execute( text( "SELECT 1" ) )
        for row in rows:
            print(row)

        c.execute( text( "CREATE TABLE foo ( a number);" ) )

        rows = c.execute( text( "SELECT COUNT(1) FROM foo" ) )
        for row in rows:
            print(row)
        
                          
if __name__ == "__main__":
    unittest.main()
