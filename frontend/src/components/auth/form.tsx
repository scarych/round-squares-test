import { useCallback, useState } from "react";
import { Button, VStack, Input, Text, Spinner } from "@chakra-ui/react";
import { Center, Box } from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";

//
import { authControllerCheckLoginMutation } from "../../api/queries/testCase/@tanstack/react-query.gen";
import { LoginForm } from "./login";
import { RegisterForm } from "./register";
import { client } from "../../api/client";

export function AuthForm() {
  const [login, setLogin] = useState("");

  const [loginExists, setLoginExists] = useState<boolean | null>(null);
  const [checkingLogin, setCheckingLogin] = useState(false);

  const checkLoginRequest = useMutation({
    ...authControllerCheckLoginMutation({ client }),
    onMutate() {
      setCheckingLogin(true);
    },
    onSuccess(data) {
      setLoginExists(data ? data.exists : null);
      setCheckingLogin(false);
    },
  });

  const checkLoginHandler = useCallback(() => {
    checkLoginRequest.mutate({ body: { login } });
  }, [login, checkLoginRequest]);

  const resetLoginHandler = useCallback(() => {
    setLogin("");
    setLoginExists(null);
  }, []);

  return (
    <Center minH="100vh" bg="gray.50">
      <Box maxW={"lg"} minW={"xs"} p={10} bg="white" borderRadius="lg" boxShadow="lg">
        <VStack>
          <Text fontWeight={"bold"}>Вход</Text>

          <Input
            placeholder="Логин"
            value={login}
            minW={"fit"}
            disabled={loginExists !== null}
            onChange={({ target }) => setLogin(target.value)}
          />

          {loginExists === true && <LoginForm login={login} />}

          {loginExists === false && <RegisterForm login={login} />}

          {loginExists === null ? (
            <Button width={"100%"} disabled={!login} onClick={checkLoginHandler}>
              {checkingLogin ? <Spinner /> : "Далее"}
            </Button>
          ) : (
            <Button variant={"ghost"} onClick={resetLoginHandler}>
              Отмена
            </Button>
          )}
        </VStack>
      </Box>
    </Center>
  );
}
