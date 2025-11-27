/**
 * Filter Information and Descriptions
 * Educational content for users to understand different filter types
 */

export interface FilterInfo {
  name: string;
  description: string;
  characteristics: string[];
  useCases: string[];
  technicalDetails: string;
}

export const FILTER_TYPE_INFO: Record<
  "butterworth" | "chebyshev1" | "chebyshev2",
  FilterInfo
> = {
  butterworth: {
    name: "Butterworth Filter",
    description:
      "Maximally flat frequency response in the passband. No ripples makes it ideal for general-purpose applications.",
    characteristics: [
      "Maximally flat frequency response in passband",
      "Monotonic attenuation in stopband",
      "Moderate roll-off (-20 dB/decade per order)",
      "Good phase characteristics",
    ],
    useCases: [
      "General-purpose filtering without distortion",
      "Audio processing where amplitude accuracy matters",
      "Medical signals (ECG, EEG)",
      "Measurement instruments",
    ],
    technicalDetails:
      "Butterworth filter provides maximally flat response by placing poles on a circle in the s-plane. Phase distortion is minimal, but transient response may have slight overshoot.",
  },

  chebyshev1: {
    name: "Chebyshev Type I",
    description:
      "Steeper roll-off than Butterworth, but with equiripple in the passband. Provides better rejection of unwanted frequencies for the same order.",
    characteristics: [
      "Ripple in passband (0.5 dB by default)",
      "Monotonic attenuation in stopband",
      "Steep roll-off (-40+ dB/decade)",
      "Fast transient response",
    ],
    useCases: [
      "When steep roll-off is critical",
      "Separating closely-spaced frequency components",
      "Communication and radio systems",
      "When small ripples are acceptable",
    ],
    technicalDetails:
      "Type I uses Chebyshev polynomials to place poles on an ellipse. Passband ripples are traded for steeper roll-off. More ripple means steeper roll-off but higher distortion.",
  },

  chebyshev2: {
    name: "Chebyshev Type II",
    description:
      "Inverse Chebyshev with flat passband response and ripples in the stopband. Combines advantages of Butterworth and Chebyshev Type I.",
    characteristics: [
      "Flat frequency response in passband",
      "Ripple in stopband (40 dB by default)",
      "Steep roll-off with transmission zeros",
      "Lower phase distortion than Type I",
    ],
    useCases: [
      "When passband accuracy is important",
      "Rejecting specific frequencies (notch effect)",
      "Precision audio processing",
      "Scientific measurements",
    ],
    technicalDetails:
      "Type II places zeros on the imaginary axis to create notches in the frequency response. Provides flat passband like Butterworth, but with steeper roll-off thanks to transmission zeros.",
  },
};

export const FILTER_MODE_INFO: Record<
  "lowpass" | "highpass" | "bandpass" | "bandstop",
  {
    name: string;
    description: string;
    icon: string;
  }
> = {
  lowpass: {
    name: "Low-pass",
    description:
      "Passes frequencies below the cutoff frequency, attenuates higher frequencies. Used for noise removal and signal smoothing.",
    icon: "📉",
  },
  highpass: {
    name: "High-pass",
    description:
      "Passes frequencies above the cutoff frequency, attenuates lower frequencies. Removes DC offset and slow trends.",
    icon: "📈",
  },
  bandpass: {
    name: "Band-pass",
    description:
      "Passes a range of frequencies between two boundaries. Used to isolate a specific frequency band from the signal.",
    icon: "📊",
  },
  bandstop: {
    name: "Band-stop",
    description:
      "Attenuates a range of frequencies between two boundaries (notch filter). Removes unwanted frequencies, such as power line interference (50/60 Hz).",
    icon: "🚫",
  },
};

export function getFilterOrderAdvice(order: number): string {
  if (order === 1) {
    return "First order: Simple filter with -20 dB/decade roll-off. Minimal phase distortion.";
  } else if (order === 2) {
    return "Second order: Optimal balance between roll-off steepness (-40 dB/decade) and implementation complexity.";
  } else if (order <= 4) {
    return `${order}th order: Steep roll-off -${order * 20} dB/decade. Good performance, moderate delay.`;
  } else {
    return `${order}th order: Very steep roll-off -${order * 20} dB/decade. High selectivity, but increased delay and phase distortion.`;
  }
}
