// Level Configuration System
const LevelData = {
    levels: [
        {
            id: 1,
            name: "Getting Started",
            difficulty: "easy",
            birds: [
                { type: 'red', count: 3 }
            ],
            structures: [
                { type: 'wood', x: 700, y: 620, width: 20, height: 60, health: 50 },
                { type: 'wood', x: 800, y: 620, width: 20, height: 60, health: 50 },
                { type: 'wood', x: 680, y: 560, width: 160, height: 20, health: 50 }
            ],
            pigs: [
                { type: 'small', x: 750, y: 540, points: 500 }
            ],
            stars: { 
                one: 500, 
                two: 1000, 
                three: 1500 
            },
            background: 'grassland'
        },
        {
            id: 2,
            name: "Tower Defense",
            difficulty: "easy",
            birds: [
                { type: 'red', count: 2 },
                { type: 'blue', count: 1 }
            ],
            structures: [
                // Base
                { type: 'wood', x: 650, y: 620, width: 60, height: 60, health: 80 },
                { type: 'wood', x: 710, y: 620, width: 60, height: 60, health: 80 },
                { type: 'wood', x: 770, y: 620, width: 60, height: 60, health: 80 },
                // Middle
                { type: 'wood', x: 680, y: 560, width: 60, height: 60, health: 80 },
                { type: 'wood', x: 740, y: 560, width: 60, height: 60, health: 80 },
                // Top
                { type: 'wood', x: 710, y: 500, width: 60, height: 60, health: 80 }
            ],
            pigs: [
                { type: 'small', x: 710, y: 600, points: 500 },
                { type: 'medium', x: 710, y: 540, points: 750 },
                { type: 'small', x: 740, y: 480, points: 500 }
            ],
            stars: { 
                one: 1000, 
                two: 2000, 
                three: 3000 
            },
            background: 'grassland'
        },
        {
            id: 3,
            name: "Stone Fortress",
            difficulty: "medium",
            birds: [
                { type: 'red', count: 2 },
                { type: 'yellow', count: 2 }
            ],
            structures: [
                // Stone base
                { type: 'stone', x: 550, y: 620, width: 60, height: 60, health: 150 },
                { type: 'stone', x: 610, y: 620, width: 60, height: 60, health: 150 },
                { type: 'stone', x: 670, y: 620, width: 60, height: 60, health: 150 },
                { type: 'stone', x: 730, y: 620, width: 60, height: 60, health: 150 },
                { type: 'stone', x: 790, y: 620, width: 60, height: 60, health: 150 },
                // Wood middle
                { type: 'wood', x: 580, y: 560, width: 60, height: 60, health: 80 },
                { type: 'wood', x: 700, y: 560, width: 60, height: 60, health: 80 },
                { type: 'wood', x: 760, y: 560, width: 60, height: 60, health: 80 },
                // Ice platforms
                { type: 'ice', x: 640, y: 500, width: 100, height: 20, health: 40 }
            ],
            pigs: [
                { type: 'small', x: 640, y: 600, points: 500 },
                { type: 'medium', x: 730, y: 540, points: 750 },
                { type: 'large', x: 690, y: 480, points: 1000 }
            ],
            stars: { 
                one: 1500, 
                two: 3000, 
                three: 4500 
            },
            background: 'grassland'
        },
        {
            id: 4,
            name: "Ice Kingdom",
            difficulty: "medium",
            birds: [
                { type: 'red', count: 1 },
                { type: 'blue', count: 2 },
                { type: 'yellow', count: 1 }
            ],
            structures: [
                // Ice structures
                { type: 'ice', x: 600, y: 620, width: 60, height: 60, health: 40 },
                { type: 'ice', x: 660, y: 620, width: 60, height: 60, health: 40 },
                { type: 'ice', x: 720, y: 620, width: 60, height: 60, health: 40 },
                { type: 'ice', x: 780, y: 620, width: 60, height: 60, health: 40 },
                { type: 'ice', x: 630, y: 560, width: 60, height: 60, health: 40 },
                { type: 'ice', x: 750, y: 560, width: 60, height: 60, health: 40 },
                { type: 'ice', x: 690, y: 500, width: 60, height: 60, health: 40 },
                // Support beams
                { type: 'wood', x: 640, y: 580, width: 20, height: 40, health: 60 },
                { type: 'wood', x: 740, y: 580, width: 20, height: 40, health: 60 }
            ],
            pigs: [
                { type: 'small', x: 660, y: 600, points: 500 },
                { type: 'small', x: 720, y: 600, points: 500 },
                { type: 'medium', x: 690, y: 540, points: 750 },
                { type: 'medium', x: 690, y: 480, points: 750 }
            ],
            stars: { 
                one: 2000, 
                two: 3500, 
                three: 5000 
            },
            background: 'snow'
        },
        {
            id: 5,
            name: "Castle Siege",
            difficulty: "hard",
            birds: [
                { type: 'red', count: 2 },
                { type: 'blue', count: 1 },
                { type: 'yellow', count: 1 },
                { type: 'black', count: 1 }
            ],
            structures: [
                // Left tower
                { type: 'stone', x: 550, y: 620, width: 30, height: 60, health: 150 },
                { type: 'stone', x: 550, y: 560, width: 30, height: 60, health: 150 },
                { type: 'stone', x: 550, y: 500, width: 30, height: 60, health: 150 },
                // Right tower
                { type: 'stone', x: 800, y: 620, width: 30, height: 60, health: 150 },
                { type: 'stone', x: 800, y: 560, width: 30, height: 60, health: 150 },
                { type: 'stone', x: 800, y: 500, width: 30, height: 60, health: 150 },
                // Center structure
                { type: 'wood', x: 630, y: 620, width: 120, height: 20, health: 80 },
                { type: 'wood', x: 640, y: 600, width: 20, height: 100, health: 80 },
                { type: 'wood', x: 720, y: 600, width: 20, height: 100, health: 80 },
                { type: 'wood', x: 630, y: 500, width: 120, height: 20, health: 80 },
                // TNT boxes
                { type: 'tnt', x: 680, y: 620, width: 40, height: 40, health: 30 }
            ],
            pigs: [
                { type: 'small', x: 560, y: 480, points: 500 },
                { type: 'small', x: 810, y: 480, points: 500 },
                { type: 'medium', x: 680, y: 560, points: 750 },
                { type: 'large', x: 680, y: 480, points: 1000 },
                { type: 'king', x: 680, y: 420, points: 2000 }
            ],
            stars: { 
                one: 3000, 
                two: 5000, 
                three: 7000 
            },
            background: 'castle'
        },
        {
            id: 6,
            name: "Piggy Pyramid",
            difficulty: "hard",
            birds: [
                { type: 'red', count: 1 },
                { type: 'blue', count: 2 },
                { type: 'yellow', count: 2 }
            ],
            structures: [
                // Bottom row
                { type: 'stone', x: 580, y: 620, width: 60, height: 60, health: 150 },
                { type: 'stone', x: 640, y: 620, width: 60, height: 60, health: 150 },
                { type: 'stone', x: 700, y: 620, width: 60, height: 60, health: 150 },
                { type: 'stone', x: 760, y: 620, width: 60, height: 60, health: 150 },
                // Second row
                { type: 'wood', x: 610, y: 560, width: 60, height: 60, health: 80 },
                { type: 'wood', x: 670, y: 560, width: 60, height: 60, health: 80 },
                { type: 'wood', x: 730, y: 560, width: 60, height: 60, health: 80 },
                // Third row
                { type: 'ice', x: 640, y: 500, width: 60, height: 60, health: 40 },
                { type: 'ice', x: 700, y: 500, width: 60, height: 60, health: 40 },
                // Top
                { type: 'wood', x: 670, y: 440, width: 60, height: 60, health: 80 }
            ],
            pigs: [
                { type: 'small', x: 610, y: 600, points: 500 },
                { type: 'small', x: 730, y: 600, points: 500 },
                { type: 'medium', x: 670, y: 540, points: 750 },
                { type: 'medium', x: 670, y: 480, points: 750 },
                { type: 'king', x: 670, y: 420, points: 2000 }
            ],
            stars: { 
                one: 3500, 
                two: 5500, 
                three: 7500 
            },
            background: 'desert'
        },
        {
            id: 7,
            name: "TNT Factory",
            difficulty: "hard",
            birds: [
                { type: 'red', count: 2 },
                { type: 'yellow', count: 1 },
                { type: 'black', count: 2 }
            ],
            structures: [
                // Structure with TNT
                { type: 'wood', x: 600, y: 620, width: 60, height: 60, health: 80 },
                { type: 'tnt', x: 660, y: 620, width: 40, height: 40, health: 30 },
                { type: 'wood', x: 700, y: 620, width: 60, height: 60, health: 80 },
                { type: 'tnt', x: 760, y: 620, width: 40, height: 40, health: 30 },
                { type: 'wood', x: 800, y: 620, width: 60, height: 60, health: 80 },
                // Upper level
                { type: 'stone', x: 630, y: 560, width: 60, height: 60, health: 150 },
                { type: 'tnt', x: 690, y: 560, width: 40, height: 40, health: 30 },
                { type: 'stone', x: 730, y: 560, width: 60, height: 60, health: 150 },
                // Top platform
                { type: 'wood', x: 650, y: 500, width: 100, height: 20, health: 60 }
            ],
            pigs: [
                { type: 'small', x: 660, y: 600, points: 500 },
                { type: 'small', x: 760, y: 600, points: 500 },
                { type: 'medium', x: 690, y: 540, points: 750 },
                { type: 'large', x: 690, y: 480, points: 1000 }
            ],
            stars: { 
                one: 4000, 
                two: 6000, 
                three: 8000 
            },
            background: 'industrial'
        },
        {
            id: 8,
            name: "The Final Challenge",
            difficulty: "expert",
            birds: [
                { type: 'red', count: 2 },
                { type: 'blue', count: 2 },
                { type: 'yellow', count: 2 },
                { type: 'black', count: 1 }
            ],
            structures: [
                // Massive fortress
                // Left wing
                { type: 'stone', x: 520, y: 620, width: 40, height: 60, health: 150 },
                { type: 'stone', x: 520, y: 560, width: 40, height: 60, health: 150 },
                { type: 'stone', x: 520, y: 500, width: 40, height: 60, health: 150 },
                { type: 'wood', x: 560, y: 620, width: 40, height: 60, health: 80 },
                // Center fortress
                { type: 'stone', x: 640, y: 620, width: 120, height: 20, health: 150 },
                { type: 'wood', x: 650, y: 600, width: 20, height: 100, health: 80 },
                { type: 'wood', x: 730, y: 600, width: 20, height: 100, health: 80 },
                { type: 'tnt', x: 685, y: 560, width: 30, height: 30, health: 30 },
                { type: 'stone', x: 640, y: 500, width: 120, height: 20, health: 150 },
                // Right wing
                { type: 'stone', x: 820, y: 620, width: 40, height: 60, health: 150 },
                { type: 'stone', x: 820, y: 560, width: 40, height: 60, health: 150 },
                { type: 'stone', x: 820, y: 500, width: 40, height: 60, health: 150 },
                { type: 'wood', x: 780, y: 620, width: 40, height: 60, health: 80 },
                // Top protection
                { type: 'ice', x: 600, y: 440, width: 180, height: 20, health: 40 }
            ],
            pigs: [
                { type: 'small', x: 530, y: 480, points: 500 },
                { type: 'small', x: 830, y: 480, points: 500 },
                { type: 'medium', x: 685, y: 540, points: 750 },
                { type: 'large', x: 685, y: 480, points: 1000 },
                { type: 'large', x: 685, y: 420, points: 1000 },
                { type: 'king', x: 685, y: 360, points: 3000 }
            ],
            stars: { 
                one: 5000, 
                two: 8000, 
                three: 12000 
            },
            background: 'castle'
        }
    ],

    getLevelById(id) {
        return this.levels.find(level => level.id === id);
    },

    getTotalLevels() {
        return this.levels.length;
    },

    getNextLevel(currentId) {
        const nextId = currentId + 1;
        return this.getLevelById(nextId);
    }
};

