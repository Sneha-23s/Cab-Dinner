const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors'); // Import the cors package
const app = express();

const port = 3001; // Use the port you want
const allowedOrigins = ['http://localhost:3002', 'http://localhost:3003'];

app.use(cors({
  origin: allowedOrigins
}));
app.use(express.json());

app.post('/api/send-email', async (req, res) => {
  const { receivers } = req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "sneha23cse@gmail.com",
      pass: "aecaawbsymxmrxvc"
    },
  });

  const mailOptions = {
    from: 'sneha23cse@gmail.com',
    to: receivers.join(','),
    subject: 'Test',
    html: '<h1>Welcome</h1>'
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Mail sent successfully", info.response);
    res.status(200).send("Mail sent successfully");
  } catch (error) {
    console.error("Error sending mail:", error);
    res.status(500).send("Error sending mail " + error.message);
  }
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
