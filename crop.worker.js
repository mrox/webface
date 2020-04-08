self.onmessage = (e) => {
    let pixels = e.data.imgData;
    var r, g, b, avg, colorSum = 0;

    
    for (var x = 0; x < pixels.data.length; x += 4) {
        r = pixels.data[x];
        g = pixels.data[x + 1];
        b = pixels.data[x + 2];

        avg = Math.floor((r + g + b) / 3);
        colorSum += avg;

    }
    
    var brightness = Math.floor(colorSum / (e.data.w * e.data.h),2);
    self.postMessage({ pixels, w: e.data.w, h: e.data.h, brightness });

};
