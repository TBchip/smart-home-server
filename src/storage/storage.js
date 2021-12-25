const path = require('path');
const { v4: uuidv4 } = require('uuid');

let db;

let includedMacs;
let excludedMacs;
let deviceStats;
let schedules;
let scheduleLinks;

async function dbInit(){
    const lowdb = await import('lowdb');

    const dbPath = path.resolve(__dirname, '../../storage/db.json');
    const adapter = new lowdb.JSONFile(dbPath);
    db = new lowdb.Low(adapter);

    await db.read();

    if(!db.data){ // create database
        let defaultData = {
            includedMacs: [],
            excludedMacs: [],
            deviceStats: {},
            schedules: [],
            scheduleLinks: {}
        }

        db.data = defaultData;
        await db.write();
    }

    includedMacs = db.data.includedMacs;
    excludedMacs = db.data.excludedMacs;
    deviceStats = db.data.deviceStats;
    schedules = db.data.schedules;
    scheduleLinks = db.data.scheduleLinks;

    return true;
}

function loadIncludedMacs(){
    return includedMacs;
}
async function storeIncludedMacs(...macs){
    includedMacs.push(...macs);
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


module.exports = {
    dbInit: dbInit,

    loadIncludedMacs: loadIncludedMacs,
    storeIncludedMacs: storeIncludedMacs,

    loadExcludedMacs: loadExcludedMacs,
    storeExcludedMacs: storeExcludedMacs,

    loadDeviceStats: loadDeviceStats,
    storeDeviceStats: storeDeviceStats,

    loadSchedules: loadSchedules,
    storeSchedule: storeSchedule,
    updateSchedule: updateSchedule,
    deleteSchedule: deleteSchedule,

    loadScheduleLinks: loadScheduleLinks,
    storeScheduleLink: storeScheduleLink,
    deleteScheduleLink: deleteScheduleLink
}