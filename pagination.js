module.exports.pendingProductList = async(req,res) => {
    
    try {

        const { page = 1, limit = 10, search = ""} = req.query;

        const searchFilter = {};

        if (search) {
            searchFilter.$or = [
                { productName: { $regex: search, $options: "i" } },
                { "categoryDetails.categoryName": { $regex: search, $options: "i" } },
                { "subCategoryDetails.subCategoryName": { $regex: search, $options: "i" } },
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const pendingProduct  = await inventoryModel.aggregate([
            {
                $match: {
                    publishStatus: "Under Review",
                    isdeleted: false
                }
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
                }
            },
            {
                $lookup: {
                    from: "subcategories",
                    localField: "productSubCategory",
                    foreignField: "_id",
                    pipeline: [
                        {
                            $project: {
                                subCategoryName: 1
                            }
                        }
                    ],
                    as: "subCategoryDetails",
                }
            },
            {
                $unwind: {
                    path: "$subCategoryDetails",
                    preserveNullAndEmptyArrays: true,
                }
            },
            {
                $lookup: {
                    from: "inventoryforms",
                    localField: "form",
                    foreignField: "_id",
                    pipeline: [
                        {
                            $project: {
                                formName: 1,
                            }
                        }
                    ],
                    as: "formDetails",
                }
            },
            {
                $unwind: {
                    path: "$formDetails",
                    preserveNullAndEmptyArrays: true,
                }
            },
            {
                $lookup: {
                    from: "inventoryweights",
                    localField: "weight",
                    foreignField: "_id",
                    pipeline: [
                        {
                            $project: {
                                weightName: 1,
                            }
                        }
                    ],
                    as: "weightDetails",
                }
            },
            {
                $unwind: {
                    path: "$weightDetails",
                    preserveNullAndEmptyArrays: true,
                }
            },
            {
                $match: searchFilter,
            },
            {
                $sort: { createdAt: -1 },
            },
            {
                $skip: skip
            },
            {
                $limit: parseInt(limit)
            },
        ]);

        const totalCount = await inventoryModel.countDocuments({ publishStatus: "Under Review", isdeleted: false });

        return res.send({
            code: 200,
            data: pendingProduct,
            pagination: {
                total: totalCount,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(totalCount / limit),
            },
        })
    } catch (error) {
        console.log("Error fetching order details:", error);
        return res.send({
            code: 500,
            message: error.message,
        });
    }

}