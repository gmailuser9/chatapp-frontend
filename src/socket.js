import io from "socket.io-client";

const socket = io("http://localhost:5000", {
  transports: ["websocket"],
  pingTimeout: 60000,
  pingInterval: 25000,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 3000,
});

export default socket;
