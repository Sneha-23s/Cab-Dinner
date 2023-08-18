const express = require('express');
const nodemailer = require('nodemailer');
const app = express();

app.post('/api/send-email', async (req, res) => {
const receivers=['sneha23022002@gmail.com','aadhithyaveer126@gmail.com'];
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "sneha23cse@gmail.com",
        pass: "bmnjslgeikdhwleu"
    },
});

const mailOptions = {
    from: 'sneha23cse@gmail.com',
    to: receivers.join(','),
    subject: 'Test',
    html: '<h1> Welcome</h1>'
};

transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
        console.log(error);
    } else {
        console.log("Mail sent successfully" + info.response);
    }
});
})