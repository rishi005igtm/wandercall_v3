import { io, Socket } from "socket.io-client";

/**
 * Enterprise Socket URL Resolver
 * Resolves the Socket.IO server endpoint.
 * Ensures production connections always target https://api.wandercall.com
 * to prevent 308 Permanent Redirect errors on frontend Vercel domain wandercall.com.
 */
export function getResolvedSocketUrl(): string {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    const url = process.env.NEXT_PUBLIC_SOCKET_URL.trim();
    if (
      url === "https://wandercall.com" ||
      url === "http://wandercall.com" ||
      url === "https://www.wandercall.com"
    ) {
      return "https://api.wandercall.com";
    }
    return url;
  }

  if (process.env.NEXT_PUBLIC_API_URL) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL.trim();
    const resolved = apiUrl.replace(/\/api\/v1\/?$/, "");
    if (
      resolved === "https://wandercall.com" ||
      resolved === "http://wandercall.com"
    ) {
      return "https://api.wandercall.com";
    }
    return resolved;
  }

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host.includes("wandercall.com")) {
      return "https://api.wandercall.com";
    }
  }

  return "http://localhost:5000";
}

let socketInstance: Socket | null = null;

/**
 * Get Socket.IO connection.
 * Singleton manager to prevent duplicate connections.
 */
export const getSocket = (): Socket => {
  if (!socketInstance) {
    const targetUrl = getResolvedSocketUrl();
    socketInstance = io(targetUrl, {
      autoConnect: false,
      withCredentials: true,
      transports: ["websocket", "polling"],
      path: "/socket.io/",
    });
  }
  return socketInstance;
};

export const connectSocket = () => {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
  return s;
};

export const disconnectSocket = () => {
  if (socketInstance && socketInstance.connected) {
    socketInstance.disconnect();
  }
};
