"""create report_template table

Revision ID: d2a9f1e0b3c4
Revises: c1f8e2d3a4b5
Create Date: 2026-04-17 18:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd2a9f1e0b3c4'
down_revision = 'c1f8e2d3a4b5'
branch_labels = None
depends_on = None


def upgrade() -> None:
    print("Creating report_template table")
    op.create_table(
        'report_template',
        sa.Column('template_id', sa.Integer, primary_key=True, autoincrement=True),
        sa.Column('name', sa.String(128), nullable=False),
        sa.Column('description', sa.String(255)),
        sa.Column('report_type', sa.String(32), nullable=False),
        sa.Column('filename', sa.String(255), nullable=False),
        sa.Column('file_data', sa.Text, nullable=False),
        sa.Column('created_by', sa.String(128)),
        sa.Column('created_at', sa.DateTime, nullable=False),
        sa.Column('active', sa.Boolean, nullable=False, default=True),
    )
    pass


def downgrade() -> None:
    print("Dropping report_template table")
    op.drop_table('report_template')
    pass