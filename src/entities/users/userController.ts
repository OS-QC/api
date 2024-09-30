import {
  Body,
  Controller,
  Get,
  Path,
  Post,
  Route,
  SuccessResponse,
  Tags,
  Queries,
  Security
} from 'tsoa';
import { IUserAttributes, IUserCreationAttributes, IResponseAllUser, IUserFilter, ERolUser } from '@users/userModel';
import UsersService from '@users/userService';

@Route('users')
@Tags('User')
export class UsersController extends Controller {
  private userService: typeof UsersService

  constructor() {
    super()
    this.userService = UsersService
  }

  @Get('{userId}')
  public async get(
    @Path() userId: number,
  ): Promise<IUserAttributes | null> {
    return await this.userService.get(userId);
  }

  /**
   * @summary Obtener todos los usuarios con paginación.
   * @param {number} page - Número de página.
   * @param {number} count - Cantidad de usuarios por página.
   * @returns {Promise<{ data: { users: IUser[], message?: string }, status: boolean }>}
   */
  @Get('/all')
  public async all(@Queries() pQueryParams: IUserFilter): Promise<{
    data: IUserAttributes[] | IResponseAllUser
    message?: string
  }> {
    try {
      console.log('pQueryParams :>> ', pQueryParams);
      const vResponse: IUserAttributes[] | IResponseAllUser = await this.userService.all(pQueryParams)
      this.setStatus(200)
      return { data: vResponse }
    } catch (error) {
      console.error('Error en el controlador:', error);
      this.setStatus(500);
      return { data: [], message: 'Ocurrió un error' };
    }
  }
  
  @Security('bearerAuth', [ERolUser.ADMIN])
  @SuccessResponse('201', 'Created') // Custom success response
  @Post()
  public async create(
    @Body() requestBody: IUserCreationAttributes
  ): Promise<IUserAttributes | null> {
    try {
      this.setStatus(201); // set return status 201
      await this.userService.validate(requestBody)
      const item = this.userService.create(requestBody);
      return item;
    } catch (error) {
      throw error
      // this.setStatus(500);
      // return null;
    }
  }
}