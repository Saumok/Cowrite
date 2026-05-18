export interface JwtPayload {
  userId: string;
  name: string;
  email: string;
}

export interface AuthRequest extends Express.Request {
  user?: JwtPayload;
}
