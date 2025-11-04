// ----- FIREBASE -----
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyA1gl8paXCdvsGdwyB-qo3_Y0brDBX2p6Y",
    authDomain: "brophy-survey-manager.firebaseapp.com",
    projectId: "brophy-survey-manager",
    storageBucket: "brophy-survey-manager.firebasestorage.app",
    messagingSenderId: "757416966665",
    appId: "1:757416966665:web:c866527fc472b6f919d6d8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
console.log("[FIREBASE] Connected:", app);

// ----- DROPDOWN -----
let selectedCaptain = null;
const dropdown = document.querySelector(".custom-dropdown");
const button = dropdown.querySelector(".dropdown-button");
const items = dropdown.querySelectorAll(".dropdown-item");

button.addEventListener("click", () => dropdown.classList.toggle("active"));

items.forEach(item => {
    item.addEventListener("click", () => {
        selectedCaptain = item.getAttribute("data-value");
        button.textContent = selectedCaptain;
        dropdown.classList.remove("active");
        console.log("[SELECTION] Captain selected:", selectedCaptain);
    });
});

// ----- SURVEY ANSWER SELECTION -----
const answers = {};
function selectAnswer(button, qNumber, type = "yesno") {
    let value = parseInt(button.getAttribute("data-value"));

    if(type === "yesno") {
        value = value === 1 ? 4 : 0;
    }

    answers[qNumber] = value;

    const siblings = button.parentElement.querySelectorAll(".answer-button");
    siblings.forEach(s => {
        s.style.color = "#000000";
        s.style.background = "none";
        s.style.border = "1px solid #000000";
    });

    button.style.color = "#ffffff";
    button.style.backgroundColor = "#000000";
    button.style.border = "1px solid #000000";
}
window.selectAnswer = selectAnswer;

// ----- NOTIFICATION -----
function showNotification(message, duration = 3000, color= "#ae1010") {
    const notification = document.getElementById("notification");
    notification.innerText = message;
    notification.style.display = "block";
    notification.style.opacity = "1";
    notification.style.backgroundColor = color;
    notification.style.transform = "translateX(-50%) scale(1)";

    setTimeout(() => {
        notification.style.opacity = "0";
        notification.style.transform = "translateX(-50%) scale(0.95)";
        setTimeout(() => { notification.style.display = "none"; }, 300);
    }, duration);
}

// ----- SHOW/HIDE -----
function show(shown, hidden) {
    document.getElementById(shown).style.display='block';
    document.getElementById(hidden).style.display='none';
}
window.show = show;

// ----- SUBMIT & SAVE TO FIRESTORE -----
async function calculateScore() {
    const totalQuestions = 27;
    const maxScore = totalQuestions * 4;
    const resultParagraph = document.querySelector("#surveyResult p");

    // CHECK IF ALREADY SUBMITTED
    if (localStorage.getItem("surveySubmitted")) {
        showNotification("Error: You have already submitted this survey.", 3000);
        return;
    }

    // ENSURE ALL QUESTIONS ANSWERED
    for (let i = 1; i <= totalQuestions; i++) {
        if (!(i in answers)) {
        showNotification("Error: Please ensure all questions are answered.", 3000);
        return;
        }
    }

    // CALCULATE SCORE
    let score = 0;
    Object.values(answers).forEach(v => score += v);

    setTimeout(() => {
        document.getElementById("surveyContent").style.display = "none";
        document.getElementById("surveyResult").style.display = "block";
        document.getElementById("finalScore").innerText = `${score} / ${maxScore}`;
        document.getElementById("finalScore").style.color = "#000000";
    }, 3000);

    // SAVE TO FIRESTORE
    try {
        await addDoc(collection(db, "surveyResponses"), {
        teamCaptain: selectedCaptain || null,
        answers: { ...answers },
        score: score,
        timestamp: serverTimestamp()
        });

        localStorage.setItem("surveySubmitted", "true");

        showNotification("Survey submitted successfully. Calculating...", 3000, "#188f18");
        console.log("[FIRESTORE] Survey saved:", { teamCaptain: selectedCaptain, answers, score });
    } catch (error) {
        showNotification("Error: Please try again.", 3000);
        console.error("[FIRESTORE] Error saving survey:", error);
    }
}
window.calculateScore = calculateScore;