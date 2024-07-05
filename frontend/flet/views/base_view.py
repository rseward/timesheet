import flet as ft

class BaseView(object):
    
    def __init__(self, page: ft.Page):
        self.page = page
        self.mytitle=None
        self.content=None # ft.Container
        
    def render(self):
        pass
    
    def progress(self, visible=True):
        if visible:
            self.page.overlay.append(ft.ProgressBar())
            self.page.update()
        else:
            self.page.overlay.clear()
            self.page.update()            
        
