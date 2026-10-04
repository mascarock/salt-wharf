import { defineField } from "sanity";

export const PITCH_PATTERN = /^[A-G][#b]?(-?\d+)$/;

export const pitchSpanFields = [
  defineField({
    name: "low",
    title: "Low",
    type: "string",
    description: "Scientific pitch, e.g. G3.",
    validation: (rule) =>
      rule
        .required()
        .regex(PITCH_PATTERN, { name: "scientific pitch", invert: false }),
  }),
  defineField({
    name: "high",
    title: "High",
    type: "string",
    description: "Scientific pitch, e.g. C5.",
    validation: (rule) =>
      rule
        .required()
        .regex(PITCH_PATTERN, { name: "scientific pitch", invert: false }),
  }),
];
