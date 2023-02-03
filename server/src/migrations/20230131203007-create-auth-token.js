/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable("auth_tokens", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      token: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      tokenType: {
        type: DataTypes.ENUM,
        values: ["activate", "reset", "authenticate"],
        allowNull: false,
      },
      tokenState: {
        type: DataTypes.ENUM,
        values: ["valid", "revoked"],
        allowNull: false,
        defaultValue: "valid"
      },
      expires: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: new Date(Date.now() + 86400000),
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    });
  },
  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable("auth_tokens");
  },
};
