((global) => {
    const buffer = [];
    let delay = 0;

    async function sendBuffer(reason) {
        if (buffer.length === 0) return true;
        const data = buffer.splice(0);
        const response = await fetch('http://localhost:8888/tracker', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Request-Method': 'POST', // чтобы при CORS запросе не происходил префлайт OPTIONS запрос
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) return setTimeout(() => data.forEach(handleBuffer), 1000);
        console.log("Buffer sent:", reason, data.length, response.status);
        return true;
    }

    function handleBuffer(data) {
        buffer.push(data);
        if (Date.now() - delay > 1000) delay = Date.now(), sendBuffer('delay');
        if (buffer.length >= 3) sendBuffer('limit');
    }

    global.addEventListener('beforeunload', (event) => sendBuffer('page unload'));
    // setInterval(() => sendBuffer('interval'), 1000); // раскомментировать для ежесекундной отправки данных    

    async function track(event, ...tags) {
        if (arguments.length === 0) return await sendBuffer('follow');

        handleBuffer({
            event,
            tags,
            url: global.location.href,
            title: document.title,
            ts: Math.floor(Date.now() / 1000)
        });
    };

    if (global.tracker && Array.isArray(global.tracker.q)) global.tracker.q.forEach(([event, ...tags]) => track(event, ...tags));
    global.tracker = { track };
})(window);