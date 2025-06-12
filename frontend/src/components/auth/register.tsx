import { useCallback, useEffect, useState } from "react";
import { Button, Input, Text, Spinner, Alert, CloseButton } from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";

//
import { authControllerRegisterMutation } from "../../api/queries/testCase/@tanstack/react-query.gen";
import { useAuthTokens } from "../../state";
import { client } from "../../api/client";
//

const defaultPasswords = { password1: "", password2: "" };
const minPasswordLength = 3;
//
export function RegisterForm(props: { login: string }) {
  const { login } = props;
  const authTokens = useAuthTokens.getState();

  const [passwords, setPasswords] = useState(defaultPasswords);
  const [registerProcess, setRegisterProcess] = useState(false);

  const [passwordsValid, setPasswordsValid] = useState(false);

  const [registerError, setRegisterError] = useState("");

  useEffect(() => {
    setPasswordsValid(
      passwords.password1.length >= minPasswordLength && passwords.password1 === passwords.password2
    );
  }, [passwords]);

  const registerRequest = useMutation({
    ...authControllerRegisterMutation({ client }),
    onMutate() {
      setRegisterProcess(true);
      setRegisterError("");
    },
    onError(error) {
      setRegisterError(error.message);
      setRegisterProcess(false);
    },
    onSuccess(data) {
      authTokens.setToken(data.token);
      setRegisterProcess(false);
    },
  });

  const registerHandler = useCallback(() => {
    const password = passwords.password1;
    registerRequest.mutate({ body: { login, password } });
  }, [login, passwords]);

  return (
    <>
      <Input
        placeholder="Введите пароль"
        type="password"
        name="password1"
        value={passwords.password1}
        onChange={({ target }) => setPasswords({ ...passwords, [target.name]: target.value })}
      />
      <Input
        placeholder="Повторите пароль"
        type="password"
        name="password2"
        value={passwords.password2}
        onChange={({ target }) => setPasswords({ ...passwords, [target.name]: target.value })}
      />
      <Text fontSize={"xs"}>Минимальная длина пароля {minPasswordLength} символа</Text>
      {passwords.password1 !== passwords.password2 && (
        <Alert.Root status={"error"}>
          <Alert.Title>Пароли не совпадают</Alert.Title>
        </Alert.Root>
      )}

      {registerError ? (
        <Alert.Root status={"error"}>
          <Alert.Content>
            <Alert.Title>{"Ошибка"}</Alert.Title>
            <Alert.Description>{registerError}</Alert.Description>
          </Alert.Content>
          <CloseButton pos="relative" top="-3" insetEnd="-3" onClick={() => setRegisterError("")} />
        </Alert.Root>
      ) : null}

      <Button width={"100%"} disabled={!passwordsValid} onClick={registerHandler}>
        {registerProcess ? <Spinner /> : "Регистрация"}
      </Button>
    </>
  );
}
