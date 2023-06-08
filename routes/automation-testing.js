const path = require("path")
require("dotenv").config()

//Import PythonShell module.
const {PythonShell} =require('python-shell')

exports.testCases = async function(directory, filename) {
    let messages = ''

    //Here are the option object in which arguments can be passed for the python_test.js.
    let options = {
        mode: 'text',
        pythonOptions: ['-u'], // get print results in real-time
        scriptPath: directory //If you are having *****.py script in same folder, then it's optional.
    };
    
    return new Promise((resolve, reject) => {
        let shell = new PythonShell(filename, options)
    
        shell.on('message', function (message) {
            // received a message sent from the Python script (a simple "print" statement)
            messages = messages + message + "\r\n"
        });
    
        shell.end(function (err, code, signal) {
            resolve(messages)
        });
    })
}