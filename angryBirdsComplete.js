// Complete Angry Birds Game - All in One File
class AngryBirdsGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Core systems
        this.physics = new PhysicsEngine();
        this.saveSystem = new SaveSystem();
        
        // Game state
        this.currentScreen = 'menu';
        this.currentLevel = null;
        this.levelId = 1;
        
        // Game objects
        this.birds = [];
        this.activeBird = null;
        this.launchedBirds = [];
        this.pigs = [];
        this.structures = [];
        this.particles = [];
        this.explosions = [];
        this.floatingTexts = [];
        
        // Slingshot
        this.slingshot = { x: 150, y: 600, width: 40, height: 120 };
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
        this.dragEnd = { x: 0, y: 0 };
        this.maxDrag = 400;
        
        // Game stats
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.birdsUsed = 0;
        this.structuresDestroyed = 0;
        this.levelStartTime = 0;
        
        // Settings
        this.settings = this.saveSystem.getSettings();
        this.showTrajectory = this.settings.showTrajectory;
        
        // Audio
        this.audioContext = null;
        this.initAudio();
        
        // Animation
        this.lastFrameTime = 0;
        this.gameLoop = this.gameLoop.bind(this);
        
        // UI State
        this.selectedLevel = 1;
        this.hoveredLevel = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadMainMenu();
        requestAnimationFrame(this.gameLoop);
    }

    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Audio not supported');
        }
    }

    playSound(frequency, duration, type = 'sine', volume = 0.1) {
        if (!this.audioContext || !this.settings.soundEnabled) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = type;
            
            gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (e) {
            console.log('Sound playback error:', e);
        }
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.handleMouseDown(touch);
        }, { passive: false });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.handleMouseMove(touch);
        }, { passive: false });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.handleMouseUp(e);
        }, { passive: false });

        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    handleMouseDown(e) {
        const pos = this.getMousePos(e);

        switch (this.currentScreen) {
            case 'menu':
                if (pos.x > 350 && pos.x < 650 && pos.y > 300 && pos.y < 380) {
                    this.loadLevelSelect();
                    this.playSound(500, 0.2, 'sine');
                }
                break;
            case 'levelSelect':
                if (pos.x > 20 && pos.x < 120 && pos.y > 20 && pos.y < 70) {
                    this.loadMainMenu();
                    this.playSound(400, 0.2, 'sine');
                    return;
                }
                
                const startX = 200, startY = 150, buttonSize = 120, gap = 30;
                for (let i = 0; i < 8; i++) {
                    const col = i % 4;
                    const row = Math.floor(i / 4);
                    const x = startX + col * (buttonSize + gap);
                    const y = startY + row * (buttonSize + gap);

                    if (pos.x > x && pos.x < x + buttonSize && pos.y > y && pos.y < y + buttonSize) {
                        const levelId = i + 1;
                        if (this.saveSystem.isLevelUnlocked(levelId)) {
                            this.loadLevel(levelId);
                        } else {
                            this.playSound(200, 0.2, 'sawtooth');
                        }
                        return;
                    }
                }
                break;
            case 'game':
                if (pos.x > 920 && pos.x < 980 && pos.y > 20 && pos.y < 70) {
                    this.pauseGame();
                    return;
                }
                if (pos.x > 820 && pos.x < 900 && pos.y > 20 && pos.y < 70) {
                    this.restartLevel();
                    return;
                }
                
                if (this.activeBird && !this.activeBird.isLaunched) {
                    const dx = pos.x - this.activeBird.x;
                    const dy = pos.y - this.activeBird.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance <= this.activeBird.radius + 10) {
                        this.isDragging = true;
                        this.dragStart = { x: pos.x, y: pos.y };
                        this.dragEnd = { x: pos.x, y: pos.y };
                    }
                }
                break;
            case 'pause':
                if (pos.x > 350 && pos.x < 650 && pos.y > 250 && pos.y < 320) {
                    this.resumeGame();
                } else if (pos.x > 350 && pos.x < 650 && pos.y > 340 && pos.y < 410) {
                    this.restartLevel();
                } else if (pos.x > 350 && pos.x < 650 && pos.y > 430 && pos.y < 500) {
                    this.loadLevelSelect();
                }
                break;
            case 'victory':
            case 'gameOver':
                if (pos.x > 350 && pos.x < 500 && pos.y > 450 && pos.y < 520) {
                    if (this.currentScreen === 'victory') {
                        this.nextLevel();
                    } else {
                        this.restartLevel();
                    }
                } else if (pos.x > 520 && pos.x < 670 && pos.y > 450 && pos.y < 520) {
                    this.loadLevelSelect();
                }
                break;
        }
    }

    handleMouseMove(e) {
        const pos = this.getMousePos(e);

        if (this.currentScreen === 'levelSelect') {
            const startX = 200, startY = 150, buttonSize = 120, gap = 30;
            this.hoveredLevel = null;

            for (let i = 0; i < 8; i++) {
                const col = i % 4;
                const row = Math.floor(i / 4);
                const x = startX + col * (buttonSize + gap);
                const y = startY + row * (buttonSize + gap);

                if (pos.x > x && pos.x < x + buttonSize && pos.y > y && pos.y < y + buttonSize) {
                    this.hoveredLevel = i + 1;
                    return;
                }
            }
        }

        if (this.isDragging && this.activeBird && this.currentScreen === 'game') {
            this.dragEnd = { x: pos.x, y: pos.y };
            
            const dx = this.slingshot.x - this.dragEnd.x;
            const dy = this.slingshot.y - this.dragEnd.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > this.maxDrag) {
                const angle = Math.atan2(dy, dx);
                this.dragEnd.x = this.slingshot.x - Math.cos(angle) * this.maxDrag;
                this.dragEnd.y = this.slingshot.y - Math.sin(angle) * this.maxDrag;
            }

            this.activeBird.x = this.dragEnd.x;
            this.activeBird.y = this.dragEnd.y;
        }
    }

    handleMouseUp(e) {
        if (this.isDragging && this.activeBird && this.currentScreen === 'game') {
            this.isDragging = false;
            this.launchBird();
        }
    }

    handleKeyDown(e) {
        if (e.key === 'Escape' && this.currentScreen === 'game') {
            this.pauseGame();
        } else if (e.key === ' ' && this.currentScreen === 'game' && this.activeBird) {
            this.useAbility();
        }
    }

    loadMainMenu() {
        this.currentScreen = 'menu';
        this.updateUI();
    }

    loadLevelSelect() {
        this.currentScreen = 'levelSelect';
        this.selectedLevel = 1;
        this.updateUI();
    }

    loadLevel(levelId) {
        this.levelId = levelId;
        this.currentLevel = LevelData.getLevelById(levelId);
        
        if (!this.currentLevel) {
            console.error('Level not found:', levelId);
            return;
        }

        if (!this.saveSystem.isLevelUnlocked(levelId)) {
            this.playSound(200, 0.2, 'sawtooth');
            return;
        }

        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.birdsUsed = 0;
        this.structuresDestroyed = 0;
        this.levelStartTime = Date.now();
        
        this.birds = [];
        this.launchedBirds = [];
        this.pigs = [];
        this.structures = [];
        this.particles = [];
        this.explosions = [];
        this.floatingTexts = [];
        
        this.loadLevelObjects();
        
        this.currentScreen = 'game';
        this.playSound(400, 0.3, 'sine');
        this.updateUI();
    }

    loadLevelObjects() {
        let birdX = this.slingshot.x + 60;
        this.currentLevel.birds.forEach(birdGroup => {
            for (let i = 0; i < birdGroup.count; i++) {
                const bird = BirdFactory.createBird(birdGroup.type, birdX, this.slingshot.y);
                this.birds.push(bird);
                birdX += 40;
            }
        });

        if (this.birds.length > 0) {
            this.activeBird = this.birds[0];
            this.activeBird.isActive = true;
            this.activeBird.x = this.slingshot.x;
            this.activeBird.y = this.slingshot.y;
        }

        this.currentLevel.structures.forEach(structData => {
            const structure = StructureFactory.createStructure(
                structData.type, structData.x, structData.y,
                structData.width, structData.height, structData.health
            );
            this.structures.push(structure);
        });

        this.currentLevel.pigs.forEach(pigData => {
            const pig = PigFactory.createPig(pigData.type, pigData.x, pigData.y, pigData.points);
            this.pigs.push(pig);
        });
    }

    pauseGame() {
        if (this.currentScreen === 'game') {
            this.currentScreen = 'pause';
            this.playSound(300, 0.2, 'sine');
        }
    }

    resumeGame() {
        if (this.currentScreen === 'pause') {
            this.currentScreen = 'game';
            this.playSound(400, 0.2, 'sine');
        }
    }

    restartLevel() {
        this.loadLevel(this.levelId);
    }

    nextLevel() {
        const next = LevelData.getNextLevel(this.levelId);
        if (next) {
            this.loadLevel(next.id);
        } else {
            this.loadLevelSelect();
        }
    }

    launchBird() {
        if (!this.activeBird || this.activeBird.isLaunched) return;

        const dx = this.slingshot.x - this.activeBird.x;
        const dy = this.slingshot.y - this.activeBird.y;
        const power = Math.sqrt(dx * dx + dy * dy);

        if (power < 10) {
            this.activeBird.x = this.slingshot.x;
            this.activeBird.y = this.slingshot.y;
            return;
        }

        const angle = Math.atan2(dy, dx);
        const velocity = Math.min(power * 0.35, 50);

        this.activeBird.vx = Math.cos(angle) * velocity;
        this.activeBird.vy = Math.sin(angle) * velocity;
        this.activeBird.isLaunched = true;
        this.activeBird.angularVelocity = (Math.random() - 0.5) * 0.3;

        this.birdsUsed++;
        this.launchedBirds.push(this.activeBird);

        this.playSound(400, 0.3, 'sawtooth', 0.15);

        const currentIndex = this.birds.indexOf(this.activeBird);
        if (currentIndex < this.birds.length - 1) {
            setTimeout(() => {
                this.activeBird = this.birds[currentIndex + 1];
                this.activeBird.isActive = true;
                this.activeBird.x = this.slingshot.x;
                this.activeBird.y = this.slingshot.y;
            }, 1000);
        } else {
            this.activeBird = null;
        }
    }

    useAbility() {
        // Ability implementation would go here
        console.log('Ability used!');
    }

    update(deltaTime) {
        if (this.currentScreen !== 'game') return;

        this.launchedBirds.forEach((bird, index) => {
            this.physics.applyGravity(bird);
            this.physics.applyAirResistance(bird);
            this.physics.updatePosition(bird);
            bird.angle += bird.angularVelocity;

            if (bird.y > 750 || bird.x > 1100 || bird.x < -100) {
                this.launchedBirds.splice(index, 1);
            }
        });

        this.pigs.forEach(pig => {
            if (pig.vx !== 0 || pig.vy !== 0) {
                this.physics.applyGravity(pig);
                this.physics.applyAirResistance(pig);
                this.physics.updatePosition(pig);
                pig.angle += pig.angularVelocity;

                if (pig.y + pig.radius > 680) {
                    pig.y = 680 - pig.radius;
                    pig.vy *= -0.5;
                    pig.vx *= 0.8;
                    if (Math.abs(pig.vy) < 1) pig.vy = 0;
                }
            }
        });

        this.structures.forEach(structure => {
            if (structure.vx !== 0 || structure.vy !== 0) {
                this.physics.applyGravity(structure);
                this.physics.applyAirResistance(structure);
                this.physics.updatePosition(structure);
                structure.angle += structure.angularVelocity;

                if (structure.y + structure.height > 680) {
                    structure.y = 680 - structure.height;
                    structure.vy *= -0.3;
                    structure.vx *= 0.7;
                    if (Math.abs(structure.vy) < 0.5) structure.vy = 0;
                }
            }
        });

        this.checkCollisions();
        this.updateParticles();
        this.updateExplosions();
        this.updateFloatingTexts();
        this.checkGameState();
    }

    checkCollisions() {
        this.launchedBirds.forEach(bird => {
            this.pigs.forEach((pig, pigIndex) => {
                const collision = this.physics.checkCircleCollision(bird, pig);
                if (collision.collided) {
                    this.physics.resolveCollision(bird, pig, collision);
                    this.physics.separateObjects(bird, pig, collision);
                    
                    pig.health -= bird.damage || 50;
                    this.playSound(250, 0.15, 'triangle', 0.1);
                    
                    if (pig.health <= 0) {
                        this.destroyPig(pig, pigIndex);
                    }
                    
                    this.createImpactParticles(pig.x, pig.y, 10, pig.color);
                }
            });

            this.structures.forEach((structure, strIndex) => {
                const collision = this.physics.checkCircleRectCollision(bird, structure);
                if (collision.collided) {
                    this.physics.resolveCollision(bird, structure, collision);
                    this.physics.separateObjects(bird, structure, collision);
                    
                    structure.health -= bird.damage || 50;
                    this.playSound(300, 0.12, 'sawtooth', 0.08);
                    
                    if (structure.health <= 0) {
                        this.destroyStructure(structure, strIndex);
                    }
                    
                    this.createImpactParticles(collision.point.x, collision.point.y, 8, structure.color);
                }
            });
        });
    }

    destroyPig(pig, index) {
        this.pigs.splice(index, 1);
        this.score += pig.points;
        this.combo++;
        this.maxCombo = Math.max(this.maxCombo, this.combo);
        
        if (this.combo > 1) {
            const bonus = this.combo * 100;
            this.score += bonus;
            this.createFloatingText(`+${bonus} COMBO!`, pig.x, pig.y - 30, '#FF69B4', 24);
        }
        
        this.createFloatingText(`+${pig.points}`, pig.x, pig.y, '#90EE90', 20);
        this.createExplosion(pig.x, pig.y, 40, 0);
        this.playSound(200, 0.3, 'square', 0.12);
        
        this.updateUI();
    }

    destroyStructure(structure, index) {
        this.structures.splice(index, 1);
        this.structuresDestroyed++;
        this.score += 100;
        
        this.createDebris(structure);
        this.updateUI();
    }

    createExplosion(x, y, radius, damage) {
        this.explosions.push({
            x: x, y: y, radius: 0, maxRadius: radius,
            life: 30, maxLife: 30, color: '#FF4500'
        });
        
        for (let i = 0; i < 15; i++) {
            const angle = (Math.PI * 2 * i) / 15;
            this.particles.push({
                x: x, y: y,
                vx: Math.cos(angle) * (Math.random() * 10 + 5),
                vy: Math.sin(angle) * (Math.random() * 10 + 5),
                life: 30, maxLife: 30,
                color: `hsl(${Math.random() * 60}, 70%, 50%)`,
                size: Math.random() * 4 + 2
            });
        }
    }

    createImpactParticles(x, y, count, color) {
        for (let i = 0; i < Math.min(count, 5); i++) {
            this.particles.push({
                x: x, y: y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 20, maxLife: 20,
                color: color, size: Math.random() * 3 + 2
            });
        }
    }

    createDebris(structure) {
        const pieces = 4;
        for (let i = 0; i < pieces; i++) {
            this.particles.push({
                x: structure.x + Math.random() * structure.width,
                y: structure.y + Math.random() * structure.height,
                vx: (Math.random() - 0.5) * 15,
                vy: (Math.random() - 0.5) * 15 - 5,
                life: 40, maxLife: 40,
                color: structure.color,
                size: Math.random() * 8 + 4,
                isDebris: true
            });
        }
    }

    createFloatingText(text, x, y, color, size = 20) {
        this.floatingTexts.push({
            text: text, x: x, y: y,
            vx: (Math.random() - 0.5) * 3, vy: -4,
            life: 60, maxLife: 60,
            color: color, size: size
        });
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            if (p.isDebris) p.vy += 0.5;
            
            p.vx *= 0.98;
            p.vy *= 0.98;
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            
            if (p.life <= 0 || p.y > 700) {
                this.particles.splice(i, 1);
            }
        }
    }

    updateExplosions() {
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            const e = this.explosions[i];
            e.radius += e.maxRadius / e.maxLife * 2;
            e.life--;
            
            if (e.life <= 0) {
                this.explosions.splice(i, 1);
            }
        }
    }

    updateFloatingTexts() {
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const t = this.floatingTexts[i];
            t.x += t.vx;
            t.y += t.vy;
            t.vy += 0.15;
            t.life--;
            
            if (t.life <= 0) {
                this.floatingTexts.splice(i, 1);
            }
        }
    }

    checkGameState() {
        if (this.pigs.length === 0 && this.currentScreen === 'game') {
            const levelTime = (Date.now() - this.levelStartTime) / 1000;
            
            const unusedBirds = this.birds.length - this.birdsUsed;
            const birdBonus = unusedBirds * 10000;
            const timeBonus = levelTime < 30 ? 5000 : levelTime < 60 ? 2000 : 0;
            const comboBonus = this.maxCombo * 500;
            
            this.score += birdBonus + timeBonus + comboBonus;
            
            const stars = this.calculateStars();
            
            this.saveSystem.saveLevelProgress(this.levelId, stars, this.score);
            
            this.currentScreen = 'victory';
            this.playSound(800, 1, 'sine', 0.2);
            this.updateUI();
            return;
        }
        
        const allBirdsGone = this.birds.every(b => b.isLaunched) && 
                             this.launchedBirds.every(b => this.physics.isAtRest(b));
        const allObjectsAtRest = this.pigs.every(p => this.physics.isAtRest(p)) &&
                                 this.structures.every(s => this.physics.isAtRest(s));
        
        if (allBirdsGone && allObjectsAtRest && this.pigs.length > 0 && this.currentScreen === 'game') {
            setTimeout(() => {
                if (this.pigs.length > 0) {
                    this.currentScreen = 'gameOver';
                    this.playSound(200, 1, 'sawtooth', 0.15);
                    this.updateUI();
                }
            }, 2000);
        }
    }

    calculateStars() {
        const level = this.currentLevel;
        if (this.score >= level.stars.three) return 3;
        if (this.score >= level.stars.two) return 2;
        if (this.score >= level.stars.one) return 1;
        return 0;
    }

    updateUI() {
        const scoreEl = document.getElementById('score');
        const birdsEl = document.getElementById('birds-left');
        const levelEl = document.getElementById('level-name');
        
        if (scoreEl) scoreEl.textContent = this.score;
        if (birdsEl) birdsEl.textContent = this.birds.length - this.birdsUsed;
        if (levelEl && this.currentLevel) levelEl.textContent = this.currentLevel.name;
    }

    gameLoop(timestamp) {
        if (!this.lastFrameTime) this.lastFrameTime = timestamp;
        const deltaTime = timestamp - this.lastFrameTime;
        this.lastFrameTime = timestamp;
        
        // Cap delta time to prevent huge jumps
        const cappedDelta = Math.min(deltaTime, 32);
        
        this.update(cappedDelta / 16.67);
        this.render();
        
        requestAnimationFrame(this.gameLoop);
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        switch (this.currentScreen) {
            case 'menu':
                this.renderMainMenu();
                break;
            case 'levelSelect':
                this.renderLevelSelect();
                break;
            case 'game':
                this.renderGame();
                break;
            case 'pause':
                this.renderGame();
                this.renderPauseMenu();
                break;
            case 'victory':
                this.renderGame();
                this.renderVictoryScreen();
                break;
            case 'gameOver':
                this.renderGame();
                this.renderGameOverScreen();
                break;
        }
    }

    renderMainMenu() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, 700);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#98FB98');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, 1000, 700);
        
        this.ctx.save();
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowOffsetX = 3;
        this.ctx.shadowOffsetY = 3;
        
        this.ctx.fillStyle = '#FF6B6B';
        this.ctx.font = 'bold 80px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('ANGRY BIRDS', 500, 180);
        
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 76px Arial';
        this.ctx.fillText('ANGRY BIRDS', 497, 177);
        
        this.ctx.restore();
        
        this.drawButton(350, 300, 300, 80, '#4CAF50', 'PLAY', 40);
        
        const totalStars = this.saveSystem.getTotalStars();
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = '30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`⭐ Total Stars: ${totalStars} / 24`, 500, 450);
    }

    renderLevelSelect() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, 700);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#E6F3FF');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, 1000, 700);
        
        this.drawButton(20, 20, 100, 50, '#FF6B6B', '← Back', 20);
        
        this.ctx.fillStyle = '#333';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('SELECT LEVEL', 500, 100);
        
        const startX = 200, startY = 150, buttonSize = 120, gap = 30;
        
        for (let i = 0; i < 8; i++) {
            const col = i % 4;
            const row = Math.floor(i / 4);
            const x = startX + col * (buttonSize + gap);
            const y = startY + row * (buttonSize + gap);
            const levelId = i + 1;
            
            const levelData = this.saveSystem.getLevelData(levelId);
            const isUnlocked = this.saveSystem.isLevelUnlocked(levelId);
            const isHovered = this.hoveredLevel === levelId;
            
            this.renderLevelButton(x, y, buttonSize, levelId, levelData, isUnlocked, isHovered);
        }
    }

    renderLevelButton(x, y, size, levelId, data, unlocked, hovered) {
        this.ctx.save();
        
        if (hovered && unlocked) {
            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            this.ctx.shadowBlur = 15;
            this.ctx.shadowOffsetY = 5;
        }
        
        if (!unlocked) {
            this.ctx.fillStyle = '#CCCCCC';
        } else if (data.stars === 3) {
            this.ctx.fillStyle = '#FFD700';
        } else if (data.stars === 2) {
            this.ctx.fillStyle = '#C0C0C0';
        } else if (data.stars === 1) {
            this.ctx.fillStyle = '#CD7F32';
        } else {
            this.ctx.fillStyle = '#4CAF50';
        }
        
        this.roundRect(x, y, size, size, 15);
        this.ctx.fill();
        
        this.ctx.strokeStyle = unlocked ? '#333' : '#999';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
        
        this.ctx.restore();
        
        if (!unlocked) {
            this.ctx.fillStyle = '#666';
            this.ctx.font = '48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('🔒', x + size / 2, y + size / 2);
        } else {
            this.ctx.fillStyle = '#FFF';
            this.ctx.font = 'bold 42px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(levelId, x + size / 2, y + size / 2 - 15);
            
            const stars = data.stars || 0;
            const starY = y + size - 25;
            const starSpacing = 35;
            const startStarX = x + size / 2 - (starSpacing * (stars - 1)) / 2;
            
            this.ctx.font = '24px Arial';
            for (let i = 0; i < stars; i++) {
                this.ctx.fillText('⭐', startStarX + i * starSpacing, starY);
            }
        }
    }

    renderGame() {
        this.renderBackground();
        this.renderGround();
        
        this.structures.forEach(s => this.renderStructure(s));
        this.pigs.forEach(p => this.renderPig(p));
        this.renderSlingshot();
        
        this.birds.forEach(b => !b.isLaunched && this.renderBird(b));
        this.launchedBirds.forEach(b => this.renderBird(b));
        
        if (this.isDragging && this.showTrajectory) {
            this.renderTrajectory();
        }
        
        this.particles.forEach(p => this.renderParticle(p));
        this.explosions.forEach(e => this.renderExplosion(e));
        this.floatingTexts.forEach(t => this.renderFloatingText(t));
        
        this.renderGameUI();
    }

    renderBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, 700);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#98FB98');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, 1000, 700);
    }

    renderGround() {
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(0, 680, 1000, 20);
        
        this.ctx.fillStyle = '#228B22';
        this.ctx.fillRect(0, 680, 1000, 5);
    }

    renderSlingshot() {
        const s = this.slingshot;
        
        this.ctx.fillStyle = '#654321';
        this.ctx.fillRect(s.x - 10, s.y, 20, 80);
        
        this.ctx.beginPath();
        this.ctx.moveTo(s.x - 15, s.y);
        this.ctx.lineTo(s.x - 20, s.y - 30);
        this.ctx.lineTo(s.x - 15, s.y - 30);
        this.ctx.lineTo(s.x - 10, s.y);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.moveTo(s.x + 15, s.y);
        this.ctx.lineTo(s.x + 20, s.y - 30);
        this.ctx.lineTo(s.x + 15, s.y - 30);
        this.ctx.lineTo(s.x + 10, s.y);
        this.ctx.fill();
        
        if (this.activeBird && !this.activeBird.isLaunched) {
            this.ctx.strokeStyle = '#8B0000';
            this.ctx.lineWidth = 4;
            this.ctx.beginPath();
            this.ctx.moveTo(s.x - 15, s.y - 20);
            this.ctx.lineTo(this.activeBird.x, this.activeBird.y);
            this.ctx.lineTo(s.x + 15, s.y - 20);
            this.ctx.stroke();
        }
    }

    renderBird(bird) {
        this.ctx.save();
        this.ctx.translate(bird.x, bird.y);
        if (bird.isLaunched) {
            this.ctx.rotate(bird.angle);
        }
        
        this.ctx.fillStyle = bird.color;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, bird.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(-bird.radius * 0.3, -bird.radius * 0.3, bird.radius * 0.4, 0, Math.PI * 2);
        this.ctx.fill();
        
        const eyeY = -bird.radius * 0.2;
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(-bird.radius * 0.3, eyeY, bird.radius * 0.25, 0, Math.PI * 2);
        this.ctx.arc(bird.radius * 0.3, eyeY, bird.radius * 0.25, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = 'black';
        this.ctx.beginPath();
        this.ctx.arc(-bird.radius * 0.3, eyeY, bird.radius * 0.12, 0, Math.PI * 2);
        this.ctx.arc(bird.radius * 0.3, eyeY, bird.radius * 0.12, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#FFD700';
        this.ctx.beginPath();
        this.ctx.moveTo(bird.radius * 0.6, 0);
        this.ctx.lineTo(bird.radius * 1, -bird.radius * 0.2);
        this.ctx.lineTo(bird.radius * 1, bird.radius * 0.2);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.restore();
    }

    renderPig(pig) {
        this.ctx.save();
        this.ctx.translate(pig.x, pig.y);
        this.ctx.rotate(pig.angle);
        
        this.ctx.fillStyle = pig.color;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, pig.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(-pig.radius * 0.3, -pig.radius * 0.3, pig.radius * 0.35, 0, Math.PI * 2);
        this.ctx.fill();
        
        const eyeSize = pig.radius * 0.2;
        const eyeY = -pig.radius * 0.2;
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(-pig.radius * 0.3, eyeY, eyeSize, 0, Math.PI * 2);
        this.ctx.arc(pig.radius * 0.3, eyeY, eyeSize, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = 'black';
        this.ctx.beginPath();
        this.ctx.arc(-pig.radius * 0.3, eyeY, eyeSize * 0.5, 0, Math.PI * 2);
        this.ctx.arc(pig.radius * 0.3, eyeY, eyeSize * 0.5, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#7FBF7F';
        this.ctx.beginPath();
        this.ctx.ellipse(0, pig.radius * 0.3, pig.radius * 0.3, pig.radius * 0.25, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#2F4F2F';
        this.ctx.beginPath();
        this.ctx.arc(-pig.radius * 0.15, pig.radius * 0.3, pig.radius * 0.08, 0, Math.PI * 2);
        this.ctx.arc(pig.radius * 0.15, pig.radius * 0.3, pig.radius * 0.08, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
        
        if (pig.isKing) {
            this.ctx.save();
            this.ctx.translate(pig.x, pig.y - pig.radius - 15);
            this.ctx.fillStyle = '#FFD700';
            this.ctx.beginPath();
            this.ctx.moveTo(-15, 0);
            this.ctx.lineTo(-10, -10);
            this.ctx.lineTo(-5, 0);
            this.ctx.lineTo(0, -12);
            this.ctx.lineTo(5, 0);
            this.ctx.lineTo(10, -10);
            this.ctx.lineTo(15, 0);
            this.ctx.lineTo(15, 5);
            this.ctx.lineTo(-15, 5);
            this.ctx.closePath();
            this.ctx.fill();
            
            this.ctx.fillStyle = '#FF0000';
            this.ctx.beginPath();
            this.ctx.arc(0, -8, 3, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }
        
        this.renderHealthBar(pig.x, pig.y - pig.radius - 10, pig.radius * 2, pig.health, pig.maxHealth);
    }

    renderStructure(structure) {
        this.ctx.save();
        this.ctx.translate(structure.x + structure.width / 2, structure.y + structure.height / 2);
        this.ctx.rotate(structure.angle);
        
        this.ctx.fillStyle = structure.color;
        this.ctx.fillRect(-structure.width / 2, -structure.height / 2, structure.width, structure.height);
        
        if (structure.type === 'tnt') {
            this.ctx.fillStyle = '#000';
            this.ctx.font = 'bold 20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('TNT', 0, 0);
        }
        
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(-structure.width / 2, -structure.height / 2, structure.width, structure.height);
        
        this.ctx.restore();
        
        this.renderHealthBar(structure.x, structure.y - 10, structure.width, structure.health, structure.maxHealth);
    }

    renderHealthBar(x, y, width, health, maxHealth) {
        const percent = health / maxHealth;
        const barHeight = 5;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(x, y, width, barHeight);
        
        const healthColor = percent > 0.6 ? '#4CAF50' : percent > 0.3 ? '#FFA500' : '#FF0000';
        this.ctx.fillStyle = healthColor;
        this.ctx.fillRect(x, y, width * percent, barHeight);
    }

    renderTrajectory() {
        if (!this.activeBird) return;
        
        const dx = this.slingshot.x - this.activeBird.x;
        const dy = this.slingshot.y - this.activeBird.y;
        const power = Math.sqrt(dx * dx + dy * dy);
        
        if (power < 10) return;
        
        const angle = Math.atan2(dy, dx);
        const velocity = Math.min(power * 0.15, 20);
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        
        const trajectory = this.physics.calculateTrajectory(
            this.activeBird.x, this.activeBird.y, vx, vy, 40
        );
        
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 10]);
        
        this.ctx.beginPath();
        trajectory.forEach((point, index) => {
            if (index === 0) {
                this.ctx.moveTo(point.x, point.y);
            } else {
                this.ctx.lineTo(point.x, point.y);
            }
            
            if (index % 3 === 0) {
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                this.ctx.fillRect(point.x - 2, point.y - 2, 4, 4);
            }
        });
        
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }

    renderParticle(particle) {
        this.ctx.globalAlpha = particle.life / particle.maxLife;
        this.ctx.fillStyle = particle.color;
        
        if (particle.isDebris) {
            this.ctx.fillRect(particle.x - particle.size / 2, particle.y - particle.size / 2, 
                             particle.size, particle.size);
        } else {
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.globalAlpha = 1;
    }

    renderExplosion(explosion) {
        const alpha = explosion.life / explosion.maxLife;
        
        this.ctx.globalAlpha = alpha * 0.8;
        this.ctx.strokeStyle = explosion.color;
        this.ctx.lineWidth = 5;
        this.ctx.beginPath();
        this.ctx.arc(explosion.x, explosion.y, explosion.radius, 0, Math.PI * 2);
        this.ctx.stroke();
        
        this.ctx.globalAlpha = alpha * 0.4;
        this.ctx.strokeStyle = '#FFFF00';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(explosion.x, explosion.y, explosion.radius * 0.7, 0, Math.PI * 2);
        this.ctx.stroke();
        
        this.ctx.globalAlpha = 1;
    }

    renderFloatingText(text) {
        this.ctx.globalAlpha = text.life / text.maxLife;
        this.ctx.fillStyle = text.color;
        this.ctx.font = `bold ${text.size}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 3;
        this.ctx.strokeText(text.text, text.x, text.y);
        this.ctx.fillText(text.text, text.x, text.y);
        this.ctx.globalAlpha = 1;
    }

    renderGameUI() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, 1000, 80);
        
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Level ${this.levelId}: ${this.currentLevel.name}`, 20, 35);
        
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`Score: ${this.score}`, 500, 35);
        
        this.ctx.textAlign = 'right';
        const birdsLeft = this.birds.length - this.birdsUsed;
        this.ctx.fillText(`Birds: ${birdsLeft}`, 750, 35);
        
        if (this.combo > 1) {
            this.ctx.fillStyle = '#FF69B4';
            this.ctx.font = 'bold 28px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`COMBO ${this.combo}x`, 500, 65);
        }
        
        this.drawButton(820, 20, 80, 40, '#FFA500', 'Restart', 16);
        this.drawButton(920, 20, 60, 40, '#FF6B6B', 'Pause', 16);
    }

    renderPauseMenu() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, 1000, 700);
        
        this.ctx.fillStyle = '#FFF';
        this.roundRect(300, 150, 400, 450, 20);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#333';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAUSED', 500, 230);
        
        this.drawButton(350, 250, 300, 70, '#4CAF50', 'Resume', 30);
        this.drawButton(350, 340, 300, 70, '#FFA500', 'Restart', 30);
        this.drawButton(350, 430, 300, 70, '#FF6B6B', 'Main Menu', 30);
    }

    renderVictoryScreen() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        this.ctx.fillRect(0, 0, 1000, 700);
        
        this.ctx.fillStyle = '#FFF';
        this.roundRect(250, 100, 500, 500, 20);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.font = 'bold 56px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('LEVEL COMPLETE!', 500, 180);
        
        const stars = this.calculateStars();
        this.ctx.font = '72px Arial';
        const starY = 270;
        for (let i = 0; i < 3; i++) {
            if (i < stars) {
                this.ctx.fillText('⭐', 350 + i * 100, starY);
            } else {
                this.ctx.fillStyle = '#CCC';
                this.ctx.fillText('☆', 350 + i * 100, starY);
                this.ctx.fillStyle = '#4CAF50';
            }
        }
        
        this.ctx.fillStyle = '#333';
        this.ctx.font = 'bold 32px Arial';
        this.ctx.fillText(`Score: ${this.score}`, 500, 350);
        
        this.drawButton(350, 450, 150, 70, '#4CAF50', 'Next', 28);
        this.drawButton(520, 450, 150, 70, '#FFA500', 'Menu', 28);
    }

    renderGameOverScreen() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        this.ctx.fillRect(0, 0, 1000, 700);
        
        this.ctx.fillStyle = '#FFF';
        this.roundRect(250, 150, 500, 400, 20);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#FF6B6B';
        this.ctx.font = 'bold 56px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('LEVEL FAILED', 500, 240);
        
        this.ctx.fillStyle = '#333';
        this.ctx.font = 'bold 32px Arial';
        this.ctx.fillText(`Score: ${this.score}`, 500, 310);
        
        this.drawButton(350, 450, 150, 70, '#4CAF50', 'Retry', 28);
        this.drawButton(520, 450, 150, 70, '#FFA500', 'Menu', 28);
    }

    drawButton(x, y, width, height, color, text, fontSize) {
        this.ctx.fillStyle = color;
        this.roundRect(x, y, width, height, 10);
        this.ctx.fill();
        
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = `bold ${fontSize}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(text, x + width / 2, y + height / 2);
    }

    roundRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
    }
}

