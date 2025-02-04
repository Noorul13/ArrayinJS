const inventoryModel = require('../../models/inventory');
const mongoose = require('mongoose');

module.exports.addInventory = async (req, res) => {
    try {
        const {
            warehouseId,
            productName,
            productCategory,
            productSubCategory,
            subCategory,
            form,
            weight,
            quantity,
            price,
            image,
            slashedPrice,
            threshold
        } = req.body;

        if (!warehouseId || !productName || !productCategory || !form || !price ||productSubCategory) {
            return res.send({ code: 400, message: "Required fields are missing." });
        }

        const newInventory = new inventoryModel({
            warehouseId,
            productName,
            productCategory,
            productSubCategory,
            form,
            weight,
            quantity,
            stock: quantity,
            price,
            image,
            slashedPrice,
            threshold
        });

        const savedInventory = await newInventory.save();
        res.send({ code: 200, message: "Inventory added successfully.", data: savedInventory });
    } catch (error) {
        console.error("Error in adding inventory:", error);
        res.send({ code: 500, message: "Something went wrong.", error: error.message });
    }
};

module.exports.getInventoryDetails = async (req, res) => {
    try {
        const { inventoryId } = req.query;
        console.log(inventoryId);

        if (!inventoryId) {
            return res.send({ code: 400, message: "Inventory ID is required." });
        }

        const inventory = await inventoryModel.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(inventoryId),
                }
            },
            {
                $lookup: {
                    from: "warehouses",
                    localField: "warehouseId",
                    foreignField: "_id",
                    pipeline: [
                        {
                            $project: {
                                warehouseName: 1,

                            }
                        }
                    ],
                    as: "warehouseDetails",
                },
            },
            {
                $unwind: {
                    path: "$warehouseDetails",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "productCategory",
                    foreignField: "_id",
                    pipeline: [
                        {
                            $project: {
                                categoryName: 1,
                            }
                        }
                    ],
                    as: "categoryDetails",
                }
            },
            {
                $unwind: {
                    path: "$categoryDetails",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "productCategory",
                    foreignField: "_id",
                    pipeline: [
                        {
                            $project: {
                                categoryName: 1,
                            }
                        }
                    ],
                    as: "categoryDetails",
                }
            },
            {
                $unwind: {
                    path: "$categoryDetails",
                    preserveNullAndEmptyArrays: true,
                },
            }
        ])

        // Check if inventory exists
        if (!inventory) {
            return res.send({ code: 400, message: "Inventory not found." });
        }

        res.send({ code: 200, message: "Inventory fetched successfully.", data: inventory });
    } catch (error) {
        console.error("Error in fetching inventory:", error);
        res.send({ code: 500, message: "Something went wrong.", error: error.message });
    }
};

module.exports.getInventoryList = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "" } = req.query;

        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        // const searchField = {};
        const inventory = await inventoryModel.aggregate([
            {
                $lookup: {
                    from: "warehouses",
                    localField: "warehouseId",
                    foreignField: "_id",
                    pipeline: [
                        {
                            $project: {
                                warehouseName: 1,

                            }
                        }
                    ],
                    as: "warehouseDetails",
                },
            },
            {
                $unwind: {
                    path: "$warehouseDetails",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "productCategory",
                    foreignField: "_id",
                    pipeline: [
                        {
                            $project: {
                                categoryName: 1,
                            }
                        }
                    ],
                    as: "categoryDetails",
                }
            },
            {
                $unwind: {
                    path: "$categoryDetails",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $match: {
                    $or: [
                        { productName: { $regex: search, $options: "i" } }, // Case-insensitive search on warehouseName
                        { "warehouseDetails.warehouseName": { $regex: search, $options: "i" } }, // Case-insensitive search on vendorName
                    ],
                },
            },
            {
                $skip: (pageNumber - 1) * limitNumber,
            },
            {
                $limit: limitNumber,
            },
            {
                $sort: { createdAt: -1 }
            },
        ]);

        const total = await inventoryModel.aggregate([
            {
                $lookup: {
                    from: "warehouses",
                    localField: "warehouseId",
                    foreignField: "_id",
                    pipeline: [
                        {
                            $project: {
                                warehouseName: 1,

                            }
                        }
                    ],
                    as: "warehouseDetails",
                },
            },
            {
                $unwind: {
                    path: "$warehouseDetails",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "productCategory",
                    foreignField: "_id",
                    pipeline: [
                        {
                            $project: {
                                categoryName: 1,
                            }
                        }
                    ],
                    as: "categoryDetails",
                }
            },
            {
                $unwind: {
                    path: "$categoryDetails",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $match: {
                    $or: [
                        { productName: { $regex: search, $options: "i" } }, // Case-insensitive search on warehouseName
                        { "warehouseDetails.warehouseName": { $regex: search, $options: "i" } }, // Case-insensitive search on vendorName
                    ],
                },
            },
            {
                $count: "totalCount",
            },
        ]);

        const totalCount = total.length > 0 ? total[0].totalCount : 0;

        return res.send({
            code: 200,
            data: inventory,
            pagination: {
                total: totalCount,
                page: pageNumber,
                limit: limitNumber,
                totalPages: Math.ceil(totalCount / limitNumber),
            },
        });
    } catch (error) {
        return res.send({
            code: 500,
            error: error.message,
        });
    }
}

