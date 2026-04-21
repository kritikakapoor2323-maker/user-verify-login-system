const nodemailer = require("nodemailer");

const sendEmail = async (to, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Using EMAIL_USER to match your .env
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: "OTP Verification",
      html: `<h2>Your OTP is: ${otp}</h2>`
    });

    console.log("Email sent successfully");
  } catch (error) {
    console.log("Email error:", error);
    throw error; // Let the controller know the email failed so it can respond appropriately
  }
};

module.exports = sendEmail;
