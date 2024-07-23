#!/usr/bin/env python

import flet as ft

from views.FletRouter import Router
from user_controls.app_bar import NavBar
from service.auth import is_authenticated


def main(page: ft.Page):
    page.title = "timesheet"
    page.padding = 0
    page.theme_mode = "dark"
    page.vertical_alignment = "center"
    page.horizontal_alignment = "center"
    page.window_height = 900
    page.window_width = 700
    page.appbar = NavBar(page)
    myrouter = Router(page)
    page.on_route_change = myrouter.route_change
    
    page.add(
        myrouter.body
    )
    
    start="/login"
    if is_authenticated(page):
        start="/"
    
    page.go(start)
    
ft.app(target=main, assets_dir="assets")
