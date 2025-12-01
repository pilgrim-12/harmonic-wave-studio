/**
 * Signal Modulation Library
 * AM (Amplitude Modulation) and FM (Frequency Modulation)
 *
 * Applications:
 * - Radio broadcasting (AM/FM radio)
 * - Audio synthesis (FM synth)
 * - Telecommunications
 * - Data transmission
 */

export type ModulationType = "AM" | "DSB" | "SSB" | "FM" | "PM";

export interface ModulationConfig {
  type: ModulationType;
  carrierFrequency: number;      // Carrier frequency (Hz)
  carrierAmplitude: number;      // Carrier amplitude (0-1)
  modulationIndex: number;       // Modulation index/depth
  modulationFrequency: number;   // Modulating signal frequency (Hz)
  modulationWaveform: "sine" | "square" | "triangle" | "sawtooth" | "custom";
  // For SSB
  ssbMode?: "upper" | "lower";   // Upper or lower sideband
}

export interface ModulatedSignalData {
  time: number[];
  carrier: number[];             // Carrier signal
  modulating: number[];          // Modulating (message) signal
  modulated: number[];           // Modulated output signal
  envelope?: number[];           // Envelope (for AM)
  instantFrequency?: number[];   // Instantaneous frequency (for FM)
}

export interface ModulationMetrics {
  modulationDepth: number;       // Actual modulation depth (%)
  bandwidth: number;             // Occupied bandwidth (Hz)
  carrierPower: number;          // Carrier power (relative)
  sidebandPower: number;         // Sideband power (relative)
  efficiency: number;            // Power efficiency (%)
  peakDeviation?: number;        // Peak frequency deviation (for FM)
}

/**
 * Generate modulated signal
 */
export function generateModulatedSignal(
  config: ModulationConfig,
  duration: number,
  sampleRate: number
): ModulatedSignalData {
  const numSamples = Math.floor(duration * sampleRate);
  const time: number[] = [];
  const carrier: number[] = [];
  const modulating: number[] = [];
  const modulated: number[] = [];

  const {
    type,
    carrierFrequency,
    carrierAmplitude,
    modulationIndex,
    modulationFrequency,
    modulationWaveform,
  } = config;

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    time.push(t);

    // Generate carrier
    const carrierValue = carrierAmplitude * Math.sin(2 * Math.PI * carrierFrequency * t);
    carrier.push(carrierValue);

    // Generate modulating signal
    let modValue: number;
    switch (modulationWaveform) {
      case "sine":
        modValue = Math.sin(2 * Math.PI * modulationFrequency * t);
        break;
      case "square":
        modValue = Math.sign(Math.sin(2 * Math.PI * modulationFrequency * t));
        break;
      case "triangle":
        modValue = 2 * Math.abs(2 * ((modulationFrequency * t) % 1) - 1) - 1;
        break;
      case "sawtooth":
        modValue = 2 * ((modulationFrequency * t) % 1) - 1;
        break;
      default:
        modValue = Math.sin(2 * Math.PI * modulationFrequency * t);
    }
    modulating.push(modValue);

    // Generate modulated signal based on type
    let modulatedValue: number;

    switch (type) {
      case "AM":
        // AM: s(t) = Ac * (1 + m * m(t)) * cos(2πfc*t)
        modulatedValue = carrierAmplitude * (1 + modulationIndex * modValue) *
          Math.cos(2 * Math.PI * carrierFrequency * t);
        break;

      case "DSB":
        // DSB-SC (Double Sideband Suppressed Carrier): s(t) = Ac * m(t) * cos(2πfc*t)
        modulatedValue = carrierAmplitude * modValue *
          Math.cos(2 * Math.PI * carrierFrequency * t);
        break;

      case "SSB":
        // SSB (Single Sideband) - simplified using phase shift
        // Upper sideband: cos((ωc + ωm)t), Lower: cos((ωc - ωm)t)
        const ssbSign = config.ssbMode === "lower" ? -1 : 1;
        modulatedValue = carrierAmplitude * 0.5 *
          Math.cos(2 * Math.PI * (carrierFrequency + ssbSign * modulationFrequency * modValue) * t);
        break;

      case "FM":
        // FM: s(t) = Ac * cos(2πfc*t + β * sin(2πfm*t))
        // β = modulationIndex = Δf / fm (frequency deviation ratio)
        const phaseDeviation = modulationIndex * Math.sin(2 * Math.PI * modulationFrequency * t);
        modulatedValue = carrierAmplitude *
          Math.cos(2 * Math.PI * carrierFrequency * t + phaseDeviation);
        break;

      case "PM":
        // PM: s(t) = Ac * cos(2πfc*t + kp * m(t))
        // kp = modulationIndex (phase deviation constant)
        const phaseShift = modulationIndex * modValue;
        modulatedValue = carrierAmplitude *
          Math.cos(2 * Math.PI * carrierFrequency * t + phaseShift);
        break;

      default:
        modulatedValue = carrierValue;
    }

    modulated.push(modulatedValue);
  }

  // Calculate envelope for AM
  let envelope: number[] | undefined;
  if (type === "AM" || type === "DSB") {
    envelope = calculateEnvelope(modulated, sampleRate, carrierFrequency);
  }

  // Calculate instantaneous frequency for FM/PM
  let instantFrequency: number[] | undefined;
  if (type === "FM" || type === "PM") {
    instantFrequency = calculateInstantaneousFrequency(modulated, sampleRate);
  }

  return {
    time,
    carrier,
    modulating,
    modulated,
    envelope,
    instantFrequency,
  };
}

