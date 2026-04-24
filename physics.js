(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  root.YolkulatorPhysics = api;
})(typeof globalThis !== "undefined" ? globalThis : window, function () {
  const FIRMNESS_LEVELS = [
    { min: 0, max: 9, label: "Liquid", alias: "very runny", copy: "pours freely, sauce-like, close to raw texture" },
    { min: 10, max: 22, label: "Runny", alias: "soft-boiled", copy: "flows when cut, warm and slightly thickened" },
    { min: 23, max: 35, label: "Thickened", alias: "slow-runny", copy: "moves slowly, no raw-water feel" },
    { min: 36, max: 50, label: "Spreadable", alias: "jammy", copy: "glossy, spoonable, minimal spill" },
    { min: 51, max: 67, label: "Creamy", alias: "fudgy", copy: "dense, smooth, sliceable, no free liquid" },
    { min: 68, max: 84, label: "Set", alias: "medium-hard", copy: "cooked through, moist, low crumble" },
    { min: 85, max: 100, label: "Hard", alias: "no-gray hard", copy: "solid throughout, overcook guard active" }
  ];

  const DEFAULTS = {
    weight: 58,
    quantity: 1,
    startTemp: 5,
    altitude: 0,
    vigor: "rolling",
    method: "hot",
    waterVolume: 1.5,
    waterStartTemp: 15,
    timeToBoil: 8,
    bathTemp: 65,
    airTemp: 21,
    firmness: 52
  };

  const TEXTURE_TARGETS = [
    { max: 9, yolk: 8, tightWhite: 52, looseWhite: 25, overcookMax: 8, displayTemp: 60 },
    { max: 22, yolk: 20, tightWhite: 62, looseWhite: 38, overcookMax: 12, displayTemp: 63 },
    { max: 35, yolk: 34, tightWhite: 70, looseWhite: 50, overcookMax: 18, displayTemp: 65 },
    { max: 50, yolk: 50, tightWhite: 78, looseWhite: 60, overcookMax: 26, displayTemp: 67 },
    { max: 67, yolk: 67, tightWhite: 84, looseWhite: 68, overcookMax: 38, displayTemp: 70 },
    { max: 84, yolk: 84, tightWhite: 90, looseWhite: 78, overcookMax: 54, displayTemp: 75 },
    { max: 100, yolk: 96, tightWhite: 94, looseWhite: 86, overcookMax: 68, displayTemp: 82 }
  ];

  const ZONES = {
    yolk: "yolk",
    tightWhite: "tightWhite",
    looseWhite: "looseWhite"
  };

  function normalizeInput(input) {
    const next = { ...DEFAULTS, ...(input || {}) };
    next.weight = clamp(Number(next.weight) || DEFAULTS.weight, 40, 85);
    next.quantity = clamp(Math.round(Number(next.quantity) || DEFAULTS.quantity), 1, 12);
    next.startTemp = clamp(Number(next.startTemp) || DEFAULTS.startTemp, 0, 30);
    next.altitude = clamp(Number(next.altitude) || 0, 0, 3500);
    next.waterVolume = clamp(Number(next.waterVolume) || DEFAULTS.waterVolume, 0.3, 8);
    next.waterStartTemp = clamp(Number(next.waterStartTemp) || DEFAULTS.waterStartTemp, 0, 40);
    next.timeToBoil = clamp(Number(next.timeToBoil) || DEFAULTS.timeToBoil, 1 / 60, 30);
    next.bathTemp = clamp(Number(next.bathTemp) || DEFAULTS.bathTemp, 45, 95);
    next.airTemp = clamp(Number(next.airTemp) || DEFAULTS.airTemp, 0, 40);
    next.firmness = clamp(Math.round(Number(next.firmness) || 0), 0, 100);
    next.method = ["hot", "cold", "bath"].includes(next.method) ? next.method : "hot";
    next.vigor = ["gentle", "rolling", "violent"].includes(next.vigor) ? next.vigor : "rolling";
    return next;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function getFirmnessLevel(value) {
    const safeValue = clamp(Math.round(value), 0, 100);
    return FIRMNESS_LEVELS.reduce((current, level) => safeValue >= level.min ? level : current, FIRMNESS_LEVELS[0]);
  }

  function getTargetSpec(firmness) {
    const safeFirmness = clamp(Math.round(firmness), 0, 100);
    const floor = { max: 0, yolk: 0, tightWhite: 48, looseWhite: 20, overcookMax: 8, displayTemp: 59 };
    let lower = floor;
    let upper = TEXTURE_TARGETS[TEXTURE_TARGETS.length - 1];
    for (let i = 0; i < TEXTURE_TARGETS.length; i += 1) {
      upper = TEXTURE_TARGETS[i];
      if (safeFirmness <= upper.max) {
        break;
      }
      lower = upper;
    }
    const span = Math.max(1, upper.max - lower.max);
    const mix = clamp((safeFirmness - lower.max) / span, 0, 1);
    const base = {
      max: upper.max,
      yolk: interpolate(lower.yolk, upper.yolk, mix),
      tightWhite: interpolate(lower.tightWhite, upper.tightWhite, mix),
      looseWhite: interpolate(lower.looseWhite, upper.looseWhite, mix),
      overcookMax: interpolate(lower.overcookMax, upper.overcookMax, mix),
      displayTemp: interpolate(lower.displayTemp, upper.displayTemp, mix)
    };
    return {
      ...base,
      targetYolkTexture: safeFirmness,
      level: getFirmnessLevel(safeFirmness)
    };
  }

  function interpolate(left, right, mix) {
    return left + (right - left) * mix;
  }

  function getBoilingPoint(altitude) {
    return clamp(100 - Number(altitude || 0) * 0.00335, 88, 100);
  }

  function computeRecoveryDip(input, boilPoint) {
    const normalized = normalizeInput(input);
    const eggHeatCapacity = Math.max(1, normalized.quantity * normalized.weight * 3.2);
    const waterHeatCapacity = Math.max(0.2, normalized.waterVolume) * 1000 * 4.186;
    const temperatureGap = Math.max(0, boilPoint - normalized.startTemp);
    return eggHeatCapacity * temperatureGap / (waterHeatCapacity + eggHeatCapacity);
  }

  function getColdShockSeconds(firmness) {
    if (firmness < 35) {
      return 75;
    }
    if (firmness < 68) {
      return 105;
    }
    return 135;
  }

  function legacyHeuristic(input) {
    const normalized = normalizeInput(input);
    const method = normalized.method;
    const targetCore = Math.round(60 + normalized.firmness * 0.28);
    const boilPoint = getBoilingPoint(normalized.altitude);
    const recoveryDip = computeRecoveryDip(normalized, boilPoint);
    const base = 3.85 + normalized.firmness * 0.075;
    const weightAdj = (normalized.weight - 58) * 0.075;
    const coldAdj = Math.max(0, 20 - normalized.startTemp) * 0.07;
    const batchAdj = Math.max(0, normalized.quantity - 1) * 0.18;
    const altitudeAdj = normalized.altitude / 1000 * 0.8;
    const vigorAdj = normalized.vigor === "violent" ? -0.35 : normalized.vigor === "gentle" ? 0.25 : 0;
    const hotReservoirAdj = clamp(recoveryDip * 0.055 + (1.2 - normalized.waterVolume) * 0.12, -0.25, 0.95);
    const coldRampUseful = clamp(0.48 + (normalized.timeToBoil - 8) * 0.018, 0.42, 0.62);
    const coldRampAdj = normalized.timeToBoil * (1 - coldRampUseful) + Math.max(0, 20 - normalized.waterStartTemp) * 0.025;
    const bathGap = targetCore - normalized.bathTemp;
    const bathMinutes =
      10.8 +
      Math.max(0, normalized.weight - 58) * 0.13 +
      Math.max(0, 20 - normalized.startTemp) * 0.1 +
      Math.max(0, bathGap) * 1.05 +
      Math.max(0, -bathGap) * 0.18 +
      normalized.firmness * 0.03;
    let minutes = base + weightAdj + coldAdj + batchAdj + altitudeAdj + vigorAdj;

    if (method === "hot") {
      minutes += hotReservoirAdj;
    } else if (method === "cold") {
      minutes += coldRampAdj;
    } else if (method === "bath") {
      minutes = bathMinutes;
    }

    minutes = Math.max(4.1, minutes);

    return {
      model: "legacy-yolkulator-heuristic",
      minutes,
      seconds: Math.round(minutes * 60),
      targetCore,
      boilPoint,
      recoveryDip,
      coldRampAdj,
      coldRampUseful
    };
  }

  function williamsModel(input) {
    const normalized = normalizeInput(input);
    const target = getTargetSpec(normalized.firmness);
    const waterTemp = normalized.method === "bath" ? normalized.bathTemp : getBoilingPoint(normalized.altitude);
    const yolkBoundaryTemp = clamp(target.displayTemp, 58, waterTemp - 1);
    const massKg = normalized.weight / 1000;
    const density = 1038;
    const heatCapacity = 3700;
    const effectiveConductivity = 0.18;
    const ratio = 0.76 * ((normalized.startTemp - waterTemp) / (yolkBoundaryTemp - waterTemp));
    const logTerm = Math.log(Math.max(1.001, ratio));
    const seconds =
      (Math.pow(massKg, 2 / 3) * heatCapacity * Math.pow(density, 1 / 3)) /
      (effectiveConductivity * Math.PI * Math.PI * Math.pow(4 * Math.PI / 3, 2 / 3)) *
      logTerm;

    return {
      model: "williams-exeter-analytical",
      seconds: Math.round(clamp(seconds, 60, 2400)),
      minutes: clamp(seconds / 60, 1, 40),
      targetBoundaryTemp: yolkBoundaryTemp,
      note: "Homogeneous sphere baseline for hot-start cooking; useful for comparison, not the primary Yolkulator timer."
    };
  }

  function barhamKhymosReference(input) {
    const normalized = normalizeInput(input);
    return {
      model: "barham-khymos-reference",
      role: "human-facing comparison",
      note: "Khymos compares Williams' mass formula with Barham's circumference formula and highlights the center-versus-yolk-boundary ambiguity.",
      estimatedCircumferenceCm: estimateEggCircumference(normalized.weight),
      primaryLesson: "Mass is better than circumference when available, and clock time alone cannot describe white/yolk texture."
    };
  }

  function estimateEggCircumference(weight) {
    return Math.round((12.25 + (weight - 50) * 0.055) * 10) / 10;
  }

  function optimizeProtocol(input) {
    const normalized = normalizeInput(input);
    const legacy = legacyHeuristic(normalized);
    const target = getTargetSpec(normalized.firmness);
    const maxSeconds = normalized.method === "bath" ? 3600 : normalized.method === "cold" ? 1800 : 1200;
    const minSeconds = normalized.method === "bath" ? 360 : 180;
    const step = normalized.method === "bath" ? 30 : 15;
    let best = null;

    for (let seconds = minSeconds; seconds <= maxSeconds; seconds += step) {
      const result = simulateCook(normalized, seconds, { includeCooling: true, trace: false });
      const loss = scoreSimulation(result, target, normalized);
      if (!best || loss < best.loss) {
        best = { ...result, loss };
      }
    }

    const refinedStart = Math.max(minSeconds, best.cookSeconds - step);
    const refinedEnd = Math.min(maxSeconds, best.cookSeconds + step);
    for (let seconds = refinedStart; seconds <= refinedEnd; seconds += 5) {
      const result = simulateCook(normalized, seconds, { includeCooling: true, trace: false });
      const loss = scoreSimulation(result, target, normalized);
      if (loss < best.loss) {
        best = { ...result, loss };
      }
    }

    const traced = simulateCook(normalized, best.cookSeconds, { includeCooling: true, trace: true, traceEvery: 5 });
    const finalState = traced.finalState;
    const whiteSetIndex = Math.round(clamp(finalState.whiteSet, 0, 100));
    const yolkGelIndex = Math.round(clamp(finalState.yolkGel, 0, 100));
    const overcookIndex = Math.round(clamp(finalState.overcookRisk, 0, 100));
    const looseWhiteRisk = Math.round(clamp(100 - finalState.looseWhiteSet, 0, 100));
    const confidenceScore = computeConfidence(normalized, finalState, target, best.loss);

    return {
      model: "yolkulator-radial-v1",
      input: normalized,
      target,
      legacy,
      williams: williamsModel(normalized),
      barhamKhymos: barhamKhymosReference(normalized),
      cookSeconds: best.cookSeconds,
      seconds: best.cookSeconds,
      minutes: best.cookSeconds / 60,
      coldShockSeconds: getColdShockSeconds(normalized.firmness),
      boilPoint: getBoilingPoint(normalized.altitude),
      recoveryDip: computeRecoveryDip(normalized, getBoilingPoint(normalized.altitude)),
      coldRampUseful: legacy.coldRampUseful,
      coldRampAdj: legacy.coldRampAdj,
      transferSeconds: getTransferSeconds(),
      airExposureSeconds: getAirExposureSeconds(),
      whiteSetIndex,
      yolkGelIndex,
      overcookIndex,
      looseWhiteRisk,
      tightWhiteSet: Math.round(clamp(finalState.tightWhiteSet, 0, 100)),
      centerTemp: finalState.centerTemp,
      yolkAverageTemp: finalState.yolkAverageTemp,
      yolkEdgeTemp: finalState.yolkEdgeTemp,
      tightWhiteTemp: finalState.tightWhiteTemp,
      looseWhiteTemp: finalState.looseWhiteTemp,
      surfaceTemp: finalState.surfaceTemp,
      targetDisplayTemp: target.displayTemp,
      confidenceScore,
      confidence: confidenceScore > 78 ? "High" : confidenceScore > 55 ? "Medium" : "Experimental",
      trace: traced.trace,
      comparisons: {
        legacySeconds: legacy.seconds,
        williamsSeconds: williamsModel(normalized).seconds
      }
    };
  }

  function scoreSimulation(result, target, input) {
    const state = result.finalState;
    const yolkError = Math.abs(state.yolkGel - target.yolk) * 1.2;
    const yolkOverTarget = Math.max(0, state.yolkGel - target.yolk) * (input.firmness < 36 ? 0.8 : 0.35);
    const tightWhiteUnder = Math.max(0, target.tightWhite - state.tightWhiteSet) * 0.8;
    const looseWhiteUnder = Math.max(0, target.looseWhite - state.looseWhiteSet) * (input.firmness < 36 ? 0.45 : 0.25);
    const overcook = Math.max(0, state.overcookRisk - target.overcookMax) * (input.firmness < 68 ? 1.1 : 0.55);
    const longBathPenalty = input.method === "bath" ? Math.max(0, result.cookSeconds - 2400) / 120 : 0;
    return yolkError + yolkOverTarget + tightWhiteUnder + looseWhiteUnder + overcook + longBathPenalty;
  }

  function computeConfidence(input, state, target, loss) {
    const methodPenalty =
      (input.method === "hot" ? Math.max(0, 1 - input.waterVolume) * 16 : 0) +
      (input.method === "cold" ? Math.abs(input.timeToBoil - 8) * 1.5 : 0) +
      (input.method === "bath" && input.bathTemp < target.displayTemp ? 18 : 0);
    const profilePenalty = Math.max(0, target.tightWhite - state.tightWhiteSet) * 0.12 + state.overcookRisk * 0.08;
    const score =
      100 -
      Math.abs(input.weight - 58) * 0.55 -
      input.altitude / 85 -
      Math.max(0, input.quantity - 6) * 3.5 -
      methodPenalty -
      profilePenalty -
      loss * 0.28;
    return clamp(Math.round(score), 0, 100);
  }

  function simulateCook(input, cookSeconds, options) {
    const normalized = normalizeInput(input);
    const settings = { includeCooling: false, trace: false, traceEvery: 10, ...(options || {}) };
    const geometry = buildGeometry(normalized);
    const nodeCount = geometry.nodes.length;
    let temperatures = new Array(nodeCount).fill(normalized.startTemp);
    let states = geometry.nodes.map(() => ({
      yolkGel: 0,
      yolkOver: 0,
      whiteLow: 0,
      whiteHigh: 0
    }));
    const transferSeconds = settings.includeCooling ? getTransferSeconds() : 0;
    const airExposureSeconds = settings.includeCooling ? getAirExposureSeconds() : 0;
    const coldShockSeconds = settings.includeCooling ? getColdShockSeconds(normalized.firmness) : 0;
    const totalSeconds = Math.max(1, Math.round(cookSeconds + transferSeconds + coldShockSeconds + airExposureSeconds));
    const trace = [];

    for (let second = 0; second <= totalSeconds; second += 1) {
      const phase = getThermalPhase(second, cookSeconds, transferSeconds, coldShockSeconds);
      const boundaryTemp = getBoundaryTempForPhase(normalized, second, phase, cookSeconds, transferSeconds);
      if (settings.trace && second % settings.traceEvery === 0) {
        const summary = summarizeState(temperatures, states, geometry);
        trace.push({
          seconds: second,
          water: boundaryTemp,
          boundaryTemp,
          phase,
          core: summary.centerTemp,
          centerTemp: summary.centerTemp,
          yolkAverageTemp: summary.yolkAverageTemp,
          yolkEdgeTemp: summary.yolkEdgeTemp,
          tightWhiteTemp: summary.tightWhiteTemp,
          looseWhiteTemp: summary.looseWhiteTemp,
          surfaceTemp: summary.surfaceTemp,
          yolkGelIndex: summary.yolkGel,
          whiteSetIndex: summary.whiteSet,
          overcookIndex: summary.overcookRisk
        });
      }
      if (second === totalSeconds) {
        break;
      }
      temperatures = stepTemperatures(temperatures, geometry, boundaryTemp, getSurfaceH(normalized, phase), 1);
      states = stepTextureStates(states, temperatures, geometry, 1);
    }

    return {
      cookSeconds: Math.round(cookSeconds),
      totalSeconds,
      finalState: summarizeState(temperatures, states, geometry),
      trace
    };
  }

  function buildGeometry(input) {
    const density = 1035;
    const massKg = input.weight / 1000;
    const volume = massKg / density;
    const radius = Math.pow((3 * volume) / (4 * Math.PI), 1 / 3);
    const nodeCount = 25;
    const dr = radius / (nodeCount - 1);
    const nodes = [];
    for (let i = 0; i < nodeCount; i += 1) {
      const r = i * dr;
      const ratio = r / radius;
      const zone = ratio <= 0.62 ? ZONES.yolk : ratio <= 0.82 ? ZONES.tightWhite : ZONES.looseWhite;
      const props = zone === ZONES.yolk
        ? { k: 0.85, rho: 1030, cp: 3300 }
        : { k: 1.25, rho: 1030, cp: 3800 };
      const shellStart = Math.max(0, r - dr / 2);
      const shellEnd = Math.min(radius, r + dr / 2);
      const volumeWeight = Math.max(0.000001, Math.pow(shellEnd, 3) - Math.pow(shellStart, 3));
      nodes.push({ r, ratio, zone, props, volumeWeight });
    }
    return { radius, dr, nodes };
  }

  function stepTemperatures(temperatures, geometry, waterTemp, h, dt) {
    const next = temperatures.slice();
    const n = temperatures.length;
    const dr = geometry.dr;
    const dr2 = dr * dr;

    for (let i = 0; i < n; i += 1) {
      const node = geometry.nodes[i];
      const alpha = node.props.k / (node.props.rho * node.props.cp);
      if (i === 0) {
        next[i] = temperatures[i] + alpha * dt * 6 * (temperatures[1] - temperatures[0]) / dr2;
      } else if (i === n - 1) {
        const k = node.props.k;
        const ghost = temperatures[i] + (h * dr / k) * (waterTemp - temperatures[i]);
        const curvature = (ghost - 2 * temperatures[i] + temperatures[i - 1]) / dr2;
        const radial = (2 / Math.max(node.r, dr)) * (ghost - temperatures[i - 1]) / (2 * dr);
        next[i] = temperatures[i] + alpha * dt * (curvature + radial);
      } else {
        const r = Math.max(node.r, dr);
        const curvature = (temperatures[i + 1] - 2 * temperatures[i] + temperatures[i - 1]) / dr2;
        const radial = (2 / r) * (temperatures[i + 1] - temperatures[i - 1]) / (2 * dr);
        next[i] = temperatures[i] + alpha * dt * (curvature + radial);
      }
      next[i] = clamp(next[i], -5, 105);
    }

    return next;
  }

  function stepTextureStates(states, temperatures, geometry, dt) {
    return states.map((state, index) => {
      const temp = temperatures[index];
      const zone = geometry.nodes[index].zone;
      const next = { ...state };
      if (zone === ZONES.yolk) {
        next.yolkGel = advanceState(next.yolkGel, yolkGelRate(temp), dt);
        next.yolkOver = advanceState(next.yolkOver, yolkOverRate(temp), dt);
      } else {
        next.whiteLow = advanceState(next.whiteLow, whiteLowRate(temp), dt);
        next.whiteHigh = advanceState(next.whiteHigh, whiteHighRate(temp), dt);
      }
      return next;
    });
  }

  function advanceState(value, rate, dt) {
    return clamp(value + (1 - value) * (1 - Math.exp(-rate * dt)), 0, 1);
  }

  function yolkGelRate(temp) {
    if (temp < 54) {
      return 0;
    }
    return clamp((1 / 410) * Math.exp((temp - 64) / 4.8), 0, 0.045);
  }

  function yolkOverRate(temp) {
    if (temp < 75) {
      return 0;
    }
    return clamp((1 / 260) * Math.exp((temp - 78) / 7), 0, 0.035);
  }

  function whiteLowRate(temp) {
    if (temp < 58) {
      return 0;
    }
    return clamp((1 / 170) * Math.exp((temp - 63) / 5), 0, 0.06);
  }

  function whiteHighRate(temp) {
    if (temp < 72) {
      return 0;
    }
    return clamp((1 / 260) * Math.exp((temp - 80) / 5.5), 0, 0.055);
  }

  function summarizeState(temperatures, states, geometry) {
    const groups = {
      yolk: weightedGroup(temperatures, states, geometry, ZONES.yolk),
      tightWhite: weightedGroup(temperatures, states, geometry, ZONES.tightWhite),
      looseWhite: weightedGroup(temperatures, states, geometry, ZONES.looseWhite)
    };
    const yolkEdgeIndex = geometry.nodes.reduce((best, node, index) => {
      if (node.zone !== ZONES.yolk) {
        return best;
      }
      return node.ratio > geometry.nodes[best].ratio ? index : best;
    }, 0);
    const tightWhiteSet = groups.tightWhite.whiteLow * 68 + groups.tightWhite.whiteHigh * 32;
    const looseWhiteSet = groups.looseWhite.whiteLow * 54 + groups.looseWhite.whiteHigh * 46;
    return {
      centerTemp: temperatures[0],
      yolkAverageTemp: groups.yolk.temp,
      yolkEdgeTemp: temperatures[yolkEdgeIndex],
      tightWhiteTemp: groups.tightWhite.temp,
      looseWhiteTemp: groups.looseWhite.temp,
      surfaceTemp: temperatures[temperatures.length - 1],
      yolkGel: groups.yolk.yolkGel * 100,
      yolkOver: groups.yolk.yolkOver * 100,
      tightWhiteSet,
      looseWhiteSet,
      whiteSet: tightWhiteSet * 0.62 + looseWhiteSet * 0.38,
      overcookRisk: groups.yolk.yolkOver * 100
    };
  }

  function weightedGroup(temperatures, states, geometry, zone) {
    let total = 0;
    const sum = { temp: 0, yolkGel: 0, yolkOver: 0, whiteLow: 0, whiteHigh: 0 };
    geometry.nodes.forEach((node, index) => {
      if (node.zone !== zone) {
        return;
      }
      total += node.volumeWeight;
      sum.temp += temperatures[index] * node.volumeWeight;
      sum.yolkGel += states[index].yolkGel * node.volumeWeight;
      sum.yolkOver += states[index].yolkOver * node.volumeWeight;
      sum.whiteLow += states[index].whiteLow * node.volumeWeight;
      sum.whiteHigh += states[index].whiteHigh * node.volumeWeight;
    });
    return {
      temp: sum.temp / total,
      yolkGel: sum.yolkGel / total,
      yolkOver: sum.yolkOver / total,
      whiteLow: sum.whiteLow / total,
      whiteHigh: sum.whiteHigh / total
    };
  }

  function getBoundaryTempAt(input, seconds) {
    const boilPoint = getBoilingPoint(input.altitude);
    if (input.method === "bath") {
      return input.bathTemp;
    }
    if (input.method === "cold") {
      const rampSeconds = Math.max(1, input.timeToBoil * 60);
      if (seconds <= rampSeconds) {
        const t = seconds / rampSeconds;
        return input.waterStartTemp + (boilPoint - input.waterStartTemp) * t;
      }
      return boilPoint;
    }
    const recoveryDip = computeRecoveryDip(input, boilPoint);
    const recoveryTau = clamp(95 + Math.max(0, input.quantity - 1) * 8 + Math.max(0, 1.5 - input.waterVolume) * 28, 80, 190);
    return boilPoint - recoveryDip * Math.exp(-seconds / recoveryTau);
  }

  function getThermalPhase(seconds, cookSeconds, transferSeconds, coldShockSeconds) {
    if (seconds <= cookSeconds) {
      return "cook";
    }
    if (seconds <= cookSeconds + transferSeconds) {
      return "transfer";
    }
    if (seconds <= cookSeconds + transferSeconds + coldShockSeconds) {
      return "cold";
    }
    return "air";
  }

  function getBoundaryTempForPhase(input, seconds, phase, cookSeconds = 0, transferSeconds = getTransferSeconds()) {
    if (phase === "transfer") {
      const progress = clamp((seconds - cookSeconds) / Math.max(1, transferSeconds), 0, 1);
      return interpolate(getBoundaryTempAt(input, cookSeconds), 15, progress);
    }
    if (phase === "air") {
      return input.airTemp;
    }
    if (phase === "cold") {
      return 15;
    }
    return getBoundaryTempAt(input, seconds);
  }

  function getSurfaceH(input, phase) {
    if (phase === "air") {
      return 18;
    }
    if (phase === "transfer") {
      return 220;
    }
    if (phase === "cold") {
      return 310;
    }
    if (input.method === "bath") {
      return 260;
    }
    return {
      gentle: 180,
      rolling: 260,
      violent: 340
    }[input.vigor] || 260;
  }

  function getAirExposureSeconds() {
    return 30;
  }

  function getTransferSeconds() {
    return 15;
  }

  function createExperimentRecord(input, observations) {
    const normalized = normalizeInput(input);
    return {
      schema: "yolkulator-experiment-v1",
      input: normalized,
      observations: {
        measuredWaterProfile: [],
        observedYolkLabel: null,
        observedWhiteLabel: null,
        peelScore: null,
        satisfaction: null,
        notes: "",
        ...(observations || {})
      }
    };
  }

  return {
    FIRMNESS_LEVELS,
    normalizeInput,
    clamp,
    getFirmnessLevel,
    getTargetSpec,
    getBoilingPoint,
    computeRecoveryDip,
    getColdShockSeconds,
    getTransferSeconds,
    getAirExposureSeconds,
    legacyHeuristic,
    williamsModel,
    barhamKhymosReference,
    simulateCook,
    optimizeProtocol,
    createExperimentRecord
  };
});
