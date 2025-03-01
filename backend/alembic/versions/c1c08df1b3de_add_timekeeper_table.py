"""add timekeeper table

Revision ID: c1c08df1b3de
Revises: 60ecdb399cbe
Create Date: 2025-03-01 10:53:20.990500

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c1c08df1b3de'
down_revision = '60ecdb399cbe'
branch_labels = None
depends_on = None


def upgrade() -> None:
    tktable = """
CREATE TABLE "timekeeper" (
    "timekeeper_id" integer PRIMARY KEY AUTOINCREMENT,
    "username" text NOT NULL,
    "first_name" text NOT NULL,
    "last_name" text NOT NULL,
    "email" text NOT NULL,
    "bill_rate" real,
    "phone" text
)
"""
    op.execute(tktable)
    op.execute("INSERT INTO timekeeper (username, first_name, last_name, email, phone, bill_rate) VALUES ('rseward', 'Rob', 'Seward', 'rseward@bluestone-consulting.com', '734.604.0000', 125.00)")
    with op.batch_alter_table('billing_event', recreate='always') as batch_op:
        batch_op.add_column(sa.Column('timekeeper_id', sa.Integer(), default=1, nullable=True))
        batch_op.create_foreign_key(constraint_name='fk_timekeeper_id', table_name='billing_event', referent_table='timekeeper', local_cols=['timekeeper_id'], remote_cols=['timekeeper_id'])
    op.execute("UPDATE billing_event SET timekeeper_id = 1")

    for t in [ "task", "project", "user", "client", "billing_event" ]:
        with op.batch_alter_table(t, recreate='always') as batch_op:
            batch_op.alter_column(column_name='active', type_=sa.Boolean(), nullable=False)

    # TODO: In the next migration make the timekeeper_id a not null field and set it to 1 for existing records
    pass


def downgrade() -> None:
    op.execute("ALTER TABLE billing_event DROP COLUMN timekeeper_id")
    op.execute("DROP TABLE timekeeper")
    pass
