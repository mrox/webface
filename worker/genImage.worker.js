self.onmessage = async (e) => {
    let data = e.data
    const canvas = new OffscreenCanvas(data.width, data.height);
    const ctx = canvas.getContext('2d');
    ctx.putImageData(data, 0, 0)
    const blob = await canvas.convertToBlob();
    const image = await toDataURL(blob);
    self.postMessage(image)
}

const toDataURL = async (data) =>
    new Promise(ok => {
        const reader = new FileReader();
        reader.addEventListener('load', () => ok(reader.result));
        reader.readAsDataURL(data);
    });
