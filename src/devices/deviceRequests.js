const {default: axios} = require('axios');

async function getDeviceStats(ip){
    const body = {
        'deviceid': '',
        'data': {}
    }

    let out;
    await axios
        .post(`http://${ip}:8081/zeroconf/info`, body)
        .then(res => {
            if(res.status === 200) {
                out = res.data.data;
            } else {
                console.log(`failed updating ${ip}:`);
                console.log('code:', res.status);
                console.log('message:', res.statusText);
                out = false;
            }
        })
        .catch(e => {
            console.log(`failed updating ${ip}: `, e);
            out = false;
        });

    return out;
}

async function setState(ip, state){
    if(state === 0) state = "off";
    else if(state === 1) state = "on";
    const body = {
        "deviceid": "",
        "data": {
            "switch": state
        }
    };

    let out;
    await axios
        .post(`http://${ip}:8081/zeroconf/switch`, body)
        .then(async res => {
            if(res.status === 200) {
                out = res.data;
            } else {
                console.log(`failed switching ${ip} ${state}:`);
                console.log('code:', res.status);
                console.log('message:', res.statusText);
                out = false;
            }
        })
        .catch(e => {
            console.log(`failed switching ${ip} ${state}: `, e);
            out = false;
        });

    return out;
}

async function setStartup(ip, startup){
    if(startup === -1) startup = "stay";
    else if(startup === 0) startup = "off";
    else if(startup === 1) startup = "on";
    const body = {
        "deviceid": "",
        "data": {
            "startup": startup
        }
    };

    let out;
    await axios
        .post(`http://${ip}:8081/zeroconf/startup`, body)
        .then(async res => {
            if(res.status === 200) {
                out = res.data;
            } else {
                console.log(`failed setting startup ${ip} ${startup}:`);
                console.log('code:', res.status);
                console.log('message:', res.statusText);
                out = false;
            }
        })
        .catch(e => {
            console.log(`failed setting startup ${ip} ${state}: `, e);
            out = false;
        });

    return out;
}

module.exports = {
    getDeviceStats: getDeviceStats,
    setState: setState,
    setStartup: setStartup
}