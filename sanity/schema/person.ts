import { defineField, defineType } from "sanity";
import { SKILL_IDS, SKILL_LABELS } from "@/lib/skills";
import { pitchSpanFields } from "./pitch";

export const person = defineType({
  name: "person",
  title: "Person",
  type: "document",
  fields: [
    defineField({
      name: "name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "vocalRange",
      title: "Vocal range",
      type: "object",
      description:
        "Measured span, not a fach label. Coverage asks whether this span contains a role's required span.",
      fields: pitchSpanFields,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "skills",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: SKILL_IDS.map((id) => ({ title: SKILL_LABELS[id], value: id })),
        layout: "grid",
      },
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: "unavailableDates",
      title: "Unavailable dates",
      type: "array",
      of: [{ type: "date" }],
      description: "Nights this person cannot be called. Coverage reads this list.",
    }),
  ],
  preview: {
    select: {
      title: "name",
      low: "vocalRange.low",
      high: "vocalRange.high",
    },
    prepare: ({ title, low, high }) => ({
      title,
      subtitle: low && high ? `${low}–${high}` : "Range missing",
    }),
  },
});
