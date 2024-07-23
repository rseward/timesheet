#!/bin/bash

# Start FastAPI
cd fastapi/
uvicorn main:app --port 8080 --reload

