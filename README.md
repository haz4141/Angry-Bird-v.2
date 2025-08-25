# Angry Birds Clone

A faithful recreation of the original Angry Birds game built with HTML5 Canvas and JavaScript. This game captures the essence of the classic physics-based puzzle game where you launch birds to destroy structures and eliminate pigs.

## 🎮 Game Features

### Core Gameplay
- **Physics-based gameplay** with realistic gravity and collision detection
- **Slingshot mechanics** - click and drag to aim, release to shoot
- **Multiple bird types** (currently featuring the classic red bird)
- **Destructible structures** made of wood and stone blocks
- **Green pigs** as targets with different health levels
- **Particle effects** for explosions and visual feedback

### Visual Elements
- **Beautiful gradient backgrounds** with animated clouds
- **Detailed character sprites** for birds and pigs
- **Health bars** for obstacles and pigs
- **Aiming line** with visual feedback
- **Modern UI** with score tracking and bird counter

### Game Mechanics
- **3 birds per level** - use them strategically
- **Score system** - earn points for destroying obstacles and pigs
- **Health system** - obstacles and pigs have different health levels
- **Win/lose conditions** - destroy all pigs to win, run out of birds to lose
- **Restart functionality** - play again anytime

## 🚀 How to Play

1. **Open the game** by opening `index.html` in your web browser
2. **Aim your shot** by clicking and dragging on the red bird
3. **Pull back** to increase power (further pull = more power)
4. **Release** to launch the bird
5. **Destroy structures** and eliminate all green pigs to win
6. **Use strategy** - some structures are stronger than others
7. **Try again** if you run out of birds

## 🎯 Game Controls

- **Mouse/Touch**: Click and drag to aim, release to shoot
- **Restart Button**: Click to start a new game
- **Mobile Support**: Works on touch devices

## 🏗️ Technical Details

### Built With
- **HTML5 Canvas** for rendering
- **Vanilla JavaScript** for game logic
- **CSS3** for styling and animations
- **Physics engine** with gravity, friction, and collision detection

### Game Architecture
- **Object-oriented design** with a main game class
- **Game loop** using requestAnimationFrame for smooth 60fps gameplay
- **Event-driven input handling** for mouse and touch
- **Modular rendering system** for different game elements

### Physics System
- **Gravity**: Realistic falling motion
- **Friction**: Objects slow down over time
- **Collision detection**: Circle-circle and circle-rectangle collisions
- **Health system**: Objects can take damage before being destroyed

## 📁 File Structure

```
Angry Birds Clone/
├── index.html          # Main HTML file
├── style.css           # CSS styling
├── game.js             # Main game logic
└── README.md           # This file
```

## 🎨 Customization

The game is easily customizable:

- **Add new levels** by modifying the `createLevel()` method
- **Change physics** by adjusting gravity, friction, and elasticity values
- **Add new bird types** with different abilities
- **Modify visuals** by changing colors and sprites
- **Add sound effects** for enhanced gameplay

## 🌟 Future Enhancements

Potential features to add:
- Multiple bird types (yellow, blue, black birds)
- Sound effects and background music
- Multiple levels with increasing difficulty
- Power-ups and special abilities
- High score system
- Mobile-optimized controls
- More complex structures and physics

## 🎮 Play Now

Simply open `index.html` in any modern web browser to start playing! The game works on desktop and mobile devices.

---

**Enjoy the game!** 🐦🎯🐷
