// viz_bar.js
// Dog intake and adoption yearly timeline
// Data comes from CSV, not hard-coded JS data.

(function () {
    window.VizBar = {
        draw: function (p, manager, ai, progress) {
            var data = manager.dogData || [];

            p.push();

            p.textFont('Georgia');

            // If data is not loaded yet
            if (!data || data.length === 0) {
                p.noStroke();
                p.fill(80);
                p.textAlign(p.CENTER, p.CENTER);
                p.textSize(18);
                p.text("Loading dog data...", p.width / 2, p.height / 2);
                p.pop();
                return;
            }

            var left = manager.offsetX || 80;
            var top = 55;
            var w = (manager.width || 600) - 80;
            var h = (manager.height || 520) - 130;

            var maxY = getMaxY(data);

            function xScale(i) {
                return left + p.map(i, 0, data.length - 1, 0, w);
            }

            function yScale(value) {
                return top + p.map(value, 0, maxY, h, 0);
            }

            // title
            p.noStroke();
            p.fill(30);
            p.textAlign(p.LEFT, p.CENTER);
            p.textSize(22);
            p.text("Dog Intake and Adoption by Year", left, 24);

            p.fill(110);
            p.textSize(13);
            p.text("Austin Animal Center, dogs only, 2014 to 2024", left, 46);

            // grid lines and y-axis labels
            var gridCount = 6;

            for (var i = 0; i <= gridCount; i++) {
                var value = (maxY / gridCount) * i;
                var y = yScale(value);

                p.stroke(230);
                p.strokeWeight(1);
                p.line(left, y, left + w, y);

                p.noStroke();
                p.fill(120);
                p.textAlign(p.RIGHT, p.CENTER);
                p.textSize(12);
                p.text(Math.round(value), left - 12, y);
            }

            // axis lines
            p.stroke(170);
            p.strokeWeight(1);
            p.line(left, top, left, top + h);
            p.line(left, top + h, left + w, top + h);

            // gap area
            p.noStroke();
            p.fill(80, 140, 220, 35);

            p.beginShape();

            for (var a = 0; a < data.length; a++) {
                p.vertex(xScale(a), yScale(data[a].intake));
            }

            for (var b = data.length - 1; b >= 0; b--) {
                p.vertex(xScale(b), yScale(data[b].adoption));
            }

            p.endShape(p.CLOSE);

            // intake line
            p.noFill();
            p.stroke(70, 130, 220);
            p.strokeWeight(3);

            p.beginShape();
            for (var c = 0; c < data.length; c++) {
                p.vertex(xScale(c), yScale(data[c].intake));
            }
            p.endShape();

            // adoption line
            p.drawingContext.setLineDash([10, 7]);
            p.stroke(80, 165, 120);
            p.strokeWeight(3);

            p.beginShape();
            for (var d = 0; d < data.length; d++) {
                p.vertex(xScale(d), yScale(data[d].adoption));
            }
            p.endShape();

            p.drawingContext.setLineDash([]);

            // points and x-axis labels
            for (var e = 0; e < data.length; e++) {
                var x = xScale(e);

                // intake point
                p.fill(250);
                p.stroke(70, 130, 220);
                p.strokeWeight(2);
                p.circle(x, yScale(data[e].intake), 8);

                // adoption point
                p.stroke(80, 165, 120);
                p.circle(x, yScale(data[e].adoption), 8);

                // year label
                p.noStroke();
                p.fill(100);
                p.textAlign(p.CENTER, p.TOP);
                p.textSize(12);
                p.text(data[e].year, x, top + h + 12);
            }

            // y-axis label
            p.push();
            p.translate(22, top + h / 2);
            p.rotate(-p.HALF_PI);
            p.noStroke();
            p.fill(90);
            p.textAlign(p.CENTER, p.CENTER);
            p.textSize(13);
            p.text("Number of Dogs", 0, 0);
            p.pop();

            // pandemic reference line at 2020
            var pandemic2020 = null;
            for (var pi = 0; pi < data.length; pi++) {
                if (data[pi].year === 2020) { pandemic2020 = pi; break; }
            }
            if (pandemic2020 !== null) {
                var px = xScale(pandemic2020);

                // dashed vertical line
                p.stroke(180, 100, 100);
                p.strokeWeight(1.2);
                p.drawingContext.setLineDash([6, 4]);
                p.line(px, top, px, top + h);
                p.drawingContext.setLineDash([]);

                // label
                p.noStroke();
                p.fill(180, 100, 100);
                p.textAlign(p.CENTER, p.BOTTOM);
                p.textSize(11);
                p.text('COVID-19', px, top - 4);
                p.textSize(10);
                p.text('pandemic', px, top + 8);
            }

            // hover tooltip
            if (
                p.mouseX >= left &&
                p.mouseX <= left + w &&
                p.mouseY >= top &&
                p.mouseY <= top + h
            ) {
                var closest = 0;
                var bestDist = 999999;

                for (var f = 0; f < data.length; f++) {
                    var distX = Math.abs(p.mouseX - xScale(f));

                    if (distX < bestDist) {
                        bestDist = distX;
                        closest = f;
                    }
                }

                var item = data[closest];
                var hx = xScale(closest);
                var intakeY = yScale(item.intake);
                var adoptionY = yScale(item.adoption);

                // vertical guide line
                p.stroke(190);
                p.strokeWeight(1);
                p.line(hx, top, hx, top + h);

                // bigger hover points
                p.noStroke();
                p.fill(70, 130, 220);
                p.circle(hx, intakeY, 14);

                p.fill(80, 165, 120);
                p.circle(hx, adoptionY, 14);

                // tooltip box
                var boxW = 185;
                var boxH = 115;
                var tx = hx + 15;
                var ty = Math.min(intakeY, adoptionY) - 20;

                if (tx + boxW > left + w) {
                    tx = hx - boxW - 15;
                }

                if (ty < 10) {
                    ty = 10;
                }

                p.fill(255);
                p.stroke(210);
                p.strokeWeight(1);
                p.rect(tx, ty, boxW, boxH, 10);

                p.noStroke();
                p.textAlign(p.LEFT, p.TOP);

                p.fill(30);
                p.textSize(16);
                p.text(item.year, tx + 14, ty + 12);

                p.fill(70, 130, 220);
                p.textSize(14);
                p.text("Intake: " + item.intake, tx + 14, ty + 42);

                p.fill(80, 165, 120);
                p.text("Adoption: " + item.adoption, tx + 14, ty + 66);

                p.fill(60);
                p.text("Gap: " + item.gap, tx + 14, ty + 90);
            }

            // legend
            var ly = top + h + 55;

            p.stroke(70, 130, 220);
            p.strokeWeight(3);
            p.line(left, ly, left + 35, ly);

            p.noStroke();
            p.fill(60);
            p.textAlign(p.LEFT, p.CENTER);
            p.textSize(13);
            p.text("intake", left + 45, ly);

            p.stroke(80, 165, 120);
            p.strokeWeight(3);
            p.drawingContext.setLineDash([10, 7]);
            p.line(left + 110, ly, left + 145, ly);
            p.drawingContext.setLineDash([]);

            p.noStroke();
            p.fill(60);
            p.text("adoption", left + 155, ly);

            p.fill(80, 140, 220, 35);
            p.rect(left + 245, ly - 8, 22, 16);

            p.fill(60);
            p.text("gap = intake - adoption", left + 275, ly);

            p.pop();

            function getMaxY(data) {
                var maxValue = 0;

                for (var i = 0; i < data.length; i++) {
                    maxValue = Math.max(maxValue, data[i].intake, data[i].adoption);
                }

                // round up to nearest 1000
                return Math.ceil(maxValue / 1000) * 1000;
            }
        }
    };
})();