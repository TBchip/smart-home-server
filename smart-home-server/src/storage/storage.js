const fs = require('fs');
const path = require('path')

const storagePath = path.resolve(__dirname, '../../storage');
const macAdressesPath = path.resolve(storagePath, './macAdresses.json');

function createMacAdressesFile(){
    if(!fs.existsSync(storagePath)) fs.mkdirSync(storagePath);

    let data = {"macAdresses":{}}
    fs.writeFileSync(macAdressesPath, JSON.stringify(data));
}

function loadMacAdresses(){
    if(!fs.existsSync(macAdressesPath)) createMacAdressesFile();

    let data = fs.readFileSync(macAdressesPath).toString();
    let json = JSON.parse(data);
    
    return json;
}

module.exports = {
    loadMacAdresses: loadMacAdresses
}