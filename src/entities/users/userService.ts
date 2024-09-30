import { modelUser } from '@db/index';
import { type FindOptions,ValidationErrorItem, ValidationError } from 'sequelize'
import type { IUserAttributes, IUserCreationAttributes, IResponseAllUser} from '@users/userModel';
import { fxOrderNameId, fxPaginate, fxReponseServices, fxSearchILike } from '../../utils/query'

class UsersService {
  async validate(data: any) {
    const fieldsToCheck = ['email', 'phoneNumber']
    for (const field of fieldsToCheck) {
      if (data[field]) {
        const existingUser = await modelUser.findOne({
          where: { [field]: data[field] },
        })
        if (existingUser) {
          const errorItems = [
            new ValidationErrorItem(
              `${field} already in use`,
              'unique violation', // type
              field, // path
              data[field], // value
              existingUser,
              'notUnique', // validatorKey
              'validate',
              []
            ),
          ]
          throw new ValidationError('Validation error', errorItems)
        }
      }
    }
    const dataValidate = modelUser.build(data)
    await dataValidate.validate()
  }
  public async get(id: number): Promise<IUserAttributes | null> {
    try {
      const vResponse: IUserAttributes | null = await modelUser.findOne({
        where: {
          id
        }
      })
      return vResponse
    } catch (error) {
      throw error      
    }
  }

  public async all(pParam: any): Promise<IResponseAllUser | IUserAttributes[]> {
    try {
      let whereStatement: FindOptions = {}
      whereStatement = fxPaginate(pParam, whereStatement)
      whereStatement.order = fxOrderNameId(pParam, whereStatement)
      whereStatement.where = fxSearchILike(
        pParam,
        whereStatement,
        pParam?.typeSearch || 'name',
        modelUser.name
      )
      const vResponse: IUserAttributes[] = await modelUser.findAll(whereStatement)
      if (Number(pParam?.pag)) {
        const vResponsePaginate: IResponseAllUser = await fxReponseServices(
          pParam,
          whereStatement,
          modelUser.name,
          vResponse
        )
        return vResponsePaginate
      }
      return vResponse
    } catch (error) {
      throw error
    }
  }

  public async create(userCreationParams: IUserCreationAttributes): Promise<IUserAttributes> {
    try {
      const vResponse: IUserAttributes = await modelUser.create(userCreationParams)
      return vResponse
    } catch (error) {
      throw error
    }
  }
  
  async login(pEmail: string): Promise<IUserAttributes | null> {
    try {
      const vUser: any = await modelUser.scope('withPassword').findOne({ where: { email: pEmail } })
      return vUser
    } catch (error) {
      throw error
    }
  }
}
export default new UsersService()