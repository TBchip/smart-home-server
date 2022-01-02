const find = require('local-devices');
const {default: axios} = require('axios');

const storage = require('../storage/storage');
const deviceRequests = require('./deviceRequests');
const schedules = require('../schedules/schedules');


async function updateMacStorage(){
    let allDevices = getNetDevices();

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
    
    await storage.storeIncludedMacs(...include);
    await storage.storeExcludedMacs(...exclude);

    return true;
}

function getNetDevices(){ 
    return storage.loadNetDevices();
}
function getNetDevice(mac){ 
    let devices = getNetDevices();
    return devices.find(val => val.mac === mac);
}
async function updateNetDevices(){
    let devices = await find(null, true);
    await storage.storeNetDevices(devices);
    return true;
}

function getAllDeviceMacs(){
    return storage.loadIncludedMacs();
}

function getAllDeviceStats(){
    return storage.loadDeviceStats();
}
function getDeviceStats(mac){
    return getAllDeviceStats()[mac] || false;
}
async function saveDeviceStats(mac, stats){
    return await storage.storeDeviceStats(mac, stats);
}
async function updateDeviceStats(...macs){
    let succes = true;
    for(let mac of macs){
        let device = getNetDevice(mac);
        if(!device){
            succes = false;
            continue;
        }

        let newDeviceStats = await deviceRequests.getDeviceStats(device.ip);
        if(!newDeviceStats){
            succes = false;
            continue;
        }

        await saveDeviceStats(mac, newDeviceStats);
    }
    return succes;
}

function getAllDeviceNames(){
    return storage.loadDeviceNames();
}
function getDeviceName(mac){
    return getAllDeviceNames()[mac] || false;
}
async function setDeviceName(mac, name){
    return await storage.storeDeviceName(mac, name);
}

async function setDeviceState(state, ...macs){
    let succes = true;
    for(let mac of macs){
        let device = await getNetDevice(mac);
        if(!device){
            succes = false;
            continue;
        }

        if( !await deviceRequests.setState(device.ip, state) ){
            succes = false;
            continue;
        }

        let newDeviceStats = await deviceRequests.getDeviceStats(device.ip);
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
        let device = await getNetDevice(mac);
        if(!device){
            succes = false;
            continue;
        }

        if( !await deviceRequests.setStartup(device.ip, state) ){
            succes = false;
            continue;
        }

        let newDeviceStats = await deviceRequests.getDeviceStats(device.ip);
        if(!newDeviceStats){
            succes = false;
            continue;
        }

        await saveDeviceStats(mac, newDeviceStats);
    }
    return succes;
}

function deviceExists(mac){
    return getAllDeviceMacs().includes(mac);
}


module.exports = {
    updateMacStorage: updateMacStorage,

    getNetDevices: getNetDevices,
    updateNetDevices: updateNetDevices,

    getAllDeviceMacs: getAllDeviceMacs,

    getAllDeviceStats: getAllDeviceStats,
    getDeviceStats: getDeviceStats,
    updateDeviceStats: updateDeviceStats,

    getAllDeviceNames: getAllDeviceNames,
    getDeviceName: getDeviceName,
    setDeviceName: setDeviceName,

    setDeviceState: setDeviceState,
    setDeviceStartup: setDeviceStartup,

    deviceExists: deviceExists
}