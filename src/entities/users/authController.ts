import {
  Body,
  Controller,
  Get,
  Request,
  Post,
  Route,
  SuccessResponse,
  Tags,
  Security
  // Queries
} from 'tsoa';
import { IUserAttributes, IUserCreationAttributes } from '@users/userModel';
import UsersService from '@users/userService';
import AppConfig from '@config/AppConfig'
import * as argon2 from 'argon2'
import jwt, { type Secret } from 'jsonwebtoken'
import { fxI18n } from '@utils/i18n';

interface IPasswordVerified {
  field: string,
  message: string,
}
@Route('auth')
@Tags('Auth')
export class AuthController extends Controller {
  private userService: typeof UsersService

  constructor() {
    super()
    this.userService = UsersService
  }
  /**
   * Registra un nuevo usuario.
   * @param pRequestBody - Parámetros de creación del usuario.
   * @returns Usuario creado y token de autenticación.
   */
  @SuccessResponse('201', 'Created') // Custom success response
  @Post('/register')
  public async register(
    @Body() requestBody: IUserCreationAttributes
  ): Promise<{ success: boolean, user: IUserAttributes | null; token?: string; message?: any }> {
    try {
      const validatePassword = this.validatePassword(requestBody.password)
      if (validatePassword) {
        this.setStatus(401)
        return { success: false, user: null, message: validatePassword }
      }
      await this.userService.validate(requestBody)
      const vHashedPassword = await argon2.hash(requestBody.password)
      requestBody.password = vHashedPassword
      // if (requestBody?.avatar) {
      //   await this.FileController.moveFile(requestBody?.avatar)
      // }
      const vUser: IUserAttributes | null = await this.userService.create(requestBody)
      console.log('vUser :>> ', vUser);
      if (vUser) {
        const vUserJson = JSON.parse(JSON.stringify(vUser))
        delete vUserJson.deleted_at
        delete vUserJson.created_at
        delete vUserJson.updated_at
        delete vUserJson.password
        const vToken = jwt.sign(vUserJson, AppConfig.JWT_SECRET_KEY, {})
        this.setStatus(201)
        return { success: true, user: vUser, token: vToken }
      }
    return { success: true, user: null, message: 'Ocurrio un error' }
    } catch (error) {
      console.log('error :>> ', error)
      this.setStatus(400) // HTTP 401 Unauthorized
      return { success: false, user: null, message: 'Ocurrio un error' }
    }
  }
  
  /**
   * Inicia sesión con credenciales de usuario.
   * @param pRequestBody - Credenciales de inicio de sesión (email y contraseña).
   * @returns Usuario autenticado y token de autenticación o mensaje de error.
   */
  @Post('/login')
  public async login(
    @Body() pRequestBody: { email: string; password: string }
  ): Promise<{ success: boolean, user: IUserAttributes; token: string } | { message: string; status: false }> {
    try {
      const vUser = await this.userService.login(pRequestBody.email)
      if (vUser) {
        const vPasswordIsValid = await argon2.verify(vUser?.password, pRequestBody.password)
        if (vPasswordIsValid) {
          // No devolver la contraseña, incluso si está hasheada
          const vUserResponse: IUserAttributes = vUser
          const vToken = jwt.sign(vUser, AppConfig.JWT_SECRET_KEY as Secret)
          this.setStatus(200) // HTTP 200 OK
          return { success: true, user: vUserResponse, token: vToken }
        }
      }
      this.setStatus(500) // HTTP 500
      return { success: false, message: 'Usuario incorrecto', status: false }
    } catch (error) {
      this.setStatus(401) // HTTP 401 Unauthorized
      return Promise.reject(error)
    }
  }

  /**
   * Obtiene los detalles del usuario autenticado.
   * @param pRequestBody - Solicitud HTTP con información de autenticación.
   * @returns Detalles del usuario autenticado.
   */
  @Get('/me')
  @Security('bearerAuth')
  @SuccessResponse('201', 'User Found')
  public async me(@Request() pRequestBody: { auth: IUserAttributes }): Promise<{ success: boolean, user: IUserAttributes | null }> {
    try {
      if (!pRequestBody?.auth?.id) {
        this.setStatus(401)
        return { success: false, user: null }
      }
      const vUser: IUserAttributes | null = await this.userService.get(pRequestBody.auth.id)
      if (vUser) {
        this.setStatus(200) // HTTP 200
        return { success: true, user: vUser }
      } else {
        this.setStatus(401)
        return { success: false, user: null }
      }
    } catch (error) {
      throw error
    }
  }

  private validatePassword(password: string): IPasswordVerified[] | false {
    const errors: IPasswordVerified[] = []
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push({
        field: fxI18n.__('password'),
        message: fxI18n.__('lowercase letter is required'.replace(/ /g, '_'))
      })
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push({
        field: fxI18n.__('password'),
        message: fxI18n.__('capital letter required'.replace(/ /g, '_'))
      })
    }
    if (!/(?=.*\d)/.test(password)) {
      errors.push({
        field: fxI18n.__('password'),
        message: fxI18n.__('a number is required'.replace(/ /g, '_'))
      })
    }
    if (!/(?=.*[@$!%*?&.])/.test(password)) {
      errors.push({
        field: fxI18n.__('password'),
        message: fxI18n.__('a special symbol is required'.replace(/ /g, '_'))
      })
    }
    if (password.length < 3) {
      errors.push({
        field: fxI18n.__('password'),
        message: fxI18n.__('at least 3 characters is required'.replace(/ /g, '_'))
      })
    }
    if (errors.length) {
      return errors
    }
    return false
  }
}