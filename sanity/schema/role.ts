import { defineField, defineType } from "sanity";
import { SKILL_IDS, SKILL_LABELS } from "@/lib/skills";
import { pitchSpanFields } from "./pitch";

export const role = defineType({
  name: "role",
  title: "Role",
  type: "document",
  fields: [
    defineField({
      name: "characterName",
      title: "Character",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "production",
      type: "reference",
      to: [{ type: "production" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "scene",
      type: "reference",
      to: [{ type: "scene" }],
      description:
        "The scene that owns this track. Concurrent-scene coverage is computed from this edge, not from a covers list.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "requiredRange",
      title: "Required range",
      type: "object",
      fields: pitchSpanFields,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "requiredSkills",
      title: "Required skills",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: SKILL_IDS.map((id) => ({ title: SKILL_LABELS[id], value: id })),
        layout: "grid",
      },
      validation: (rule) => rule.unique(),
    }),
  ],
  preview: {
    select: {
      title: "characterName",
      scene: "scene.title",
      low: "requiredRange.low",
      high: "requiredRange.high",
    },
    prepare: ({ title, scene, low, high }) => ({
      title,
      subtitle: [scene, low && high ? `${low}–${high}` : null]
        .filter(Boolean)
        .join(" · "),
    }),
  },
});
