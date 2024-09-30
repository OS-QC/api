/* eslint-disable @typescript-eslint/no-unused-vars */
import AppConfig from '@config/AppConfig'
import { ERolUser, IUserAttributes } from '@users/userModel'
import type { Request } from 'express'
import jwt from 'jsonwebtoken'

export async function expressAuthentication(
  request: Request,
  securityName: string,
  scopes?: (ERolUser | null)[]
): Promise<{
  token?: string | null
  auth?: IUserAttributes | null
}> {
  if (securityName === 'bearerAuth') {
    const authHeader = request?.headers?.authorization
    if (authHeader) {
      const token = authHeader.includes(' ') ? authHeader.split(' ')[1] : authHeader
      try {
        const auth = jwt.verify(token, AppConfig.JWT_SECRET_KEY) as IUserAttributes
        if (scopes && scopes.length > 0 && !scopes.includes(null)) {
          const userRoles = auth.rol || ''
          const hasRole = scopes.some((scope) => {
            if (scope === ERolUser.ADMIN) {
              return userRoles === ERolUser.ADMIN
            } else if (scope === ERolUser.USER || scope === null) {
              return true
            } else if (scope === 'optional' || scope === null) {
              return true
            }
            return false
          })
          if (!hasRole) {
            throw {
              status: 403,
              message: 'Forbidden',
              token: null,
              user: null,
              auth: null,
              stack: '',
            }
          }
        }
        request.auth = auth
        return { token, auth }
      } catch (err) {
        throw {
          status: 401,
          message: 'Invalid token',
          token: null,
          user: null,
          auth: null,
          stack: '',
        }
        // throw new Error('Token inválido o expirado');
      }
    } else {
      if (scopes) {
        return { token: '', auth: null }
      }
    }
    throw {
      status: 401,
      message: 'Invalid token',
      token: null,
      user: null,
      auth: null,
      stack: '',
    }
  } else {
    throw {
      status: 401,
      message: 'Invalid token',
      token: null,
      user: null,
      auth: null,
      stack: '',
    }
  }
}
