#!/bin/bash

# Script to run from the Makefile

. ${TIMESHEET_SRC_HOME}/env
alembic upgrade head