/**
 * Generate modulated signal from custom input
 */
export function modulateSignal(
  inputSignal: number[],
  config: ModulationConfig,
  sampleRate: number
): ModulatedSignalData {
  const numSamples = inputSignal.length;
  const time: number[] = [];
  const carrier: number[] = [];
  const modulated: number[] = [];

  const {
    type,
    carrierFrequency,
    carrierAmplitude,
    modulationIndex,
  } = config;

  // Normalize input signal to -1 to 1
  const maxAbs = Math.max(...inputSignal.map(Math.abs)) || 1;
  const normalizedInput = inputSignal.map(v => v / maxAbs);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    time.push(t);

    const carrierValue = carrierAmplitude * Math.sin(2 * Math.PI * carrierFrequency * t);
    carrier.push(carrierValue);

    const modValue = normalizedInput[i];
    let modulatedValue: number;

    switch (type) {
      case "AM":
        modulatedValue = carrierAmplitude * (1 + modulationIndex * modValue) *
          Math.cos(2 * Math.PI * carrierFrequency * t);
        break;

      case "DSB":
        modulatedValue = carrierAmplitude * modValue *
          Math.cos(2 * Math.PI * carrierFrequency * t);
        break;

      case "FM":
        // For FM with arbitrary input, integrate the signal
        let phaseAccumulator = 0;
        for (let j = 0; j <= i; j++) {
          phaseAccumulator += normalizedInput[j] / sampleRate;
        }
        modulatedValue = carrierAmplitude *
          Math.cos(2 * Math.PI * carrierFrequency * t + 2 * Math.PI * modulationIndex * phaseAccumulator);
        break;

      case "PM":
        modulatedValue = carrierAmplitude *
          Math.cos(2 * Math.PI * carrierFrequency * t + modulationIndex * modValue);
        break;

      default:
        modulatedValue = carrierValue;
    }

    modulated.push(modulatedValue);
  }

  return {
    time,
    carrier,
    modulating: normalizedInput,
    modulated,
    envelope: type === "AM" || type === "DSB" ? calculateEnvelope(modulated, sampleRate, carrierFrequency) : undefined,
    instantFrequency: type === "FM" || type === "PM" ? calculateInstantaneousFrequency(modulated, sampleRate) : undefined,
  };
}

/**
 * Calculate modulation metrics
 */
export function calculateModulationMetrics(
  signalData: ModulatedSignalData,
  config: ModulationConfig
): ModulationMetrics {
  const { modulated, modulating, carrier } = signalData;
  const { type, carrierFrequency, modulationFrequency, modulationIndex } = config;

  // Calculate powers
  const carrierPower = carrier.reduce((sum, v) => sum + v * v, 0) / carrier.length;
  const modulatedPower = modulated.reduce((sum, v) => sum + v * v, 0) / modulated.length;

  let bandwidth: number;
  let efficiency: number;
  let sidebandPower: number;
  let peakDeviation: number | undefined;

  switch (type) {
    case "AM":
      // AM bandwidth = 2 * fm
      bandwidth = 2 * modulationFrequency;
      // AM efficiency = m² / (2 + m²) for sinusoidal modulation
      efficiency = (modulationIndex * modulationIndex) /
        (2 + modulationIndex * modulationIndex) * 100;
      sidebandPower = modulatedPower - carrierPower;
      break;

    case "DSB":
      bandwidth = 2 * modulationFrequency;
      efficiency = 100; // All power in sidebands
      sidebandPower = modulatedPower;
      break;

    case "SSB":
      bandwidth = modulationFrequency;
      efficiency = 100;
      sidebandPower = modulatedPower;
      break;

    case "FM":
      // Carson's rule: BW ≈ 2(Δf + fm) = 2fm(β + 1)
      peakDeviation = modulationIndex * modulationFrequency;
      bandwidth = 2 * (peakDeviation + modulationFrequency);
      efficiency = 100; // All power in signal (no separate carrier in angle modulation sense)
      sidebandPower = modulatedPower;
      break;

    case "PM":
      // Similar to FM
      peakDeviation = modulationIndex; // In radians
      bandwidth = 2 * modulationFrequency * (modulationIndex + 1);
      efficiency = 100;
      sidebandPower = modulatedPower;
      break;

    default:
      bandwidth = 2 * modulationFrequency;
      efficiency = 0;
      sidebandPower = 0;
  }

  // Actual modulation depth from envelope
  let modulationDepth = modulationIndex * 100;
  if (signalData.envelope && signalData.envelope.length > 0) {
    const envMax = Math.max(...signalData.envelope);
    const envMin = Math.min(...signalData.envelope);
    const envAvg = (envMax + envMin) / 2;
    if (envAvg > 0) {
      modulationDepth = ((envMax - envMin) / (2 * envAvg)) * 100;
    }
  }

  return {
    modulationDepth,
    bandwidth,
    carrierPower,
    sidebandPower,
    efficiency,
    peakDeviation,
  };
}

