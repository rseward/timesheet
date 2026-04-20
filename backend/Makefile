TIMESHEET_SQLITE ?= $(CURDIR)/timesheet-test.sqlite
TIMESHEET_SA_URL ?= sqlite:///$(CURDIR)/timesheet-test.sqlite
export TIMESHEET_SQLITE
export TIMESHEET_SA_URL

venv:
	uv venv

run:
	./run.sh

devsetup:	steps/db steps/install tests
	touch steps/dev-ready

query:	steps/db
	#sqlite3 $(TIMESHEET_SQLITE)
	litecli $(TIMESHEET_SQLITE)

querytool:
	sqlit $(TIMESHEET_SA_URL)
	clear

migratedb:	steps/db
	ls -l timesheet.sqlite

steps/install:	pip.out
	mkdir -p steps
	uv pip install ./
	touch steps/install

install:	pip.out
	uv pip install --reinstall .

pip.out:	requirements.txt
	uv pip install -r requirements.txt
	pip freeze > pip.out

steps/db:
	scripts/alembic-upgrade.sh
	touch steps/db

test:	steps/db steps/install
	tests/testModelEnums.py
	tests/testModels.py
	tests/testJsonModels.py
	tests/testDaos.py
	tests/testBillingEventDao.py

integration_tests:	tests
	tests/testFastApi.py

steps/ruff:
	pip install ruff
	touch steps/ruff

lint:	steps/ruff
	cd src; ruff check
	cd src; ruff format

backup:
	cp timesheet.sqlite backups/timesheet_$(shell date +%Y%m%d).sqlite
	ls -ltr backups


