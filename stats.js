// stats.js

const Stats = {
    saveTestResult(topic, score, maxScore) {
        let allStats = JSON.parse(localStorage.getItem('bioTestStats')) || {};

        const result = {
            date: new Date().toISOString(),
            score: score,
            maxScore: maxScore,
            percentage: Math.round((score / maxScore) * 100)
        };

        if (!allStats[topic]) allStats[topic] = [];
        allStats[topic].push(result);

        // Глобальна статистика
        if (!allStats.global) {
            allStats.global = { 
                totalTests: 0, 
                best: 0, 
                worst: 0,
                lastResult: 0,
                lastDate: null
            };
        }

        allStats.global.totalTests++;
        const perc = result.percentage;

        if (perc > allStats.global.best) allStats.global.best = perc;
        if (allStats.global.worst === 0 || perc < allStats.global.worst) allStats.global.worst = perc;

        // Зберігаємо останній результат
        allStats.global.lastResult = perc;
        allStats.global.lastDate = result.date;

        localStorage.setItem('bioTestStats', JSON.stringify(allStats));
    },

    getStats() {
        return JSON.parse(localStorage.getItem('bioTestStats')) || {};
    },

    getGlobalStats() {
        const stats = this.getStats();
        const global = stats.global || { totalTests: 0, best: 0, worst: 0 };
        
        // Якщо ще немає тестів — показуємо 0
        if (global.totalTests === 0) {
            global.worst = 0;
        }
        return global;
    },

    clearStats() {
        if (confirm("Очистити всю статистику?")) {
            localStorage.removeItem('bioTestStats');
            location.reload();
        }
    }
};

window.Stats = Stats;