import { defineField, defineType } from "sanity";

export const casting = defineType({
  name: "casting",
  title: "Casting",
  type: "document",
  fields: [
    defineField({
      name: "person",
      type: "reference",
      to: [{ type: "person" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "role",
      type: "reference",
      to: [{ type: "role" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "date",
      type: "date",
      description: "The night this assignment holds. Separate from the call sheet.",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      person: "person.name",
      role: "role.characterName",
      date: "date",
    },
    prepare: ({ person, role, date }) => ({
      title: `${person ?? "Uncast"} → ${role ?? "role"}`,
      subtitle: date,
    }),
  },
});
