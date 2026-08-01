// CMA Report Dashboard - Client-side logic for HTML report viewer
// Features: Humor, engagement, data visualization, theme switching

class CMADashboard {
    constructor() {
        this.theme = localStorage.getItem('cma-theme') || 'modern';
        this.soundEnabled = localStorage.getItem('cma-sound') !== 'false';
        this.lastAnalysisDate = localStorage.getItem('cma-last-analysis');
        this.analysisStreak = parseInt(localStorage.getItem('cma-streak') || '0');
        this.jsonData = null;
        this.devJokes = [
            "Why do programmers prefer dark mode? Because light attracts bugs!",
            "There are 10 types of people in the world: those who understand binary, and those who don't.",
            "Debugging: Removing the needles from the haystack.",
            "I told my wife she was drawing her eyebrows too high. She looked surprised.",
            "Why did the programmer quit his job? He didn't get arrays.",
            "A SQL query walks into a bar and sees two tables. He walks up and says 'Can I join you?'",
            "Programmers don't byte, they nibble a bit.",
            "The best thing about a boolean is even if you are wrong, you are only off by a bit."
        ];
        this.devFacts = [
            "The first computer bug was an actual moth found in a Harvard Mark II computer in 1947.",
            "GitHub was originally called 'Logical Awesome' during early development.",
            "The first 1GB hard drive weighed over 500 pounds and cost $40,000 in 1980.",
            "Python was named after Monty Python, not the snake.",
            "The first computer programmer was Ada Lovelace in 1843.",
            "Java was originally called 'Oak' after a tree outside James Gosling's office.",
            "The term 'debugging' was coined by Grace Hopper when she removed a moth from a computer.",
            "The first computer virus was created in 1983 and was called the 'Elk Cloner'."
        ];
        this.loadingMessages = [
            "Analyzing your code's inner thoughts...",
            "Counting lines faster than a caffeinated developer...",
            "Detecting technical debt with extreme prejudice...",
            "Calculating your code's karma score...",
            "Sorting your functions by existential crisis level...",
            "Measuring cyclomatic complexity like it's a competitive sport...",
            "Searching for TODO comments like they're Easter eggs...",
            "Validating your code's life choices..."
        ];
        this.healthScoreMemes = [
            { min: 90, max: 100, text: "Your code is cleaner than a junior dev's resume!" },
            { min: 80, max: 89, text: "Solid work! Your code would make a senior dev nod approvingly." },
            { min: 70, max: 79, text: "Decent! Your code is like a well-commented Stack Overflow answer." },
            { min: 60, max: 69, text: "Getting there! Your code needs more comments than a politician's speech." },
            { min: 50, max: 59, text: "Uh oh... Your code has more surprises than a legacy JavaScript project." },
            { min: 40, max: 49, text: "Yikes! Time to refactor before your code becomes sentient and vengeful." },
            { min: 30, max: 39, text: "Yikes yikes! Your cyclomatic complexity is trying to escape." },
            { min: 0, max: 29, text: "Holy spaghetti, Batman! This code needs more structure than a toddler's LEGO project." }
        ];
        
        this.init();
    }

    init() {
        this.applyTheme();
        this.bindEvents();
        this.loadReport();
        this.playKonamiListener();
        this.updateStreakDisplay();
        this.rotateLoadingMessage();
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        // Update theme selector UI
        const themeSelect = document.getElementById('theme');
        if (themeSelect) themeSelect.value = this.theme;
    }

