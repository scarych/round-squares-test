import { Games } from "../../api/queries/testCase";
import { remainsTime } from "./functions";
import { Text } from "@chakra-ui/react";

export function TimeBeforeStart(props: { game: Games; time: Date }) {
  const { game, time } = props;
  return <Text>{`До начала игры осталось: ${remainsTime(new Date(game.startingAt), time)}`}</Text>;
  //
}

export function TimeBeforeEnd(props: { game: Games; time: Date }) {
  const { game, time } = props;
  return <Text>{`До конца игры осталось: ${remainsTime(new Date(game.finishingAt), time)}`}</Text>;
  //
}
