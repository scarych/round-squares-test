import { useEffect } from "react";
import { useCurrentTime } from "../state";
import { Text } from "@chakra-ui/react";

import { dayjs } from "../common/dayjs";

export function CurrentTime() {
  const currentTime = useCurrentTime();
  useEffect(() => {
    currentTime.startClock();
  }, []);

  return <Text>{dayjs(currentTime.now).format("LTS")}</Text>;
}
