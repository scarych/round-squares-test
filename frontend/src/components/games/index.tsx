import { Route, Routes } from "react-router";

import { GamesList } from "./list";
import { Game } from "./game";
import { useGameSettings } from "./functions";

export function Games() {
  const gamesSettings = useGameSettings();

  return gamesSettings.isSuccess ? (
    <Routes>
      <Route index element={<GamesList />} />
      <Route path=":gameId" element={<Game />} />
    </Routes>
  ) : null;
}
