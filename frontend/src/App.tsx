import { useQuery } from "@tanstack/react-query";
import { Box, Container, Flex, Spinner, Text, VStack } from "@chakra-ui/react";

import { usersControllerInfoOptions } from "./api/queries/testCase/@tanstack/react-query.gen";
import { client } from "./api/client";
import { NewGameButton } from "./components/games/newGame";
import { Games } from "./components/games";
import { CurrentTime } from "./components/currentTime";

import { LogoutButton } from "./components/auth";

function App() {
  const userInfo = useQuery({ ...usersControllerInfoOptions({ client }) });
  return userInfo.isSuccess ? (
    <>
      <Container p={5}>
        <Flex gap={3} alignItems={"center"}>
          <Box flexGrow={1} truncate>
            <Text fontWeight={"bold"} fontSize="lg">
              {userInfo.data.login}
            </Text>
            <CurrentTime />
          </Box>
          <Box>
            <NewGameButton />
          </Box>
          <Box flexGrow={0}>
            <LogoutButton />
          </Box>
        </Flex>

        <Container p={0} m={0}>
          <Games />
        </Container>
      </Container>
    </>
  ) : (
    <VStack>
      <Spinner m={10} />
    </VStack>
  );
}

export default App;
