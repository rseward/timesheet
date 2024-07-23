import flet as ft
from icecream import ic
from .base_view import BaseView, NavButton, showerror, showmessage
#import service.auth

class ProfileView(BaseView):
    
    def __init__(self, page):
        super().__init__(page)        
        self.mytitle="Profile"
        self.content= ft.Column(
            [
            ft.Text("Hi, your profile is nice!"),
            NavButton(
                "logout", 
                bgcolor=ft.colors.RED_200, 
                on_click=self.on_logout_click
            ),
            NavButton(
                "refresh token", 
                bgcolor=ft.colors.GREEN_200, 
                on_click=self.on_refresh_click
            ),            
            ]
        )
        
    def on_logout_click(self, e):
        ic("logout!")
        (success, _, detail) = self.getAuthService().logout(self.page)
        
        if not(success):
            showerror(self.page, f"Logout failed! :-( {detail}")
        self.page.update()
        
    def on_refresh_click(self, e):
        ic("refreshing token!")
        success = self.getAuthService().refresh(self.page)
        if not(success):
            showerror(self.page, f"Unable to refresh token")
        else:
            showmessage(self.page, "Refreshed token!")
        self.page.update()
        
        
    