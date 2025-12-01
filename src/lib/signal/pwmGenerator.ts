/**
 * PWM (Pulse Width Modulation) Signal Generator Library
 * ШИМ - Широтно-импульсная модуляция
 *
 * PWM is used for:
 * - Motor speed control
 * - LED dimming
 * - Audio Class-D amplifiers
 * - Power regulation
 * - Digital-to-Analog conversion
 */

export type PWMMode =
  | "fixed"           // Fixed duty cycle
  | "sine"            // Sine wave modulated duty cycle
  | "triangle"        // Triangle wave modulated
  | "sawtooth"        // Sawtooth modulated
  | "custom";         // Custom modulation from input signal

export interface PWMConfig {
  carrierFrequency: number;   // Carrier/switching frequency (Hz)
  dutyCycle: number;          // Base duty cycle (0-1)
  modulationDepth: number;    // Modulation depth (0-1)
  modulationFrequency: number; // Modulation frequency (Hz)
  mode: PWMMode;
  deadTime?: number;          // Dead time between transitions (for H-bridge)
  resolution?: number;        // PWM resolution in bits (8, 10, 12, 16)
}

export interface PWMSignalData {
  time: number[];
  pwmSignal: number[];        // Digital PWM output (0 or 1)
  modulatingSignal: number[]; // The modulating signal
  averageSignal: number[];    // Low-pass filtered (average) signal
  dutyCycleOverTime: number[]; // Instantaneous duty cycle
}

export interface PWMMetrics {
  effectiveDutyCycle: number;  // Average duty cycle
  rippleAmplitude: number;     // Peak-to-peak ripple
  fundamentalAmplitude: number; // Amplitude of fundamental frequency
  thd: number;                 // Total Harmonic Distortion
  switchingLossFactor: number; // Relative switching loss indicator
}

/**
 * Generate PWM signal
 */
export function generatePWMSignal(
  config: PWMConfig,
  duration: number,
  sampleRate: number
): PWMSignalData {
  const {
    carrierFrequency,
    dutyCycle,
    modulationDepth,
    modulationFrequency,
    mode,
    deadTime = 0,
  } = config;

  const numSamples = Math.floor(duration * sampleRate);
  const time: number[] = [];
  const pwmSignal: number[] = [];
  const modulatingSignal: number[] = [];
  const dutyCycleOverTime: number[] = [];

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    time.push(t);

    // Calculate modulating signal based on mode
    let modValue: number;
    switch (mode) {
      case "sine":
        modValue = Math.sin(2 * Math.PI * modulationFrequency * t);
        break;
      case "triangle":
        modValue = 2 * Math.abs(2 * ((modulationFrequency * t) % 1) - 1) - 1;
        break;
      case "sawtooth":
        modValue = 2 * ((modulationFrequency * t) % 1) - 1;
        break;
      case "fixed":
      default:
        modValue = 0;
        break;
    }

    modulatingSignal.push(modValue);

    // Calculate instantaneous duty cycle
    const instantDuty = Math.max(0, Math.min(1,
      dutyCycle + modulationDepth * modValue * (1 - dutyCycle)
    ));
    dutyCycleOverTime.push(instantDuty);

    // Generate carrier (sawtooth or triangle for comparison)
    const carrierPhase = (carrierFrequency * t) % 1;

    // PWM comparison: carrier < duty cycle => HIGH
    let pwmValue: number;
    if (deadTime > 0) {
      // Add dead time (transition delay)
      const deadTimeSamples = deadTime * sampleRate;
      const carrierPeriodSamples = sampleRate / carrierFrequency;
      const positionInPeriod = (i % carrierPeriodSamples);

      if (positionInPeriod < deadTimeSamples ||
          Math.abs(positionInPeriod - instantDuty * carrierPeriodSamples) < deadTimeSamples) {
        pwmValue = 0; // Dead time - both switches off
      } else {
        pwmValue = carrierPhase < instantDuty ? 1 : 0;
      }
    } else {
      pwmValue = carrierPhase < instantDuty ? 1 : 0;
    }

    pwmSignal.push(pwmValue);
  }

  // Calculate average (low-pass filtered) signal
  const averageSignal = calculateMovingAverage(pwmSignal, Math.floor(sampleRate / carrierFrequency));

  return {
    time,
    pwmSignal,
    modulatingSignal,
    averageSignal,
    dutyCycleOverTime,
  };
}

/**
 * Generate PWM from custom input signal (e.g., audio)
 */
