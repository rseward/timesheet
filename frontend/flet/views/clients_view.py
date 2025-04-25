import flet as ft
from icecream import ic
from .base_view import BaseView, TsCard, TsInputField, TsButton, TsNotification, TsModalDialog

import service.client
import time

class ClientsView(BaseView):
    def __init__(self, page):
        super().__init__(page, self.on_form_hide)
        self.page = page
        self.mytitle="Clients"
        self.tabdata=[]
        self.content=self.build()
        self.clientService = None
        self.forminput = None
        self.dirty = False
        
        
    def getClientService(self):
        if not(self.clientService):
            self.clientService = service.client.ClientService(
                self.page.session.get("creds")
            )
        return self.clientService
        
    def refresh(self, e):
        ic("let's go! refresh!")
        self.loadandrenderrows()
        self.reloadtable(self.tabdata)                  
        self.page.update()

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
                self.colheader("Organisation"),
                self.colheader("City"),
                self.colheader("State"),
                self.colheader("Contact Email"),
                self.colheader("URL"),
                self.colheader("Active"),
                self.colheader("Edit")
            ],
            rows=rows
        )
        return tab
    
    def build(self):
        ic(f"build! {len(self.tabdata)}")
        self.forminput = self.EditForm(self)
        self.form = self.forminput.show(self.page)
        self.table = self.buildtable([])        
        body = ft.Column(
            [
            ft.Row([
                ft.IconButton( icon=ft.icons.ADD_CIRCLE_ROUNDED, on_click=self.addclient ),
                ft.IconButton( icon=ft.icons.REFRESH_ROUNDED , on_click=self.refresh ),            
            ]),            
            ft.Text("Hi, your clients are nice!"),
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
        if rows is None:
            return
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
                        ft.DataCell(ft.Text(row["organisation"])),
                        ft.DataCell(ft.Text(row["city"])),
                        ft.DataCell(ft.Text(row["state"])),
                        ft.DataCell(ft.Text(row["contact_email"])),
                        ft.DataCell(ft.Text(row["http_url"])),
                        ft.DataCell(ft.Checkbox(label="",value=row["active"],disabled=True)), 
                        ft.DataCell(
                            ft.Row([
                            ft.IconButton(icon=ft.icons.EDIT_ROUNDED, data=row["client_id"], on_click=self.edit),
                            ft.IconButton(icon=ft.icons.DELETE_ROUNDED, data=row["client_id"], on_click=self.delete)
                            ] )
                        )
            ]
            renderedrows.append(ft.DataRow(cells=renderedrow))
            
        return renderedrows
    
    def render(self):
        self.content=self.build()
        self.loadandrenderrows()
        
    
    def _loaddata(self):
        self.progress(True)
        rows=[]
        try:
            #time.sleep(10)
            rows=self.getClientService().getClients(active=False)
            
        finally:
            self.progress(False)            
        
        return rows
    
    class EditForm(object):
        
        def __init__(self, view: BaseView):
            self.fieldnames = [
                "client_id",
                "organisation", 
                "description", 
                "address1", 
                "address2", 
                "city", 
                "state", 
                "country", 
                "postal_code", 
                "contact_first_name", 
                "contact_last_name", 
                "username", 
                "contact_email", 
                "phone_number", 
                "fax_number", 
                "gsm_number", 
                "http_url",
                "active"
            ]
            width=450
            height=60
            
            self.fields = {}
            for fn in self.fieldnames:
                if fn == "client_id":
                    continue
                if fn == "active":
                    self.fields[fn] = ft.Checkbox(label=fn)
                    continue
                self.fields[fn] = TsInputField(
                    width=width,
                    height=height,
                    hint_text=fn
                )
            self.view = view
            self.view.dirty = True
            self.data = None
        
        def show(self, page: ft.Page) -> TsCard:
            self.saveButton = TsButton("Save",on_click=self.save)
            
            content=ft.Container(
                content=ft.Column([
                    ft.Row([
                    self.fields["organisation"],
                    self.fields["description"],
                    self.saveButton
                    ]),
                    ft.Row([
                    self.fields["address1"], 
                    self.fields["address2"],
                    ]),
                    ft.Row([                    
                    self.fields["city"], 
                    self.fields["state"], 
                    ]),
                    ft.Row([
                    self.fields["country"], 
                    self.fields["postal_code"],
                    ]),
                    ft.Row([
                    self.fields["contact_first_name"], 
                    self.fields["contact_last_name"], 
                    ]),
                    ft.Row([
                    self.fields["username"], 
                    self.fields["contact_email"], 
                    ]),
                    ft.Row([
                    self.fields["phone_number"], 
                    self.fields["fax_number"], 
                    ]),
                    ft.Row([
                    self.fields["gsm_number"], 
                    self.fields["http_url"],
                    self.fields["active"]
                    ])
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
                    if fn in ["active"]:
                        self.data[fn] = self.fields[fn].value
                    else:
                        self.data[fn] = self.fields[fn].text.value
                
            res = self.view.getClientService().save(self.data)
            
            if res.status_code == 200:
                TsNotification(self.view.page, msg="Saved", bgcolor="green")
            else:
                TsNotification(self.view.page, msg="Save failed", bgcolor="red")
            
        
        
    def setValue(self, tf: ft.TextField, value):
        tf.value = value
        tf.update()
            
    
    def edit(self, e):
        """Construct the edit data form."""
        
        client_id = e.control.data
    
        self.progress(True)
        try:    
            client = self.getClientService().getClient(client_id)            
            ic(client_id)
            ic("Initializin data")
            self.open(client)
        finally:
            self.progress(False)
            
    def delete(self, e):
        ic(f"w={self.page.window_width} h={self.page.window_height}")
        client_id = e.control.data
        # ask for confirmation
        self.modal = TsModalDialog(self.page, "Inactivate Client", f"Do you want to inactivate client_id={client_id}", self.on_delete_confirm) 
        self.modal.data = client_id
        self.page.open(self.modal)
        
    def on_delete_confirm(self, e):
        uuid =client_id = self.modal.data
        ic(f"delete {client_id}?")
        self.page.close(self.modal)
        
        # do the delete
        if e.control.text == "Yes":
            self.progress(True)
            try:
                self.dirty = True
                # TODO: inactivate the event
                ic(f"Let's inactivate {client_id}?")
                res = self.getClientService().inactivateClient(client_id)
                if res.status_code == 200:
                    TsNotification(self.page, msg="Inactivated", bgcolor="green")
                else:
                    TsNotification(self.page, msg="Inactivation failed", bgcolor="red")
                # refresh the view
                self.refresh(None)
            finally:
                self.progress(False)
        
        
        
        
    def addclient(self, e):
        """Open the edit form to create a new client"""
        
        client={}
        for fn in self.forminput.fieldnames:
            client[fn]=""
        client["client_id"]=None
        
        self.open(client)
        
        
    def open(self, client: dict):
        self.forminput.data = client
        for fn in self.forminput.fieldnames:
            if fn in self.forminput.fields:    
                if fn in ["active"]:
                    self.forminput.fields[fn].value = client[fn]
                else:
                    self.setValue(self.forminput.fields[fn].text, client[fn])
        self.form.update()
        self.showForm()
        self.page.update()
        
    def on_form_hide(self):
        """Reload data after closing a form."""
        ic(self.dirty)
        
        if self.dirty:
            self.refresh(None)
            ic("Did we refresh?")        
        
        
        
        
        
    