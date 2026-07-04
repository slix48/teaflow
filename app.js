const teaTypes = [
  { key: "green", name: "Green", temp: "175 F", tempC: 79, tempF: 175, range: "2-3 min", seconds: [120, 150, 180], gramsPerTbsp: 2.4 },
  { key: "black", name: "Black", temp: "200-212 F", tempC: 96, tempF: 205, range: "3-5 min", seconds: [180, 240, 300], gramsPerTbsp: 3 },
  { key: "oolong", name: "Oolong", temp: "185-205 F", tempC: 90, tempF: 194, range: "3-5 min", seconds: [180, 240, 300], gramsPerTbsp: 4 },
  { key: "white", name: "White", temp: "170-185 F", tempC: 80, tempF: 176, range: "4-5 min", seconds: [240, 270, 300], gramsPerTbsp: 1 },
  { key: "herbal", name: "Herbal", temp: "212 F", tempC: 100, tempF: 212, range: "5-7 min", seconds: [300, 360, 420], gramsPerTbsp: 2.5 },
  { key: "assam", name: "Assam", temp: "200-212 F", tempC: 95, tempF: 203, range: "3-5 min", seconds: [180, 240, 300], gramsPerTbsp: 3 },
  { key: "sencha", name: "Sencha", temp: "160-175 F", tempC: 75, tempF: 167, range: "1-2 min", seconds: [60, 90, 120], gramsPerTbsp: 2.5 },
  { key: "matcha", name: "Matcha", temp: "160-175 F", tempC: 75, tempF: 167, range: "30-60 sec whisk", seconds: [30, 45, 60], gramsPerTbsp: 2 },
  { key: "earl-grey", name: "Earl Grey", temp: "200-212 F", tempC: 95, tempF: 203, range: "3-5 min", seconds: [180, 240, 300], gramsPerTbsp: 3 },
  { key: "chamomile", name: "Chamomile", temp: "212 F", tempC: 100, tempF: 212, range: "5-7 min", seconds: [300, 360, 420], gramsPerTbsp: 1.3 },
  { key: "puerh", name: "Pu-erh", temp: "195-212 F", tempC: 95, tempF: 203, range: "2-4 min", seconds: [120, 180, 240], gramsPerTbsp: 4 },
  { key: "silver-needle", name: "Silver Needle", temp: "170-180 F", tempC: 77, tempF: 171, range: "4-5 min", seconds: [240, 270, 300], gramsPerTbsp: 1 },
  { key: "gunpowder-green", name: "Gunpowder Green", temp: "170-180 F", tempC: 77, tempF: 171, range: "2-3 min", seconds: [120, 150, 180], gramsPerTbsp: 5 }
];

const cupMl = 240;
const brewRatios = {
  normal: { gramsPerCup: 3, gramsPer250ml: 3, label: "Normal loose-leaf ratio." },
  strong: { gramsPerCup: 4, gramsPer250ml: 4, label: "Stronger brew ratio." },
  delicate: { gramsPerCup: 2.5, gramsPer250ml: 2.5, label: "Delicate green and white tea ratio." },
  bags: { bagsPerCup: 1, label: "Tea bag guide." }
};
const delicateTeaKeys = new Set(["green", "sencha", "matcha", "white", "silver-needle", "gunpowder-green"]);

const tasteSuggestions = {
  "too bitter": "Lower temp and use a shorter steep next time.",
  "too weak": "Use more tea; if it still tastes thin, steep a little longer.",
  perfect: "Keep this recipe and save it as a custom brew profile.",
  "too grassy": "Lower temp and use a shorter steep.",
  "too strong": "Use less tea or shorten the steep."
};

