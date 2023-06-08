const { readdir } = require('fs/promises');
const path = require("path")
const cron = require("node-cron")
const axios = require('axios')
const date = require('date-and-time')
// Import "timezone" plugin.
const timezone = require('date-and-time/plugin/timezone');

// Apply "timezone" plugin to the library.
date.plugin(timezone);

require("dotenv").config()

//Import express.js module and create its variable.
const express=require('express')
const app=express()

// Utils
let { sendEmailAttachment, sendTeamsNotifications } = require('./utils/utils')


// Messages
let messages = 'List of services\r\n'

messages += "<table style='border: 1px solid #dee2e6; border-collapse: collapse;'>\
        <thead>\
            <tr style='background-color: #212529; color: White;'>\
                <th style='border: 1px solid #dee2e6; border-collapse: collapse; padding: 10px; text-align: center;'>Service Name</th>\
                <th style='border: 1px solid #dee2e6; border-collapse: collapse; padding: 10px; text-align: center;'>Service URL</th>\
                <th style='border: 1px solid #dee2e6; border-collapse: collapse; padding: 10px; text-align: center;'>Category</th>\
                <th style='border: 1px solid #dee2e6; border-collapse: collapse; padding: 10px; text-align: center;'>Status</th>\
                <th style='border: 1px solid #dee2e6; border-collapse: collapse; padding: 10px; text-align: center;'>Test Cases</th>\
            </tr>\
        </thead>\
        <tbody'>"

// Get all python scripts
const findByExtension = async (dir, ext) => {
    const matchedFiles = [];

    const files = await readdir(dir);

    for (const file of files) {
        const fileExt = path.extname(file);

        if (fileExt === `.${ext}`) {
            matchedFiles.push(file);
        }
    }

    return matchedFiles;
};

if(process.env.CRON_TIME && process.env.CRON_URL) {
    // Cron job
    let cronJobTime = process.env.CRON_TIME

    cron.schedule(cronJobTime, async () => {
        console.log(`Cron job started at ${date.formatTZ(new Date(),'DD/MM/YYYY hh:mm:ss', 'Asia/Kolkata')}`)

        axios
            .get(`${process.env.CRON_URL}/automation-testing/`)
            .then(function (response) {
                // handle success
                if(response.status == 200)
                    console.log('Cron job success: ' + response.statusText)
                else
                    console.log('Cron job failed: ' + response.statusText)

                console.log(`Cron job finished at ${date.formatTZ(new Date(),'DD/MM/YYYY HH:mm:ss', 'Asia/Kolkata')}`)
            })
            .catch((err) => {
                console.log('Cron job error: ' + err)
            });
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata"
    });
}

// Routes
let { testCases } = require('./routes/automation-testing')

//Router to handle the incoming request.
app.get("/automation-testing/", async ()=> {
    if(process.env.CRON_TIME && process.env.CRON_URL) {
        const directory = path.join(__dirname, "") + '/scripts'
        const files = await findByExtension(directory, 'py')
        
        for (const file of files) {
            messages += "<tr>"
            messages += "\r\n" + await testCases(directory, file)
            messages += "</tr>"
        }

        messages += "</tbody></table>"
    } else {
        if(!process.env.CRON_TIME) {
            messages += "\r\n" + "---- Enviroment variable CRON_TIME is not set ----" + "\r\n"
        }

        if(!process.env.CRON_URL) {
            messages += "\r\n" + "---- Enviroment variable CRON_URL is not set ----" + "\r\n"
        }
    }

    if(process.env.EMAIL_HOST && process.env.EMAIL_USERNAME && process.env.EMAIL_PASSWORD && process.env.EMAIL_RECIPIENT)
        sendEmailAttachment(messages)
    
    if(process.env.MS_TEAMS_WEBHOOK_URL)
        sendTeamsNotifications(messages)
});

//Creates the server on default port 8000 and can be accessed through localhost:8000
const port = process.env.PORT || 8000
app.listen(port, ()=>console.log(`Server connected to ${port} at ${date.formatTZ(new Date(),'DD/MM/YYYY HH:mm:ss', 'Asia/Kolkata')}`))