module.exports.updateInventory = async (req, res) => {
    try {
        const {
            inventoryId,
            productName,
            productCategory,
            subCategory,
            form,
            weight,
            quantity,
            price,
            image,
            slashedPrice,
            threshold
        } = req.body;

        if (!inventoryId) {
            return res.send({ code: 400, message: "Inventory ID is required." });
        }

        // Find and update the inventory item
        const updatedInventory = await inventoryModel.findByIdAndUpdate(
            inventoryId,
            {
                productName,
                productCategory,
                subCategory,
                form,
                weight,
                quantity,
                stock: quantity,
                price,
                image,
                slashedPrice,
                threshold
            },
            { new: true, runValidators: true }
        );

        if (!updatedInventory) {
            return res.send({ code: 400, message: "Inventory not found." });
        }

        res.send({ code: 200, message: "Inventory updated successfully.", data: updatedInventory });
    } catch (error) {
        console.error("Error in updating inventory:", error);
        res.send({ code: 500, error: error.message });
    }
};

module.exports.deleteInventory = async (req, res) => {
    try {
        const { inventoryId } = req.query;

        if (!inventoryId) {
            return res.send({ code: 400, message: "Inventory ID is required." });
        }

        const deletedInventory = await inventoryModel.findByIdAndUpdate(inventoryId, {isdeleted: true}, {new: true});

        // Check if inventory exists
        if (!deletedInventory) {
            return res.send({ code: 400, message: "Inventory not found." });
        }

        res.send({ code: 200, message: "Inventory deleted successfully.", data: deletedInventory });
    } catch (error) {
        console.error("Error in deleting inventory:", error);
        res.send({ code: 500, error: error.message });
    }
};

module.exports.getInventoryByFilters = async (req, res) => {
    try {
      const { form, status, productCategory, subCategory, page = 1, limit = 10 } = req.query;
  
      
      const query = { isdeleted: false };
  
      if (form) {
        query.form = form;
      }
      if (status) {
        query.status = status;
      }
      if (productCategory) {
        query.productCategory = productCategory;
      }
      if (subCategory) {
        query.subCategory = subCategory;
      }
  
      const pageNumber = parseInt(page, 10);
      const limitNumber = parseInt(limit, 10);
  
      // Inventories ko filter aur paginate karna
      const inventories = await inventoryModel.find(query)
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber);
  
      // Total count nikalna for pagination
      const total = await inventoryModel.countDocuments(query);
  
      // Response return karna
      res.send({
        code: 200,
        data: inventories,
        pagination: {
          total,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(total / limitNumber),
        },
      });
    } catch (error) {
      console.error("Error fetching inventories by filters:", error);
      res.send({
        code: 500,
        message: "An error occurred while fetching inventories",
      });
    }
};