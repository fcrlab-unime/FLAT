var canvas = document.getElementById('inferenceCanvas');

document.addEventListener("DOMContentLoaded", function() {
    var ctx = canvas.getContext('2d');
    var isDrawing = false;

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 20;

    function getMousePos(canvas, e) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top 
        };
    }

    function startDrawing(e) {
        isDrawing = true;
        var pos = getMousePos(canvas, e);
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
    }

    function draw(e) {
        if (isDrawing) {
            var pos = getMousePos(canvas, e);
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
        }
    }

    function stopDrawing() {
        isDrawing = false;
    }

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
});

lastCanvas = 0
function getDrawingPixels() {
    var resizedCanvas = document.createElement(`canvas`);
    document.getElementById('inferenceHistory').appendChild(resizedCanvas); // Aggiuni il canvas al DOM
    var resizedCtx = resizedCanvas.getContext('2d');

    resizedCanvas.width = 28;
    resizedCanvas.height = 28;
    resizedCtx.drawImage(canvas, 0, 0, 28, 28);

    var imageData = resizedCtx.getImageData(0, 0, 28, 28);
    var pixelData = imageData.data;
    var pixels = [];

    for (var i = 0; i < pixelData.length; i += 4) {
        var grayValue = (pixelData[i] + pixelData[i + 1] + pixelData[i + 2]) / 3;
        var normalizedValue = grayValue;
        pixels.push(normalizedValue);
    }
    return pixels;
}

function clearCanvas() {
    var canvas = document.getElementById('inferenceCanvas');
    ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}