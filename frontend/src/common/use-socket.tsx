import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthTokens } from "../state";

const { VITE_API_URL: baseUrl } = import.meta.env;

export function useSocket() {
  const authTokens = useAuthTokens();

  const socketRef = useRef<Socket>(undefined);

  useEffect(() => {
    const socket = io(`${baseUrl}/ws`, {
      autoConnect: true,
      transports: ["websocket"],
      auth: {
        token: `${authTokens.token}`,
      },
    });

    socket.on("connect", () => {
      console.log("Connected to server");
    });

    socket.on("connected", (data) => {
      console.log("Successfully authenticated:", data);

      // Теперь можно присоединяться к комнатам и отправлять сообщения
      // socket.emit("join_room", { room: "general" });
      // socket.emit("message", { text: "Hello, world!" });
    });

    socket.on("error", (error) => {
      console.error("WebSocket error:", error);
    });

    socket.on("message", (data) => {
      console.log("Received message:", data);
    });

    socket.on("notification", (data) => {
      console.log("Received notification:", data);
    });

    socket.on("disconnect", (reason) => {
      console.log("Disconnected:", reason);
      socket.connect();
    });

    socketRef.current = socket;
  }, [authTokens.token]);

  return socketRef;
}
