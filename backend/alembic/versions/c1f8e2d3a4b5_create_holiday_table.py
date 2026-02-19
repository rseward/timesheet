"""create holiday table

Revision ID: c1f8e2d3a4b5
Revises: 118cccf7f555
Create Date: 2026-02-13 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c1f8e2d3a4b5'
down_revision = '118cccf7f555'
branch_labels = None
depends_on = None


def upgrade() -> None:
    print("Creating holiday table")
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
        sa.UniqueConstraint('client_id', 'holiday_date', name='uq_holiday_client_date')
    )
    pass


def downgrade() -> None:
    print("Dropping holiday table")
    op.drop_table('holiday')
    pass
