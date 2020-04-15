import * as facemesh from '@tensorflow-models/facemesh'
import * as tf from '@tensorflow/tfjs-core';
import Stats from 'stats.js';

let model, video, videoWidth, videoHeight, ctx, faceCtx
let stats = new Stats();
let canvas = document.getElementById('output');
let faceCanvas = document.getElementById('face')

function isMobile() {
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isiOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    return isAndroid || isiOS;
}

async function setupCamera() {
    video = document.getElementById('video');

    const stream = await navigator.mediaDevices.getUserMedia({
        'audio': false,
        'video': {
            facingMode: 'user',
            // width: { exact: 1280 }, height: { exact: 720 }
            // Only setting the video to a specified size in order to accommodate a
            // point cloud, so on mobile devices accept the default size.
            // width: mobile ? undefined : VIDEO_SIZE,
            // height: mobile ? undefined : VIDEO_SIZE
        },
    });
    video.srcObject = stream;

    return new Promise((resolve) => {
        video.onloadedmetadata = () => {
            resolve(video);
        };
    });
}

(async () => {
    if (!testBrowse()) {
        console.log("éo chạy đc");
        return;
    }
    stats.showPanel(0);  // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(stats.dom);
    model = await facemesh.load({ maxFaces: 1 });
    await setupCamera();
    video.play();
    videoWidth = video.videoWidth;
    videoHeight = video.videoHeight;
    ctx = canvas.getContext('2d');
    faceCtx = faceCanvas.getContext('2d')
    console.log(faceCanvas);
    
    canvas.width = faceCanvas.width = window.innerWidth
    canvas.height = faceCanvas.height = window.innerHeight
    renderPrediction()

})()

async function renderPrediction(){
    stats.begin();
    const predictions = await model.estimateFaces(video);  
    let scale = Math.max(canvas.width/ videoWidth, canvas.height/ videoHeight)
    var left = (canvas.width / 2) - (videoWidth / 2) * scale;
    var top = (canvas.height / 2) - (videoHeight / 2) * scale;
    ctx.drawImage(video, left, top, videoWidth* scale, videoHeight* scale );

    faceCtx.beginPath();
    faceCtx.lineWidth = "6";
    faceCtx.strokeStyle = "red";
    faceCtx.rect(5, 5, 290, 140);
    faceCtx.stroke();
    stats.end()
    requestAnimationFrame(renderPrediction);
}

async function testBrowse() {
    let valid = {
        "canvas": !!window.CanvasRenderingContext2D,
        "webgl": !!window.WebGLRenderingContext,
        "workers": !!window.Worker
    }
    return valid.canvas && valid.webgl && valid.workers
}
