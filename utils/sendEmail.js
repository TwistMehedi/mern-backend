const nodeMailer = require("nodemailer");

const sendEmail = async (options) => {
  try {
    let transporter = nodeMailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: true,
      service: process.env.SERVICE,
      auth: {
        use: process.env.SMPT_MAIL,
        pass: process.env.SMPT_PASSWORD,
      },
    });

    let mailOption = {
      from: process.env.SMPT_MAIL,
      to: options.email,
      subject: options.subject,
      text: options.massage,
    };

    const result = await transporter.sendEmail(mailOption);
    return result;
  } catch (error) {
    return error;
  }
};

module.exports = sendEmail;
