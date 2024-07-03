#!/usr/bin/env python

import unittest

from bluestone.timesheet.auth.utils import get_hashed_password

class TestAuth(unittest.TestCase):
    
    def testHashPassword(self):
        password = "thepassword"
        hashed = get_hashed_password(password)
        
        print( f"{password} -> {hashed}")
        
        
if __name__ == "__main__":
    unittest.main()
    