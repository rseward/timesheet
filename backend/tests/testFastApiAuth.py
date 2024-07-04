#!/usr/bin/env python

import unittest
import requests

baseurl="http://127.0.0.1:8000"

class TestFastApi(unittest.TestCase):
    
        #@unittest.SkipTest
        def testLoginSuccess(self):
            params = {
                "username": "rseward@bluestone-consulting.com",
                "password": "thepassword"
            }
            res = requests.get(f"{baseurl}/login", params=params)
            self.assertTrue(res.status_code == 200, f"FastAPI returned unexpected error. {res}")
            rjson = res.json()
            self.assertTrue(rjson is not None,f"Invalid json in the response! {res.content}")
            print( res )
            self.assertTrue("access_token" in rjson.keys(),f"Unable to obtain expected token {rjson}")


                        

if __name__ == "__main__":
            unittest.main()
            