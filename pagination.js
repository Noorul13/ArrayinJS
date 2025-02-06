module.exports.approvedProductList = async(req,res) => {
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

        const approvedProduct  = await inventoryModel.aggregate([
            {
                $match: {
                    publishStatus: "Published"
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
                $facet: {
                    data: [
                        { $skip: (parseInt(page, 10) - 1) * parseInt(limit, 10) },
                        { $limit: parseInt(limit, 10) },
                    ],
                    metadata: [
                        { $count: "total" },
                    ],
                },
            },
            {
                $addFields: {
                    pagination: {
                        total: { $arrayElemAt: ["$metadata.total", 0] },
                        page: parseInt(page, 10),
                        limit: parseInt(limit, 10),
                        totalPages: {
                            $ceil: {
                                $divide: [{ $arrayElemAt: ["$metadata.total", 0] }, parseInt(limit, 10)]
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    metadata: 0
                }
            }
        ]);

        return res.send({
            code: 200,
            data: approvedProduct,
        })
    } catch (error) {
        console.log("Error fetching order details:", error);
        return res.send({
            code: 500,
            message: error.message,
        });
    }

}