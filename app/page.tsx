import { Callboard } from "@/components/callboard";
import { buildBoardView } from "@/lib/board";
import { isFixtureMode, sanityHome } from "@/lib/env";
import { loadCompany } from "@/lib/load-company";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const company = await loadCompany();
  const board = buildBoardView(company);
  return (
    <Callboard
      board={board}
      source={{ ...sanityHome(), fixture: isFixtureMode() }}
    />
  );
}
