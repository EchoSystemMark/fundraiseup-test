"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
((global) => {
    const buffer = [];
    let delay = 0;
    function sendBuffer(reason) {
        return __awaiter(this, void 0, void 0, function* () {
            if (buffer.length === 0)
                return true;
            const data = buffer.splice(0, buffer.length);
            try {
                const response = yield fetch('http://localhost:8888/tracker', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Request-Method': 'POST',
                    },
                    body: JSON.stringify(data)
                });
                if (!response.ok) {
                    setTimeout(() => data.forEach(handleBuffer), 1000);
                    return false;
                }
                console.log("Buffer sent:", reason, data.length, response.status);
                return true;
            }
            catch (error) {
                console.error("Error sending buffer:", error);
                return false;
            }
        });
    }
    function handleBuffer(data) {
        buffer.push(data);
        if (Date.now() - delay > 1000) {
            delay = Date.now();
            sendBuffer('delay');
        }
        if (buffer.length >= 3) {
            sendBuffer('limit');
        }
    }
    global.addEventListener('beforeunload', (event) => sendBuffer('page unload'));
    // setInterval(() => sendBuffer('interval'), 1000); // раскомментировать для ежесекундной отправки данных    
    function track(event, ...tags) {
        var arguments_1 = arguments;
        return __awaiter(this, void 0, void 0, function* () {
            if (arguments_1.length === 0)
                return yield sendBuffer('follow');
            handleBuffer({
                event,
                tags,
                url: global.location.href,
                title: document.title,
                ts: Math.floor(Date.now() / 1000)
            });
        });
    }
    if (global.tracker && Array.isArray(global.tracker.q)) {
        global.tracker.q.forEach(([event, ...tags]) => track(event, ...tags));
    }
    global.tracker = { track };
})(window);
