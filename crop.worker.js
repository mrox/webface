self.onmessage = (e) => {
    let pixels = e.data.imgData;
  
//   for( let x = 0; x < pixels.data.length; x += 4 ) {
//     let average = (
//       pixels.data[x] +
//       pixels.data[x + 1] +
//       pixels.data[x + 2]
//     ) / 3;
    
//     pixels.data[x] = average;
//     pixels.data[x + 1] = average;
//     pixels.data[x + 2] = average;
//   }
  
  self.postMessage( {pixels , w: e.data.w, h: e.data.h} );
    
};
  