#!/usr/bin/env python

import unittest
import datetime

from bluestone.timesheet.jsonmodels import ClientJson, ProjectJson, TaskJson, ProjectStatusEnum, TaskStatusEnum

class TestJsonModels(unittest.TestCase):
    
    def testClient1(self):
        c = ClientJson(
            client_id=0, organisation="Bluestone", description="Open Source Software Integrator", address1="100 Main St.", address2="Suite 100", city="Ann Arbor",
            state="MI", country="US", postal_code="48108", contact_first_name="Rob", contact_last_name="Seward", username="rseward", 
            contact_email="rseward@bluestone-consulting.com", phone_number="734.726.0000", fax_number="734.726.0001", 
            http_url="www.bluestone-consutling.com"
            )
        print(c)
        pass
        
    def testProject1(self):
        p = ProjectJson(
            proj_id=0, title="OpenSource Timesheet project", client_id=0, description="Learning exercise to integrate fastapi, pydantic and vue.js", 
            start_date=datetime.datetime(2024,4,1),
            http_link="github url goes here", proj_status=ProjectStatusEnum.pending, proj_leader="rseward"
        )
        print(p)
        pass
        
    def testTask1(self):
        t = TaskJson(
            task_id=0, proj_id=0, name="Integrate pydantic", description="Build pydantic models to enforce data validation rules.", assigned= datetime.datetime(2024,4,2,0,0,1),
            status=TaskStatusEnum.pending
        )
        print(t)
        pass
        
    
    
if __name__ == "__main__":
            unittest.main()