// Advanced Physics Engine for Angry Birds Clone
class PhysicsEngine {
    constructor() {
        this.gravity = 0.6;
        this.airResistance = 0.99;
        this.groundFriction = 0.95;
        this.restitution = 0.6; // Bounciness
    }

    applyGravity(object) {
        object.vy += this.gravity;
    }

    applyAirResistance(object) {
        object.vx *= this.airResistance;
        object.vy *= this.airResistance;
    }

    applyFriction(object) {
        object.vx *= this.groundFriction;
    }

    updatePosition(object) {
        object.x += object.vx;
        object.y += object.vy;
    }

    // Circle to Circle collision detection
    checkCircleCollision(obj1, obj2) {
        const dx = obj2.x - obj1.x;
        const dy = obj2.y - obj1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = obj1.radius + obj2.radius;
        
        if (distance < minDistance) {
            return {
                collided: true,
                normal: { x: dx / distance, y: dy / distance },
                depth: minDistance - distance
            };
        }
        return { collided: false };
    }

    // Circle to Rectangle collision detection
    checkCircleRectCollision(circle, rect) {
        const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
        const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
        
        const dx = circle.x - closestX;
        const dy = circle.y - closestY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < circle.radius) {
            const normal = distance > 0 ? 
                { x: dx / distance, y: dy / distance } : 
                { x: 0, y: -1 };
            
            return {
                collided: true,
                normal: normal,
                depth: circle.radius - distance,
                point: { x: closestX, y: closestY }
            };
        }
        return { collided: false };
    }

    // Resolve collision with impulse-based physics
    resolveCollision(obj1, obj2, collision) {
        const relativeVelocity = {
            x: obj2.vx - obj1.vx,
            y: obj2.vy - obj1.vy
        };

        const velocityAlongNormal = 
            relativeVelocity.x * collision.normal.x + 
            relativeVelocity.y * collision.normal.y;

        if (velocityAlongNormal > 0) return;

        const e = Math.min(obj1.restitution || this.restitution, 
                          obj2.restitution || this.restitution);

        let j = -(1 + e) * velocityAlongNormal;
        const mass1 = obj1.mass || 1;
        const mass2 = obj2.mass || 1;
        j /= (1 / mass1 + 1 / mass2);

        const impulse = {
            x: j * collision.normal.x,
            y: j * collision.normal.y
        };

        obj1.vx -= impulse.x / mass1;
        obj1.vy -= impulse.y / mass1;
        obj2.vx += impulse.x / mass2;
        obj2.vy += impulse.y / mass2;

        return Math.abs(j);
    }

    // Separate overlapping objects
    separateObjects(obj1, obj2, collision) {
        const percent = 0.8;
        const slop = 0.01;
        const correction = Math.max(collision.depth - slop, 0) / 
                          ((1 / (obj1.mass || 1)) + (1 / (obj2.mass || 1))) * percent;

        obj1.x -= correction * collision.normal.x / (obj1.mass || 1);
        obj1.y -= correction * collision.normal.y / (obj1.mass || 1);
        obj2.x += correction * collision.normal.x / (obj2.mass || 1);
        obj2.y += correction * collision.normal.y / (obj2.mass || 1);
    }

    // Calculate trajectory points for aiming
    calculateTrajectory(startX, startY, vx, vy, steps = 30) {
        const points = [];
        let x = startX;
        let y = startY;
        let velocityX = vx;
        let velocityY = vy;

        for (let i = 0; i < steps; i++) {
            points.push({ x, y });
            velocityY += this.gravity;
            velocityX *= this.airResistance;
            velocityY *= this.airResistance;
            x += velocityX;
            y += velocityY;
            
            if (y > 700) break; // Ground level
        }

        return points;
    }

    // Check if object is at rest
    isAtRest(object, threshold = 0.1) {
        return Math.abs(object.vx) < threshold && Math.abs(object.vy) < threshold;
    }
}

