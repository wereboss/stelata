/* ==========================================================================
   SPACE CADET KEYBOARD TUTOR - FRONTEND ENGINE
   ========================================================================== */

// --- Audio Synthesizer Class (Web Audio API) ---
class SpaceAudioSynth {
    constructor() {
        this.ctx = null;
        this.muted = true;
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute(btnEl, iconEl) {
        this.muted = !this.muted;
        if (this.muted) {
            btnEl.classList.add('muted');
            iconEl.textContent = '🔈';
            btnEl.innerHTML = '<span id="sound-icon">🔈</span> Sound Off';
        } else {
            this.init();
            btnEl.classList.remove('muted');
            iconEl.textContent = '🔊';
            btnEl.innerHTML = '<span id="sound-icon">🔊</span> Sound On';
            // Play a small entry sound to confirm audio active
            this.playSuccess();
        }
    }

    playPop() {
        if (this.muted) return;
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = 'sine';
        const now = this.ctx.currentTime;
        // Pitch sweep upwards (pop sound)
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(700, now + 0.08);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

        osc.start(now);
        osc.stop(now + 0.08);
    }

    playZap() {
        if (this.muted) return;
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = 'triangle';
        const now = this.ctx.currentTime;
        // Laser chirping down
        osc.frequency.setValueAtTime(900, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        osc.start(now);
        osc.stop(now + 0.15);
    }

    playBuzz() {
        if (this.muted) return;
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = 'sawtooth';
        const now = this.ctx.currentTime;
        // Short low rasp
        osc.frequency.setValueAtTime(130, now);
        osc.frequency.setValueAtTime(110, now + 0.12);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

        osc.start(now);
        osc.stop(now + 0.2);
    }

    playExplode() {
        if (this.muted) return;
        this.init();
        const bufferSize = this.ctx.sampleRate * 0.35;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, this.ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.35);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start();
        noise.stop(this.ctx.currentTime + 0.35);
    }

    playSuccess() {
        if (this.muted) return;
        this.init();
        const now = this.ctx.currentTime;
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25]; // C4, E4, G4, C5, E5
        
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.type = 'sine';
            const noteStart = now + idx * 0.08;
            osc.frequency.setValueAtTime(freq, noteStart);
            
            gain.gain.setValueAtTime(0.12, noteStart);
            gain.gain.exponentialRampToValueAtTime(0.005, noteStart + 0.3);

            osc.start(noteStart);
            osc.stop(noteStart + 0.3);
        });
    }
}

// Initialize sound module
const audio = new SpaceAudioSynth();

// --- Game Engine Variables ---
let mode = 'free'; // 'free', 'falling', 'word'
let score = 0;
let shields = 5;
let currentWord = '';
let currentLetterIdx = 0;
let spawnTimer = null;
let gameActive = false;
let difficulty = 'easy'; // 'easy', 'moderate', 'hard'

// HTML Elements
const scoreValEl = document.getElementById('stat-score');
const shieldsBox = document.getElementById('stat-shield-box');
const shieldsValEl = document.getElementById('stat-shields');
const wordDisplayContainer = document.getElementById('word-display-container');
const wordLettersEl = document.getElementById('word-letters');
const tutorialBanner = document.getElementById('tutorial-banner');
const startOverlay = document.getElementById('start-overlay');
const gameOverOverlay = document.getElementById('game-over-overlay');
const finalScoreValEl = document.getElementById('final-score-val');
const soundBtn = document.getElementById('btn-sound');
const soundIcon = document.getElementById('sound-icon');
const difficultySelectorContainer = document.getElementById('difficulty-selector-container');

// Lists of kid-friendly words
const wordLibrary = [
    "SUN", "MOON", "STAR", "CAT", "DOG", "SHIP", "BOAT", "ROCKET", 
    "PLANET", "ALIEN", "COMET", "SPACE", "EARTH", "ORBIT", "ROBOT", 
    "ASTEROID", "MARS", "JUMP", "PLAY", "TREE", "FISH", "BIRD",
    "FROG", "LION", "DUCK", "COSMOS", "GALAXY", "NEBULA"
];

