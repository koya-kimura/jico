var canvas;

let mainTexture;
let theShader;
let capture;

const waitMaxTime = 10;
let waitTime = 0;

let mode = "start";
let textIndex = 0;
let textArray = ["クリックして進めてください", "はじめに戻りたい時はEnterキーを押してください", "また、終わった後は下にスクロールしてください", "これから沢山のあなたを映します", "自然体でカメラを見てください", "クリックすると始まります"];

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
    // Start Mode
    if(mode == "start"){
        waitTime = 0;
        mainTexture.background(0, 255, 0);
        mainTexture.textSize(min(width, height)*0.04);
        mainTexture.noStroke();
        mainTexture.fill(255, map(noise(frameCount * 0.005), 0, 1, 100, 600));
        mainTexture.textAlign(CENTER, CENTER);
        mainTexture.text(textArray[textIndex], width / 2, height / 2);
    }

    // Play Mode
    if(mode == "play"){
        if(frameCount % 10 == 0){
            // Set the background color green
            mainTexture.background(0, 255, 0);

            // Set the image mode and rect mode
            mainTexture.imageMode(CENTER);
            mainTexture.rectMode(CENTER);

            // grid size
            const step = min(width, height) / 4;
            for (let x = -width * 0.05; x < width*1.05; x += step) {
                for (let y = -height * 0.05; y < height*1.05; y += step) {
                    const s = step * 0.8;

                    // Draw the video capture shadow
                    mainTexture.noStroke();
                    mainTexture.fill(0);
                    mainTexture.rect(x + s * 0.03, y + s * 0.03, s, s);

                    // Draw the video capture
                    const captureW = random(capture.width);
                    const captureH = random(capture.height);
                    const captureX = random(capture.width - captureW);
                    const captureY = random(capture.height - captureH);

                    mainTexture.image(capture, x, y, s, s, captureX, captureY, captureW, captureH);
                }
            }

            // Draw the hide rectangle
            const alpha = map(pow(waitTime / waitMaxTime, 5), 0, 1, 230, 0);
            mainTexture.fill(255, alpha);
            mainTexture.rect(width/2, height/2, width, height);

            // Stop the loop if the capture is not ready
            if (isCaptureReady() && mode == "play") {
                waitTime++;
            }
            if (waitTime > waitMaxTime) {
                mode == "end";
                noLoop();
            }
        }
    }

    // Draw the shader
    shader(theShader);

    // Send the camera capture to the shader
    theShader.setUniform('u_time', millis() / 1000.0);
    theShader.setUniform('u_tex', mainTexture);

    // Draw the rectangle
    rect(0, 0, width, height);

    // Remove the mainTexture
    mainTexture.remove();
}

// Change the mode when the mouse is pressed
function mousePressed() {
    if (mode == "start") {
        if (textIndex < textArray.length - 1) {
            textIndex++;
        } else {
            mode = "play";
        }
    }
}

// Change the mode when the key is pressed
function keyPressed() {
    if (keyCode === ENTER) {
        mode = "start";
        textIndex = 0;
        loop();
    }
}

// Check if the capture is ready
function isCaptureReady() {
    return capture.loadedmetadata && capture.width > 0 && capture.height > 0;
}

// Resize the canvas when the window is resized
function windowResized() {
    resizeCanvas(windowWidth, windowHeight, WEBGL);
}