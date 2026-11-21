
const username = document.getElementById("username");
const typing = document.getElementById("typing");
const counter = document.getElementById("counter");
const progress = document.getElementById("progress");
const reset = document.getElementById("reset");
const enrollStatus = document.getElementById("enrollStatus");

const phrase = "the quick brown fox";

let sampleCount = 0;
let samples = [];
let dwellTimes = [];
let flightTimes = [];
let keyDownTimes = {};
let lastKeyUpTime = null;
typing.addEventListener("keydown", function (event) {

    if (event.key.length !== 1 || event.repeat) {
        return;
    }
    const now = performance.now();
    keyDownTimes[event.key] = now;
    if (lastKeyUpTime !== null) {
        flightTimes.push(now - lastKeyUpTime);
    }
});
typing.addEventListener("keyup", function (event) {
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
typing.addEventListener("keydown", function (event) {

    if (event.key !== "Enter") {
        return;
    }
    event.preventDefault();
    if (sampleCount >= 5) {
        return;
    }
    const name = username.value.trim();
    if (!name) {
        enrollStatus.innerText = "Please enter a username first.";
        username.focus();
        return;
    }
    if (typing.value.trim().toLowerCase() !== phrase) {
        enrollStatus.innerText =
            "Incorrect phrase. Please type it exactly as shown.";
        return;
    }
    if (dwellTimes.length < phrase.length ||
        flightTimes.length === 0) {
        enrollStatus.innerText =
            "Timing data is incomplete. Please type the phrase manually again.";
        return;
    }
    samples.push({
        dwellTimes: [...dwellTimes],
        flightTimes: [...flightTimes]
    });
sampleCount++;
    progress.value = sampleCount;
    counter.innerText = `Sample ${sampleCount} of 5`;
    typing.value = "";
    dwellTimes = [];
    flightTimes = [];
    keyDownTimes = {};
    lastKeyUpTime = null;
    if (sampleCount < 5) {
        enrollStatus.innerText =
            "Sample saved! Type the phrase again for the next sample.";
        typing.focus();
        return;
    }
    function average(values) {
        return values.length
            ? values.reduce((sum, value) => sum + value, 0)
                / values.length
            : 0;
    }
    const profile = {
        username: name,
        phrase: phrase,
        samples: samples,
        averageDwell: average(
            samples.flatMap(sample => sample.dwellTimes)
        ),
        averageFlight: average(
            samples.flatMap(sample => sample.flightTimes)
        ),
        enrolledAt: new Date().toISOString()
    };
    let profiles = JSON.parse(
        localStorage.getItem("typingProfiles") || "[]"
    );
    profiles = profiles.filter(
        item =>
            item.username.toLowerCase() !== name.toLowerCase()
    );
    profiles.push(profile);
    localStorage.setItem(
        "typingProfiles",
        JSON.stringify(profiles)
    );
    counter.innerText = "Sample 5 of 5 — Complete!";
    enrollStatus.innerText =
        "Enrollment successful! Your typing profile has been saved.";

    typing.disabled = true;
    username.disabled = true;
});
reset.addEventListener("click", function () {
    sampleCount = 0;
    samples = [];
    dwellTimes = [];
    flightTimes = [];
    keyDownTimes = {};
    lastKeyUpTime = null;
    username.value = "";
    username.disabled = false;
    typing.value = "";
    typing.disabled = false;
    counter.innerText = "Sample 0 of 5";
    progress.value = 0;
    enrollStatus.innerText = "Enter a username to begin.";
    username.focus();
});
