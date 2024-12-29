import nodemailer from "nodemailer";

export const sentMail = async (email: string, subject: string, body: string): Promise<boolean> => {
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
               subject: subject,
               html: body,
          };

          await transporter.sendMail(mailOptions);

          return true;
     } catch (error: any) {
          console.log(error.message);
          return false;
     }
};
