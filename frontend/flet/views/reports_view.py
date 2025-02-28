import stat
import flet as ft
from icecream import ic
from .base_view import BaseView, TsCard, TsInputField, TsButton, TsNotification, TsModalDialog
from user_controls.datefield import DateField

import service.task
import time

class ReportsView(BaseView):
    """
    Display a list of reports and gather their required parameters to generate a report.

    Client Period Report
      - date range
      - client
      - project (optional project)

    TimeKeeper Period Report
      - date range
      - timekeeper
      
    Time Period Report
      - date range
    """
    def __init__(self, page):
        super().__init__(page, self.on_form_hide)
        self.page = page
        self.mytitle="Reports"
        self.tabdata=[
            {"report":"Client Period Report"},
            {"report":"TimeKeeper Period Report"},
            {"report":"Time Period Report"}
        ]
        self.content=self.build()
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
                self.colheader("Report")
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
        
        self.table = self.buildtable([])
        body = ft.Column([
            ft.Row([
                #ft.IconButton( icon=ft.icons.ADD_CIRCLE_ROUNDED ),
                ft.IconButton( icon=ft.icons.REFRESH_ROUNDED , on_click=self.refresh )
            ]),
            ft.Text("Hi, your reports are nice!"),
            ft.Stack([
            self.table
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
                        ft.DataCell(ft.Text(row["report"]))
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
        
        self.progress(True)
        rows=[]
        try:
            rows=[
                {"report":"Client Period Report"},
                {"report":"TimeKeeper Period Report"},
                {"report":"Time Period Report"}
            ]
        finally:
            self.progress(False)            
        
        return rows

    def on_form_hide(self):
        """Reload data after closing a form."""
        ic(self.dirty)
        
        if self.dirty:
            self.refresh(None)
            ic("Did we refresh?")

                    
        
    