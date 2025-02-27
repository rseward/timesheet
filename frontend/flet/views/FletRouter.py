import flet as ft

from service.auth import is_authenticated

# views
from views.base_view import showerror
from views.login_view import LoginView
from views.index_view import IndexView
from views.profile_view import ProfileView
from views.setting_view import SettingsView
from views.clients_view import ClientsView
from views.projects_view import ProjectsView
from views.tasks_view import TasksView
from views.hours_view import HoursView
from views.reports_view import ReportsView

class Router:
    
    def __init__(self, page):
        self.page = page
        self.ft = ft
        self.views = {
            "/login": LoginView(page),
            "/": IndexView(page),
            "/profile": ProfileView(page),
            "/settings": SettingsView(page),
            "/clients": ClientsView(page),
            "/projects": ProjectsView(page),
            "/tasks": TasksView(page),
            "/hours": HoursView(page),
            "/reports": ReportsView(page)
        }
        self.routes = {
            "/login": self.views['/login'].content,
            "/": self.views['/'].content,
            "/profile": self.views['/profile'].content,
            "/settings": self.views['/settings'].content,
            "/clients": self.views['/clients'].content,
            "/projects": self.views['/projects'].content,
            "/tasks": self.views['/tasks'].content,
            "/hours": self.views['/hours'].content,            
        }
        start="/login"
        if is_authenticated(page):
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
        try:
            view.render()
        except:
            showerror(self.page, f"Unable to load route: {route}")
            self.page.update()
            raise
            
        self.body.content = view.content
        self.body.update()
        