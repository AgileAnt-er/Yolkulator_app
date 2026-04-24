const state = {
  weight: 58,
  quantity: 2,
  startTemp: 5,
  altitude: 25,
  vigor: "rolling",
  method: "hot",
  waterVolume: 1.5,
  waterStartTemp: 15,
  timeToBoil: 8,
  bathTemp: 65,
  airTemp: 21,
  firmness: 52,
  potNote: "",
  timerMode: "cook",
  timerRemaining: 0,
  timerTotal: 0,
  coldRampElapsed: 0,
  boilPlateauElapsed: 0,
  timerRunning: false,
  timerSpeed: 1,
  timerId: null,
  simulationTimerId: null,
  audioContext: null,
  wakeLock: null,
  jokeCount: 0,
  factCount: 0,
  lastJokeIndex: -1,
  lastFactIndex: -1,
  history: []
};

const presets = {
  ramen: {
    firmness: 34,
    weight: 58,
    quantity: 2,
    startTemp: 5,
    vigor: "rolling",
    method: "hot",
    waterVolume: 1.6,
    note: "Ramen Jam Protocol"
  },
  breakfast: {
    firmness: 48,
    weight: 58,
    quantity: 2,
    startTemp: 7,
    vigor: "gentle",
    method: "cold",
    waterVolume: 1.2,
    waterStartTemp: 15,
    timeToBoil: 7,
    note: "Breakfast Control"
  },
  mealprep: {
    firmness: 78,
    weight: 62,
    quantity: 6,
    startTemp: 5,
    vigor: "rolling",
    method: "hot",
    waterVolume: 3.2,
    note: "Lunchbox Stability"
  },
  chaos: {
    firmness: 92,
    weight: 60,
    quantity: 4,
    startTemp: 5,
    vigor: "gentle",
    method: "hot",
    waterVolume: 2.4,
    note: "No Gray Zone"
  }
};

const nerdJokes = [
  "There are 10 types of people: those who understand binary, and those who overcook eggs.",
  "I would tell you a UDP joke, but you might not get it.",
  "I would tell you a TCP joke, but first I need to confirm you got it. The egg will be hard by then.",
  "A SQL query walks into a brunch bar, sees two tables, and asks: can I join you?",
  "Why do programmers confuse Halloween and Christmas? Because Oct 31 == Dec 25.",
  "Schrodinger's egg is both runny and hard until you crack it. Then it is usually your fault.",
  "A neutron walks into a bar and asks how much for a boiled egg. Bartender says: for you, no charge.",
  "Entropy is not what it used to be. Neither is this egg if you skip the ice bath.",
  "There are only two hard problems in computer science: cache invalidation, naming things, and egg timing.",
  "To understand recursion, first understand recursion. To understand eggs, first ruin one and call it data.",
  "I told a chemistry joke. There was no reaction. Then the proteins denatured, so technically there was.",
  "A programmer is told: buy a dozen eggs; if they have milk, get six. They return with six dozen eggs.",
  "Why do Java developers wear glasses? Because they do not C#.",
  "The shortest programming joke is: it works on my machine. The shortest egg joke is: seven minutes is universal.",
  "A photon checks into a hotel. The clerk asks if it has luggage. It says: no, I am traveling light.",
  "An atom loses an electron. It says: I am positive. The egg says: same, but only after calibration.",
  "The bug was not in the timer. It was between the stove and the expectations.",
  "A mathematician, a physicist, and an engineer boil an egg. The engineer starts a spreadsheet. The egg wins."
];

const nerdFacts = [
  "Egg white starts setting around 60-65 °C, while yolk thickens higher, roughly 65-70 °C. That overlap is why timing feels annoyingly precise.",
  "At 1000 meters above sea level, water boils at about 96.7 °C instead of 100 °C, so eggs need more time for the same internal texture.",
  "Older eggs often peel more easily because their albumen becomes more alkaline and the inner membrane separates from the white more readily.",
  "An ice bath works by maintaining a steep temperature gradient, pulling heat out faster and reducing carryover cooking after the timer ends.",
  "Protein denaturation means proteins unfold from their native shapes. In eggs, those unfolded proteins link into the gel network we call cooked egg.",
  "Kitchen amounts of salt barely change water's boiling point. Salted water is not meaningfully hotter for egg timing.",
  "Steam can cook efficiently because condensing steam releases latent heat directly onto the egg's surface.",
  "A pressure cooker raises pressure, which raises water's boiling point, so food can cook above 100 °C without drying out.",
  "Brown and white eggs are nutritionally similar; shell color mainly comes from chicken breed pigments deposited during shell formation.",
  "Fresh eggs have a smaller air cell. As an egg ages, moisture and carbon dioxide slowly leave through pores in the shell.",
  "The green-gray ring on hard-boiled yolks is mostly iron sulfide, formed when sulfur from the white reacts with iron in the yolk during overcooking.",
  "Convection matters: moving water transfers heat faster than still water because warmer water near the egg is continuously replaced.",
  "A logarithmic scale turns multiplication into addition. That is why decibels, pH, and earthquake magnitude can cover huge ranges compactly.",
  "Binary floating-point cannot exactly represent many decimal fractions, including 0.1. That is why 0.1 + 0.2 can become 0.30000000000000004.",
  "GPS needs relativity corrections. Satellite clocks experience both special and general relativistic effects large enough to break navigation if ignored.",
  "A checksum does not encrypt data; it helps detect accidental changes. Hashes and encryption solve different problems."
];

const coldShockCommands = [
  "Jack the eggs into cold water. Now. Carryover heat is not your friend.",
  "Cold bath time. Move the eggs immediately and let the yolk stop negotiating.",
  "Transfer to cold water. The hot phase is over; the rescue phase has begun.",
  "Eggs out, cold water in. Do not let residual heat write the ending."
];

const physics = window.YolkulatorPhysics;

const firmnessLevels = physics.FIRMNESS_LEVELS;
let protocolCache = { key: "", value: null };

const el = {};

function bindElements() {
  [
    "weight",
    "quantity",
    "startTemp",
    "altitude",
    "waterVolume",
    "waterStartTemp",
    "timeToBoil",
    "bathTemp",
    "airTemp",
    "firmnessKnob",
    "potNote",
    "simulateScenarios",
    "scenarioMatrix",
    "simulationResult",
    "weightOut",
    "quantityOut",
    "startTempOut",
    "altitudeOut",
    "waterVolumeOut",
    "waterStartTempOut",
    "timeToBoilOut",
    "bathTempOut",
    "airTempOut",
    "firmnessOut",
    "targetLabel",
    "cookTimeLabel",
    "protocolName",
    "protocolCopy",
    "methodLabel",
    "coreTemp",
    "boundaryTemp",
    "riskLevel",
    "confidenceLevel",
    "timerText",
    "timerRing",
    "startPause",
    "resetTimer",
    "speedToggle",
    "requestJoke",
    "requestFact",
    "waitingText",
    "waitingCounter",
    "phaseList",
    "whiteSetIndex",
    "yolkGelIndex",
    "overcookIndex",
    "whiteSetMeaning",
    "yolkGelMeaning",
    "overcookMeaning",
    "scienceNote",
    "eggCanvas",
    "chartCanvas",
    "xsectionCanvas",
    "yolkScore",
    "whiteScore",
    "peelScore",
    "yolkScoreOut",
    "whiteScoreOut",
    "peelScoreOut",
    "autopsyNote",
    "autopsyTitle",
    "autopsyCopy",
    "saveRun",
    "historyList",
    "exportCsv"
  ].forEach((id) => {
    el[id] = document.getElementById(id);
  });
}

function computeProtocol() {
  const key = [
    state.weight,
    state.quantity,
    state.startTemp,
    state.altitude,
    state.vigor,
    state.method,
    state.waterVolume,
    state.waterStartTemp,
    state.timeToBoil,
    state.bathTemp,
    state.airTemp,
    state.firmness
  ].join("|");
  if (protocolCache.key !== key) {
    protocolCache = { key, value: computeProtocolFrom(state) };
  }
  return protocolCache.value;
}

function computeProtocolFrom(input) {
  const model = physics.optimizeProtocol(input);
  const normalized = model.input;
  const method = normalized.method;
  const crackRiskScore =
    (normalized.vigor === "violent" ? 38 : normalized.vigor === "rolling" ? 18 : 8) +
    (method === "hot" ? 6 + model.recoveryDip * 1.4 : method === "cold" ? -4 : 2) +
    Math.max(0, 8 - normalized.startTemp) * 2 +
    Math.max(0, normalized.quantity - 6) * 4;
  const risk = crackRiskScore > 56 ? "High" : crackRiskScore > 30 ? "Medium" : "Low";
  const firmnessLevel = getFirmnessLevel(normalized.firmness);
  const label = firmnessLevel.label;

  return {
    method,
    methodLabel: getMethodName(method),
    targetCore: model.targetDisplayTemp,
    boilPoint: model.boilPoint,
    boundaryLabel: getBoundaryLabel(normalized, model.boilPoint),
    recoveryDip: model.recoveryDip,
    coldRampAdj: model.coldRampAdj,
    coldRampUseful: model.coldRampUseful,
    transferSeconds: model.transferSeconds,
    airExposureSeconds: model.airExposureSeconds,
    whiteSetIndex: model.whiteSetIndex,
    yolkGelIndex: model.yolkGelIndex,
    overcookIndex: model.overcookIndex,
    looseWhiteRisk: model.looseWhiteRisk,
    tightWhiteSet: model.tightWhiteSet,
    coldShockSeconds: model.coldShockSeconds,
    seconds: model.seconds,
    minutes: model.minutes,
    risk,
    confidence: model.confidence,
    confidenceScore: model.confidenceScore,
    label,
    firmnessCopy: firmnessLevel.copy,
    alias: firmnessLevel.alias,
    centerTemp: model.centerTemp,
    yolkAverageTemp: model.yolkAverageTemp,
    yolkEdgeTemp: model.yolkEdgeTemp,
    tightWhiteTemp: model.tightWhiteTemp,
    looseWhiteTemp: model.looseWhiteTemp,
    surfaceTemp: model.surfaceTemp,
    model,
    trace: model.trace
  };
}

