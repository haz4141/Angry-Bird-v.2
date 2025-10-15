// Save/Load System using localStorage
class SaveSystem {
    constructor() {
        this.saveKey = 'angryBirdsGameSave';
    }

    saveLevelProgress(levelId, stars, score) {
        const saveData = this.loadGameData();
        
        if (!saveData.levels[levelId]) {
            saveData.levels[levelId] = {
                unlocked: true,
                stars: stars,
                highScore: score,
                completed: stars > 0
            };
        } else {
            saveData.levels[levelId].stars = Math.max(saveData.levels[levelId].stars, stars);
            saveData.levels[levelId].highScore = Math.max(saveData.levels[levelId].highScore, score);
            saveData.levels[levelId].completed = true;
        }

        // Unlock next level
        if (levelId < 8) {
            if (!saveData.levels[levelId + 1]) {
                saveData.levels[levelId + 1] = {
                    unlocked: true,
                    stars: 0,
                    highScore: 0,
                    completed: false
                };
            } else {
                saveData.levels[levelId + 1].unlocked = true;
            }
        }

        saveData.totalStars = this.calculateTotalStars(saveData.levels);
        saveData.lastPlayed = Date.now();

        localStorage.setItem(this.saveKey, JSON.stringify(saveData));
        return saveData;
    }

    loadGameData() {
        const savedData = localStorage.getItem(this.saveKey);
        
        if (savedData) {
            return JSON.parse(savedData);
        }

        // Default save data
        return {
            levels: {
                1: {
                    unlocked: true,
                    stars: 0,
                    highScore: 0,
                    completed: false
                }
            },
            totalStars: 0,
            settings: {
                soundEnabled: true,
                musicEnabled: true,
                showTrajectory: true
            },
            achievements: [],
            lastPlayed: Date.now()
        };
    }

    getLevelData(levelId) {
        const saveData = this.loadGameData();
        return saveData.levels[levelId] || {
            unlocked: false,
            stars: 0,
            highScore: 0,
            completed: false
        };
    }

    isLevelUnlocked(levelId) {
        const levelData = this.getLevelData(levelId);
        return levelData.unlocked || levelId === 1;
    }

    calculateTotalStars(levels) {
        return Object.values(levels).reduce((total, level) => total + (level.stars || 0), 0);
    }

    getTotalStars() {
        const saveData = this.loadGameData();
        return saveData.totalStars || 0;
    }

    saveSettings(settings) {
        const saveData = this.loadGameData();
        saveData.settings = { ...saveData.settings, ...settings };
        localStorage.setItem(this.saveKey, JSON.stringify(saveData));
    }

    getSettings() {
        const saveData = this.loadGameData();
        return saveData.settings;
    }

    unlockAchievement(achievementId) {
        const saveData = this.loadGameData();
        if (!saveData.achievements.includes(achievementId)) {
            saveData.achievements.push(achievementId);
            localStorage.setItem(this.saveKey, JSON.stringify(saveData));
            return true;
        }
        return false;
    }

    resetProgress() {
        localStorage.removeItem(this.saveKey);
        return this.loadGameData();
    }

    exportSave() {
        const saveData = this.loadGameData();
        return btoa(JSON.stringify(saveData));
    }

    importSave(encodedData) {
        try {
            const saveData = JSON.parse(atob(encodedData));
            localStorage.setItem(this.saveKey, JSON.stringify(saveData));
            return true;
        } catch (e) {
            console.error('Failed to import save data:', e);
            return false;
        }
    }
}

// Achievement System
const Achievements = {
    achievements: [
        {
            id: 'first_blood',
            name: 'First Blood',
            description: 'Defeat your first pig',
            icon: '🐷',
            condition: (stats) => stats.totalPigsDefeated >= 1
        },
        {
            id: 'perfectionist',
            name: 'Perfectionist',
            description: 'Get 3 stars on any level',
            icon: '⭐',
            condition: (stats) => stats.threeStarLevels >= 1
        },
        {
            id: 'sharpshooter',
            name: 'Sharpshooter',
            description: 'Complete a level using only 1 bird',
            icon: '🎯',
            condition: (stats) => stats.oneBirdVictories >= 1
        },
        {
            id: 'demolition_expert',
            name: 'Demolition Expert',
            description: 'Destroy 100 structures',
            icon: '💥',
            condition: (stats) => stats.totalStructuresDestroyed >= 100
        },
        {
            id: 'pig_slayer',
            name: 'Pig Slayer',
            description: 'Defeat 50 pigs',
            icon: '🗡️',
            condition: (stats) => stats.totalPigsDefeated >= 50
        },
        {
            id: 'combo_master',
            name: 'Combo Master',
            description: 'Get a 5x combo',
            icon: '🔥',
            condition: (stats) => stats.maxCombo >= 5
        },
        {
            id: 'all_stars',
            name: 'All Stars',
            description: 'Collect all stars in the game',
            icon: '🌟',
            condition: (stats) => stats.totalStars >= 24
        },
        {
            id: 'speed_demon',
            name: 'Speed Demon',
            description: 'Complete a level in under 30 seconds',
            icon: '⚡',
            condition: (stats) => stats.fastestLevel <= 30
        }
    ],

    checkAchievements(stats) {
        const unlocked = [];
        this.achievements.forEach(achievement => {
            if (achievement.condition(stats)) {
                unlocked.push(achievement.id);
            }
        });
        return unlocked;
    },

    getAchievement(id) {
        return this.achievements.find(a => a.id === id);
    }
};

