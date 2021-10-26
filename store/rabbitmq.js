const amqplig = require('amqplib');
const util = require('util');
const uuid = require('node-uuid');
const Singelton = require('../utils/Singelton');
const QUEUES = require('./queues');

const EXCHANGE_NAME_FORMAT = "%s/XCH.IN";
const QUEUE_NAME_FORMAT = "%s.q.%s";

class Channel {
    constructor(parent, channel, serviceName, queueName) {
        this._parent = parent;
        this._channel = channel;
        this._queueName = queueName;
        this._consumerTag;
    }

    async consume(asyncCallback) {
        if (!this._queueName) throw new Error("cannot consume if queue is not specified");
        const result = await this._channel.consume(this._queueName, (message) => {
            /*
            {
                content: Buffer,
                fields: Object,
                properties: Object
            }
            */
            const reply = async (obj) => {
                if (message.replyTo) {
                    const defaultXch = this._channel.defaultExchange;
                    await this._channel.publish(defaultXch, "", Buffer.from(JSON.stringify(obj)));
                }
            }

            const json = JSON.parse(message.content.toString());

            message.__channel = this._channel;
            message.__xch = message.fields.exchange.split('.').pop();
            message.actions = {
                ack: () => {
                    if (message.__handled === true) return false;
                    this._channel.ack(message);
                    message.__handled = true;
                    return true;
                },
                nack: () => {
                    if (message.__handled === true) return false;
                    this._channel.nack(message);
                    message.__handled = true;
                    return true;
                },
                reject: () => {
                    if (message.__handled === true) return false;
                    this._channel.reject(message);
                    message.__handled = true;
                    return true;
                },
            }

            asyncCallback({message, json, reply,});
        });

        this._consumerTag = result.consumerTag;
    }

    /**
     *
     * @param json - event - the next queue we want to send to msg- must
     *               payload - must
     * @returns {Promise<*>}
     */
    async send(json) {
        const {event} = JSON.parse(json);

        if(!event || !QUEUES.has(event)){
            throw new Error(`invalid event:${event}`);
        }

        // creating send object
        const messageInfoObject = {
            event,
            messageId: uuid.v4().toString()
        }

        delete json.event;
        const message = Buffer.from(json);

        const queueName = `${this._parent._name}.q.${event}`;
        return this._channel.sendToQueue(queueName, message, messageInfoObject);
    }
}

class RabbitMQ extends Singelton{
    constructor() {
        super();
        this._name = "";
        this._connection = null;
        this._host;
        this._exchange;
        this._channel; // default channel (connection)
    }

    async getDedicatedChannel(serviceName = "", prefetchCount) {
        if (!this.initialized) throw new Error('was not initiated');

        // QUEUE name
        const queueName = util.format(QUEUE_NAME_FORMAT, this._name, serviceName);

        // creating channel & prefetch count
        const channel = await this._connection.createChannel();
        await channel.prefetch(prefetchCount);
        return new Channel(this, channel, serviceName, queueName)
    }

    async _init(config) {
        // setting config values
        this._name = this._name || config.prefix || "";
        this._host = config.host;

        await this.connect();
    }

    async connect() {
        while (true) {
            try {
                this._connection = await amqplig.connect(this._host);
                break;
            } catch (e) {
                console.error("Failed connecting to rabbitmq");
                await new Promise((res, rej) => {
                    setTimeout(() => {
                        res();
                    }, 1000);
                });
            }
        }

        // creating default channel
        this._channel = await this._connection.createChannel();

        // creating exchange
        this._channel.on('error', function (error) {
            // we need to recreate the channel
            debugger;
        });
        const xchName = util.format(EXCHANGE_NAME_FORMAT, this._name);
        this._exchange = await this._channel.assertExchange(xchName, "headers", {
            durable: true,
        });

        // creating queues
        await this.__createAllQueues();
    }

    async __createAllQueues() {
        if(QUEUES.size === 0){
            throw new Error('missing queues options!');
        }
        for (const [serviceName, conditions] of QUEUES) {
            // creating queue
            const queueName = util.format(QUEUE_NAME_FORMAT, this._name, serviceName);
            await this._channel.assertQueue(queueName, {durable: true, maxPriority: 20});

            // setting conditions
            for (const condition of conditions) {
                await this._channel.bindQueue(queueName, this._exchange.exchange, "", condition.headers);
            }
        }
    }
}

module.exports = new RabbitMQ();