// Neon color palette
const neonColors = ['#00f0ff', '#ff007f', '#39ff14', '#fff01f', '#bd00ff', '#ff5f00'];

// Canvases Setup
const bgCanvas = document.getElementById('starfield-canvas');
const bgCtx = bgCanvas.getContext('2d');
const gameCanvas = document.getElementById('game-canvas');
const gameCtx = gameCanvas.getContext('2d');

let width = window.innerWidth;
let height = window.innerHeight;

function resizeCanvases() {
    width = window.innerWidth;
    height = window.innerHeight;
    
    bgCanvas.width = width;
    bgCanvas.height = height;
    gameCanvas.width = width;
    gameCanvas.height = height;

    initStars();
    if (rocket) {
        rocket.x = width - 150;
        if (rocket.state === 'idle') {
            rocket.y = height - 220;
        }
    }
}

// --- Starfield Background Logic ---
let stars = [];

function initStars() {
    stars = [];
    const starCount = Math.floor((width * height) / 4000);
    for (let i = 0; i < starCount; i++) {
        stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2 + 0.5,
            twinkleSpeed: 0.01 + Math.random() * 0.03,
            alpha: Math.random(),
            color: Math.random() > 0.8 ? '#a5d6ff' : (Math.random() > 0.9 ? '#ffebb3' : '#ffffff')
        });
    }
}

function updateAndDrawStarfield() {
    bgCtx.clearRect(0, 0, width, height);
    
    stars.forEach(star => {
        star.alpha += star.twinkleSpeed;
        if (star.alpha > 1 || star.alpha < 0.2) {
            star.twinkleSpeed = -star.twinkleSpeed;
        }
        
        bgCtx.fillStyle = star.color;
        bgCtx.globalAlpha = Math.max(0.1, Math.min(star.alpha, 1.0));
        bgCtx.beginPath();
        bgCtx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        bgCtx.fill();
    });
    bgCtx.globalAlpha = 1.0;
}

// --- Game Canvas Entities ---
let floatingLetters = [];
let particles = [];
let rocket = null;

