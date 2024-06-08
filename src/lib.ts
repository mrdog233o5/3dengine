function sin(deg) {
    return Math.sin(deg*(Math.PI/180));
}

function cos(deg) {
    return Math.cos(deg*(Math.PI/180));
}

function tan(deg) {
    return Math.tan(deg*(Math.PI/180));
}

function atan(x) {
    return Math.atan(x) * ( 180 / Math.PI );
}

function calcRotatedCoord2D(camAngle:number, coords: [number, number]): [number, number] {
    var originalX = coords[0];
    var originalY = coords[1];
    var relAngle = atan(originalX/originalY);
    var angle = camAngle + relAngle;
    var distance = Math.sqrt(originalX**2 + originalY**2);

    var x = (sin(angle) * distance);
    var y = (cos(angle) * distance);
    return [x, y];
}