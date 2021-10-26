class Service{
    constructor(handler, state) {
        this._handler = handler;
        this._state = state;
    }

    init(){
        throw new Error('need to implement init()');
    }

    run(){
        throw new Error('need to implement run()');
    }

    send(msg){
        throw new Error('need to implement send()');
    }
}

module.exports = Service;
