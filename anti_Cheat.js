let violations = 0;
const maxViolations = 3;
let examTime = 40 * 60; // 40 minutes
const LOG_URL = "https://script.google.com/macros/s/AKfycbzwe1Grd41NEKRqZzC7uDehtezZpRluMAqa_rQTa6leBWrzfMBBYYarsS1mmAPW-dW7/exec";


function startExam() {
  const name = document.getElementById("studentName").value;
  const cls = document.getElementById("studentClass").value;

  if (!name || !cls) {
    alert("Please enter your name and class.");
    return;
  }

  document.getElementById("startScreen").style.display = "none";
  document.getElementById("examFrame").style.display = "block";
  document.getElementById("timer").style.display = "block";

  requestFullscreen();
  startTimer();
}

function requestFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  }
}

// Tab / app switching detection (desktop + mobile)
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    violations++;
    logViolation("Tab/App Switch");

    showWarning(`⚠️ App/Tab switch detected (${violations}/${maxViolations})`);

    if (violations >= maxViolations) {
      terminateExam();
    }
  }
});

// Disable right-click
document.addEventListener("contextmenu", e => e.preventDefault());

// Disable copy / paste
document.addEventListener("keydown", e => {
  if (
    e.ctrlKey &&
    ["c", "v", "x", "a"].includes(e.key.toLowerCase())
  ) {
    e.preventDefault();
    logViolation("Copy/Paste Attempt");
    showWarning("❌ Copying is not allowed.");
  }
});

// Timer
function startTimer() {
  const timerDisplay = document.getElementById("timer");

  const interval = setInterval(() => {
    examTime--;

    const min = Math.floor(examTime / 60);
    const sec = examTime % 60;

    timerDisplay.innerText = `⏱ Time Left: ${min}:${sec < 10 ? "0" : ""}${sec}`;

    if (examTime <= 0) {
      clearInterval(interval);
      alert("Time up! Submit your exam.");
      terminateExam();
    }
  }, 1000);
}

function showWarning(msg) {
  const warning = document.getElementById("warning");
  warning.innerText = msg;
  warning.style.display = "block";

  setTimeout(() => {
    warning.style.display = "none";
  }, 4000);
}

function terminateExam() {
  document.body.innerHTML = `
    <h1 style="text-align:center;color:red">
      Exam Ended Due to Violations
    </h1>
  `;

  function logViolation(type) {
  const payload = {
    name: document.getElementById("studentName")?.value || "Unknown",
    class: document.getElementById("studentClass")?.value || "Unknown",
    violation: type,
    count: violations,
    device: /Mobi|Android/i.test(navigator.userAgent) ? "Mobile" : "Desktop"
  };

  fetch(LOG_URL, {
    method: "POST",
    body: JSON.stringify(payload),
    mode: "no-cors"
  });
}

}
