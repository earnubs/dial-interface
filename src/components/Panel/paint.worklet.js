/* global registerPaint */
const CLR_BLUE = '#8dd5d1cc';
const CLR_GRAY = '#415960';

registerPaint('separator', class {

  paint(ctx, geom) {
    ctx.fillStyle = CLR_BLUE;
    ctx.strokeStyle = CLR_GRAY;

    ctx.beginPath();
    ctx.moveTo(1.5, 1.5);
    ctx.lineTo(geom.width, 1.5);
    ctx.closePath();

    ctx.moveTo(1.5, geom.height - 1.5);
    ctx.lineTo(geom.width, geom.height - 1.5);

    ctx.stroke();
    ctx.fillRect(0, 0, 3, 3);
    ctx.fillRect(geom.width - 3, 0, 3, 3);
    ctx.fillRect(0, geom.height, 3, 3);
    ctx.fillRect(0, geom.height - 3, 3, 3);
    ctx.fillRect(geom.width - 3, geom.height - 3, 3, 3);
  }

});
