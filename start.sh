#!/bin/bash

# Start the background weather updater
python imd_live_updater.py &

# Start the FastAPI web server
uvicorn main:app --host 0.0.0.0 --port $PORT