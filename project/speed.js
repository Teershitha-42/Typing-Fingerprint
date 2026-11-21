
const targetText = document.getElementById("targetText").innerText.trim();
const speedInput = document.getElementById("speedInput");
const wpmDisplay = document.getElementById("wpm");
const accuracyDisplay = document.getElementById("accuracy");
const timeDisplay = document.getElementById("time");
const result = document.getElementById("speedResult");
const restartBtn = document.getElementById("restartTest");
let startTime = null;
let timer = null;
let finished = false;
speedInput.addEventListener("input", function () {
    if (finished) return;
    const typed = speedInput.value;
    if (startTime === null && typed.length > 0) {
        startTime = Date.now();
        timer = setInterval(updateStats, 250);
    }
    updateStats();

    if (typed === targetText) {
        finished = true;
        clearInterval(timer);
        result.innerText = "Test completed! Great job!";
        speedInput.disabled = true;
    }
});
function updateStats() {
    if (startTime === null) return;
    const typed = speedInput.value;
    const elapsedMinutes = (Date.now() - startTime) / 60000;
    const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);

    const words = typed.trim().length === 0
        ? 0
        : typed.trim().split(/\s+/).length;

    const wpm = elapsedMinutes > 0
        ? Math.round((typed.length / 5) / elapsedMinutes)
        : 0;
    let correct = 0;
    for (let i = 0; i < typed.length; i++) {
        if (typed[i] === targetText[i]) {
            correct++;
        }
    }
    const accuracy = typed.length > 0
        ? Math.round((correct / typed.length) * 100)
        : 100;
    wpmDisplay.innerText = wpm + " WPM";
    accuracyDisplay.innerText = accuracy + "%";
    timeDisplay.innerText = elapsedSeconds + " sec";
}
restartBtn.addEventListener("click", function () {
    clearInterval(timer);
    startTime = null;
    timer = null;
    finished = false;
    speedInput.value = "";
    speedInput.disabled = false;
    wpmDisplay.innerText = "0 WPM";
    accuracyDisplay.innerText = "100%";
    timeDisplay.innerText = "0 sec";
    result.innerText = "";
    speedInput.focus();
});
const submitBtn = document.getElementById("submitTest");

submitBtn.addEventListener("click", function () {
    if (startTime === null) {
        result.innerText = "Please start typing first!";
        return;
    }

    clearInterval(timer);
    finished = true;
    speedInput.disabled = true;

    result.innerText =
        "Test submitted! Final Speed: " + wpmDisplay.innerText +
        " | Accuracy: " + accuracyDisplay.innerText;
});