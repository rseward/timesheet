import flet as ft
from .base_view import BaseView

class ProfileView(BaseView):
    
    def __init__(self, page):
        self.page = page
        self.mytitle="Profile"
        self.content= ft.Column(
            [
            ft.Text("Hi, your profile is nice!")
            ]
        )
    