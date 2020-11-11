import { useAppContext } from "./context-lib";
import { useState, useEffect } from "react";

export default function useSocket() {
  const { socket } = useAppContext();
  const [_socket, setSocket] = useState(socket);
  useEffect(() => {
    setSocket(socket);
  }, [socket]);

  return _socket;
}