/**
 * Calculate signal envelope using Hilbert transform approximation
 */
function calculateEnvelope(signal: number[], sampleRate: number, carrierFreq: number): number[] {
  // Simple envelope detection: low-pass filter of rectified signal
  const rectified = signal.map(Math.abs);

  // Moving average as simple low-pass filter
  const windowSize = Math.max(3, Math.floor(sampleRate / carrierFreq / 2));
  const envelope: number[] = [];

  for (let i = 0; i < signal.length; i++) {
    let sum = 0;
    let count = 0;
    for (let j = Math.max(0, i - windowSize); j < Math.min(signal.length, i + windowSize + 1); j++) {
      sum += rectified[j];
      count++;
    }
    envelope.push(sum / count);
  }

  return envelope;
}

/**
 * Calculate instantaneous frequency from phase derivative
 */
function calculateInstantaneousFrequency(signal: number[], sampleRate: number): number[] {
  const instantFreq: number[] = [];

  // Simple approximation: count zero crossings in sliding window
  const windowSize = Math.max(10, Math.floor(sampleRate / 100));

  for (let i = 0; i < signal.length; i++) {
    const start = Math.max(0, i - windowSize / 2);
    const end = Math.min(signal.length - 1, i + windowSize / 2);

    let zeroCrossings = 0;
    for (let j = start; j < end; j++) {
      if ((signal[j] >= 0 && signal[j + 1] < 0) || (signal[j] < 0 && signal[j + 1] >= 0)) {
        zeroCrossings++;
      }
    }

    // Frequency = zero crossings / 2 / time window
    const timeWindow = (end - start) / sampleRate;
    const freq = timeWindow > 0 ? zeroCrossings / 2 / timeWindow : 0;
    instantFreq.push(freq);
  }

  return instantFreq;
}

/**
 * Demodulate AM signal
 */
export function demodulateAM(
  modulatedSignal: number[],
  sampleRate: number,
  carrierFrequency: number
): number[] {
  // Envelope detection
  const envelope = calculateEnvelope(modulatedSignal, sampleRate, carrierFrequency);

  // Remove DC offset
  const avg = envelope.reduce((a, b) => a + b, 0) / envelope.length;
  return envelope.map(v => v - avg);
}

/**
 * Demodulate FM signal (simplified)
 */
export function demodulateFM(
  modulatedSignal: number[],
  sampleRate: number
): number[] {
  // Differentiate and envelope detect
  const differentiated: number[] = [];

  for (let i = 1; i < modulatedSignal.length; i++) {
    differentiated.push((modulatedSignal[i] - modulatedSignal[i - 1]) * sampleRate);
  }
  differentiated.unshift(differentiated[0] || 0);

  // Envelope of differentiated signal
  return calculateEnvelope(differentiated, sampleRate, sampleRate / 10);
}

/**
 * Get modulation type description
 */
export function getModulationDescription(type: ModulationType): string {
  const descriptions: Record<ModulationType, string> = {
    AM: "Amplitude Modulation - carrier amplitude varies with message signal",
    DSB: "Double Sideband Suppressed Carrier - no carrier, both sidebands",
    SSB: "Single Sideband - only upper or lower sideband transmitted",
    FM: "Frequency Modulation - carrier frequency varies with message signal",
    PM: "Phase Modulation - carrier phase varies with message signal",
  };
  return descriptions[type];
}
