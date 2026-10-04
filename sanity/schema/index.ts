import { callSheet } from "./callSheet";
import { casting } from "./casting";
import { person } from "./person";
import { production } from "./production";
import { role } from "./role";
import { scene } from "./scene";
import { workflowTransition } from "./workflowTransition";

export const schemaTypes = [
  person,
  production,
  scene,
  role,
  casting,
  callSheet,
  workflowTransition,
];
