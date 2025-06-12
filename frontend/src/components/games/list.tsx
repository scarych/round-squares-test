import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Alert, Box, Text, Container, Skeleton, Stack, Spacer } from "@chakra-ui/react";
import { Link } from "react-router";

import { gamesControllerGamesListOptions } from "../../api/queries/testCase/@tanstack/react-query.gen";
import { Games, GamesSettingsDto } from "../../api/queries/testCase";
import { client } from "../../api/client";
import { useCurrentTime } from "../../state";
import { getGameStatus, useGameSettings } from "./functions";
import { dayjs } from "../../common/dayjs";
import { useSocket } from "../../common/use-socket";
import { TimeBeforeEnd, TimeBeforeStart } from "./texts";

export function GamesList() {
  const { current: socket } = useSocket();
  const { data: gameSettings } = useGameSettings();

  const gamesList = useQuery({
    ...gamesControllerGamesListOptions({ client }),
    retry: false,
  });

  useEffect(() => {
    console.log("gameSettings", gameSettings);
    const { socketRoomName } = gameSettings!;
    const onNotification = () => {
      gamesList.refetch();
    };

    if (socket?.connected) {
      console.log("do something with socket", socket);
      socket.emit("join_room", { room: socketRoomName });
      socket.on("notification", onNotification);
    }

    return () => {
      socket?.emit("leave_room", { room: socketRoomName });
      socket?.off("notification", onNotification);
    };
  }, [socket?.connected]);

  const { now } = useCurrentTime();

  return gamesList.isSuccess ? (
    <Container my={5} p={0}>
      {!gamesList.data.length && (
        <Alert.Root status={"error"}>
          <Alert.Content textAlign={"center"}>
            <Alert.Title>Игр нет</Alert.Title>
          </Alert.Content>
        </Alert.Root>
      )}

      {gamesList.data.map((game) => {
        return (
          <MemoGameListCard game={game} currentTime={now} settings={gameSettings!} key={game.id} />
        );
      })}
    </Container>
  ) : (
    <GamesSkeleton />
  );
}

export function GamesSkeleton() {
  const numbers = 5;

  return (
    <Box>
      {Array.from(" ".repeat(numbers)).map((_value, index) => {
        return (
          <Stack flex="1" key={index} my={3}>
            <Skeleton height="5" />
            <Skeleton height="5" width="80%" />
          </Stack>
        );
      })}
    </Box>
  );
}

declare type GameCardProps = { settings: GamesSettingsDto; game: Games; currentTime: Date };

export function GameListCard(data: GameCardProps) {
  const { game, currentTime, settings } = data;

  const gameStatus = getGameStatus(game, settings!, currentTime);

  return (
    <Link to={game.id}>
      <Box m={2} shadow={"md"} p={5}>
        <Box>
          <Text>{game.id}</Text>
          <Spacer p={2} />

          {gameStatus.isPlaying && (
            <>
              <Text>{`Игра началась ${dayjs(new Date(game.startingAt)).format("L LTS")}`}</Text>
              <TimeBeforeEnd game={game} time={currentTime} />
            </>
          )}

          {!gameStatus.isPlaying && !gameStatus.alreadyFinished && (
            <Text>{`Игра начнется ${dayjs(new Date(game.startingAt)).format("L LTS")}`}</Text>
          )}

          {!gameStatus.isPlaying && gameStatus.startingNext && (
            <TimeBeforeStart game={game} time={currentTime} />
          )}
          {gameStatus.alreadyFinished && (
            <Text>{`Игра завершилась ${dayjs(new Date(game.finishingAt)).format("L LTS")}`}</Text>
          )}
        </Box>
      </Box>
    </Link>
  );
}

function getDisplayState(game: Games, settings: GamesSettingsDto, currentTime: Date) {
  const gameStatus = getGameStatus(game, settings!, currentTime);
  return gameStatus;
}

export const MemoGameListCard = React.memo(
  GameListCard,
  (prev: GameCardProps, next: GameCardProps) => {
    const prevState = getDisplayState(prev.game, prev.settings, prev.currentTime);
    const nextState = getDisplayState(next.game, next.settings, next.currentTime);
    // предыдущее состояние компоненты изменилось, и должно быть обновлено
    return !(
      nextState.startingNext || //если оно стартует следующим
      nextState.isPlaying || //прямо сейчас играется
      (!prevState.alreadyFinished && nextState.alreadyFinished) // или только что завершилось
    );
  }
);
