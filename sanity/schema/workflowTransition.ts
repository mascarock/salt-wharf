import { defineField, defineType } from "sanity";
import { isLegalTransition, type CallSheetStatus } from "@/lib/types";

export const workflowTransition = defineType({
  name: "workflowTransition",
  title: "Workflow transition",
  type: "document",
  fields: [
    defineField({
      name: "callSheet",
      type: "reference",
      to: [{ type: "callSheet" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "fromStatus",
      title: "From",
      type: "string",
      options: {
        list: [
          { title: "Draft", value: "draft" },
          { title: "Stage manager review", value: "stageManagerReview" },
          { title: "Posted", value: "posted" },
          { title: "Struck", value: "struck" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "toStatus",
      title: "To",
      type: "string",
      options: {
        list: [
          { title: "Draft", value: "draft" },
          { title: "Stage manager review", value: "stageManagerReview" },
          { title: "Posted", value: "posted" },
          { title: "Struck", value: "struck" },
        ],
      },
      validation: (rule) =>
        rule.required().custom((toStatus, context) => {
          const fromStatus = (context.document as { fromStatus?: string } | undefined)
            ?.fromStatus;
          if (!fromStatus || !toStatus) return true;
          if (
            !isLegalTransition(
              fromStatus as CallSheetStatus,
              toStatus as CallSheetStatus,
            )
          ) {
            return "Only draft→review→posted→struck, or posted→draft with a reason.";
          }
          return true;
        }),
    }),
    defineField({
      name: "actorName",
      title: "Actor",
      type: "string",
      description: "Who moved the sheet. A person, not a boolean.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "at",
      title: "At",
      type: "datetime",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "note",
      type: "text",
      rows: 3,
      validation: (rule) =>
        rule.custom((note, context) => {
          const doc = context.document as
            | { fromStatus?: string; toStatus?: string }
            | undefined;
          if (doc?.fromStatus === "posted" && doc?.toStatus === "draft") {
            return note?.trim()
              ? true
              : "A posted sheet can only return to draft with a written reason.";
          }
          return true;
        }),
    }),
  ],
  preview: {
    select: {
      fromStatus: "fromStatus",
      toStatus: "toStatus",
      actorName: "actorName",
      at: "at",
    },
    prepare: ({ fromStatus, toStatus, actorName, at }) => ({
      title: `${fromStatus ?? "?"} → ${toStatus ?? "?"}`,
      subtitle: [actorName, at].filter(Boolean).join(" · "),
    }),
  },
});
