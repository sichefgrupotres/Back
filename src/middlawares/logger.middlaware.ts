import { NextFunction } from 'express';

export function loggerGlobal(req: Request, res: Response, next: NextFunction) {
  const now = new Date();
  const fecha = now.toLocaleDateString();
  const hora = now.toLocaleTimeString();
  console.log(
    `The request was made through the URL ${req.url} using the method ${req.method} the day ${fecha} to the hour ${hora}`,
  );
  next();
}
