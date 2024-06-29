#!/usr/bin/env python

import unittest
import requests

baseurl="http://127.0.0.1:8000/api"

class TestFastApi(unittest.TestCase):
    
        #@unittest.SkipTest
        def testGetClients(self):
            res = requests.get(f"{baseurl}/clients/").json()
            print( res )
            self.assertTrue("clients" in res.keys(),"Unable to pull list of clients")

        #@unittest.SkipTest
        def testGetClientById(self):
            res = requests.get(f"{baseurl}/clients/1").json()
            print( res )            
            self.assertTrue("client" in res.keys(),"Unable to find client_id=1")
            
                        
        @unittest.SkipTest
        def testPostClient(self):
            print(f"testPostClient: {baseurl}/clients/")
            client = {
                'client_id': 1,
                'organisation' : 'Bluestone',
                'description': 'Open Source Integrator',
                'address1': '100 Main St.',
                'address2': 'Suite 100',
                'city': 'Ann Arbor',
                'state': 'MI',
                'country': 'USA',
                'postal_code': '48108',
                'contact_first_name': 'Rob',
                'contact_last_name': 'Seward',
                'username': 'rseward',
                'contact_email': 'rseward@bluestone-consulting.com',
                'phone_number': '734.726.0313',
                'http_url': 'www.bluestone-consulting.com'
            }
            
            res=requests.post(f"{baseurl}/clients/", json=client).json()
            print(res)
            self.assertTrue(  "added" in res.keys(), "failed to add client with client_id=1" )
        
        #@unittest.SkipTest    
        def testGetUsers(self):
            res = requests.get(f"{baseurl}/users/").json()
            print( res )
            self.assertTrue("users" in res.keys(),"Unable to pull list of users")

        def testGetUserById(self):
            res = requests.get(f"{baseurl}/users/1").json()
            print( res )            
            self.assertTrue("user" in res.keys(),"Unable to find user_id=1")
            
            
                        

if __name__ == "__main__":
            unittest.main()
            