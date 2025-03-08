/**
 * Space Pirates and Merchants - Moteur de jeu
 * Ce fichier gère le cœur du moteur de jeu
 */

class GameEngine {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.lastTime = 0;
        this.entities = [];
        this.player = null;
        this.universe = null;
        this.isRunning = false;
        this.keys = {};
        
        // Ajustement du canvas pour qu'il occupe toute la fenêtre
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Gestionnaires d'événements
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.lastTime = performance.now();
            requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
        }
    }
    
    stop() {
        this.isRunning = false;
    }
    
    gameLoop(timestamp) {
        if (!this.isRunning) return;
        
        // Calcul du delta time (temps écoulé depuis la dernière frame)
        const deltaTime = (timestamp - this.lastTime) / 1000; // en secondes
        this.lastTime = timestamp;
        
        // Mise à jour des entités
        this.update(deltaTime);
        
        // Rendu des entités
        this.render();
        
        // Planification de la prochaine frame
        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }
    
    update(deltaTime) {
        // Mise à jour du joueur
        if (this.player) {
            this.player.update(deltaTime, this.keys, this.entities);
        }
        
        // Mise à jour de toutes les entités
        for (let i = 0; i < this.entities.length; i++) {
            this.entities[i].update(deltaTime, this.entities);
        }
        
        // Détection de collisions
        this.checkCollisions();
    }
    
    render() {
        // Effacement du canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Dessin de l'arrière-plan spatial
        this.drawBackground();
        
        // Rendu de toutes les entités
        for (let i = 0; i < this.entities.length; i++) {
            this.entities[i].render(this.ctx);
        }
        
        // Rendu du joueur au-dessus des autres entités
        if (this.player) {
            this.player.render(this.ctx);
        }
    }
    
    drawBackground() {
        // Dessin d'un fond étoilé simple
        this.ctx.fillStyle = '#0a0a2a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Si l'univers a été initialisé, on lui délègue le dessin du fond
        if (this.universe) {
            this.universe.renderBackground(this.ctx, this.player);
        }
    }
    
    checkCollisions() {
        // Vérification des collisions entre le joueur et les entités
        if (this.player) {
            for (let i = 0; i < this.entities.length; i++) {
                const entity = this.entities[i];
                if (this.isColliding(this.player, entity)) {
                    this.player.onCollision(entity);
                    entity.onCollision(this.player);
                }
            }
        }
        
        // Vérification des collisions entre les entités
        for (let i = 0; i < this.entities.length; i++) {
            for (let j = i + 1; j < this.entities.length; j++) {
                if (this.isColliding(this.entities[i], this.entities[j])) {
                    this.entities[i].onCollision(this.entities[j]);
                    this.entities[j].onCollision(this.entities[i]);
                }
            }
        }
    }
    
    isColliding(entity1, entity2) {
        // Collision simple basée sur la distance entre deux entités
        const dx = entity1.x - entity2.x;
        const dy = entity1.y - entity2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (entity1.radius + entity2.radius);
    }
    
    addEntity(entity) {
        this.entities.push(entity);
    }
    
    removeEntity(entity) {
        const index = this.entities.indexOf(entity);
        if (index !== -1) {
            this.entities.splice(index, 1);
        }
    }
    
    setPlayer(player) {
        this.player = player;
    }
    
    setUniverse(universe) {
        this.universe = universe;
    }
    
    handleKeyDown(e) {
        this.keys[e.code] = true;
    }
    
    handleKeyUp(e) {
        this.keys[e.code] = false;
    }
    
    handleClick(e) {
        // Conversion des coordonnées de la souris en coordonnées du canvas
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Vérification des clics sur les entités
        for (let i = 0; i < this.entities.length; i++) {
            const entity = this.entities[i];
            if (entity.isClickable && this.isPointInEntity(x, y, entity)) {
                entity.onClick();
                break;
            }
        }
    }
    
    isPointInEntity(x, y, entity) {
        const dx = x - entity.x;
        const dy = y - entity.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < entity.radius;
    }
}

// Exportation du moteur de jeu
window.GameEngine = GameEngine;
