class AngryBirdsGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.birdsLeft = 3;
        this.gameState = 'aiming'; // aiming, shooting, gameOver, won
        
        // Physics constants
        this.gravity = 0.5;
        this.friction = 0.99;
        this.elasticity = 0.7;
        
        // Game objects
        this.bird = null;
        this.slingshot = { x: 150, y: 600 };
        this.obstacles = [];
        this.pigs = [];
        this.projectiles = [];
        this.particles = [];
        
        // Mouse/touch handling
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
        this.dragEnd = { x: 0, y: 0 };
        
        this.init();
        this.setupEventListeners();
        this.gameLoop();
    }
    
    init() {
        this.createLevel();
        this.resetBird();
        this.updateUI();
    }
    
    createLevel() {
        // Create ground
        this.ground = { y: 680, height: 20 };
        
        // Create obstacles (wooden blocks)
        this.obstacles = [
            // Bottom row
            { x: 700, y: 620, width: 60, height: 60, type: 'wood', health: 100 },
            { x: 760, y: 620, width: 60, height: 60, type: 'wood', health: 100 },
            { x: 820, y: 620, width: 60, height: 60, type: 'wood', health: 100 },
            
            // Middle row
            { x: 730, y: 560, width: 60, height: 60, type: 'wood', health: 100 },
            { x: 790, y: 560, width: 60, height: 60, type: 'wood', health: 100 },
            
            // Top row
            { x: 760, y: 500, width: 60, height: 60, type: 'wood', health: 100 },
            
            // Additional structures
            { x: 600, y: 620, width: 60, height: 60, type: 'stone', health: 150 },
            { x: 660, y: 620, width: 60, height: 60, type: 'stone', health: 150 },
            { x: 630, y: 560, width: 60, height: 60, type: 'stone', health: 150 }
        ];
        
        // Create pigs
        this.pigs = [
            { x: 760, y: 560, radius: 25, health: 100, type: 'normal' },
            { x: 760, y: 500, radius: 25, health: 100, type: 'normal' },
            { x: 630, y: 500, radius: 30, health: 150, type: 'large' }
        ];
    }
    
    resetBird() {
        this.bird = {
            x: this.slingshot.x,
            y: this.slingshot.y,
            radius: 20,
            vx: 0,
            vy: 0,
            isLaunched: false
        };
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleMouseDown(e.touches[0]);
        });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.handleMouseMove(e.touches[0]);
        });
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.handleMouseUp(e);
        });
        
        document.getElementById('restart-btn').addEventListener('click', () => this.restart());
    }
    
    handleMouseDown(e) {
        if (this.gameState !== 'aiming') return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Check if clicking on bird
        const dx = x - this.bird.x;
        const dy = y - this.bird.y;
        if (dx * dx + dy * dy <= this.bird.radius * this.bird.radius) {
            this.isDragging = true;
            this.dragStart = { x, y };
        }
    }
    
    handleMouseMove(e) {
        if (!this.isDragging) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.dragEnd = { x, y };
    }
    
    handleMouseUp(e) {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        this.launchBird();
    }
    
    launchBird() {
        const dx = this.dragStart.x - this.dragEnd.x;
        const dy = this.dragStart.y - this.dragEnd.y;
        const power = Math.min(Math.sqrt(dx * dx + dy * dy) * 0.1, 20);
        
        this.bird.vx = (dx / Math.sqrt(dx * dx + dy * dy)) * power;
        this.bird.vy = (dy / Math.sqrt(dx * dx + dy * dy)) * power;
        this.bird.isLaunched = true;
        this.gameState = 'shooting';
        this.birdsLeft--;
        this.updateUI();
    }
    
    update() {
        if (this.gameState === 'aiming') {
            this.updateAiming();
        } else if (this.gameState === 'shooting') {
            this.updateShooting();
        }
        
        this.updateProjectiles();
        this.updateParticles();
        this.checkCollisions();
        this.checkGameState();
    }
    
    updateAiming() {
        if (this.isDragging) {
            const dx = this.dragStart.x - this.dragEnd.x;
            const dy = this.dragStart.y - this.dragEnd.y;
            const distance = Math.min(Math.sqrt(dx * dx + dy * dy) * 0.1, 80);
            
            this.bird.x = this.slingshot.x - (dx / Math.sqrt(dx * dx + dy * dy)) * distance;
            this.bird.y = this.slingshot.y - (dy / Math.sqrt(dx * dx + dy * dy)) * distance;
        }
    }
    
    updateShooting() {
        // Update bird physics
        if (this.bird.isLaunched) {
            this.bird.vx *= this.friction;
            this.bird.vy += this.gravity;
            this.bird.x += this.bird.vx;
            this.bird.y += this.bird.vy;
            
            // Check if bird is out of bounds
            if (this.bird.x > this.canvas.width + 50 || this.bird.y > this.canvas.height + 50) {
                this.resetBird();
                this.gameState = 'aiming';
                if (this.birdsLeft <= 0) {
                    this.gameState = 'gameOver';
                }
            }
        }
    }
    
    updateProjectiles() {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];
            proj.vx *= this.friction;
            proj.vy += this.gravity;
            proj.x += proj.vx;
            proj.y += proj.vy;
            
            if (proj.y > this.canvas.height) {
                this.projectiles.splice(i, 1);
            }
        }
    }
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.vx *= 0.98;
            particle.vy += 0.1;
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    checkCollisions() {
        // Bird collisions
        if (this.bird.isLaunched) {
            // Bird vs obstacles
            for (let i = this.obstacles.length - 1; i >= 0; i--) {
                const obstacle = this.obstacles[i];
                if (this.checkCollision(this.bird, obstacle)) {
                    this.handleCollision(this.bird, obstacle);
                    this.createExplosion(this.bird.x, this.bird.y);
                    this.bird.isLaunched = false;
                    this.bird.vx = 0;
                    this.bird.vy = 0;
                }
            }
            
            // Bird vs pigs
            for (let i = this.pigs.length - 1; i >= 0; i--) {
                const pig = this.pigs[i];
                if (this.checkCollision(this.bird, pig)) {
                    this.handlePigHit(pig);
                    this.createExplosion(this.bird.x, this.bird.y);
                    this.bird.isLaunched = false;
                    this.bird.vx = 0;
                    this.bird.vy = 0;
                }
            }
        }
        
        // Projectile collisions
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];
            
            for (let j = this.obstacles.length - 1; j >= 0; j--) {
                const obstacle = this.obstacles[j];
                if (this.checkCollision(proj, obstacle)) {
                    this.handleCollision(proj, obstacle);
                    this.projectiles.splice(i, 1);
                    break;
                }
            }
        }
    }
    
    checkCollision(obj1, obj2) {
        if (obj2.radius) {
            // Circle collision
            const dx = obj1.x - obj2.x;
            const dy = obj1.y - obj2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance < obj1.radius + obj2.radius;
        } else {
            // Rectangle collision
            return obj1.x < obj2.x + obj2.width &&
                   obj1.x + obj1.radius > obj2.x &&
                   obj1.y < obj2.y + obj2.height &&
                   obj1.y + obj1.radius > obj2.y;
        }
    }
    
    handleCollision(obj1, obj2) {
        if (obj2.health) {
            obj2.health -= 50;
            if (obj2.health <= 0) {
                const index = this.obstacles.indexOf(obj2);
                if (index > -1) {
                    this.obstacles.splice(index, 1);
                    this.score += 100;
                    this.updateUI();
                }
            }
        }
    }
    
    handlePigHit(pig) {
        pig.health -= 100;
        if (pig.health <= 0) {
            const index = this.pigs.indexOf(pig);
            if (index > -1) {
                this.pigs.splice(index, 1);
                this.score += 200;
                this.updateUI();
            }
        }
    }
    
    createExplosion(x, y) {
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 30,
                color: `hsl(${Math.random() * 60 + 15}, 70%, 50%)`
            });
        }
    }
    
    checkGameState() {
        if (this.pigs.length === 0) {
            this.gameState = 'won';
        } else if (this.birdsLeft <= 0 && !this.bird.isLaunched) {
            this.gameState = 'gameOver';
        }
    }
    
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        this.drawBackground();
        
        // Draw ground
        this.drawGround();
        
        // Draw slingshot
        this.drawSlingshot();
        
        // Draw obstacles
        this.drawObstacles();
        
        // Draw pigs
        this.drawPigs();
        
        // Draw bird
        this.drawBird();
        
        // Draw projectiles
        this.drawProjectiles();
        
        // Draw particles
        this.drawParticles();
        
        // Draw aiming line
        if (this.isDragging) {
            this.drawAimingLine();
        }
        
        // Draw game state messages
        this.drawGameState();
    }
    
    drawBackground() {
        // Sky gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#98FB98');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw clouds
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.drawCloud(150, 120, 60);
        this.drawCloud(400, 100, 40);
        this.drawCloud(750, 140, 50);
    }
    
    drawCloud(x, y, size) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, Math.PI * 2);
        this.ctx.arc(x + size * 0.5, y, size * 0.8, 0, Math.PI * 2);
        this.ctx.arc(x + size, y, size * 0.6, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawGround() {
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(0, this.ground.y, this.canvas.width, this.ground.height);
        
        // Grass on top
        this.ctx.fillStyle = '#228B22';
        this.ctx.fillRect(0, this.ground.y, this.canvas.width, 5);
    }
    
    drawSlingshot() {
        // Base
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(this.slingshot.x - 10, this.slingshot.y, 20, 80);
        
        // Fork
        this.ctx.fillRect(this.slingshot.x - 15, this.slingshot.y - 20, 30, 20);
        
        // Rubber bands
        if (!this.bird.isLaunched) {
            this.ctx.strokeStyle = '#8B0000';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(this.slingshot.x - 10, this.slingshot.y - 10);
            this.ctx.lineTo(this.bird.x - 10, this.bird.y);
            this.ctx.moveTo(this.slingshot.x + 10, this.slingshot.y - 10);
            this.ctx.lineTo(this.bird.x + 10, this.bird.y);
            this.ctx.stroke();
        }
    }
    
    drawObstacles() {
        this.obstacles.forEach(obstacle => {
            if (obstacle.type === 'wood') {
                this.ctx.fillStyle = '#8B4513';
            } else {
                this.ctx.fillStyle = '#696969';
            }
            
            this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            
            // Draw health bar
            const healthPercent = obstacle.health / (obstacle.type === 'wood' ? 100 : 150);
            this.ctx.fillStyle = `rgb(${255 * (1 - healthPercent)}, ${255 * healthPercent}, 0)`;
            this.ctx.fillRect(obstacle.x, obstacle.y - 10, obstacle.width * healthPercent, 5);
        });
    }
    
    drawPigs() {
        this.pigs.forEach(pig => {
            // Body
            this.ctx.fillStyle = '#90EE90';
            this.ctx.beginPath();
            this.ctx.arc(pig.x, pig.y, pig.radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Eyes
            this.ctx.fillStyle = 'white';
            this.ctx.beginPath();
            this.ctx.arc(pig.x - 8, pig.y - 5, 5, 0, Math.PI * 2);
            this.ctx.arc(pig.x + 8, pig.y - 5, 5, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.fillStyle = 'black';
            this.ctx.beginPath();
            this.ctx.arc(pig.x - 8, pig.y - 5, 2, 0, Math.PI * 2);
            this.ctx.arc(pig.x + 8, pig.y - 5, 2, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Nose
            this.ctx.fillStyle = '#FF69B4';
            this.ctx.beginPath();
            this.ctx.arc(pig.x, pig.y + 5, 3, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Health bar
            const healthPercent = pig.health / (pig.type === 'large' ? 150 : 100);
            this.ctx.fillStyle = `rgb(${255 * (1 - healthPercent)}, ${255 * healthPercent}, 0)`;
            this.ctx.fillRect(pig.x - pig.radius, pig.y - pig.radius - 10, pig.radius * 2 * healthPercent, 5);
        });
    }
    
    drawBird() {
        if (!this.bird) return;
        
        // Body
        this.ctx.fillStyle = '#FF0000';
        this.ctx.beginPath();
        this.ctx.arc(this.bird.x, this.bird.y, this.bird.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Eyes
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(this.bird.x - 5, this.bird.y - 5, 4, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = 'black';
        this.ctx.beginPath();
        this.ctx.arc(this.bird.x - 5, this.bird.y - 5, 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Beak
        this.ctx.fillStyle = '#FFD700';
        this.ctx.beginPath();
        this.ctx.moveTo(this.bird.x + this.bird.radius, this.bird.y);
        this.ctx.lineTo(this.bird.x + this.bird.radius + 8, this.bird.y - 3);
        this.ctx.lineTo(this.bird.x + this.bird.radius + 8, this.bird.y + 3);
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    drawProjectiles() {
        this.projectiles.forEach(proj => {
            this.ctx.fillStyle = '#FFD700';
            this.ctx.beginPath();
            this.ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.fillStyle = particle.color;
            this.ctx.globalAlpha = particle.life / 30;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1;
    }
    
    drawAimingLine() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.bird.x, this.bird.y);
        this.ctx.lineTo(this.dragEnd.x, this.dragEnd.y);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }
    
    drawGameState() {
        if (this.gameState === 'won') {
            this.drawMessage('YOU WIN!', '#4CAF50');
        } else if (this.gameState === 'gameOver') {
            this.drawMessage('GAME OVER', '#F44336');
        }
    }
    
    drawMessage(text, color) {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = color;
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(text, this.canvas.width / 2, this.canvas.height / 2);
        
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 50);
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('birds-left').textContent = this.birdsLeft;
    }
    
    restart() {
        this.score = 0;
        this.birdsLeft = 3;
        this.gameState = 'aiming';
        this.projectiles = [];
        this.particles = [];
        this.createLevel();
        this.resetBird();
        this.updateUI();
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    new AngryBirdsGame();
});
