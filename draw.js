import Konva from 'konva'


var width = window.innerWidth;
var height = window.innerHeight;

var stage = new Konva.Stage({
    container: 'container',
    width: width,
    height: height
});

var staticLayer = new Konva.Layer();

var map = new Map();

// var ring = new Konva.Ring({
//     x: stage.width() / 2,
//     y: stage.height() / 2,
//     innerRadius: stage.width()/2 - 50,
//     outerRadius: stage.width()/2 - 40,
//     fill: 'black',
//     stroke: 'black',
//     strokeWidth: 1
// });

// staticLayer.add(ring);

let color = 'green';
let inner = stage.width() / 2 - 30;
let outer = stage.width() / 2 - 30;
let rotate = 0;
var period = 500;
let split = 3;

setTimeout(() => {
    
    startAnim(1)
}, 2000);


// setTimeout(() => {
    
//     startAnim(2)
// }, 4000);

// setTimeout(() => {
    
//     startAnim(3)
// }, 6000);

// setTimeout(() => {
    
//     startAnim(4)
// }, 8000);
function startAnim(qua) {
    let curr = (qua - 1) * 90;
    const inter = setInterval(() => {
        // console.log('curr', curr);
        const anim = map.get(curr);
        if (anim) anim.start();
        curr += split;
        if (inter && curr > (qua * 90)) {
            clearInterval(inter);
        }
    }, 10);
}
// let animLayer = new Konva.Layer();

for (let i = 0; i < 360/split; i++) {
    rotate = i * split;
    // console.log('rotate ', rotate);

    // if (rotate === 300) {
    //     outer = 210;
    // } else {
    //     outer = 190;
    // }

    let arc2 = new Konva.Arc({
        x: stage.width() / 2,
        y: stage.height() / 2,
        innerRadius: inner,
        outerRadius: outer,
        angle: 1,
        rotation: rotate - 135,
        fill: color,
        stroke: color,
        strokeWidth: 0
    });

    staticLayer.add(arc2);
    // stage.add(staticLayer);

    let anim = new Konva.Animation(function (frame) {
        arc2.attrs.strokeWidth = 1;

        let scale = ((frame.time * 2 * Math.PI) / period);
        if (scale > 1) scale = 1;

        // console.log(scale);

        arc2.attrs.outerRadius = 20 * scale + (stage.width() / 2 - 30);

        if (scale == 1) anim.stop();
    }, staticLayer);

    map.set(rotate, anim);
}

// add the layer to the stage
stage.add(staticLayer);

// const anim = map.get(180);
// anim.start();

// for (let i = 5; i <= 180; i += 5) {
//     const anim = map.get(i);
//     anim.start();
// }

