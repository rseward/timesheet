#!/bin/bash

# Script to run from the Makefile

#. ${TIMESHEET_SRC_HOME}/myenv
alembic upgrade head
echo ${TIMESHEET_SQLITE}
echo ${TIMESHEET_SA_URL}
