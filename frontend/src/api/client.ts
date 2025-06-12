import { createClient } from "@hey-api/client-fetch";
import { useAuthTokens } from "../state";

const { VITE_API_URL: baseUrl } = import.meta.env;

const client = createClient({ baseUrl });

client.interceptors.request.use((request) => {
  const { token } = useAuthTokens.getState();
  if (token) {
    request.headers.set("Authorization", `Bearer ${token}`);
  }
  return request;
});

client.interceptors.response.use((response) => {
  const authTokens = useAuthTokens.getState();
  // если вернулся ответ 401 и использовался токен, то сбросим его
  if (response.status.toString() === "401" && authTokens.token) {
    authTokens.resetToken();
  }
  return response;
});

export { client };
