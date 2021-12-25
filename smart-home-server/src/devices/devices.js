const find = require('local-devices');
const {default: axios} = require('axios');

const storage = require('../storage/storage');
const deviceRequests = require('./deviceRequests');


async function updateMacStorage(){
    let allDevices = await getAllNetworkDevices();

    let storedMacs = [...storage.loadIncludedMacs(), ...storage.loadExcludedMacs()];

    const checkRequestBody = {
        'deviceid': '',
        'data': {}
    }

    let include = [];
    let exclude = [];
    let requests = [];
    for(let device of allDevices){
        if(storedMacs.includes(device.mac)) continue;

        requests.push(
            axios
                .post(`http://${device.ip}:8081/zeroconf/info`, checkRequestBody)
                .then(_ => include.push(device.mac))
                .catch(_ => exclude.push(device.mac))
        );
    }
    await Promise.all(requests);
    
    storage.storeIncludedMacs(...include);
    storage.storeExcludedMacs(...exclude);

    return true;
}

async function getAllNetworkDevices(){ 
    let devices = await find(null, true);
    return devices;
}
async function getNetworkDevice(mac){
    let allDevices = await getAllNetworkDevices();
    let device = allDevices.find(val => val.mac === mac);

    if(device) return device;
    else return false;
}

function getDeviceMacs(){
    return storage.loadIncludedMacs();
}

function getDeviceStats(mac){
    return storage.loadDeviceStats()[mac] || false;
}
async function saveDeviceStats(mac, stats){
    return await storage.storeDeviceStats(mac, stats);
}
async function updateDeviceStats(...macs){
    let succes = true;
    for(let mac of macs){
        let device = await getNetworkDevice(mac);
        if(!device){
            succes = false;
            continue;
        }

        let newDeviceStats = await deviceRequests.updateDevice(device.ip);
        if(!newDeviceStats){
            succes = false;
            continue;
        }

        await saveDeviceStats(mac, newDeviceStats);
    }
    return succes;
}

async function setDeviceState(state, ...macs){
    let succes = true;
    for(let mac of macs){
        let device = await getNetworkDevice(mac);
        if(!device){
            succes = false;
            continue;
        }

        let newDeviceStats = await deviceRequests.setState(device.ip, state);
        if(!newDeviceStats){
            succes = false;
            continue;
        }

        await saveDeviceStats(mac, newDeviceStats);
    }
    return succes;
}
async function setDeviceStartup(state, ...macs){
    let succes = true;
    for(let mac of macs){
        let device = await getNetworkDevice(mac);
        if(!device){
            succes = false;
            continue;
        }

        let newDeviceStats = await deviceRequests.setStartup(device.ip, state);
        if(!newDeviceStats){
            succes = false;
            continue;
        }

        await saveDeviceStats(mac, newDeviceStats);
    }
    return succes;
}

function deviceExists(mac){
    return getDeviceMacs().includes(mac);
}


module.exports = {
    updateMacStorage: updateMacStorage,

    getNetworkDevice: getNetworkDevice,

    getDeviceMacs: getDeviceMacs,

    getDeviceStats: getDeviceStats,
    saveDeviceStats: saveDeviceStats,
    updateDeviceStats: updateDeviceStats,

    setDeviceState: setDeviceState,
    setDeviceStartup: setDeviceStartup,

    deviceExists: deviceExists
}