    bindEvents() {
        // Theme selector
        const themeSelect = document.getElementById('theme');
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                this.theme = e.target.value;
                localStorage.setItem('cma-theme', this.theme);
                this.applyTheme();
            });
        }

        // Sound toggle
        const soundToggle = document.getElementById('sound-toggle');
        if (soundToggle) {
            soundToggle.addEventListener('change', (e) => {
                this.soundEnabled = e.target.checked;
                localStorage.setItem('cma-sound', this.soundEnabled ? 'true' : 'false');
            });
        }

        // File search
        const fileSearch = document.getElementById('file-search');
        if (fileSearch) {
            fileSearch.addEventListener('input', (e) => this.filterFiles(e.target.value));
        }
    }

    loadReport() {
        // Try to load report.json from same directory
        fetch('report.json')
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return response.json();
            })
            .then(data => {
                this.jsonData = data;
                this.hideLoadingState();
                this.populateReport();
                this.playSound('success');
                this.updateStreak();
            })
            .catch(error => {
                console.error('Error loading report:', error);
                this.showError('Failed to load report.json. Make sure you ran CMA with --json flag.');
                this.playSound('error');
            });
    }

    hideLoadingState() {
        document.getElementById('loading-state').classList.add('hidden');
        document.getElementById('report-content').classList.remove('hidden');
    }

    showError(message) {
        const loadingState = document.getElementById('loading-state');
        loadingState.innerHTML = `
            <div class="error-message">
                <h2>❌ Oops!</h2>
                <p>${message}</p>
                <p>Tip: Run <code>cma ./src --json report.json</code> first, then open this dashboard.</p>
            </div>
        `;
    }

    populateReport() {
        if (!this.jsonData) return;

        // Populate overview
        this.populateOverview();
        this.populateHotspots();
        this.populateViolations();
        this.populateDependencies();
        this.populateFiles();
    }

    populateOverview() {
        const project = this.jsonData.project || {};
        
        // Health score and grade
        const healthScore = project.healthScore || 0;
        const healthGrade = project.healthGrade || 'F';
        document.getElementById('health-score-value').textContent = `${healthScore}`;
        document.getElementById('health-grade').textContent = healthGrade;
        document.getElementById('health-score-numeric').textContent = healthScore;
        document.getElementById('health-grade-letter').textContent = healthGrade;
        
        // Health score gauge fill percentage
        const gaugeFill = document.querySelector('.gauge-fill');
        if (gaugeFill) {
            gaugeFill.style.width = `${Math.min(healthScore, 100)}%`;
            // Color based on grade
            const gradeColors = { A: '#4c1', B: '#97ca00', C: '#dfb317', D: '#fe7d37', F: '#e05d44' };
            gaugeFill.style.backgroundColor = gradeColors[healthGrade] || '#e05d44';
        }

        // Health score meme
        const meme = this.healthScoreMemes.find(m => healthScore >= m.min && healthScore <= m.max);
        document.getElementById('health-score-meme').textContent = meme ? meme.text : '';

        // Other metrics
        document.getElementById('files-analyzed').textContent = project.filesAnalyzed || 0;
        document.getElementById('total-lines').textContent = this.formatNumber(project.totalLines || 0);
        document.getElementById('comment-lines').textContent = this.formatNumber(project.commentLines || 0);
        document.getElementById('function-count').textContent = project.functionCount || 0;
        document.getElementById('todo-count').textContent = project.todoCount || 0;

        // Update loading message with joke
        const loadingMessage = document.getElementById('loading-message');
        if (loadingMessage) {
            loadingMessage.textContent = this.getRandomJoke();
        }
    }

    populateHotspots() {
        if (!this.jsonData.hotspots || !this.jsonData.hotspots.gitAvailable) {
            document.getElementById('hotspots-panel').innerHTML = `
                <p class="no-data">📊 No git repository detected. Hotspot analysis requires a git repo.</p>
                <p class="no-data-hint">Run CMA inside a git repository to see hotspot scores (complexity × churn).</p>
            `;
            return;
        }

        const hotspots = this.jsonData.hotspots.topFiles || [];
        const tbody = document.querySelector('#hotspots-table tbody');
        tbody.innerHTML = '';

        // Engine JSON carries only per-file cyclomaticComplexity/commitCount --
        // no maxComplexity/maxCommits field is ever emitted (see
        // ReportGenerator::writeHotspotsJson). Derive the normalization
        // bounds client-side to match MetricsEngine::buildHotspotReport()'s
        // own formula instead of reading nonexistent fields.
        const maxComplexity = Math.max(1, ...hotspots.map(h => h.cyclomaticComplexity));
        const maxCommits = Math.max(1, ...hotspots.map(h => h.commitCount));

        hotspots.forEach((hotspot, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${this.shortenPath(hotspot.path)}</td>
                <td>${hotspot.cyclomaticComplexity}</td>
                <td>${hotspot.commitCount}</td>
                <td>${hotspot.hotspotScore.toFixed(1)}</td>
                <td>
                    <div class="hotspot-details">
                        <p>📍 <strong>Path:</strong> ${hotspot.path}</p>
                        <p>📈 <strong>Lines Added:</strong> ${this.formatNumber(hotspot.linesAdded)}</p>
                        <p>📉 <strong>Lines Deleted:</strong> ${this.formatNumber(hotspot.linesDeleted)}</p>
                        <p>🔥 <strong>Hotspot Formula:</strong> (${hotspot.cyclomaticComplexity}/${maxComplexity}) × (${hotspot.commitCount}/${maxCommits}) × 100</p>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });

        document.getElementById('hotspots-loading').classList.add('hidden');
    }

    populateViolations() {
        const violations = this.jsonData.violations || [];
        const tbody = document.querySelector('#violations-table tbody');
        tbody.innerHTML = '';

        const showInfo = document.getElementById('filter-info').checked;
        const showWarning = document.getElementById('filter-warning').checked;
        const filterLang = document.getElementById('filter-language').value;

        violations
            .filter(v => 
                (showInfo && v.severity === 'info') || 
                (showWarning && v.severity === 'warning')
            )
            .filter(v => filterLang === 'all' || v.language === filterLang)
            .forEach(v => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${this.shortenPath(v.path)}</td>
                    <td>${v.line}</td>
                    <td><code>${v.ruleId}</code></td>
                    <td title="${v.message}">${this.truncate(v.message, 50)}</td>
                    <td class="severity-${v.severity}">${v.severity.toUpperCase()}</td>
                `;
                tr.addEventListener('click', () => {
                    alert(`Rule Explanation:\n${v.message}\n\nFile: ${v.path}\nLine: ${v.line}`);
                });
                tbody.appendChild(tr);
            });

        document.getElementById('violations-loading').classList.add('hidden');
        
        // Show helpful message if no violations after filtering
        if (tbody.children.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="no-data">No violations match current filters.</td></tr>';
        }
    }

    populateDependencies() {
        if (!this.jsonData.files || this.jsonData.files.length === 0) {
            document.getElementById('dependencies-panel').innerHTML = `
                <p class="no-data">📂 No dependency data available.</p>
                <p class="no-data-hint">Run CMA with source files to see dependency graphs.</p>
            `;
            return;
        }

        // Check if dependency graph data exists in files
        const hasDeps = this.jsonData.files.some(f => 
            f.dependencies && 
            (f.dependencies.fanOut > 0 || f.dependencies.fanIn > 0)
        );

        if (!hasDeps) {
            document.getElementById('dependencies-panel').innerHTML = `
                <p class="no-data">🔗 No external dependencies detected.</p>
                <p class="no-data-hint">Dependencies are shown when files import/include other files in your project.</p>
            `;
            return;
        }

        // Populate dependencies table
        const tbody = document.querySelector('#deps-table tbody');
        tbody.innerHTML = '';

        this.jsonData.files.forEach((f) => {
            if (!f.dependencies) return;
            const path = f.path;
            const deps = f.dependencies;
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${this.shortenPath(path)}</td>
                <td>${deps.fanOut || 0}</td>
                <td>${deps.fanIn || 0}</td>
                <td>${deps.dependsOn ? deps.dependsOn.join(', ') : ''}</td>
                <td>${deps.dependedOnBy ? deps.dependedOnBy.join(', ') : ''}</td>
            `;
            tbody.appendChild(tr);
        });

        document.getElementById('deps-loading').classList.add('hidden');
    }

    populateFiles() {
        if (!this.jsonData.files || this.jsonData.files.length === 0) {
            document.getElementById('files-panel').innerHTML = `
                <p class="no-data">📄 No files analyzed.</p>
            `;
            return;
        }

        const tbody = document.querySelector('#files-table tbody');
        tbody.innerHTML = '';

        this.jsonData.files.forEach((f) => {
            const path = f.path;
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${this.shortenPath(path)}</td>
                <td>${this.formatNumber(f.totalLines)}</td>
                <td>${f.functionCount || 0}</td>
                <td>${f.classCount || 0}</td>
                <td>${f.cyclomaticComplexity}</td>
                <td>
                    <button class="details-btn" data-path="${path}">Details</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Add event listeners to details buttons
        document.querySelectorAll('.details-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const path = e.target.getAttribute('data-path');
                const fileMetrics = this.jsonData.files.find(f => f.path === path);
                this.showFileDetails(path, fileMetrics);
            });
        });
    }

    filterFiles(searchTerm) {
        const tbody = document.querySelector('#files-table tbody');
        const rows = tbody.getElementsByTagName('tr');
        
        Array.from(rows).forEach(row => {
            const fileName = row.cells[0].textContent;
            row.style.display = fileName.toLowerCase().includes(searchTerm.toLowerCase()) ? '' : 'none';
        });
    }

    showFileDetails(path, metrics) {
        const details = `
            File: ${path}
            ────────────────────
            Total Lines: ${this.formatNumber(metrics.totalLines)}
            Blank Lines: ${this.formatNumber(metrics.blankLines)}
            Comment Lines: ${this.formatNumber(metrics.commentLines)}
            Code Lines: ${this.formatNumber(metrics.codeLines)}
            
            Functions: ${metrics.functionCount || 0}
            Classes: ${metrics.classCount || 0}
            Variables: ${metrics.variableCount || 0}
            Includes: ${metrics.includeCount || 0}
            
            Loops: ${metrics.loopCount || 0}
            Conditions: ${metrics.conditionCount || 0}
            Try/Catch: ${metrics.tryCatchCount || 0}
            Max Nesting: ${metrics.maxNestingDepth}
            Cyclomatic Complexity: ${metrics.cyclomaticComplexity}
            TODOs: ${metrics.todoCount}
        `;
        alert(details);
    }

    // Helper methods
    getRandomJoke() {
        return this.devJokes[Math.floor(Math.random() * this.devJokes.length)];
    }

    getRandomFact() {
        return this.devFacts[Math.floor(Math.random() * this.devFacts.length)];
    }

    shortenPath(path) {
        if (path.length > 30) {
            return '...' + path.slice(-30);
        }
        return path;
    }

    truncate(str, length) {
        return str.length > length ? str.slice(0, length) + '...' : str;
    }

    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    // Sound effects
    playSound(type) {
        if (!this.soundEnabled) return;
        const soundMap = {
            'success': 'success-sound',
            'error': 'error-sound',
            'konami': 'konami-sound'
        };
        const audio = document.getElementById(soundMap[type]);
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(e => console.log("Audio play failed:", e));
        }
    }

    // Konami code easter egg
    playKonamiListener() {
        let konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
        let konamiIndex = 0;

        document.addEventListener('keydown', (e) => {
            if (e.code === konamiCode[konamiIndex]) {
                konamiIndex++;
                if (konamiIndex === konamiCode.length) {
                    this.triggerKonamiEasterEgg();
                    konamiIndex = 0;
                }
            } else {
                konamiIndex = 0;
            }
        });
    }

    triggerKonamiEasterEgg() {
        this.playSound('konami');
        // Show confetti (simple version)
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + 'vw';
                confetti.style.top = '-10px';
                confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 80%, 50%)`;
                document.body.appendChild(confetti);
                
                // Animate falling
                let pos = -10;
                const frame = () => {
                    pos += Math.random() * 3 + 1;
                    confetti.style.top = pos + 'px';
                    if (pos < window.innerHeight) {
                        requestAnimationFrame(frame);
                    } else {
                        confetti.remove();
                    }
                };
                requestAnimationFrame(frame);
            }, i * 100);
        }
        
        // Show temporary message
        const konamiMsg = document.createElement('div');
        konamiMsg.className = 'konami-message';
        konamiMsg.textContent = "🎉 KONAMI CODE UNLOCKED! 🎉 Developer mode: ENGAGED";
        document.body.appendChild(konamiMsg);
        setTimeout(() => konamiMsg.remove(), 3000);
    }

    // Streak tracking
    updateStreak() {
        const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        
        if (this.lastAnalysisDate === today) {
            // Same day, streak continues
            return;
        }
        
        const lastDate = new Date(this.lastAnalysisDate);
        const todayDate = new Date(today);
        const diffTime = Math.abs(todayDate - lastDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            // Consecutive day
            this.analysisStreak++;
        } else if (diffDays > 1) {
            // Streak broken
            this.analysisStreak = 1;
        }
        // If diffDays === 0, it's the same day (handled above)
        
        this.lastAnalysisDate = today;
        localStorage.setItem('cma-last-analysis', today);
        localStorage.setItem('cma-streak', this.analysisStreak.toString());
        
        this.updateStreakDisplay();
    }

    updateStreakDisplay() {
        const streakMessage = document.getElementById('streak-message');
        const streakVisual = document.getElementById('streak-visual');
        
        if (this.analysisStreak >= 3) {
            streakMessage.textContent = `🔥 You're on a ${this.analysisStreak}-day analysis streak!`;
            streakVisual.innerHTML = '🔥'.repeat(Math.min(this.analysisStreak, 5));
        } else if (this.analysisStreak === 2) {
            streakMessage.textContent = `🔥 You're on a 2-day streak! Keep it going!`;
            streakVisual.innerHTML = '🔥🔥';
        } else if (this.analysisStreak === 1) {
            streakMessage.textContent = `🔥 Day 1 of your analysis streak!`;
            streakVisual.innerHTML = '🔥';
        } else {
            streakMessage.textContent = `Start analyzing to build your streak!`;
            streakVisual.innerHTML = '';
        }
    }

    // Mini-game: Typing speed test
    initTypingTest() {
        const container = document.getElementById('mini-game-container');
        if (!container) return;
        
        const quotes = [
            "Hello, World!",
            "Stay hungry, stay foolish.",
            "Premature optimization is the root of all evil.",
            "First, solve the problem. Then, write the code.",
            "Talk is cheap. Show me the code.",
            "Simplicity is the soul of efficiency.",
            "Code is like humor. When you have to explain it, it's bad.",
            "The best error message is the one that never shows up."
        ];
        
        const quote = quotes[Math.floor(Math.random() * quotes.length)];
        let startTime;
        let isActive = false;
        
        container.innerHTML = `
            <div class="typing-test">
                <h4>⌨️ 5-Second Typing Challenge</h4>
                <p>Type this as fast as you can:</p>
                <p class="quote-to-type">${quote}</p>
                <textarea id="typing-input" placeholder="Start typing here..."></textarea>
                <div id="typing-result"></div>
            </div>
        `;
        
        const textarea = document.getElementById('typing-input');
        const resultDiv = document.getElementById('typing-result');
        
        textarea.addEventListener('input', () => {
            if (!isActive) {
                startTime = Date.now();
                isActive = true;
                
                // Auto-end after 5 seconds
                setTimeout(() => {
                    isActive = false;
                    this.calculateTypingResult(textarea.value, quote, startTime);
                }, 5000);
            }
        });
    }

    calculateTypingResult(typed, original, startTime) {
        const endTime = Date.now();
        const timeTaken = (endTime - startTime) / 1000; // seconds
        const words = typed.trim().length / 5; // rough word count
        const wpm = Math.round((words / timeTaken) * 60);
        
        // Calculate accuracy
        let correct = 0;
        for (let i = 0; i < Math.min(typed.length, original.length); i++) {
            if (typed[i] === original[i]) correct++;
        }
        const accuracy = Math.round((correct / original.length) * 100);
        
        const resultDiv = document.getElementById('typing-result');
        resultDiv.innerHTML = `
            <p>⏱️ Time: ${timeTaken.toFixed(1)}s</p>
            <p>🚀 WPM: ${wpm}</p>
            <p>🎯 Accuracy: ${accuracy}%</p>
            ${wpm > 40 ? '<p>💡 You type faster than most developers!' : ''}
        `;
        
        // Play sound based on performance
        if (wpm > 50 && accuracy > 90) {
            this.playSound('success');
        }
    }

    // Populate dev fact
    populateDevFact() {
        const factDiv = document.getElementById('dev-fact');
        if (factDiv) {
            factDiv.innerHTML = `<p>💡 ${this.getRandomFact()}</p>`;
        }
    }

    rotateLoadingMessage() {
        const loadingMessage = document.getElementById('loading-message');
        if (loadingMessage) {
            loadingMessage.textContent = this.getRandomJoke();
            setTimeout(() => this.rotateLoadingMessage(), 8000); // Change every 8 seconds
        }
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.cmaDashboard = new CMADashboard();
    
    // Initialize typing test after a short delay to ensure DOM is ready
    setTimeout(() => {
        window.cmaDashboard.initTypingTest();
        window.cmaDashboard.populateDevFact();
    }, 500);
});
