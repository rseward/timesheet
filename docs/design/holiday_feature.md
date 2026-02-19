# Holiday Feature Design Document

## Overview
This document outlines the design and implementation plan for the Holiday feature in the Timesheet application. The feature allows administrators to configure client-specific holidays and federal holidays that prevent users from entering time on those dates.

## Requirements Summary

### Functional Requirements
1. **Holiday Configuration**
   - Support client-specific holidays for each calendar year
   - Support federal holidays (stored with `client_id=0`)
   - Holiday entry screen similar to time entries

2. **Navigation**
   - Client edit window: button to navigate to holiday entry screen
   - Dashboard: Admin navigation area with "Manage Federal Holidays" link

3. **Time Entry Validation**
   - Disable hour entry on Federal or Client Holiday dates
   - Display message indicating the day is a holiday (client-specific or federal)

### Technical Requirements
- Follow existing project patterns (DAO, API router, Vue.js components)
- Integrate with existing authentication and authorization
- Support both web (Vue.js) and Flet frontends

## Architecture

### Backend Components

#### 1. Database Model (`models.py`)
```python
class Holiday(Base):
    __tablename__ = "holiday"

    holiday_id = Column(Integer, primary_key=True, autoincrement=True)
    client_id: Mapped[int] = mapped_column(ForeignKey("client.client_id"), nullable=False)
    holiday_date = Column(Date, nullable=False)
    name = Column(String(128), nullable=False)
    description = Column(String(255))
    is_federal = Column(Boolean, nullable=False, default=False)
    active = Column(Boolean, nullable=False)
```

**Design Decisions:**
- `client_id=0` represents federal holidays (special case)
- `is_federal` flag for easy querying of federal holidays
- `active` field to disable holidays without deletion
- Composite unique constraint on `(client_id, holiday_date)` to prevent duplicates

#### 2. Pydantic Model (`jsonmodels.py`)
```python
class HolidayJson(BaseModel):
    holiday_id: Optional[int] = None
    client_id: int
    holiday_date: datetime.date
    name: constr(max_length=128)
    description: Optional[str] = None
    is_federal: Optional[bool] = False
    active: Optional[bool] = True
    client_name: Optional[str] = None  # For display purposes
```

#### 3. DAO Layer (`holidaydao.py`)
Following `BaseDao` pattern with methods:
- `getAll(include_inactive=False, client_id=None, year=None)`
- `getById(holiday_id)`
- `getByClientAndDate(client_id, date)`
- `getHolidaysForDateRange(start_date, end_date, client_id)`
- `getFederalHolidays()`
- `create(holiday)`
- `update(holiday)`
- `delete(holiday_id)`
- `toDict()`, `toJson()`, `toModel()`

#### 4. API Router (`routers/holiday.py`)
FastAPI endpoints:
- `GET /api/holidays/` - List all holidays (with optional filters)
- `GET /api/holidays/{holiday_id}` - Get single holiday
- `GET /api/holidays/federal` - Get federal holidays
- `GET /api/holidays/client/{client_id}` - Get holidays for specific client
- `GET /api/holidays/check-date` - Check if a date is a holiday
- `POST /api/holidays/` - Create holiday
- `PUT /api/holidays/` - Update holiday
- `DELETE /api/holidays/{holiday_id}` - Delete holiday (soft delete)

#### 5. DAO Factory Registration
Update `daos.py` to include HolidayDao factory method.

### Frontend Components (Vue.js)

#### 1. Store (`stores/holidays.ts`)
Pinia store with:
- State: holidays, loading, error, filters
- Getters: filteredHolidays, federalHolidays, clientHolidays
- Actions: fetchHolidays, fetchFederalHolidays, fetchClientHolidays, createHoliday, updateHoliday, deleteHoliday, checkDateIsHoliday

#### 2. Views

##### a. Holidays Management View (`views/holidays/HolidaysView.vue`)
- Table view similar to time entries
- Filter by client (or show federal holidays)
- Filter by year
- Add/Edit/Delete functionality
- Search by holiday name

