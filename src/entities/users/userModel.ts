import { type Sequelize, type Model, type Optional, DataTypes } from 'sequelize'
import type { SequelizeAttributes, ModelStatic } from '@type/SequelizeTypes'
import { v4 as uuidv4 } from 'uuid'
// import { type ModelRegistry } from '@db/index'
export enum ERolUser {
  'ADMIN' = 'admin',
  'USER' = 'user'
}
export interface IUserAttributes {
  id?: number
  name: string
  email: string
  avatar?: string | null
  rol: ERolUser
  password: string
  status?: boolean
  tokenPush?: string
  dob?: string
  createdAt?: Date
  updatedAt?: Date
  deletedAt?: Date
}

export interface IResponseAllUser {
  total: number
  totalPage: number
  data: IUserAttributes[]
  actualPage: number
}

export interface IUserFilter {
  pag?: number
  limit?: number
  name?: string
}

export type IUserCreationAttributes = Optional<
    IUserAttributes,
    'id' | 'avatar'
  > & Pick<IUserAttributes, 'email' | 'name' | 'password'>

export interface IUserInstance
  extends Model<IUserAttributes, IUserCreationAttributes>,
    IUserAttributes {}

export const vUserModelAttributes: SequelizeAttributes<IUserAttributes> = {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: () => uuidv4(),
  },
  name: {
    type: DataTypes.STRING,
    field: 'name',
  },
  avatar: {
    type: DataTypes.STRING,
    field: 'avatar',
    allowNull: true,
  },
  rol: {
    type: DataTypes.INTEGER,
    field: 'rol',
  },
  email: {
    type: DataTypes.STRING,
    field: 'email',
    defaultValue: null,
    unique: true,
    validate: {
      // isEmail: true,
      customValidator(value: string) {
        if (!/^[\w\\.g]+@+[\w]+[.]+[\D]{2,10}$/.test(value)) {
          throw new Error('invalid_email')
        }
      },
    },
  },
  password: {
    type: DataTypes.STRING,
    field: 'password',
    defaultValue: null,
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'createdAt',
    allowNull: true,
  },
  updatedAt: {
    type: DataTypes.DATE,
    field: 'updatedAt',
    allowNull: true,
  },
  deletedAt: {
    type: DataTypes.DATE,
    field: 'deletedAt',
    allowNull: true,
    defaultValue: null,
  },
}

export function fxUserFactory(sequelize: Sequelize) {
  const vUser = <ModelStatic<IUserInstance>>sequelize.define('User', {
    ...vUserModelAttributes,
  },{
    tableName: 'users',
    defaultScope: {
      attributes: {
        exclude: ['password'],
      },
      order: [['createdAt', 'DESC']],
    },
    scopes: {
      withPassword: {
        attributes: ['id', 'email', 'rol', 'password', 'name'],
      },
    },
    freezeTableName: true,
    timestamps: true,
    paranoid: true,
  })

  // vUser.associate = function (models: ModelRegistry) {
  //   const { modelUser, modelRol } = models
  //   modelUser.hasOne(modelRol, {
  //     foreignKey: 'id',
  //     localKey: 'rol_id',
  //     as: 'rol',
  //   })
  // }

  vUser.prototype.toJSON = function () {
    const values = { ...this.get() }
    delete values.password
    return values
  }
  return vUser
}