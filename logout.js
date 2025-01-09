const logoutDoctor = async (req, res) => {
    const { email } = req.body;
  
    try {
      const doctor = await Doctor.findOne({ email });
      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }
  
      if (!doctor.current_login_start) {
        return res.status(400).json({ message: "Doctor is not currently logged in" });
      }
  
      // Calculate session duration
      const currentTime = new Date();
      const sessionDuration = Math.floor(
        (currentTime - doctor.current_login_start) / (1000 * 60) // Convert milliseconds to minutes
      );
  
      // Update total_login_time and clear current_login_start
      doctor.total_login_time += sessionDuration;
      doctor.current_login_start = null;
      await doctor.save();
  
      res.status(200).json({
        message: "Logout successful",
        total_login_time: doctor.total_login_time,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  