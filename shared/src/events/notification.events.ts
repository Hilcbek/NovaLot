export interface NotificationServerToClientEvents {
  "notification:new": (payload: { id: string; title: string; body: string }) => void;
}

export interface NotificationClientToServerEvents {
  "notification:mark_read": (payload: { id: string }) => void;
}