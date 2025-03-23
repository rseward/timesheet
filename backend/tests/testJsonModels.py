#!/usr/bin/env python

import unittest
import datetime

from bluestone.timesheet.jsonmodels import (
    UserJson, ClientJson, ProjectJson, TaskJson, ProjectStatusEnum, TaskStatusEnum, AssignmentJson, BillingEventJson
)

class TestJsonModels(unittest.TestCase):
    
    def testClient1(self):
        c = ClientJson(
            client_id=0, organisation="Bluestone", description="Open Source Software Integrator", address1="100 Main St.", address2="Suite 100", city="Ann Arbor",
            state="MI", country="US", postal_code="48108", contact_first_name="Rob", contact_last_name="Seward", username="rseward", 
            contact_email="rseward@bluestone-consulting.com", phone_number="734.726.0000", fax_number="734.726.0001", 
            http_url="www.bluestone-consutling.com"
            )
        print(c)
        
    def testProject1(self):
        p = ProjectJson(
            project_id=0, title="OpenSource Timesheet project", client_id=0, description="Learning exercise to integrate fastapi, pydantic and vue.js", 
            start_date=datetime.datetime(2024,4,1),
            http_link="github url goes here", proj_status=ProjectStatusEnum.pending, proj_leader="rseward"
        )
        print(p)
        
    def testTask1(self):
        t = TaskJson(
            task_id=0, project_id=0, name="Integrate pydantic", description="Build pydantic models to enforce data validation rules.", assigned= datetime.datetime(2024,4,2,0,0,1),
            status=TaskStatusEnum.pending
        )
        print(t)
        
    def testAssignment(self):
        a = AssignmentJson(
            proj_id=0, username="rseward"
        )
        print(a)
        
    def testBillingEvent(self):
        be = BillingEventJson(
            uid="123456789",start_time=datetime.datetime(2024,4,1,0,0,1),end_time=datetime.datetime(2024,4,1,0,8,1),
            trans_num=1, project_id=1, task_id=1, log_message="Work on timesheet project."
        )
        print(be)
        
    def testUser(self):
        j = UserJson(
            user_id=0,
            email='rseward@bluestone-consulting.com',
            name='Rob Seward',
            password="thepassword"
        )
        print(j)
    
    
if __name__ == "__main__":
            unittest.main()