// Particle Class
class Particle {
    constructor(x, y, color, sizeMultiplier = 1) {
        this.x = x;
        this.y = y;
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 4.5;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.size = (Math.random() * 4 + 2) * sizeMultiplier;
        this.color = color;
        this.alpha = 1;
        this.decay = 0.015 + Math.random() * 0.02;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Smoke particle for rocket exhaust
class SmokeParticle {
    constructor(x, y) {
        this.x = x + (Math.random() * 20 - 10);
        this.y = y;
        this.vx = Math.random() * 2 - 1;
        this.vy = 2 + Math.random() * 4; // Drift down
        this.size = Math.random() * 12 + 6;
        this.alpha = 0.8;
        this.decay = 0.01 + Math.random() * 0.02;
        // Warm flame colors changing to smoke grey
        this.color = Math.random() > 0.4 ? '#ff5f00' : '#ffea00';
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.size += 0.25;
        this.alpha -= this.decay;
        if (this.alpha < 0.4) {
            this.color = '#55555d'; // Turns greyish
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Floating Letter Class
class FloatingLetter {
    constructor(char, x = null, fromTop = false) {
        this.char = char.toUpperCase();
        this.fromTop = fromTop;
        
        // Horizontal spacing
        this.x = x !== null ? x : 80 + Math.random() * (width - 160);
        
        if (fromTop) {
            // Spawn at top for falling letters game
            this.y = -50;
            this.vy = 1.0 + Math.random() * 1.5; // slow speed down
        } else {
            // Spawn at bottom for free play
            this.y = height + 40;
            this.vy = -(1.8 + Math.random() * 2.2); // gradual rise up
        }
        
        this.wobbleSpeed = 0.015 + Math.random() * 0.02;
        this.wobbleAmount = 1.5 + Math.random() * 2.5;
        this.wobblePhase = Math.random() * Math.PI * 2;
        
        this.color = neonColors[Math.floor(Math.random() * neonColors.length)];
        this.radius = 52;
        this.alpha = 1.0;
        this.isZapped = false;
        this.hasTriggeredSpawn = false;
    }

    update() {
        this.y += this.vy;
        
        // Wobble horizontally using trig function
        this.wobblePhase += this.wobbleSpeed;
        this.x += Math.sin(this.wobblePhase) * 0.4;

        if (this.fromTop) {
            // Fading out only when zapped, or keep it solid
            if (this.isZapped) {
                this.alpha -= 0.15;
            }
        } else {
            // Gradually fade out as it reaches the top
            // Starts fading once it passes the half-screen mark
            const fadeStart = height * 0.85;
            if (this.y < fadeStart) {
                this.alpha = Math.max(0, this.y / fadeStart);
            }
        }

        // Spawn occasional sparkles
        if (Math.random() > 0.85 && this.alpha > 0.1 && !this.isZapped) {
            particles.push(new Particle(
                this.x + (Math.random() * 40 - 20),
                this.y + (Math.random() * 40 - 20),
                this.color,
                0.5
            ));
        }
    }

    draw(ctx) {
        if (this.alpha <= 0) return;

        ctx.save();
        ctx.globalAlpha = this.alpha;
        
        // Outer Glowing Glass Bubble
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;
        ctx.fillStyle = 'rgba(15, 12, 36, 0.45)';
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Bubble Gloss Reflection
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        // Top-left arc reflection
        ctx.arc(this.x, this.y, this.radius - 8, Math.PI * 1.05, Math.PI * 1.55);
        ctx.stroke();

        // Center Letter
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.font = 'bold 56px Fredoka, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.char, this.x, this.y + 2); // slight correction offset

        ctx.restore();
    }

    zap() {
        this.isZapped = true;
        // Spawn explosion particles
        for (let i = 0; i < 20; i++) {
            particles.push(new Particle(this.x, this.y, this.color, 1.2));
        }
    }
}

// Vector Rocket Object
class SpaceRocket {
    constructor() {
        this.x = width - 150;
        this.y = height - 220;
        this.width = 70;
        this.height = 130;
        this.state = 'idle'; // 'idle', 'launching', 'resetting'
        this.vy = 0;
        this.shakeOffset = 0;
    }

    update() {
        if (this.state === 'launching') {
            this.vy -= 0.22; // Accelerate upwards
            this.y += this.vy;
            this.shakeOffset = Math.sin(Date.now() * 0.1) * 3;
            
            // Spawn fire smoke exhaust
            for (let i = 0; i < 4; i++) {
                particles.push(new SmokeParticle(this.x, this.y + this.height - 10));
            }

            // Boundary check: gone off screen
            if (this.y < -this.height * 2) {
                this.state = 'resetting';
                this.y = height + 100; // start from deep bottom
                this.vy = -3;
            }
        } else if (this.state === 'resetting') {
            this.y += this.vy;
            this.shakeOffset = 0;
            if (this.y <= height - 220) {
                this.y = height - 220;
                this.vy = 0;
                this.state = 'idle';
                // Trigger a new word spawn after resetting
                selectNewWord();
            }
        } else {
            // Idle hover effect
            this.y = (height - 220) + Math.sin(Date.now() * 0.003) * 6;
            this.shakeOffset = 0;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.shakeOffset, this.y);

        // Rocket Boosters / Wings (Side Finns)
        ctx.fillStyle = '#ff007f'; // Pink fins
        ctx.beginPath();
        // Left Fin
        ctx.moveTo(-15, this.height - 20);
        ctx.lineTo(-30, this.height + 10);
        ctx.lineTo(0, this.height - 10);
        ctx.closePath();
        ctx.fill();

        // Right Fin
        ctx.beginPath();
        ctx.moveTo(this.width + 15, this.height - 20);
        ctx.lineTo(this.width + 30, this.height + 10);
        ctx.lineTo(this.width, this.height - 10);
        ctx.closePath();
        ctx.fill();

        // Main cylindrical Rocket Body
        ctx.fillStyle = '#f1f1f9'; // Clean white
        ctx.beginPath();
        ctx.roundRect(0, 20, this.width, this.height - 30, [10, 10, 5, 5]);
        ctx.fill();

        // Nose Cone (Red/Pink dome)
        ctx.fillStyle = '#00f0ff'; // Neon blue nose cone
        ctx.beginPath();
        ctx.moveTo(0, 25);
        ctx.bezierCurveTo(0, -15, this.width, -15, this.width, 25);
        ctx.closePath();
        ctx.fill();

        // Round Cabin Window (Glassmorphic look)
        ctx.fillStyle = 'rgba(15, 12, 36, 0.8)';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.width / 2, 55, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Little Astronaut face (Emoji) inside window
        ctx.font = '22px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('👩‍🚀', this.width / 2, 54);

        // Rocket Engine Nozzle
        ctx.fillStyle = '#444';
        ctx.beginPath();
        ctx.moveTo(this.width / 2 - 15, this.height - 10);
        ctx.lineTo(this.width / 2 + 15, this.height - 10);
        ctx.lineTo(this.width / 2 + 10, this.height);
        ctx.lineTo(this.width / 2 - 10, this.height);
        ctx.closePath();
        ctx.fill();

        // Draw launching flames if moving up
        if (this.state === 'launching') {
            ctx.fillStyle = '#ffea00';
            ctx.beginPath();
            ctx.moveTo(this.width / 2 - 8, this.height);
            ctx.lineTo(this.width / 2, this.height + 25 + Math.random() * 15);
            ctx.lineTo(this.width / 2 + 8, this.height);
            ctx.closePath();
            ctx.fill();
        }

        ctx.restore();
    }

    launch() {
        if (this.state === 'idle') {
            this.state = 'launching';
            this.vy = -1;
        }
    }
}

// Instantiate the rocket
rocket = new SpaceRocket();

// --- Screen Updates & Game loop ---
function gameLoop() {
    // 1. Clear Game Area
    gameCtx.clearRect(0, 0, width, height);

    // 2. Background star field update and render
    updateAndDrawStarfield();

    // 3. Update & Draw Particles (explosions & exhaust)
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw(gameCtx);
        if (p.alpha <= 0) {
            particles.splice(i, 1);
        }
    }

    // 4. Update & Draw Floating letters
    for (let i = floatingLetters.length - 1; i >= 0; i--) {
        const letter = floatingLetters[i];
        letter.update();
        letter.draw(gameCtx);

        // Check bounds / removal
        if (mode === 'free') {
            // Free play letters rise up and fade out
            if (letter.alpha <= 0 || letter.y < -50) {
                floatingLetters.splice(i, 1);
            }
        } else if (mode === 'falling') {
            // Falling mode check bounds
            if (letter.isZapped && letter.alpha <= 0) {
                floatingLetters.splice(i, 1);
            } else if (!letter.isZapped && letter.y > height + 50) {
                // Hits bottom - player loses a shield!
                floatingLetters.splice(i, 1);
                handleShieldLoss();
            }
        }
    }

    // Spawning check for falling letters mode
    if (mode === 'falling' && gameActive) {
        checkAndSpawnFallingLetters();
    }

    // 5. Update & Draw Rocket (Word Mode only)
    if (mode === 'word') {
        rocket.update();
        rocket.draw(gameCtx);
    }

    requestAnimationFrame(gameLoop);
}

// --- Gameplay State Management ---

function setScore(newScore) {
    score = newScore;
    scoreValEl.textContent = score;
}

function handleShieldLoss() {
    shields--;
    audio.playExplode();
    
    // Screen flash red effect
    const container = document.querySelector('.game-container');
    container.style.boxShadow = 'inset 0 0 80px rgba(255, 0, 127, 0.4)';
    setTimeout(() => {
        container.style.boxShadow = 'none';
    }, 200);

    // Update Shield Display
    if (shields >= 0) {
        shieldsValEl.textContent = '🚀'.repeat(shields);
    }
    
    if (shields <= 0) {
        endGame();
    }
}

function endGame() {
    gameActive = false;
    stopSpawning();
    
    // Show game over overlay
    finalScoreValEl.textContent = score;
    gameOverOverlay.style.display = 'block';
    document.getElementById('game-overlay').style.pointerEvents = 'auto';
}

function startGame() {
    setScore(0);
    shields = 5;
    shieldsValEl.textContent = '🚀🚀🚀🚀🚀';
    
    floatingLetters = [];
    particles = [];
    
    startOverlay.style.display = 'none';
    gameOverOverlay.style.display = 'none';
    document.getElementById('game-overlay').style.pointerEvents = 'none';
    
    gameActive = true;
    
    if (mode === 'falling') {
        startSpawning();
    } else if (mode === 'word') {
        selectNewWord();
    }
}

function changeMode(newMode) {
    mode = newMode;
    stopSpawning();
    
    // Clean up
    floatingLetters = [];
    particles = [];
    gameActive = false;

    // Reset overlay styles
    startOverlay.style.display = 'none';
    gameOverOverlay.style.display = 'none';
    document.getElementById('game-overlay').style.pointerEvents = 'none';

    // Toggle displays
    if (mode === 'free') {
        shieldsBox.style.display = 'none';
        wordDisplayContainer.style.display = 'none';
        tutorialBanner.style.display = 'block';
        difficultySelectorContainer.style.display = 'none';
        gameActive = true; // Sandbox is always active
    } else if (mode === 'falling') {
        shieldsBox.style.display = 'flex';
        wordDisplayContainer.style.display = 'none';
        tutorialBanner.style.display = 'none';
        difficultySelectorContainer.style.display = 'block';
        document.getElementById('btn-start-game').style.display = 'none'; // Hide Start Mission button, since clicking a difficulty starts the game
        
        // Show start screen overlay
        document.getElementById('overlay-title').textContent = "Asteroid Storm! ☄️";
        document.getElementById('overlay-desc').textContent = "Select a difficulty below to launch the mission. Save our shields!";
        startOverlay.style.display = 'block';
        document.getElementById('game-overlay').style.pointerEvents = 'auto';
    } else if (mode === 'word') {
        shieldsBox.style.display = 'none';
        wordDisplayContainer.style.display = 'block';
        tutorialBanner.style.display = 'none';
        difficultySelectorContainer.style.display = 'none';
        document.getElementById('btn-start-game').style.display = 'inline-block'; // Show for Word mode
        
        // Show start screen overlay
        document.getElementById('overlay-title').textContent = "Word Launch Mission! 🪐";
        document.getElementById('overlay-desc').textContent = "Spell the words correctly to fuel the rocket and blast off into deep space!";
        startOverlay.style.display = 'block';
        document.getElementById('game-overlay').style.pointerEvents = 'auto';
    }
}

// --- Spawning Logic (Falling Letters Mode) ---
function startSpawning() {
    // Legacy support: now we spawn the first wave in startGame()
    spawnFallingLetterWave();
}

function stopSpawning() {
    // No-op: handled by game state and position checks
}

function getActiveFallingLetters() {
    return floatingLetters.filter(l => l.fromTop && !l.isZapped);
}

function spawnFallingLetterWave() {
    const pool = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    
    if (difficulty === 'hard') {
        // Spawn two letters
        const char1 = pool.charAt(Math.floor(Math.random() * pool.length));
        let char2 = pool.charAt(Math.floor(Math.random() * pool.length));
        while (char2 === char1) {
            char2 = pool.charAt(Math.floor(Math.random() * pool.length));
        }
        
        // Horizontal positions spaced out
        const x1 = 80 + Math.random() * (width / 2 - 120);
        const x2 = width / 2 + 40 + Math.random() * (width / 2 - 120);
        
        const l1 = new FloatingLetter(char1, x1, true);
        const l2 = new FloatingLetter(char2, x2, true);
        
        l1.hasTriggeredSpawn = false;
        l2.hasTriggeredSpawn = false;
        
        floatingLetters.push(l1, l2);
    } else {
        // Spawn one letter
        const char = pool.charAt(Math.floor(Math.random() * pool.length));
        const l = new FloatingLetter(char, null, true);
        l.hasTriggeredSpawn = false;
        floatingLetters.push(l);
    }
}

function checkAndSpawnFallingLetters() {
    const active = getActiveFallingLetters();
    
    if (active.length === 0) {
        spawnFallingLetterWave();
        return;
    }
    
    // Find the oldest letter (largest y coordinate)
    let oldest = active[0];
    for (let i = 1; i < active.length; i++) {
        if (active[i].y > oldest.y) {
            oldest = active[i];
        }
    }
    
    // Check if the oldest letter has not triggered a spawn yet, and has crossed the threshold
    if (!oldest.hasTriggeredSpawn) {
        let threshold = height * 0.8; // Easy: bottom 1/5th (crosses 4/5ths height)
        if (difficulty === 'moderate') {
            threshold = height * (2 / 3); // Moderate: bottom 1/3rd (crosses 2/3rds height)
        } else if (difficulty === 'hard') {
            threshold = height * 0.5; // Hard: bottom 1/2 (crosses 1/2 height)
        }
        
        if (oldest.y >= threshold) {
            // Mark all current active letters as having triggered the spawn
            active.forEach(l => l.hasTriggeredSpawn = true);
            
            spawnFallingLetterWave();
        }
    }
}

// --- Word Launch Mode Logic ---
function selectNewWord() {
    const randomIndex = Math.floor(Math.random() * wordLibrary.length);
    currentWord = wordLibrary[randomIndex];
    currentLetterIdx = 0;
    
    renderWordHTML();
}

function renderWordHTML() {
    wordLettersEl.innerHTML = '';
    
    for (let i = 0; i < currentWord.length; i++) {
        const span = document.createElement('span');
        span.textContent = currentWord[i];
        span.className = 'word-letter';
        if (i < currentLetterIdx) {
            span.classList.add('correct');
        } else if (i === currentLetterIdx) {
            span.classList.add('current');
        }
        wordLettersEl.appendChild(span);
    }
}

function handleWordKeyPress(char) {
    if (rocket.state !== 'idle') return; // wait for rocket to finish animation

    const targetChar = currentWord[currentLetterIdx];
    
    if (char === targetChar) {
        // Success for this letter
        audio.playPop();
        
        // Spawn success splash particles around the word card center
        const card = document.querySelector('.word-card');
        const rect = card.getBoundingClientRect();
        const letterSpan = wordLettersEl.children[currentLetterIdx];
        const spanRect = letterSpan.getBoundingClientRect();
        const px = spanRect.left + spanRect.width / 2;
        const py = spanRect.top + spanRect.height / 2;
        
        for (let i = 0; i < 8; i++) {
            particles.push(new Particle(px, py, '#39ff14', 0.8));
        }

        currentLetterIdx++;
        renderWordHTML();
        
        // Did we finish the word?
        if (currentLetterIdx >= currentWord.length) {
            setScore(score + 10); // Word launch bonus points
            audio.playSuccess();
            rocket.launch();
        }
    } else {
        // Wrong letter
        audio.playBuzz();
        
        // Shake the word card
        const card = document.querySelector('.word-card');
        card.classList.add('shake-element');
        setTimeout(() => {
            card.classList.remove('shake-element');
        }, 400);
    }
}

// --- Input / Keyboard Listener ---
window.addEventListener('keydown', (e) => {
    // Prevent default scrolling for Spacebar
    if (e.code === "Space") {
        e.preventDefault();
    }

    // Ignore commands (Ctrl/Alt/Meta shortcuts)
    if (e.ctrlKey || e.altKey || e.metaKey) return;

    // Filter printable single characters (a-z, 0-9, space, symbols)
    const key = e.key.toUpperCase();
    if (key.length !== 1) return;

    // 1. FREE PLAY Mode
    if (mode === 'free') {
        audio.playPop();
        // Spawns a floating bubble
        floatingLetters.push(new FloatingLetter(e.key));
        setScore(score + 1);
    } 
    
    // 2. FALLING LETTERS Mode
    else if (mode === 'falling' && gameActive) {
        // Search active falling letters for lowest target key matching this char
        let matched = false;
        let matchedIndex = -1;
        let lowestY = -1;

        for (let i = 0; i < floatingLetters.length; i++) {
            const letter = floatingLetters[i];
            if (!letter.isZapped && letter.char === key) {
                // Find the lowest one (highest Y value) on the screen to prioritize
                if (letter.y > lowestY) {
                    lowestY = letter.y;
                    matchedIndex = i;
                    matched = true;
                }
            }
        }

        if (matched) {
            audio.playZap();
            floatingLetters[matchedIndex].zap();
            setScore(score + 5);
        } else {
            audio.playBuzz();
        }
    } 
    
    // 3. WORD LAUNCH Mode
    else if (mode === 'word' && gameActive) {
        handleWordKeyPress(key);
    }
});

// --- Mouse / Touch Interactivity (Easter Egg: Popping bubbles) ---
gameCanvas.addEventListener('mousedown', (e) => {
    const rect = gameCanvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Check if clicked any active floating letter bubble
    for (let i = 0; i < floatingLetters.length; i++) {
        const letter = floatingLetters[i];
        if (!letter.isZapped && letter.alpha > 0.1) {
            const dx = mouseX - letter.x;
            const dy = mouseY - letter.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < letter.radius + 10) {
                // POP!
                audio.playZap();
                letter.zap();
                if (mode === 'free') {
                    setScore(score + 2);
                } else if (mode === 'falling' && gameActive) {
                    setScore(score + 5);
                }
                break;
            }
        }
    }
});

// --- Navigation / Buttons Event Handlers ---

// Modes toggles
document.getElementById('btn-free').addEventListener('click', (e) => {
    setActiveModeButton(e.currentTarget);
    changeMode('free');
});
document.getElementById('btn-falling').addEventListener('click', (e) => {
    setActiveModeButton(e.currentTarget);
    changeMode('falling');
});
document.getElementById('btn-word').addEventListener('click', (e) => {
    setActiveModeButton(e.currentTarget);
    changeMode('word');
});

function setActiveModeButton(btn) {
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

// Audio Toggle Button
soundBtn.addEventListener('click', () => {
    audio.toggleMute(soundBtn, soundIcon);
});

// Difficulty Selection Event Delegation (supports both cards and legacy buttons to bypass browser cache mismatches)
document.addEventListener('click', (e) => {
    const card = e.target.closest('.diff-card, .diff-btn');
    if (card) {
        difficulty = card.dataset.diff;
        startGame();
    }
});

// Action buttons (Start / Play Again)
document.getElementById('btn-start-game').addEventListener('click', () => {
    startGame();
});
document.getElementById('btn-restart-game').addEventListener('click', () => {
    startGame();
});

// --- Init Application ---
window.addEventListener('resize', resizeCanvases);

// Run initial canvas scaling and trigger game loops
resizeCanvases();
changeMode('free'); // Start in sandbox mode by default
gameLoop();
