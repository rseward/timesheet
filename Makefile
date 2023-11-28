install:	pip.out
	pip install ./

pip.out:	requirements.txt
	pip install -r requirements.txt
	pip freeze > pip.out

db:
	scripts/alembic-upgrade.sh
