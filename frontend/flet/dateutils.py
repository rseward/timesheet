#!/usr/bin/env python

import arrow
import unittest
import datetime
import re
from icecream import ic

"""
Interpret human date expersions like:

last monday
this monday
next monday

begining of month
end of month
"""

def isEmpty(val: str) -> bool:
    empty=False
    
    if val is None:
        empty=True
    if isinstance(val, str) and len(val)==0:
        empty=True
        
    return empty


class DateInterpreter(object):

    def __init__(self):
        self.daynametodayno={"sunday":6,"monday":0,"tuesday":1,"wednesday":2,"thursday":3,
                             "friday":4,"saturday":5}
        self.daynotoname={}
        for day in self.daynametodayno.keys():
            self.daynotoname[self.daynametodayno[day]]=day

        self.bom_syns=["beginning of month", "start of month", "first day of month", "month begin", "month start"]
        self.eom_syns=["end of month", "last day of month", "month end"]
        self.today_syns=["now","today","tomorrow","yesterday"]
        self.datestr_re=re.compile(r"([0-9]{4}-[0-9]{2}-[0-9]{2})")
        pass

    def interpret(self, exp):
        return self.interpretRelativeToDate( exp )


    def interpretRelativeToDate(self, exp: str, date=None) -> arrow.Arrow :
        """Use a combination of a date and a string to give a date interpretation."""
        
        if isEmpty(exp):
            return None
        
        lstr=exp.lower()
        ret = None
        mydate=date
        if mydate is None:
            mydate=arrow.now()

        if isinstance(date, datetime.datetime):
            mydate=arrow.get(date)
            
        # Does it look like a date string?
        m=self.datestr_re.match(exp)
        if m:
            return arrow.get(exp)
        
        # TODO: a more advanced normalization / stemming might be good
        lstr=lstr.replace("the ","") # remove the word 'the'

        dayno=None
        for day in self.daynametodayno.keys():
            if day in lstr:
                dayno=self.daynametodayno[day]

        if dayno is not None:
            if "last" in lstr:
                ret =self.findRelativeDayNo( mydate, "last", dayno)
            if "this" in lstr:
                ret = self.findRelativeDayNo( mydate, "this", dayno)
            if "next" in lstr:
                ret = self.findRelativeDayNo( mydate, "next", dayno)

        if ret is None:
            ret=self.beginOfMonth(lstr, mydate)

        if ret is None:
            ret=self.endOfMonth(lstr, mydate)

        if ret is None:
            ret=self.todayAndVariants(lstr, mydate)
            
        if ret is None:
            # Let arrow have a shot
            print(f"arrow({exp})")
            return mydate.dehumanize(exp)

        return ret
        

    def beginOfMonth(self, exp, mydate=None):
        if mydate is None:
            mydate = arrow.now()
        for bom in self.bom_syns:
            #ic(bom)
            if bom in exp:
                bomdate=datetime.datetime(mydate.year, mydate.month, 1);
                return bomdate
        return None

    def endOfMonth(self, exp, mydate=None):
        if mydate is None:
            mydate = arrow.now()
        findeom=False
        for eom in self.eom_syns:
            if eom in exp:
                findeom=True
                break

        if findeom:
            day=28
            eomdate=arrow.get(mydate.year, mydate.month, day);
            while not(eomdate._is_last_day_of_month(eomdate)):
                day+=1
                eomdate=arrow.get(mydate.year, mydate.month, day);
                
            return eomdate
        return None

    def todayAndVariants(self, exp, mydate=None):
        ic(f"todayAndVariants({exp})")
        if mydate is None:
            mydate = arrow.now()
        foundsyn=False
        for syn in self.today_syns:
            if syn in exp:
                foundsyn=True
                break

        if foundsyn:
            if "now" in exp:
                return mydate
            if "today" in exp:
                # trunc time portion?
                return mydate
            if "tomorrow" in exp:
                ic("tomorrow")
                return mydate + datetime.timedelta(days=1)
            if "yesterday" in exp:
                ic("yesterday")                
                return mydate - datetime.timedelta(days=1)
        return None

    def findRelativeDayNo(self, mydate, modstr, dayno):
        tdayno=mydate.weekday()        
        print(f"dayno={dayno} tdayno={tdayno} modstr={modstr}")
        if tdayno == dayno:
            # move forward or backward a full week. If it is Monday, the human must mean
            #  the Monday before today.
            if modstr == "last":
                return mydate.dehumanize("7 days ago")
            if modstr == "next":
                return mydate.dehumanize("in 7 days")
            if modstr == "this":
                return mydate;

        # Calculate the next occurence of the day
        daydiff=None

        if modstr == "next":
            # Let's assume next implies next week.
            thissunday = self.findRelativeDayNo(mydate, "this", 6)
            print(f"thissunday={thissunday}")
            return self.findRelativeDayNo(thissunday, "this", dayno)
        
        if modstr == "this":
            if dayno<tdayno:
                daydiff=7-tdayno+dayno
            else:
                daydiff=dayno-tdayno
            return mydate.dehumanize(f"in {daydiff} days")
        
        if modstr == "last":
            if dayno<tdayno:
                daydiff=8 # 7-tdayno-dayno-1
            else:
                daydiff=7-dayno-tdayno
            arrow=f"{daydiff} days ago"
            print(arrow)
            return mydate.dehumanize(arrow)

                
        return None
        


