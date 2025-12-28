import http from "http";
import { app } from "./app";
const server = http.createServer(app);

// create server
const PORT = process.env.PORT || 8000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is connected with port ${PORT} on all interfaces`);
});