function getBoilingPoint(altitude) {
  return physics.getBoilingPoint(altitude);
}

function computeRecoveryDip(input, boilPoint) {
  return physics.computeRecoveryDip(input, boilPoint);
}

function computeWhiteSetIndex(input, method, targetCore, minutes) {
  const thermalPush = method === "bath"
    ? (input.bathTemp ?? 65)
    : targetCore;
  const highTempBonus = Math.max(0, thermalPush - 65) * 2.2;
  const timeBonus = Math.max(0, minutes - 5) * 2.4;
  const vigorBonus = input.vigor === "violent" ? 5 : input.vigor === "rolling" ? 3 : 0;
  return clamp(Math.round(32 + highTempBonus + timeBonus + vigorBonus), 0, 100);
}

function computeOvercookIndex(input, method, targetCore, minutes) {
  const heatBoundary = method === "bath"
    ? (input.bathTemp ?? 65)
    : getBoilingPoint(input.altitude);
  const yolkHeatPenalty = Math.max(0, targetCore - 75) * 5.2;
  const boundaryPenalty = Math.max(0, heatBoundary - 75) * (method === "bath" ? 3.3 : 0.32);
  const longHoldPenalty = Math.max(0, minutes - 11) * (method === "bath" ? 0.8 : 2.2);
  return clamp(Math.round(yolkHeatPenalty + boundaryPenalty + longHoldPenalty), 0, 100);
}

function getMethodName(method) {
  return {
    hot: "Hot start",
    cold: "Cold start",
    bath: "Controlled bath"
  }[method] || "Hot start";
}

function getBoundaryLabel(input, boilPoint) {
  if ((input.method || "hot") === "bath") {
    return `${input.bathTemp ?? 65} °C bath`;
  }
  if (input.method === "cold") {
    return `${Math.round(input.waterStartTemp ?? 15)} to ${formatTemperature(boilPoint)}`;
  }
  return formatTemperature(boilPoint);
}

function formatTemperature(value) {
  return `${value.toFixed(value % 1 >= 0.05 ? 1 : 0)} °C`;
}

function getFirmnessLevel(value) {
  return firmnessLevels.reduce((current, level) => value >= level.min ? level : current, firmnessLevels[0]);
}

function getColdShockSeconds(firmness) {
  return physics.getColdShockSeconds(firmness);
}

