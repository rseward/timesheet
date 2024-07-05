import flet as ft
from .base_view import BaseView

import service.client
import time

class ClientsView(BaseView):
    def __init__(self, page):
        self.page = page
        self.mytitle="Clients"
        self.tabdata=[]
        self.content=self.build()
        self.clientService = service.client.ClientService()
        
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
        
    def table(self, rows):
                    
        tab = ft.DataTable(
            bgcolor=ft.colors.BLUE_800,
            border_radius=10,
            heading_row_color=ft.colors.BLUE_900,            
            columns=[
                self.colheader("Organisation"),
                self.colheader("City"),
                self.colheader("State"),
                self.colheader("Contact Email"),
                self.colheader("URL")
            ],
            rows=rows
        )
        return tab
    
    def build(self):
        body = ft.Column(
            [
            ft.Text("Hi, your clients are nice!"),
            self.table(self.tabdata)
            ]
        )
        return body
    
    
    def render(self):
        rows = self._loaddata()
        
        renderedrows=[]
        for row in rows:
            renderedrow=[
                        ft.DataCell(ft.Text(row["organisation"])),
                        ft.DataCell(ft.Text(row["city"])),
                        ft.DataCell(ft.Text(row["state"])),
                        ft.DataCell(ft.Text(row["contact_email"])),
                        ft.DataCell(ft.Text(row["http_url"]))                
            ]
            renderedrows.append(ft.DataRow(cells=renderedrow))
        
        self.tabdata = renderedrows
        self.content=self.build()
        self.page.update()
        
    
    def _loaddata(self):
        self.progress(True)
        rows=[]
        try:
            #time.sleep(10)
            rows=self.clientService.getClients()
        finally:
            self.progress(False)            
        
        return rows
    

    