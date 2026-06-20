# Space Cadet Keyboard Explorer 🚀⭐🪐

An interactive, space-themed typing game and tutor built for kids and future space explorers. Learn the keyboard layout through engaging visual effects, interactive game modes, and space missions!

The application is powered by a **FastAPI** backend that hosts a responsive, canvas-based HTML5/CSS3 frontend.

---

## 🎮 Game Modes

1. **🎈 Free Play:** 
   Perfect for beginners! Type any letter or number on the keyboard to watch it materialize and fly across the starfield with colorful particle effects.
   
2. **⭐ Falling Letters:** 
   A defense mission! Letters fall from space towards your ship. Type the correct letters to zap them before they hit your shields. Keep your shields up to survive!

3. **🪐 Word Launch:** 
   Type entire words letter-by-letter to fuel and launch space rockets into orbit. Great for practicing vocabulary and speed.

---

## 🛠️ Features

- **Dynamic Starfield Background:** A live canvas-based animation of moving and twinkling stars.
- **Sound Effects:** Toggleable audio guidance and feedback (can be muted).
- **Mission Stats:** Real-time tracking of **Stars Collected** (score) and **Shields** (health).
- **Responsive Web UI:** Built with custom typography (Fredoka font) and glassmorphic designs.
- **Python Backend:** Fast and lightweight serving via FastAPI and Uvicorn.

---

## 🚀 Getting Started

### Prerequisites

Ensure you have **Python 3.8+** installed on your system.

### Running the App (Fast & Easy)

We have provided a shell-agnostic `run.sh` script that works seamlessly in **Bash**, **Sh**, and **Fish** shells. It will automatically initialize the virtual environment, install requirements, and boot up the server:

```bash
# Execute the run script
./run.sh
```

Once running, open your browser and navigate to:
👉 **[http://localhost:9027](http://localhost:9027)**

---

### Manual Setup (Optional)

If you prefer to set up and run the application manually:

1. **Create a virtual environment:**
   ```bash
   python3 -m venv .venv
   ```

2. **Activate the environment:**
   * **Bash/Zsh:** `source .venv/bin/activate`
   * **Fish:** `source .venv/bin/activate.fish`

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Start the FastAPI application:**
   ```bash
   python3 main.py
   ```

---

## 🧪 Testing

The repository includes a suite of unit tests to verify the FastAPI backend.

To run the tests:
1. Ensure your virtual environment is active.
2. Execute pytest:
   ```bash
   pytest
   ```

---

## 📂 Project Structure

- [main.py](file:///home/sayang/Programs/stelata/main.py) - Entrypoint file setting up the FastAPI app and mounting static assets.
- [fetch_webpage.py](file:///home/sayang/Programs/stelata/fetch_webpage.py) - Helper scripts for extracting web page assets.
- [run.sh](file:///home/sayang/Programs/stelata/run.sh) - Shell-agnostic startup script.
- [requirements.txt](file:///home/sayang/Programs/stelata/requirements.txt) - Core package dependencies.
- [test_main.py](file:///home/sayang/Programs/stelata/test_main.py) - Backend unit tests.
- [static/](file:///home/sayang/Programs/stelata/static/) - Frontend resources directory:
  - [index.html](file:///home/sayang/Programs/stelata/static/index.html) - Main markup structure.
  - [styles.css](file:///home/sayang/Programs/stelata/static/styles.css) - Game stylesheets and space visual design.
  - [app.js](file:///home/sayang/Programs/stelata/static/app.js) - Core game loop and canvas logic.
