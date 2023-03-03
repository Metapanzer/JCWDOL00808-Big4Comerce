"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class order_details extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.orders, { foreignKey: "orders_id" });
      this.belongsTo(models.products, { foreignKey: "products_id" });
    }
  }
  order_details.init(
    {
      quantity: DataTypes.INTEGER,
      product_price: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "order_details",
    }
  );
  return order_details;
};
