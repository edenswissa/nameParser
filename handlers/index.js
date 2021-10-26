const nameParserService = require('../service/parsers/nameParserService');

class Handler {
    /**
     *
     * @param payload
     * @param connection - is direct ws, or ws to message queue (mq)
     * @param id - id of the msg
     * @param state - online/offline (online - websocket, offline - mq)
     * @returns {Promise<void>}
     */

    // in this case support only offline - MQ & http
    async handle(payload, {connection, id, state}) {

        let jsonResult = nameParserService.parseName(payload);
        jsonResult.event = "HOOKS";
        jsonResult.status = 200;
        await connection.send(JSON.stringify(jsonResult));
    }

    validatePayload(payload) {
        console.log("validatePayload", payload)
        // throw new Error('need to implement Handler.validatePayload()');
        // not need to use validation function on this service 
        // cause the validation is in the parser - return object with validation field
        return true
    };

    /**
     * example: return "EVENT_NAME"
     */
    getQueueName() {
        // throw new Error('need to implement Handler.getQueueName()');
        return "NAME_PARSER";
    }
}

module.exports = new Handler();
