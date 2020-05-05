
export const f_svg_ellipse_arc = (([cx, cy], [rx, ry], [t1, Δ], φ) => {

    const cos = Math.cos;
    const sin = Math.sin;
    const π = Math.PI;

    const f_matrix_times = (([[a, b], [c, d]], [x, y]) => [a * x + b * y, c * x + d * y]);
    const f_rotate_matrix = ((x) => [[cos(x), -sin(x)], [sin(x), cos(x)]]);
    const f_vec_add = (([a1, a2], [b1, b2]) => [a1 + b1, a2 + b2]);


    /* [
    returns a SVG path element that represent a ellipse.
    cx,cy → center of ellipse
    rx,ry → major minor radius
    t1 → start angle, in radian.
    Δ → angle to sweep, in radian. positive.
    φ → rotation on the whole, in radian
    URL: SVG Circle Arc http://xahlee.info/js/svg_circle_arc.html
     ] */
    Δ = Δ % (2 * π);
    const rotMatrix = f_rotate_matrix(φ);
    const [sX, sY] = (f_vec_add(f_matrix_times(rotMatrix, [rx * cos(t1), ry * sin(t1)]), [cx, cy]));
    const [eX, eY] = (f_vec_add(f_matrix_times(rotMatrix, [rx * cos(t1 + Δ), ry * sin(t1 + Δ)]), [cx, cy]));
    const fA = ((Δ > π) ? 1 : 0);
    const fS = ((Δ > 0) ? 1 : 0);
    // const path_2wk2r = document.createElementNS("http://www.w3.org/2000/svg", "path");
    // path_2wk2r.setAttribute("d", "M " + sX + " " + sY + " A " + [rx, ry, φ / (2 * π) * 360, fA, fS, eX, eY].join(" "));
    return "M " + sX + " " + sY + " A " + [rx, ry, φ / (2 * π) * 360, fA, fS, eX, eY].join(" ");
});

// export const f_svg_ellipse_arc = (([cx, cy], [rx, ry], [t1, AG], RT) => {

//     const cos = Math.cos;
//     const sin = Math.sin;
//     const PI = Math.PI;
//     // const f_matrix_times = (( [[a,b], [c,d]], [x,y]) => [ a * x + b * y, c * x + d * y]);
//     const f_matrix_times = (([[a, b], [c, d]], [x, y]) => [a * x + b * y, c * x + d * y]);
//     const f_rotate_matrix = ((x) => {
//         const cosx = cos(x);
//         const sinx = sin(x);
//         return [[cosx, -sinx], [sinx, cosx]];
//     });
//     // const f_vec_add = (([a1, a2], [b1, b2]) => [a1 + b1, a2 + b2]);
//     const f_vec_add = (([a1, a2], [b1, b2]) => [a1 + b1, a2 + b2]);
//     /* [
//     returns a a array that represent a ellipse for SVG path element d attribute.
//     cx,cy â†’ center of ellipse.
//     rx,ry â†’ major minor radius.
//     t1 â†’ start angle, in radian.
//     AG â†’ angle to sweep, in radian. positive.
//     RT â†’ rotation on the whole, in radian.
//     url: SVG Circle Arc http://xahlee.info/js/svg_circle_arc.html
//     Version 2019-06-19
//      ] */
//     AG = AG % (2 * PI);
//     const rotMatrix = f_rotate_matrix(RT);
//     const [sX, sY] = (f_vec_add(f_matrix_times(rotMatrix, [rx * cos(t1), ry * sin(t1)]), [cx, cy]));
//     const [eX, eY] = (f_vec_add(f_matrix_times(rotMatrix, [rx * cos(t1 + AG), ry * sin(t1 + AG)]), [cx, cy]));
//     const fA = ((AG > PI) ? 1 : 0);
//     const fS = ((AG > 0) ? 1 : 0);
//     return [" M ", sX, " ", sY, " A ", rx, ry, RT / PI * 180, fA, fS, eX, eY];
// });