import { DataTypes, type QueryInterface } from 'sequelize'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: QueryInterface) {
    return queryInterface.createTable('users', {
      id: {
        type: DataTypes.UUID,
        field: 'id',
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        field: 'name',
      },
      email: {
        type: DataTypes.STRING,
        field: 'email',
        defaultValue: null,
      },
      password: {
        type: DataTypes.STRING,
        field: 'password',
        defaultValue: null,
      },
      rol: {
        type: DataTypes.STRING,
        field: 'rol',
        defaultValue: 'user',
        allowNull: false,
      },
      status: {
        type: DataTypes.BOOLEAN,
        field: 'status',
        defaultValue: true,
        allowNull: true,
      },
      tokenPush: {
        allowNull: true,
        type: DataTypes.STRING,
        field: 'token_push',
        defaultValue: null,
      },
      createdAt: {
        type: DataTypes.DATE,
        field: 'createdAt',
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: 'updatedAt',
        allowNull: false,
      },
      deletedAt: {
        type: DataTypes.DATE,
        field: 'deletedAt',
      },
    })
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable('users')
  },
}
