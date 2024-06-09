function sin(deg):number {
    return Math.sin(deg*(Math.PI/180));
}

function cos(deg):number {
    return Math.cos(deg*(Math.PI/180));
}

function tan(deg):number {
    return Math.tan(deg*(Math.PI/180));
}

function atan(x):number {
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

function projecting3D(fov:number, screenSize:[number, number], renderingRange:number, coords:[number, number, number]):[number, number, number] {
    // var fovVertical = Math.floor((screenSize[1]/screenSize[0])*fov);
    var fovVertical = fov;
    var [x, y, z] = coords;
    z = z+5;
    console.log(atan(x/z));
    x = atan(x / z) / fov*2;
    y = atan(y / z) / fov*2;
    [x, y, z] = [x, y, z/renderingRange];
    // console.log(x,y,z);
    return [x, y, z];
}