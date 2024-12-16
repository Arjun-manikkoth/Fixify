import nodemailer from "nodemailer";

export const sentOtpVerificationMail = async (email: string, otp: string): Promise<boolean> => {
  try {

//smtp server set up
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.TRANSPORTER_GMAIL,
        pass: process.env.TRANSPORTER_PASSWORD,
      },
    });
   
    const mailOptions = {
      from: process.env.TRANSPORTER_GMAIL,
      to: email,
      subject: "Verification mail",
      html: `<p>Enter this code <b>${otp}</b> to verify your Fixify account.</p><p>This code expires in <b>2 Minutes</b></p>`,
    };

    
    await transporter.sendMail(mailOptions);

    return true;

  } catch (error: any) {

    console.log(error.message);
    return false;
    
  }
};
