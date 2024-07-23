import flet as ft
from .base_view import BaseView, NavButton

class IndexView(BaseView):
    
    
    
    def __init__(self, page: ft.Page):
        self.page = page
        self.mytitle="Home"
        self.content = ft.Column(
            [
            ft.Text("Hi, your beat is nice!"),
            ft.Text("---"),
            #ft.Text("Clients", on_click=self.on_clients_click)
            #ft.Container(
            #    content=ft.Text("Clients"), 
            #    bgcolor=ft.colors.GREEN_200, 
            #    on_click=self.on_clients_click)
            NavButton(
                "Clients", 
                bgcolor=ft.colors.GREEN_200, 
                on_click=self.on_clients_click
            ),
            NavButton(
                "Projects", 
                bgcolor=ft.colors.AMBER, 
                on_click=self.on_projects_click
                
            ),
            NavButton(
                "Tasks", 
                bgcolor=ft.colors.CYAN_200, 
                on_click=self.on_tasks_click
            ),
            NavButton(
                "Hours", 
                bgcolor=ft.colors.PURPLE_200, 
                on_click=self.on_hours_click
            )
            
            ]
        )
        
    def on_clients_click(self, ev):
        self.page.window_width = 1400
        self.page.window_height = 900
        
        self.page.go("/clients")
        
    def on_projects_click(self, ev):
        self.page.window_width = 1400
        self.page.window_height = 900
        
        self.page.go("/projects")
        
    def on_tasks_click(self, ev):
        self.page.window_width = 1400
        self.page.window_height = 900
        
        self.page.go("/tasks")
    
    def on_hours_click(self, ev):
        self.page.window_width = 1400
        self.page.window_height = 900
        
        self.page.go("/hours")
    