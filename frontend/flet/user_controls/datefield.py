from icecream import ic
import flet as ft
import re

import arrow
import dateutils
import datetime

class DateTimeField(object):
    def __init__(self, page: ft.Page, fieldname: str, hint: str, val: str, startdate: datetime.datetime=None, enddate: datetime.datetime =None, height: int = 60, width:int = 300):
        self.page = page
        self.name = fieldname
        self.hint = hint
        self._val = val
        self.format = '%Y-%m-%d'
        self.aformat = 'YYYY-MM-DD'
        self.height = height
        self.width = width
        self.dateinterpreter = dateutils.DateInterpreter()
        # TODO: provide a simplified way to pass a relative date like "-2w"
        self.startdate = startdate
        self.enddate = enddate
        
        if isinstance(startdate, str):
            self.startdate=self.dateinterpreter.interpret(startdate)
        if isinstance(enddate, str):
            self.enddate=self.dateinterpreter.interpret(enddate)
        
        ic(f"{startdate} -> {self.startdate}")
        ic(f"{enddate} -> {self.startdate}")
        
        if self.startdate is None:
            self.startdate = self.dateinterpreter.interpret("beginning of month") #datetime.datetime.now() - datetime.timedelta(days=30)
        if self.enddate is None:
            self.enddate = self.dateinterpreter.interpret("end of month") #datetime.datetime.now() + - datetime.timedelta(days=3)
        
        
        self.content = self.build(val)
        
    def build(self,val):
        self.date = DateField(self.page, fieldname=self.name, hint=self.hint, val=val, startdate=self.startdate, enddate=self.enddate, width=self.width*0.65, height=self.height)        
        self.time = TimeField(self.page, fieldname=self.name, val="10:00", width=self.width*0.35, height=self.height)

        self.body = ft.Container(
            ft.Row([
                self.date.content,
                self.time.content
            ])
        )
        
        return self.body
    
    def getValue(self):
        dval = self.date.getValue()
        tval = self.time.getValue()
        ic(f"dval={dval} {type(dval)} tval={tval} {type(tval)}")
        sval = " ".join([dval, tval])
        
        myformat = f"{self.date.format} %H:%M"
        
        return datetime.datetime.strptime(sval, myformat)
    
    def setValue(self, val: str):
        ic(f"setValue({val})")
        dval=val
        if isinstance(dval,str):
            dval = self.dateinterpreter.interpret(dval)
        ic(dval)
        dvalstr=None
        hhmm=None
        if isinstance(dval, datetime.date):
            dvalstr = datetime.datetime.strftime(dval, self.date.format)
            hhmm=datetime.datetime.strftime(dval, "%H:%M")
        if isinstance(dval, arrow.Arrow):
            dvalstr = dval.format( self.date.aformat )
            hhmm=dval.format( "HH:mm" )
            
        ic(dvalstr)
        self.date.setValue(dvalstr)
        
        ic(hhmm)
        self.time.setValue(hhmm)
        
    def update(self):
        self.date.update()
    
    

class TimeField(object):
    def __init__(self, page: ft.Page, fieldname: str, val: str, height: int = 60, width:int = 100):
        self.page = page
        self.name = fieldname
        self._val = val
        self.format = '%H:%M'
        self.aformat = 'HH:mm'
        self.height = height
        self.width = width
        
        self.content = self.build(val)
        
    def build(self, val):
        (hhval,mmval) = val.split(":")

        self.hh = ft.TextField(
            label="HH", 
            hint_text="HH", 
            input_filter=ft.NumbersOnlyInputFilter(), 
            value=hhval, 
            height=self.height, 
            width=self.width*0.5,
            on_change=self.on_change,
            focused_border_color=ft.colors.WHITE
        )
        self.mm = ft.TextField(
            label="MM", 
            hint_text="MM", 
            input_filter=ft.NumbersOnlyInputFilter(),
            value=mmval, 
            keyboard_type=ft.KeyboardType.NUMBER, 
            height=self.height, 
            width=self.width*0.5,
            on_change=self.on_change,
            focused_border_color=ft.colors.WHITE            
            )
        self.body = ft.Container(
            ft.Row([
                self.hh,
                ft.Text(":"),
                self.mm
                ], alignment=ft.MainAxisAlignment.CENTER
            )
        )
        
        return self.body
    
    def on_change(self, e):
        val = e.control.value
        #ic(val)
        valid=True
        
        if len(val)>2:
            e.control.value = val[:2]
            #e.control.tool_tip = e.control.label
            val = val[:2] # adjust for checks below
            valid=False
        
        if len(val)>0:
            if e.control.label == "HH":
                if int(val)>24:
                    e.control.value = 24
                    valid=False
            if e.control.label == "MM":
                if int(val)>59:
                    e.control.value = 59
                    valid=False
        
        if not(valid):
            e.control.bgcolor = ft.colors.AMBER_900
        else:
            e.control.bgcolor = ft.colors.TRANSPARENT
        
        #ic(e.control.value)
        e.control.update()
        
    def setValue(self, val):
        assert ":" in val, "Not in 24H time format!"
        (hhval,mmval) = val.split(":")
        self.hh.value = hhval
        self.mm.value = mmval
        self.hh.update()
        self.mm.update()
        
    def getValue(self):
        # Interpret a single digit hh as hh + 12. E.g "2" as 14
        hh = self.hh.value
        ihh = int(hh)
        if len(hh)==1 and ihh<6:
            hh = 12 + ihh
        else:
            hh = ihh
        
        return f"{hh:02d}:{int(self.mm.value):02d}"

