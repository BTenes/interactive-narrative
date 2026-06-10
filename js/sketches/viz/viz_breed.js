// viz_breed.js
// Dog breed intake vs adoption grouped bar chart

(function () {
    window.VizBreed = {
        draw: function (p, manager, ai, progress) {
            var data = manager.breedData || [];

            p.push();

            p.textFont('Georgia');

            if (!data || data.length === 0) {
                p.noStroke();
                p.fill(80);
                p.textAlign(p.CENTER, p.CENTER);
                p.textSize(18);
                p.text("Loading breed data...", p.width / 2, p.height / 2);
                p.pop();
                return;
            }

            // Leave enough space for long breed names
            var left = 205;
            var top = 112;
            var chartW = (manager.width || 600) * 0.68;
            var chartH = (manager.height || 520) - 210;

            var maxValue = 0;
            for (var i = 0; i < data.length; i++) {
                maxValue = Math.max(maxValue, data[i].intake, data[i].adoption);
            }

            maxValue = Math.ceil(maxValue / 1000) * 1000;

            var rowH = chartH / data.length;
            var barH = rowH * 0.28;
            var arrowWeight = 2.8;
            var shelterLineWeight = 1.8;
            var shelterEdgeGap = shelterLineWeight / 2 + 1;
            var intakeColor = [70, 130, 220];
            var adoptionColor = [80, 165, 120];
            var shelterX = left + chartW * 0.50;
            var halfW = chartW * 0.43;
            var chartLeft = shelterX - halfW;
            var chartRight = shelterX + halfW;

            // title
            p.noStroke();
            p.fill(30);
            p.textAlign(p.LEFT, p.CENTER);
            p.textSize(22);
            p.text("Dog Intake and Adoption by Breed", left, 28);

            p.fill(110);
            p.textSize(13);
            p.text("Austin Animal Center, dogs only, top 12 breeds by intake, 2014 to 2024", left, 52);

            p.fill(80);
            p.textSize(14);

            // grid and x labels. The shelter is the shared zero point:
            // intake flows into it from the left, adoption flows out to the right.
            var gridCount = 3;

            for (var g = 0; g <= gridCount; g++) {
                var value = (maxValue / gridCount) * g;
                var dx = p.map(value, 0, maxValue, 0, halfW);
                var leftGridX = shelterX - dx;
                var rightGridX = shelterX + dx;

                p.stroke(230);
                p.strokeWeight(1);
                p.line(leftGridX, top, leftGridX, top + chartH);
                if (g > 0) {
                    p.line(rightGridX, top, rightGridX, top + chartH);
                }

                p.noStroke();
                p.fill(120);
                p.textAlign(p.CENTER, p.TOP);
                p.textSize(11);
                if (g === 0) {
                    p.text("0", shelterX, top + chartH + 8);
                } else {
                    p.text(Math.round(value), leftGridX, top + chartH + 8);
                    p.text(Math.round(value), rightGridX, top + chartH + 8);
                }
            }

            p.noStroke();
            p.fill(110);
            p.textAlign(p.CENTER, p.BOTTOM);
            p.textSize(11);
            p.text("entering shelter", shelterX - halfW / 2, top - 12);
            p.text("leaving by adoption", shelterX + halfW / 2, top - 12);

            p.noStroke();
            p.fill(80);
            p.textAlign(p.CENTER, p.BOTTOM);
            p.textSize(12);
            p.text("Shelter", shelterX, top - 12);

            // hover background
            var hovered = null;

            for (var r = 0; r < data.length; r++) {
                var item = data[r];
                var y = top + r * rowH + rowH / 2;
                var isHovered = (
                    p.mouseX >= chartLeft - 225 &&
                    p.mouseX <= chartRight &&
                    p.mouseY >= y - rowH / 2 &&
                    p.mouseY <= y + rowH / 2
                );

                if (isHovered) {
                    hovered = {
                        item: item,
                        y: y
                    };

                    p.noStroke();
                    p.fill(226, 236, 248, 210);
                    p.rect(chartLeft - 225, y - rowH / 2 + 2, chartRight - chartLeft + 230, rowH - 4, 6);
                }
            }

            p.stroke(120);
            p.strokeWeight(shelterLineWeight);
            p.line(shelterX, top - 6, shelterX, top + chartH);

            // bars
            for (var r2 = 0; r2 < data.length; r2++) {
                var item2 = data[r2];

                var y2 = top + r2 * rowH + rowH / 2;
                var intakeW = p.map(item2.intake, 0, maxValue, 0, halfW);
                var adoptionW = p.map(item2.adoption, 0, maxValue, 0, halfW);
                var isHoveredRow = hovered && hovered.item === item2;

                // breed label
                p.noStroke();
                p.fill(isHoveredRow ? 20 : 45);
                p.textAlign(p.RIGHT, p.CENTER);
                p.textSize(12);
                p.text(item2.breed, chartLeft - 16, y2);

                // intake arrow: dogs entering the shelter
                drawArrowLine(
                    p,
                    shelterX - intakeW,
                    y2 - barH / 2 - 3,
                    shelterX - shelterEdgeGap,
                    y2 - barH / 2 - 3,
                    intakeColor,
                    arrowWeight
                );

                // adoption arrow: dogs leaving through adoption
                drawArrowLine(
                    p,
                    shelterX + shelterEdgeGap,
                    y2 + barH / 2 + 3,
                    shelterX + adoptionW,
                    y2 + barH / 2 + 3,
                    adoptionColor,
                    arrowWeight
                );

            }

            // axis
            p.stroke(170);
            p.strokeWeight(1);
            p.line(chartLeft, top + chartH, chartRight, top + chartH);

            // x-axis label
            p.noStroke();
            p.fill(90);
            p.textAlign(p.CENTER, p.TOP);
            p.textSize(13);
            p.text("Number of Dogs", shelterX, top + chartH + 35);

            // legend
            var legendX = chartRight + 18;
            var legendY = top + 25;

            p.noStroke();

            // intake legend
            drawArrowLine(p, legendX, legendY + 9, legendX + 34, legendY + 9, intakeColor, arrowWeight);

            p.fill(50);
            p.textAlign(p.LEFT, p.CENTER);
            p.textSize(13);
            p.text("Intake", legendX + 45, legendY + 9);

            // adoption legend
            drawArrowLine(p, legendX, legendY + 43, legendX + 34, legendY + 43, adoptionColor, arrowWeight);

            p.fill(50);
            p.text("Adoption", legendX + 45, legendY + 43);

            // tooltip
            if (hovered) {
                var d = hovered.item;

                var boxW = 205;
                var boxH = 116;
                var tx = Math.min(chartRight + 20, p.width - boxW - 12);
                var ty = hovered.y - boxH / 2;

                if (ty < top) {
                    ty = top;
                }

                if (ty + boxH > top + chartH) {
                    ty = top + chartH - boxH;
                }

                p.fill(255);
                p.stroke(210);
                p.strokeWeight(1);
                p.rect(tx, ty, boxW, boxH, 8);

                p.noStroke();
                p.textAlign(p.LEFT, p.TOP);

                p.fill(30);
                p.textSize(14);
                p.text(d.breed, tx + 14, ty + 12);

                p.fill(intakeColor[0], intakeColor[1], intakeColor[2]);
                p.textSize(12);
                p.text("Intake: " + d.intake.toLocaleString(), tx + 14, ty + 38);

                p.fill(adoptionColor[0], adoptionColor[1], adoptionColor[2]);
                p.text("Adoption: " + d.adoption.toLocaleString(), tx + 14, ty + 58);

                p.fill(70);
                p.text("Gap: " + d.gap.toLocaleString(), tx + 14, ty + 78);
                p.text("Adoption rate: " + Math.round(d.adoptionRate * 100) + "%", tx + 14, ty + 98);
            }

            p.pop();

            function drawArrowLine(p, x1, y1, x2, y2, color, weight) {
                var angle = Math.atan2(y2 - y1, x2 - x1);
                var length = p.dist(x1, y1, x2, y2);
                var headSize = Math.min(7, Math.max(2.5, length * 0.55));
                var shaftEndX = x2 - Math.cos(angle) * headSize;
                var shaftEndY = y2 - Math.sin(angle) * headSize;

                p.stroke(color[0], color[1], color[2], 210);
                p.strokeWeight(weight);
                p.strokeCap(p.ROUND);
                p.line(x1, y1, shaftEndX, shaftEndY);
                p.strokeCap(p.SQUARE);

                p.noStroke();
                p.fill(color[0], color[1], color[2], 220);
                p.triangle(
                    x2,
                    y2,
                    x2 - Math.cos(angle - 0.55) * headSize,
                    y2 - Math.sin(angle - 0.55) * headSize,
                    x2 - Math.cos(angle + 0.55) * headSize,
                    y2 - Math.sin(angle + 0.55) * headSize
                );
            }
        }
    };
})();
