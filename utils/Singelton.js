const INIT_STATUS = { FALSE: 0, PENDING: 1, TRUE: 2 };
const sleep = require('./index').sleep


class SingletonService{
    constructor(){
        this._initStatus = INIT_STATUS.FALSE;
    }

    get initialized(){
        return this._initStatus === INIT_STATUS.TRUE;
    }

    async init(params){
        if (this._initStatus === INIT_STATUS.FALSE) {
            this._initStatus = INIT_STATUS.PENDING;
            await this._init(params);
            this._initStatus = INIT_STATUS.TRUE;
        } else {
            while (this._initStatus === INIT_STATUS.PENDING) {
                await sleep(500);
            }
        }
    }

    async _init(){
        throw new Error('need to implement');
    }
}


module.exports = SingletonService;
