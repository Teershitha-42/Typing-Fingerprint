
const userSelect = document.getElementById("userSelect");
const verifyTyping = document.getElementById("verifyTyping");
const verifyBtn = document.getElementById("verifyBtn");
const result = document.getElementById("result");
const confidenceBar = document.getElementById("confidenceBar");
const confidenceText = document.getElementById("confidenceText");
const typingStatus = document.getElementById("typingStatus");
const profiles = JSON.parse(
    localStorage.getItem("typingProfiles") || "[]"
);
const validProfiles = profiles.filter(
    profile =>
        Array.isArray(profile.samples) &&
        profile.samples.length === 5
);
validProfiles.forEach((profile, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = profile.username;
    userSelect.appendChild(option);
});
let keyDownTimes = {};
let dwellTimes = [];
let flightTimes = [];
let lastKeyUpTime = null;
let pasteDetected = false;
let testStarted = false;
function resetTypingData() {
    keyDownTimes = {};
    dwellTimes = [];
    flightTimes = [];
    lastKeyUpTime = null;
    pasteDetected = false;
    testStarted = false;
}
verifyTyping.addEventListener("keydown", function (event) {
    if (event.key.length !== 1 || event.repeat) {
        return;
    }
    if (userSelect.value === "") {
        typingStatus.innerText = "Select a username first.";
        return;
    }
    testStarted = true;
    const now = performance.now();
    keyDownTimes[event.key] = now;
    if (lastKeyUpTime !== null) {
        flightTimes.push(now - lastKeyUpTime);
    }
    typingStatus.innerText = "Analyzing typing rhythm...";
});

verifyTyping.addEventListener("keyup", function (event) {

    if (event.key.length !== 1) {
        return;
    }
    const now = performance.now();
    const start = keyDownTimes[event.key];

    if (start !== undefined) {
        dwellTimes.push(now - start);
        delete keyDownTimes[event.key];
    }

    lastKeyUpTime = now;

});
verifyTyping.addEventListener("paste", function () {
    pasteDetected = true;
    typingStatus.innerText = "⚠ Paste detected";
    confidenceText.innerText = "Manual review recommended.";
    confidenceBar.style.width = "0%";
    confidenceBar.style.background = "#ef4444";

});
function average(values) {
    if (!values.length) {
        return 0;
    }
    return values.reduce(
        (sum, value) => sum + value,
        0
    ) / values.length;
}
function similarity(saved, current) {
    if (!saved.length || !current.length) {
        return null;
    }
    const savedAverage = average(saved);
    const currentAverage = average(current);
    const difference = Math.abs(
        savedAverage - currentAverage
    );
    const score = 100 -
        (difference / Math.max(savedAverage, currentAverage, 1)) * 100;
    return Math.max(0, Math.min(100, score));
}
function updateConfidence() {
    if (!verifyTyping.value.length) {
        confidenceBar.style.width = "0%";
        confidenceText.innerText = "Waiting for typing...";
        typingStatus.innerText = "Status: Not started";
        return;
    }
    if (userSelect.value === "") {
        confidenceText.innerText = "Select a username first.";
        typingStatus.innerText = "Status: Waiting for user";
        return;
    }
    if (pasteDetected) {
        confidenceBar.style.width = "0%";
        confidenceBar.style.background = "#ef4444";
        confidenceText.innerText = "Paste detected";
        typingStatus.innerText = "⚠ Manual review recommended";
        return;
    }
    const profile = validProfiles[Number(userSelect.value)];
    if (!profile) {
        confidenceText.innerText = "Profile not found.";
        return;
    }
    const savedDwell = profile.samples.flatMap(
        sample => sample.dwellTimes || []
    );
    const savedFlight = profile.samples.flatMap(
        sample => sample.flightTimes || []
    );
    const dwellScore = similarity(
        savedDwell,
        dwellTimes
    );
    const flightScore = similarity(
        savedFlight,
        flightTimes
    );
    if (dwellScore === null || flightScore === null) {
        confidenceText.innerText = "Collecting typing rhythm...";
        typingStatus.innerText = "Status: Analyzing";
        return;
    }
    const score = Math.round(
        (dwellScore + flightScore) / 2
    );
    confidenceBar.style.width = score + "%";
    if (score >= 85) {
        confidenceBar.style.background = "#22c55e";
        typingStatus.innerText = "Typing rhythm looks similar";
    } else if (score >= 70) {
        confidenceBar.style.background = "#f59e0b";
        typingStatus.innerText = "Typing rhythm has changed";
    } else {
        confidenceBar.style.background = "#ef4444";
        typingStatus.innerText = "Typing rhythm differs";
    }
    confidenceText.innerText =
        "Timing similarity: " + score + "%";

}
verifyTyping.addEventListener("input", updateConfidence);
userSelect.addEventListener("change", function () {
    resetTypingData();
    verifyTyping.value = "";
    result.innerText = "Your result will appear here.";
    confidenceBar.style.width = "0%";
    confidenceText.innerText = "Waiting for typing...";
    typingStatus.innerText = "Status: Not started";
});
verifyBtn.addEventListener("click", function () {
    if (userSelect.value === "") {
        result.innerText = "Please select a username.";
        return;
    }
    const profile = validProfiles[Number(userSelect.value)];
    if (!profile) {
        result.innerText = "Profile not found. Please enroll first.";
        return;
    }
    if (
        verifyTyping.value.trim().toLowerCase() !==
        profile.phrase.toLowerCase()
    ) {
        result.innerText = "Incorrect phrase. Try again.";
        return;
    }
    if (pasteDetected) {
        result.innerText =
            "Paste detected. Please type the phrase manually.";
        return;
    }
    if (dwellTimes.length === 0 || flightTimes.length === 0) {
        result.innerText =
            "Not enough typing timing data. Type the phrase manually.";
        return;
    }
    updateConfidence();
    const savedDwell = profile.samples.flatMap(
        sample => sample.dwellTimes || []
    );
    const savedFlight = profile.samples.flatMap(
        sample => sample.flightTimes || []
    );
    const dwellScore = similarity(savedDwell, dwellTimes);
    const flightScore = similarity(savedFlight, flightTimes);
    if (dwellScore === null || flightScore === null) {
        result.innerText = "Not enough timing data to compare.";
        return;
    }
    const score = Math.round(
        (dwellScore + flightScore) / 2
    );
    result.innerText =
        "Verification comparison complete. Timing similarity: " +
        score + "%. " +
        (score >= 70 ? "Typing patterns are similar." : "Typing patterns differ.");

}); 
if (validProfiles.length === 0) {
    confidenceText.innerText = "No enrolled profiles found.";
    typingStatus.innerText = "Enroll a user before verification.";

}
