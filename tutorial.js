import { f_svg_ellipse_arc } from "./svgCircleArc";

export default class Tutorial {

    constructor(width, height) {
        this.viewE = document.getElementById('circle')
        this.svgE = document.getElementById('svg')
        this.pathE = document.getElementById('path')
        this.width = width - 70
        this.height = height - 70
        this.sweepStart = 0
        this.sweepDelta = 180
        this.rotate = 270
        this.ry = 0
        this.container = document.getElementById('circle')
        this.container.style.display = `none`
        this.isShow = false
    }

    show(deg = 0, step) {
        if(this.isShow) return
        this.hide()
        this.numShow = 3
        deg = deg * (360 / step) - 145
        this.container.style.transform = `translate(-50%, -50%) rotate(${deg}deg)`
        this.container.style.display = `block`
        this.isShow = true
        this.intervalID = setInterval((() => {
            if (this.ry <= this.width / 2) {
                this.ry += 1
                this.updatePath()
            }
            else {
                this.ry = 0
                this.numShow -= 1
                if(this.numShow <= 0) {
                    this.hide()
                }
            }
           
        }).bind(this), 2);
        // setTimeout((() => {
        //     this.hide()
        // }).bind(this), 3000);
    }

    hide() {
        clearInterval(this.intervalID)
        this.container.style.display = `none`
        this.isShow = false
    }

    updatePath() {
        // console.log(`update path`);

        // this.pathE.setAttribute("d", f_svg_ellipse_arc())
        const d = f_svg_ellipse_arc([
            parseFloat(this.width / 2),
            parseFloat(this.height / 2)
        ], [
            parseFloat(this.width / 2),
            parseFloat(this.ry)
        ], [
            parseFloat(this.sweepStart) / 180 * Math.PI,
            parseFloat(this.sweepDelta) / 180 * Math.PI
        ], parseFloat(this.rotate) / 180 * Math.PI);
        // console.log(d);
        this.pathE.setAttribute("d", d)
    }

}