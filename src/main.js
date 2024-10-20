import { Dimet } from "./dimet";

const c = new Dimet(document.querySelector("#canvas"));
c.init();
var a = () => {
    c.render();
    requestAnimationFrame(a);
}
a();