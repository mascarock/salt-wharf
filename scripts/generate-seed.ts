import { writeFile } from "node:fs/promises";
import path from "node:path";
import { ref, type CompanyDoc } from "../lib/types";

const PRODUCTION = "production-lastLuzzu";
const DATE = "2026-10-04";
const NEXT = "2026-10-05";

function person(
  id: string,
  name: string,
  low: string,
  high: string,
  skills: string[],
  unavailableDates: string[] = [],
): CompanyDoc {
  return {
    _id: id,
    _type: "person",
    name,
    vocalRange: { low, high },
    skills,
    unavailableDates,
  };
}

function scene(
  id: string,
  title: string,
  order: number,
  concurrent: string[] = [],
): CompanyDoc {
  return {
    _id: id,
    _type: "scene",
    title,
    order,
    production: ref(PRODUCTION),
    runsConcurrentWith: concurrent.map(ref),
  };
}

function role(
  id: string,
  characterName: string,
  sceneId: string,
  low: string,
  high: string,
  requiredSkills: string[],
): CompanyDoc {
  return {
    _id: id,
    _type: "role",
    characterName,
    production: ref(PRODUCTION),
    scene: ref(sceneId),
    requiredRange: { low, high },
    requiredSkills,
  };
}

function casting(id: string, personId: string, roleId: string, date: string): CompanyDoc {
  return {
    _id: id,
    _type: "casting",
    person: ref(personId),
    role: ref(roleId),
    date,
  };
}

function item(
  key: string,
  personId: string,
  roleId: string,
  callTime: string,
  note?: string,
) {
  return {
    _key: key,
    person: ref(personId),
    role: ref(roleId),
    callTime,
    ...(note ? { note } : {}),
  };
}

function transition(
  id: string,
  sheetId: string,
  fromStatus: "draft" | "stageManagerReview" | "posted" | "struck",
  toStatus: "draft" | "stageManagerReview" | "posted" | "struck",
  at: string,
  note: string,
): CompanyDoc {
  return {
    _id: id,
    _type: "workflowTransition",
    callSheet: ref(sheetId),
    fromStatus,
    toStatus,
    actorName: "Elena Cassar",
    at,
    note,
  };
}

