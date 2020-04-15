import * as facemesh from '@tensorflow-models/facemesh'
import * as tf from '@tensorflow/tfjs-core';

let isRunning = false
let model, loading = false

self.onmessage = async (e) => {
    if (!model && !loading){
        loading = true
        model = await facemesh.load({ maxFaces: 1 });
        loading = false
    } 
    if (!isRunning && !loading ) {
        if (!e.data) return
        isRunning = true
        
        let imageData = e.data
        let videoWidth = imageData.width
        let videoHeight = imageData.height
        // console.log(videoWidth, videoHeight);
        const predictions = await model.estimateFaces(imageData);

        if (predictions.length > 0) {

            const pointsData = predictions.map(prediction => {
                let scaledMesh = prediction.scaledMesh;
                return scaledMesh.map(point => ([-point[0], -point[1], -point[2]]));
            });
            let flattenedPointsData = [];
            for (let i = 0; i < pointsData.length; i++) {
                flattenedPointsData = flattenedPointsData.concat(pointsData[i]);
                // console.log(pointsData[i]);

            }

            let minX = 100000
            let minY = 100000
            let maxX = -100000
            let maxY = -100000

            flattenedPointsData.forEach(p => {
                minX = Math.min(minX, -p[0])
                minY = Math.min(minY, -p[1])
                maxX = Math.max(maxX, -p[0])
                maxY = Math.max(maxY, -p[1])
            })

            const w = Math.round(maxX - minX)
            const x = Math.round(videoWidth - maxX)
            const y = Math.round(minY)
            const h = Math.round(maxY - minY)

            console.log(x,y,w,h);
            self.postMessage({type:'done'})
        }

        isRunning = false
    } 

}