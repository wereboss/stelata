#!/bin/sh

# Create the virtual environment if it does not exist
test -d .venv || python3 -m venv .venv || python -m venv .venv

# Install requirements if pip is available
test -f .venv/bin/pip && .venv/bin/pip install -r requirements.txt

# Run the main program using the virtual environment's python executable
exec .venv/bin/python3 main.py || exec .venv/bin/python main.py
