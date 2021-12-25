const express = require('express');

const device = require('./device/device');
const schedule = require('./schedule/schedule');

let router = express.Router();

router.use('/device', device);
router.use('/schedule', schedule);

module.exports = router;