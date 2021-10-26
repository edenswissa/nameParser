const {argv} = require("yargs");
const Websocket = require('./websocket');
const MqService = require('./mq-service');
const handler = require('../handlers/index');

class PathsService {
    constructor() {
        this._connection;
    }

    async init(state){
        console.log("service")
        switch (state) {
            case "online":
                this._connection = new Websocket(handler, state);
                console.log("ws")
                break;
            case "offline":
                this._connection = new MqService(handler, state);
                console.log("MqService")
                break;
            default:
                throw new Error(`invalid service state:${argv.state}`)
        }
    }

    async run() {
        await this._connection.init();
        await this._connection.run();
    }
}

module.exports = new PathsService();
