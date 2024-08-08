interface tracker {
    track(event: string, ...tags: string[]): void
}

((global) => {
    const buffer: BufferEntry[] = [];
    let delay = 0;

    interface BufferEntry {
        event: string;
        tags: string[];
        url: string;
        title: string;
        ts: number;
    }

    async function sendBuffer(reason: string): Promise<boolean> {
        if (buffer.length === 0) return true;
        const data = buffer.splice(0, buffer.length);
        try {
            const response = await fetch('http://localhost:8888/tracker', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Request-Method': 'POST', // чтобы при CORS запросе не происходил префлайт OPTIONS запрос
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                setTimeout(() => data.forEach(handleBuffer), 1000);
                return false;
            }
            console.log("Buffer sent:", reason, data.length, response.status);
            return true;
        } catch (error) {
            console.error("Error sending buffer:", error);
            return false;
        }
    }

    function handleBuffer(data: BufferEntry): void {
        buffer.push(data);
        if (Date.now() - delay > 1000) {
            delay = Date.now();
            sendBuffer('delay');
        }
        if (buffer.length >= 3) {
            sendBuffer('limit');
        }
    }

    global.addEventListener('beforeunload', (event: BeforeUnloadEvent) => sendBuffer('page unload'));
    // setInterval(() => sendBuffer('interval'), 1000); // раскомментировать для ежесекундной отправки данных    

    async function track(event: string, ...tags: string[]): Promise<void> {
        if (arguments.length === 0) return await sendBuffer('follow') as any;

        handleBuffer({
            event,
            tags,
            url: global.location.href,
            title: document.title,
            ts: Math.floor(Date.now() / 1000)
        });
    }

    if ((global as any).tracker && Array.isArray((global as any).tracker.q)) {
        ((global as any).tracker.q as [string, ...string[]][]).forEach(([event, ...tags]) => track(event, ...tags));
    }
    
    (global as any).tracker = { track };
})(window);