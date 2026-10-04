import type {
  CallSheetDoc,
  CastingDoc,
  CompanyDoc,
  PersonDoc,
  ProductionDoc,
  RoleDoc,
  SceneDoc,
  WorkflowTransitionDoc,
} from "./types";

export type Company = {
  documents: CompanyDoc[];
  people: PersonDoc[];
  productions: ProductionDoc[];
  scenes: SceneDoc[];
  roles: RoleDoc[];
  castings: CastingDoc[];
  callSheets: CallSheetDoc[];
  transitions: WorkflowTransitionDoc[];
  byId: Map<string, CompanyDoc>;
};

export function indexCompany(documents: CompanyDoc[]): Company {
  const byId = new Map<string, CompanyDoc>();
  for (const doc of documents) {
    byId.set(doc._id, doc);
  }
  return {
    documents,
    people: documents.filter((doc): doc is PersonDoc => doc._type === "person"),
    productions: documents.filter(
      (doc): doc is ProductionDoc => doc._type === "production",
    ),
    scenes: documents.filter((doc): doc is SceneDoc => doc._type === "scene"),
    roles: documents.filter((doc): doc is RoleDoc => doc._type === "role"),
    castings: documents.filter(
      (doc): doc is CastingDoc => doc._type === "casting",
    ),
    callSheets: documents.filter(
      (doc): doc is CallSheetDoc => doc._type === "callSheet",
    ),
    transitions: documents.filter(
      (doc): doc is WorkflowTransitionDoc => doc._type === "workflowTransition",
    ),
    byId,
  };
}

export function getDoc<T extends CompanyDoc>(
  company: Company,
  id: string | undefined,
): T | undefined {
  if (!id) return undefined;
  return company.byId.get(id) as T | undefined;
}

export function concurrentSceneIds(
  scene: SceneDoc,
  allScenes: SceneDoc[],
): Set<string> {
  const ids = new Set<string>();
  for (const other of scene.runsConcurrentWith ?? []) {
    ids.add(other._ref);
  }
  for (const candidate of allScenes) {
    if (candidate.runsConcurrentWith?.some((ref) => ref._ref === scene._id)) {
      ids.add(candidate._id);
    }
  }
  ids.delete(scene._id);
  return ids;
}

export function roleScene(company: Company, role: RoleDoc): SceneDoc | undefined {
  return getDoc<SceneDoc>(company, role.scene._ref);
}
