import { transporter } from "./emailConfig.middleware.js";
import { Verification_Email_Template } from "./emailTemplate.js";

export const sendVerificationEmail = async (email, verificationCode) => {
  try {
    const response = await transporter.sendMail({
      from: '"MERN Stack App" <roshanshah639@gmail.com>',
      to: email,
      subject: "Email Verification Code | MERN Stack App",
      text: "This is your OTP to verify your email",
      html: Verification_Email_Template.replace(
        "{verificationCode}",
        verificationCode
      ),
    });

    console.log("Email sent successfully", response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
