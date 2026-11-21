
let enroll = document.getElementById("1");
let verify = document.getElementById("2");
let stats = document.getElementById("3");

function showScreen(screenName) {
    let sections = document.querySelectorAll("section");

    sections.forEach((section) => {
        section.classList.add("hidden");
    });

    document.getElementById(screenName).classList.remove("hidden");
}

enroll.onclick = () => {
    showScreen("enroll");
};

verify.onclick = () => {
    showScreen("verify");
};

stats.onclick = () => {
    showScreen("stats");
};

