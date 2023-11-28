#!/bin/bash

# pip install sqlacodegen

tables=$1 # comma seperated list
if [ "x$tables" = "x" ] ; then
   tables="all"
fi

echo "Saving models.py to /tmp/ for backup purposes"
cp models.py /tmp/

#sqlautocode --noindex --example -d -o model.py postgres://yourlaw:yourlaw@127.0.0.1/yourlaw
success=0
set -x
sqlacodegen --noindexes --outfile newmodels.py --tables $tables $TIMESHEET_SA_URL && success=1

if [ $success = 1 ] ; then
  echo "meld newmodels.py models.py"
  echo "# And after the merge, do this"
  echo "rm -f newmodels.py"

  ls -lt *model*.py
fi



