import flet as ft

def NavBar(page, ft=ft):
    
    def go(page, route):
        print(page)
        page.go(route)
    
    control = ft.AppBar(
        leading=ft.Icon(ft.icons.TAG_FACES_ROUNDED),
        leading_width=40,
        title=ft.Text("Flet Router"),
        center_title=False,
        bgcolor=ft.colors.SURFACE_VARIANT,
        actions=[
            ft.IconButton(ft.icons.HOME, on_click= lambda _: go(page, '/') ),
            ft.IconButton(ft.icons.PERSON_ROUNDED, on_click= lambda _: go(page, '/profile') ),
            ft.IconButton(ft.icons.SETTINGS_ROUNDED, on_click= lambda _: go(page, '/settings') )
        ]
    )
    
    return control