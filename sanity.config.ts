"use client";

import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { callboardPlugin } from "./sanity/plugin";
import { schemaTypes } from "./sanity/schema";
import { structure } from "./sanity/structure";

const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
  process.env.SANITY_PROJECT_ID ||
  "ebwymj6z";
const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET ||
  process.env.SANITY_DATASET ||
  "production";

export default defineConfig({
  name: "salt-wharf",
  title: "Salt Wharf",
  projectId,
  dataset,
  basePath: "/studio",
  plugins: [
    structureTool({ structure }),
    callboardPlugin(),
    visionTool({ defaultApiVersion: "2026-10-01" }),
  ],
  schema: {
    types: schemaTypes,
  },
});
