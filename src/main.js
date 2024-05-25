const canvas = document.getElementById("canva");
const ctx = canvas.getContext("2d");
const length = 100
var data = {
    "cam": {
        "pos": [0, 5, 0],
        "fov": 60,
        "angle": [0, -90]
    },
    "map": [
        {"pos": [[0, -1, 1], [1, -1, -1], [-1, -1, -1]], "color": "green" },
        {"pos": [[0, 1, 0], [1, -1, -1], [-1, -1, -1]], "color": "yellow" },
        {"pos": [[0, -1, 1], [0, 1, 0], [-1, -1, -1]], "color": "blue" },
        {"pos": [[0, -1, 1], [1, -1, -1], [0, 1, 0]], "color": "red" },
    ]
};

function frame() {
    // fill bg color
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    angleToCoords([30, 20]);
	window.requestAnimationFrame(frame);
}

function angleToCoords(angle) {
    var fov = Number(data.cam.fov);
    var pxPerDeg = canvas.width / fov;
    console.log([(angle[0] + (fov / 2)) * pxPerDeg, (angle[1] + ((fov / (canvas.width / canvas.height)) / 2)) * pxPerDeg]);
}

function paintPixel(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect( x, y, 1, 1 );
}

// resize canva
function resizeCanvas() {
	// canvas.width = window.innerWidth;
	// canvas.height = window.innerHeight;
    canvas.width = 600;
    canvas.height = 400;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

frame();