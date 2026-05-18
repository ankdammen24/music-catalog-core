import { NextFunction, Request, Response } from "express";

export class AppError extends Error { constructor(public statusCode: number, message: string) { super(message); } }

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) return res.status(err.statusCode).json({ error: err.message });
  return res.status(500).json({ error: "Internal server error" });
};
