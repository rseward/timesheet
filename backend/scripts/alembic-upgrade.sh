#!/bin/bash

# Script to run from the Makefile

. env
alembic upgrade head
