import { defineArrayMember, defineField, defineType } from "sanity";
import { CALL_SHEET_STATUSES } from "@/lib/types";

export const callSheet = defineType({
  name: "callSheet",
  title: "Call sheet",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
      description: "House name for this revision, e.g. “4 Oct — Rosa cover”.",
    }),
    defineField({
      name: "production",
      type: "reference",
      to: [{ type: "production" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "performanceDate",
      title: "Performance date",
      type: "date",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "status",
      type: "string",
      options: {
        list: [
          { title: "Draft", value: "draft" },
          { title: "Stage manager review", value: "stageManagerReview" },
          { title: "Posted", value: "posted" },
          { title: "Struck", value: "struck" },
        ],
        layout: "radio",
      },
      initialValue: "draft",
      validation: (rule) =>
        rule.required().custom((value) => {
          if (
            value &&
            !(CALL_SHEET_STATUSES as readonly string[]).includes(value)
          ) {
            return "Unknown status.";
          }
          return true;
        }),
    }),
    defineField({
      name: "supersedes",
      type: "reference",
      to: [{ type: "callSheet" }],
      description:
        "The earlier sheet this revision replaces. The public board only hides a sheet when another posted sheet for the same date points here.",
    }),
    defineField({
      name: "items",
      title: "Called",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "callItem",
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
              name: "callTime",
              title: "Call time",
              type: "string",
              description: "Door time, 24-hour, e.g. 18:00.",
              validation: (rule) =>
                rule.required().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
            }),
            defineField({
              name: "note",
              type: "string",
              description: "Optional house note such as “cover”. Not a covers list.",
            }),
          ],
          preview: {
            select: {
              person: "person.name",
              role: "role.characterName",
              callTime: "callTime",
              note: "note",
            },
            prepare: ({ person, role, callTime, note }) => ({
              title: `${callTime ?? "—"}  ${person ?? "Unnamed"}`,
              subtitle: [role, note].filter(Boolean).join(" · "),
            }),
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "title",
      date: "performanceDate",
      status: "status",
    },
    prepare: ({ title, date, status }) => ({
      title: title || date || "Call sheet",
      subtitle: [date, status].filter(Boolean).join(" · "),
    }),
  },
});
