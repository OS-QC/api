import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import AppConfig from '../config/AppConfig';

// Middleware para verificar el token JWT y agregar la información del usuario al objeto request
export const expressAuthentication = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.includes(' ') ? authHeader.split(' ')[1] : authHeader
    jwt.verify(token, AppConfig.JWT_SECRET_KEY, (err, user) => {
      if (err) {
        return res.sendStatus(403); // Acceso prohibido si hay un error
      }
      req.auth = user; // Agrega la información del usuario al objeto request
      next();
      return
    });
  } else {
    next(); // No autorizado si no hay encabezado de autorización
    return
  }
};

