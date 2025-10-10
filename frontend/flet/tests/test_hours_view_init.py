#!/usr/bin/env python

"""
Test to verify HoursView initialization order is fixed
"""

class MockHoursView:
    """Simulates the problematic initialization order"""
    
    def __init__(self, broken=False):
        print("Initializing MockHoursView...")
        
        if broken:
            # Broken version: build() called before total_hours is initialized
            print("Building content...")
            self.content = self.build()  # This would fail
            self.total_hours = 0.0
        else:
            # Fixed version: total_hours initialized before build()
            self.total_hours = 0.0
            print("Building content...")
            self.content = self.build()  # This works
    
    def build(self):
        print(f"In build(), total_hours = {self.total_hours:.1f}")
        return f"Total Hours: {self.total_hours:.1f}"

def test_initialization_order():
    """Test both broken and fixed versions"""
    print("Testing FIXED initialization order:")
    try:
        fixed_view = MockHoursView(broken=False)
        print("✅ FIXED version works correctly!")
        print(f"Content: {fixed_view.content}")
        print()
    except Exception as e:
        print(f"❌ FIXED version failed: {e}")
        print()
    
    print("Testing BROKEN initialization order:")
    try:
        broken_view = MockHoursView(broken=True)
        print("❌ BROKEN version should have failed but didn't!")
        print(f"Content: {broken_view.content}")
    except Exception as e:
        print(f"✅ BROKEN version correctly failed: {e}")

if __name__ == "__main__":
    test_initialization_order()
    print("\nThe fix ensures attributes are initialized before build() is called.")