const documents: CompanyDoc[] = [
  {
    _id: PRODUCTION,
    _type: "production",
    title: "The Last Luzzu",
    companyName: "Salt Wharf",
    venue: "The Salt Stores, Valletta",
    season: "Autumn 2026",
    techWeekStart: "2026-10-01",
    synopsis:
      "On the night the Grand Harbour closes their berth, a Valletta fishing family take the last painted luzzu out and try to remember the colours.",
  },
  person(
    "person-maraCamilleri",
    "Mara Camilleri",
    "G3",
    "C6",
    ["lead", "maltese-dialect", "high-belt", "dance"],
    [DATE],
  ),
  person("person-linaBorg", "Lina Borg", "F3", "C6", [
    "lead",
    "maltese-dialect",
    "high-belt",
    "dance",
  ]),
  person("person-toniVella", "Toni Vella", "E2", "G4", [
    "lead",
    "maltese-dialect",
    "high-belt",
    "boat-work",
  ]),
  person("person-pawluGalea", "Pawlu Galea", "E3", "C6", [
    "lead",
    "maltese-dialect",
    "high-belt",
    "character",
  ]),
  person("person-josephSpiteri", "Joseph Spiteri", "A2", "F4", [
    "lead",
    "character",
    "maltese-dialect",
  ]),
  person("person-ninaXuereb", "Nina Xuereb", "E3", "A5", [
    "lead",
    "maltese-dialect",
    "character",
  ]),
  person("person-sofiaMicallef", "Sofia Micallef", "G3", "C6", [
    "lead",
    "maltese-dialect",
    "high-belt",
    "ensemble",
  ]),
  person("person-ritaAzzopardi", "Rita Azzopardi", "F3", "A5", [
    "ensemble",
    "dance",
  ]),
  scene("scene-prologue", "Salt on the Stones", 1),
  scene("scene-kitchen", "The Kitchen", 2, ["scene-harbour"]),
  scene("scene-harbour", "The Harbour Office", 3, ["scene-kitchen"]),
  scene("scene-market", "The Market", 4),
  scene("scene-belowDeck", "Below Deck", 5),
  scene("scene-chapel", "The Chapel", 6),
  scene("scene-storm", "The Storm", 7),
  scene("scene-argument", "The Argument", 8),
  scene("scene-lastLuzzu", "The Last Luzzu", 9),
  scene("scene-epilogue", "After the Berth", 10),
  role("role-rosa", "Rosa", "scene-kitchen", "G3", "C5", [
    "lead",
    "maltese-dialect",
    "high-belt",
  ]),
  role("role-ninu", "Ninu", "scene-prologue", "A2", "E4", [
    "lead",
    "character",
    "maltese-dialect",
  ]),
  role("role-carmen", "Carmen", "scene-kitchen", "E3", "A5", [
    "lead",
    "maltese-dialect",
  ]),
  role("role-clerk", "Clerk", "scene-harbour", "D3", "A4", [
    "character",
    "maltese-dialect",
  ]),
  role("role-fisherman", "Fisherman", "scene-belowDeck", "E2", "F4", [
    "boat-work",
    "maltese-dialect",
  ]),
  role("role-marketSeller", "Market seller", "scene-market", "A3", "G5", [
    "ensemble",
  ]),
  role("role-chapelWoman", "Chapel woman", "scene-chapel", "F3", "A5", [
    "ensemble",
  ]),
  role("role-epilogueVoice", "Epilogue voice", "scene-epilogue", "G3", "C5", [
    "ensemble",
    "lead",
  ]),
  casting("casting-oct4-mara-rosa", "person-maraCamilleri", "role-rosa", DATE),
  casting("casting-oct4-joseph-ninu", "person-josephSpiteri", "role-ninu", DATE),
  casting("casting-oct4-nina-carmen", "person-ninaXuereb", "role-carmen", DATE),
  casting("casting-oct4-pawlu-clerk", "person-pawluGalea", "role-clerk", DATE),
  casting("casting-oct4-toni-fisherman", "person-toniVella", "role-fisherman", DATE),
  casting(
    "casting-oct4-sofia-market",
    "person-sofiaMicallef",
    "role-marketSeller",
    DATE,
  ),
  casting(
    "casting-oct4-sofia-epilogue",
    "person-sofiaMicallef",
    "role-epilogueVoice",
    DATE,
  ),
  casting(
    "casting-oct4-rita-chapel",
    "person-ritaAzzopardi",
    "role-chapelWoman",
    DATE,
  ),
  casting("casting-oct5-mara-rosa", "person-maraCamilleri", "role-rosa", NEXT),
  casting("casting-oct5-joseph-ninu", "person-josephSpiteri", "role-ninu", NEXT),
  casting("casting-oct5-nina-carmen", "person-ninaXuereb", "role-carmen", NEXT),
  casting("casting-oct5-pawlu-clerk", "person-pawluGalea", "role-clerk", NEXT),
  casting("casting-oct5-toni-fisherman", "person-toniVella", "role-fisherman", NEXT),
  casting(
    "casting-oct5-sofia-market",
    "person-sofiaMicallef",
    "role-marketSeller",
    NEXT,
  ),
  casting(
    "casting-oct5-sofia-epilogue",
    "person-sofiaMicallef",
    "role-epilogueVoice",
    NEXT,
  ),
  casting(
    "casting-oct5-rita-chapel",
    "person-ritaAzzopardi",
    "role-chapelWoman",
    NEXT,
  ),
  {
    _id: "callSheet-oct4-v1",
    _type: "callSheet",
    title: "4 Oct — first posting",
    production: ref(PRODUCTION),
    performanceDate: DATE,
    status: "posted",
    items: [
      item("ninu", "person-josephSpiteri", "role-ninu", "17:30"),
      item("rosa", "person-maraCamilleri", "role-rosa", "18:00"),
      item("carmen", "person-ninaXuereb", "role-carmen", "18:00"),
      item("clerk", "person-pawluGalea", "role-clerk", "18:00"),
      item("fisherman", "person-toniVella", "role-fisherman", "18:45"),
      item("market", "person-sofiaMicallef", "role-marketSeller", "19:00"),
      item("chapel", "person-ritaAzzopardi", "role-chapelWoman", "19:15"),
      item("epilogue", "person-sofiaMicallef", "role-epilogueVoice", "20:30"),
    ],
  },
  {
    _id: "callSheet-oct4-v2",
    _type: "callSheet",
    title: "4 Oct — Rosa cover",
    production: ref(PRODUCTION),
    performanceDate: DATE,
    status: "posted",
    supersedes: ref("callSheet-oct4-v1"),
    items: [
      item("ninu", "person-josephSpiteri", "role-ninu", "17:30"),
      item("rosa", "person-linaBorg", "role-rosa", "18:00", "cover"),
      item("carmen", "person-ninaXuereb", "role-carmen", "18:00"),
      item("clerk", "person-pawluGalea", "role-clerk", "18:00"),
      item("fisherman", "person-toniVella", "role-fisherman", "18:45"),
      item("market", "person-sofiaMicallef", "role-marketSeller", "19:00"),
      item("chapel", "person-ritaAzzopardi", "role-chapelWoman", "19:15"),
      item("epilogue", "person-sofiaMicallef", "role-epilogueVoice", "20:30"),
    ],
  },
  {
    _id: "callSheet-oct5-draft",
    _type: "callSheet",
    title: "5 Oct — second tech",
    production: ref(PRODUCTION),
    performanceDate: NEXT,
    status: "draft",
    items: [
      item("ninu", "person-josephSpiteri", "role-ninu", "17:30"),
      item("rosa", "person-maraCamilleri", "role-rosa", "18:00"),
      item("carmen", "person-ninaXuereb", "role-carmen", "18:00"),
      item("clerk", "person-pawluGalea", "role-clerk", "18:00"),
      item("fisherman", "person-toniVella", "role-fisherman", "18:45"),
      item("market", "person-sofiaMicallef", "role-marketSeller", "19:00"),
      item("chapel", "person-ritaAzzopardi", "role-chapelWoman", "19:15"),
      item("epilogue", "person-sofiaMicallef", "role-epilogueVoice", "20:30"),
    ],
  },
  transition(
    "transition-oct4-v1-review",
    "callSheet-oct4-v1",
    "draft",
    "stageManagerReview",
    "2026-10-04T11:10:00.000Z",
    "First tech Tuesday book, ready for the door.",
  ),
  transition(
    "transition-oct4-v1-posted",
    "callSheet-oct4-v1",
    "stageManagerReview",
    "posted",
    "2026-10-04T12:02:00.000Z",
    "Posted to the stage door.",
  ),
  transition(
    "transition-oct4-v2-review",
    "callSheet-oct4-v2",
    "draft",
    "stageManagerReview",
    "2026-10-04T14:20:00.000Z",
    "Camilleri out. Borg on Rosa. Sheet supersedes the noon posting.",
  ),
  transition(
    "transition-oct4-v2-posted",
    "callSheet-oct4-v2",
    "stageManagerReview",
    "posted",
    "2026-10-04T14:40:00.000Z",
    "Cover posted. The first sheet still names Camilleri; this one replaces it.",
  ),
];

async function main() {
  const file = path.join(process.cwd(), "sanity", "seed.ndjson");
  const body = documents.map((doc) => JSON.stringify(doc)).join("\n") + "\n";
  await writeFile(file, body, "utf8");
  console.log(`Wrote ${documents.length} documents to ${file}`);
}

main();
