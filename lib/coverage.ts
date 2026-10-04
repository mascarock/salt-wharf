import { concurrentSceneIds, getDoc, type Company } from "./company";
import { rangeContains } from "./pitch";
import type {
  CallSheetDoc,
  CoverFailReason,
  CoverTrace,
  PersonDoc,
  RoleDoc,
} from "./types";

function skillsSuperset(person: PersonDoc, role: RoleDoc): boolean {
  const have = new Set(person.skills);
  return role.requiredSkills.every((skill) => have.has(skill));
}

function isUnavailable(person: PersonDoc, date: string): boolean {
  return (person.unavailableDates ?? []).includes(date);
}

function scenesHeldThatNight(
  company: Company,
  personId: string,
  date: string,
  callSheet: CallSheetDoc | null,
): Set<string> {
  const scenes = new Set<string>();
  for (const casting of company.castings) {
    if (casting.date !== date || casting.person._ref !== personId) {
      continue;
    }
    const role = getDoc<RoleDoc>(company, casting.role._ref);
    if (role) {
      scenes.add(role.scene._ref);
    }
  }
  if (callSheet) {
    for (const item of callSheet.items) {
      if (item.person._ref !== personId) {
        continue;
      }
      const role = getDoc<RoleDoc>(company, item.role._ref);
      if (role) {
        scenes.add(role.scene._ref);
      }
    }
  }
  return scenes;
}

function otherRolesCalledThatNight(
  personId: string,
  roleId: string,
  callSheet: CallSheetDoc | null,
): number {
  if (!callSheet) {
    return 0;
  }
  return callSheet.items.filter(
    (item) => item.person._ref === personId && item.role._ref !== roleId,
  ).length;
}

/**
 * Coverage is a pure function of structured constraints.
 * Nothing in the dataset is stored as “this person covers that role”.
 *
 * Predicates are checked in the order the callboard prints:
 * range, skill, concurrent scene, date, already covering.
 */
export function coverageTrace(
  person: PersonDoc,
  role: RoleDoc,
  date: string,
  company: Company,
  callSheet: CallSheetDoc | null,
): CoverTrace {
  const fail = (reason: CoverFailReason): CoverTrace => ({
    personId: person._id,
    personName: person.name,
    canCover: false,
    failedPredicate: reason,
  });

  if (!rangeContains(person.vocalRange, role.requiredRange)) {
    return fail("range");
  }
  if (!skillsSuperset(person, role)) {
    return fail("skill");
  }

  const roleScene = getDoc(company, role.scene._ref);
  if (roleScene && roleScene._type === "scene") {
    const blocked = concurrentSceneIds(roleScene, company.scenes);
    const held = scenesHeldThatNight(company, person._id, date, callSheet);
    for (const sceneId of held) {
      if (blocked.has(sceneId)) {
        return fail("concurrent scene");
      }
    }
  }

  if (isUnavailable(person, date)) {
    return fail("date");
  }

  if (otherRolesCalledThatNight(person._id, role._id, callSheet) >= 2) {
    return fail("already covering");
  }

  return {
    personId: person._id,
    personName: person.name,
    canCover: true,
  };
}

export function findCoverage(
  role: RoleDoc,
  date: string,
  company: Company,
  callSheet: CallSheetDoc | null,
): CoverTrace[] {
  return company.people
    .map((person) => coverageTrace(person, role, date, company, callSheet))
    .sort((a, b) => {
      if (a.canCover !== b.canCover) {
        return a.canCover ? -1 : 1;
      }
      return a.personName.localeCompare(b.personName);
    });
}