const resteeps = [60, 75, 90];
const profileKey = "teaflow.profiles";
const historyKey = "teaflow.history";
const collectionKey = "teaflow.collection";
const backupVersion = 1;

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
const measurementMode = document.querySelector("#measurementMode");
const waterUnit = document.querySelector("#waterUnit");
const calculatorTea = document.querySelector("#calculatorTea");
const brewStrength = document.querySelector("#brewStrength");
const teaAmountResult = document.querySelector("#teaAmountResult");
const tablespoonResult = document.querySelector("#tablespoonResult");
const calculatorTempResult = document.querySelector("#calculatorTempResult");
const calculatorSteepResult = document.querySelector("#calculatorSteepResult");
const calculatorNote = document.querySelector("#calculatorNote");
const steepList = document.querySelector("#steepList");
const nextSteep = document.querySelector("#nextSteep");
const resetSteeps = document.querySelector("#resetSteeps");
const noteOptions = document.querySelector("#noteOptions");
const suggestionText = document.querySelector("#suggestionText");
const profileForm = document.querySelector("#profileForm");
const profiles = document.querySelector("#profiles");
const brewLogForm = document.querySelector("#brewLogForm");
const pantryTea = document.querySelector("#pantryTea");
const brewRating = document.querySelector("#brewRating");
const brewSteepTime = document.querySelector("#brewSteepTime");
const brewNotes = document.querySelector("#brewNotes");
const historyInsight = document.querySelector("#historyInsight");
const historyList = document.querySelector("#historyList");
const exportBackup = document.querySelector("#exportBackup");
const importBackup = document.querySelector("#importBackup");
const backupFile = document.querySelector("#backupFile");
const backupStatus = document.querySelector("#backupStatus");
const collectionForm = document.querySelector("#collectionForm");
const collectionList = document.querySelector("#collectionList");

let selectedTea = teaTypes[0];
let remainingSeconds = selectedTea.seconds[0];
let timerId = null;
let currentSteep = 0;
let audioContext = null;
let latestCalculation = null;

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
  const calculation = getBrewCalculation();
  latestCalculation = calculation;
  const mode = calculation.mode;

  if (calculation.isTeaBags) {
    teaAmountResult.textContent = mode === "us" ? `${calculation.bags} tea bag${calculation.bags === 1 ? "" : "s"}` : "Use tea bags";
    tablespoonResult.textContent = mode === "metric" ? "Not needed" : `${calculation.bags} bag${calculation.bags === 1 ? "" : "s"}`;
  } else {
    teaAmountResult.textContent = mode === "us" ? "Use spoon measure" : `${formatGrams(calculation.grams)} g`;
    tablespoonResult.textContent = mode === "metric" ? `${calculation.tea.gramsPerTbsp} g/tbsp density` : `about ${formatTablespoons(calculation.tablespoons)} tbsp`;
  }

  calculatorTempResult.textContent = mode === "us" ? `${calculation.tea.tempF} F` : `${calculation.tea.tempC} C / ${calculation.tea.tempF} F`;
  calculatorSteepResult.textContent = formatSteepMinutes(calculation.steepSeconds);
  brewSteepTime.value = formatShortTime(calculation.steepSeconds);
  calculatorNote.textContent = `${calculation.waterLabel} ${calculation.tea.name}, ${calculation.strengthLabel}. ${calculation.ratio.label} Spoon estimate uses ${calculation.tea.name} density.`;
}

function getBrewCalculation() {
  const tea = teaTypes.find((item) => item.key === calculatorTea.value) || selectedTea;
  const strength = brewStrength.value;
  const effectiveStrength = strength === "normal" && delicateTeaKeys.has(tea.key) ? "delicate" : strength;
  const ratio = brewRatios[effectiveStrength] || brewRatios.normal;
  const water = Math.max(Number(waterAmount.value) || 0, 0);
  const ml = waterUnit.value === "cups" ? water * cupMl : water;
  const cups = ml / cupMl;
  const mode = measurementMode.value;
  const defaultSeconds = tea.seconds[Math.min(1, tea.seconds.length - 1)];
  const strengthLabel = effectiveStrength === "delicate" && strength === "normal" ? "normal delicate" : brewStrength.options[brewStrength.selectedIndex].text.toLowerCase();

  if (effectiveStrength === "bags") {
    const bags = Math.max(1, Math.round(cups * ratio.bagsPerCup));
    return {
      tea,
      ratio,
      mode,
      waterMl: ml,
      waterCups: cups,
      waterLabel: formatWater(ml, mode),
      strengthLabel,
      steepSeconds: defaultSeconds,
      isTeaBags: true,
      bags
    };
  }

  const grams = waterUnit.value === "cups" ? cups * ratio.gramsPerCup : (ml / 250) * ratio.gramsPer250ml;
  const tablespoons = grams / tea.gramsPerTbsp;
  return {
    tea,
    ratio,
    mode,
    waterMl: ml,
    waterCups: cups,
    waterLabel: formatWater(ml, mode),
    strengthLabel,
    steepSeconds: defaultSeconds,
    isTeaBags: false,
    grams,
    tablespoons
  };
}

