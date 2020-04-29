import Stats from 'stats.js';
import FaceIDUI from './draw'

let video, videoWidth, videoHeight, ctx, faceCtx, imgData, processs = false, scale = 1, left = 0, top = 0
let stats = new Stats();
let imageCapture// = new ImageCapture(videoTrack);
//show time process
let processTime = 0;
let timmerProcess;
let resultE = document.getElementById('result');
let timeElement = document.getElementById('time')
let circleTutorial = document.getElementById('circle')
//
let draws = []
let step = 8
let faceIdUI = new FaceIDUI({ step }); faceIdUI.init()
let resetBtn = document.getElementById('reset')
const faceMeshWorker = new Worker('./worker/facemesh.worker.js')
const genImageWorker = new Worker('./worker/genImage.worker.js')

for (let index = 1; index <= 8; index++) {
    
    
    faceIdUI.startAnim(index)
}


resetBtn.onclick = () => {
    console.log(`reset`);
    resetDraw()
    endProcess()
}

function startProcess() {
    timeElement.innerHTML = ``
    timmerProcess = setInterval(() => {
        processTime += 1
        timeElement.innerHTML = `${processTime}s`
    }, 1000);
}

function endProcess() {
    processTime = 0
    clearInterval(timmerProcess)
    timmerProcess = null
}

function resetDraw() {
    draws = []
    faceIdUI.init()
    faceMeshWorker.postMessage({ type: 'reset' })
}

faceMeshWorker.onmessage = async (e) => {
    let data = e.data

    if (data.type == "done") processs = false
    if (data.type == 'draw' && !draws.includes(data.i)) {
        genImageWorker.postMessage(data.data.face)

        if (draws.length == 1) startProcess()
        if (draws.length >= step - 1) endProcess()
        draws.push(data.i)
        faceIdUI.startAnim(data.i)

    }
}

faceMeshWorker.onerror = (e) => {
    console.log(`worker error:`, e);
}

//Gen Image worker
genImageWorker.onmessage = (e) => {
    let imgDiv = document.createElement('div')
    imgDiv.className = 'cover'
    let img = document.createElement('img')

    img.src = e.data
    imgDiv.appendChild(img)
    resultE.appendChild(imgDiv)
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
            width: 1024,
            height: 1024
        }
    });
    video.srcObject = stream;
    return new Promise((resolve) => {
        video.onloadedmetadata = () => {
            imageCapture = new ImageCapture(stream.getVideoTracks()[0]);
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
    circleTutorial.style.width = faceIdUI.innerWidth
    circleTutorial.style.height = faceIdUI.innerWidth
    
    try {
        await setupCamera();
        video.play();
        video.style.clipPath = `circle(${window.innerWidth / 2 - 35}px at ${window.innerWidth / 2}px ${window.innerHeight / 2}px)`;
        // circleTutorial.style.clipPath = `circle(${window.innerWidth / 2 - 35}px at ${window.innerWidth / 2}px ${window.innerHeight / 2}px)`;
        renderPrediction()

    } catch (error) {
        console.log(error);
    }

})()

async function renderPrediction() {
    stats.begin();

    if (!processs) {
        try {

            imgData = await imageCapture.grabFrame()
            if (imgData.width == 0) return
            processs = true
            faceMeshWorker.postMessage(imgData, [imgData])
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
