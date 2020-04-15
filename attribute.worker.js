import cv from './opencv'

self.onmessage = (e) => {
    let pixels = e.data.imgData;
    let src = cv.matFromImageData(pixels)
    let blur = Math.round(self.checkBlur(src.clone()),2) // > 10 : ok
    let brightness = Math.round(self.checkBrightness(pixels, e.data.w, e.data.h))
    
    self.postMessage({ pixels, w: e.data.w, h: e.data.h, brightness,  blur});
    src.delete();

}

self.checkBrightness = (pixels, w, h) => {
    var r, g, b, avg, colorSum = 0;

    for (var x = 0; x < pixels.data.length; x += 4) {
        r = pixels.data[x];
        g = pixels.data[x + 1];
        b = pixels.data[x + 2];
        avg = Math.floor((r + g + b) / 3);
        colorSum += avg;
    }

    var brightness = colorSum / (w * h) * 1000 / 255;
    return brightness
}

self.checkBlur = (src) => {
    cv.cvtColor(src, src, cv.COLOR_RGB2GRAY, 0);
    let dst = new cv.Mat();
    let men = new cv.Mat();
    let menO = new cv.Mat();

    cv.Laplacian(src, dst, cv.CV_64F, 1, 1, 0, cv.BORDER_DEFAULT);
    cv.meanStdDev(dst, menO, men)
    const blur = men.data64F[0]
    src.delete(); dst.delete(); men.delete(), menO.delete()
    return Math.pow(blur,2)
}
