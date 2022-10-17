import helloWorld from "./hellw_world";
import imgsrc from "./assets/1.png";
import imgSvg from "./assets/500.svg";
import exampleTxt from "./assets/example.txt";
import imgJpg from "./assets/5.jpg";

helloWorld();

const img = document.createElement("img");
img.style.cssText = "width: 600px";
img.src = imgsrc;
document.body.appendChild(img);

const img2 = document.createElement("img");
img2.style.cssText = "width: 600px";
img2.src = imgSvg;
document.body.appendChild(img2);

const block = document.createElement("div");
block.style.cssText = "width: 200px; height: 200px; background: aliceblue;";
block.textContent = exampleTxt;
document.body.appendChild(block);

const img3 = document.createElement("img");
img3.style.cssText = "width: 600px";
img3.src = imgJpg;
document.body.appendChild(img3);
