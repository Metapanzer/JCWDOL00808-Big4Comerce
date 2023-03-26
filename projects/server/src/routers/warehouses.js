const express = require("express");
const route = express.Router();
const { warehousesController } = require("../controllers");

route.get("/getAllWarehouse", warehousesController.getAllWarehouse);
route.get("/getWarehouseData", warehousesController.getWarehouseData);
route.post("/addWarehouse", warehousesController.addWarehouse);
route.patch("/updateWarehouseData", warehousesController.updateWarehouseData);
route.delete("/deleteWarehouseData", warehousesController.deleteWarehouseData);
route.get("/getProvinceData", warehousesController.getProvinceData);
route.get("/getCityData", warehousesController.getCityData);
route.get("/getWarehouseDetails/:id", warehousesController.getWarehouseDetails)

module.exports = route;
