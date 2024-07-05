import flet as ft
from .base_view import BaseView
import service.auth

DARK_GRAY = "#191919"
TEXT_COLOR = "white"


class InputField(ft.UserControl):
    def __init__(self, width, height, hint_text, icon, password=False):
        super().__init__()
        self.text = ft.TextField(
                        hint_text=hint_text,
                        border=ft.InputBorder.NONE,
                        color=TEXT_COLOR,
                        hint_style=ft.TextStyle(color=TEXT_COLOR),
                        width=width * 0.8,
                        height=height,
                        bgcolor="transparent",
                        text_style=ft.TextStyle(size=18, weight="w400"),
                        password=password,
                        can_reveal_password=True
                    )
        
        self.body = ft.Container(
            ft.Row(
                [
                    self.text,
                    ft.Icon(icon, color=TEXT_COLOR),
                ]
            ),
            border=ft.border.all(1, DARK_GRAY),
            border_radius=18,
            bgcolor="transparent",
            alignment=ft.alignment.center,
            width=width,
        )

    def build(self):
        return self.body


class LoginView(BaseView):
    def __init__(self, page: ft.Page):
        super().__init__(page)
        self.mytitle = "Login"
        self.expand = True
        self.creds = service.auth.loadcreds()
        self.content = self.build()
        

    def build(self):
        
        #username=""
        #if self.creds:
        #    if "username" in self.creds.keys():
        #        username = self.creds["username"]
        
        
        self.username = InputField(
                                                width=520,
                                                height=60,
                                                hint_text="username",
                                                icon=ft.icons.PERSON_ROUNDED
                                            )
        self.password = InputField(
                                                width=520,
                                                height=60,
                                                hint_text="password",
                                                icon=ft.icons.LOCK_ROUNDED,
                                                password=True,
                                            )
        
        self.rememberme = ft.Checkbox(value=False)
        
        if self.creds:
            if "username" in self.creds.keys():
                self.username.text.value = self.creds["username"]
                self.rememberme.value = True
                
        #print(self.username.value)

        body = ft.Container(
            ft.Stack(
                [
                    ft.Container(
                        ft.Image(src="assets/login_back.jpg"),
                        alignment=ft.alignment.center,
                    ),
                    ft.Container(
                        ft.Container(
                            ft.Column(
                                [
                                    ft.Row(
                                        [
                                            ft.Text(
                                                "Login",
                                                color=TEXT_COLOR,
                                                weight="w700",
                                                size=26,
                                                text_align="center",
                                            )
                                        ],
                                        alignment=ft.MainAxisAlignment.CENTER,
                                    ),
                                    ft.Row(
                                        [
                                            self.username
                                        ],
                                        alignment=ft.MainAxisAlignment.CENTER,
                                    ),
                                    ft.Row(
                                        [
                                            self.password
                                        ],
                                        alignment=ft.MainAxisAlignment.CENTER,
                                    ),
                                    ft.Row(
                                        [
                                            ft.Row(
                                                [
                                                    self.rememberme,
                                                    ft.Text(
                                                        "Remember Me",
                                                        color=TEXT_COLOR,
                                                        size=12,
                                                    ),
                                                ]
                                            ),
                                            ft.Text(
                                                "Forgot Password?",
                                                color=TEXT_COLOR,
                                                size=14,
                                            ),
                                        ],
                                        alignment=ft.MainAxisAlignment.SPACE_AROUND,
                                    ),
                                    ft.Row(
                                        [
                                            ft.ElevatedButton(
                                                "Login",
                                                color="black",
                                                bgcolor="white",
                                                width=320,
                                                height=50,
                                                on_click=self.login
                                            )
                                        ],
                                        alignment=ft.MainAxisAlignment.CENTER,
                                    ),
                                ],
                                alignment=ft.MainAxisAlignment.CENTER,
                            ),
                            width=450,
                            height=450,
                            # bgcolor="#191919",
                            margin=ft.margin.only(top=120),
                            border_radius=18,
                            blur=ft.Blur(10, 12, ft.BlurTileMode.MIRROR),
                            border=ft.border.all(1, DARK_GRAY),
                            bgcolor="#10777777",
                            alignment=ft.alignment.center,
                        ),
                        alignment=ft.alignment.center,
                    ),
                ]
            )
        )
        
        return body
    
    def login(self,e):
        
        uname = self.username.text.value
        passw = self.password.text.value
        rememberme = self.rememberme.value

        print("Login would happen here!")
        print(f"Username: {uname}")
        print(f"Password: {passw}")
        
        self.page.overlay.append( ft.ProgressBar() )
        self.page.update()

        #help(self.page.overlay)
        
        success=False
        try:
            success=service.auth.login(uname, passw, rememberme)
        finally:
            self.page.overlay.clear()
            self.page.update()
        
        if success:
            self.page.go("/")
        else:
            self.page.snack_bar = ft.SnackBar(
                    ft.Text('Failed login attempt'),
                    duration=8000
            )
            #self.page.overlay.clear()
            self.page.snack_bar.open = True
            self.page.update()         
        pass

def main(page: ft.Page):
    page.title = "timesheet"
    page.padding = 0
    page.theme_mode = "dark"
    page.vertical_alignment = "center"
    page.horizontal_alignment = "center"
    page.window_height = 900
    page.window_width = 700
    
    loginview = LoginView(page)
    page.add(loginview.content)

    ft.Page.window_width = ft.Page.window_min_width = ft.Page.window_max_width = 500
    ft.Page.window_height = ft.Page.window_min_height = ft.Page.window_max_height = 700
    page.window.resizable = False
    ft.Page.window_center(page)

    page.update()


#ft.app(target=main, assets_dir="assets/")
