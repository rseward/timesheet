import flet as ft
from icecream import ic
from .base_view import BaseView, NavButton, showerror, showmessage
from user_controls.datefield import TimeField
import service.preferences

class PreferencesView(BaseView):
    
    def __init__(self, page):
        super().__init__(page)        
        self.mytitle = "Preferences"
        self.preferences_service = None
        self.current_user_id = self.get_current_user_id()
        
        # Time input fields
        self.start_time_field = TimeField(
            page=page,
            fieldname="start_time",
            val="09:00",
            height=60,
            width=120
        )
        
        self.end_time_field = TimeField(
            page=page,
            fieldname="end_time", 
            val="17:00",
            height=60,
            width=120
        )
        
        self.content = ft.Column([
            ft.Text("Work Hours Preferences", size=24, weight=ft.FontWeight.BOLD),
            ft.Divider(),
            
            ft.Row([
                ft.Text("Default Start Time:", size=16),
                self.start_time_field.content
            ], alignment=ft.MainAxisAlignment.START),
            
            ft.Row([
                ft.Text("Default End Time:", size=16),
                self.end_time_field.content
            ], alignment=ft.MainAxisAlignment.START),
            
            ft.Divider(),
            
            ft.Row([
                ft.ElevatedButton(
                    "Save Preferences",
                    on_click=self.on_save_click,
                    bgcolor=ft.colors.BLUE_600,
                    color=ft.colors.WHITE
                ),
                ft.ElevatedButton(
                    "Reset to Defaults",
                    on_click=self.on_reset_click,
                    bgcolor=ft.colors.ORANGE_600,
                    color=ft.colors.WHITE
                ),
                ft.ElevatedButton(
                    "Load Current",
                    on_click=self.on_load_click,
                    bgcolor=ft.colors.GREEN_600,
                    color=ft.colors.WHITE
                )
            ], alignment=ft.MainAxisAlignment.START),
            
            ft.Text(
                "These preferences will be used as default values when entering new time entries.",
                size=12,
                color=ft.colors.GREY_600
            )
        ], spacing=20)
        
        # Don't load preferences on initialization - wait until render()
        
    def get_current_user_id(self):
        """Get the current user ID from session/auth"""
        # For now, we'll use a hardcoded user_id=1
        # In a real implementation, this should come from the authenticated user session
        creds = self.page.session.get("creds")
        if creds and "user_id" in creds:
            return creds["user_id"]
        else:
            # Default to user_id=1 for testing
            return 1
    
    def getPreferencesService(self):
        """Get preferences service instance"""
        if not self.preferences_service:
            creds = self.page.session.get("creds")
            if not creds:
                raise Exception("No authentication credentials available")
            self.preferences_service = service.preferences.PreferencesService(creds)
        return self.preferences_service
    
    def load_preferences(self):
        """Load current user preferences from the API"""
        # Check if user is authenticated
        creds = self.page.session.get("creds")
        if not creds:
            ic("No credentials available, skipping preferences load")
            # Don't show error message - this is normal for unauthenticated users
            return
            
        try:
            self.progress(True)
            prefs_service = self.getPreferencesService()
            preferences = prefs_service.getUserPreferencesWithDefaults(self.current_user_id)
            
            # Update the time fields with loaded values
            if "start_time" in preferences:
                self.start_time_field.setValue(preferences["start_time"])
            
            if "end_time" in preferences:
                self.end_time_field.setValue(preferences["end_time"])
            
            # Only show success message if explicitly requested (not during render)
            ic("Preferences loaded successfully")
            
        except Exception as e:
            ic(f"Error loading preferences: {e}")
            showerror(self.page, f"Failed to load preferences: {str(e)}")
        finally:
            self.progress(False)
            self.page.update()
    
    def on_load_click(self, e):
        """Handle load current preferences button click"""
        # For explicit load, show success message
        self.load_preferences_with_message()
    
    def on_save_click(self, e):
        """Handle save preferences button click"""
        # Check if user is authenticated
        creds = self.page.session.get("creds")
        if not creds:
            showerror(self.page, "Please login to save preferences")
            return
            
        try:
            self.progress(True)
            
            # Get values from the time fields
            start_time = self.start_time_field.getValue()
            end_time = self.end_time_field.getValue()
            
            ic(f"Saving preferences: start_time={start_time}, end_time={end_time}")
            
            # Prepare preferences data
            preferences_data = {
                "start_time": start_time,
                "end_time": end_time
            }
            
            # Save preferences using the service
            prefs_service = self.getPreferencesService()
            response = prefs_service.setUserPreferencesBulk(self.current_user_id, preferences_data)
            
            if response.status_code == 200:
                showmessage(self.page, "Preferences saved successfully!")
                ic("Preferences saved successfully")
            else:
                showerror(self.page, f"Failed to save preferences: {response.status_code}")
                ic(f"Error saving preferences: {response.status_code} - {response.text}")
                
        except Exception as e:
            ic(f"Error saving preferences: {e}")
            showerror(self.page, f"Error saving preferences: {str(e)}")
        finally:
            self.progress(False)
            self.page.update()
    
    def load_preferences_with_message(self):
        """Load preferences and show success message"""
        # Check if user is authenticated
        creds = self.page.session.get("creds")
        if not creds:
            showerror(self.page, "Please login to load preferences")
            return
            
        try:
            self.progress(True)
            prefs_service = self.getPreferencesService()
            preferences = prefs_service.getUserPreferencesWithDefaults(self.current_user_id)
            
            # Update the time fields with loaded values
            if "start_time" in preferences:
                self.start_time_field.setValue(preferences["start_time"])
            
            if "end_time" in preferences:
                self.end_time_field.setValue(preferences["end_time"])
            
            showmessage(self.page, "Preferences loaded successfully")
            
        except Exception as e:
            ic(f"Error loading preferences: {e}")
            showerror(self.page, f"Failed to load preferences: {str(e)}")
        finally:
            self.progress(False)
            self.page.update()
    
    def on_reset_click(self, e):
        """Handle reset to defaults button click"""
        try:
            # Reset to default values
            self.start_time_field.setValue("09:00")
            self.end_time_field.setValue("17:00")
            
            showmessage(self.page, "Reset to default values")
            self.page.update()
            
        except Exception as e:
            ic(f"Error resetting preferences: {e}")
            showerror(self.page, f"Error resetting preferences: {str(e)}")
    
    def render(self):
        """Render method for compatibility with BaseView"""
        # Load preferences when the view is actually rendered (user is authenticated at this point)
        try:
            self.load_preferences()
        except Exception as e:
            ic(f"Error during render load_preferences: {e}")
            # Don't fail the render, just log the error
            pass
        return self.content
