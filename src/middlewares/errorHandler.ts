/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Request, Response, NextFunction } from 'express'
import { fxI18n } from '@utils/i18n';
// import errorService from '../services/errorService'
import { ValidateError } from 'tsoa'
import { ValidationError } from 'sequelize'


export function errorHandler(err: { menssage: string, stack: string, status: number }, req: Request, res: Response, _next: NextFunction) {

  if (err instanceof ValidateError) {
    let validationErrors: any = err?.fields?.requestBody?.message.replace('Could not match the intersection against every type. Issues: ', '');
    validationErrors = JSON.parse(validationErrors)
    const keys = Object.keys(validationErrors[0])
    const errors = []
    for (const key of keys) {
      const element = validationErrors[0][key]
      const messages = element.message
      const startQuoteIndex = messages.indexOf("'");
      const endQuoteIndex = messages.lastIndexOf("'");

      if (startQuoteIndex !== -1 && endQuoteIndex !== -1) {
        const field = messages.slice(startQuoteIndex + 1, endQuoteIndex);
        const message = messages.slice(endQuoteIndex + 2); // Agregamos 2 para saltar el espacio y el texto "is required"
        errors.push({
          field: fxI18n.__(field),
          message: fxI18n.__(message.replace(' ', '_'))
        })
      } else {
        errors.push({
          field: '',
          message: 'Ocurrio un error inesperado'
        })
      }
    }
    res.status(422).json({
      success: false,
      type: 'validation',
      message: errors,
    });
  } else if (err instanceof ValidationError) {
    
    const errors: any[] = []
    for (const itemError of err.errors) {
      if (itemError?.path && itemError?.validatorKey) {
        errors.push({
          field: fxI18n.__(itemError.path),
          message: fxI18n.__(itemError.message)
        })
      } else {
        errors.push({
          field: null,
          message: 'error'
        })
      }
    }
    res.status(400).json({ success: false, type: 'validation', message: errors })
  } else {
    // const newErrorReporting = {
    //   type: 'validation',
    //   data: JSON.stringify({
    //     request: {
    //       method: req.method,
    //       url: req.url,
    //       headers: req.headers,
    //       body: req.body,
    //     },
    //     userId: req?.auth?.id, // Asume que el usuario está en req.user
    //   }),
    //   error: JSON.stringify({
    //     message: err.message,
    //     stack: err.stack,
    //   }),
    // }
    // await modelErrorReporting.create(newErrorReporting)
    const errorDetails = {
      message: err?.menssage || 'Error interno del servidor',
      stack: err.stack,
      path: req.path,
      method: req.method,
      request: req.body,
      time: new Date().toISOString()
    }
    console.log('errorDetails :>> ', errorDetails)
    // if (!err?.status || err?.status !== 401) {
    //   errorService.create(errorDetails)
    // }
    if (err?.status === 401) {
      res.status(err?.status).json({ message: 'Invalid token' })
    } else {
      res.status(err?.status || 500).json({ message: errorDetails?.message || 'Error interno del servidor' })
    }
  }
}