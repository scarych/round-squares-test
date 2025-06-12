import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@chakra-ui/react";

import {
  gamesControllerCreateIsAllowedOptions,
  gamesControllerCreateGameMutation,
} from "../../api/queries/testCase/@tanstack/react-query.gen";
import { client } from "../../api/client";
import { Toaster, toaster } from "../ui/toaster";

export function NewGameButton() {
  const createGameAllowed = useQuery({
    ...gamesControllerCreateIsAllowedOptions({ client }),
    retry: false,
  });

  const newGameRequest = useMutation({
    ...gamesControllerCreateGameMutation({ client }),
    onSuccess() {
      toaster.create({
        description: "Новая игра создана",
        type: "success",
      });
    },
  });

  const newGameHandler = () => {
    newGameRequest.mutate({});
  };

  return createGameAllowed.isSuccess ? (
    <>
      <Button
        variant={"solid"}
        colorPalette={"cyan"}
        onClick={newGameHandler}
        disabled={newGameRequest.isPending}
      >
        {"Новая игра"}
      </Button>
      <Toaster />
    </>
  ) : null;
}