function formatGrams(value) {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(1);
}

function formatTablespoons(value) {
  if (value <= 0) {
    return "0";
  }

  const rounded = Math.round(value * 2) / 2;
  const whole = Math.floor(rounded);
  const hasHalf = rounded % 1 !== 0;

  if (whole === 0 && hasHalf) {
    return "1/2";
  }

  return hasHalf ? `${whole} 1/2` : whole.toString();
}

function formatWater(ml, mode) {
  const cups = ml / cupMl;

  if (mode === "metric") {
    return `${Math.round(ml)} ml`;
  }

  if (mode === "us") {
    return `${formatGrams(cups)} cup${cups === 1 ? "" : "s"}`;
  }

  return `${Math.round(ml)} ml / ${formatGrams(cups)} cup${cups === 1 ? "" : "s"}`;
}

function formatSteepMinutes(totalSeconds) {
  if (totalSeconds < 60) {
    return `${totalSeconds} seconds`;
  }

  const minutes = totalSeconds / 60;
  const label = minutes === 1 ? "minute" : "minutes";
  return `${formatGrams(minutes)} ${label}`;
}

function formatShortTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function parseSteepInput(value, fallbackSeconds) {
  const normalized = value.trim();
  if (!normalized) {
    return fallbackSeconds;
  }

  if (normalized.includes(":")) {
    const [minutes, seconds = "0"] = normalized.split(":");
    const parsedMinutes = Number(minutes);
    const parsedSeconds = Number(seconds);
    if (Number.isFinite(parsedMinutes) && Number.isFinite(parsedSeconds)) {
      return Math.max(0, Math.round(parsedMinutes * 60 + parsedSeconds));
    }
  }

  const parsed = Number(normalized);
  if (Number.isFinite(parsed)) {
    return Math.max(0, Math.round(parsed * 60));
  }

  return fallbackSeconds;
}

