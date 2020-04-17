import Stats from 'stats.js';
import FaceIDUI from './draw'

let video, videoWidth, videoHeight, ctx, faceCtx, imgData, processs = false, scale = 1, left = 0, top = 0
let stats = new Stats();
let canvas = document.getElementById('output');
const faceIdUI = new FaceIDUI({step: 8})
faceIdUI.startAnim(2)
faceIdUI.startAnim(1, true)


const faceMeshWorker = new Worker('./facemesh.worker.js')

faceMeshWorker.onmessage = (e) => {
    let data = e.data
    if (data.type == "done") processs = false
    if (e.data.face) drawRectang(e.data.face)
}

faceMeshWorker.onerror = (e) => {
    console.log(`worker error:`, e);
}

function drawRectang(face) {
    // scale = window.innerWidth/videoWidth
    const {x, y, w, h } = face
    // // const [x1, y1, w1, h1] = [x, y, w, h ].map(n => Math.round(n ))
    // // console.log(faceCanvas.width, faceCanvas.height);
    // console.log(x , y , w, h);
    
    // // console.log(faceCanvas.width, x, y, w, h );
    // faceCtx.clearRect(0, 0, faceCanvas.width, faceCanvas.height);
    // faceCtx.beginPath();
    // faceCtx.rect(x , y , w, h);
    // faceCtx.stroke();
    
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
            facingMode: 'user',
            // facingMode: {
            //     exact: 'environment'
            //     // exact: 'user'
            // },
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
    
    // document.body.appendChild(stats.dom);
    // model = await facemesh.load({ maxFaces: 1 });
    try {
        
        await setupCamera();
        video.play();
    } catch (error) {
        console.log(error);
        
    }
    ctx = canvas.getContext('2d');
    ctx.width = videoWidth = video.videoWidth;
    ctx.height = videoHeight = video.videoHeight;
    ctx.fillStyle = '#32EEDB';
    ctx.strokeStyle = '#32EEDB';
    ctx.lineWidth = 0.5;
    ctx.width

    // faceCtx = faceCanvas.getContext('2d')
    // faceCtx.strokeStyle = '#32EEDB';
    // faceCtx.lineWidth = 0.5;



    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    console.log(video.style.clipPath);
    
    video.style.clipPath = `circle(${window.innerWidth/2 - 35}px at ${window.innerWidth/2}px ${window.innerHeight/2}px)`;
    
    try {
        renderPrediction()
        
    } catch (error) {
        console.log(error);
        
    }

})()

async function renderPrediction() {
    stats.begin();
    // const predictions = await model.estimateFaces(video);  
    // ctx.clearRect(0, 0, canvas.width, canvas.height);
    // scale = Math.max(canvas.width / videoWidth, canvas.height / videoHeight)
    // left = Math.floor((canvas.width / 2) - (videoWidth / 2) * scale)// + 10;
    // top = Math.floor((canvas.height / 2) - (videoHeight / 2) * scale);
    ctx.drawImage(video, 0,0 , canvas.width, canvas.height);

    if (!processs) {
        try {
            imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
            processs = true
            faceMeshWorker.postMessage({
                pixels: imgData.data.buffer,
                width: canvas.width,
                height: canvas.height
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
