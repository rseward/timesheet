#!/usr/bin/env python

"""
Test script to verify that PreferencesView can be initialized without credentials
without throwing exceptions.
"""

# Mock flet for testing
class MockPage:
    def __init__(self, has_creds=False):
        self._session = {}
        if has_creds:
            self._session["creds"] = {
                "access_token": "mock_token",
                "user_id": 1
            }
    
    class MockSession:
        def __init__(self, data):
            self.data = data
        
        def get(self, key):
            return self.data.get(key)
    
    @property
    def session(self):
        return self.MockSession(self._session)

# Mock the flet module
import sys
from unittest.mock import MagicMock

# Mock flet module before importing views
flet_mock = MagicMock()
flet_mock.colors = MagicMock()
flet_mock.colors.BLUE_600 = "blue_600"
flet_mock.colors.WHITE = "white"
flet_mock.colors.ORANGE_600 = "orange_600"
flet_mock.colors.GREEN_600 = "green_600"
flet_mock.colors.GREY_600 = "grey_600"
flet_mock.FontWeight = MagicMock()
flet_mock.FontWeight.BOLD = "bold"
flet_mock.MainAxisAlignment = MagicMock()
flet_mock.MainAxisAlignment.START = "start"
flet_mock.Column = MagicMock()
flet_mock.Row = MagicMock()
flet_mock.Text = MagicMock()
flet_mock.Divider = MagicMock()
flet_mock.ElevatedButton = MagicMock()

sys.modules['flet'] = flet_mock

# Mock user_controls
user_controls_mock = MagicMock()
sys.modules['user_controls'] = user_controls_mock
sys.modules['user_controls.datefield'] = user_controls_mock.datefield

# Mock service modules
service_mock = MagicMock()
sys.modules['service'] = service_mock
sys.modules['service.client'] = service_mock.client
sys.modules['service.project'] = service_mock.project
sys.modules['service.billingevent'] = service_mock.billingevent
sys.modules['service.preferences'] = service_mock.preferences
sys.modules['service.auth'] = service_mock.auth
sys.modules['service.task'] = service_mock.task

# Mock other dependencies
sys.modules['icecream'] = MagicMock()

def test_preferences_view_initialization():
    """Test that PreferencesView can be initialized without credentials"""
    print("Testing PreferencesView initialization without credentials...")
    
    try:
        # Add path to find the views
        import os
        sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
        
        # Mock the imports that would fail
        from views.base_view import BaseView, showerror, showmessage
        # Monkey patch the functions
        def mock_showerror(page, msg):
            print(f"ERROR: {msg}")
        
        def mock_showmessage(page, msg):
            print(f"MESSAGE: {msg}")
        
        # Mock BaseView
        class MockBaseView:
            def __init__(self, page):
                self.page = page
        
        # Mock TimeField 
        class MockTimeField:
            def __init__(self, page, fieldname, val, height, width):
                self.page = page
                self.fieldname = fieldname
                self.val = val
                self.content = f"TimeField({fieldname}={val})"
            
            def setValue(self, val):
                self.val = val
            
            def getValue(self):
                return self.val
        
        # Update the mocks
        sys.modules['views.base_view'].BaseView = MockBaseView  
        sys.modules['views.base_view'].showerror = mock_showerror
        sys.modules['views.base_view'].showmessage = mock_showmessage
        user_controls_mock.datefield.TimeField = MockTimeField
        
        # Now try to import and instantiate PreferencesView
        from views.preferences_view import PreferencesView
        
        # Test without credentials
        page_no_creds = MockPage(has_creds=False)
        print("Creating PreferencesView without credentials...")
        prefs_view = PreferencesView(page_no_creds)
        print("✅ SUCCESS: PreferencesView created without credentials!")
        
        # Test with credentials
        page_with_creds = MockPage(has_creds=True)  
        print("Creating PreferencesView with credentials...")
        prefs_view2 = PreferencesView(page_with_creds)
        print("✅ SUCCESS: PreferencesView created with credentials!")
        
        return True
        
    except Exception as e:
        print(f"❌ FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_preferences_view_initialization()
    if success:
        print("\n🎉 All tests passed!")
        sys.exit(0)
    else:
        print("\n💥 Tests failed!")
        sys.exit(1)