const nodeSchedule = require('node-schedule');
const { v4: uuidv4 } = require('uuid');

const storage = require('../storage/storage');
const devices = require('../devices/devices');

function getSchedules(){
    return storage.loadSchedules();
}
function getSchedule(uuid){
    return getSchedules().find(val => val.uuid === uuid);
}
function scheduleExists(uuid){
    return getSchedule(uuid) ? true : false;
}
async function saveSchedule(schedule, uuid=null){
    if(uuid){
        uuid = await storage.updateSchedule(uuid, schedule);
        restartSchedule(uuid);
    }else{
        uuid = await storage.storeSchedule(schedule);
        startSchedule(uuid);
    }
    
    return true;
}
async function deleteSchedule(uuid){
    let succes = storage.deleteSchedule(uuid);
    if(succes) {
        cancelSchedule(uuid);
        return true;
    }else{
        return false;
    }
}

function getLinks(){
    return storage.loadScheduleLinks();
}
function getLinkedMacs(uuid){
    return getLinks()[uuid];
}
async function linkMac(uuid, mac){
    await unlinkMac(mac);
    let out = await storage.storeScheduleLink(uuid, mac);
    restartSchedule(uuid);
    return out;
}
async function unlinkMac(mac){
    let oldLinkedSchedule = getLinkedSchedule(mac);
    let out = await storage.deleteScheduleLink(mac);
    if(oldLinkedSchedule != 'unlinked') restartSchedule(oldLinkedSchedule);
    return out;
}
function getLinkedSchedule(mac){
    let allScheduleLinks = getLinks();
    for(let uuid in allScheduleLinks){
        if(allScheduleLinks[uuid].includes(mac)){
            return uuid;
        }
    }
    return 'unlinked';
}

function startSchedule(uuid){
    let schedule = getSchedule(uuid);

    for(let event of schedule.on){
        event = event.split(' ');

        const rule = new nodeSchedule.RecurrenceRule();
        if(event[0] !== '*') rule.minute = event[0];
        if(event[1] !== '*') rule.hour = event[1];
        if(event[2] !== '*') rule.dayOfWeek = event[2];
        
        let jobName = schedule.uuid + '_' + uuidv4();
        nodeSchedule.scheduleJob(jobName, rule, function(){
            let macs = getLinkedMacs(schedule.uuid);
            devices.setDeviceState(1, ...macs);
        });
    }
    for(let event of schedule.off){
        event = event.split(' ');

        const rule = new nodeSchedule.RecurrenceRule();
        if(event[0] !== '*') rule.minute = event[0];
        if(event[1] !== '*') rule.hour = event[1];
        if(event[2] !== '*') rule.dayOfWeek = event[2];
        
        let jobName = schedule.uuid + '_' + uuidv4();
        nodeSchedule.scheduleJob(jobName, rule, function(){
            let macs = getLinkedMacs(schedule.uuid);
            devices.setDeviceState(0, ...macs);
        });
    }
    return true;
}
function cancelSchedule(uuid){
    for(let jobName in nodeSchedule.scheduledJobs){
        if(jobName.includes(uuid)) nodeSchedule.scheduledJobs[jobName].cancel();
    }
    return true;
}
function restartSchedule(uuid){
    cancelSchedule(uuid);
    startSchedule(uuid);
}
function startAllSchedules(){
    let schedules = getSchedules();
    schedules.forEach(schedule => {
        startSchedule(schedule.uuid);
    });
}

module.exports = {
    getSchedules: getSchedules,
    getSchedule: getSchedule,
    scheduleExists: scheduleExists,
    saveSchedule: saveSchedule,
    deleteSchedule: deleteSchedule,
    getLinkedSchedule: getLinkedSchedule,

    getLinks: getLinks,
    linkMac: linkMac,
    unlinkMac: unlinkMac,

    startAllSchedules: startAllSchedules
}