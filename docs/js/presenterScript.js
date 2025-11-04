// ----- FIREBASE -----
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

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
const responsesRef = collection(db, "surveyResponses");
console.log("[FIREBASE] Connected:", app);

// ----- KEY -----
const op = "AxMJB1RcRxYTLRdSV0AAU1xGBA==";
const ok = "salt123";

function b64(b64) {
  const binary = atob(b64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
function byStr(bytes) {
  return Array.from(bytes).map(b => String.fromCharCode(b)).join('');
}
function xWK(bytes, key) {
  const out = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    out[i] = bytes[i] ^ key.charCodeAt(i % key.length);
  }
  return out;
}
function dO(obfB64, key) {
  const bytes = b64(obfB64);
  const decoded = xWK(bytes, key);
  return byStr(decoded);
}

const key = dO(op, ok);


// ----- TEAM CAPTAINS -----
const teamCaptains = [
    "Jim Grindey","Chabli Balcom","Abbey Withey","Fred Garner","Chris Rapa","Ian Hunthausen",
    "John Lovell","Wayne Catan","Jack White","Nick Ellis","Paul Hamel","Scott Middlemist",
    "Andy Mazzolini","Ashley Doud","Brittany DiMarco","Simon Zachary, SJ"
];

// ----- PANEL VISIBILITY -----
const surveyContainer = document.getElementById("survey");
const enteredPanelPassword = prompt("Enter password to access Presenter Panel:");
if (enteredPanelPassword !== key) {
    window.location.href = "index.html";
} else {
    surveyContainer.style.display = "block";
}

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
        updateCaptainStats();
    });
});

// ----- FETCH & DISPLAY TEAM DATA -----
let captainDataGlobal = {};

async function fetchAndDisplayData() {
    const snapshot = await getDocs(responsesRef);
    const allResponses = snapshot.docs.map(docItem => docItem.data());

    let totalScore = 0;
    let highCount = 0, medCount = 0, lowCount = 0;
    const captainData = {};

    allResponses.forEach(r => {
        const score = Number(r.score) || 0;
        const captain = r.teamCaptain || "Unknown";

        totalScore += score;

        if (!captainData[captain]) captainData[captain] = { sum: 0, count: 0 };
        captainData[captain].sum += score;
        captainData[captain].count++;

        if (score >= 80) highCount++;
        else if (score >= 50) medCount++;
        else lowCount++;
    });

    captainDataGlobal = captainData;

    const totalCount = allResponses.length;
    const overallAverage = totalCount ? (totalScore / totalCount).toFixed(2) : "0.00";
    const highPct = totalCount ? ((highCount/totalCount)*100).toFixed(1) : "0.0";
    const medPct = totalCount ? ((medCount/totalCount)*100).toFixed(1) : "0.0";
    const lowPct = totalCount ? ((lowCount/totalCount)*100).toFixed(1) : "0.0";

    // OVERALL STATS
    document.getElementById("overallAverage").innerHTML = `Average score:ㅤ<b>${overallAverage}</b>`;
    document.getElementById("highPct").innerHTML = `High index:ㅤ<b>${highPct}%</b>ㅤof senior body`;
    document.getElementById("medPct").innerHTML = `Medium index:ㅤ<b>${medPct}%</b>ㅤof senior body`;
    document.getElementById("lowPct").innerHTML = `Low index:ㅤ<b>${lowPct}%</b>ㅤof senior body`;

    updateCaptainStats();
}

// ----- CAPTAIN STATS -----
function updateCaptainStats() {
    if (!selectedCaptain) return;
    const data = captainDataGlobal[selectedCaptain];
    const avg = data && data.count ? (data.sum/data.count).toFixed(2) : "0.00";
    const count = data && data.count ? data.count : 0;
    document.getElementById("captainAvg").innerHTML = `Average score:ㅤ<b>${avg}</b>`;
    document.getElementById("captainSubmissions").innerHTML = `Submissions:ㅤ<b>${count}</b>`;
}

// ----- FULLSCREEN LOGIC -----
const fullscreenBtn = document.getElementById("fullscrnBtn");
const navBar = document.getElementById("nav");
const panelHeading = document.querySelector("#survey h1");

fullscreenBtn.addEventListener("click", () => {
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen();
    }
});

document.addEventListener("fullscreenchange", handleFullscreenChange);
document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

function handleFullscreenChange() {
    const isFull = document.fullscreenElement || document.webkitFullscreenElement;
    
    if (isFull) {
        fullscreenBtn.style.display = "none";
        panelHeading.textContent = "Opportunity Index Survey Results";
        navBar.style.display = "none";
    } else {
        fullscreenBtn.style.display = "inline-block";
        panelHeading.textContent = "Presenter Panel";
        navBar.style.display = "grid";
    }
}

// ----- FETCH & REFRESH -----
fetchAndDisplayData();
setInterval(fetchAndDisplayData, 10000);