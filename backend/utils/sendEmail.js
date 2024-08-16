import nodeMailer from "nodemailer";

export const sendEmail = async (email, subject, message) => {
  console.log(`sending mail to ${email}`);
  const transporter = nodeMailer.createTransport({
    host: process.env.SMTP_HOST,
    service: process.env.SMTP_SERVICE,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
    // secure: true,
    // debug: true,
    // logger: true,
  });

  const options = {
    from: process.env.SMTP_MAIL,
    to: email,
    subject,
    text: message,
  };

  await transporter.sendMail(options);
};
