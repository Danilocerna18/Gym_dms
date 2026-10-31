import { RequestHandler } from "express";
import { Role } from "@prisma/client";

declare global {
  namespace Express {
    interface User {
      id: string;
      role: Role;
    }
  }
}

export function requireSession(role?: Role): RequestHandler {
  return (req, res, next) => {
    res.set("Cache-Control", "no-store");
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Inicia sesión." });
    if (role && req.user.role !== role) return res.status(403).json({ message: "Acceso denegado." });
    next();
  };
}
