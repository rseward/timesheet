import flet as ft

from service.auth import is_authenticated

# views
from views.login_view import LoginView
from views.index_view import IndexView
from views.profile_view import ProfileView
from views.setting_view import SettingsView
from views.clients_view import ClientsView

class Router:
    
    def __init__(self, page):
        self.page = page
        self.ft = ft
        self.views = {
            "/login": LoginView(page),
            "/": IndexView(page),
            "/profile": ProfileView(page),
            "/settings": SettingsView(page),
            "/clients": ClientsView(page)
        }
        self.routes = {
            "/login": self.views['/login'].content,
            "/": self.views['/'].content,
            "/profile": self.views['/profile'].content,
            "/settings": self.views['/settings'].content,
            "/clients": self.views['/clients'].content
        }
        start="/login"
        if is_authenticated():
            start="/"
        
        print(f"start='{start}'")
        self.body = ft.Container(content=self.routes[start])
        
    def route_change(self, route):
        print(route)
        view = self.views[route.route]
        print(view)
        self.page.appbar.title=ft.Text(view.mytitle)
        self.page.appbar.update()
        self.body.update()
        view.render()
        self.body.content = view.content
        self.body.update()
        