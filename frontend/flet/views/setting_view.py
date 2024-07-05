import flet as ft
from .base_view import BaseView

class SettingsView(BaseView):
    def __init__(self, page):
        self.page = page
        self.mytitle="Settings"
        self.content= ft.Column(
            [
            ft.Text("Hi, your settings are nice!")
            ]
        )
    

    