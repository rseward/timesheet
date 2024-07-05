import flet as ft
from .base_view import BaseView

class NavButton(ft.Container):
    def __init__(self, text: str, bgcolor, on_click):
        super().__init__(
            content=ft.Text(text, color="black"),
            margin=10,
            padding=10,
            alignment=ft.alignment.center,
            bgcolor=bgcolor,
            width=150,
            height=75,
            border_radius=10,
            on_click=on_click
        )
        

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
                on_click=self.on_clients_click
            ),
            NavButton(
                "Tasks", 
                bgcolor=ft.colors.CYAN_200, 
                on_click=self.on_clients_click
            )
            
            
            ]
        )
        
    def on_clients_click(self, ev):
        self.page.go("/clients")
    