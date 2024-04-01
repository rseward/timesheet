#!/usr/bin/env python

import unittest
import requests

baseurl="http://127.0.0.1:8000/api"

class TestFastApi(unittest.TestCase):
    
        def testGetClients(self):
            print(requests.get(f"{baseurl}/clients/").json())

        def testGetClientById(self):
            print(requests.get(f"{baseurl}/clients/1").json())
                        
        #@unittest.SkipTest
        def testPostClient(self):
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
            
            print(requests.post(f"{baseurl}/clients/", json=client).json())
            
                        

if __name__ == "__main__":
            unittest.main()
            