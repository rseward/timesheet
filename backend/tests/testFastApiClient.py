#!/usr/bin/env python

import unittest
import requests
import pickle

baseurl="http://127.0.0.1:8000/api"

class TestFastApiClient(unittest.TestCase):
        def setUp(self):
            JWT="weyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MjAzNDg3ODIsInN1YiI6IjEifQ.CwrV8ZkzZZJuTxJFyf7pKaGvYUoaSBDz_LNyzwWvdWc"
            with open("../frontend/flet/user-creds.pickle", "rb") as inf:
                creds=pickle.load(inf)
                JWT=creds["access_token"]
            self.headers = {"Authorization": f"Bearer {JWT}"}
    
        #@unittest.SkipTest
        def testGetClients(self):
            res = requests.get(f"{baseurl}/clients/", headers=self.headers).json()
            print( res )
            self.assertTrue("clients" in res.keys(),"Unable to pull list of clients")

        #@unittest.SkipTest
        def testGetClientById(self):
            res = requests.get(f"{baseurl}/clients/1", headers=self.headers).json()
            print( res )            
            self.assertTrue("client" in res.keys(),"Unable to find client_id=1")
            
                        
        #@unittest.SkipTest
        def testPostClient(self):
            print(f"testPostClient: {baseurl}/clients/")
            client = {
             'client_id': 0,
             'organisation': "BraveSoft",
             'description': "Ann Arbor Database Consultancy",
             'address1': "301 Liberty St.",
             'address2': "",
             'city': "Ann Arbor",
             'state': "MI",
             'country': "USA",
             'postal_code': "48104",
             'contact_first_name': "Tom",
             'contact_last_name': "Wood",
             'username': "twood",
             'contact_email': "",
             'phone_number': "877.734.2780",
             'fax_number': "",
             'gsm_number': "",
             'http_url': "http://bravesoft.com/"
            }            
            res=requests.post(f"{baseurl}/clients/", json=client, headers=self.headers).json()
            print(res)
            self.assertTrue(  "added" in res.keys(), "failed to add client with client_id=0" )
        
        @unittest.SkipTest
        def testPutClient(self):
            print(f"testPutClient: {baseurl}/clients/")
            client = {
                'client_id': None,
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
            res=requests.put(f"{baseurl}/clients/", json=client, headers=self.headers).json()
            print(res)
            self.assertTrue(  "updated" in res.keys(), "failed to add client with client_id=1" )
            
                                    

if __name__ == "__main__":
            unittest.main()
