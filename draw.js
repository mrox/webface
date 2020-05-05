import Konva from 'konva'

export default class FaceIDUI {
    constructor({step = 8, width, height, rotate = 0}) {
        this.step = 360/step
        this.split = 3;
        this.width = width
        this.height = height
        this.rotate = rotate
    }

    init(){
        let width = this.width | window.innerWidth;
        let height = this.height | window.innerHeight;
        let color = 'green';
        let inner = width / 2 - 30;
        let outer = width / 2 - 30;
        var period = 1000;

        this.map = new Map();
        var stage = new Konva.Stage({
            container: 'container',
            width: width,
            height: height
        });

        var staticLayer = new Konva.Layer();

        for (let i = 0; i < 360 ; i += 6) {

            let arc2 = new Konva.Arc({
                x: stage.width() / 2,
                y: stage.height() / 2,
                innerRadius: inner,
                outerRadius: outer,
                angle: 1,
                rotation: i - 135,
                fill: color,
                stroke: color,
                strokeWidth: 0
            });

            let arc0 = new Konva.Arc({
                x: stage.width() / 2,
                y: stage.height() / 2,
                innerRadius: inner,
                outerRadius: stage.width() / 2 - 20,
                angle: 1,
                rotation: i - 135,
                fill: "#4c4c4c",
                stroke: "gray",
                strokeWidth: 0
            });

            staticLayer.add(arc0);
            staticLayer.add(arc2);

            let anim = new Konva.Animation(function (frame) {
                let amplitude = 1.3
                arc2.attrs.strokeWidth = 1;
                let scale = amplitude * Math.sin((frame.time * Math.PI) / period)//((frame.time * Math.PI) / period);
                if (scale > 1) scale = 1;
                arc2.attrs.outerRadius = 22 * scale + (stage.width() / 2 - 30);                
                if (scale == 1) anim.stop();
            }, staticLayer);

            this.map.set(i, anim);
        }
        stage.add(staticLayer);
    }

    startAnim(qua, rev = false) {
        let curr = rev ? qua * this.step : (qua - 1) * this.step;
        const inter = setInterval(() => {
    
            const anim = this.map.get(curr);
            if (anim) anim.start();
            curr = rev? (curr - this.split): (curr + this.split);

            if (inter && curr > (qua * this.step)) {
                clearInterval(inter);
            }
        }, 10);
    }
    

    // var ring = new Konva.Ring({
    //     x: stage.width() / 2,
    //     y: stage.height() / 2,
    //     innerRadius: stage.width()/2 - 50,
    //     outerRadius: stage.width()/2 - 40,
    //     fill: 'black',
    //     stroke: 'black',
    //     strokeWidth: 1
    // });

}

