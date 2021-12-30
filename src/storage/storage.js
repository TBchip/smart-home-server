const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const dbFolderPath = path.resolve(__dirname, '../../storage');
const dbPath = path.resolve(dbFolderPath, 'db.json');

let db;

let includedMacs;
let excludedMacs;

let deviceStats;
let deviceNames;

let schedules;
let scheduleLinks;

let netDevices;

async function dbInit(){
    const lowdb = await import('lowdb');

    if(!fs.existsSync(dbFolderPath)) fs.mkdirSync(dbFolderPath);

    const adapter = new lowdb.JSONFile(dbPath); 
    db = new lowdb.Low(adapter);

    await db.read();

    if(!db.data){ // create database
        let defaultData = {
            includedMacs: [],
            excludedMacs: [],

            deviceStats: {},
            deviceNames: {},

            schedules: [],
            scheduleLinks: {},

            netDevices: [],
        }

        db.data = defaultData;
        await db.write();
    }

    includedMacs = db.data.includedMacs;
    excludedMacs = db.data.excludedMacs;

    deviceStats = db.data.deviceStats;
    deviceNames = db.data.deviceNames;

    schedules = db.data.schedules;
    scheduleLinks = db.data.scheduleLinks;

    netDevices = db.data.netDevices;

    return true;
}

function loadIncludedMacs(){
    return includedMacs;
}
async function storeIncludedMacs(...macs){
    includedMacs.push(...macs);
    for(let mac of macs){
        deviceStats[mac] = {};
        deviceNames[mac] = "unnamed_" + uuidv4().substring(0, 6);
    }
    await db.write();
    return true;
}

function loadExcludedMacs(){
    return excludedMacs;
}
async function storeExcludedMacs(...macs){
    excludedMacs.push(...macs);
    await db.write();
    return true;
}

function loadDeviceStats(){
    return deviceStats;
}
async function storeDeviceStats(mac, newDeviceStats){
    deviceStats[mac] = newDeviceStats;
    await db.write();
    return true;
}

function loadDeviceNames(){
    return deviceNames;
}
async function storeDeviceName(mac, deviceName){
    deviceNames[mac] = deviceName;
    await db.write();
    return true;
}

function loadSchedules(){
    return schedules;
}
async function storeSchedule(schedule){
    schedule.uuid = uuidv4();
    schedules.push(schedule);
    scheduleLinks[schedule.uuid] = [];
    await db.write();
    return schedule.uuid;
}
async function updateSchedule(uuid, schedule){
    let oldScheduleIndex = schedules.findIndex(val => val.uuid === uuid);
    if(oldScheduleIndex !== -1) schedules.splice(oldScheduleIndex, 1);

    schedule.uuid = uuid;
    schedules.push(schedule);
    await db.write();
    return schedule.uuid;
}
async function deleteSchedule(uuid){
    let scheduleIdx = schedules.findIndex(val => val.uuid === uuid);
    if(scheduleIdx !== -1) schedules.splice(scheduleIdx, 1);

    delete scheduleLinks[uuid];
    
    await db.write();
    return true;
}

function loadScheduleLinks(){
    return scheduleLinks;
}
async function storeScheduleLink(scheduleUuid, mac){
    scheduleLinks[scheduleUuid].push(mac);
    await db.write();
    return true;
}
async function deleteScheduleLink(mac){
    for(let schedule in scheduleLinks){
        let idx = scheduleLinks[schedule].findIndex(val => val === mac);
        if(idx !== -1) scheduleLinks[schedule].splice(idx, 1);
    }
    await db.write();
    return true;
}

function loadNetDevices(){
    return netDevices;
}
async function storeNetDevices(newNetDevices){
    netDevices.filter(_ => false); //clear array
    netDevices.push(...newNetDevices); //add new net devices
    await db.write();
    return true;
}


module.exports = {
    dbInit: dbInit,

    loadIncludedMacs: loadIncludedMacs,
    storeIncludedMacs: storeIncludedMacs,

    loadExcludedMacs: loadExcludedMacs,
    storeExcludedMacs: storeExcludedMacs,

    loadDeviceStats: loadDeviceStats,
    storeDeviceStats: storeDeviceStats,

    loadDeviceNames: loadDeviceNames,
    storeDeviceName: storeDeviceName,

    loadSchedules: loadSchedules,
    storeSchedule: storeSchedule,
    updateSchedule: updateSchedule,
    deleteSchedule: deleteSchedule,

    loadScheduleLinks: loadScheduleLinks,
    storeScheduleLink: storeScheduleLink,
    deleteScheduleLink: deleteScheduleLink,

    loadNetDevices: loadNetDevices,
    storeNetDevices: storeNetDevices
}