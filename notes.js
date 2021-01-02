
    const ctx = this.canvasEl.getContext('2d');
    ctx.translate(ctx.canvas.width/2 + 0.5, ctx.canvas.height/2 + 0.5);
    ctx.beginPath();
    ctx.arc(0, 0, 50, 0, Math.PI * 2);
    ctx.stroke();
