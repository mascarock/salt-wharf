import { definePlugin } from "sanity";
import { CallboardTool } from "./tools/callboard-tool";

export const callboardPlugin = definePlugin({
  name: "salt-wharf-callboard",
  tools: [
    {
      name: "callboard",
      title: "Callboard",
      component: CallboardTool,
    },
  ],
});
