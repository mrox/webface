import Stats from 'stats.js';

let video, videoWidth, videoHeight, ctx, faceCtx, imgData, processs = false, scale = 1
let stats = new Stats();
let canvas = document.getElementById('output');
let faceCanvas = document.getElementById('face')
const faceMeshWorker = new Worker('./facemesh.worker.js')

faceMeshWorker.onmessage = (e) => {
    let data = e.data
    if (data.type == "done") processs = false
    if (e.data.face) drawRectang(e.data.face)
}

faceMeshWorker.onerror = (e) => {
    console.log(`worker error:`,e);
}

function drawRectang(face) {
    console.log(faceCanvas.width, faceCanvas.height);
     
}
//END Worker
function isMobile() {
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isiOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    return isAndroid || isiOS;
}

async function setupCamera() {
    video = document.getElementById('video');

    const stream = await navigator.mediaDevices.getUserMedia({
        'audio': false,
        video: {
            facingMode: { 
                // exact: 'environment'
                exact: 'user'
              },
            width: { 
                min: 1280,
                ideal: 1920,
                max: 2560,
              },
              height: {
                min: 720,
                ideal: 1080,
                max: 1440
              }
          }
        // 'video': {
        //     facingMode: 'user',
        //     width: { exact: 1280 }, height: { exact: 720 }
        //     // Only setting the video to a specified size in order to accommodate a
        //     // point cloud, so on mobile devices accept the default size.
        //     // width: mobile ? undefined : VIDEO_SIZE,
        //     // height: mobile ? undefined : VIDEO_SIZE
        // },
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
    // model = await facemesh.load({ maxFaces: 1 });
    await setupCamera();
    video.play();
    videoWidth = video.videoWidth;
    videoHeight = video.videoHeight;
    ctx = canvas.getContext('2d');
    ctx.fillStyle = '#32EEDB';
    ctx.strokeStyle = '#32EEDB';
    ctx.lineWidth = 0.5;

    faceCtx = faceCanvas.getContext('2d')


    canvas.width = faceCanvas.width = window.innerWidth
    canvas.height = faceCanvas.height = window.innerHeight
    renderPrediction()

})()

async function renderPrediction() {    
    stats.begin();
    // const predictions = await model.estimateFaces(video);  
    // ctx.clearRect(0, 0, canvas.width, canvas.height);
    scale = Math.max(canvas.width / videoWidth, canvas.height / videoHeight)
    var left = Math.floor((canvas.width / 2) - (videoWidth / 2) * scale) + 10;
    var top = Math.floor((canvas.height / 2) - (videoHeight / 2) * scale);
    ctx.drawImage(video, left, top, videoWidth, videoHeight, 0, 0, canvas.width, canvas.height);

    if (!processs) {
        try {
            imgData = ctx.getImageData(0, 0, videoWidth, videoHeight)
            processs = true
            faceMeshWorker.postMessage({
                pixels: imgData.data.buffer,
                width: videoWidth,
                height: videoHeight
            }, [imgData.data.buffer])
        } catch (error) {
            processs = false
            console.log(error);
        }
    }
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
