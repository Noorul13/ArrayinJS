module.exports.updateCart = async (req, res) => {
    try {
      const { productId, quantity = 1, action } = req.body;
      const userId = req.userID;
  
      if (!productId || !action) {
        return res.send({ code: 400, message: "Product ID and action required" });
      }
  
      // Check if product exists in inventory
      const product = await inventoryModel.findOne({ _id: productId, publishStatus: "Published" });
      if (!product) {
        return res.send({ code: 400, message: "Product not found or not published" });
      }
  
      // Find user's cart or create a new one
      let cart = await cartModel.findOne({ userId });
      if (!cart) {
        if (action === "remove") {
          return res.send({ code: 400, message: "Cart not found" });
        }
        cart = new cartModel({ userId, items: [], totalPrice: 0 });
      }
  
      // Find the product in the cart
      const itemIndex = cart.items.findIndex(item => item.productId.equals(productId));
  
      if (action === "add") {
        if (itemIndex !== -1) {
          // Update quantity if item exists
          cart.items[itemIndex].quantity += quantity;
        } else {
          // Add new item to cart
          cart.items.push({ productId, quantity, price: product.price });
        }
      } else if (action === "remove") {
        if (itemIndex === -1) {
          return res.send({ code: 400, message: "Product not found in cart" });
        }
  
        // Reduce quantity or remove item if quantity is 0 or less
        if (cart.items[itemIndex].quantity > quantity) {
          cart.items[itemIndex].quantity -= quantity;
        } else {
          cart.items.splice(itemIndex, 1);
        }
      } else {
        return res.send({ code: 400, message: "Invalid action" });
      }
  
      // Recalculate total price
      cart.totalPrice = cart.items.reduce((total, item) => total + item.quantity * item.price, 0);
  
      await cart.save();
  
      res.send({ code: 200, message: `Item ${action}ed successfully`, cart });
    } catch (error) {
      res.send({ code: 500, message: error.message });
    }
};