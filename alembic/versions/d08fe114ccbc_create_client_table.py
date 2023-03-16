"""create base tables

Revision ID: d08fe114ccbc
Revises: 
Create Date: 2023-03-12 08:55:49.641531

"""
from alembic import op
import sqlalchemy as sa

from bluestone.timesheet.models import TimeFormatType, LdapSearchScopeType, ProjectStatusType, TaskStatusType

# revision identifiers, used by Alembic.
revision = 'd08fe114ccbc'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'client',
        sa.Column('client_id', sa.Integer, primary_key=True),
        sa.Column('organisation', sa.String(64), nullable=True),
        sa.Column('description', sa.String(255), nullable=True),
        sa.Column('address1', sa.String(128), nullable=True),
        sa.Column('address2', sa.String(128), nullable=True),
        sa.Column('city', sa.String(60), nullable=True),
        sa.Column('state', sa.String(80), nullable=True),
        sa.Column('country', sa.String(2), nullable=True),
        sa.Column('postal_code', sa.String(13), nullable=True),
        sa.Column('contact_first_name', sa.String(128), nullable=True),
        sa.Column('contact_last_name', sa.String(128), nullable=True),
        sa.Column('username', sa.String(32), nullable=True),
        sa.Column('contact_email', sa.String(128), nullable=True),
        sa.Column('phone_number', sa.String(20), nullable=True),
        sa.Column('fax_number', sa.String(20), nullable=True),
        sa.Column('gsm_number', sa.String(20), nullable=True),
        sa.Column('http_url', sa.String(128), nullable=True)
    )

    op.create_table(
       'assignments',
       sa.Column('proj_id', sa.Integer, primary_key=True),
       sa.Column('username', sa.String(32), primary_key=True)
    )

    TimeFormatType.create(op.get_bind(), checkfirst=True)
    LdapSearchScopeType.create(op.get_bind(), checkfirst=True)    
    op.create_table(
       'config',
       sa.Column('config_set_id', sa.Integer, primary_key=True),
       sa.Column('version', sa.String(32), nullable=False, default='1.2.2'),
       sa.Column('locale', sa.String(128), default=None),
       sa.Column('timezone', sa.String(128), default=None),
       sa.Column('timeformat', TimeFormatType, nullable=False, default='12'),
       sa.Column('weekstartday', sa.Integer, nullable=False, default=0),
       sa.Column('useLDAP', sa.Integer, nullable=False, default=0),
       sa.Column('LDAPScheme', sa.String(32), nullable=True),
       sa.Column('LDAPHost', sa.String(255), nullable=True),
       sa.Column('LDAPPort', sa.Integer, nullable=True),
       sa.Column('LDAPBaseDN', sa.String(255), nullable=True),
       sa.Column('LDAPUsernameAttribute', sa.String(255), nullable=True),
       sa.Column('LDAPSearchScope', LdapSearchScopeType, nullable=False, default='base'),
       sa.Column('LDAPFilter', sa.String(255), nullable=True),
       sa.Column('LDAPProtocolVersion', sa.String(255), default='3'),
       sa.Column('LDAPBindUsername', sa.String(255), nullable=True),
       sa.Column('LDAPBindPassword', sa.String(255), nullable=True)
    )    

    op.create_table(
       'note',
       sa.Column('note_id', sa.Integer, nullable=False, primary_key=True),
       sa.Column('proj_id', sa.Integer, nullable=False),
       sa.Column('date', sa.DateTime, nullable=False, default='0000-00-00 00:00:00'),
       sa.Column('subject', sa.String(128), nullable=True),
       sa.Column('body', sa.Text, nullable=True),
       sa.Column('to_contact', sa.Boolean, nullable=False, default=False)    
    )

    ProjectStatusType.create(op.get_bind(), checkfirst=True)        
    op.create_table(
       'project',
       sa.Column('proj_id', sa.Integer, nullable=False, primary_key=True),
       sa.Column('title', sa.String(200), nullable=False, default=''),
       sa.Column('client_id', sa.Integer, nullable=False, default=0),
       sa.Column('description', sa.String(256), default=None),
       sa.Column('start_date', sa.Date, nullable=False, default='1970-01-01'),
       sa.Column('deadline', sa.Date, nullable=False, default='0000-00-00'),
       sa.Column('http_link', sa.String(128), default=None),
       sa.Column('proj_status', ProjectStatusType, nullable=False, default='Pending'),
       sa.Column('proj_leader', sa.String(32), nullable=True)    
    )

    TaskStatusType.create(op.get_bind(), checkfirst=True)        
    op.create_table(
       'task',
       sa.Column('task_id', sa.Integer, nullable=False, primary_key=True),
       sa.Column('proj_id', sa.Integer, nullable=False, default=0),
       sa.Column('name', sa.String(128), nullable=False, default=''),
       sa.Column('description', sa.Text),
       sa.Column('assigned', sa.DateTime, nullable=False, default='0000-00-00 00:00:00'),
       sa.Column('started', sa.DateTime, nullable=False, default='0000-00-00 00:00:00'),
       sa.Column('suspended', sa.DateTime(), nullable=False, default='0000-00-00 00:00:00'),
       sa.Column('completed', sa.DateTime(), nullable=False, default='0000-00-00 00:00:00'),
       sa.Column('status', TaskStatusType, nullable=False, default='Pending')
    )

    op.create_table(
       'task_assignments',
       sa.Column('task_id', sa.Integer, nullable=False, default=0),
       sa.Column('username', sa.String(32), nullable=False, default=''),
       sa.Column('proj_id', sa.Integer, nullable=False, default=0)
    )

    op.create_table(
       'billing_event',
       sa.Column('uid', sa.String(32), nullable=False, default=''),
       sa.Column('start_time', sa.DateTime, nullable=False, default='1970-01-01 00:00:00'),
       sa.Column('end_time', sa.DateTime, nullable=False, default='0000-00-00 00:00:00'),
       sa.Column('trans_num', sa.Integer, sa.Identity(start=1, cycle=True), nullable=False),
       sa.Column('proj_id', sa.Integer, nullable=False, default=1),
       sa.Column('task_id', sa.Integer, nullable=False, default=1),
       sa.Column('log_message', sa.String(255), default=None)
    )

    """
    op.create_table(
       'user',
       sa.Column('username', sa.String(32), nullable=False, default=''),
       sa.Column('level', sa.Integer, nullable=False, default=0),
       sa.Column('password', sa.String(41), nullable=False, default=''),
       sa.Column('allowed_realms', sa.String(20), nullable=False, default='.*'),
       sa.Column('first_name', sa.String(64), nullable=False, default=''),
       sa.Column('last_name', sa.String(64), nullable=False, default=''),
       sa.Column('email_address', sa.String(64), nullable=False, default=''),
       sa.Column('phone', sa.String(32), nullable=False, default=''),
       sa.Column('bill_rate', sa.Float, nullable=False, default=0.00),
       sa.Column('time_stamp', sa.DateTime, nullable=False),
       sa.Column('status', enum('IN','OUT'), nullable=False, default 'OUT',
       sa.Column('uid', sa.Integer, nullable=False, primary_key=True,    
    )
    """

       
    pass


def downgrade() -> None:
    op.drop_table('assignments')
    op.drop_table('client')
    op.drop_table('note')    
    
    pass
