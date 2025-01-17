
import flet as ft
from icecream import ic

import service.client
import service.project
import service.billingevent
from typing import List

def showerror(page: ft.Page, msg: str):
    showmessage(page, msg, bgcolor="red")

def showmessage(page: ft.Page, msg: str, bgcolor: str = "green"):
    page.overlay.append( 
        ft.SnackBar(
            ft.Text(msg),
                duration=8000,
                bgcolor=bgcolor,
                open=True
            )
        )


class BaseView(object):
    
    def __init__(self, page: ft.Page, on_form_hide=None):
        self.page = page
        self.mytitle=None
        self.content=None # ft.Container
        self.form = None
        self.on_form_hide = on_form_hide
        self.modal = None
        self.eventService = None
        self.clientService = None
        self.projectService = None
        self.taskService = None
        self.authService = None
        ic("Base view end of __init__")
        ic(on_form_hide)
        
    def render(self):
        pass
    
    def progress(self, visible=True):
        if visible:
            self.page.overlay.append(ft.ProgressBar())
            self.page.update()
        else:
            self.page.overlay.clear()
            self.page.update()            
            
    def showForm(self):
        ic(self.form)
        if self.form:
            self.form.offset = ft.transform.Offset(0,0)
            self.page.update()
            
    def hideForm(self, e):
        if self.form:
            self.form.offset = ft.transform.Offset(2,0)
            ic(self.on_form_hide)
            if self.on_form_hide is not None:
                self.on_form_hide()            
            self.page.update()

    def getAuthService(self):
        if not(self.authService):
            self.authService = service.auth.AuthService(
                self.page.session.get("creds")
            )
        return self.authService
            
    def getBillingEventService(self):
        if not(self.eventService):
            self.eventService = service.billingevent.BillingEventService(
                self.page.session.get("creds")
            )
        return self.eventService
    
    def getClientService(self):
        if not(self.clientService):
            self.clientService = service.client.ClientService(
                self.page.session.get("creds")
            )
        return self.clientService
    
    def getProjectService(self):
        if not(self.projectService):
            self.projectService = service.project.ProjectService(
                self.page.session.get("creds")
            )
        return self.projectService
    
    def getTaskService(self):
        if not(self.taskService):
            self.taskService = service.task.TaskService(
                self.page.session.get("creds")
            )
        return self.taskService
    
    def findOptionText(self, dropdown, key):
        ic(f"findOptionText(key={key})")
        for opt in dropdown.options:
            ic(f"{opt.key} == {key}? [{type(opt.key)} == {type(key)}]")
            if str(opt.key) == str(key):
                ic(opt.text)
                return opt.text
        return None
    
    def setValue(self, tf, fn, value, event=None):
        ic(f"{fn}={value}")
        if hasattr(tf, "setValue"):
            tf.setValue(value)
        else:
            tf.value = value
            tf.update()
            
    def _loadClientsDropDownOptions(self) -> List[ft.dropdown.Option]:
        ic(f"_loadclientsDropDownOptions")
        
        try:
            rows=self.getClientService().getClients()
        except Exception as e:
            rows = []
            
        clientoptions=[]
        for row in rows:
            ic(f'key={row["client_id"]}, text={row["organisation"]}')
            clientoptions.append(ft.dropdown.Option(key=row["client_id"], text=row["organisation"]))

        return clientoptions

        """        
            clientdrop.options = clientoptions
            
            if clientdrop.parent is not None:
                ic("update clientdrop?")
                clientdrop.update()
            else:
                ic("clientdrop not yet added to page")
        self.page.update()
        """
            
    def _loadTasksDropDown(self, taskdrop, project_id, task_id=None):
        ic(f"_loadclients taskdrop={taskdrop}")
        if taskdrop is not None:
            rows=self.getTaskService().getTasks(project_id=project_id)
            
            dropoptions=[]
            for row in rows:
                ic(f'key={row["task_id"]}, text={row["name"]}')
                dropoptions.append(ft.dropdown.Option(key=row["task_id"], text=row["name"]))
                
            taskdrop.options = dropoptions
            if taskdrop.parent is not None:
                ic("update taskdrop?")
                taskdrop.update()
            else:
                ic("taskdrop not yet added to page")
        self.page.update()
        

def TsCard(view: BaseView, content: ft.Container):
    content.bgcolor = ft.colors.BLUE_800
    content.border_radius=18

    cardbody = ft.Column([
        ft.Row( [
            ft.IconButton(
                icon=ft.icons.CLOSE_ROUNDED, 
                on_click=view.hideForm
                )]),
        content
    ])
    
    card = ft.Card(
        offset = ft.transform.Offset(2,0),
        animate_offset = ft.animation.Animation(600, curve="easeIn"),
        elevation=30,
        content=cardbody
    )
    
    return card

DARK_GRAY = "#191919"
TEXT_COLOR = "white"
HINT_COLOR = ft.colors.GREY_500


class TsInputField(ft.UserControl):
    def __init__(self, width, height, hint_text, password=False):
        super().__init__()
        self.text = ft.TextField(
                        hint_text=hint_text,
                        #border=ft.InputBorder.NONE,
                        color=TEXT_COLOR,
                        focused_border_color=ft.colors.WHITE,
                        hint_style=ft.TextStyle(color=HINT_COLOR, italic=True),
                        width=width,
                        height=height,
                        bgcolor="transparent",
                        text_style=ft.TextStyle(size=18, weight="w400"),
                        password=password,
                        can_reveal_password=True
                    )
        
        self.body = ft.Container(
            ft.Row(
                [
                    self.text
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
    
    def setValue(self, val):
        self.text.value = val
        self.text.update()
        
    def update(self):
        self.text.update()


def TsButton(text: str, on_click):
    button = ft.ElevatedButton(
        text,
        color="black",
        bgcolor="white",
        width=320,
        height=50,
        on_click=on_click
    )
    
    return button

def TsNotification(page: ft.Page, msg: str, bgcolor: str):
    ic(f"{bgcolor}: {msg}")
    page.overlay.append( 
        ft.SnackBar(
            ft.Text(msg),
                duration=8000,
                bgcolor=bgcolor,
                open=True
            )
        )
    page.update()
    
def TsModalDialog(page: ft.Page, title, msg, handle_close):
    ic(f"title={title} msg={msg}")
    dialog = ft.AlertDialog(
        modal=True,
        title=ft.Text(title),
        content=ft.Text(msg),
        actions=[
            ft.TextButton("Yes", on_click=handle_close),
            ft.TextButton("No", on_click=handle_close)
        ],
        actions_alignment=ft.MainAxisAlignment.END
    )
    return dialog

class NavButton(ft.Container):
    def __init__(self, text: str, bgcolor, on_click):
        super().__init__(
            content=ft.Text(text, color="black"),
            margin=10,
            padding=10,
            alignment=ft.alignment.center,
            bgcolor=bgcolor,
            width=250,
            height=45,
            border_radius=10,
            on_click=on_click
        )

    
    