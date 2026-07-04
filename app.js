const teaTypes = [
  { key: "green", name: "Green", temp: "175 F", range: "2-3 min", seconds: [120, 150, 180] },
  { key: "black", name: "Black", temp: "200-212 F", range: "3-5 min", seconds: [180, 240, 300] },
  { key: "oolong", name: "Oolong", temp: "185-205 F", range: "3-5 min", seconds: [180, 240, 300] },
  { key: "white", name: "White", temp: "170-185 F", range: "4-5 min", seconds: [240, 270, 300] },
  { key: "herbal", name: "Herbal", temp: "212 F", range: "5-7 min", seconds: [300, 360, 420] },
  { key: "assam", name: "Assam", temp: "200-212 F", range: "3-5 min", seconds: [180, 240, 300] },
  { key: "sencha", name: "Sencha", temp: "160-175 F", range: "1-2 min", seconds: [60, 90, 120] },
  { key: "matcha", name: "Matcha", temp: "160-175 F", range: "30-60 sec whisk", seconds: [30, 45, 60] },
  { key: "earl-grey", name: "Earl Grey", temp: "200-212 F", range: "3-5 min", seconds: [180, 240, 300] },
  { key: "chamomile", name: "Chamomile", temp: "212 F", range: "5-7 min", seconds: [300, 360, 420] },
  { key: "puerh", name: "Pu-erh", temp: "195-212 F", range: "2-4 min", seconds: [120, 180, 240] }
];

const tasteSuggestions = {
  "too bitter": "Lower temp and use a shorter steep next time.",
  "too weak": "Use more tea; if it still tastes thin, steep a little longer.",
  perfect: "Keep this recipe and save it as a custom brew profile.",
  "too grassy": "Lower temp and use a shorter steep.",
  "too strong": "Use less tea or shorten the steep."
};

const resteeps = [60, 75, 90];
const profileKey = "teaflow.profiles";

const teaTypeGrid = document.querySelector("#teaTypeGrid");
const tempText = document.querySelector("#tempText");
const rangeText = document.querySelector("#rangeText");
const timerSeconds = document.querySelector("#timerSeconds");
const clockText = document.querySelector("#clockText");
const startTimer = document.querySelector("#startTimer");
const pauseTimer = document.querySelector("#pauseTimer");
const resetTimer = document.querySelector("#resetTimer");
const timerStatus = document.querySelector("#timerStatus");
const waterAmount = document.querySelector("#waterAmount");
const calculatorResult = document.querySelector("#calculatorResult");
const steepList = document.querySelector("#steepList");
const nextSteep = document.querySelector("#nextSteep");
const resetSteeps = document.querySelector("#resetSteeps");
const noteOptions = document.querySelector("#noteOptions");
const suggestionText = document.querySelector("#suggestionText");
const profileForm = document.querySelector("#profileForm");
const profiles = document.querySelector("#profiles");

let selectedTea = teaTypes[0];
let remainingSeconds = selectedTea.seconds[0];
let timerId = null;
let currentSteep = 0;
let audioContext = null;

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function formatDuration(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return seconds ? `${minutes}:${seconds.toString().padStart(2, "0")}` : `${minutes}:00`;
}

function stopTimer() {
  if (timerId) {
    window.clearInterval(timerId);
    timerId = null;
  }
}

function setTimerStatus(message) {
  timerStatus.textContent = message;
}

function setRemaining(seconds) {
  remainingSeconds = seconds;
  clockText.textContent = formatTime(remainingSeconds);
}

function resetToSelectedDuration() {
  stopTimer();
  setRemaining(Number(timerSeconds.value));
  setTimerStatus("Ready to brew.");
}

function renderTeaTypes() {
  teaTypeGrid.replaceChildren();

  teaTypes.forEach((tea) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = tea.key === selectedTea.key ? "is-active" : "";
    button.setAttribute("aria-pressed", tea.key === selectedTea.key ? "true" : "false");

    const name = document.createElement("strong");
    name.textContent = tea.name;
    const details = document.createElement("span");
    details.textContent = `${tea.temp} / ${tea.range}`;

    button.append(name, details);
    button.addEventListener("click", () => selectTea(tea.key));
    teaTypeGrid.append(button);
  });
}

function selectTea(key) {
  const tea = teaTypes.find((item) => item.key === key);
  selectedTea = tea || teaTypes[0];
  tempText.textContent = selectedTea.temp;
  rangeText.textContent = selectedTea.range;
  timerSeconds.replaceChildren();

  selectedTea.seconds.forEach((seconds) => {
    const option = document.createElement("option");
    option.value = seconds;
    option.textContent = formatDuration(seconds);
    timerSeconds.append(option);
  });

  renderTeaTypes();
  resetToSelectedDuration();
}

function prepareFinishFeedback() {
  if (!audioContext && (window.AudioContext || window.webkitAudioContext)) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContext();
  }

  if (audioContext?.state === "suspended") {
    audioContext.resume();
  }
}

