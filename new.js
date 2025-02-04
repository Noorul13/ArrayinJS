warehouseSchema.pre('save', async function (next) {
    if (this.isNew) {
        try {
            // Find the last warehouse with a non-null warehouseId
            const lastWarehouse = await mongoose.model('warehouse').findOne({ warehouseId: { $ne: null } })
                .sort({ createdAt: -1 })
                .select('warehouseId');

            let lastWarehouseNumber = 0;

            if (lastWarehouse && lastWarehouse.warehouseId) {
                // Extract the numeric part of the warehouseId
                const match = lastWarehouse.warehouseId.match(/warehouse-(\d+)/);
                if (match) {
                    lastWarehouseNumber = parseInt(match[1], 10);
                }
            }

            // Generate the next warehouseId
            const nextWarehouseNumber = lastWarehouseNumber + 1;
            this.warehouseId = `warehouse-${String(nextWarehouseNumber).padStart(3, '0')}`; // Zero-padded to 3 digits
        } catch (error) {
            return next(error);
        }
    }
    next();
});