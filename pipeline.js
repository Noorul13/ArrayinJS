exports.getOrdersList = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "" } = req.query;

        const searchFilter = {};

        if (search) {
            searchFilter.$or = [
                { quantity: { $regex: search, $options: "i" } },
                { "productDetails.productName": { $regex: search, $options: "i" } },
                { "userDetails.username": { $regex: search, $options: "i" } },
                { "userDetails.email": { $regex: search, $options: "i" } },
            ];
        }

        const result = await orderModel.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    pipeline: [
                        {
                            $project: {
                                username: 1,
                                email: 1,
                            },
                        },
                    ],
                    as: "userDetails",
                },
            },
            {
                $lookup: {
                    from: "products",
                    localField: "productId",
                    foreignField: "_id",
                    pipeline: [
                        {
                            $project: {
                                productName: 1,
                                price: 1,
                            },
                        },
                    ],
                    as: "productDetails",
                },
            },
            {
                $unwind: "$productDetails",
            },
            {
                $unwind: "$userDetails",
            },
            {
                $match: searchFilter,
            },
            {
                $sort: { createdAt: -1 },
            },
            {
                $facet: {
                    metadata: [
                        { $count: "total" },
                        { $addFields: { page: parseInt(page, 10) } },
                    ],
                    data: [
                        { $skip: (parseInt(page, 10) - 1) * parseInt(limit, 10) },
                        { $limit: parseInt(limit, 10) },
                    ],
                },
            },
        ]);

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error("Error fetching order details:", error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};