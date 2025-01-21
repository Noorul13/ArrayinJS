module.exports.isAdminLoggedIn = async (req, res, next) => {
    const token = req.headers.authorization;
  
    if (!token) {
      return res.send({ code: 400, message: "No token provided" });
    }
  
    try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET); // Use  actual secret key instead of "auto"
      // const decodedToken = jwt.verify(token, process.env.JWT_SECRET); // Use  actual secret key instead of "auto"
  
      if (!decodedToken) {
        return res.send({ code: 400, message: "Failed to authenticate token" });
      }
  
      if (!decodedToken.admin_id) {
        return res.send({
          code: 400,
          message: "Cannot find admin_id in decoded token",
        });
      }
  
      const foundAdmin = await adminModel.findById(decodedToken.admin_id);
  
      if (!foundAdmin) {
        return res.send({ code: 400, message: "Admin not found" });
      }
  
      req.adminID = decodedToken.admin_id;
      next();
    } catch (err) {
      if (err.name === "JsonWebTokenError") {
        return res.send({ code: 400, message: "Invalid token signature" });
      } else if (err.name === "TokenExpiredError") {
        return res.send({ code: 400, message: "Token has expired" });
      } else {
        return res.send({ code: 500, message: "Internal server error" });
      }
    }
};