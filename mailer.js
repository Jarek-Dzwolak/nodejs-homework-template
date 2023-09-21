const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const uuid = require("uuid");
dotenv.config();

const secret = process.env.MAILER;

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "testowygmialjarek@gmail.com",
    pass: secret,
  },
  tls: {
    rejectUnauthorized: false, 
  },
});

function generateVerificationToken() {
  return uuid.v4();
}

function sendVerificationEmail(email, verificationToken) {
  const mailOptions = {
    from: "testowygmialjarek@gmail.com",
    to: email,
    subject: "Potwierdzenie rejestracji",
    text: `Kliknij poniższy link, aby potwierdzić rejestrację:
      http://localhost:3000/api/users/verify/${verificationToken}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Błąd podczas wysyłania e-maila weryfikacyjnego:", error);
    } else {
      console.log("E-mail weryfikacyjny został wysłany:", info.response);
    }
  });
}

module.exports = {
  generateVerificationToken,
  sendVerificationEmail,
};