class DateField(object):
    def __init__(self, page: ft.Page, fieldname: str, hint: str, val: str, startdate: datetime.datetime=None, enddate: datetime.datetime =None, height: int = 60, width:int = 300):
        self.page = page
        self.name = fieldname
        self.hint = hint
        self.format = '%Y-%m-%d'
        self.aformat = 'YYYY-MM-DD'
        self.dateinterpreter = dateutils.DateInterpreter()
        self._val = self.interpretDate(val)
        self.height = height
        self.width = width
        self.re = re.compile(r"^[0-9]{4}-[0-9]{2}-[0-9]{2}$")
        
        # suggested date range to narrow a user's choice to
        self.startdate = startdate
        self.enddate = enddate
        
        if isinstance(startdate, str):
            self.startdate=self.dateinterpreter.interpret(startdate)
        if isinstance(enddate, str):
            self.enddate=self.dateinterpreter.interpret(enddate)
        
        ic(f"{startdate} -> {self.startdate}")
        ic(f"{enddate} -> {self.startdate}")
        
        if self.startdate is None:
            self.startdate = self.dateinterpreter.interpret("beginning of month") #datetime.datetime.now() - datetime.timedelta(days=30)
        if self.enddate is None:
            self.enddate = self.dateinterpreter.interpret("end of month") #datetime.datetime.now() + - datetime.timedelta(days=3)
        
        self.content = self.build(self._val)
        
    def update(self):
        self.text.update()
        
    def setValue(self, val: str):
        if val is not None:
            self.text.value = self.interpretDate(val)
        else:
            self.text.value = val
        self.text.update()
        
    def getValue(self):
        # always return a date string?
        if isinstance(self.text.value, arrow.Arrow):
            return self.text.value.format(self.aformat)
            
        return self.text.value
    
    def interpretDate(self, val) -> str:
        if isinstance(val, str):
            dval = self.dateinterpreter.interpret(val)
            if dval is not None:
                return dval.format( self.aformat )
        return val
            
    def build(self, val):
        self.datepicker = ft.DatePicker()
        
        self.text = ft.TextField(
            label=self.hint, 
            hint_text=self.hint, 
            value=val, 
            height=self.height, 
            width=self.width*0.8,
            on_change=self.on_text_change,
            focused_border_color=ft.colors.WHITE            
        )
        self.body = ft.Container(
            ft.Row([
                ft.IconButton(
                    icon=ft.icons.CALENDAR_MONTH_ROUNDED,
                    on_click=self.on_datepick_open,
                    icon_size=self.height*0.5,
                    tooltip="Pick date"
                ),
                self.text
            ])
        )
        return self.body
    
    def on_text_change(self, e):
        val = e.control.value
        valid = True
        
        m = self.re.match(val)
        if not(m):
            ic("YYYY-MM-DD")
            valid=False
            
        if len(val)>9:
            try:
                datetime.datetime.strptime(val, self.format)
            except:
                valid=False
            
        if not(valid):
            e.control.error_text = "YYYY-MM-DD"            
            e.control.bgcolor = ft.colors.AMBER_900
        else:
            e.control.error_text = None
            e.control.bgcolor = ft.colors.TRANSPARENT
            
        self.text.update()
        
    
    def on_datepick_open(self, e):
        val=datetime.datetime.now()
        if len(self.text.value):
            try:
                val=datetime.datetime.strptime(self.text.value, self.format)
            except:
                pass
        self.page.open(
                        ft.DatePicker(
                            first_date=self.startdate,
                            last_date=self.enddate,
                            on_change=self.on_datepick_change,
                            value=val
                        )
        )
        
        
    def on_datepick_change(self, e):
        self.setValue(e.control.value.strftime(self.format))
    
        
    
    