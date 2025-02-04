const sendForgetPasswordLink = async (name, email, userId, token, url) => {
    try {
  
      await transporter.sendMail({
        from: "bhadauriaritik@gmail.com",
        to: email,
        subject: "Verify Your Account",
        html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>              
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 2;
                        margin: 0;
                        padding: 0;
                        background-color: #f8f8f8;
                    }
                    .container {
                        max-width: 600px;
                        padding: 20px;
                    }
                    h1, p {
                        margin: 0;
                        padding: 0;
                    }
                    a {
                        color: #007bff;
                        text-decoration: none;
                        border-radius: 5px;
                        display: inline-block;
                    }
                    a:hover {
                        color: #37b7f1;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h3>Hi, ${name}</h3>
  
                    <p>Welcome to poultryfy! To get started,</p>
  
                    <p>Your forget password request has been recieved.</p><br/>
  
                    <p><a href="${url}?sellerId=${userId}&email=${email}&token=${token}" style="color: #fff; background-color: #007bff; padding: 5px 16px;">Click to reset password.</a></p><br/>
  
                    <p>This link will expire when you used it. If you didn’t create an account with us, you can safely ignore this email.</p>
  
                    <p>Thank you for joining us!</p><br>
                    
                    <p>Best Regards,<br>- The Poultryfy Team</p>
  
                </div>
            </body>
            </html>`,
      });
  
      console.log("Verification email sent successfully");
    } catch (error) {
      console.error("Failed to send verification email:", error);
    }
  };
  
  module.exports.forgetPassword = async (req, res) => {
    try {
      // Validation checks
  
      await check("email").isEmail().normalizeEmail().run(req);
  
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log(errors);
        return res.send({
          code: 400,
          errors: errors.array(),
          message: "Bad Request! Incomplete details",
        });
      }
      // Check if email exists
      let seller = await sellerModel.findOne({ email: req.body.email });
      if (!seller) {
        return res
          .send({ code: 400, message: "No seller found with the given Email." });
      }
  
      if (seller.status !== "approved") {
        return res.send({ code: 400, message: "Seller account is not approved." });
      }
  
      const token = jwt.sign({ sellerId: seller._id }, process.env.JWT_SECRET, { expiresIn: '5min' });
  
  
      const url = process.env.SELLER_BASE_URL || "http:localhost:3000/#/resetPassword";
      sendForgetPasswordLink(seller.vendorName, seller.email, seller._id, token, url);
  
      return res.send({
        code: 200,
        message: "Password reset link sent to your email",
      });
  
    } catch (error) {
      console.error(error);
      return res
        .send({ code: 500, message: "Oops, something went wrong!" });
    }
  }