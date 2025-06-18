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

const sendEmail = async (name, phone, flat, tower, pooja, date) => {
  const mailOptions = {
    from: "nammaganeshaa@gmail.com",
    to: "nammaganeshaa@gmail.com",
    subject: "New Pooja Request",
    text: `Pooja Request Details:
Customer Name: ${name}
Phone Number: ${phone}
Date of Pooja: ${date}
Flat Number: ${flat}
Tower: ${tower}
Pooja Details: ${pooja}
Please confirm your availability for the mentioned date.`,
    html: `
    <html>
      <body style="font-family: 'Segoe UI', sans-serif; background-color: #f6f8fa; color: #333; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
          <h2 style="text-align: center; color: #d35400;">New Pooja Request</h2>
          <p style="font-size: 16px;">Hello Priest <span style="font-size: 20px;">🙏</span> Namastey,</p>
          <p style="font-size: 16px;">One of our customers has requested a priest for their upcoming pooja. Below are the details:</p>
          <table style="width: 100%; font-size: 16px; border-collapse: collapse; margin-top: 20px;">
            <tr>
              <td style="padding: 10px; font-weight: bold; color: #555;">Customer Name:</td>
              <td style="padding: 10px;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; color: #555;">Phone Number:</td>
              <td style="padding: 10px;">${phone}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; color: #555;">Date of Pooja:</td>
              <td style="padding: 10px;">${date}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; color: #555;">Flat Number:</td>
              <td style="padding: 10px;">${flat}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; color: #555;">Tower:</td>
              <td style="padding: 10px;">${tower}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; color: #555;">Pooja Details:</td>
              <td style="padding: 10px;">${pooja}</td>
            </tr>
          </table>
          <p style="margin-top: 30px; font-size: 16px; color: #333;">Please confirm your availability for the mentioned date.</p>
          <p style="font-size: 16px; color:  #555;">Regards,<br/><strong>Namma Ganesha App</strong></p>
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
