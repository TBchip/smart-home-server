const express = require('express');

const devices = require('../../devices/devices');

let router = express.Router();

router.get("/get", async (req, res) => {
    let mac = req.query.mac;
    
    let error;
    let errorMsg;
    if(!mac) {
        error = 400;
        errorMsg = 'please supply {mac} as a http parameter';
    }
    
    if(error){
        res.status(error);
        res.send(errorMsg);
        res.end();
        return;
    }
    
    let deviceStats = devices.getDeviceStats(mac);
    if(!deviceStats){
        error = 404;
        errorMsg = `device exists but could not find stats`;
    }
    
    if(error){
        res.status(error);
        res.send(errorMsg);
        res.end();
        return;
    }
    
    res.status(200);
    res.send(deviceStats);
    res.end();
});

router.get("/switch", async (req, res) => {
    let mac = req.query.mac;
    let state = req.query.state;
    
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

router.get("/startup", async (req, res) => {
    let mac = req.query.mac;
    let state = req.query.state;
    
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