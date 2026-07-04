// quiz-script.js
let currentQuestions = [];
let userAnswers = {};
let currentIndex = 0;
let timeLeft = 60 * 60;
let checkedAnswers = {};   
let timerInterval;
let currentTopic = "fachovy";   // за замовчуванням

// Запуск
document.addEventListener('DOMContentLoaded', () => {
    currentTopic = localStorage.getItem('selectedTestTopic') || 'fachovy';
    
    // Змінюємо заголовок тесту
    const titleEl = document.getElementById('test-title');
    if (titleEl) {
        if (currentTopic === 'fachovy') {
            titleEl.textContent = "Фаховий тест з біології";
        } else {
            titleEl.textContent = currentTopic;
        }
    }

    loadQuestions();
    startTimer();
    renderQuestion();
    updateScore();
});

function loadQuestions() {
    if (typeof questionBank === 'undefined') {
        alert("База питань (questionBank) не знайдена!");
        return;
    }

    let sourceQuestions = [];

    if (currentTopic === 'fachovy') {
        sourceQuestions = questionBank["fachovy"] || [];
    } else {
        sourceQuestions = questionBank[currentTopic] || [];
    }

    if (sourceQuestions.length === 0) {
        alert(`В розділі "${currentTopic}" ще немає питань!`);
        return;
    }

    const numQuestions = Math.min(50, sourceQuestions.length);
    
    currentQuestions = [...sourceQuestions]
        .sort(() => Math.random() - 0.5)
        .slice(0, numQuestions);
}

// Таймер
function startTimer() {
    const minEl = document.getElementById('timer-min');
    const secEl = document.getElementById('timer-sec');
    const progress = document.getElementById('timer-progress');
    const radius = 44;
    const circumference = 2 * Math.PI * radius;
    progress.style.strokeDasharray = circumference;

    timerInterval = setInterval(() => {
        timeLeft--;
        const m = Math.floor(timeLeft / 60);
        const s = timeLeft % 60;
        minEl.textContent = m < 10 ? '0' + m : m;
        secEl.textContent = s < 10 ? '0' + s : s;
        const offset = circumference - (timeLeft / (60*60)) * circumference;
        progress.style.strokeDashoffset = offset;
        if (timeLeft <= 0) clearInterval(timerInterval);
    }, 1000);
}

function renderQuestion() {
    const q = currentQuestions[currentIndex];
    if (!q) return;

    document.getElementById('question-text').textContent = q.question;
    document.getElementById('question-counter').innerHTML = 
        `Питання <strong>${currentIndex + 1}</strong> з ${currentQuestions.length}`;

    const container = document.getElementById('options-container');
    container.innerHTML = '';

    const userAnswer = userAnswers[q.id];
    const isChecked = checkedAnswers[q.id];

    q.options.forEach((option, index) => {
        const div = document.createElement('div');
        div.className = 'option';

        if (isChecked) {
            if (index === q.correct) {
                div.classList.add('correct');
            } else if (index === userAnswer) {
                div.classList.add('incorrect');
            }
        }

        div.innerHTML = `
            <input type="radio" name="answer" id="opt${index}" 
                   ${userAnswer === index ? 'checked' : ''} 
                   ${isChecked ? 'disabled' : ''}>
            <label for="opt${index}">${option}</label>
        `;

        if (!isChecked) {
            div.addEventListener('click', () => {
                userAnswers[q.id] = index;
                renderQuestion();
            });
        }

        container.appendChild(div);
    });
}

function checkAnswer() {
    const q = currentQuestions[currentIndex];
    if (!q || userAnswers[q.id] === undefined) {
        alert("Спочатку оберіть варіант відповіді!");
        return;
    }
    
    checkedAnswers[q.id] = true;   // позначаємо, що питання перевірене
    renderQuestion();              // показуємо підсвічування
}
function nextQuestion() {
    if (currentIndex < currentQuestions.length - 1) {
        currentIndex++;
        renderQuestion();
        updateScore();
    } else {
        finishTest();   // Просто викликаємо finishTest
    }
}

function prevQuestion() {
    if (currentIndex > 0) {
        currentIndex--;
        renderQuestion();
    }
}

function updateScore() {
    let score = 0;
    currentQuestions.forEach(q => {
        if (userAnswers[q.id] === q.correct) score += 2;
    });
    document.getElementById('current-score').textContent = `${score} / 100`;
}

// Завершення тесту
function finishTest() {
    console.log("finishTest() викликано!");   // для перевірки

    clearInterval(timerInterval);
    updateScore();
    
    const score = parseInt(document.getElementById('current-score').textContent) || 0;
    const percentage = score;

    console.log("Зберігаємо результат:", currentTopic, score, percentage);

    // Зберігаємо в статистику
    if (typeof Stats !== 'undefined') {
        Stats.saveTestResult(currentTopic, score, 100);
    } else {
        console.error("Stats не знайдено!");
    }

    // Показуємо екран результатів
    const resultScreen = document.getElementById('result-screen');
    if (resultScreen) {
        resultScreen.classList.remove('hidden');
    } else {
        alert("Тест завершено! Ваш результат: " + percentage + " балів");
        return;
    }

    document.getElementById('final-score').textContent = percentage;
    document.getElementById('final-percentage').textContent = percentage;

    // Оцінка в 5-бальній системі
    let gradeText = "";
    let gradeColor = "";

    if (percentage >= 90) {
        gradeText = "Відмінно (5)";
        gradeColor = "#10b981";
    } else if (percentage >= 75) {
        gradeText = "Добре (4)";
        gradeColor = "#22c55e";
    } else if (percentage >= 60) {
        gradeText = "Задовільно (3)";
        gradeColor = "#eab308";
    } else {
        gradeText = "Незадовільно (2)";
        gradeColor = "#ef4444";
    }

    const gradeEl = document.getElementById('final-grade');
    if (gradeEl) {
        gradeEl.textContent = gradeText;
        gradeEl.style.color = gradeColor;
    }

    const msg = percentage >= 75 
        ? "Молодець! Ти добре підготувався." 
        : "Не засмучуйся! Спробуй ще раз.";
    const msgEl = document.getElementById('result-message');
    if (msgEl) msgEl.textContent = msg;
}

// Модифікуємо nextQuestion()
function nextQuestion() {
    if (currentIndex < currentQuestions.length - 1) {
        currentIndex++;
        renderQuestion();
        updateScore();
    } else {
        finishTest();   // завершуємо тест
    }
}

// Кнопки на фінальній сторінці
function restartTest() {
    location.reload();   // перезавантажуємо сторінку
}

function goToHome() {
    window.location.href = "index.html";
}