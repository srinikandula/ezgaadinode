var fs = require('fs');

function getUserHome() {
    return process.env[(process.platform === 'linux') ? 'USERPROFILE' : '/home/sai/'];
}

var localConfigPath = getUserHome() + '/easygaadi-config.json';
var projectConfigPath = __dirname+'/config.json';
var selectedConfigPath;
// console.log(fs.existsSync(projectConfigPath), projectConfigPath);
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

