import { useQuery } from "@tanstack/react-query";

import { Games, GamesSettingsDto } from "../../api/queries/testCase";
import { gamesControllerSettingsOptions } from "../../api/queries/testCase/@tanstack/react-query.gen";
import { client } from "../../api/client";
import { dayjs } from "../../common/dayjs";

export function getGameStatus(game: Games, gameSettings: GamesSettingsDto, now: Date) {
  const alreadyFinished = dayjs(game.finishingAt).toDate() < now;
  const isPlaying = !alreadyFinished && dayjs(game.startingAt).toDate() < now;

  const startingNext =
    !alreadyFinished &&
    dayjs(game.startingAt).subtract(gameSettings!.cooldown, "seconds").toDate() < now;

  return { alreadyFinished, isPlaying, startingNext };
}

export function useGameSettings() {
  return useQuery({
    ...gamesControllerSettingsOptions({ client }),
    refetchOnMount: false,
  });
}

export function remainsTime(date1: Date, date2: Date) {
  return dayjs(date1).diff(dayjs(date2), "seconds");
}
