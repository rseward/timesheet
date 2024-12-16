#!/bin/bash

if [ -f $HOME/pyve3/bin/activate ] ; then
    source $HOME/pyve3/bin/activate
fi

# pip install git+https://bitbucket.org/rtd/pyscreenman.git

SCRIPT_DIR=$(dirname $0)
JSONFILE=$SCRIPT_DIR/timesheet-screen.json

function show {
    echo "$1"
    which python
    which pyscreenlauncher
    if [ $? -eq 0 ] ; then
	found=1
    else
	found=0
    fi;
}

found=0

PYVE_LIST="$HOME/pyve3/bin/activate"
IFS=':'
read -a pyvearr <<< "$PYVE_LIST"
IFS=' '

for pyve in "${pyvearr[@]}";
do
    echo "$pyve"
    using="Using $pyve"
    . $pyve
    show "$using"

    if [ $found -eq 1 ] ; then
	break
    fi;
done


if [ ! -f $JSONFILE ] ; then
    echo "Unable to find $JSONFILE!"
    exit 1
fi;

pyscreenlauncher $JSONFILE

