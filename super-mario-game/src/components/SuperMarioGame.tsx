'use client';

import { useEffect } from 'react';

export default function SuperMarioGame() {
  useEffect(() => {
    // Game initialization
    const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Game state
    const game = {
        score: 0,
        lives: 3,
        level: 1,
        time: 400,
        camera: { x: 0, y: 0 },
        particles: [] as any[]
    };
    
    // Physics constants
    const GRAVITY = 0.8;
    const GROUND_Y = 400;
    const MAX_JUMP_FORCE = -18;
    const MIN_JUMP_FORCE = -10;
    const MOVE_SPEED = 6;
    const MAX_SPEED = 8;
    const ACCELERATION = 0.5;
    const FRICTION = 0.85;
    const COYOTE_TIME = 8; // frames
    
    // Player (Mario)
    const player = {
        x: 100,
        y: GROUND_Y,
        width: 32,
        height: 32,
        vx: 0,
        vy: 0,
        onGround: false,
        size: 'small', // small, super, fire
        facing: 1, // 1 = right, -1 = left
        animFrame: 0,
        animTimer: 0,
        isMoving: false,
        isJumping: false,
        jumpHoldTime: 0,
        maxJumpHoldTime: 12,
        coyoteTime: 0,
        invulnerable: false,
        invulnerabilityTime: 0,
        transforming: false,
        transformTime: 0,
        starPower: false,
        starTime: 0
    };
    
    // Input handling
    const keys: { [key: string]: boolean } = {};
    const keysPressed: { [key: string]: boolean } = {};
    
    const handleKeyDown = (e: KeyboardEvent) => {
        if (!keys[e.code]) keysPressed[e.code] = true;
        keys[e.code] = true;
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
        keys[e.code] = false;
        keysPressed[e.code] = false;
    };
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    // Power-ups and interactive elements
    const powerUps: any[] = [];
    const fireballs: any[] = [];
    const koopas: any[] = [];
    const shells: any[] = [];
    
    // Platforms and level geometry
    const platforms = [
        { x: 0, y: 450, width: 3200, height: 30, type: 'ground' },
        { x: 200, y: 350, width: 64, height: 32, type: 'brick', breakable: true, coins: 0 },
        { x: 264, y: 350, width: 32, height: 32, type: 'question', hit: false, contains: 'coin' },
        { x: 296, y: 350, width: 64, height: 32, type: 'brick', breakable: true, coins: 0 },
        { x: 400, y: 300, width: 32, height: 32, type: 'question', hit: false, contains: 'mushroom' },
        { x: 432, y: 300, width: 96, height: 32, type: 'brick', breakable: true, coins: 0 },
        { x: 600, y: 250, width: 32, height: 32, type: 'question', hit: false, contains: 'fireflower' },
        { x: 632, y: 250, width: 96, height: 32, type: 'brick', breakable: true, coins: 3 },
        { x: 800, y: 200, width: 32, height: 32, type: 'question', hit: false, contains: 'coin' },
        { x: 832, y: 200, width: 32, height: 32, type: 'question', hit: false, contains: '1up' },
        { x: 864, y: 200, width: 64, height: 32, type: 'brick', breakable: true, coins: 0 },
        { x: 1000, y: 350, width: 128, height: 32, type: 'pipe' },
        { x: 1200, y: 300, width: 128, height: 180, type: 'pipe' },
        { x: 1500, y: 400, width: 64, height: 32, type: 'brick', breakable: true, coins: 0 },
        { x: 1564, y: 400, width: 32, height: 32, type: 'question', hit: false, contains: 'star' },
        { x: 1596, y: 400, width: 64, height: 32, type: 'brick', breakable: true, coins: 0 },
        { x: 1800, y: 350, width: 32, height: 32, type: 'question', hit: false, contains: 'coin' },
        { x: 2000, y: 300, width: 128, height: 32, type: 'brick', breakable: true, coins: 5 },
        { x: 2200, y: 250, width: 200, height: 32, type: 'pipe' },
        { x: 2600, y: 200, width: 300, height: 32, type: 'brick', breakable: true, coins: 10 }
    ];
    
    // Background elements
    const backgroundElements = {
        clouds: [
            { x: 150, y: 80, size: 1 },
            { x: 400, y: 120, size: 1.2 },
            { x: 700, y: 90, size: 0.8 },
            { x: 1000, y: 100, size: 1.1 },
            { x: 1300, y: 130, size: 0.9 }
        ],
        hills: [
            { x: 100, y: 380, size: 1 },
            { x: 500, y: 390, size: 1.3 },
            { x: 900, y: 385, size: 0.9 },
            { x: 1200, y: 375, size: 1.1 }
        ],
        bushes: [
            { x: 250, y: 420, size: 0.8 },
            { x: 600, y: 425, size: 1 },
            { x: 1100, y: 420, size: 0.7 }
        ]
    };
    
    // Enhanced enemies system
    const enemies = [
        { x: 320, y: GROUND_Y, width: 32, height: 32, vx: -1, type: 'goomba', animFrame: 0, animTimer: 0, alive: true, deathTimer: 0 },
        { x: 520, y: GROUND_Y, width: 32, height: 32, vx: 1, type: 'goomba', animFrame: 0, animTimer: 0, alive: true, deathTimer: 0 },
        { x: 720, y: GROUND_Y, width: 32, height: 38, vx: -1.5, type: 'koopa', animFrame: 0, animTimer: 0, alive: true, deathTimer: 0, inShell: false, shellTimer: 0 },
        { x: 980, y: GROUND_Y, width: 32, height: 32, vx: -1, type: 'goomba', animFrame: 0, animTimer: 0, alive: true, deathTimer: 0 },
        { x: 1150, y: GROUND_Y, width: 32, height: 38, vx: 1.2, type: 'koopa', animFrame: 0, animTimer: 0, alive: true, deathTimer: 0, inShell: false, shellTimer: 0 },
        { x: 1450, y: GROUND_Y, width: 32, height: 32, vx: -1, type: 'goomba', animFrame: 0, animTimer: 0, alive: true, deathTimer: 0 },
        { x: 1750, y: GROUND_Y, width: 32, height: 32, vx: 1, type: 'goomba', animFrame: 0, animTimer: 0, alive: true, deathTimer: 0 },
        { x: 1950, y: GROUND_Y, width: 32, height: 38, vx: -1, type: 'koopa', animFrame: 0, animTimer: 0, alive: true, deathTimer: 0, inShell: false, shellTimer: 0 },
        { x: 2150, y: GROUND_Y, width: 32, height: 32, vx: -1.5, type: 'goomba', animFrame: 0, animTimer: 0, alive: true, deathTimer: 0 },
        { x: 2450, y: GROUND_Y, width: 32, height: 38, vx: 1, type: 'koopa', animFrame: 0, animTimer: 0, alive: true, deathTimer: 0, inShell: false, shellTimer: 0 }
    ];
    
    // Static world coins
    const coins = [
        { x: 250, y: 320, width: 24, height: 24, collected: false, animFrame: 0, animTimer: 0 },
        { x: 350, y: 420, width: 24, height: 24, collected: false, animFrame: 0, animTimer: 0 },
        { x: 550, y: 270, width: 24, height: 24, collected: false, animFrame: 0, animTimer: 0 },
        { x: 750, y: 220, width: 24, height: 24, collected: false, animFrame: 0, animTimer: 0 },
        { x: 950, y: 170, width: 24, height: 24, collected: false, animFrame: 0, animTimer: 0 },
        { x: 1150, y: 320, width: 24, height: 24, collected: false, animFrame: 0, animTimer: 0 },
        { x: 1350, y: 420, width: 24, height: 24, collected: false, animFrame: 0, animTimer: 0 },
        { x: 1650, y: 370, width: 24, height: 24, collected: false, animFrame: 0, animTimer: 0 },
        { x: 1850, y: 320, width: 24, height: 24, collected: false, animFrame: 0, animTimer: 0 },
        { x: 2050, y: 270, width: 24, height: 24, collected: false, animFrame: 0, animTimer: 0 },
        { x: 2250, y: 420, width: 24, height: 24, collected: false, animFrame: 0, animTimer: 0 },
        { x: 2450, y: 370, width: 24, height: 24, collected: false, animFrame: 0, animTimer: 0 },
        { x: 2650, y: 320, width: 24, height: 24, collected: false, animFrame: 0, animTimer: 0 },
        { x: 2850, y: 170, width: 24, height: 24, collected: false, animFrame: 0, animTimer: 0 }
    ];
    
    // Sound system
    function createAudioContext() {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        return {
            ctx: audioCtx,
            play: function(frequency: number, duration: number, type = 'square') {
                const oscillator = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();
                oscillator.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
                oscillator.type = type as OscillatorType;
                gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
                oscillator.start();
                oscillator.stop(audioCtx.currentTime + duration);
            }
        };
    }
    
    const sounds = {
        jump: createAudioContext(),
        coin: createAudioContext(),
        powerUp: createAudioContext(),
        fireball: createAudioContext(),
        stomp: createAudioContext(),
        kick: createAudioContext(),
        '1up': createAudioContext(),
        star: createAudioContext(),
        bgMusic: null
    };
    
    function playSound(soundName: string) {
        switch(soundName) {
            case 'jump':
                sounds.jump.play(523, 0.1);
                break;
            case 'coin':
                sounds.coin.play(1047, 0.2, 'sine');
                setTimeout(() => sounds.coin.play(1319, 0.15, 'sine'), 100);
                break;
            case 'powerUp':
                sounds.powerUp.play(392, 0.3);
                setTimeout(() => sounds.powerUp.play(523, 0.3), 150);
                setTimeout(() => sounds.powerUp.play(659, 0.3), 300);
                break;
            case 'fireball':
                sounds.fireball.play(220, 0.1);
                break;
            case 'stomp':
                sounds.stomp.play(131, 0.15);
                break;
            case 'kick':
                sounds.kick.play(196, 0.2);
                break;
            case '1up':
                const notes = [523, 659, 784, 1047, 784, 1047];
                notes.forEach((note, i) => {
                    setTimeout(() => sounds['1up'].play(note, 0.2), i * 150);
                });
                break;
            case 'star':
                sounds.star.play(659, 0.1);
                break;
        }
    }
    
    // Particle system
    function createParticle(x: number, y: number, text: string, color = '#FFD700') {
        const particle = {
            x: x,
            y: y,
            text: text,
            color: color,
            vy: -2,
            life: 60,
            maxLife: 60
        };
        game.particles.push(particle);
    }
    
    function updateParticles() {
        for (let i = game.particles.length - 1; i >= 0; i--) {
            const particle = game.particles[i];
            particle.y += particle.vy;
            particle.vy += 0.1;
            particle.life--;
            
            if (particle.life <= 0) {
                game.particles.splice(i, 1);
            }
        }
    }
    
    // Collision detection
    function checkCollision(rect1: any, rect2: any) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    // Update game
    function update() {
        // Handle input and animations
        player.isMoving = false;
        
        if (keys['ArrowLeft']) {
            player.vx = -MOVE_SPEED;
            player.facing = -1;
            player.isMoving = true;
        } else if (keys['ArrowRight']) {
            player.vx = MOVE_SPEED;
            player.facing = 1;
            player.isMoving = true;
        } else {
            player.vx *= 0.8; // Friction
        }
        
        // Jump initiation - only start jump if not already jumping
        if (keysPressed['Space'] && (player.onGround || player.coyoteTime > 0) && !player.isJumping) {
            player.vy = MIN_JUMP_FORCE;
            player.onGround = false;
            player.isJumping = true;
            player.jumpHoldTime = 0;
            player.coyoteTime = 0;
            playSound('jump');
        }
        
        // Variable jump height - continue adding upward force while space is held
        if (player.isJumping && keys['Space'] && player.vy < 0 && player.jumpHoldTime < player.maxJumpHoldTime) {
            // Add additional upward force based on how long space is held
            const jumpBoost = (MAX_JUMP_FORCE - MIN_JUMP_FORCE) * (player.jumpHoldTime / player.maxJumpHoldTime);
            player.vy += jumpBoost * 0.15; // Apply boost gradually
            player.jumpHoldTime++;
        }
        
        // If space is released early or max hold time reached, end variable jump
        if (!keys['Space'] || player.jumpHoldTime >= player.maxJumpHoldTime || player.vy >= 0) {
            if (player.isJumping && player.vy < 0 && !keys['Space']) {
                // Cut jump short by reducing upward velocity when space is released
                player.vy *= 0.5;
            }
        }
        
        // Update player animation
        if (player.isMoving && player.onGround) {
            player.animTimer++;
            if (player.animTimer > 8) {
                player.animFrame = (player.animFrame + 1) % 3;
                player.animTimer = 0;
            }
        } else {
            player.animFrame = 0;
        }
        
        if (player.onGround) {
            player.isJumping = false;
        }
        
        if (keys['KeyR']) {
            // Enhanced restart
            player.x = 100;
            player.y = GROUND_Y;
            player.vx = 0;
            player.vy = 0;
            player.facing = 1;
            player.size = 'small';
            player.height = 32;
            player.invulnerable = false;
            player.invulnerabilityTime = 0;
            player.starPower = false;
            player.starTime = 0;
            player.transforming = false;
            player.transformTime = 0;
            game.score = 0;
            game.time = 400;
            game.particles = [];
            coins.forEach(coin => coin.collected = false);
            enemies.forEach(enemy => {
                enemy.alive = true;
                enemy.deathTimer = 0;
                if (enemy.type === 'koopa') {
                    enemy.inShell = false;
                    enemy.shellTimer = 0;
                    enemy.height = 38;
                }
            });
            platforms.forEach((platform: any) => {
                if (platform.type === 'question') platform.hit = false;
            });
            powerUps.length = 0;
            fireballs.length = 0;
        }
        
        // Reset jumping state when landing or falling
        if (player.vy >= 0) {
            player.isJumping = false;
        }
        
        // Apply physics
        player.vy += GRAVITY;
        player.x += player.vx;
        player.y += player.vy;
        
        // Store previous ground state for coyote time
        const wasOnGround = player.onGround;
        
        // Platform collision
        player.onGround = false;
        platforms.forEach(platform => {
            if (checkCollision(player, platform)) {
                if (player.vy > 0 && player.y < platform.y) {
                    player.y = platform.y - player.height;
                    player.vy = 0;
                    player.onGround = true;
                }
            }
        });
        
        // Coyote time handling
        if (player.onGround) {
            player.coyoteTime = COYOTE_TIME;
        } else if (player.coyoteTime > 0) {
            player.coyoteTime--;
        }
        
        // Enemy collision and movement
        enemies.forEach(enemy => {
            if (!enemy.alive) return;
            
            enemy.x += enemy.vx;
            
            // Update enemy animation
            enemy.animTimer++;
            if (enemy.animTimer > 20) {
                enemy.animFrame = (enemy.animFrame + 1) % 2;
                enemy.animTimer = 0;
            }
            
            // Reverse direction at platform edges
            let onPlatform = false;
            platforms.forEach(platform => {
                if (enemy.x + enemy.width > platform.x && 
                    enemy.x < platform.x + platform.width &&
                    enemy.y + enemy.height >= platform.y - 5 &&
                    enemy.y + enemy.height <= platform.y + 5) {
                    onPlatform = true;
                }
            });
            
            if (!onPlatform || enemy.x <= 0 || enemy.x >= 1600 - enemy.width) {
                enemy.vx *= -1;
            }
            
            // Player-enemy collision
            if (checkCollision(player, enemy)) {
                if (player.vy > 0 && player.y < enemy.y) {
                    // Jump on enemy
                    enemy.alive = false;
                    player.vy = MIN_JUMP_FORCE * 0.6; // More responsive bounce
                    player.isJumping = false; // Allow for immediate new jump
                    game.score += 100;
                    createParticle(enemy.x + enemy.width/2, enemy.y, '100', '#FFD700');
                    playSound('stomp');
                } else {
                    // Take damage
                    if (player.size === 'super') {
                        player.size = 'small';
                        player.height = 32;
                    } else {
                        // Game over
                        game.lives--;
                        if (game.lives <= 0) {
                            alert('Game Over! Press R to restart');
                            game.lives = 3;
                            game.score = 0;
                        }
                        player.x = 100;
                        player.y = GROUND_Y;
                    }
                }
            }
        });
        
        // Coin collection and animation
        coins.forEach(coin => {
            if (!coin.collected) {
                // Animate coins
                coin.animTimer++;
                if (coin.animTimer > 10) {
                    coin.animFrame = (coin.animFrame + 1) % 4;
                    coin.animTimer = 0;
                }
                
                if (checkCollision(player, coin)) {
                    coin.collected = true;
                    game.score += 200;
                    createParticle(coin.x + coin.width/2, coin.y, '200', '#FFD700');
                    playSound('coin');
                }
            }
        });
        
        // Update particles
        updateParticles();
        
        // Update camera
        game.camera.x = Math.max(0, Math.min(player.x - 400, 1600 - canvas.width));
        
        // Update game timer
        game.time -= 0.02;
        if (game.time <= 0) {
            game.lives--;
            game.time = 400;
            if (game.lives <= 0) {
                alert('Time Up! Game Over! Press R to restart');
                game.lives = 3;
                game.score = 0;
            }
            player.x = 100;
            player.y = GROUND_Y;
        }
    }
    
    // Enhanced drawing functions for pixel art sprites
    function drawMario(x: number, y: number) {
        const pixelSize = 2;
        ctx.save();
        
        // Invulnerability flashing effect
        if (player.invulnerable && Math.floor(Date.now() / 100) % 2) {
            ctx.globalAlpha = 0.5;
        }
        
        // Star power rainbow effect
        if (player.starPower) {
            const hue = (Date.now() * 0.5) % 360;
            ctx.filter = `hue-rotate(${hue}deg)`;
        }
        
        // Scale and flip if facing left
        if (player.facing === -1) {
            ctx.scale(-1, 1);
            x = -x - player.width;
        }
        
        // Mario sprite pattern based on size and animation frame
        const marioColors: { [key: string]: string } = {
            red: '#FF0000',
            blue: '#0000FF', 
            yellow: '#FFD700',
            brown: '#8B4513',
            skin: '#FFDBAC',
            black: '#000000',
            white: '#FFFFFF',
            orange: '#FF8C00',
            green: '#00FF00'
        };
        
        // Get appropriate sprite pattern
        let pattern: string[][];
        if (player.size === 'fire') {
            pattern = player.isJumping ? getFireMarioJumpSprite() : getFireMarioWalkSprite(player.animFrame);
        } else if (player.size === 'super') {
            pattern = player.isJumping ? getSuperMarioJumpSprite() : getSuperMarioWalkSprite(player.animFrame);
        } else {
            pattern = player.isJumping ? getMarioJumpSprite() : getMarioWalkSprite(player.animFrame);
        }
        
        // Draw Mario pixel art
        for (let row = 0; row < pattern.length; row++) {
            for (let col = 0; col < pattern[row].length; col++) {
                const color = pattern[row][col];
                if (color !== '0') {
                    ctx.fillStyle = marioColors[color] || '#FF0000';
                    ctx.fillRect(x + col * pixelSize, y + row * pixelSize, pixelSize, pixelSize);
                }
            }
        }
        
        ctx.restore();
    }
    
    function getMarioWalkSprite(frame: number): string[][] {
        // Small Mario walking animation
        if (frame === 0) {
            return [
                '0000rrrr0000'.split(''),
                '000rrrrrr000'.split(''),
                '000bbsbb0000'.split(''),
                '00bsbsbb000'.split(''),
                '00bssssbb00'.split(''),
                '00ssssss000'.split(''),
                '000ssss0000'.split(''),
                '00rrbbrr000'.split(''),
                '0rrrbbrrr00'.split(''),
                'rrrrbbrrrrr'.split(''),
                'sssrbbrsss0'.split(''),
                'ssrrbbrrss0'.split(''),
                '00rrrrr0000'.split(''),
                '00rr00rr000'.split(''),
                '0bb0000bb00'.split(''),
                'bb000000bb0'.split('')
            ];
        } else {
            return [
                '0000rrrr0000'.split(''),
                '000rrrrrr000'.split(''),
                '000bbsbb0000'.split(''),
                '00bsbsbb000'.split(''),
                '00bssssbb00'.split(''),
                '00ssssss000'.split(''),
                '000ssss0000'.split(''),
                '00rrbbrr000'.split(''),
                '0rrrbbrrr00'.split(''),
                'rrrrbbrrrrr'.split(''),
                'sssrbbrsss0'.split(''),
                'ssrrbbrrss0'.split(''),
                '00rrrrrr000'.split(''),
                '000rrrr0000'.split(''),
                '000bb0bb000'.split(''),
                '00bb00bb000'.split('')
            ];
        }
    }
    
    function getSuperMarioWalkSprite(frame: number): string[][] {
        // Super Mario walking animation (taller)
        if (frame === 0) {
            return [
                '00000rrrr00000'.split(''),
                '0000rrrrrr0000'.split(''),
                '0000bbsbb00000'.split(''),
                '000bsbsbb0000'.split(''),
                '000bssssbb000'.split(''),
                '000ssssss0000'.split(''),
                '0000ssss00000'.split(''),
                '000rrbbrr0000'.split(''),
                '00rrrbbrrr000'.split(''),
                '0rrrrbbrrrrr0'.split(''),
                'ssssrbbrsssss'.split(''),
                'sssrrbbrrssss'.split(''),
                '0ssrrrrrrss00'.split(''),
                '00ssrrrrrss00'.split(''),
                '000rrrrrrr000'.split(''),
                '000rr000rr000'.split(''),
                '00bb00000bb00'.split(''),
                '0bb0000000bb0'.split(''),
                'bb000000000bb'.split(''),
                '0000000000000'.split('')
            ];
        } else {
            return [
                '00000rrrr00000'.split(''),
                '0000rrrrrr0000'.split(''),
                '0000bbsbb00000'.split(''),
                '000bsbsbb0000'.split(''),
                '000bssssbb000'.split(''),
                '000ssssss0000'.split(''),
                '0000ssss00000'.split(''),
                '000rrbbrr0000'.split(''),
                '00rrrbbrrr000'.split(''),
                '0rrrrbbrrrrr0'.split(''),
                'ssssrbbrsssss'.split(''),
                'sssrrbbrrssss'.split(''),
                '0ssrrrrrrrss0'.split(''),
                '00ssrrrrrrss0'.split(''),
                '0000rrrrrr000'.split(''),
                '0000bb0bb0000'.split(''),
                '000bb000bb000'.split(''),
                '00bb00000bb00'.split(''),
                '0bb0000000bb0'.split(''),
                '0000000000000'.split('')
            ];
        }
    }
    
    function getFireMarioWalkSprite(frame: number): string[][] {
        // Fire Mario walking animation (white overalls)
        if (frame === 0) {
            return [
                '00000rrrr00000'.split(''),
                '0000rrrrrr0000'.split(''),
                '0000bbsbb00000'.split(''),
                '000bsbsbb0000'.split(''),
                '000bssssbb000'.split(''),
                '000ssssss0000'.split(''),
                '0000ssss00000'.split(''),
                '000rrwwrr0000'.split(''),
                '00rrrwwrrr000'.split(''),
                '0rrrrwwrrrrr0'.split(''),
                'ssssrwwrsssss'.split(''),
                'sssrrwwrrssss'.split(''),
                '0ssrrrrrrss00'.split(''),
                '00ssrrrrrss00'.split(''),
                '000rrrrrrr000'.split(''),
                '000rr000rr000'.split(''),
                '00bb00000bb00'.split(''),
                '0bb0000000bb0'.split(''),
                'bb000000000bb'.split(''),
                '0000000000000'.split('')
            ];
        } else {
            return [
                '00000rrrr00000'.split(''),
                '0000rrrrrr0000'.split(''),
                '0000bbsbb00000'.split(''),
                '000bsbsbb0000'.split(''),
                '000bssssbb000'.split(''),
                '000ssssss0000'.split(''),
                '0000ssss00000'.split(''),
                '000rrwwrr0000'.split(''),
                '00rrrwwrrr000'.split(''),
                '0rrrrwwrrrrr0'.split(''),
                'ssssrwwrsssss'.split(''),
                'sssrrwwrrssss'.split(''),
                '0ssrrrrrrrss0'.split(''),
                '00ssrrrrrrss0'.split(''),
                '0000rrrrrr000'.split(''),
                '0000bb0bb0000'.split(''),
                '000bb000bb000'.split(''),
                '00bb00000bb00'.split(''),
                '0bb0000000bb0'.split(''),
                '0000000000000'.split('')
            ];
        }
    }
    
    function getMarioJumpSprite(): string[][] {
        return [
            '0000rrrr0000'.split(''),
            '000rrrrrr000'.split(''),
            '000bbsbb0000'.split(''),
            '00bsbsbb000'.split(''),
            '00bssssbb00'.split(''),
            '00ssssss000'.split(''),
            '000ssss0000'.split(''),
            '00rrbbrr000'.split(''),
            '0rrrbbrrr00'.split(''),
            'rrrrbbrrrrr'.split(''),
            'sssrbbrsss0'.split(''),
            '0srrrrrrs00'.split(''),
            '00rrrrrrr00'.split(''),
            '00rr000rr00'.split(''),
            '00rr000rr00'.split(''),
            '0bb00000bb0'.split('')
        ];
    }
    
    function getSuperMarioJumpSprite(): string[][] {
        return [
            '00000rrrr00000'.split(''),
            '0000rrrrrr0000'.split(''),
            '0000bbsbb00000'.split(''),
            '000bsbsbb0000'.split(''),
            '000bssssbb000'.split(''),
            '000ssssss0000'.split(''),
            '0000ssss00000'.split(''),
            '000rrbbrr0000'.split(''),
            '00rrrbbrrr000'.split(''),
            '0rrrrbbrrrrr0'.split(''),
            'ssssrbbrsssss'.split(''),
            '00srrrrrrs000'.split(''),
            '000rrrrrrr000'.split(''),
            '000rr000rr000'.split(''),
            '000rr000rr000'.split(''),
            '00bb00000bb00'.split(''),
            '0bb0000000bb0'.split(''),
            'bb000000000bb'.split(''),
            '0000000000000'.split(''),
            '0000000000000'.split('')
        ];
    }
    
    function getFireMarioJumpSprite(): string[][] {
        return [
            '00000rrrr00000'.split(''),
            '0000rrrrrr0000'.split(''),
            '0000bbsbb00000'.split(''),
            '000bsbsbb0000'.split(''),
            '000bssssbb000'.split(''),
            '000ssssss0000'.split(''),
            '0000ssss00000'.split(''),
            '000rrwwrr0000'.split(''),
            '00rrrwwrrr000'.split(''),
            '0rrrrwwrrrrr0'.split(''),
            'ssssrwwrsssss'.split(''),
            '00srrrrrrs000'.split(''),
            '000rrrrrrr000'.split(''),
            '000rr000rr000'.split(''),
            '000rr000rr000'.split(''),
            '00bb00000bb00'.split(''),
            '0bb0000000bb0'.split(''),
            'bb000000000bb'.split(''),
            '0000000000000'.split(''),
            '0000000000000'.split('')
        ];
    }
    
    function drawGoomba(x: number, y: number, frame: number) {
        const pixelSize = 2;
        ctx.fillStyle = '#8B4513'; // Brown body
        
        // Goomba body
        ctx.fillRect(x + 4, y + 8, 24, 20);
        
        // Goomba head
        ctx.fillStyle = '#A0522D';
        ctx.fillRect(x + 2, y, 28, 16);
        
        // Eyes
        ctx.fillStyle = '#000';
        ctx.fillRect(x + 8, y + 4, 4, 4);
        ctx.fillRect(x + 20, y + 4, 4, 4);
        
        // Eyebrows (animated)
        if (frame === 0) {
            ctx.fillRect(x + 6, y + 2, 8, 2);
            ctx.fillRect(x + 18, y + 2, 8, 2);
        } else {
            ctx.fillRect(x + 8, y + 1, 6, 2);
            ctx.fillRect(x + 18, y + 1, 6, 2);
        }
        
        // Feet
        ctx.fillStyle = '#654321';
        ctx.fillRect(x, y + 28, 8, 4);
        ctx.fillRect(x + 24, y + 28, 8, 4);
    }
    
    function drawKoopa(x: number, y: number, frame: number, inShell: boolean) {
        if (inShell) {
            // Draw Koopa shell
            ctx.fillStyle = '#00AA00';
            ctx.fillRect(x, y + 6, 32, 26);
            
            // Shell pattern
            ctx.fillStyle = '#228B22';
            ctx.fillRect(x + 4, y + 8, 24, 4);
            ctx.fillRect(x + 4, y + 16, 24, 4);
            ctx.fillRect(x + 4, y + 24, 24, 4);
            
            // Shell rim
            ctx.fillStyle = '#006400';
            ctx.fillRect(x + 2, y + 6, 28, 2);
            ctx.fillRect(x + 2, y + 30, 28, 2);
        } else {
            // Draw full Koopa
            // Body
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(x + 8, y + 14, 16, 18);
            
            // Shell
            ctx.fillStyle = '#00AA00';
            ctx.fillRect(x + 4, y + 4, 24, 20);
            
            // Shell pattern
            ctx.fillStyle = '#228B22';
            ctx.fillRect(x + 6, y + 6, 20, 4);
            ctx.fillRect(x + 6, y + 12, 20, 4);
            ctx.fillRect(x + 6, y + 18, 20, 4);
            
            // Head
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(x + 10, y, 12, 8);
            
            // Eyes
            ctx.fillStyle = '#000';
            ctx.fillRect(x + 12, y + 2, 2, 2);
            ctx.fillRect(x + 18, y + 2, 2, 2);
            
            // Feet (animated)
            ctx.fillStyle = '#FFA500';
            if (frame === 0) {
                ctx.fillRect(x + 6, y + 32, 6, 4);
                ctx.fillRect(x + 20, y + 32, 6, 4);
            } else {
                ctx.fillRect(x + 8, y + 32, 6, 4);
                ctx.fillRect(x + 18, y + 32, 6, 4);
            }
        }
    }
    
    function drawCoin(x: number, y: number, frame: number) {
        ctx.save();
        const centerX = x + 12;
        const centerY = y + 12;
        
        // Coin rotation animation
        const scale = Math.abs(Math.cos(frame * Math.PI / 2));
        
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(centerX - 8 * scale, centerY - 10, 16 * scale, 20);
        
        // Inner details
        ctx.fillStyle = '#FFA500';
        ctx.fillRect(centerX - 6 * scale, centerY - 8, 12 * scale, 16);
        
        ctx.restore();
    }
    
    function drawBackground() {
        // Sky gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#5C94FC');
        gradient.addColorStop(0.7, '#87CEEB');
        gradient.addColorStop(1, '#98FB98');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.save();
        ctx.translate(-game.camera.x * 0.3, 0); // Parallax scrolling
        
        // Draw clouds
        ctx.fillStyle = '#FFFFFF';
        backgroundElements.clouds.forEach(cloud => {
            const size = cloud.size;
            const x = cloud.x;
            const y = cloud.y;
            
            // Cloud shape (simple circles)
            ctx.beginPath();
            ctx.arc(x, y, 20 * size, 0, Math.PI * 2);
            ctx.arc(x + 25 * size, y, 25 * size, 0, Math.PI * 2);
            ctx.arc(x + 50 * size, y, 20 * size, 0, Math.PI * 2);
            ctx.arc(x + 25 * size, y - 15 * size, 15 * size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.restore();
        
        ctx.save();
        ctx.translate(-game.camera.x * 0.6, 0); // Different parallax for hills
        
        // Draw hills
        ctx.fillStyle = '#228B22';
        backgroundElements.hills.forEach(hill => {
            const size = hill.size;
            const x = hill.x;
            const y = hill.y;
            
            ctx.beginPath();
            ctx.arc(x, y, 60 * size, 0, Math.PI, true);
            ctx.fill();
        });
        
        // Draw bushes
        ctx.fillStyle = '#006400';
        backgroundElements.bushes.forEach(bush => {
            const size = bush.size;
            const x = bush.x;
            const y = bush.y;
            
            ctx.beginPath();
            ctx.arc(x, y, 15 * size, 0, Math.PI * 2);
            ctx.arc(x + 20 * size, y, 18 * size, 0, Math.PI * 2);
            ctx.arc(x + 40 * size, y, 15 * size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.restore();
    }
    
    function drawPlatform(platform: any) {
        const { x, y, width, height, type } = platform;
        
        switch (type) {
            case 'ground':
                // Ground texture
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(x, y, width, height);
                
                // Ground pattern
                ctx.fillStyle = '#654321';
                for (let i = 0; i < width; i += 32) {
                    for (let j = 0; j < height; j += 16) {
                        if ((i + j) % 32 === 0) {
                            ctx.fillRect(x + i, y + j, 16, 8);
                        }
                    }
                }
                break;
                
            case 'brick':
                // Brick pattern
                ctx.fillStyle = '#CD853F';
                ctx.fillRect(x, y, width, height);
                
                // Brick lines
                ctx.strokeStyle = '#8B4513';
                ctx.lineWidth = 2;
                for (let i = 0; i < width; i += 32) {
                    ctx.beginPath();
                    ctx.moveTo(x + i, y);
                    ctx.lineTo(x + i, y + height);
                    ctx.stroke();
                }
                for (let j = 0; j < height; j += 16) {
                    ctx.beginPath();
                    ctx.moveTo(x, y + j);
                    ctx.lineTo(x + width, y + j);
                    ctx.stroke();
                }
                break;
                
            case 'question':
                // Question block
                if (platform.hit) {
                    // Empty block
                    ctx.fillStyle = '#8B4513';
                    ctx.fillRect(x, y, width, height);
                    ctx.strokeStyle = '#654321';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(x, y, width, height);
                } else {
                    // Active question block
                    ctx.fillStyle = '#FFD700';
                    ctx.fillRect(x, y, width, height);
                    
                    ctx.fillStyle = '#FFA500';
                    ctx.strokeRect(x + 2, y + 2, width - 4, height - 4);
                    
                    // Question mark
                    ctx.fillStyle = '#8B4513';
                    ctx.font = '20px Press Start 2P';
                    ctx.textAlign = 'center';
                    ctx.fillText('?', x + width/2, y + height/2 + 8);
                }
                break;
                
            case 'pipe':
                // Pipe
                ctx.fillStyle = '#228B22';
                ctx.fillRect(x, y, width, height);
                
                // Pipe highlights
                ctx.fillStyle = '#32CD32';
                ctx.fillRect(x + 4, y, 8, height);
                ctx.fillRect(x + width - 12, y, 8, height);
                
                // Pipe rim
                if (height < 100) { // Top of pipe
                    ctx.fillStyle = '#228B22';
                    ctx.fillRect(x - 8, y - 16, width + 16, 16);
                    ctx.fillStyle = '#32CD32';
                    ctx.fillRect(x - 6, y - 14, width + 12, 12);
                }
                break;
        }
    }
    
    // Render game
    function render() {
        // Draw background
        drawBackground();
        
        // Save context for camera
        ctx.save();
        ctx.translate(-game.camera.x, 0);
        
        // Draw platforms
        platforms.forEach(platform => {
            drawPlatform(platform);
        });
        
        // Draw enemies
        enemies.forEach(enemy => {
            if (enemy.alive && enemy.x > game.camera.x - 100 && enemy.x < game.camera.x + canvas.width + 100) {
                if (enemy.type === 'goomba') {
                    drawGoomba(enemy.x, enemy.y, enemy.animFrame);
                } else if (enemy.type === 'koopa') {
                    drawKoopa(enemy.x, enemy.y, enemy.animFrame, enemy.inShell);
                }
            }
        });
        
        // Draw coins
        coins.forEach(coin => {
            if (!coin.collected) {
                drawCoin(coin.x, coin.y, coin.animFrame);
            }
        });
        
        // Draw player (Mario)
        drawMario(player.x, player.y);
        
        // Draw particles
        ctx.font = '14px Press Start 2P';
        ctx.textAlign = 'center';
        game.particles.forEach(particle => {
            ctx.fillStyle = particle.color;
            ctx.globalAlpha = particle.life / particle.maxLife;
            ctx.fillText(particle.text, particle.x, particle.y);
            ctx.globalAlpha = 1;
        });
        
        ctx.restore();
        
        // Update HUD
        const scoreElement = document.getElementById('scoreDisplay');
        const livesElement = document.getElementById('livesDisplay');
        const timeElement = document.getElementById('timeDisplay');
        
        if (scoreElement) scoreElement.textContent = game.score.toString().padStart(6, '0');
        if (livesElement) livesElement.textContent = game.lives.toString();
        if (timeElement) timeElement.textContent = Math.max(0, Math.floor(game.time)).toString();
    }
    
    // Game loop
    function gameLoop() {
        update();
        render();
        requestAnimationFrame(gameLoop);
    }
    
    // Initialize audio on first user interaction
    const initAudio = () => {
        Object.values(sounds).forEach(sound => {
            if (sound && sound.ctx && sound.ctx.state === 'suspended') {
                sound.ctx.resume();
            }
        });
    };
    
    document.addEventListener('click', initAudio, { once: true });
    
    // Start game
    gameLoop();
    console.log('Enhanced Super Mario game started!');
    console.log('Controls: Arrow Keys = Move, Spacebar = Jump, F = Fireball (Fire Mario), R = Restart');
    console.log('Features: Variable jump, power-ups, Koopa shells, fireballs, star power, and more!');
    
    // Cleanup function
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('click', initAudio);
    };
  }, []);

  return null; // This component doesn't render anything itself
}