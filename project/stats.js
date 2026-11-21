
const profiles = JSON.parse(
    localStorage.getItem("typingProfiles") || "[]"
);
const validProfiles = profiles.filter(
    profile => Array.isArray(profile.samples)
        && profile.samples.length === 5
);
function average(values) {
    return values.length
        ? values.reduce((sum, value) => sum + value, 0) / values.length
        : 0;
}
const allDwell = validProfiles.flatMap(profile =>
    profile.samples.flatMap(sample => sample.dwellTimes || [])
);
const allFlight = validProfiles.flatMap(profile =>
    profile.samples.flatMap(sample => sample.flightTimes || [])
);
document.getElementById("totalUsers").innerText =
    validProfiles.length;
document.getElementById("totalSamples").innerText =
    validProfiles.reduce((total, profile) => total + profile.samples.length, 0);
document.getElementById("avgDwell").innerText =
    average(allDwell).toFixed(2) + " ms";
document.getElementById("avgFlight").innerText =
    average(allFlight).toFixed(2) + " ms";
const profileList = document.getElementById("profileList");

if (validProfiles.length === 0) {
    profileList.innerText = "No enrolled profiles yet.";
} 
else {
    validProfiles.forEach(profile => {
        const card = document.createElement("div");
        card.className = "stat-card";
        const name = document.createElement("h3");
        name.innerText = profile.username;
        const samples = document.createElement("p");
        samples.innerText = `Samples collected: ${profile.samples.length}`;
        const dwell = document.createElement("p");
        dwell.innerText =
            `Average dwell: ${Number(profile.averageDwell).toFixed(2)} ms`;
        const flight = document.createElement("p");
        flight.innerText =
            `Average flight: ${Number(profile.averageFlight).toFixed(2)} ms`;
        const deleteBtn = document.createElement("button");
        deleteBtn.innerText = "Delete Profile";
        deleteBtn.className = "delete-btn";
        deleteBtn.addEventListener("click", function () {
            const confirmDelete = confirm(
                `Delete profile "${profile.username}"?`
            );
            if (confirmDelete) {
                let allProfiles = JSON.parse(
                    localStorage.getItem("typingProfiles") || "[]"
                );
                allProfiles = allProfiles.filter(
                    item => item.username.toLowerCase() !==
                            profile.username.toLowerCase()
                );
                localStorage.setItem(
                    "typingProfiles",
                    JSON.stringify(allProfiles)
                );
                location.reload();
            }
        });
        card.append(name, samples, dwell, flight, deleteBtn);
        profileList.appendChild(card);
    });
}
const canvas = document.getElementById("typingChart");
const ctx = canvas.getContext("2d");
const dwell = average(allDwell);
const flight = average(allFlight);
const chartData = [
    { label: "Dwell Time", value: dwell, color: "#c084fc" },
    { label: "Flight Time", value: flight, color: "#22d3ee" }
];
const maxValue = Math.max(dwell, flight, 1);
const chartWidth = canvas.width;
const chartHeight = canvas.height;
ctx.clearRect(0, 0, chartWidth, chartHeight);
ctx.font = "16px Arial";
ctx.textBaseline = "middle";
chartData.forEach((item, index) => {
    const y = 60 + index * 110;
    const barX = 150;
    const maxBarWidth = 350;
    const barWidth = (item.value / maxValue) * maxBarWidth;
    ctx.fillStyle = "#f3edff";
    ctx.fillText(item.label, 15, y + 15);
    ctx.fillStyle = "#302442";
    ctx.fillRect(barX, y, maxBarWidth, 35);
    ctx.fillStyle = item.color;
    ctx.fillRect(barX, y, barWidth, 35);
    ctx.fillStyle = "#f3edff";
    ctx.fillText(item.value.toFixed(2) + " ms", barX, y + 55);
});
