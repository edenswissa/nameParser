const argv = require('yargs').argv;
const BaseService = require('../../base-sevice')
const CONFIG = require('../../utils').CONFIG

class MQService extends BaseService {
    constructor(handler, state) {
        super(handler, state);
        this._mqService = require('../../store/rabbitmq');
        this._mqServiceName = handler.getQueueName();
        this._mqChannel;
    }

    async init() {
        // initiating MQ
        await this._mqService.init(CONFIG.mq);
        console.log(" init MQ")
    }

    async run() {
        // MQ limit & prefetch count
        console.log(" run MQ")
        const concurrency = argv.concurrency ? argv.concurrency : 1;
        const limit = argv.limit ? argv.limit : 0;

        console.log(`service=${this._mqServiceName}, concurrency=${concurrency}, limit=${limit}`);

        // channel
        this._mqChannel = await this._mqService.getDedicatedChannel(this._mqServiceName, concurrency, limit);
        if (this._mqServiceName) {
            await this._mqChannel.consume(this.incomingMQMessage.bind(this));
        }
    }

    async incomingMQMessage({message, json}) {
        // handling message
        const {payload, id} = json;
        try {
            this._handler.validatePayload(payload);
            await this._handler.handle(payload, {id, connection: this._mqChannel, state : this._state});
            message.actions.ack();
        } catch (e) {
            // await message.actions.delay();
            console.error(e.stack);
        }
    }
}

module.exports = MQService;
