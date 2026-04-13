#!/bin/bash
export TIMESHEET_SA_URL="sqlite:///$(pwd)/timesheet-test.sqlite"
export TIMESHEET_SQLITE="$(pwd)/timesheet-test.sqlite"

echo "Running tests..."
python3 tests/testModelEnums.py
python3 tests/testModels.py
python3 tests/testJsonModels.py
python3 tests/testDaos.py
python3 tests/testBillingEventDao.py