export function generatePWMFromSignal(
  inputSignal: number[],
  carrierFrequency: number,
  sampleRate: number
): PWMSignalData {
  const numSamples = inputSignal.length;
  const time: number[] = [];
  const pwmSignal: number[] = [];
  const modulatingSignal: number[] = [];
  const dutyCycleOverTime: number[] = [];

  // Normalize input signal to 0-1 range
  const minVal = Math.min(...inputSignal);
  const maxVal = Math.max(...inputSignal);
  const range = maxVal - minVal || 1;

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    time.push(t);

    // Normalize to duty cycle (0-1)
    const normalizedValue = (inputSignal[i] - minVal) / range;
    modulatingSignal.push(inputSignal[i]);
    dutyCycleOverTime.push(normalizedValue);

    // Generate carrier
    const carrierPhase = (carrierFrequency * t) % 1;

    // PWM comparison
    const pwmValue = carrierPhase < normalizedValue ? 1 : 0;
    pwmSignal.push(pwmValue);
  }

  // Calculate average signal
  const averageSignal = calculateMovingAverage(pwmSignal, Math.floor(sampleRate / carrierFrequency));

  return {
    time,
    pwmSignal,
    modulatingSignal,
    averageSignal,
    dutyCycleOverTime,
  };
}

/**
 * Calculate PWM metrics
 */
export function calculatePWMMetrics(
  pwmData: PWMSignalData,
  config: PWMConfig
): PWMMetrics {
  const { pwmSignal, averageSignal, modulatingSignal } = pwmData;

  // Effective (average) duty cycle
  const effectiveDutyCycle = pwmSignal.reduce((a, b) => a + b, 0) / pwmSignal.length;

  // Ripple amplitude (peak-to-peak of average signal)
  const avgMin = Math.min(...averageSignal);
  const avgMax = Math.max(...averageSignal);
  const rippleAmplitude = avgMax - avgMin;

  // Fundamental amplitude (from modulating signal)
  const modMin = Math.min(...modulatingSignal);
  const modMax = Math.max(...modulatingSignal);
  const fundamentalAmplitude = (modMax - modMin) / 2;

  // Simplified THD calculation
  // In real PWM, THD depends on carrier frequency vs modulation frequency
  const frequencyRatio = config.carrierFrequency / (config.modulationFrequency || 1);
  const thd = frequencyRatio > 10 ? 100 / frequencyRatio : 100 / Math.sqrt(frequencyRatio);

  // Switching loss factor (proportional to frequency and transitions)
  let transitions = 0;
  for (let i = 1; i < pwmSignal.length; i++) {
    if (pwmSignal[i] !== pwmSignal[i - 1]) transitions++;
  }
  const switchingLossFactor = transitions / pwmSignal.length;

  return {
    effectiveDutyCycle,
    rippleAmplitude,
    fundamentalAmplitude,
    thd,
    switchingLossFactor,
  };
}

/**
 * Simple moving average for low-pass filtering
 */
function calculateMovingAverage(signal: number[], windowSize: number): number[] {
  const result: number[] = [];
  const halfWindow = Math.floor(windowSize / 2);

  for (let i = 0; i < signal.length; i++) {
    let sum = 0;
    let count = 0;

    for (let j = Math.max(0, i - halfWindow); j < Math.min(signal.length, i + halfWindow + 1); j++) {
      sum += signal[j];
      count++;
    }

    result.push(sum / count);
  }

  return result;
}

/**
 * Generate complementary PWM signals (for H-bridge)
 */
export function generateComplementaryPWM(
  config: PWMConfig,
  duration: number,
  sampleRate: number
): { high: number[]; low: number[]; time: number[] } {
  const primaryPWM = generatePWMSignal(config, duration, sampleRate);

  // Complementary signal is inverted with dead time
  const high = primaryPWM.pwmSignal;
  const low = high.map((v, i) => {
    // Add dead time logic
    if (config.deadTime && config.deadTime > 0) {
      const deadSamples = Math.floor(config.deadTime * sampleRate);
      // Check if within dead time of a transition
      for (let j = Math.max(0, i - deadSamples); j < Math.min(high.length, i + deadSamples); j++) {
        if (j !== i && high[j] !== high[i]) {
          return 0; // Both off during dead time
        }
      }
    }
    return 1 - v;
  });

  return {
    high,
    low,
    time: primaryPWM.time,
  };
}

/**
 * Calculate duty cycle from desired output voltage
 */
export function calculateDutyCycleForVoltage(
  desiredVoltage: number,
  supplyVoltage: number
): number {
  return Math.max(0, Math.min(1, desiredVoltage / supplyVoltage));
}

/**
 * Calculate effective voltage from duty cycle
 */
export function calculateEffectiveVoltage(
  dutyCycle: number,
  supplyVoltage: number
): number {
  return dutyCycle * supplyVoltage;
}

/**
 * Generate carrier waveforms for visualization
 */
export function generateCarrierWaveform(
  type: "sawtooth" | "triangle" | "sine",
  frequency: number,
  duration: number,
  sampleRate: number
): { time: number[]; signal: number[] } {
  const numSamples = Math.floor(duration * sampleRate);
  const time: number[] = [];
  const signal: number[] = [];

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    time.push(t);

    const phase = (frequency * t) % 1;
    let value: number;

    switch (type) {
      case "sawtooth":
        value = phase;
        break;
      case "triangle":
        value = phase < 0.5 ? 2 * phase : 2 * (1 - phase);
        break;
      case "sine":
        value = 0.5 + 0.5 * Math.sin(2 * Math.PI * phase);
        break;
      default:
        value = phase;
    }

    signal.push(value);
  }

  return { time, signal };
}
