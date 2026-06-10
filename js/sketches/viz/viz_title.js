// viz_title.js
// Intro image for the opening section

(function () {
    window.VizTitle = {
        draw: function (p, manager, ai, progress) {
            p.push();

            // Load image only once
            if (!manager.introImg) {
                manager.introImg = p.loadImage(
                    "img/intro-pic.jpg",
                    function () {
                        console.log("Intro image loaded");
                    },
                    function () {
                        console.error("Intro image failed to load. Check path: img/intro-pic.jpg");
                    }
                );
            }

            // If image is not ready yet, show loading text
            if (!manager.introImg || manager.introImg.width === 0) {
                p.noStroke();
                p.fill(120);
                p.textAlign(p.CENTER, p.CENTER);
                p.textSize(16);
                p.text("Loading intro image...", p.width * 0.72, p.height * 0.45);
                p.pop();
                return;
            }

            // Image display box
            var boxX = 100;
            var boxY = 50;
            var boxW = 600;
            var boxH = 420;

            // Keep original image ratio, no distortion
            var imgRatio = manager.introImg.width / manager.introImg.height;
            var boxRatio = boxW / boxH;

            var drawW;
            var drawH;

            if (imgRatio > boxRatio) {
                drawW = boxW;
                drawH = boxW / imgRatio;
            } else {
                drawH = boxH;
                drawW = boxH * imgRatio;
            }

            var drawX = boxX + (boxW - drawW) / 2;
            var drawY = boxY + (boxH - drawH) / 2;

            // Optional white card background
            p.noStroke();
            p.fill(255);
            p.rect(boxX - 12, boxY - 12, boxW + 24, boxH + 24, 16);

            // Draw image
            p.imageMode(p.CORNER);
            p.image(manager.introImg, drawX, drawY, drawW, drawH);

            p.pop();
        }
    };
})();
