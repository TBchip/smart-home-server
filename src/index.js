const express = require('express');
const bodyParser = require('body-parser');
const nodeSchedule = require('node-schedule');

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
    //update net devices
    await devices.updateNetDevices();
    //get mac adresses from network
    await devices.updateMacStorage();
    //get initial status for all devices
    await devices.updateDeviceStats( ...devices.getAllDeviceMacs() );
    //start all schedules
    await schedules.startAllSchedules();
    
    //start server
    server.listen(port, () => {
        console.log(`SmartHome server listening on port: ${port}`)
    });

    //update every 5 minutes
    let updateRule = '*/5 * * * *';
    nodeSchedule.scheduleJob(updateRule, devices.updateNetDevices);
    nodeSchedule.scheduleJob(updateRule, devices.updateMacStorage);
}

initServer();

process.on('SIGINT', () => {
    nodeSchedule.gracefulShutdown()
    .then(() => process.exit(0));
});