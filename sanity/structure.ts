import type { StructureResolver } from "sanity/structure";

const STATUSES = [
  { title: "Draft", value: "draft" },
  { title: "Stage manager review", value: "stageManagerReview" },
  { title: "Posted", value: "posted" },
  { title: "Struck", value: "struck" },
] as const;

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Salt Wharf")
    .items([
      S.listItem()
        .title("Call sheets")
        .child(
          S.list()
            .title("Call sheets")
            .items([
              S.listItem()
                .title("All sheets")
                .child(
                  S.documentTypeList("callSheet").title("All call sheets"),
                ),
              S.divider(),
              ...STATUSES.map((status) =>
                S.listItem()
                  .title(status.title)
                  .child(
                    S.documentList()
                      .title(status.title)
                      .filter('_type == "callSheet" && status == $status')
                      .params({ status: status.value }),
                  ),
              ),
            ]),
        ),
      S.listItem()
        .title("The Last Luzzu")
        .child(
          S.list()
            .title("The Last Luzzu")
            .items([
              S.documentListItem()
                .id("production-lastLuzzu")
                .schemaType("production")
                .title("Production"),
              S.listItem()
                .title("Scenes")
                .child(
                  S.documentList()
                    .title("Scenes")
                    .filter(
                      '_type == "scene" && production._ref == "production-lastLuzzu"',
                    )
                    .defaultOrdering([{ field: "order", direction: "asc" }]),
                ),
              S.listItem()
                .title("Roles")
                .child(
                  S.documentList()
                    .title("Roles")
                    .filter(
                      '_type == "role" && production._ref == "production-lastLuzzu"',
                    ),
                ),
              S.listItem()
                .title("Casting")
                .child(
                  S.documentList()
                    .title("Casting")
                    .filter('_type == "casting"'),
                ),
            ]),
        ),
      S.documentTypeListItem("person").title("Company"),
      S.divider(),
      S.documentTypeListItem("workflowTransition").title("Transitions"),
    ]);