function simulateProtocolScenarios() {
  const current = computeProtocol();
  const weightOffsets = [-4, 0, 4];
  const tempOffsets = [-3, 0, 3];
  const altitudeOffsets = [-150, 0, 150];
  const volumeOffsets = [-0.4, 0, 0.4];
  const timingOffsets = [-20, 0, 20];
  const heatBiases = [0];
  const scenarios = [];

  weightOffsets.forEach((weightOffset) => {
    tempOffsets.forEach((tempOffset) => {
      altitudeOffsets.forEach((altitudeOffset) => {
        volumeOffsets.forEach((volumeOffset) => {
          timingOffsets.forEach((timingOffset) => {
            heatBiases.forEach((heatBias) => {
              const scenarioInput = {
                ...state,
                weight: clamp(state.weight + weightOffset, 40, 85),
                startTemp: clamp(state.startTemp + tempOffset, 3, 25),
                altitude: clamp(state.altitude + altitudeOffset, 0, 2500),
                waterVolume: clamp(state.waterVolume + volumeOffset, 0.5, 5),
                timeToBoil: clamp(state.timeToBoil + volumeOffset * 2, 3, 20)
              };
              const scenario = computeProtocolFrom(scenarioInput);
              const actualCookMinutes = current.minutes + timingOffset / 60;
              const requiredMinutes = scenario.minutes + heatBias;
              const delta = actualCookMinutes - requiredMinutes;
              const outcome = delta < -0.55 ? "under" : delta > 0.55 ? "over" : "perfect";
              scenarios.push(outcome);
            });
          });
        });
      });
    });
  });

  const counts = scenarios.reduce((totals, outcome) => {
    totals[outcome] += 1;
    return totals;
  }, { perfect: 0, under: 0, over: 0 });
  const total = scenarios.length;

  return {
    scenarios,
    total,
    perfect: Math.round(counts.perfect / total * 100),
    under: Math.round(counts.under / total * 100),
    over: Math.round(counts.over / total * 100)
  };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatTime(seconds) {
  const safeSeconds = Math.max(0, Math.round(seconds));
  const mins = Math.floor(safeSeconds / 60).toString().padStart(2, "0");
  const secs = (safeSeconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

function setFirmness(value) {
  const next = Math.round(clamp(value, 0, 100));
  if (next === state.firmness) {
    return;
  }
  state.firmness = next;
  resetTimer();
  updateOutputs();
  resetSimulationPanel();
}

function setFirmnessFromPointer(event) {
  const rect = el.firmnessKnob.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = event.clientX - cx;
  const dy = event.clientY - cy;
  const rawAngle = Math.atan2(dx, -dy) * 180 / Math.PI;
  const angle = clamp(rawAngle, -135, 135);
  setFirmness((angle + 135) / 270 * 100);
}

function handleFirmnessKey(event) {
  const keySteps = {
    ArrowLeft: -1,
    ArrowDown: -1,
    ArrowRight: 1,
    ArrowUp: 1,
    PageDown: -10,
    PageUp: 10
  };

  if (event.key === "Home") {
    event.preventDefault();
    setFirmness(0);
  } else if (event.key === "End") {
    event.preventDefault();
    setFirmness(100);
  } else if (keySteps[event.key]) {
    event.preventDefault();
    setFirmness(state.firmness + keySteps[event.key]);
  }
}

function syncControls() {
  el.weight.value = state.weight;
  el.quantity.value = state.quantity;
  el.startTemp.value = state.startTemp;
  el.altitude.value = state.altitude;
  el.waterVolume.value = state.waterVolume;
  el.waterStartTemp.value = state.waterStartTemp;
  el.timeToBoil.value = state.timeToBoil;
  el.bathTemp.value = state.bathTemp;
  el.airTemp.value = state.airTemp;
  el.potNote.value = state.potNote;
  document.querySelectorAll("[name='method']").forEach((input) => {
    input.checked = input.value === state.method;
  });
  document.querySelectorAll("[name='vigor']").forEach((input) => {
    input.checked = input.value === state.vigor;
  });
  updateMethodFields();
}

function updateOutputs() {
  const protocol = computeProtocol();
  el.weightOut.value = `${state.weight} g`;
  el.quantityOut.value = `${state.quantity} ${state.quantity === 1 ? "egg" : "eggs"}`;
  el.startTempOut.value = `${state.startTemp} °C`;
  el.altitudeOut.value = `${state.altitude} m`;
  el.airTempOut.value = `${state.airTemp} °C`;
  el.waterVolumeOut.value = `${state.waterVolume.toFixed(1)} L`;
  el.waterStartTempOut.value = `${state.waterStartTemp} °C`;
  el.timeToBoilOut.value = `${state.timeToBoil} min`;
  el.bathTempOut.value = `${state.bathTemp} °C`;
  el.firmnessOut.value = `${protocol.label} / ${state.firmness}`;
  el.firmnessKnob.style.setProperty("--angle", `${-135 + state.firmness * 2.7}deg`);
  el.firmnessKnob.setAttribute("aria-valuenow", state.firmness);
  el.firmnessKnob.setAttribute("aria-valuetext", `${protocol.label} / ${state.firmness}`);
  el.targetLabel.textContent = protocol.label;
  el.cookTimeLabel.textContent = formatTime(protocol.seconds);
  el.protocolName.textContent = `${protocol.methodLabel} / ${state.weight}g / ${state.startTemp}°C egg`;
  el.methodLabel.textContent = protocol.methodLabel;
  el.coreTemp.textContent = `${protocol.centerTemp.toFixed(1)} °C center`;
  el.boundaryTemp.textContent = protocol.boundaryLabel;
  el.riskLevel.textContent = protocol.risk;
  el.confidenceLevel.textContent = protocol.confidence;
  el.protocolCopy.textContent = getProtocolCopy(protocol);
  renderSciencePanel(protocol);

  if (!state.timerRunning) {
    state.timerMode = "cook";
    state.timerTotal = protocol.seconds;
    state.timerRemaining = protocol.seconds;
  }

  drawEgg(protocol);
  drawChart(protocol);
  drawXsection(protocol);
  renderTimer();
  renderPhases();
  updateAutopsyCopy();
}

function getProtocolCopy(protocol) {
  if (state.method === "cold") {
    const usefulRamp = Math.round(state.timeToBoil * protocol.coldRampUseful * 10) / 10;
    return `Cold-start graph assumes ${state.timeToBoil} min to boil; the timer will replace that estimate when you confirm boiling. Useful heating estimate: ${usefulRamp} min.`;
  }
  if (state.method === "hot" && protocol.recoveryDip > 6) {
    return `Small reservoir penalty detected: egg load may pull the water down about ${protocol.recoveryDip.toFixed(1)} °C.`;
  }
  if (state.method === "bath") {
    return "Controlled bath selected. Dwell time matters: yolk gel can rise while loose white stays risky.";
  }
  if (protocol.looseWhiteRisk > 55 && state.firmness < 36) {
    return "Very soft target accepted. Yolk timing is possible, but loose-white risk is part of the physics.";
  }
  if (protocol.risk === "High") {
    return "Crack risk is spicy. Lower the boil unless chaos is the point.";
  }
  if (state.firmness > 85) {
    return "Hard target accepted. Cold shock required to avoid gray-ring nonsense.";
  }
  if (state.firmness < 30) {
    return "Runny center detected. Timing tolerance is tiny. Stay near the pot.";
  }
  return "Yolk target locked. White set expected. Cold shock remains mandatory.";
}

function renderSciencePanel(protocol) {
  const live = getLiveTextureIndices(protocol);
  el.whiteSetIndex.textContent = `${live.white}%`;
  el.yolkGelIndex.textContent = `${live.yolk}%`;
  el.overcookIndex.textContent = `${live.overcook}%`;
  el.whiteSetMeaning.textContent = getWhiteSetMeaning(live.white);
  el.yolkGelMeaning.textContent = getFirmnessLevel(live.yolk).label;
  el.overcookMeaning.textContent = getOvercookMeaning(live.overcook);
  el.scienceNote.textContent = getScienceNote(protocol, live);
}

function getScienceNote(protocol, live) {
  const white = getWhiteSetMeaning(live.white).toLowerCase();
  const yolk = getFirmnessLevel(live.yolk).label.toLowerCase();
  const overcook = getOvercookMeaning(live.overcook).toLowerCase();

  if (state.timerMode === "transfer") {
    return `Transfer ramp is active: boundary temperature is falling toward 15°C while the yolk keeps absorbing carryover heat.`;
  }
  if (state.timerMode === "ramp") {
    return `Cold-start ramp is being measured. Press Water boiling when the boundary reaches a real boil.`;
  }
  if (state.timerMode === "cold") {
    return `Cold bath is locking in a ${yolk} yolk while overcook risk falls toward ${overcook}.`;
  }
  if (state.timerRunning) {
    if (live.overcook > 55) {
      return "Live overcook risk is high enough for LDL aggregation and grainy yolk texture to matter.";
    }
    if (live.white < 55) {
      return `White is still ${white}; yolk is tracking ${yolk}, so this is still early chemistry.`;
    }
    return `White is ${white}; yolk is trending ${yolk}; overcook risk is ${overcook}.`;
  }
  if (protocol.overcookIndex > 55) {
    return "Predicted finish enters the 75 °C-plus yolk zone where LDL aggregation can make texture grainy.";
  }
  if (protocol.looseWhiteRisk > 55) {
    return `Predicted finish: ${yolk} yolk with loose-white risk. Center ${protocol.centerTemp.toFixed(1)} °C, yolk edge ${protocol.yolkEdgeTemp.toFixed(1)} °C.`;
  }
  if (protocol.method === "cold") {
    return `Predicted finish: ${white} white, ${yolk} yolk. Ramp heating counts as biochemical exposure across the profile.`;
  }
  if (protocol.method === "bath") {
    return `Predicted finish: ${white} white, ${yolk} yolk. Hold time keeps changing texture after core temperature catches up.`;
  }
  if (protocol.recoveryDip > 4) {
    return `Predicted finish: ${white} white, ${yolk} yolk. Water volume is driving a visible recovery dip.`;
  }
  return `Predicted finish: ${white} white, ${yolk} yolk, ${overcook} overcook risk. Center ${protocol.centerTemp.toFixed(1)} °C.`;
}

function getWhiteSetMeaning(value) {
  if (value < 25) {
    return "Loose/raw";
  }
  if (value < 50) {
    return "Clouding";
  }
  if (value < 70) {
    return "Soft set";
  }
  if (value < 88) {
    return "Tender set";
  }
  return "Firm set";
}

function getOvercookMeaning(value) {
  if (value < 18) {
    return "Clean finish";
  }
  if (value < 40) {
    return "Watch zone";
  }
  if (value < 65) {
    return "Grain risk";
  }
  return "Chalk risk";
}

function getLiveTextureIndices(protocol) {
  if (!state.timerRunning || state.timerMode === "done") {
    return {
      white: protocol.whiteSetIndex,
      yolk: protocol.yolkGelIndex,
      overcook: protocol.overcookIndex
    };
  }

  if (
    state.timerMode === "ramp" ||
    state.timerMode === "transfer" ||
    state.timerMode === "air" ||
    state.timerMode === "cold" ||
    (state.method === "cold" && state.timerMode === "cook" && state.coldRampElapsed > 0)
  ) {
    const snapshot = getXsectionSnapshot(protocol);
    return {
      white: Math.round(snapshot.whiteSetIndex),
      yolk: Math.round(snapshot.yolkGelIndex),
      overcook: Math.round(snapshot.overcookIndex)
    };
  }

  const progress = getTimerProgress();
  return {
    white: Math.round(protocol.whiteSetIndex * Math.pow(progress, 0.78)),
    yolk: Math.round(protocol.yolkGelIndex * Math.pow(progress, 1.16)),
    overcook: Math.round(protocol.overcookIndex * Math.pow(progress, 2.4))
  };
}

function getTimerProgress() {
  if (state.timerMode === "ramp") {
    return clamp(state.coldRampElapsed / Math.max(1, state.timerTotal || state.timeToBoil * 60), 0, 1);
  }
  if (!state.timerTotal) {
    return 0;
  }
  return clamp(1 - state.timerRemaining / state.timerTotal, 0, 1);
}

function getChartProgress(protocol) {
  return clamp(getModelElapsedSeconds(protocol) / getTotalModelSeconds(protocol), 0, 1);
}

function getTotalModelSeconds(protocol) {
  const transferSeconds = protocol.transferSeconds ?? 0;
  const airSeconds = protocol.airExposureSeconds ?? 0;
  return Math.max(1, protocol.seconds + transferSeconds + protocol.coldShockSeconds + airSeconds);
}

function getModelElapsedSeconds(protocol) {
  const transferSeconds = protocol.transferSeconds ?? 0;
  const airSeconds = protocol.airExposureSeconds ?? 0;
  const totalSeconds = getTotalModelSeconds(protocol);
  if (state.timerMode === "done") {
    return totalSeconds;
  }
  if (state.timerMode === "ramp") {
    return clamp(state.coldRampElapsed, 0, totalSeconds);
  }
  if (state.method === "cold" && state.timerMode === "cook" && state.coldRampElapsed > 0) {
    const boilOnsetSeconds = getColdBoilOnsetSeconds(protocol) ?? state.coldRampElapsed;
    return clamp(boilOnsetSeconds + state.boilPlateauElapsed, 0, totalSeconds);
  }
  if (state.timerMode === "transfer") {
    return clamp(protocol.seconds + transferSeconds * getTimerProgress(), 0, totalSeconds);
  }
  if (state.timerMode === "cold") {
    return clamp(protocol.seconds + transferSeconds + protocol.coldShockSeconds * getTimerProgress(), 0, totalSeconds);
  }
  if (state.timerMode === "air") {
    return clamp(protocol.seconds + transferSeconds + protocol.coldShockSeconds + airSeconds * getTimerProgress(), 0, totalSeconds);
  }
  if (!state.timerRunning) {
    return 0;
  }
  return clamp(protocol.seconds - state.timerRemaining, 0, totalSeconds);
}

function updateMethodFields() {
  document.querySelectorAll("[data-method-scope]").forEach((field) => {
    const scopes = field.dataset.methodScope.split(" ");
    field.hidden = !scopes.includes(state.method);
  });
}

function drawEgg(protocol) {
  const canvas = el.eggCanvas;
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const cx = w / 2 + 18;
  const cy = h / 2 + 8;
  const shellW = 72 + (state.weight - 58) * 0.22;
  const shellH = 96 + (state.weight - 58) * 0.26;
  const yolkW = 33 + state.firmness * 0.14;
  const yolkH = 28 + state.firmness * 0.12;

  for (let y = 12; y < h - 18; y += 9) {
    ctx.strokeStyle = y % 18 === 0 ? "rgba(37, 208, 162, 0.08)" : "rgba(255, 255, 255, 0.035)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(18, y);
    ctx.lineTo(w - 18, y);
    ctx.stroke();
  }

  ctx.save();
  ctx.translate(cx, cy);

  traceEggShell(ctx, shellW, shellH);
  ctx.shadowColor = "rgba(152, 230, 218, 0.55)";
  ctx.shadowBlur = 18;
  ctx.strokeStyle = "rgba(220, 248, 239, 0.62)";
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.shadowBlur = 0;

  const albumenGlow = ctx.createRadialGradient(-18, -28, 12, 0, 2, shellH * 1.08);
  albumenGlow.addColorStop(0, "rgba(238, 255, 235, 0.42)");
  albumenGlow.addColorStop(0.48, "rgba(127, 202, 185, 0.22)");
  albumenGlow.addColorStop(1, "rgba(32, 64, 76, 0.12)");
  ctx.fillStyle = albumenGlow;
  traceEggShell(ctx, shellW - 3, shellH - 4);
  ctx.fill();

  ctx.save();
  traceEggShell(ctx, shellW - 5, shellH - 6);
  ctx.clip();

  for (let y = -shellH; y < shellH; y += 8) {
    ctx.strokeStyle = "rgba(210, 255, 238, 0.08)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-shellW, y);
    ctx.lineTo(shellW, y + 5);
    ctx.stroke();
  }

  const yolkGradient = ctx.createRadialGradient(-14, 12, 5, 0, 24, yolkW * 1.3);
  yolkGradient.addColorStop(0, protocol.label === "Hard" ? "rgba(255, 238, 167, 0.58)" : "rgba(255, 232, 141, 0.42)");
  yolkGradient.addColorStop(0.56, "rgba(233, 180, 72, 0.32)");
  yolkGradient.addColorStop(1, "rgba(68, 42, 34, 0.14)");
  ctx.fillStyle = yolkGradient;
  ctx.beginPath();
  ctx.ellipse(0, 24, yolkW, yolkH, -0.03, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(255, 226, 139, 0.24)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, 24, yolkW * 1.08, yolkH * 1.08, -0.03, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = "rgba(255, 226, 139, 0.14)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(0, 24, yolkW * 0.66, yolkH * 0.6, -0.03, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "rgba(6, 17, 24, 0.34)";
  ctx.beginPath();
  ctx.ellipse(-8, -shellH * 0.7, shellW * 0.32, shellH * 0.15, -0.08, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(210, 255, 238, 0.18)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-shellW * 0.52, -12);
  ctx.bezierCurveTo(-shellW * 0.22, -28, shellW * 0.2, -26, shellW * 0.54, -8);
  ctx.stroke();

  ctx.restore();

  traceEggShell(ctx, shellW + 4, shellH + 4);
  ctx.strokeStyle = "rgba(70, 108, 118, 0.8)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.restore();

  ctx.fillStyle = "rgba(9, 10, 13, 0.58)";
  ctx.fillRect(14, 16, 108, 56);
  ctx.strokeStyle = "rgba(37, 208, 162, 0.32)";
  ctx.strokeRect(14.5, 16.5, 107, 55);
  ctx.fillStyle = "rgba(210, 255, 238, 0.78)";
  ctx.font = "700 12px Cascadia Mono, Consolas, monospace";
  ctx.fillText("X-RAY SCAN", 22, 31);
  ctx.fillText(`FIRMNESS ${state.firmness}`, 22, 49);
  ctx.fillText(`CORE ${protocol.centerTemp.toFixed(1)}°C`, 22, 65);

  ctx.strokeStyle = "rgba(37, 208, 162, 0.45)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - shellW - 12, cy);
  ctx.lineTo(cx - shellW - 28, cy);
  ctx.moveTo(cx + shellW + 12, cy);
  ctx.lineTo(cx + shellW + 28, cy);
  ctx.moveTo(cx, cy - shellH - 8);
  ctx.lineTo(cx, cy - shellH - 22);
  ctx.stroke();
}

function traceEggShell(ctx, shellW, shellH) {
  ctx.beginPath();
  ctx.moveTo(0, -shellH);
  ctx.bezierCurveTo(shellW * 0.42, -shellH, shellW * 0.76, -shellH * 0.64, shellW * 0.88, -shellH * 0.16);
  ctx.bezierCurveTo(shellW * 1.03, shellH * 0.5, shellW * 0.54, shellH * 1.05, 0, shellH * 1.05);
  ctx.bezierCurveTo(-shellW * 0.54, shellH * 1.05, -shellW * 1.03, shellH * 0.5, -shellW * 0.88, -shellH * 0.16);
  ctx.bezierCurveTo(-shellW * 0.76, -shellH * 0.64, -shellW * 0.42, -shellH, 0, -shellH);
  ctx.closePath();
}

function drawChart(protocol) {
  const canvas = el.chartCanvas;
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  ctx.fillStyle = "#11141b";
  ctx.fillRect(0, 0, w, h);

  for (let i = 0; i <= 5; i += 1) {
    const y = 24 + i * ((h - 48) / 5);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.beginPath();
    ctx.moveTo(34, y);
    ctx.lineTo(w - 20, y);
    ctx.stroke();
  }

  const left = 34;
  const right = w - 20;
  const top = 22;
  const bottom = h - 28;
  const curve = buildThermalCurve(protocol, 128);
  const transferSeconds = protocol.transferSeconds ?? 0;
  const airSeconds = protocol.airExposureSeconds ?? 0;
  const totalSeconds = protocol.seconds + transferSeconds + protocol.coldShockSeconds + airSeconds;
  const boilOnsetSeconds = getColdBoilOnsetSeconds(protocol);
  const cookFraction = protocol.seconds / totalSeconds;
  const transferFraction = transferSeconds / totalSeconds;
  const coldFraction = protocol.coldShockSeconds / totalSeconds;
  const boilX = boilOnsetSeconds === null ? null : left + (boilOnsetSeconds / totalSeconds) * (right - left);
  const transferStartX = left + cookFraction * (right - left);
  const coldStartX = left + (cookFraction + transferFraction) * (right - left);
  const airStartX = left + (cookFraction + transferFraction + coldFraction) * (right - left);

  ctx.fillStyle = "rgba(255, 194, 71, 0.08)";
  ctx.fillRect(transferStartX, top, coldStartX - transferStartX, bottom - top);
  ctx.fillStyle = "rgba(106, 168, 255, 0.08)";
  ctx.fillRect(coldStartX, top, airStartX - coldStartX, bottom - top);
  ctx.fillStyle = "rgba(255, 194, 71, 0.07)";
  ctx.fillRect(airStartX, top, right - airStartX, bottom - top);
  ctx.strokeStyle = "rgba(106, 168, 255, 0.28)";
  ctx.setLineDash([5, 6]);
  ctx.beginPath();
  ctx.moveTo(transferStartX, top);
  ctx.lineTo(transferStartX, bottom);
  ctx.moveTo(coldStartX, top);
  ctx.lineTo(coldStartX, bottom);
  ctx.moveTo(airStartX, top);
  ctx.lineTo(airStartX, bottom);
  if (boilX !== null) {
    ctx.moveTo(boilX, top);
    ctx.lineTo(boilX, bottom);
  }
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.strokeStyle = "rgba(106, 168, 255, 0.76)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  curve.forEach((point, index) => {
    const x = left + clamp(point.seconds / totalSeconds, 0, 1) * (right - left);
    const y = bottom - (point.water / 100) * (bottom - top);
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.stroke();

  ctx.strokeStyle = "#25d0a2";
  ctx.lineWidth = 4;
  ctx.beginPath();
  curve.forEach((point, index) => {
    const x = left + clamp(point.seconds / totalSeconds, 0, 1) * (right - left);
    const y = bottom - (point.core / 100) * (bottom - top);
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.stroke();

  const targetY = bottom - (protocol.targetCore / 100) * (bottom - top);
  ctx.strokeStyle = "#ffc247";
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(left, targetY);
  ctx.lineTo(right, targetY);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "#aeb7c7";
  ctx.font = "700 18px Cascadia Mono, Consolas, monospace";
  ctx.fillText(`${protocol.targetCore.toFixed(1)}°C`, left + 8, targetY - 10);
  ctx.font = "700 13px Cascadia Mono, Consolas, monospace";
  ctx.fillText("0", left, h - 8);
  if (right - transferStartX > 96) {
    ctx.fillText(formatTime(protocol.seconds), transferStartX - 28, h - 8);
  }
  ctx.fillText(formatTime(totalSeconds), right - 54, h - 8);
  ctx.fillStyle = "#6aa8ff";
  ctx.fillText("boundary", left + 4, top + 12);
  ctx.fillStyle = "#25d0a2";
  ctx.fillText("core", left + 92, top + 12);
  if (boilX !== null && boilX - left > 28 && transferStartX - boilX > 28) {
    ctx.fillStyle = "#aeb7c7";
    ctx.fillText("boil", boilX + 6, top + 28);
  }
  ctx.fillStyle = "#6aa8ff";
  if (coldStartX - transferStartX > 68) {
    ctx.fillText("transfer", transferStartX + 6, top + 28);
  } else {
    ctx.fillText("xfer", transferStartX + 6, top + 28);
  }
  ctx.fillText("cold", coldStartX + 6, top + 46);
  ctx.fillStyle = "#ffc247";
  ctx.fillText("air", airStartX + 6, top + 28);

  const markerProgress = getChartProgress(protocol);
  const markerX = left + markerProgress * (right - left);
  ctx.strokeStyle = "rgba(255, 194, 71, 0.82)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(markerX, top);
  ctx.lineTo(markerX, bottom);
  ctx.stroke();
  ctx.fillStyle = "#ffc247";
  ctx.beginPath();
  ctx.arc(markerX, top + 4, 4, 0, Math.PI * 2);
  ctx.fill();
}

function drawXsection(protocol) {
  const canvas = el.xsectionCanvas;
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  const snapshot = getXsectionSnapshot(protocol);
  ctx.clearRect(0, 0, w, h);

  ctx.fillStyle = "#11141b";
  ctx.fillRect(0, 0, w, h);

  for (let x = 28; x < w; x += 22) {
    ctx.strokeStyle = x % 44 === 0 ? "rgba(255, 255, 255, 0.05)" : "rgba(37, 208, 162, 0.035)";
    ctx.beginPath();
    ctx.moveTo(x, 18);
    ctx.lineTo(x, h - 18);
    ctx.stroke();
  }

  const boundaryTemp = snapshot.water;
  const cx = 180;
  const cy = 132;
  const waterR = 94;
  const whiteR = 72;
  const yolkR = 42;
  const centerTemp = snapshot.centerTemp;
  const yolkEdgeTemp = snapshot.yolkEdgeTemp;
  const tightWhiteTemp = snapshot.tightWhiteTemp;
  const looseWhiteTemp = snapshot.looseWhiteTemp;

  const waterGradient = ctx.createRadialGradient(cx, cy, whiteR, cx, cy, waterR);
  waterGradient.addColorStop(0, tempColor(boundaryTemp, 0.45));
  waterGradient.addColorStop(1, tempColor(boundaryTemp, 0.92));
  ctx.fillStyle = waterGradient;
  ctx.beginPath();
  ctx.arc(cx, cy, waterR, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#11141b";
  ctx.beginPath();
  ctx.arc(cx, cy, whiteR + 4, 0, Math.PI * 2);
  ctx.fill();

  const whiteGradient = ctx.createRadialGradient(cx, cy, yolkR, cx, cy, whiteR);
  whiteGradient.addColorStop(0, tempColor(tightWhiteTemp, 0.8));
  whiteGradient.addColorStop(1, tempColor(looseWhiteTemp, 0.96));
  ctx.fillStyle = whiteGradient;
  ctx.beginPath();
  ctx.arc(cx, cy, whiteR, 0, Math.PI * 2);
  ctx.fill();

  const yolkGradient = ctx.createRadialGradient(cx, cy, 3, cx, cy, yolkR);
  yolkGradient.addColorStop(0, tempColor(centerTemp, 0.95));
  yolkGradient.addColorStop(1, tempColor(yolkEdgeTemp, 0.95));
  ctx.fillStyle = yolkGradient;
  ctx.beginPath();
  ctx.arc(cx, cy, yolkR, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(255, 255, 255, 0.62)";
  ctx.lineWidth = 2;
  [waterR, whiteR, yolkR].forEach((radius) => {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
  });

  ctx.fillStyle = "rgba(255, 255, 255, 0.88)";
  ctx.font = "800 13px Cascadia Mono, Consolas, monospace";
  const boundaryLabel = snapshot.phase === "air" ? "air" : snapshot.phase === "cold" ? "cold water" : "water";
  ctx.fillText(boundaryLabel, cx - 126, cy - 98);
  ctx.fillText(`${boundaryTemp.toFixed(1)}°C`, cx - 126, cy - 80);
  ctx.fillText("loose white", cx + 86, cy - 62);
  ctx.fillText(`${looseWhiteTemp.toFixed(1)}°C`, cx + 86, cy - 44);
  ctx.fillText("tight white", cx + 82, cy - 12);
  ctx.fillText(`${tightWhiteTemp.toFixed(1)}°C`, cx + 82, cy + 6);
  ctx.fillText("yolk edge", cx + 52, cy + 48);
  ctx.fillText(`${yolkEdgeTemp.toFixed(1)}°C`, cx + 52, cy + 66);
  ctx.fillText("core", cx - 20, cy + 5);
  ctx.fillText(`${centerTemp.toFixed(1)}°C`, cx - 24, cy + 23);

  const waterPoint = pointOnCircle(cx, cy, (waterR + whiteR + 4) / 2, -2.78);
  drawLeader(ctx, cx - 80, cy - 78, waterPoint.x, waterPoint.y, "#6aa8ff");
  drawLeader(ctx, cx + 84, cy - 48, cx + whiteR - 4, cy - 26, "#6aa8ff");
  drawLeader(ctx, cx + 78, cy - 2, cx + yolkR + (whiteR - yolkR) * 0.38, cy - 2, "#25d0a2");
  drawLeader(ctx, cx + 48, cy + 52, cx + yolkR - 4, cy + 22, "#ffc247");

  drawTempLegend(ctx, 360, 48, 210, 16);

  ctx.fillStyle = "#aeb7c7";
  ctx.font = "700 12px Cascadia Mono, Consolas, monospace";
  ctx.fillText(`profile at ${formatTime(snapshot.seconds)}`, 360, 96);
  ctx.fillText(`center ${centerTemp.toFixed(1)}°C / yolk avg ${snapshot.yolkAverageTemp.toFixed(1)}°C`, 360, 122);
  ctx.fillText(`tight white ${tightWhiteTemp.toFixed(1)}°C / loose white ${looseWhiteTemp.toFixed(1)}°C`, 360, 144);
  ctx.fillText(`${boundaryLabel} boundary ${boundaryTemp.toFixed(1)}°C`, 360, 166);

  ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
  ctx.fillRect(360, 190, 210, 1);
  ctx.fillStyle = "#25d0a2";
  ctx.font = "800 13px Cascadia Mono, Consolas, monospace";
  ctx.fillText("white set", 360, 216);
  ctx.fillText(`${Math.round(snapshot.whiteSetIndex)}%`, 450, 216);
  ctx.fillStyle = "#ffc247";
  ctx.fillText("yolk gel", 360, 238);
  ctx.fillText(`${Math.round(snapshot.yolkGelIndex)}%`, 450, 238);
}

function getXsectionSnapshot(protocol) {
  if (!protocol.trace?.length) {
    return {
      seconds: protocol.seconds,
      water: getBoundaryTempAt(protocol, protocol.seconds),
      phase: "cook",
      centerTemp: protocol.centerTemp,
      yolkAverageTemp: protocol.yolkAverageTemp,
      yolkEdgeTemp: protocol.yolkEdgeTemp,
      tightWhiteTemp: protocol.tightWhiteTemp,
      looseWhiteTemp: protocol.looseWhiteTemp,
      surfaceTemp: protocol.surfaceTemp,
      yolkGelIndex: protocol.yolkGelIndex,
      whiteSetIndex: protocol.whiteSetIndex,
      overcookIndex: protocol.overcookIndex
    };
  }

  const targetSeconds = getModelElapsedSeconds(protocol);
  const rightIndex = protocol.trace.findIndex((point) => point.seconds >= targetSeconds);
  if (rightIndex <= 0) {
    return protocol.trace[0];
  }
  if (rightIndex === -1) {
    return protocol.trace[protocol.trace.length - 1];
  }
  const leftIndex = rightIndex - 1;
  const left = protocol.trace[leftIndex];
  const right = protocol.trace[rightIndex];
  const span = Math.max(1, right.seconds - left.seconds);
  const mix = clamp((targetSeconds - left.seconds) / span, 0, 1);
  const snapshot = interpolateTracePoint(left, right, mix);
  snapshot.water = getExactBoundaryTemp(protocol, snapshot.seconds, snapshot.phase);
  return snapshot;
}

function getExactBoundaryTemp(protocol, seconds, phase) {
  if (phase === "transfer") {
    const transferSeconds = protocol.transferSeconds ?? 0;
    const transferProgress = clamp((seconds - protocol.seconds) / Math.max(1, transferSeconds), 0, 1);
    return protocol.boilPoint + (15 - protocol.boilPoint) * transferProgress;
  }
  if (phase === "cold") {
    return 15;
  }
  if (phase === "air") {
    return state.airTemp;
  }
  return getBoundaryTempAt(protocol, seconds);
}

function interpolateTracePoint(left, right, mix) {
  const numericKeys = [
    "seconds",
    "water",
    "centerTemp",
    "yolkAverageTemp",
    "yolkEdgeTemp",
    "tightWhiteTemp",
    "looseWhiteTemp",
    "surfaceTemp",
    "yolkGelIndex",
    "whiteSetIndex",
    "overcookIndex"
  ];
  return numericKeys.reduce((snapshot, key) => {
    snapshot[key] = left[key] + (right[key] - left[key]) * mix;
    return snapshot;
  }, { phase: mix < 0.5 ? left.phase : right.phase });
}

function drawLeader(ctx, x1, y1, x2, y2, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x2, y2, 3, 0, Math.PI * 2);
  ctx.fill();
}

function pointOnCircle(cx, cy, radius, angleRadians) {
  return {
    x: cx + Math.cos(angleRadians) * radius,
    y: cy + Math.sin(angleRadians) * radius
  };
}

function drawTempLegend(ctx, x, y, width, height) {
  const gradient = ctx.createLinearGradient(x, y, x + width, y);
  [35, 50, 65, 80, 100].forEach((temp, index) => {
    gradient.addColorStop(index / 4, tempColor(temp, 1));
  });
  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, width, height);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
  ctx.strokeRect(x + 0.5, y + 0.5, width - 1, height - 1);
  ctx.fillStyle = "#aeb7c7";
  ctx.font = "700 11px Cascadia Mono, Consolas, monospace";
  ctx.fillText("35°C", x, y + height + 15);
  ctx.fillText("100°C", x + width - 42, y + height + 15);
}

function tempColor(temp, alpha = 1) {
  const stops = [
    { temp: 20, color: [74, 126, 255] },
    { temp: 50, color: [37, 208, 162] },
    { temp: 65, color: [255, 194, 71] },
    { temp: 80, color: [255, 120, 72] },
    { temp: 100, color: [255, 72, 86] }
  ];
  const value = clamp(temp, stops[0].temp, stops[stops.length - 1].temp);
  let left = stops[0];
  let right = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i += 1) {
    if (value >= stops[i].temp && value <= stops[i + 1].temp) {
      left = stops[i];
      right = stops[i + 1];
      break;
    }
  }
  const mix = (value - left.temp) / Math.max(1, right.temp - left.temp);
  const rgb = left.color.map((channel, index) => Math.round(channel + (right.color[index] - channel) * mix));
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}

function buildThermalCurve(protocol, points) {
  if (protocol.trace?.length) {
    const curve = protocol.trace.map((point) => ({
      seconds: point.seconds,
      water: point.water,
      core: point.core
    }));
    const boilOnsetSeconds = getColdBoilOnsetSeconds(protocol);
    if (boilOnsetSeconds !== null) {
      const boilPoint = sampleTraceAtSecond(protocol.trace, boilOnsetSeconds);
      curve.push({
        seconds: boilOnsetSeconds,
        water: protocol.boilPoint,
        core: boilPoint.core
      });
    }
    return curve
      .sort((left, right) => left.seconds - right.seconds)
      .filter((point, index, items) => index === 0 || Math.abs(point.seconds - items[index - 1].seconds) > 0.001);
  }

  const curve = [];
  let core = state.startTemp;
  const cookSeconds = Math.max(1, protocol.seconds);
  const transferSeconds = Math.max(0, protocol.transferSeconds ?? 0);
  const airSeconds = Math.max(0, protocol.airExposureSeconds ?? 0);
  const coolSeconds = Math.max(1, protocol.coldShockSeconds);
  const totalSeconds = cookSeconds + transferSeconds + coolSeconds + airSeconds;
  const dt = totalSeconds / (points - 1);
  const heatTauSeconds = clamp(245 + (state.weight - 58) * 4 + Math.max(0, state.quantity - 1) * 7, 170, 430);
  const coolTauSeconds = clamp(310 + (state.weight - 58) * 5, 230, 460);
  const coldBathTemp = 15;

  for (let i = 0; i < points; i += 1) {
    const seconds = i * dt;
    const isTransfer = seconds > cookSeconds && seconds <= cookSeconds + transferSeconds;
    const isCold = seconds > cookSeconds + transferSeconds && seconds <= cookSeconds + transferSeconds + coolSeconds;
    const isAir = seconds > cookSeconds + transferSeconds + coolSeconds;
    const transferProgress = transferSeconds ? clamp((seconds - cookSeconds) / transferSeconds, 0, 1) : 1;
    const transferWater = getBoilingPoint(state.altitude) + (coldBathTemp - getBoilingPoint(state.altitude)) * transferProgress;
    const water = isAir ? state.airTemp : isCold ? coldBathTemp : isTransfer ? transferWater : getBoundaryTempAt(protocol, seconds);
    if (i > 0) {
      const tauSeconds = isAir ? 900 : isCold ? coolTauSeconds : isTransfer ? 360 : heatTauSeconds;
      core += (water - core) * (1 - Math.exp(-dt / tauSeconds));
    }
    curve.push({ seconds, water, core });
  }

  return curve;
}

function getColdBoilOnsetSeconds(protocol) {
  if (protocol.method !== "cold") {
    return null;
  }
  const rampMinutes = protocol.input?.timeToBoil ?? state.timeToBoil;
  return clamp(rampMinutes * 60, 0, protocol.seconds);
}

function sampleTraceAtSecond(trace, seconds) {
  const rightIndex = trace.findIndex((point) => point.seconds >= seconds);
  if (rightIndex <= 0) {
    return trace[0];
  }
  if (rightIndex === -1) {
    return trace[trace.length - 1];
  }
  const left = trace[rightIndex - 1];
  const right = trace[rightIndex];
  const span = Math.max(1, right.seconds - left.seconds);
  return interpolateTracePoint(left, right, clamp((seconds - left.seconds) / span, 0, 1));
}

function getBoundaryTempAt(protocol, seconds) {
  if (protocol.method === "cold") {
    const rampSeconds = state.timeToBoil * 60;
    if (seconds <= rampSeconds) {
      const t = rampSeconds <= 0 ? 1 : seconds / rampSeconds;
      return state.waterStartTemp + (protocol.boilPoint - state.waterStartTemp) * t;
    }
    return protocol.boilPoint;
  }
  if (protocol.method === "bath") {
    return state.bathTemp;
  }
  return protocol.boilPoint - protocol.recoveryDip * Math.exp(-seconds / 120);
}

function renderTimer() {
  const progress = getTimerProgress();
  const degrees = Math.max(0, Math.min(360, progress * 360));
  const protocol = computeProtocol();
  el.timerText.textContent = state.timerMode === "ramp" ? formatTime(state.coldRampElapsed) : formatTime(state.timerRemaining);
  el.timerRing.style.background =
    `radial-gradient(circle, var(--panel) 0 58%, transparent 59%), conic-gradient(var(--yolk) ${degrees}deg, rgba(255, 255, 255, 0.08) ${degrees}deg)`;
  el.startPause.textContent = getStartButtonLabel();
  el.startPause.disabled = state.timerRunning && state.timerMode !== "ramp";
  el.speedToggle.textContent = state.timerSpeed === 1 ? "10x" : "1x";
  el.speedToggle.title = state.timerSpeed === 1 ? "Run timer at 10x speed" : "Return timer to normal speed";
  el.speedToggle.classList.toggle("active", state.timerSpeed > 1);
  el.speedToggle.setAttribute("aria-pressed", state.timerSpeed > 1 ? "true" : "false");
  el.requestJoke.textContent = "Joke";
  el.requestFact.textContent = "Fact";
  el.requestJoke.disabled = !state.timerRunning;
  el.requestFact.disabled = !state.timerRunning;
  el.waitingCounter.textContent = `${state.jokeCount} ${state.jokeCount === 1 ? "joke" : "jokes"} / ${state.factCount} ${state.factCount === 1 ? "fact" : "facts"} deployed`;
  updateLiveTimerMessage();
  renderSciencePanel(protocol);
  drawChart(protocol);
  drawXsection(protocol);
}

function updateLiveTimerMessage() {
  if (state.timerMode === "ramp") {
    el.waitingText.textContent = `Cold start active. Ramp elapsed: ${formatTime(state.coldRampElapsed)}. Press Water boiling when the pot reaches a real boil.`;
    return;
  }
  if (state.method === "cold" && state.timerMode === "cook" && state.coldRampElapsed > 0 && state.timerRunning) {
    el.waitingText.textContent = `Boil confirmed at ${formatTime(state.coldRampElapsed)}. Big timer is live boiling time remaining: ${formatTime(state.timerRemaining)}.`;
  }
}

function getStartButtonLabel() {
  if (state.timerMode === "ramp") {
    return "Water boiling";
  }
  if (state.timerRunning) {
    return "Running";
  }
  if (state.timerRemaining <= 0 || state.timerMode === "done") {
    return "Again";
  }
  if (state.method === "cold" && state.timerMode === "cook" && state.timerRemaining === computeProtocol().seconds) {
    return "Start ramp";
  }
  return "Start";
}

function renderPhases() {
  const total = state.timerTotal || computeProtocol().seconds;
  const elapsed = state.timerMode === "ramp" ? state.coldRampElapsed : total - state.timerRemaining;
  const phaseNames = getPhaseNames();
  const phaseSize = total / phaseNames.length;

  el.phaseList.innerHTML = phaseNames.map((name, index) => {
    const start = index * phaseSize;
    const end = start + phaseSize;
    const status = elapsed >= end ? "done" : elapsed >= start ? "active" : "";
    const phaseTime = state.timerMode === "cold" && index === phaseNames.length - 1 ? "done" : formatTime(end);
    return `
      <div class="phase ${status}">
        <b>${index + 1}</b>
        <strong>${name}</strong>
        <span>${phaseTime}</span>
      </div>
    `;
  }).join("");
}

function getPhaseNames() {
  if (state.timerMode === "ramp") {
    return ["Heat on", "Ramp watch", "Boil confirm"];
  }
  if (state.timerMode === "transfer") {
    return ["Lift eggs", "Boundary ramp", "Cold bath entry"];
  }
  if (state.timerMode === "air") {
    return ["Drain surface", "Room-air profile", "Serve window"];
  }
  if (state.timerMode === "cold") {
    return ["Cold bath", "Carryover arrest", "Shell cooldown"];
  }
  if (state.method === "cold" && state.timerMode === "cook" && state.coldRampElapsed > 0) {
    return ["Boil plateau", "Yolk gelation", "Overcook watch", "Transfer soon"];
  }
  if (state.method === "cold") {
    return ["Heat-on ramp", "Boil plateau", "Yolk gelation", "Overcook watch"];
  }
  if (state.method === "bath") {
    return ["Bath equilibration", "Albumen set", "Yolk gelation", "Hold precision"];
  }
  return ["Shell shock", "White set", "Yolk migration", "Overcook watch"];
}

function renderScenarioMatrix(outcomes = []) {
  const dotCount = outcomes.length || 90;
  el.scenarioMatrix.innerHTML = Array.from({ length: dotCount }, (_, index) => {
    const outcome = outcomes[index] || "";
    return `<span class="scenario-dot ${outcome}" style="--i:${index}"></span>`;
  }).join("");
}

function resetSimulationPanel() {
  if (state.simulationTimerId) {
    window.clearTimeout(state.simulationTimerId);
    state.simulationTimerId = null;
  }
  el.simulateScenarios.disabled = false;
  el.simulateScenarios.textContent = "Simulate";
  el.scenarioMatrix.className = "scenario-matrix idle";
  renderScenarioMatrix();
  el.simulationResult.innerHTML = "<p>Run a sweep to see how often this protocol lands in the perfect zone when reality gets annoying.</p>";
}

function runScenarioSimulation() {
  if (state.simulationTimerId) {
    window.clearTimeout(state.simulationTimerId);
  }

  el.simulateScenarios.disabled = true;
  el.simulateScenarios.textContent = "Sweeping";
  el.scenarioMatrix.className = "scenario-matrix running";
  renderScenarioMatrix();
  el.simulationResult.innerHTML = "<p>Scanning egg-weight drift, fridge variance, altitude wobble, water-volume error, ramp uncertainty, and timing error.</p>";

  state.simulationTimerId = window.setTimeout(() => {
    const result = simulateProtocolScenarios();
    const best = getSimulationConclusion(result);
    el.scenarioMatrix.className = "scenario-matrix complete";
    renderScenarioMatrix(result.scenarios);
    el.simulationResult.innerHTML = `
      <div class="simulation-verdict">
        <p><strong>${best}</strong> Scenario sweep: ${result.total} possible nuisances tested.</p>
        ${renderSimulationRow("Perfect", "perfect", result.perfect)}
        ${renderSimulationRow("Undercooked", "under", result.under)}
        ${renderSimulationRow("Overcooked", "over", result.over)}
      </div>
    `;
    el.simulateScenarios.disabled = false;
    el.simulateScenarios.textContent = "Simulate";
    state.simulationTimerId = null;
  }, 1450);
}

function renderSimulationRow(label, key, percent) {
  return `
    <div class="simulation-row">
      <span>${label}</span>
      <div class="simulation-bar"><div class="simulation-fill ${key}" style="width:${percent}%"></div></div>
      <strong>${percent}%</strong>
    </div>
  `;
}

function getSimulationConclusion(result) {
  if (result.perfect >= 70) {
    return "Protocol looks strong.";
  }
  if (result.under > result.over) {
    return "Main failure mode: undercooked.";
  }
  if (result.over > result.under) {
    return "Main failure mode: overcooked.";
  }
  return "Protocol is balanced, but fragile.";
}

function updateAutopsyCopy() {
  const yolk = Number(el.yolkScore.value);
  const white = Number(el.whiteScore.value);
  const peel = Number(el.peelScore.value);
  el.yolkScoreOut.value = `${getFirmnessLevel(yolk).label} / ${yolk}`;
  el.whiteScoreOut.value = white;
  el.peelScoreOut.value = peel;
  const avg = Math.round((yolk + white + peel) / 3);
  if (avg > 84) {
    el.autopsyTitle.textContent = "Specimen passed with suspicious elegance.";
    el.autopsyCopy.textContent = "Save this immediately before breakfast hubris erases the evidence.";
  } else if (avg > 64) {
    el.autopsyTitle.textContent = "Autopsy complete. Useful egg.";
    el.autopsyCopy.textContent = "Respectable data point. The lab accepts this offering.";
  } else {
    el.autopsyTitle.textContent = "The egg has filed a complaint.";
    el.autopsyCopy.textContent = "Save the failure. Bad eggs are how the model learns manners.";
  }
}

function setScreen(screen) {
  document.querySelectorAll(".tab").forEach((button) => {
    button.classList.toggle("active", button.dataset.screen === screen);
  });
  document.querySelectorAll(".screen").forEach((section) => {
    section.classList.toggle("active", section.id === `screen-${screen}`);
  });
}

function applyPreset(name) {
  const preset = presets[name];
  if (!preset) {
    return;
  }
  Object.assign(state, preset);
  state.potNote = preset.note;
  stopTimer();
  syncControls();
  updateOutputs();
  resetSimulationPanel();
  if (name) {
    setScreen("console");
  }
}

function startTimer() {
  if (state.timerRunning) {
    return;
  }
  if (state.timerRemaining <= 0 || state.timerMode === "done") {
    const protocol = computeProtocol();
    state.timerMode = "cook";
    state.timerRemaining = protocol.seconds;
    state.timerTotal = state.timerRemaining;
  }
  if (state.method === "cold" && state.timerMode === "cook" && state.timerRemaining === computeProtocol().seconds) {
    beginColdRamp();
    return;
  }
  primeAudio();
  requestWakeLock();
  state.timerRunning = true;
  state.timerId = window.setInterval(() => {
    if (state.timerMode === "ramp") {
      state.coldRampElapsed += state.timerSpeed;
      state.timerRemaining = Math.max(0, state.timerTotal - state.coldRampElapsed);
      renderTimer();
      renderPhases();
      return;
    }
    if (state.method === "cold" && state.timerMode === "cook" && state.coldRampElapsed > 0) {
      state.boilPlateauElapsed += state.timerSpeed;
    }
    state.timerRemaining -= state.timerSpeed;
    if (state.timerRemaining <= 0) {
      state.timerRemaining = 0;
      if (state.timerMode === "cook") {
        beginTransfer();
      } else if (state.timerMode === "transfer") {
        beginColdShock();
      } else if (state.timerMode === "cold") {
        beginAirExposure();
      } else {
        finishProtocol();
      }
    }
    renderTimer();
    renderPhases();
  }, 1000);
  renderTimer();
}

function beginColdRamp() {
  primeAudio();
  requestWakeLock();
  state.timerMode = "ramp";
  state.coldRampElapsed = 0;
  state.timerTotal = Math.max(1, Math.round(state.timeToBoil * 60));
  state.timerRemaining = state.timerTotal;
  state.timerRunning = true;
  el.waitingText.textContent = "Cold start active. No countdown yet: press Water boiling the moment the pot reaches a real boil.";
  state.timerId = window.setInterval(() => {
    state.coldRampElapsed += state.timerSpeed;
    state.timerRemaining = Math.max(0, state.timerTotal - state.coldRampElapsed);
    renderTimer();
    renderPhases();
  }, 1000);
  renderTimer();
  renderPhases();
}

function confirmWaterBoiling() {
  if (state.timerMode !== "ramp") {
    return;
  }
  const elapsedSeconds = Math.max(1, state.coldRampElapsed);
  state.timeToBoil = clamp(elapsedSeconds / 60, 1 / 60, 30);
  state.boilPlateauElapsed = 0;
  el.timeToBoil.value = state.timeToBoil;
  el.timeToBoilOut.value = `${state.timeToBoil} min`;
  const protocol = computeProtocol();
  const remaining = Math.max(0, protocol.seconds - elapsedSeconds);
  state.timerMode = "cook";
  state.timerTotal = remaining || 1;
  state.timerRemaining = remaining;
  el.waitingText.textContent = `Boil confirmed at ${formatTime(elapsedSeconds)}. Big timer is live boiling time remaining: ${formatTime(remaining)}.`;
  if (remaining <= 0) {
    beginTransfer();
  } else {
    renderTimer();
    renderPhases();
  }
}

function handleStartPause() {
  if (state.timerMode === "ramp" && state.timerRunning) {
    confirmWaterBoiling();
    return;
  }
  startTimer();
}

function toggleTimerSpeed() {
  state.timerSpeed = state.timerSpeed === 1 ? 10 : 1;
  renderTimer();
}

function stopTimer() {
  state.timerRunning = false;
  if (state.timerId) {
    window.clearInterval(state.timerId);
    state.timerId = null;
  }
  releaseWakeLock();
  renderTimer();
}

function resetTimer() {
  stopTimer();
  state.timerSpeed = 1;
  state.coldRampElapsed = 0;
  state.boilPlateauElapsed = 0;
  if (state.method === "cold") {
    state.timeToBoil = 8;
    el.timeToBoil.value = state.timeToBoil;
    el.timeToBoilOut.value = `${state.timeToBoil} min`;
  }
  const protocol = computeProtocol();
  state.timerMode = "cook";
  state.timerTotal = protocol.seconds;
  state.timerRemaining = protocol.seconds;
  el.waitingText.textContent = "Start the timer, then request a joke or learn one real nerd thing while the egg considers its future.";
  renderTimer();
  renderPhases();
}

function beginTransfer() {
  const protocol = computeProtocol();
  playAlarm();
  state.timerMode = "transfer";
  state.timerTotal = protocol.transferSeconds;
  state.timerRemaining = protocol.transferSeconds;
  el.waitingText.textContent = "Transfer phase. Boundary water ramps from boiling to 15°C before the cold bath model takes over.";
}

function beginAirExposure() {
  const protocol = computeProtocol();
  playAlarm();
  state.timerMode = "air";
  state.timerTotal = protocol.airExposureSeconds;
  state.timerRemaining = protocol.airExposureSeconds;
  el.waitingText.textContent = `Eggs out. ${state.airTemp}°C room air is now the boundary while carryover keeps moving inward.`;
}

function beginColdShock() {
  const protocol = computeProtocol();
  playAlarm();
  state.timerMode = "cold";
  state.timerTotal = protocol.coldShockSeconds;
  state.timerRemaining = protocol.coldShockSeconds;
  el.waitingText.textContent = getRandomItem(coldShockCommands);
}

function finishProtocol() {
  playAlarm();
  state.timerMode = "done";
  state.timerRunning = false;
  if (state.timerId) {
    window.clearInterval(state.timerId);
    state.timerId = null;
  }
  releaseWakeLock();
  el.waitingText.textContent = "Air-rest complete. The egg is no longer changing on your watch.";
}

function requestNerdJoke() {
  if (!state.timerRunning) {
    return;
  }
  const nextIndex = getRandomIndex(nerdJokes, state.lastJokeIndex);
  state.lastJokeIndex = nextIndex;
  state.jokeCount += 1;
  el.waitingText.textContent = nerdJokes[nextIndex];
  renderTimer();
}

function requestNerdFact() {
  if (!state.timerRunning) {
    return;
  }
  const nextIndex = getRandomIndex(nerdFacts, state.lastFactIndex);
  state.lastFactIndex = nextIndex;
  state.factCount += 1;
  el.waitingText.textContent = nerdFacts[nextIndex];
  renderTimer();
}

function getRandomIndex(items, previousIndex) {
  let nextIndex = Math.floor(Math.random() * items.length);
  if (items.length > 1) {
    while (nextIndex === previousIndex) {
      nextIndex = Math.floor(Math.random() * items.length);
    }
  }
  return nextIndex;
}

function getRandomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function primeAudio() {
  try {
    if (!state.audioContext) {
      const AudioCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtor) {
        return;
      }
      state.audioContext = new AudioCtor();
    }
    if (state.audioContext.state === "suspended") {
      state.audioContext.resume();
    }
  } catch (error) {
    state.audioContext = null;
  }
}

function playAlarm() {
  try {
    primeAudio();
    if (!state.audioContext) {
      return;
    }
    const ctx = state.audioContext;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(660, ctx.currentTime + 0.16);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.22, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.42);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.45);
  } catch (error) {
    // Sound is opportunistic; unsupported audio should never break the timer.
  }
}

async function requestWakeLock() {
  if (!("wakeLock" in navigator) || state.wakeLock) {
    return;
  }
  try {
    state.wakeLock = await navigator.wakeLock.request("screen");
    state.wakeLock.addEventListener("release", () => {
      state.wakeLock = null;
    });
  } catch (error) {
    state.wakeLock = null;
  }
}

function releaseWakeLock() {
  if (!state.wakeLock) {
    return;
  }
  state.wakeLock.release().catch(() => {});
  state.wakeLock = null;
}

function saveRun() {
  const protocol = computeProtocol();
  const run = {
    id: Date.now(),
    date: new Date().toLocaleString(),
    weight: state.weight,
    quantity: state.quantity,
    startTemp: state.startTemp,
    altitude: state.altitude,
    vigor: state.vigor,
    method: state.method,
    airTemp: state.airTemp,
    waterVolume: state.waterVolume,
    waterStartTemp: state.waterStartTemp,
    timeToBoil: state.timeToBoil,
    bathTemp: state.bathTemp,
    firmness: state.firmness,
    time: formatTime(protocol.seconds),
    targetCore: protocol.targetCore,
    centerTemp: Math.round(protocol.centerTemp * 10) / 10,
    yolkAverageTemp: Math.round(protocol.yolkAverageTemp * 10) / 10,
    yolkEdgeTemp: Math.round(protocol.yolkEdgeTemp * 10) / 10,
    tightWhiteTemp: Math.round(protocol.tightWhiteTemp * 10) / 10,
    looseWhiteTemp: Math.round(protocol.looseWhiteTemp * 10) / 10,
    whiteSetIndex: protocol.whiteSetIndex,
    yolkGelIndex: protocol.yolkGelIndex,
    overcookIndex: protocol.overcookIndex,
    looseWhiteRisk: protocol.looseWhiteRisk,
    model: protocol.model.model,
    legacySeconds: protocol.model.comparisons.legacySeconds,
    williamsSeconds: protocol.model.comparisons.williamsSeconds,
    experimentSchema: physics.createExperimentRecord(state).schema,
    yolk: Number(el.yolkScore.value),
    white: Number(el.whiteScore.value),
    peel: Number(el.peelScore.value),
    note: el.autopsyNote.value.trim() || state.potNote || "No note. The egg remains mysterious."
  };
  state.history.unshift(run);
  state.history = state.history.slice(0, 20);
  persistHistory();
  renderHistory();
  setScreen("notebook");
}

function persistHistory() {
  localStorage.setItem("yolkulator-history", JSON.stringify(state.history));
}

function loadHistory() {
  try {
    state.history = JSON.parse(localStorage.getItem("yolkulator-history") || "[]");
  } catch (error) {
    state.history = [];
  }
}

function renderHistory() {
  if (!state.history.length) {
    el.historyList.innerHTML = `<div class="history-empty">No saved experiments yet. Cook something questionable, then log the evidence.</div>`;
    return;
  }
  el.historyList.innerHTML = state.history.map((run) => `
    <article class="history-item">
      <header>
        <div>
          <strong>${run.time} / ${run.firmness} firmness / ${run.weight}g</strong>
          <small>${run.date}</small>
        </div>
        <small>${run.targetCore}°C</small>
      </header>
      <p>${run.quantity} eggs, ${run.startTemp}°C start, ${getMethodName(run.method || "hot").toLowerCase()}, ${run.waterVolume ?? "?"}L water. Scores: yolk ${run.yolk}, white ${run.white}, peel ${run.peel}.</p>
      <p>${escapeHtml(run.note)}</p>
    </article>
  `).join("");
}

function exportCsv() {
  if (!state.history.length) {
    return;
  }
  const header = ["date", "time", "weight", "quantity", "startTemp", "altitude", "vigor", "method", "airTemp", "waterVolume", "waterStartTemp", "timeToBoil", "bathTemp", "firmness", "targetCore", "centerTemp", "yolkAverageTemp", "yolkEdgeTemp", "tightWhiteTemp", "looseWhiteTemp", "whiteSetIndex", "yolkGelIndex", "overcookIndex", "looseWhiteRisk", "model", "legacySeconds", "williamsSeconds", "experimentSchema", "yolk", "white", "peel", "note"];
  const rows = state.history.map((run) => header.map((key) => csvCell(run[key])).join(","));
  const csv = [header.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "yolkulator-lab-notebook.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function csvCell(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function wireEvents() {
  ["weight", "quantity", "startTemp", "altitude", "airTemp", "waterVolume", "waterStartTemp", "timeToBoil", "bathTemp"].forEach((id) => {
    el[id].addEventListener("input", () => {
      state[id] = Number(el[id].value);
      resetTimer();
      updateOutputs();
      resetSimulationPanel();
    });
  });

  el.potNote.addEventListener("input", () => {
    state.potNote = el.potNote.value;
  });

  document.querySelectorAll("[name='method']").forEach((input) => {
    input.addEventListener("change", () => {
      state.method = input.value;
      updateMethodFields();
      resetTimer();
      updateOutputs();
      resetSimulationPanel();
    });
  });

  document.querySelectorAll("[name='vigor']").forEach((input) => {
    input.addEventListener("change", () => {
      state.vigor = input.value;
      resetTimer();
      updateOutputs();
      resetSimulationPanel();
    });
  });

  document.querySelectorAll(".tab").forEach((button) => {
    button.addEventListener("click", () => setScreen(button.dataset.screen));
  });

  document.querySelectorAll("[data-preset]").forEach((button) => {
    button.addEventListener("click", () => applyPreset(button.dataset.preset));
  });

  el.firmnessKnob.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    el.firmnessKnob.setPointerCapture(event.pointerId);
    setFirmnessFromPointer(event);
  });

  el.firmnessKnob.addEventListener("pointermove", (event) => {
    if (el.firmnessKnob.hasPointerCapture(event.pointerId)) {
      setFirmnessFromPointer(event);
    }
  });

  el.firmnessKnob.addEventListener("keydown", handleFirmnessKey);
  el.startPause.addEventListener("click", handleStartPause);
  el.resetTimer.addEventListener("click", resetTimer);
  el.speedToggle.addEventListener("click", toggleTimerSpeed);
  el.simulateScenarios.addEventListener("click", runScenarioSimulation);
  el.requestJoke.addEventListener("click", requestNerdJoke);
  el.requestFact.addEventListener("click", requestNerdFact);
  el.saveRun.addEventListener("click", saveRun);
  el.exportCsv.addEventListener("click", exportCsv);

  ["yolkScore", "whiteScore", "peelScore"].forEach((id) => {
    el[id].addEventListener("input", updateAutopsyCopy);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && state.timerRunning) {
      requestWakeLock();
    }
  });
}

function init() {
  bindElements();
  loadHistory();
  wireEvents();
  syncControls();
  updateOutputs();
  resetSimulationPanel();
  renderHistory();
}

init();