function renderCalculatorTeaOptions() {
  calculatorTea.replaceChildren();

  teaTypes.forEach((tea) => {
    const option = document.createElement("option");
    option.value = tea.key;
    option.textContent = tea.name;
    calculatorTea.append(option);
  });

  calculatorTea.value = "assam";
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

function loadHistory() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(historyKey) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveHistory(items) {
  window.localStorage.setItem(historyKey, JSON.stringify(items));
}

function loadCollection() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(collectionKey) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCollection(items) {
  window.localStorage.setItem(collectionKey, JSON.stringify(items));
}

function setBackupStatus(message) {
  backupStatus.textContent = message;
}

function buildBackup() {
  return {
    teaflowBackupVersion: backupVersion,
    exportedAt: new Date().toISOString(),
    profiles: loadProfiles(),
    history: loadHistory(),
    collection: loadCollection()
  };
}

function downloadBackup() {
  const backup = buildBackup();
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);

  link.href = url;
  link.download = `teaflow-backup-${date}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  setBackupStatus(`Exported ${backup.profiles.length} profiles, ${backup.history.length} history entries, and ${backup.collection.length} pantry teas.`);
}

function normalizeBackupArray(value) {
  return Array.isArray(value) ? value : [];
}

function importBackupData(data) {
  if (!data || data.teaflowBackupVersion !== backupVersion) {
    throw new Error("Unsupported TeaFlow backup file.");
  }

  const importedProfiles = normalizeBackupArray(data.profiles);
  const importedHistory = normalizeBackupArray(data.history);
  const importedCollection = normalizeBackupArray(data.collection);

  saveProfiles(importedProfiles);
  saveHistory(importedHistory);
  saveCollection(importedCollection);
  renderProfiles();
  renderHistory();
  renderCollection();
  setBackupStatus(`Imported ${importedProfiles.length} profiles, ${importedHistory.length} history entries, and ${importedCollection.length} pantry teas.`);
}

function renderHistory() {
  const items = loadHistory();
  historyList.replaceChildren();
  historyInsight.textContent = buildHistoryInsight(items);

  if (!items.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No brews logged yet.";
    historyList.append(empty);
    return;
  }

  items.slice(0, 5).forEach((brew) => {
    const item = document.createElement("article");
    item.className = "history-item";

    const title = document.createElement("h3");
    title.textContent = `${brew.teaName} - ${brew.rating}/5`;

    const meta = document.createElement("p");
    meta.className = "history-meta";
    [
      brew.collectionName ? `Pantry: ${brew.collectionName}` : "",
      brew.waterLabel,
      brew.teaAmountLabel,
      brew.tempLabel,
      brew.steepLabel
    ].filter(Boolean).forEach((text) => {
      const span = document.createElement("span");
      span.textContent = text;
      meta.append(span);
    });

    item.append(title, meta);

    if (brew.notes) {
      const notes = document.createElement("p");
      notes.className = "history-notes";
      notes.textContent = brew.notes;
      item.append(notes);
    }

    historyList.append(item);
  });
}

function buildHistoryInsight(items) {
  if (!items.length) {
    return "Log a brew to discover your best recipe.";
  }

  const best = [...items].sort((a, b) => {
    if (Number(b.rating) !== Number(a.rating)) {
      return Number(b.rating) - Number(a.rating);
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  })[0];

  return `You rated ${best.teaName} highest at ${best.tempLabel} for ${best.steepLabel}.`;
}

function renderPantryOptions() {
  const items = loadCollection();
  const currentValue = pantryTea.value;

  pantryTea.replaceChildren();

  const none = document.createElement("option");
  none.value = "";
  none.textContent = "No pantry item";
  pantryTea.append(none);

  items.forEach((tea) => {
    const option = document.createElement("option");
    option.value = tea.id;
    option.textContent = `${tea.name}${tea.brand ? ` - ${tea.brand}` : ""}`;
    pantryTea.append(option);
  });

  if (items.some((tea) => tea.id === currentValue)) {
    pantryTea.value = currentValue;
  }
}

function renderCollection() {
  const items = loadCollection();
  collectionList.replaceChildren();
  renderPantryOptions();

  if (!items.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No teas in your collection yet.";
    collectionList.append(empty);
    return;
  }

  items.forEach((tea) => {
    const item = document.createElement("article");
    item.className = "collection-item";

    const content = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = `${tea.name}${tea.brand ? ` - ${tea.brand}` : ""}`;

    const meta = document.createElement("p");
    meta.className = "collection-meta";
    [
      tea.origin || "Origin not set",
      `${formatGrams(tea.quantityGrams)} g left`,
      `${tea.brewCount || 0} brews`,
      `${tea.caffeine} caffeine`,
      tea.harvestYear ? `Harvest ${tea.harvestYear}` : "",
      tea.cost ? `$${formatGrams(tea.cost)}` : "",
      tea.favoriteRecipe || ""
    ].filter(Boolean).forEach((text) => {
      const span = document.createElement("span");
      span.textContent = text;
      meta.append(span);
    });

    content.append(title, meta);

    if (tea.flavorNotes) {
      const notes = document.createElement("p");
      notes.className = "collection-notes";
      notes.textContent = tea.flavorNotes;
      content.append(notes);
    }

    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "Delete";
    remove.addEventListener("click", () => {
      saveCollection(loadCollection().filter((saved) => saved.id !== tea.id));
      renderCollection();
    });

    item.append(content, remove);
    collectionList.append(item);
  });
}

function applyCollectionBrew(collectionId, gramsUsed) {
  if (!collectionId) {
    return null;
  }

  const items = loadCollection();
  const tea = items.find((item) => item.id === collectionId);
  if (!tea) {
    return null;
  }

  if (Number.isFinite(gramsUsed) && gramsUsed > 0) {
    tea.quantityGrams = Math.max(0, Math.round((Number(tea.quantityGrams) - gramsUsed) * 10) / 10);
  }
  tea.brewCount = Number(tea.brewCount || 0) + 1;
  tea.lastBrewedAt = new Date().toISOString();
  saveCollection(items);
  renderCollection();
  return tea;
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
[measurementMode, waterAmount, waterUnit, calculatorTea, brewStrength].forEach((control) => {
  control.addEventListener("input", updateCalculator);
  control.addEventListener("change", updateCalculator);
});

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

collectionForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const tea = {
    id: window.crypto?.randomUUID ? window.crypto.randomUUID() : Date.now().toString(),
    brand: document.querySelector("#collectionBrand").value.trim(),
    name: document.querySelector("#collectionName").value.trim(),
    origin: document.querySelector("#collectionOrigin").value.trim(),
    purchaseDate: document.querySelector("#collectionPurchaseDate").value,
    harvestYear: document.querySelector("#collectionHarvestYear").value,
    cost: Number(document.querySelector("#collectionCost").value) || 0,
    quantityGrams: Number(document.querySelector("#collectionQuantity").value) || 0,
    caffeine: document.querySelector("#collectionCaffeine").value,
    flavorNotes: document.querySelector("#collectionNotes").value.trim(),
    favoriteRecipe: document.querySelector("#collectionRecipe").value.trim(),
    brewCount: 0,
    createdAt: new Date().toISOString()
  };

  if (!tea.name) {
    return;
  }

  saveCollection([tea, ...loadCollection()]);
  collectionForm.reset();
  document.querySelector("#collectionQuantity").value = "50";
  document.querySelector("#collectionCaffeine").value = "medium";
  renderCollection();
});

brewLogForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const calculation = latestCalculation || getBrewCalculation();
  const selectedCollectionId = pantryTea.value;
  const teaAmountLabel = calculation.isTeaBags
    ? `${calculation.bags} tea bag${calculation.bags === 1 ? "" : "s"}`
    : `${formatGrams(calculation.grams)} g / about ${formatTablespoons(calculation.tablespoons)} tbsp`;
  const actualSteepSeconds = parseSteepInput(brewSteepTime.value, calculation.steepSeconds);
  const pantryItem = applyCollectionBrew(selectedCollectionId, calculation.isTeaBags ? 0 : calculation.grams);

  const brew = {
    id: window.crypto?.randomUUID ? window.crypto.randomUUID() : Date.now().toString(),
    createdAt: new Date().toISOString(),
    teaKey: calculation.tea.key,
    teaName: calculation.tea.name,
    waterMl: Math.round(calculation.waterMl),
    waterCups: Math.round(calculation.waterCups * 10) / 10,
    waterLabel: calculation.waterLabel,
    teaAmountLabel,
    teaGrams: calculation.isTeaBags ? null : Math.round(calculation.grams * 10) / 10,
    tablespoons: calculation.isTeaBags ? null : Math.round(calculation.tablespoons * 10) / 10,
    bags: calculation.isTeaBags ? calculation.bags : null,
    tempC: calculation.tea.tempC,
    tempF: calculation.tea.tempF,
    tempLabel: `${calculation.tea.tempF} F`,
    steepSeconds: actualSteepSeconds,
    steepLabel: formatShortTime(actualSteepSeconds),
    rating: brewRating.value,
    notes: brewNotes.value.trim(),
    collectionId: pantryItem?.id || "",
    collectionName: pantryItem?.name || ""
  };

  saveHistory([brew, ...loadHistory()].slice(0, 50));
  brewNotes.value = "";
  brewRating.value = "5";
  renderHistory();
});

exportBackup.addEventListener("click", downloadBackup);

importBackup.addEventListener("click", () => {
  backupFile.click();
});

backupFile.addEventListener("change", () => {
  const file = backupFile.files[0];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      importBackupData(JSON.parse(reader.result));
    } catch {
      setBackupStatus("Import failed. Choose a valid TeaFlow backup JSON file.");
    } finally {
      backupFile.value = "";
    }
  });
  reader.addEventListener("error", () => {
    setBackupStatus("Import failed. The file could not be read.");
    backupFile.value = "";
  });
  reader.readAsText(file);
});

selectTea("green");
renderCalculatorTeaOptions();
updateCalculator();
renderSteeps();
renderNotes();
renderProfiles();
renderHistory();
renderCollection();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {
      setTimerStatus("Ready to brew.");
    });
  });
}
