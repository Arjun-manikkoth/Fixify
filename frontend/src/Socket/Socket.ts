import { io } from "socket.io-client";

const socket = io(process.env.REACT_APP_FIXIFY_URL as string, {
    // withCredentials: true, // Include credentials (cookies)
});

export default socket;
