export interface JwtPayload {
  sub: string;           // userId
  role: "user" | "admin";
  tenantId?: string;
}

export interface SocketData extends JwtPayload {}