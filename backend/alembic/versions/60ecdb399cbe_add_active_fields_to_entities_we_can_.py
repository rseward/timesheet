"""add active fields to entities we can delete

Revision ID: 60ecdb399cbe
Revises: 3ad7dbdbe41e
Create Date: 2025-01-11 08:50:25.848445

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '60ecdb399cbe'
down_revision = '3ad7dbdbe41e'
branch_labels = None
depends_on = None


def upgrade() -> None:
    print("Adding active fields to entities we can delete")
    # The batch_alter_table, recreate='always' is a workaround for sqlite not syncing its schema with an added column
    # Trust me this is probably the way you want to add sqllite columns
    with op.batch_alter_table('project', recreate='always') as batch_op:
        batch_op.add_column(sa.Column('active', sa.Boolean(), nullable=True))
    with op.batch_alter_table('task', recreate='always') as batch_op:
        batch_op.add_column(sa.Column('active', sa.Boolean(), nullable=True))
    with op.batch_alter_table('billing_event', recreate='always') as batch_op:
        batch_op.add_column(sa.Column('active', sa.Boolean(), nullable=True))
    with op.batch_alter_table('client', recreate='always') as batch_op:
        batch_op.add_column(sa.Column('active', sa.Boolean(), nullable=True))
    with op.batch_alter_table('user', recreate='always') as batch_op:
        batch_op.add_column(sa.Column('active', sa.Boolean(), nullable=True))
    op.execute("UPDATE project SET active = 1")
    op.execute("UPDATE task SET active = 1")
    op.execute("UPDATE billing_event SET active = 1")
    op.execute("UPDATE client SET active = 1")
    op.execute("UPDATE user SET active = 1")
    pass


def downgrade() -> None:
    print("Removing active fields to entities we can delete")
    op.drop_column('project', 'active')
    op.drop_column('task', 'active')
    op.drop_column('billing_event', 'active')
    op.drop_column('client', 'active')
    op.drop_column('user', 'active')
    pass
