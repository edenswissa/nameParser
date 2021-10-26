const requestIp = require('request-ip');

class Utils {
    constructor(CONFIG) {
        this._CONFIG = CONFIG;
    }

    get CONFIG(){
        return this._CONFIG;
    }

    verifyIP(req) {
        return true;
    }

    getIp(req) {
        return requestIp.getClientIp(req);
    }

    sleep(time) {
        return new Promise((resolve) => {
            setTimeout(resolve, time);
        })
    }
}


module.exports = new Utils(require('../config.json'));
