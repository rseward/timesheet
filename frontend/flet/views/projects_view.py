import flet as ft
from icecream import ic
from .base_view import BaseView, TsCard, TsInputField, TsButton, TsNotification, TsModalDialog
from user_controls.datefield import DateField

from utils import isEmpty
import service.project
import time

class ProjectsView(BaseView):
    def __init__(self, page):
        super().__init__(page, self.on_form_hide)
        self.page = page
        self.mytitle="Projects"
        self.tabdata=[]
        self.content=self.build()
        self.projectService = None
        self.forminput = None
        self.dirty = False
        
        
    def getProjectService(self):
        if not(self.projectService):
            self.projectService = service.project.ProjectService(
                self.page.session.get("creds")
            )
        return self.projectService
        
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
                self.colheader("Client Name"),
                self.colheader("Name"),
                self.colheader("Start Date"),
                self.colheader("Deadline"),
                self.colheader("Project Status"),
                self.colheader("Lead"),
                self.colheader("Edit")
            ],
            rows=rows
        )
        return tab

    def refresh(self, e):
        ic("let's go! refresh!")
        self.loadandrenderrows()
        self.reloadtable(self.tabdata)                  
        self.page.update()
    
    def build(self):
        ic(f"build! {len(self.tabdata)}")
        self.forminput = self.EditForm(self)
        self.form = self.forminput.show(self.page)
        self.table = self.buildtable([])
        
        body = ft.Column(
            [
            ft.Row([
                ft.IconButton( icon=ft.icons.ADD_CIRCLE_ROUNDED, on_click=self.addProject ),
                ft.IconButton( icon=ft.icons.REFRESH_ROUNDED , on_click=self.refresh ),            
            ]),
            ft.Text("Hi, your projects are nice!"),
            ft.Stack([
            self.table,
            self.form
            ]
            )
            ]
        )
        return body
    
    def loadandrenderrows(self):
        rows = self._loaddata()
        ic(f"Loaded {len(rows)} rows")
        
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
            
        self.reloadtable(self.tabdata)                    
        self.page.update()
        
        
    def reloadtable(self, rows):
        # rows are a list of DataCells
        self.table.rows = rows
        if self.table.parent is None:
            ic("Oh no! the table hasn't been added yet!")
            return
        ic(f"Reloaded table data with {len(rows)}!")
        self.table.update()
        
    def renderrows(self, rows):
        renderedrows=[]
        for row in rows:
            renderedrow=[
                        ft.DataCell(ft.Text(row["client_name"])),
                        ft.DataCell(ft.Text(row["title"])),
                        ft.DataCell(ft.Text(row["start_date"])),
                        ft.DataCell(ft.Text(row["deadline"])),
                        ft.DataCell(ft.Text(row["proj_status"])),
                        ft.DataCell(ft.Text(row["proj_leader"])),
                        ft.DataCell(
                            ft.Row([
                            ft.IconButton(icon=ft.icons.EDIT_ROUNDED, data=row["project_id"], on_click=self.edit),
                            ft.IconButton(icon=ft.icons.DELETE_ROUNDED, data=row["project_id"], on_click=self.delete)
                            ] )
                        )
            ]
            renderedrows.append(ft.DataRow(cells=renderedrow))
            
        ic(f"Rendered {len(renderedrows)} rows")
        
        return renderedrows

        
    
    
    def render(self):
        self.content=self.build()
        self.loadandrenderrows()
        
        
    
    def _loaddata(self):
        self.progress(True)
        rows=[]
        try:
            #time.sleep(10)
            rows=self.getProjectService().getProjects()
            
        finally:
            self.progress(False)            
        
        return rows
    
    class EditForm(object):
        
        def __init__(self, view: BaseView):
            self.view = view            
            self.fieldnames = [
                "project_id",
                "client_id",
                "client_name", 
                "title", 
                "description", 
                "start_date", 
                "deadline", 
                "http_link", 
                "proj_status", 
                "proj_leader", 
            ]
            width=450
            height=60
            
            self.fields = {}
            for fn in self.fieldnames:
                if fn in ["project_id","client_id"]:
                    continue
                control = None
                if fn == "client_name":
                    control = self.clientdrop = ft.Dropdown(
                        label="client",
                        hint_text="Select client",
                        width=400,
                        bgcolor=ft.colors.GREY_700,
                        focused_border_color=ft.colors.WHITE,
                        options=[],
                        on_change=self.on_clientdrop_change
                    )
                elif fn in ["start_date", "deadline"]:
                    control = DateField(
                        self.view.page,
                        fn,
                        hint=fn,
                        val="2024-01-01",
                        startdate="2023-01-01" #self.view.startdate
                    )
                elif fn == "proj_status":
                    ic("Adding proj_status drop down")
                    self.statusdrop = control = ft.Dropdown(
                        label="proj_status",
                        hint_text="Select Project Status",
                        width=400,
                        bgcolor=ft.colors.GREY_700,
                        focused_border_color=ft.colors.WHITE,
                        options=[],
                        # on_change=self.on_statusdrop_change,
                        # on_focus=self.on_statusdrop_focus,
                        autofocus=True
                    )
                else:
                    control = TsInputField(
                        width=width,
                        height=height,
                        hint_text=fn
                    )
                #if fn in ["client_name"]:
                #    control.disabled = True                                    
                self.fields[fn] = control
            self.view.dirty = True
            self.formcard = None
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

            
        def on_clientdrop_change(self, e):
            self.data["proj_status"]=e.control.value


        """ 
        def on_statusdrop_change(self, e):
            rows = self._loaddata()
            self.tabdata = self.renderrows(rows)
            self.reloadtable(self.tabdata)
            
            self._loadprojects(e.control.value)
            
        def on_statusdrop_focus(self, e):
            #ic()
            if len(self.clientdrop.options)<1:
                self.progress(True)
                try:
                    self._loadclients()
                finally:
                    self.progress(False)
        """

        def update(self):
            if self.formcard:
                self.formcard.update()
        
        def show(self, page: ft.Page) -> TsCard:
            self.saveButton = TsButton("Save",on_click=self.save)
            
            content=ft.Container(
                content=ft.Column([
                    ft.Row([
                    self.fields["client_name"],
                    self.saveButton
                    ]),
                    ft.Row([
                        self.fields["title"],
                    ]),
                    ft.Row([
                    self.fields["description"], 
                    ]),
                    ft.Row([                    
                    self.fields["start_date"].content, 
                    self.fields["deadline"].content, 
                    ]),
                    ft.Row([
                    self.fields["http_link"], 
                    ]),
                    ft.Row([
                    self.fields["proj_status"], 
                    self.fields["proj_leader"], 
                    ]),
                ])
            )
            
            self.formcard = TsCard(self.view, content)
            
            return self.formcard
        
        def save(self, e):
            """Save user edits on the form."""
            ic(e)
            valid=True
            # Apply user edits from the controls to the data fields and then save
            for fn in self.fieldnames:
                if fn in self.fields.keys():
                    control = self.fields[fn]
                    if fn in ["client_name"]:
                        self.data["client_id"] = self.clientdrop.value
                        ic(f"client_id={self.data['client_id']}")
                    elif fn in ["proj_status"]:
                        self.data["proj_status"] = control.value
                    else:
                        self.data[fn] = self.fields[fn].text.value
                    if fn in [ "start_date", "deadline", "title", "description", "proj_status", "proj_leader" ] and isEmpty(self.data[fn]):
                        ic(f"{fn} is a required field")
                        control.text.bgcolor = ft.colors.AMBER_900
                        control.update()
                        valid=False
            if valid:
                res = self.view.getProjectService().save(self.data)
            
                if res.status_code == 200:
                    TsNotification(self.view.page, msg="Saved", bgcolor="green")
                else:
                    valid=False
                    
            if not(valid):
                self.update()
                TsNotification(self.view.page, msg="Save failed", bgcolor="red")


    
    def setValue(self, tf, fn, value, event=None):
        """Set the value of a form field."""

        ic(f"ProjectView.setValue({fn}={value})")
        if fn in ["proj_status"]:
            values = self.getProjectStatusValues()
            statusoptions = []
            for svalue in values:
                statusoptions.append(ft.dropdown.Option(key=svalue, text=svalue))
            ic(f"statusoptions={values}")
            tf.options = statusoptions
            tf.value = value
            
            if tf.parent is not None:
                tf.update()
            
            return

        return super().setValue(tf, fn, value, event)


    def getProjectStatusValues(self):
        """Load possible project status values"""

        return [
            'Pending','Started','Suspended','Complete'
        ]

            
                
    
    def edit(self, e):
        """Construct the edit data form."""
        
        project_id = e.control.data
    
        self.progress(True)
        try:    
            project = self.getProjectService().getProject(project_id)            
            ic(project_id)
            ic("Initializin data")
            self.open(project)
        finally:
            self.progress(False)
            
    def delete(self, e):
        ic(f"w={self.page.window_width} h={self.page.window_height}")
        project_id = e.control.data
        # ask for confirmation
        self.modal = TsModalDialog(self.page, "Inactivate Project", f"Do you want to inactivate project_id={project_id}", self.on_delete_confirm) 
        self.modal.data = project_id
        self.page.open(self.modal)
        
    def on_delete_confirm(self, e):
        project_id = self.modal.data
        ic(f"delete {project_id}?")
        self.page.close(self.modal)
        
        # do the delete
        if e.control.text == "Yes":
            self.dirty = True
            ic(f"Let's inactivate {project_id}?")
        
        # refresh the view
        
        
        
    def addProject(self, e):
        """Open the edit form to create a new project"""
        
        project={}
        for fn in self.forminput.fieldnames:
            project[fn]=""
        project["project_id"]=None
        
        self.open(project)
        
        
    def open(self, project: dict):
        self.forminput.data = project
        for fn in self.forminput.fieldnames:
            if fn in self.forminput.fields:    
                self.setValue(self.forminput.fields[fn], fn, project[fn])
        self._loadClientsDropDown(self.forminput.clientdrop)
        self.form.update()
        self.showForm()
        self.page.update()
        
    def on_form_hide(self):
        """Reload data after closing a form."""
        ic(self.dirty)
        
        if self.dirty:
            self.refresh(None)
            ic("Did we refresh?")
    
        
    