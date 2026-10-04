import { defineField, defineType } from "sanity";

export const scene = defineType({
  name: "scene",
  title: "Scene",
  type: "document",
  fields: [
    defineField({
      name: "title",
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
      name: "order",
      type: "number",
      description: "Running order in the book, not a clock time.",
      validation: (rule) => rule.required().integer().min(1),
    }),
    defineField({
      name: "runsConcurrentWith",
      title: "Runs concurrent with",
      type: "array",
      of: [
        {
          type: "reference",
          to: [{ type: "scene" }],
          options: { disableNew: true },
        },
      ],
      description:
        "Other scenes on stage at the same time. A person cast in one of these cannot cover a role here. Store both directions if you can; the app also walks the reverse edge.",
      validation: (rule) => rule.unique(),
    }),
  ],
  orderings: [
    {
      title: "Running order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      order: "order",
      production: "production.title",
    },
    prepare: ({ title, order, production }) => ({
      title: `${order ?? "—"}. ${title ?? "Untitled scene"}`,
      subtitle: production,
    }),
  },
});
