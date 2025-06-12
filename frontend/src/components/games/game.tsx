import { useCallback, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Image,
  Spacer,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Link, useParams } from "react-router";
import DuckImage from "../../assets/duck.svg";

import {
  gamesControllerGetGameByIdOptions,
  gamesControllerPointGameMutation,
} from "../../api/queries/testCase/@tanstack/react-query.gen";

import { client } from "../../api/client";
import { useGameSettings, getGameStatus } from "./functions";
import { dayjs } from "../../common/dayjs";
import { useCurrentTime } from "../../state";
import { TimeBeforeEnd, TimeBeforeStart } from "./texts";

export function Game() {
  const params = useParams();
  const path = { id: String(params.gameId) };
  const { data: gamesSettings } = useGameSettings();

  const { now } = useCurrentTime();

  const gameInfo = useQuery({
    ...gamesControllerGetGameByIdOptions({ client, path }),
    retry: false,
    retryOnMount: false,
  });

  const [myPoints, setMyPoints] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  const increaseMyPoints = useCallback(
    (newPoints: number) => {
      setMyPoints(Math.max(myPoints, newPoints));
    },
    [myPoints]
  );

  const gamePointQuery = useMutation({
    ...gamesControllerPointGameMutation({ client }),
    onSuccess(result) {
      increaseMyPoints(result.totalPoints);
    },
    onError(error) {
      setErrorMessage(error.message);
    },
  });

  const clickImageHandler = useCallback(() => {
    gamePointQuery.mutate({ path });
  }, []);

  if (gameInfo.isLoading) {
    return (
      <VStack>
        <Spinner m={10} />
      </VStack>
    );
  }

  if (gameInfo.isError) {
    return <GameNotFound />;
  }

  if (gameInfo.isSuccess) {
    const { game } = gameInfo.data;

    const gameStatus = getGameStatus(game, gamesSettings!, now);

    // setMyPoints(gameInfo.data.myStats?.totalPoints!);

    return (
      <Box w={"full"} p={5} textAlign={"center"}>
        {errorMessage && (
          <Alert.Root status={"error"}>
            <Alert.Content>
              <Alert.Title>Ошибка</Alert.Title>
              <Alert.Description>{errorMessage}</Alert.Description>
            </Alert.Content>
          </Alert.Root>
        )}

        {!gameStatus.isPlaying && gameStatus.startingNext && (
          <Box>
            <TimeBeforeStart game={game} time={now} />
          </Box>
        )}
        {gameStatus.isPlaying && (
          <Box>
            <TimeBeforeEnd game={game} time={now} />
          </Box>
        )}

        <Box cursor={gameStatus.isPlaying ? "pointer" : "disabled"} m={5}>
          <Image
            src={DuckImage}
            width={"xs"}
            mx="auto"
            opacity={gameStatus.isPlaying ? 1 : 0.2}
            onClick={gameStatus.isPlaying ? clickImageHandler : undefined}
          />
        </Box>
        {gameStatus.alreadyFinished && (
          <Box>
            <Text fontSize={"xl"}>
              Игра завершилась {dayjs(new Date(game.finishingAt)).format("L LTS")}
            </Text>
            <Spacer h={5} />
            <Box alignSelf={"center"} w="full">
              <Flex gap={5} justify={"center"}>
                {gameInfo.data.myStats && (
                  <Box>
                    <Text fontWeight={"bold"}>Ваш результат</Text>
                    <Text fontWeight={"bold"} fontSize={"xl"}>
                      {gameInfo.data.myStats.totalPoints}
                    </Text>
                  </Box>
                )}

                {gameInfo.data.topStats && (
                  <Box>
                    <Text fontWeight={"bold"}>Лучший результат</Text>
                    <Text fontWeight={"bold"} fontSize={"xl"}>
                      {gameInfo.data.topStats.totalPoints}
                    </Text>
                  </Box>
                )}
              </Flex>
            </Box>
          </Box>
        )}

        {gameStatus.isPlaying && (
          <Box>
            <Text fontWeight={"bold"}>Ваш результат</Text>
            <Text fontWeight={"bold"} fontSize={"xl"}>
              {myPoints || gameInfo.data.myStats?.totalPoints || 0}
            </Text>
          </Box>
        )}

        <Spacer m={5} />

        <BackButton />
      </Box>
    );
  }
}

export function BackButton() {
  return (
    <Box>
      <Link to={"../"}>
        <Button>Назад</Button>
      </Link>
    </Box>
  );
}

export function GameNotFound() {
  return (
    <Container p={5} m={5} shadow={"sm"} textAlign={"center"}>
      <Heading>
        <Text>404</Text>
        <Text>Игра не найдена</Text>
      </Heading>
      <Spacer m={5} />
      <BackButton />
    </Container>
  );
}
