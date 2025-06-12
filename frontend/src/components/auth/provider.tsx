import { PropsWithChildren } from "react";
import { useAuthTokens } from "../../state";

import { AuthForm } from "./form";

export function AuthProvider(props: PropsWithChildren) {
  const { token } = useAuthTokens();

  if (!token) {
    return <AuthForm />;
  }

  return props.children;
}
