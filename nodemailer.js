const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.USER,
    pass: process.env.PASSWORD,
  },
});

const sendEmail = async (name, phone, flat, tower, pooja, date, nakshatra, rasi, gotra) => {
  const mailOptions = {
    from: process.env.FROM_MAIL,
    to: process.env.TO_MAIL,
    subject: "New Pooja Request",
    text: `Pooja Request Details:
      Devotee Name: ${name}
      Phone Number: ${phone}
      Date of Pooja: ${date}
      Flat Number: ${flat}
      Tower: ${tower}
      Nakshatra: ${nakshatra}
      Rasi: ${rasi}
      Gotra: ${gotra}
      Pooja Details: ${pooja}
      Please confirm your availability.`,
    html: `
    <html>
      <body style="font-family: 'Segoe UI', sans-serif; background-color: #f6f8fa; color: #333; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
          <h2 style="text-align: center; color: #d35400;">New Pooja Request</h2>

          <p style="font-size: 16px;"><strong>Hello Priest, <br/>Namaste 🙏</strong></p>

          <p style="font-size: 16px;">One of our devotees has kindly requested your presence to perform the pooja as per the details mentioned below. We kindly request you to review the information at your convenience.</p>

          <table style="width: 100%; font-size: 16px; border-collapse: collapse; margin-top: 20px;">
            <tr>
              <td style="padding: 10px; font-weight: bold; color: #555;">Devotee Name:</td>
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
              <td style="padding: 10px; font-weight: bold; color: #555;">Nakshatra:</td>
              <td style="padding: 10px;">${nakshatra}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; color: #555;">Rasi:</td>
              <td style="padding: 10px;">${rasi}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; color: #555;">Gotra:</td>
              <td style="padding: 10px;">${gotra}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; color: #555;">Pooja Details:</td>
              <td style="padding: 10px;">${pooja}</td>
            </tr>
          </table>

          <p style="margin-top: 30px; font-size: 16px;">Thank you for your time and support.</p>

          <p style="font-size: 16px;">Namaste!<br/><strong>Namma Ganesha Team</strong></p>
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

const sendContactEmail = async (name, phone, nakshatra, rasi,pooja, date) => {
  const mailOptions = {
    from: process.env.FROM_MAIL,
    to: process.env.TO_MAIL,
    subject: "Contact Us - Namma Ganesha",
    text: `Contact Details:
      Devotee Name: ${name}
      Phone Number: ${phone}
      Date of Pooja: ${date}
      Nakshatra: ${nakshatra}
      Rasi: ${rasi}
      Pooja Details: ${pooja}`,
    html: `
   <html>
  <body style="font-family: 'Segoe UI', sans-serif; background-color: #f6f8fa; color: #333; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
      <h2 style="text-align: center; color: #d35400;">📩 New Contact Submission</h2>

      <p style="font-size: 16px;"><strong>Dear Team,</strong></p>

      <p style="font-size: 16px;">
        A devotee has reached out through the contact form.  
        Here are the details they provided:
      </p>

      <table style="width: 100%; font-size: 16px; border-collapse: collapse; margin-top: 20px;">
        <tr>
          <td style="padding: 10px; font-weight: bold; color: #555;">Name:</td>
          <td style="padding: 10px;">${name}</td>
        </tr>
        <tr>
          <td style="padding: 10px; font-weight: bold; color: #555;">Phone:</td>
          <td style="padding: 10px;">${phone}</td>
        </tr>
        <tr>
          <td style="padding: 10px; font-weight: bold; color: #555;">Nakshatra:</td>
          <td style="padding: 10px;">${rasi}</td>
        </tr>
        <tr>
          <td style="padding: 10px; font-weight: bold; color: #555;">Rasi:</td>
          <td style="padding: 10px;">${nakshatra}</td>
        </tr>
        <tr>
          <td style="padding: 10px; font-weight: bold; color: #555;">Message:</td>
          <td style="padding: 10px;">${pooja}</td>
        </tr>
        <tr>
          <td style="padding: 10px; font-weight: bold; color: #555;">Preferred Date:</td>
          <td style="padding: 10px;">${date}</td>
        </tr>
      </table>

      <p style="margin-top: 30px; font-size: 16px;">
        Kindly follow up with the devotee at your earliest convenience.  
        Thank you.
      </p>

      <p style="font-size: 16px;">
        Regards,<br/>
        <strong>Namma Ganesha Team</strong>
      </p>
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



const sendOtpEmail = async (to, otp) => {
  const mailOptions = {
    from: process.env.FROM_MAIL,
    to,
    subject: "Password Reset OTP",
    text: `Your verification code is: ${otp}\nThis code will expire in 5 minutes.\nIf you did not request a password reset, please ignore this email.`,
    html: `
    <html>
      <body style="font-family: 'Segoe UI', sans-serif; background:#f6f8fa; color:#333; padding:20px;">
        <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 24px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
          <h2 style="text-align:center; color:#1e3a8a;">Password Reset Verification</h2>
          <p>Use the following 4-digit code to reset your password. It will expire in <b>5 minutes</b>:</p>
          <div style="font-size:28px; letter-spacing:10px; font-weight:bold; text-align:center; margin:20px 0; padding:12px; background:#f9fafb; border:1px dashed #cbd5e1; border-radius:6px;">
            ${otp}
          </div>
          <p>If you didn't request this, you can safely ignore this email.</p>
          <p style="margin-top:20px; font-size:14px; color:#6b7280;">— Namma Ganesha Team</p>
        </div>
      </body>
    </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("OTP Email sent:", info.response);
    return "OTP mail sent successfully";
  } catch (error) {
    console.error("Error sending OTP email:", error);
    return "OTP mail failed to send";
  }
};


module.exports = {sendEmail,sendOtpEmail,sendContactEmail};
