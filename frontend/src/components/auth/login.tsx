import { useCallback, useState } from "react";
import { Button, Input, Spinner, Alert, CloseButton } from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
//
import { useAuthTokens } from "../../state";
import { authControllerLoginMutation } from "../../api/queries/testCase/@tanstack/react-query.gen";
import { client } from "../../api/client";

//
// const { VITE_API_URL: baseUrl } = import.meta.env;

//
export function LoginForm(props: { login: string }) {
  const { login } = props;
  const authTokens = useAuthTokens.getState();

  const [password, setPassword] = useState("");
  const [loginProcess, setLoginProcess] = useState(false);

  const [loginError, setLoginError] = useState("");

  const loginRequest = useMutation({
    ...authControllerLoginMutation({ client }),

    onMutate() {
      setLoginProcess(true);
      setLoginError("");
    },
    onError(error) {
      setLoginError(error.message);
      setLoginProcess(false);
    },
    onSuccess(data) {
      authTokens.setToken(data.token);
      setLoginProcess(false);
    },
  });

  const loginHandler = useCallback(() => {
    loginRequest.mutate({ body: { login, password } });
  }, [login, password]);

  return (
    <>
      <Input
        placeholder="Введите пароль"
        type="password"
        name="password"
        value={password}
        onChange={({ target }) => setPassword(target.value)}
      />

      {loginError ? (
        <Alert.Root status={"error"}>
          <Alert.Content>
            <Alert.Title>{"Ошибка"}</Alert.Title>
            <Alert.Description>{loginError}</Alert.Description>
          </Alert.Content>
          <CloseButton pos="relative" top="-3" insetEnd="-3" onClick={() => setLoginError("")} />
        </Alert.Root>
      ) : null}

      <Button width={"100%"} disabled={!password} onClick={loginHandler}>
        {loginProcess ? <Spinner /> : "Авторизация"}
      </Button>
    </>
  );
}
