const WebSocket = require('ws');
const argv = require('yargs').argv;
const Utils = require('../../utils');
const BaseService = require('../../base-sevice');

class Websocket extends BaseService {
    init() {
        if (!argv.ws_port) {
            throw new Error(`missing argv ws_port`);
        }
        console.log('argv.ws_port,', argv.ws_port)
        this._wss = new WebSocket.Server({
            port: argv.ws_port,
            verifyClient: function (info, callback) {
                try {
                    Utils.verifyIP(info.req);
                } catch (e) {
                    callback(false, 401, 'Unauthorized');
                }

                callback(true);
            },
            perMessageDeflate: {
                zlibDeflateOptions: {
                    // See zlib defaults.
                    chunkSize: 1024,
                    memLevel: 7,
                    level: 3
                },
                zlibInflateOptions: {
                    chunkSize: 10 * 1024
                },
                // Other options settable:
                clientNoContextTakeover: true, // Defaults to negotiated value.
                serverNoContextTakeover: true, // Defaults to negotiated value.
                serverMaxWindowBits: 10, // Defaults to negotiated value.
                // Below options specified as default values.
                concurrencyLimit: 10, // Limits zlib concurrency for perf.
                threshold: 1024 // Size (in bytes) below which messages
                // should not be compressed.
            }
        });
    }

    run() {
        const handler = this._handler;
        const state = this._state;
        this._wss.on('connection', function connection(ws_connection, req) {
            const reqIp = Utils.getIp(req);
            console.log(`ws - ${reqIp} is connected`);
            ws_connection.on('message', async function incoming(request) {
                console.log(`${new Date().toISOString()} - get message from: ${reqIp}`);
                let reqPayload, reqId;
                try {
                    const {payload, id} = JSON.parse(request);
                    reqPayload = payload;
                    reqId = id;
                } catch (error) {
                    ws_connection.send(JSON.stringify({channel: "error", payload: 'invalid message'}));
                }

                try {
                    handler.validatePayload(reqPayload);
                    await handler.handle(reqPayload, {connection : ws_connection, id: reqId, state });
                } catch (error) {
                    console.error(`${error.stack}`);
                    ws_connection.send(JSON.stringify({id: reqId, channel: "error", payload: error.message}));
                }
            });
            ws_connection.on('close', (info) => {
                console.log(`ws - ${reqIp} is disconnected - code:${info}`);
            });
        });
    }
}


module.exports = Websocket;
