#!/usr/bin/env python3
import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse

app = FastAPI(title="Space Cadet Keyboard Tutor")

# Create static directory if it doesn't exist
os.makedirs("static", exist_ok=True)

# Redirect root path to index.html
@app.get("/")
async def root():
    return RedirectResponse(url="/static/index.html")

# Mount the static files directory
app.mount("/static", StaticFiles(directory="static"), name="static")

if __name__ == "__main__":
    import uvicorn
    # Start the server on port 9027
    uvicorn.run("main:app", host="0.0.0.0", port=9027, reload=True)
