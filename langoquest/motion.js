document.addEventListener("DOMContentLoaded", () => {
    let questions = [];
    let step = 0;
    let score = 0;
    let gameMode = "classic"; // classic ou challenge
    let ranking = JSON.parse(localStorage.getItem("quizRanking")) || [];
    let timer;
    let timeLeft = 30;
    let playerName = "";
    
   function loadQuestion() {
    if (step >= questions.length) {
        endGame();
        return;
    }
    
    clearInterval(timer);
    timeLeft = 30;

    // Só inicia o timer no modo desafio
    if (gameMode === "challenge") {
        startTimer();
    }

    document.getElementById("quiz-container").innerHTML = `
        <h1 id="question">${questions[step].question}</h1>
        <div id="options" class="options"></div>
        <p id="feedback"></p>
        ${gameMode === "challenge" ? `<p id="timer" style="font-weight: bold; color: green;">Tempo restante: ${timeLeft}s</p>` : ""}
        <div id="video-container" class="hidden">
            <iframe id="video" width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>
            <button onclick="nextQuestion()">Continuar</button>
        </div>
    `;

    const optionsContainer = document.getElementById("options");
    questions[step].options.forEach(option => {
        const button = document.createElement("button");
        button.innerText = option;
        button.onclick = () => checkAnswer(button, option);
        optionsContainer.appendChild(button);
    });
}


    function showModeSelection() {
        document.getElementById("quiz-container").innerHTML = `
            <h1>Escolha o Modo de Jogo</h1>
            <input type="text" id="playerName" placeholder="Seu Nome">
            <button onclick="startGame('classic')">Modo Clássico</button>
            <button onclick="startGame('challenge')">Modo Desafio</button>
        `;
    }

    window.startGame = (mode) => {
        gameMode = mode;
        step = 0;
        score = 0;
        timeLeft = 30;
        playerName = document.getElementById("playerName").value || "Jogador";
        loadQuestion();
    };

    function loadQuestion() {
        if (step >= questions.length) {
            endGame();
            return;
        }
        
        clearInterval(timer);
        timeLeft = 30;
        startTimer();
        
        document.getElementById("quiz-container").innerHTML = `
            <h1 id="question">${questions[step].question}</h1>
            <div id="options" class="options"></div>
            <p id="feedback"></p>
            <p id="timer" style="font-weight: bold; color: green;">Tempo restante: ${timeLeft}s</p>
            <div id="video-container" class="hidden">
                <iframe id="video" width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>
                <button onclick="nextQuestion()">Continuar</button>
            </div>
        `;

        const optionsContainer = document.getElementById("options");
        questions[step].options.forEach(option => {
            const button = document.createElement("button");
            button.innerText = option;
            button.onclick = () => checkAnswer(button, option);
            optionsContainer.appendChild(button);
        });
    }

    function startTimer() {
        timer = setInterval(() => {
            timeLeft--;
            let timerElement = document.getElementById("timer");
            timerElement.innerText = `Tempo restante: ${timeLeft}s`;
            
            if (timeLeft <= 10) timerElement.style.color = "orange";
            if (timeLeft <= 5) timerElement.style.color = "red";
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                endGame();
            }
        }, 1000);
    }

    function checkAnswer(button, option) {
        const currentQuestion = questions[step];
        if (option === currentQuestion.answer) {
            button.style.background = "green";
            button.style.transform = "scale(1.2)";
            
            let scoreText = document.createElement("span");
            scoreText.innerText = "+1 ponto!";
            scoreText.style.color = "green";
            scoreText.style.fontWeight = "bold";
            scoreText.style.position = "absolute";
            scoreText.style.top = "50%";
            scoreText.style.left = "50%";
            scoreText.style.transform = "translate(-50%, -50%)";
            scoreText.style.animation = "fadeOut 1s ease-out";
            document.getElementById("quiz-container").appendChild(scoreText);
            
            setTimeout(() => {
                scoreText.remove();
                step++;
                score++;
                loadQuestion();
            }, 1000);
        } else {
            button.classList.add("shake");
            setTimeout(() => button.classList.remove("shake"), 500);
            if (gameMode === "classic") {
                document.getElementById("feedback").innerText = "Incorreto! Assista a aula de reforço.";
                document.getElementById("video").src = currentQuestion.video;
                document.getElementById("video-container").classList.remove("hidden");
            } else {
                endGame();
            }
        }
    }

    function nextQuestion() {
        step++;
        loadQuestion();
    }

    function endGame() {
        clearInterval(timer);
        if (gameMode === "challenge") {
            ranking.push({ name: playerName, score: score, date: new Date().toLocaleString() });
            ranking.sort((a, b) => b.score - a.score);
            ranking = ranking.slice(0, 5); // Mantém apenas os 5 melhores
            localStorage.setItem("quizRanking", JSON.stringify(ranking));
        }

        let rankingHTML = ranking.map((entry, index) => {
            let medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "";
            return `<p>${medal} ${index + 1}. ${entry.name} - ${entry.score} pontos (${entry.date})</p>`;
        }).join('');

        document.getElementById("quiz-container").innerHTML = `
            <h1>Fim de Jogo</h1>
            <p>Seu placar: ${score}</p>
            <p>Seu Recorde: ${Math.max(...ranking.map(r => r.score), 0)} pontos</p>
            ${gameMode === "challenge" ? `<h2>Ranking:</h2> ${rankingHTML}` : ""}
            <button onclick="showModeSelection()">Jogar Novamente</button>
        `;
    }

    loadQuestions();
});
