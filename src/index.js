const express = require('express');
const bodyParser = require('body-parser');

const devices = require('./devices/devices');
const schedules = require('./schedules/schedules');
const storage = require('./storage/storage');

const routes = require('./routes/routes');

const port = 51310;
const server = express();

server.use(bodyParser.json());

server.use('/', routes);

async function initServer() {
    //init db
    await storage.dbInit();
    //get mac adresses from network
    await devices.updateMacStorage();
    //get initial status for all devices
    await devices.updateDeviceStats( devices.getDeviceMacs() );
    //start all schedules
    await schedules.startAllSchedules();
    
    //start server
    server.listen(port, () => {
        console.log(`SmartHome server listening on port: ${port}`)
    });
}

initServer();