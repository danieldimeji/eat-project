const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class AuthToken extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ User }) {
      this.belongsTo(User, { foreignKey: "userId", as: "user" });
    }

    toJSON() {
      return { ...this.get(), id: undefined, userId: undefined };
    }
  }
  AuthToken.init(
    {
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
    },
    {
      sequelize,
      tableName: "auth_tokens",
      modelName: "AuthToken",
    }
  );
  return AuthToken;
};
