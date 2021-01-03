function getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

export function randomValueHex(byteCount: number): string {
    let rawBytes = new Uint8Array(byteCount);
    try {
        rawBytes = crypto.getRandomValues(rawBytes);
    } catch (e) {
        // Old browser, insecure but works
        for (let i = 0; i < byteCount; ++i) {
            rawBytes[i] = getRandomInt(0, 256);
        }
    }
    return toHex(rawBytes);
}

export function toHex(a: ArrayBuffer): string {
    const byteArray = Array.from(new Uint8Array(a));
    return byteArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
