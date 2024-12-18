devsetup:	steps/db steps/install tests
	touch steps/dev-ready

query:	steps/db
	sqlite3 $(TIMESHEET_SQLITE)

steps/install:	pip.out
	mkdir -p steps
	pip install ./
	touch steps/install

install:	pip.out
	uv pip install ./

pip.out:	requirements.txt
	uv pip install -r requirements.txt
	pip freeze > pip.out

steps/db:
	scripts/alembic-upgrade.sh
	touch steps/db

test:	steps/install
	tests/testModelEnums.py
	tests/testModels.py
	tests/testJsonModels.py
	tests/testDaos.py

integration_tests:	tests
	tests/testFastApi.py

steps/ruff:
	pip install ruff
	touch steps/ruff

lint:	steps/ruff
	cd src; ruff check
	cd src; ruff format


