import flet as ft
from icecream import ic
from .base_view import BaseView, TsCard, TsInputField, TsButton, TsNotification, TsModalDialog
from user_controls.datefield import DateField

import service.task
import time

class TasksView(BaseView):
    def __init__(self, page):
        super().__init__(page, self.on_form_hide)
        self.page = page
        self.mytitle="Tasks"
        self.tabdata=[]
        self.content=self.build()
        self.forminput = None
        self.dirty = False
        self.startdate = "2023-01-01"
                
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
                self.colheader("Name"),
                self.colheader("Assigned"),
                self.colheader("Started"),
                self.colheader("Task Status"),
                self.colheader("Edit")
            ],
            rows=rows
        )
        return tab
    
    def on_clientdrop_change(self,e):
        rows = self._loaddata()
        self.tabdata = self.renderrows(rows)
        self.reloadtable(self.tabdata)
        ic(f"client_id={e.control.value}")
        self._loadprojects(e.control.value)
    
    def on_clientdrop_focus(self,e):
        ic("on_clientdrop_focus")
        if len(self.clientdrop.options)<1:
            self.progress(True)
            try:
                self._loadclients()
            finally:
                self.progress(False)

    def on_projectdrop_change(self,e):
        ic(f"project_id={e.control.value}")        
        self.refresh(e)
        pass
    
    def refresh(self, e):
        ic("let's go! refresh!")
        for opt in self.clientdrop.options:
            ic(f"{opt.key}, {opt.text}")
        self._loadClientsDropDown(self.clientdrop)
        self.loadandrenderrows()
        self.reloadtable(self.tabdata)                  
        self.page.update()
            
    def build(self):
        ic(f"build! {len(self.tabdata)}")
        
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
        
        
        self.forminput = self.EditForm(self)
        self.form = self.forminput.show(self.page)
        self.table = self.buildtable([])
        body = ft.Column([
            ft.Row([
                ft.IconButton( icon=ft.icons.ADD_CIRCLE_ROUNDED, on_click=self.addTask ),
                ft.IconButton( icon=ft.icons.REFRESH_ROUNDED , on_click=self.refresh ),
                self.clientdrop,
                self.projectdrop                
            ]),
            ft.Text("Hi, your tasks are nice!"),
            ft.Stack([
            self.table,
            self.form
            ]
            )
            ]
        )
        return body

    def reloadtable(self, rows):
        # rows are a list of DataCells
        self.table.rows = rows
        self.table.update()
    
    def renderrows(self, rows):
        renderedrows=[]
        for row in rows:
            renderedrow=[
                        ft.DataCell(ft.Text(row["project_name"])),
                        ft.DataCell(ft.Text(row["name"])),
                        ft.DataCell(ft.Text(row["assigned"])),
                        ft.DataCell(ft.Text(row["started"])),
                        ft.DataCell(ft.Text(row["status"])),
                        ft.DataCell(
                            ft.Row([
                            ft.IconButton(icon=ft.icons.EDIT_ROUNDED, data=row["task_id"], on_click=self.edit),
                            ft.IconButton(icon=ft.icons.DELETE_ROUNDED, data=row["task_id"], on_click=self.delete)
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
        
        
    
    def render(self):
        ic("render")
        self.content=self.build()
        
        self.loadandrenderrows()
        
        
    
    def _loaddata(self):
        client_id=None
        project_id=None
        
        if self.clientdrop is not None:
            client_id = self.clientdrop.value
        if self.projectdrop is not None:
            project_id = self.projectdrop.value
        
        self.progress(True)
        rows=[]
        try:
            #time.sleep(10)
            rows=self.getTaskService().getTasks(client_id=client_id, project_id=project_id)
            self._loadClientsDropDown(self.clientdrop)            
            
        finally:
            self.progress(False)            
        
        return rows
    
                
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
        self.page.update()
    
    
    class EditForm(object):
        
        def __init__(self, view: BaseView):
            self.view = view
            self.fieldnames = [
                "task_id",
                "project_id",
                "project_name", 
                "name", 
                "description", 
                "assigned", 
                "started", 
                "suspended", 
                "completed", 
                "http_link", 
                "status"
            ]
            width=450
            height=60
            
            self.fields = {}
            for fn in self.fieldnames:
                if fn in ["task_id","project_id"]:
                    continue
                control = None
                if fn in ["assigned", "started", "suspended", "completed"]:
                    control = DateField(
                                    self.view.page,
                                    fn,
                                    hint=fn,
                                    val="2024-01-01",
                                    startdate="2023-01-01" #self.view.startdate
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
            self.view.dirty = True
            self.data = None
        
        def show(self, page: ft.Page) -> TsCard:
            self.saveButton = TsButton("Save",on_click=self.save)
            
            content=ft.Container(
                content=ft.Column([
                    ft.Row([
                    self.fields["project_name"],
                    self.fields["status"],
                    self.saveButton
                    ]),
                    ft.Row([
                    self.fields["name"]                    
                    ]),                    
                    ft.Row([
                    self.fields["description"], 
                    ]),
                    ft.Row([                    
                    self.fields["assigned"].content, 
                    self.fields["started"].content, 
                    ]),
                    ft.Row([                    
                    self.fields["suspended"].content, 
                    self.fields["completed"].content, 
                    ]),
                    ft.Row([
                    self.fields["http_link"], 
                    ]),
                ])
            )
            
            formcard = TsCard(self.view, content)
            
            return formcard
        
        def save(self, e):
            """Save user edits on the form."""
            ic(e)
            # Apply user edits from the controls to the data fields and then save
            for fn in self.fieldnames:
                if fn in self.fields.keys():
                    self.data[fn] = self.fields[fn].text.value
                
            res = self.view.getTaskService().save(self.data)
            
            if res.status_code == 200:
                TsNotification(self.view.page, msg="Saved", bgcolor="green")
            else:
                TsNotification(self.view.page, msg="Save failed", bgcolor="red")
            
        
    def edit(self, e):
        """Construct the edit data form."""
        
        task_id = e.control.data
    
        self.progress(True)
        try:    
            task = self.getTaskService().getTask(task_id)            
            ic(task_id)
            ic("Initializin data")
            self.open(task)
        finally:
            self.progress(False)
            
    def delete(self, e):
        ic(f"w={self.page.window_width} h={self.page.window_height}")
        task_id = e.control.data
        # ask for confirmation
        self.modal = TsModalDialog(self.page, "Inactivate Task", f"Do you want to inactivate task_id={task_id}", self.on_delete_confirm) 
        self.modal.data = task_id
        self.page.open(self.modal)
        
    def on_delete_confirm(self, e):
        task_id = self.modal.data
        ic(f"delete {task_id}?")
        self.page.close(self.modal)
        
        # do the delete
        if e.control.text == "Yes":
            self.dirty = True
            ic(f"Let's inactivate {task_id}?")
        
        # refresh the view
        
        
        
    def addTask(self, e):
        """Open the edit form to create a new task"""
        
        task={}
        for fn in self.forminput.fieldnames:
            task[fn]=""
        project_id=self.projectdrop.value
        if project_id is None:
            self.projectdrop.bgcolor = ft.colors.AMBER_900
            self.page.update()
            return
        task["project_id"]=project_id
        ic(f"{project_id}")
        task["project_name"]=self.findOptionText(self.projectdrop, project_id)
        task["task_id"]=None
        
        self.open(task)
        
        
    def open(self, task: dict):
        self.forminput.data = task
        for fn in self.forminput.fieldnames:
            if fn in self.forminput.fields: 
                control = self.forminput.fields[fn]   
                self.setValue(control, fn, task[fn], task)
        self.form.update()
        self.showForm()
        self.page.update()
        
    def on_form_hide(self):
        """Reload data after closing a form."""
        ic(self.dirty)
        
        if self.dirty:
            self.refresh(None)
            ic("Did we refresh?")
    
        
    