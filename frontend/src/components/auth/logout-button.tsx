import { Button } from "@chakra-ui/react";
import { useNavigate } from "react-router";
import { useAuthTokens } from "../../state";

export function LogoutButton() {
  const authTokens = useAuthTokens();
  const navigate = useNavigate();
  const logoutHandler = () => {
    navigate("/");
    authTokens.resetToken();
  };
  return <Button onClick={logoutHandler}>Выйти</Button>;
}
