#!/usr/bin/env python

import unittest
import requests

class TestFastApi(unittest.TestCase):
    
        def testGetClients(self):
            print(requests.get("http://127.0.0.1:8000/clients/").json())

        def testGetClientById(self):
            print(requests.get("http://127.0.0.1:8000/clients/1").json())
                        

if __name__ == "__main__":
            unittest.main()
            