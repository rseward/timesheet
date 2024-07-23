#!/bin/bash

rm -rf build dist MANIFEST

case $1 in
  editable)
    EDITABLE=-e
    ;;
  '')
    ;;
  *)
    echo "Usage: $0 [editable]"
    exit 1
    ;;
esac

pip install -r requirements.txt
pip install $EDITABLE ./
touch fastapi/main.py
date
