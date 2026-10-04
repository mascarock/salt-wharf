import { defineField, defineType } from "sanity";

export const production = defineType({
  name: "production",
  title: "Production",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "companyName",
      title: "Company",
      type: "string",
      initialValue: "Salt Wharf",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "venue", type: "string" }),
    defineField({ name: "season", type: "string" }),
    defineField({ name: "techWeekStart", title: "Tech week start", type: "date" }),
    defineField({ name: "synopsis", type: "text", rows: 4 }),
  ],
  preview: {
    select: { title: "title", subtitle: "venue" },
  },
});
