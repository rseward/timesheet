devsetup:	steps/db steps/install tests
	touch steps/dev-ready
	
query:	steps/db
	sqlite3 timesheet.sqlite
	
steps/install:	pip.out
	pip install ./
	touch steps/install
	
install:	pip.out
	pip install ./

pip.out:	requirements.txt
	pip install -r requirements.txt
	pip freeze > pip.out

steps/db:
	scripts/alembic-upgrade.sh
	touch steps/db

tests:	steps/install
	tests/testModelEnums.py
	tests/testModels.py


