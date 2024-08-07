var canvas;

let mainTexture;
let theShader;
let capture;
let waitTime = 0;

let mode = "start";
let textIndex = 0;
let textArray = ["クリックして進めてください", "はじめに戻りたい時はEnterキーを押してください"
    , "また、終わった後は下にスクロールしてください"
    , "これから沢山のあなたを映します", "自然体でカメラを見てください", "それでは始めましょう"
];

let font;

function preload() {
    theShader = loadShader('../shader/main.vert', '../shader/main.frag');
    font = loadFont('../asset/ZenOldMincho-Regular.ttf');
}

function setup() {
    canvas = createCanvas(windowWidth, windowHeight, WEBGL);
    canvas.parent("p5-canvas");

    mainTexture = createGraphics(width, height);
    mainTexture.textFont(font);

    // Create a video capture
    capture = createCapture(VIDEO);
    capture.hide();
}

function draw() {
    if(mode == "start"){
        waitTime = 0;
        mainTexture.background(0, 255, 0);
        mainTexture.textSize(min(width, height)*0.04);
        mainTexture.noStroke();
        mainTexture.fill(255, map(noise(frameCount * 0.005), 0, 1, 100, 500));
        mainTexture.textAlign(CENTER, CENTER);
        mainTexture.text(textArray[textIndex], width / 2, height / 2);
    }

    if(mode == "play"){
        if(frameCount % 10 == 0){
            mainTexture.background(0, 255, 0);
            mainTexture.imageMode(CENTER);
            mainTexture.rectMode(CENTER);

            // Draw the video capture
            const step = min(width, height) / 5;
            for (let x = -width * 0.05; x < width*1.05; x += step) {
                for (let y = -height * 0.05; y < height*1.05; y += step) {
                    const s = step * 0.8;

                    // Draw the video capture shadow
                    mainTexture.noStroke();
                    mainTexture.fill(0);
                    mainTexture.rect(x + s * 0.03, y + s * 0.03, s, s);

                    // Draw the video capture pg
                    let pg = createGraphics(s, s);
                    const captureW = random(capture.width);
                    const captureH = random(capture.height);
                    const captureX = random(capture.width - captureW);
                    const captureY = random(capture.height - captureH);
                    pg.image(capture, 0, 0, s, s, captureX, captureY, captureW, captureH);
                    mainTexture.image(pg, x, y, s, s);
                }
            }

            const alpha = map(pow(waitTime / 30, 5), 0, 1, 255, 0);
            mainTexture.fill(255, alpha);
            mainTexture.rect(width/2, height/2, width, height);

            // Stop the loop if the capture is not ready
            if (isCaptureReady() && mode == "play") {
                waitTime++;
            }
            if (waitTime > 30) {
                mode == "end";
                noLoop();
            }
        }
    }

    shader(theShader);

    theShader.setUniform('u_time', millis() / 1000.0);
    theShader.setUniform('u_tex', mainTexture);

    rect(0, 0, width, height);

    mainTexture.remove();
}

function mousePressed() {
    modeManager();
}

function keyPressed() {
    if (keyCode === ENTER) {
        mode = "start";
        textIndex = 0;
        loop();
    }
}

function modeManager(){
    if (mode == "start"){
        if (textIndex < textArray.length - 1){
            textIndex++;
        } else {
            mode = "play";
        }
    }
}

// Check if the capture is ready
function isCaptureReady() {
    return capture.loadedmetadata && capture.width > 0 && capture.height > 0;
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight, WEBGL);
}