function playFinishSound() {
  if (!audioContext) {
    return;
  }

  const now = audioContext.currentTime;
  [0, 0.18, 0.36].forEach((offset) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(660 + offset * 500, now + offset);
    gain.gain.setValueAtTime(0.001, now + offset);
    gain.gain.exponentialRampToValueAtTime(0.18, now + offset + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.16);

    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(now + offset);
    oscillator.stop(now + offset + 0.18);
  });
}

function notifyFinish() {
  setTimerStatus("Done. Taste it while it is fresh.");
  playFinishSound();

  if ("vibrate" in navigator) {
    navigator.vibrate([160, 80, 160]);
  }
}

function updateCalculator() {
  const ml = Math.max(Number(waterAmount.value) || 0, 0);
  const minGrams = (ml * 2) / 250;
  const maxGrams = (ml * 3) / 250;
  calculatorResult.textContent = `${ml} ml water -> ${formatGrams(minGrams)}-${formatGrams(maxGrams)} g tea`;
}

function formatGrams(value) {
  return Number.isInteger(value) ? value.toString() : value.toFixed(1);
}

function renderSteeps() {
  steepList.replaceChildren();

  resteeps.forEach((seconds, index) => {
    const item = document.createElement("li");
    item.className = index === currentSteep ? "is-current" : "";

    const label = document.createElement("span");
    label.textContent = `Steep ${index + 1}`;
    const time = document.createElement("strong");
    time.textContent = `${seconds} sec`;

    item.append(label, time);
    steepList.append(item);
  });
}

function renderNotes() {
  noteOptions.replaceChildren();

  Object.keys(tasteSuggestions).forEach((note) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = note;
    button.addEventListener("click", () => {
      Array.from(noteOptions.children).forEach((child) => child.classList.remove("is-active"));
      button.classList.add("is-active");
      suggestionText.textContent = tasteSuggestions[note];
    });
    noteOptions.append(button);
  });
}

function loadProfiles() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(profileKey) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveProfiles(items) {
  window.localStorage.setItem(profileKey, JSON.stringify(items));
}

function renderProfiles() {
  const items = loadProfiles();
  profiles.replaceChildren();

  if (!items.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No saved profiles yet.";
    profiles.append(empty);
    return;
  }

  items.forEach((profile) => {
    const item = document.createElement("article");
    item.className = "profile-item";

    const content = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = profile.name;

    const meta = document.createElement("p");
    meta.className = "profile-meta";
    [
      `${profile.grams} g tea`,
      `${profile.water} ml water`,
      `${profile.temp} F`,
      profile.time,
      `${profile.rating}/5`
    ].forEach((text) => {
      const span = document.createElement("span");
      span.textContent = text;
      meta.append(span);
    });

    content.append(title, meta);

    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "Delete";
    remove.addEventListener("click", () => {
      saveProfiles(loadProfiles().filter((saved) => saved.id !== profile.id));
      renderProfiles();
    });

    item.append(content, remove);
    profiles.append(item);
  });
}

timerSeconds.addEventListener("change", resetToSelectedDuration);

startTimer.addEventListener("click", () => {
  if (timerId || remainingSeconds <= 0) {
    return;
  }

  prepareFinishFeedback();
  setTimerStatus(`Brewing ${selectedTea.name.toLowerCase()} tea.`);

  timerId = window.setInterval(() => {
    setRemaining(Math.max(remainingSeconds - 1, 0));
    if (remainingSeconds === 0) {
      stopTimer();
      notifyFinish();
    }
  }, 1000);
});

pauseTimer.addEventListener("click", () => {
  stopTimer();
  setTimerStatus("Paused.");
});
resetTimer.addEventListener("click", resetToSelectedDuration);
waterAmount.addEventListener("input", updateCalculator);

nextSteep.addEventListener("click", () => {
  currentSteep = Math.min(currentSteep + 1, resteeps.length - 1);
  renderSteeps();
  stopTimer();
  setRemaining(resteeps[currentSteep]);
  setTimerStatus(`Ready for steep ${currentSteep + 1}.`);
});

resetSteeps.addEventListener("click", () => {
  currentSteep = 0;
  renderSteeps();
  stopTimer();
  setRemaining(resteeps[currentSteep]);
  setTimerStatus("Ready for steep 1.");
});

profileForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const profile = {
    id: window.crypto?.randomUUID ? window.crypto.randomUUID() : Date.now().toString(),
    name: document.querySelector("#profileName").value.trim(),
    grams: document.querySelector("#profileGrams").value,
    water: document.querySelector("#profileWater").value,
    temp: document.querySelector("#profileTemp").value,
    time: document.querySelector("#profileTime").value.trim(),
    rating: document.querySelector("#profileRating").value
  };

  if (!profile.name) {
    return;
  }

  saveProfiles([profile, ...loadProfiles()]);
  profileForm.reset();
  document.querySelector("#profileGrams").value = "2.5";
  document.querySelector("#profileWater").value = "250";
  document.querySelector("#profileTemp").value = "175";
  document.querySelector("#profileTime").value = "2:30";
  renderProfiles();
});

selectTea("green");
updateCalculator();
renderSteeps();
renderNotes();
renderProfiles();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {
      setTimerStatus("Ready to brew.");
    });
  });
}
