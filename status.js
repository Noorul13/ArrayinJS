module.exports.editProductStatus = async (req, res) => {
    const { productId } = req.body;

    try {
        const product = await inventoryModel.findOne({ _id: productId });

        if (!product || !["Published", "Rejected"].includes(product.publishStatus)) {
            return res.send({
                code: 400,
                message: "Product not found or not in Published/Rejected status.",
            });
        }

        // Toggle the status
        const newStatus = !product.status;

        const updatedProduct = await inventoryModel.findOneAndUpdate(
            { _id: productId },
            { $set: { status: newStatus } },
            { new: true, runValidators: true }
        );

        return res.send({
            code: 200,
            message: `Product status updated successfully to ${newStatus}`,
            data: updatedProduct,
        });
    } catch (error) {
        console.error(error);
        res.send({
            code: 500,
            message: "Failed to update product status.",
            error: error.message,
        });
    }
};
