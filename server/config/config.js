var fs = require('fs');

function getUserHome() {
    return process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
}

var localConfigPath = getUserHome() + '/easygaadi-config.json';
var projectConfigPath = './config.json';
var selectedConfigPath;

if(fs.existsSync(localConfigPath)) {
    selectedConfigPath = localConfigPath;
} else if(fs.existsSync(projectConfigPath)) {
    selectedConfigPath = projectConfigPath;
} else {
    console.log('CONFIG FILE DOESNT EXIST');
    process.exit();
}

var finalJSONConfig = JSON.parse(fs.readFileSync(selectedConfigPath));

module.exports = finalJSONConfig;

