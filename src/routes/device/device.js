const express = require('express');

const devices = require('../../devices/devices');

let router = express.Router();

router.get("/get", async (req, res) => {
    let mac = req.body.mac;
    
    let error;
    let errorMsg;
    if(!mac) {
        error = 400;
        errorMsg = 'please supply {mac} as a http parameter';
    }else if(!devices.deviceExists(mac)){
        error = 400;
        errorMsg = `no device with mac: ${mac}`;
    }
    
    if(error){
        res.status(error);
        res.send(errorMsg);
        res.end();
        return;
    }

    let response = {
        'name': devices.getDeviceName(mac),
        'stats': devices.getDeviceStats(mac)
    }
    
    res.status(200);
    res.send(response);
    res.end();
});
router.get("/getall", async (req, res) => {    
    let deviceMacs = devices.getDeviceMacs();
    let response = {};
    for(let mac in deviceMacs){
        response[mac]['name'] = devices.getDeviceName(mac);
        response[mac]['stats'] = devices.getDeviceStats(mac);
    }
    
    res.status(200);
    res.send(response);
    res.end();
});

router.post("/switch", async (req, res) => {
    let mac = req.body.mac;
    let state = req.body.state;
    
    let error;
    let errorMsg;
    if(!mac) {
        error = 400;
        errorMsg = 'please supply {mac} as a http parameter';
    }
    if(!state) {
        error = 400;
        errorMsg = 'please supply {state} as a http parameter';
    }
    
    if(error){
        res.status(error);
        res.send(errorMsg);
        res.end();
        return;
    }

    if(!devices.deviceExists(mac)){
        error = 404;
        errorMsg = `device does not exist: ${mac}`;
    }

    let stateInt = parseInt(state);
    if(stateInt === 0 || stateInt === 1){
        if( !(await devices.setDeviceState(stateInt, mac)) ){
            error = 500;
            errorMsg = `failed to switch device: mac=${mac} state=${stateInt}`;
        }
    }else{
        error = 400;
        errorMsg = `invalid value for {state}: ${state}`;
    }
    
    if(error){
        res.status(error);
        res.send(errorMsg);
        res.end();
        return;
    }

    let deviceStats = devices.getDeviceStats(mac); //cannot give error because just succesfully updated
    res.status(200);
    res.send(deviceStats);
    res.end();
});

router.post("/startup", async (req, res) => {
    let mac = req.body.mac;
    let state = req.body.state;
    
    let error;
    let errorMsg;
    if(!mac) {
        error = 400;
        errorMsg = 'please supply {mac} as a http parameter';
    }
    if(!state) {
        error = 400;
        errorMsg = 'please supply {state} as a http parameter';
    }
    
    if(error){
        res.status(error);
        res.send(errorMsg);
        res.end();
        return;
    }

    if(!devices.deviceExists(mac)){
        error = 404;
        errorMsg = `device does not exist: ${mac}`;
    }

    let stateInt = parseInt(state);
    if(stateInt === -1 || stateInt === 0 || stateInt === 1){
        if( !(await devices.setDeviceStartup(stateInt, mac)) ){
            error = 500;
            errorMsg = `failed setting startup: mac=${mac} state=${stateInt}`;
        }
    }else{
        error = 400;
        errorMsg = `invalid value for {state}: ${state}`;
    }
    
    if(error){
        res.status(error);
        res.send(errorMsg);
        res.end();
        return;
    }

    let deviceStats = devices.getDeviceStats(mac); //cannot give error because just succesfully updated
    res.status(200);
    res.send(deviceStats);
    res.end();
});

module.exports = router;