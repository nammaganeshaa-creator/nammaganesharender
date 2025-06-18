const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "nammaganeshaa@gmail.com",
    pass: "sdgmlurfwlkjfzcz",
  },
});

const sendEmail = async ( name, phone, flat, tower, pooja, date) => {
  const receipientEmail = process.env.To_MAIL;
  console.log("Recipient Email:", receipientEmail);
  if (!receipientEmail) {
    console.error("Missing recipient email. Please check .env file (To_MAIL).");
    return;
  }
  const mailOptions = {
    from: "nammaganeshaa@gmail.com",
    to: receipientEmail,
    subject: "New Pooja Request",
    text: `Pooja Request Details:
Name: ${name}
Phone: ${phone}
Flat: ${flat}
Tower: ${tower}
Pooja: ${pooja}
Date: ${date}
`,
    html: `
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; color: #333; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          <h2 style="text-align: center; color: #ff6600;">New Pooja Request</h2>
          <p style="font-size: 16px;">Dear Panthulu Garu,</p>
          <p style="font-size: 16px;">You have received a new request for a Pooja with the following details:</p>
          <table style="width: 100%; font-size: 16px; border-collapse: collapse; margin-top: 20px;">
            <tr><td style="padding: 8px;"><strong>Name:</strong></td><td style="padding: 8px;">${name}</td></tr>
            <tr><td style="padding: 8px;"><strong>Phone:</strong></td><td style="padding: 8px;">${phone}</td></tr>
            <tr><td style="padding: 8px;"><strong>Flat:</strong></td><td style="padding: 8px;">${flat}</td></tr>
            <tr><td style="padding: 8px;"><strong>Tower:</strong></td><td style="padding: 8px;">${tower}</td></tr>
            <tr><td style="padding: 8px;"><strong>Pooja Name:</strong></td><td style="padding: 8px;">${pooja}</td></tr>
            <tr><td style="padding: 8px;"><strong>Date:</strong></td><td style="padding: 8px;">${date}</td></tr>
          </table>
          <p style="margin-top: 30px; font-size: 16px;">Please confirm the request at your earliest convenience.</p>
          <p style="font-size: 16px;">Regards,<br/>Namma Ganesha App</p>
        </div>
      </body>
    </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    return "Mail sent successfully";
  } catch (error) {
    console.error("Error sending email:", error);
    return "Mail failed to send";
  }
};

// sendEmail("nammaganeshaa@gmail.com", "1234567890", "Flat 101", "Tower A", "Ganesh Chaturthi", new Date())

module.exports = sendEmail;
