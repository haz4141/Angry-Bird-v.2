// Bird Types Configuration
class BirdFactory {
    static createBird(type, x, y) {
        const baseStats = {
            x: x,
            y: y,
            vx: 0,
            vy: 0,
            isLaunched: false,
            isActive: false,
            abilityUsed: false,
            angularVelocity: 0,
            angle: 0
        };

        switch (type) {
            case 'red':
                return {
                    ...baseStats,
                    type: 'red',
                    name: 'Red',
                    radius: 20,
                    mass: 1,
                    restitution: 0.6,
                    damage: 50,
                    ability: 'none',
                    abilityDescription: 'No special ability',
                    color: '#FF0000',
                    secondaryColor: '#CC0000'
                };

            case 'blue':
                return {
                    ...baseStats,
                    type: 'blue',
                    name: 'The Blues',
                    radius: 16,
                    mass: 0.6,
                    restitution: 0.5,
                    damage: 30,
                    ability: 'split',
                    abilityDescription: 'Splits into 3 birds',
                    color: '#4169E1',
                    secondaryColor: '#1E3A8A',
                    splitCount: 3
                };

            case 'yellow':
                return {
                    ...baseStats,
                    type: 'yellow',
                    name: 'Chuck',
                    radius: 18,
                    mass: 0.8,
                    restitution: 0.7,
                    damage: 70,
                    ability: 'speed',
                    abilityDescription: 'Speed boost in flight',
                    color: '#FFD700',
                    secondaryColor: '#FFA500',
                    speedMultiplier: 1.8
                };

            case 'black':
                return {
                    ...baseStats,
                    type: 'black',
                    name: 'Bomb',
                    radius: 24,
                    mass: 2,
                    restitution: 0.3,
                    damage: 100,
                    ability: 'explode',
                    abilityDescription: 'Explodes on impact',
                    color: '#2C2C2C',
                    secondaryColor: '#000000',
                    explosionRadius: 100,
                    explosionDamage: 150
                };

            case 'white':
                return {
                    ...baseStats,
                    type: 'white',
                    name: 'Matilda',
                    radius: 22,
                    mass: 1.2,
                    restitution: 0.5,
                    damage: 60,
                    ability: 'egg',
                    abilityDescription: 'Drops explosive egg',
                    color: '#FFFFFF',
                    secondaryColor: '#E8E8E8',
                    eggDamage: 80
                };

            default:
                return this.createBird('red', x, y);
        }
    }

    static getBirdColors(type) {
        const bird = this.createBird(type, 0, 0);
        return {
            primary: bird.color,
            secondary: bird.secondaryColor
        };
    }
}

// Pig Types Configuration
class PigFactory {
    static createPig(type, x, y, points) {
        const baseStats = {
            x: x,
            y: y,
            vx: 0,
            vy: 0,
            points: points,
            isDestroyed: false,
            angle: 0,
            angularVelocity: 0
        };

        switch (type) {
            case 'small':
                return {
                    ...baseStats,
                    type: 'small',
                    name: 'Minion Pig',
                    radius: 18,
                    mass: 0.8,
                    health: 50,
                    maxHealth: 50,
                    color: '#90EE90',
                    isKing: false
                };

            case 'medium':
                return {
                    ...baseStats,
                    type: 'medium',
                    name: 'Corporal Pig',
                    radius: 22,
                    mass: 1.2,
                    health: 100,
                    maxHealth: 100,
                    color: '#7CFC00',
                    isKing: false
                };

            case 'large':
                return {
                    ...baseStats,
                    type: 'large',
                    name: 'Foreman Pig',
                    radius: 26,
                    mass: 1.8,
                    health: 150,
                    maxHealth: 150,
                    color: '#32CD32',
                    isKing: false
                };

            case 'king':
                return {
                    ...baseStats,
                    type: 'king',
                    name: 'King Pig',
                    radius: 30,
                    mass: 2.5,
                    health: 250,
                    maxHealth: 250,
                    color: '#228B22',
                    isKing: true,
                    hasCrown: true
                };

            default:
                return this.createPig('small', x, y, points);
        }
    }
}

// Structure Types Configuration
class StructureFactory {
    static createStructure(type, x, y, width, height, health) {
        const baseStats = {
            x: x,
            y: y,
            width: width,
            height: height,
            vx: 0,
            vy: 0,
            angle: 0,
            angularVelocity: 0,
            isDestroyed: false,
            maxHealth: health
        };

        switch (type) {
            case 'wood':
                return {
                    ...baseStats,
                    type: 'wood',
                    name: 'Wood',
                    health: health,
                    mass: 1,
                    color: '#8B4513',
                    secondaryColor: '#654321',
                    restitution: 0.3,
                    friction: 0.6
                };

            case 'stone':
                return {
                    ...baseStats,
                    type: 'stone',
                    name: 'Stone',
                    health: health,
                    mass: 3,
                    color: '#696969',
                    secondaryColor: '#505050',
                    restitution: 0.2,
                    friction: 0.8
                };

            case 'ice':
                return {
                    ...baseStats,
                    type: 'ice',
                    name: 'Ice',
                    health: health,
                    mass: 0.5,
                    color: '#87CEEB',
                    secondaryColor: '#B0E0E6',
                    restitution: 0.9,
                    friction: 0.1
                };

            case 'tnt':
                return {
                    ...baseStats,
                    type: 'tnt',
                    name: 'TNT',
                    health: health,
                    mass: 1.5,
                    color: '#DC143C',
                    secondaryColor: '#8B0000',
                    restitution: 0.4,
                    friction: 0.5,
                    explosive: true,
                    explosionRadius: 120,
                    explosionDamage: 200
                };

            default:
                return this.createStructure('wood', x, y, width, height, health);
        }
    }
}

