const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class AuthToken extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ User }) {
      this.belongsTo(User, { foreignKey: "userUuid", as: "user" });
    }

    toJSON() {
      return { ...this.get(), id: undefined, userUuid: undefined };
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
        values: ["activate", "reset", "access", "refresh"],
        allowNull: false,
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
