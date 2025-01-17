import datetime
import flet as ft
from icecream import ic
from .base_view import BaseView, TsCard, TsInputField, TsButton, TsNotification, TsModalDialog
from user_controls.datefield import DateTimeField, DateField
import arrow

from utils import isEmpty
import dateutils
import service.billingevent
import service.client
import time

class HoursView(BaseView):
    def __init__(self, page):
        super().__init__(page, self.on_form_hide)
        self.page = page
        self.mytitle="Hours"
        self.tabdata=[]
        self.content=self.build()
        self.forminput = None
        self.dirty = False
        self.clientdrop = None
        self.projectdrop = None
        self.startdate = None
        self.enddate = None
        self.dateinterpreter = dateutils.DateInterpreter()
        
    def getdatetime(self, dval):
        if isinstance(dval, str):
            return arrow.get(dval)
        return dval
                
    def colheader(self, text):
        return ft.DataColumn(
                ft.Container(
                    ft.Text(text,
                         weight="w700",
                        text_align="center"
                    ),
                    bgcolor=ft.colors.BLUE_900,
                    padding=15
                )
            )
        
    def buildtable(self, rows):
                    
        tab = ft.DataTable(
            bgcolor=ft.colors.BLUE_800,
            border_radius=10,
            heading_row_color=ft.colors.BLUE_900,            
            columns=[
                self.colheader("Project"),
                self.colheader("Task"),
                self.colheader("Number"),
                self.colheader("Hours"),
                self.colheader("Start Time"),
                self.colheader("End Time"),
                self.colheader("Description"),
                self.colheader("Edit")
            ],
            rows=rows
        )
        return tab
    
    
    def reloadtable(self, rows):
        self.table.rows = rows
        self.table.update()
        
    def on_clientdrop_change(self, e):
        rows = self._loaddata()
        self.tabdata = self.renderrows(rows)
        self.reloadtable(self.tabdata)
        
        self._loadprojects(e.control.value)
        
    def on_clientdrop_focus(self, e):
        #ic()
        if len(self.clientdrop.options)<1:
            self.progress(True)
            try:
                self._loadclients()
            finally:
                self.progress(False)

    def on_projectdrop_change(self, e):
        self.refresh(e)
        #self.loadandrenderrows()
        #self.reloadtable(self.tabdata)
        
    def refresh(self, e):
        ic("let's go! refresh!")
        self.loadandrenderrows()
        self.reloadtable(self.tabdata)          
        self.page.update()
            
    def build(self):
        ic(f"build! {len(self.tabdata)}")
        self.forminput = self.EditForm(self)
        self.form = self.forminput.show(self.page)
        self.clientdrop = ft.Dropdown(
                label="client",
                hint_text="Select client",
                width=400,
                bgcolor=ft.colors.GREY_700,
                focused_border_color=ft.colors.WHITE,
                options=[],
                on_change=self.on_clientdrop_change,
                on_focus=self.on_clientdrop_focus,
                autofocus=True
            )
        self.projectdrop = ft.Dropdown(
                label="project",
                hint_text="Select project",
                width=400,
                bgcolor=ft.colors.GREY_700,
                focused_border_color=ft.colors.WHITE,                
                options=[],
                on_change=self.on_projectdrop_change
            )
        start_date="2023-01-01"
        self.startdate = DateField(
                        self.page,
                        "start_date",
                        hint="start_date",
                        val="last monday",
                        startdate=start_date,
                        on_change=self.refresh
        )
        self.enddate = DateField(
                        self.page,
                        "end_date",
                        hint="end_date",
                        val="next friday",
                        startdate=start_date,
                        on_change=self.refresh
        )
        self.table = self.buildtable([])

        body = ft.Column(
            [
            ft.Row([
            ft.IconButton( icon=ft.icons.ADD_CIRCLE_ROUNDED, on_click=self.addBillingEvent ),
            ft.IconButton( icon=ft.icons.REFRESH_ROUNDED , on_click=self.refresh ),            
            self.clientdrop,
            self.projectdrop,
            self.startdate.content,
            self.enddate.content
            ]),
            ft.Stack([
            self.table,
            self.form
            ]
            )
            ]
        )
        
        #self.reloadtable(self.tabdata)
        
        return body
    
    def renderrows(self, rows):
        renderedrows=[]
        if rows is not None:
            for row in rows:
                renderedrow=[
                        ft.DataCell(ft.Text(row["project_name"])),
                        ft.DataCell(ft.Text(row["task_name"])),
                        ft.DataCell(ft.Text(row["trans_num"])),
                        ft.DataCell(ft.Text(row["hours"])),
                        ft.DataCell(ft.Text(row["start_time"])),
                        ft.DataCell(ft.Text(row["end_time"])),
                        ft.DataCell(ft.Text(row["log_message"])),
                        ft.DataCell(
                            ft.Row([
                            ft.IconButton(icon=ft.icons.EDIT_ROUNDED, data=row["uid"], on_click=self.edit),
                            ft.IconButton(icon=ft.icons.DELETE_ROUNDED, data=row["uid"], on_click=self.delete)
                            ] )
                        )
                ]
                renderedrows.append(ft.DataRow(cells=renderedrow))
        
        return renderedrows
    
    
    def loadandrenderrows(self):
        rows = self._loaddata()
        
        showerror=False
        # Handle an error
        if rows is None:
            # TODO: perhaps we bubble up the API exception to provide better end user info
            showerror=True
            rows=[]
            
        self.tabdata = self.renderrows(rows)
        
        if showerror:
            self.page.overlay.append( 
                ft.SnackBar(
                    ft.Text('Failed to load data'),
                        duration=8000,
                        bgcolor="red",
                        open=True
                    )
                )
        self.page.update()
                
        return showerror
        
        
    def render(self):
        ic("render")
        #if self.content is None:
        self.content=self.build()        
        showerror = self.loadandrenderrows()
        
        self.page.update()
        
    
    def _loaddata(self):
        self.progress(True)
        
        client_id = None
        project_id = None
        startdate = None
        enddate = None
        if self.clientdrop is not None:
            client_id = self.clientdrop.value
        if self.projectdrop is not None:
            project_id = self.projectdrop.value
        if self.startdate is not None:
            startdate = self.startdate.getValue()
        if self.enddate is not None:
            enddate = self.enddate.getValue()
        
        ic(client_id)
        ic(project_id)
        ic(startdate)
        ic(enddate)
        
        rows=[]
        try:
            #time.sleep(10)
            # Load the client dropdown list
            self._loadclients()
            ic(f"Try getBillingEvents(start_date={startdate}, end_date={enddate})")
            rows=self.getBillingEventService().getBillingEvents(client_id = client_id, project_id=project_id, start_date=startdate, end_date=enddate)
            
            # calculate computed fields
            if rows is not None:
                for row in rows:
                    st = self.getdatetime(row["start_time"])
                    et = self.getdatetime(row["end_time"])
                    
                    hours = (et - st).seconds / 3600
                    row["hours"] = int(hours*10) / 10
            
        finally:
            self.progress(False)            
        
        return rows
    
    def _loadclients(self):
        if self.clientdrop is not None:
            rows=self.getClientService().getClients()
            
            clientoptions=[]
            for row in rows:
                clientoptions.append(ft.dropdown.Option(key=row["client_id"], text=row["organisation"]))
                
            self.clientdrop.options = clientoptions
            if self.clientdrop.parent is not None:
                self.clientdrop.update()
                
    def _loadprojects(self, client_id):
        ic()
        if self.projectdrop is not None:
            # TODO: query projects by client id
            rows=self.getProjectService().getProjects(client_id)
            
            projectoptions=[]
            for row in rows:
                projectoptions.append(ft.dropdown.Option(key=row["project_id"], text=row["title"]))
                
            self.projectdrop.options = projectoptions
            if self.projectdrop.parent is not None:
                self.projectdrop.update()
                
    def getTasks(self, event: dict):
        project_id = self.projectdrop.value
        # Load tasks
        tasks = self.getTaskService().getTasks(project_id)
        return tasks
            
    
    class EditForm(object):
        
        def __init__(self, view: BaseView):
            self.fieldnames = [
                "uid",
                "project_id",
                "project_name",
                "task_id", 
                "task_name",
                "trans_num", 
                "log_message", 
                "start_time", 
                "end_time", 
            ]
            width=450
            height=60
            
            self.fields = {}
            for fn in self.fieldnames:
                if fn in ["uid","project_id","task_id"]:
                    continue
                control=None
                if fn in ["start_time","end_time"]:
                    control=DateTimeField(
                        view.page,
                        fn,
                        hint=fn,
                        val="2 hours ago" # str(val)[:10]
                    )
                elif fn == "task_name":
                    self.taskdrop = control = ft.Dropdown(
                        label="task_name",
                        hint_text="Select task",
                        width=400,
                        bgcolor=ft.colors.GREY_700,
                        focused_border_color=ft.colors.WHITE,                
                        options=[],
                        on_change=self.on_taskdrop_change,                        
                    )
                else:
                    control = TsInputField(
                        width=width,
                        height=height,
                        hint_text=fn
                    )
                if fn in ["project_name"]:
                    control.disabled = True
                self.fields[fn] = control
            self.view = view
            self.view.dirty = True
            self.data = None
            self.formcard = None
        
        def show(self, page: ft.Page) -> TsCard:
            self.saveButton = TsButton("Save",on_click=self.save)
            
            content=ft.Container(
                content=ft.Column([
                    ft.Row([
                    self.fields["project_name"],
                    self.saveButton
                    ]),
                    self.fields["task_name"],
                    self.fields["trans_num"],
                    self.fields["log_message"],
                    self.fields["start_time"].content,
                    self.fields["end_time"].content,
                ])
            )
            
            self.formcard = TsCard(self.view, content)
            
            return self.formcard
        
        def update(self):
            if self.formcard:
                self.formcard.update()

        def on_taskdrop_change(self, e):
            ic(f"task_id={e.control.value}")
            self.data["task_id"]=e.control.value
        
        def save(self, e):
            """Save user edits on the form."""
            ic(e)
            errmsg="Save failed"
            # Apply user edits from the controls to the data fields and then save
            valid=True
            for fn in self.fieldnames:
                if fn in self.fields.keys():
                    control = self.fields[fn]
                    if fn not in ['project_name','task_name']:
                        val = self.getValue(control)
                        if isinstance(val, datetime.datetime):
                            val = val.isoformat()
                        self.data[fn] = val
                    if fn == 'task_name':
                        self.data["task_id"] = control.value
                if self.data.get("project_id") is None:
                    self.data["project_id"] = self.view.projectdrop.value
                    
                if fn in [ "trans_num", "project_id", "task_id", "log_message" ] and isEmpty(self.data[fn]):
                    ic(f"{fn} is a required field. val={self.data[fn]}")
                    if fn == "task_id":
                        fn = "task_name"
                    control = self.fields[fn]
                    if hasattr(control, "text"):
                        control.text.bgcolor = ft.colors.AMBER_900
                    else:
                        control.bgcolor = ft.colors.AMBER_900
                    control.update()
                    valid=False
                
                if fn in [ "start_time", "end_time"] and isEmpty(self.data[fn]):
                    ic(f"{fn} is a required field")
                    control = self.fields[fn]
                    control.date.text.bgcolor = ft.colors.AMBER_900
                    control.update()
                    valid=False
                    
                if valid:
                    # TODO: verify start_time preceeds end_time and they occur on the same calendar day
                    st=self.view.getdatetime(self.data["start_time"])
                    et=self.view.getdatetime(self.data["end_time"])
                                        
                    if st>et:
                        ic(f"{et} < {st} ?")
                        errmsg="start_time must preceed end_time"
                        control = self.fields["end_time"]
                        control.date.text.bgcolor = ft.colors.AMBER_900
                        control.update()                  
                        valid=False
                    if (st.year != et.year or st.month != et.month or st.day != et.day):
                        errmsg="start_time and end_time must occur on the same calendar day"
                        control = self.fields["end_time"]
                        control.date.text.bgcolor = ft.colors.AMBER_900
                        control.update()                    
                        valid=False
            
            if valid:
                res = self.view.getBillingEventService().save(self.data)
                
                if res.status_code == 200:
                    TsNotification(self.view.page, msg="Saved", bgcolor="green")
                else:
                    valid=False
                
                
            if not(valid):
                self.update()
                TsNotification(self.view.page, msg=errmsg, bgcolor="red")
                
            
                
        def getValue(self, control):
            if hasattr(control, "getValue"):
                return control.getValue()
            else:
                return control.text.value
            
        
    # TODO: consider moving this to BaseView
    def setValue(self, tf, fn, value, event):
        ic(f"{fn}={value}")
        
        if fn in ["task_name","task_id"]:
            tasks = self.getTasks(event["project_id"])
            taskoptions=[]
            for row in tasks:
                taskoptions.append(ft.dropdown.Option(key=row["task_id"], text=row["name"]))
                
            tf.options = taskoptions
            tf.value = value            
            #self.setOption(tf, value)
            if tf.parent is not None:
                tf.update()
            
            return
        
        if hasattr(tf, "setValue"):
            tf.setValue(value)
        else:
            tf.value = value
            tf.update()
            
        
    
    def edit(self, e):
        """Construct the edit data form."""
        
        uid = e.control.data
    
        self.progress(True)
        try:    
            ic(uid)
            event = self.getBillingEventService().getBillingEvent(uid)            
            ic(event)
            ic("Initializing data")
            self.open(event)
        finally:
            self.progress(False)
            
    def delete(self, e):
        ic(f"w={self.page.window_width} h={self.page.window_height}")
        uid = e.control.data
        # ask for confirmation
        self.modal = TsModalDialog(self.page, "Inactivate BillingEvent", f"Do you want to inactivate event_id={uid}", self.on_delete_confirm) 
        self.modal.data = uid
        self.page.open(self.modal)
        
    def on_delete_confirm(self, e):
        uid = self.modal.data
        ic(f"delete {uid}?")
        self.page.close(self.modal)
        
        # do the delete
        if e.control.text == "Yes":
            self.progress(True)
            try:
                self.dirty = True
                # TODO: inactivate the event
                ic(f"Let's inactivate {uid}?")
                res = self.getBillingEventService().inactivateBillingEvent(uid)
                if res.status_code == 200:
                    TsNotification(self.page, msg="Inactivated", bgcolor="green")
                else:
                    TsNotification(self.page, msg="Inactivation failed", bgcolor="red")
                # refresh the view
                self.refresh(None)
            finally:
                self.progress(False)

        
        
    def addBillingEvent(self, e):
        """Open the edit form to create a new event"""
        
        event={}
        for fn in self.forminput.fieldnames:
            event[fn]=""
        event["uid"]=None
        project_id=self.projectdrop.value
        if project_id is None:
            self.projectdrop.bgcolor = ft.colors.AMBER_900
            self.page.update()
            return
            
        event["project_id"]=project_id
        ic(f"{project_id}")
        event["project_name"]=self.findOptionText(self.projectdrop, project_id)
        event["start_time"]=self.dateinterpreter.interpret("2 hours ago") #str(datetime.datetime.now())
        event["end_time"]=self.dateinterpreter.interpret("30 minutes ago") #str(datetime.datetime.now())
        self.open(event)
        
        
    def open(self, event: dict):
        self.forminput.data = event
        ic(self.forminput.fieldnames)
        ic(self.forminput.fields.keys())
        for fn in self.forminput.fieldnames:
            ic(event[fn])
            if fn in self.forminput.fields: 
                control = self.forminput.fields[fn]
                if fn == "task_name":
                    fn = "task_id" 
                self.setValue(control, fn, event[fn], event)
        project_id=self.projectdrop.value                
        self._loadTasksDropDown(self.forminput.taskdrop, project_id)                
        self.form.update()
        self.showForm()
        self.page.update()
        
    def on_form_hide(self):
        """Reload data after closing a form."""
        ic(self.dirty)
        
        if self.dirty:
            # Refresh the table with the nuclear option
            self.refresh(None)
    
        
    