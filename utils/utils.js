const nodemailer = require('nodemailer')
const { IncomingWebhook } = require("ms-teams-webhook")
const date = require('date-and-time')
// Import "timezone" plugin.
const timezone = require('date-and-time/plugin/timezone');

// Apply "timezone" plugin to the library.
date.plugin(timezone);

require("dotenv").config()

// Read a url from the environment variables
const url = process.env.MS_TEAMS_WEBHOOK_URL
if (!url) {
    throw new Error("MS_TEAMS_WEBHOOK_URL is required")
}

// Initialize
const webhook = new IncomingWebhook(url)

// Send email attachment
exports.sendEmailAttachment = function(messages) {
    let mailTransporter = nodemailer.createTransport({
        service: 'outlook',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    let to_addresses = [];

    to_addresses = [
        process.env.EMAIL_RECIPIENT
    ];
    
    let mailDetails = {
        from: process.env.EMAIL_USERNAME,
        to: to_addresses,
        subject: 'Selenium automation test suite',
        html: messages,
    };

    mailTransporter.sendMail(mailDetails, function(err, data) {
        if(err) {
            console.log('Error sending mail:', err)
        } else {
            console.log('Email sent successfully')
        }
    });
}

exports.sendTeamsNotifications = async function(messages) {
    await webhook.send({
        "@type": "MessageCard",
        "@context": "https://schema.org/extensions",
        summary: "Automation test suite to test the availability od services",
        themeColor: "AD1F7A",
        title: 'Automation Test Suite',
        sections: [
            {
                activityTitle: "Company Name",
                activitySubtitle: "Created on " + date.formatTZ(new Date(),'DD/MM/YYYY HH:mm:ss', 'Asia/Kolkata'),
                activityImage: "",
                markdown: true
            },
            {
                startGroup: true,
                text: messages
            }
        ],
    }).then(function() {
        console.log('Teams notification sent successfully')
    });
}