##### b. Federal Holidays View (`views/holidays/FederalHolidaysView.vue`)
- Pre-filtered view showing only federal holidays (client_id=0)
- Quick-add common federal holidays (New Year's Day, Memorial Day, etc.)

##### c. Client Holidays View (`views/holidays/ClientHolidaysView.vue`)
- Pre-filtered view for specific client
- Accessed from client modal

#### 3. Modals/Components

##### a. HolidayModal.vue
- Form to add/edit holidays
- Fields: Date, Name, Description, Active status
- Client field (read-only for client-specific view, hidden for federal view)

#### 4. Dashboard Enhancement (`DashboardView.vue`)
Add new Admin navigation section:
```vue
<div class="admin-nav-section">
  <h3>Admin</h3>
  <router-link to="/holidays/federal">Manage Federal Holidays</router-link>
</div>
```

#### 5. Client Modal Enhancement (`clients/ClientModal.vue`)
Add "Manage Holidays" button:
```vue
<button @click="navigateToClientHolidays(client.id)">
  Manage Holidays
</button>
```

#### 6. Time Entry Validation Enhancement

##### a. TimeEntryModal.vue
- Check date before allowing entry
- Display warning/error if date is a holiday
- Disable save button if date is a holiday

##### b. HoursView.vue
- Apply holiday checks to existing entries (warning indicator)

### Database Migration

Create new Alembic migration:
```python
# File: alembic/versions/xxxxx_create_holiday_table.py
revision = 'create_holiday_table'
down_revision = 'latest_revision_id'

def upgrade():
    op.create_table(
        'holiday',
        sa.Column('holiday_id', sa.Integer, primary_key=True, autoincrement=True),
        sa.Column('client_id', sa.Integer, nullable=False),
        sa.ForeignKeyConstraint(['client_id'], ['client.client_id']),
        sa.Column('holiday_date', sa.Date, nullable=False),
        sa.Column('name', sa.String(128), nullable=False),
        sa.Column('description', sa.String(255)),
        sa.Column('is_federal', sa.Boolean, nullable=False, default=False),
        sa.Column('active', sa.Boolean, nullable=False, default=True),
        sa.UniqueConstraint('client_id', 'holiday_date', name='uq_client_date')
    )

def downgrade():
    op.drop_table('holiday')
```

## Implementation Tasks

### Phase 1: Backend Foundation
1. [ ] Add `Holiday` model to `models.py`
2. [ ] Add `HolidayJson` to `jsonmodels.py`
3. [ ] Create `HolidayDao` class
4. [ ] Register `HolidayDao` in `daos.py`
5. [ ] Create Alembic migration for holiday table
6. [ ] Run migration to create table

### Phase 2: API Layer
1. [ ] Create `holiday.py` API router
2. [ ] Register router in `main.py`
3. [ ] Add holiday validation endpoint
4. [ ] Test API endpoints

### Phase 3: Frontend - Core Views
1. [ ] Create `holidays.ts` Pinia store
2. [ ] Create `HolidaysView.vue` base component
3. [ ] Create `HolidayModal.vue` component
4. [ ] Add routing for `/holidays`, `/holidays/federal`, `/holidays/client/:id`

### Phase 4: Frontend - Integrations
1. [ ] Add Admin section to `DashboardView.vue`
2. [ ] Add "Manage Holidays" button to `ClientModal.vue`
3. [ ] Implement holiday date checking in `TimeEntryModal.vue`
4. [ ] Add holiday indicators in `HoursView.vue`

### Phase 5: Testing & Polish
1. [ ] Unit tests for HolidayDao
2. [ ] API integration tests
3. [ ] Frontend component tests
4. [ ] E2E tests for holiday management
5. [ ] Update user documentation

## Edge Cases & Considerations

### 1. Holiday Conflicts
- Federal and client holidays on the same date: Display both, prioritize client message
- Duplicate holiday entries: Database constraint prevents duplicate (client_id, date) pairs

### 2. Historical Data
- Time entries before holiday configuration: No retroactive blocking
- Past holidays: Allow editing/deleting for historical accuracy

### 3. User Permissions
- Federal holidays: Admin-only access
- Client holidays: Admin or client manager access

### 4. Time Zones
- All holidays stored as dates (no time component)
- Use user's timezone preference for display

### 5. Year Management
- Holidays are date-specific, not recurring
- Bulk import feature for standard federal holidays per year

## API Contract Examples

### Check Date Is Holiday
```
GET /api/holidays/check-date?client_id=1&date=2025-12-25

Response:
{
  "is_holiday": true,
  "holiday_type": "federal",
  "holiday_name": "Christmas Day",
  "message": "December 25, 2025 is a Federal Holiday"
}
```

### Get Client Holidays for Year
```
GET /api/holidays/client/1?year=2025

Response:
{
  "holidays": {
    "1": {
      "holiday_id": 1,
      "client_id": 1,
      "holiday_date": "2025-07-04",
      "name": "Company Day Off",
      "description": "Annual company holiday",
      "is_federal": false,
      "active": true
    }
  }
}
```

## UI Mockups

### Dashboard Admin Section
```
┌─────────────────────────────────────────────┐
│ Dashboard                                   │
├─────────────────────────────────────────────┤
│                                             │
│ Clients  Projects  Tasks  Hours  Reports     │
│                                             │
│ ┌─────────────────────────────────────────┐  │
│ │ Admin                                 │  │
│ │ [Manage Federal Holidays →]           │  │
│ └─────────────────────────────────────────┘  │
│                                             │
└─────────────────────────────────────────────┘
```

### Holiday Management View
```
┌─────────────────────────────────────────────────────────┐
│ Holidays                                              │
│ Filter: [All Clients ▼] Year: [2025 ▼] Search: [____]│
├─────────────────────────────────────────────────────────┤
│ Date        | Name              | Client    | Actions  │
├─────────────────────────────────────────────────────────┤
│ 2025-01-01 | New Year's Day    | Federal   | Edit Del │
│ 2025-07-04 | Company Day Off   | Acme Corp | Edit Del │
│ 2025-12-25 | Christmas Day     | Federal   | Edit Del │
└─────────────────────────────────────────────────────────┘
│ [+ Add Holiday]                                      │
└─────────────────────────────────────────────────────────┘
```

### Time Entry Holiday Warning
```
┌─────────────────────────────────────────────────────────┐
│ Add Time Entry                                       │
├─────────────────────────────────────────────────────────┤
│ Client: [Acme Corp ▼]                                │
│ Project: [Website Redesign ▼]                         │
│ Task: [Design Homepage ▼]                            │
│ Date:   [12/25/2025]  ⚠️ December 25, 2025 is a     │
│                       Federal Holiday: Christmas Day   │
│                         Time entry disabled.          │
├─────────────────────────────────────────────────────────┤
│ [Save] (disabled)  [Cancel]                          │
└─────────────────────────────────────────────────────────┘
```

## Future Enhancements

1. **Recurring Holidays**: Configure holidays that repeat annually
2. **Bulk Import**: Upload CSV of holidays
3. **Holiday Calendar**: Monthly calendar view with holiday indicators
4. **Holiday Templates**: Pre-configured sets of federal holidays by year
5. **Multi-Country Support**: Different federal holidays per country
6. **Partial Day Holidays**: Allow half-day holiday entries

## Dependencies

- No new external dependencies required
- Uses existing: SQLAlchemy, FastAPI, Vue.js, Pinia, Tailwind CSS

## Testing Strategy

### Unit Tests
- HolidayDao CRUD operations
- Holiday validation logic
- Pydantic model validation

### Integration Tests
- API endpoints
- Database constraints
- Store actions

### E2E Tests
- Federal holiday management workflow
- Client holiday management workflow
- Time entry blocking on holidays

## Rollback Plan

If issues arise:
1. Disable holiday validation via feature flag
2. Remove Admin section from dashboard
3. Keep holiday table (no data loss)
4. Re-enable after fixes

## Success Criteria

1. ✅ Federal holidays can be created/managed by admin
2. ✅ Client holidays can be created/managed
3. ✅ Time entry is blocked on holiday dates with clear message
4. ✅ Dashboard provides link to federal holidays
5. ✅ Client modal provides link to client holidays
6. ✅ All existing functionality remains intact
7. ✅ UI follows project design patterns
8. ✅ Tests cover all new functionality
