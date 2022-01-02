const express = require('express');

const schedules = require('../../schedules/schedules');
const devices = require('../../devices/devices');

let router = express.Router();

router.get("/get", async (req, res) => {
    let uuid = req.body.uuid;

    let error;
    let errorMsg;
    if(!uuid) {
        error = 400;
        errorMsg = 'please supply {uuid}';
    }else if(!schedules.scheduleExists(uuid)){
        error = 400;
        errorMsg = `no schedule with uuid: ${uuid}`;
    }

    if(error){
        res.status(error);
        res.send(errorMsg);
        res.end();
        return;
    }

    let schedule = schedules.getSchedule(uuid);
    
    res.status(200);
    res.send(schedule);
    res.end();
});
router.get("/getall", async (req, res) => {
    let allSchedules = schedules.getSchedules();
    
    res.status(200);
    res.send(allSchedules);
    res.end();
});

router.post("/save", async (req, res) => {
    let schedule = req.body.schedule;
    let uuid = req.body.uuid;

    let error;
    let errorMsg;
    if(!schedule) {
        error = 400;
        errorMsg = 'please supply {schedule}';
    }else if(!schedule["on"] || !schedule["off"]){
        error = 400;
        errorMsg = 'schedule should have on and off arrays';
    }
    
    if(uuid && !schedules.scheduleExists(uuid)){
        error = 400;
        errorMsg = `no schedule with uuid: ${uuid}`;
    }

    if(error){
        res.status(error);
        res.send(errorMsg);
        res.end();
        return;
    }

    if(uuid){
        await schedules.saveSchedule(schedule, uuid);
    }else{
        await schedules.saveSchedule(schedule);
    }

    let allSchedules = schedules.getSchedules();
    
    res.status(200);
    res.send(allSchedules);
    res.end();
});

router.post("/delete", async (req, res) => {
    let uuid = req.body.uuid;

    let error;
    let errorMsg;
    if(!uuid) {
        error = 400;
        errorMsg = 'please supply {uuid}';
    }else if(!schedules.scheduleExists(uuid)){
        error = 400;
        errorMsg = `no schedule with uuid: ${uuid}`;
    }

    if(error){
        res.status(error);
        res.send(errorMsg);
        res.end();
        return;
    }

    await schedules.deleteSchedule(uuid);

    let allSchedules = schedules.getSchedules();
    
    res.status(200);
    res.send(allSchedules);
    res.end();
});

router.post("/link", async (req, res) => {
    let uuid = req.body.uuid;
    let mac = req.body.mac;

    let error;
    let errorMsg;
    if(!uuid) {
        error = 400;
        errorMsg = 'please supply {uuid}';
    }else if(!schedules.scheduleExists(uuid)){
        error = 400;
        errorMsg = `no schedule with uuid: ${uuid}`;
    }

    if(!mac) {
        error = 400;
        errorMsg = 'please supply {mac}';
    }else if(!devices.deviceExists(mac)) {
        error = 400;
        errorMsg = `no device with mac: ${mac}`;
    }

    if(error){
        res.status(error);
        res.send(errorMsg);
        res.end();
        return;
    }

    await schedules.linkMac(uuid, mac);

    let allSchedules = schedules.getLinks();
    
    res.status(200);
    res.send(allSchedules);
    res.end();
});

router.post("/unlink", async (req, res) => {
    let mac = req.body.mac;

    let error;
    let errorMsg;
    if(!mac) {
        error = 400;
        errorMsg = 'please supply {mac}';
    }else if(!devices.deviceExists(mac)) {
        error = 400;
        errorMsg = `no device with mac: ${mac}`;
    }

    if(error){
        res.status(error);
        res.send(errorMsg);
        res.end();
        return;
    }

    await schedules.unlinkMac(mac);

    let allSchedules = schedules.getLinks();
    
    res.status(200);
    res.send(allSchedules);
    res.end();
});

module.exports = router;