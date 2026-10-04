const NATURAL: Record<string, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};

const PITCH_RE = /^([A-Ga-g])([#b]?)(-?\d+)$/;

export function parsePitch(pitch: string): { letter: string; accidental: string; octave: number } {
  const match = pitch.trim().match(PITCH_RE);
  if (!match) {
    throw new Error(`Invalid scientific pitch: ${pitch}`);
  }
  return {
    letter: match[1].toUpperCase(),
    accidental: match[2] ?? "",
    octave: Number(match[3]),
  };
}

/** Middle C (C4) is MIDI 60. */
export function pitchToMidi(pitch: string): number {
  const { letter, accidental, octave } = parsePitch(pitch);
  let semitone = NATURAL[letter];
  if (semitone === undefined) {
    throw new Error(`Invalid scientific pitch: ${pitch}`);
  }
  if (accidental === "#") semitone += 1;
  if (accidental === "b") semitone -= 1;
  return (octave + 1) * 12 + semitone;
}

export function isValidPitch(pitch: string): boolean {
  try {
    pitchToMidi(pitch);
    return true;
  } catch {
    return false;
  }
}

export function rangeContains(
  person: { low: string; high: string },
  required: { low: string; high: string },
): boolean {
  return (
    pitchToMidi(person.low) <= pitchToMidi(required.low) &&
    pitchToMidi(person.high) >= pitchToMidi(required.high)
  );
}

export function formatRange(range: { low: string; high: string }): string {
  return `${range.low}–${range.high}`;
}
