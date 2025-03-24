import { transporter } from "./emailConfig.middleware.js";
import { Password_Reset_Email_Template } from "./passwordResetEmail.js";

export const sendPasswordResetEmail = async (email, forgotPasswordToken) => {
  try {
    const response = await transporter.sendMail({
      from: '"MERN Stack App" <roshanshah639@gmail.com>',
      to: email,
      subject: "Password Reset Token | MERN Stack App",
      text: "This is your OTP to reset your password",
      html: Password_Reset_Email_Template.replace(
        "{forgotPasswordToken}",
        forgotPasswordToken
      ),
    });

    console.log("Email sent successfully", response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
