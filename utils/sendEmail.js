const nodemailer = require("nodemailer");

function sendEmail(options) {
    const transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    })
    const mailOptions = {
        from: options.from,
        to: options.to,
        subject: options.subject,
        html: options.text,
        attachments: options.data
    }
    transport.sendMail(mailOptions, (err, info) => {
        if (err)
            console.log(err);
    })
    console.log('Email sent')
}

module.exports.sendEmail = sendEmail;