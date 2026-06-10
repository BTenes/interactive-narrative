// viz_outcome.js
// Dog outcome breakdown donut chart

(function () {
    window.VizOutcome = {
        draw: function (p, manager, ai, progress) {
            var data = manager.outcomeData || [];

            p.push();

            p.textFont('Georgia');

            if (!data || data.length === 0) {
                p.noStroke();
                p.fill(80);
                p.textAlign(p.CENTER, p.CENTER);
                p.textSize(18);
                p.text("Loading outcome data...", p.width / 2, p.height / 2);
                p.pop();
                return;
            }

            var left = (manager.offsetX || 80) + 45;
            var top = 50;
            var w = manager.width || 600;
            var h = (manager.height || 520) - 90;

            var total = 0;
            for (var i = 0; i < data.length; i++) {
                total += data[i].count;
            }

            var cx = left + w * 0.24;
            var cy = top + h * 0.52;
            var outerR = Math.min(w * 0.34, h * 0.42);
            var innerR = outerR * 0.58;

            var colors = [
                [70, 130, 220],   // Adoption
                [120, 112, 190],  // Return to Owner
                [244, 180, 80],   // Transfer
                [225, 99, 99],    // Euthanasia
                [205, 90, 165],   // Rto-Adopt
                [180, 180, 180]   // Other
            ];

            // Draw order is separate from legend order. Keeping Adoption first
            // anchors it on the right; placing small outcomes after it gives
            // their labels room at the bottom of the donut.
            var drawOrder = [0, 3, 4, 5, 2, 1];
            var chartData = drawOrder.map(function (originalIndex) {
                return {
                    originalIndex: originalIndex,
                    outcome: data[originalIndex].outcome,
                    count: data[originalIndex].count,
                    color: colors[originalIndex]
                };
            });

            // title
            p.noStroke();
            p.fill(30);
            p.textAlign(p.LEFT, p.CENTER);
            p.textSize(22);
            p.text("What Happens to Shelter Dogs?", left, 22);

            p.fill(110);
            p.textSize(13);
            p.text("Austin Animal Center, dogs only, 2014 to 2024", left, 44);

            p.fill(80);
            p.textSize(14);
            p.text("Adoption is one of the most meaningful outcomes for shelter dogs.", left, 68);

            // find hovered slice
            var hovered = -1;
            var chartStartAngle = -p.HALF_PI;
            var startAngle = chartStartAngle;

            if (isMouseInsideDonut(p, cx, cy, innerR, outerR)) {
                var mouseAngle = Math.atan2(p.mouseY - cy, p.mouseX - cx);
                mouseAngle = normalizeAngle(mouseAngle);

                var runningAngle = normalizeAngle(startAngle);

                for (var j = 0; j < chartData.length; j++) {
                    var sliceAngle = (chartData[j].count / total) * p.TWO_PI;
                    var endAngle = runningAngle + sliceAngle;

                    if (angleBetween(mouseAngle, runningAngle, endAngle)) {
                        hovered = chartData[j].originalIndex;
                        break;
                    }

                    runningAngle = endAngle;
                }
            }

            // draw donut slices
            startAngle = chartStartAngle;

            for (var k = 0; k < chartData.length; k++) {
                var angleSize = (chartData[k].count / total) * p.TWO_PI;
                var end = startAngle + angleSize;
                var mid = (startAngle + end) / 2;

                var offset = 0;
                if (hovered === chartData[k].originalIndex) {
                    offset = 10;
                }

                var dx = Math.cos(mid) * offset;
                var dy = Math.sin(mid) * offset;

                p.fill(chartData[k].color[0], chartData[k].color[1], chartData[k].color[2]);
                p.noStroke();
                p.arc(cx + dx, cy + dy, outerR * 2, outerR * 2, startAngle, end, p.PIE);

                startAngle = end;
            }

            // donut hole
            p.fill(255);
            p.noStroke();
            p.circle(cx, cy, innerR * 2);

            // center text
            p.fill(40);
            p.textAlign(p.CENTER, p.CENTER);
            p.textSize(15);
            p.text("Total Dogs", cx, cy - 16);

            p.textSize(26);
            p.text(total.toLocaleString(), cx, cy + 12);

            // slice percentages
            startAngle = chartStartAngle;
            p.textStyle(p.BOLD);
            var smallLabelCount = 0;

            for (var n = 0; n < chartData.length; n++) {
                var labelAngleSize = (chartData[n].count / total) * p.TWO_PI;
                var labelEnd = startAngle + labelAngleSize;
                var labelMid = (startAngle + labelEnd) / 2;
                var pctOnSlice = ((chartData[n].count / total) * 100).toFixed(1) + "%";
                var labelR = (outerR + innerR) / 2;
                var labelX = cx + Math.cos(labelMid) * labelR;
                var labelY = cy + Math.sin(labelMid) * labelR;

                p.noStroke();
                p.textAlign(p.CENTER, p.CENTER);

                if (labelAngleSize > 0.16) {
                    p.fill(255);
                    p.textSize(15);
                    p.text(pctOnSlice, labelX, labelY);
                } else {
                    var anchorX = cx + Math.cos(labelMid) * (outerR + 13);
                    var anchorY = cy + Math.sin(labelMid) * (outerR + 13);
                    var outerLabelX = anchorX + (1 - smallLabelCount) * 20;
                    var outerLabelY = cy + outerR + 34;

                    if (chartData[n].outcome === "Euthanasia") {
                        outerLabelX -= 12;
                    }

                    p.stroke(chartData[n].color[0], chartData[n].color[1], chartData[n].color[2]);
                    p.strokeWeight(1);
                    p.line(
                        cx + Math.cos(labelMid) * (outerR - 2),
                        cy + Math.sin(labelMid) * (outerR - 2),
                        anchorX,
                        anchorY
                    );

                    p.noStroke();
                    p.fill(chartData[n].color[0], chartData[n].color[1], chartData[n].color[2]);
                    p.textSize(10);
                    p.text(pctOnSlice, outerLabelX, outerLabelY);
                    smallLabelCount++;
                }

                startAngle = labelEnd;
            }

            p.textStyle(p.NORMAL);

            // legend
            var legendX = left + w * 0.58;
            var legendY = top + 105;
            var rowH = 42;

            p.textAlign(p.LEFT, p.CENTER);

            for (var m = 0; m < data.length; m++) {
                var y = legendY + m * rowH;

                if (hovered === m) {
                    p.fill(245);
                    p.noStroke();
                    p.rect(legendX - 10, y - 17, 190, 34, 8);
                }

                p.fill(colors[m][0], colors[m][1], colors[m][2]);
                p.noStroke();
                p.rect(legendX, y - 8, 18, 18, 4);

                p.fill(40);
                p.textSize(14);
                p.text(data[m].outcome, legendX + 30, y);
            }

            // tooltip
            if (hovered !== -1) {
                var item = data[hovered];
                var pct2 = ((item.count / total) * 100).toFixed(1);

                var boxW = 210;
                var boxH = 90;
                var tx = p.mouseX + 18;
                var ty = p.mouseY - 20;

                if (tx + boxW > p.width - 10) {
                    tx = p.mouseX - boxW - 18;
                }

                if (ty + boxH > p.height - 10) {
                    ty = p.mouseY - boxH - 18;
                }

                if (ty < 10) {
                    ty = 10;
                }

                p.fill(255);
                p.stroke(210);
                p.strokeWeight(1);
                p.rect(tx, ty, boxW, boxH, 10);

                p.noStroke();
                p.fill(30);
                p.textAlign(p.LEFT, p.TOP);
                p.textSize(16);
                p.text(item.outcome, tx + 14, ty + 12);

                p.fill(70);
                p.textSize(14);
                p.text("Count: " + item.count.toLocaleString(), tx + 14, ty + 40);
                p.text("Share: " + pct2 + "%", tx + 14, ty + 62);
            }

            p.pop();

            function normalizeAngle(a) {
                while (a < 0) {
                    a += p.TWO_PI;
                }

                while (a >= p.TWO_PI) {
                    a -= p.TWO_PI;
                }

                return a;
            }

            function angleBetween(target, start, end) {
                target = normalizeAngle(target);
                start = normalizeAngle(start);
                end = normalizeAngle(end);

                if (end < start) {
                    end += p.TWO_PI;
                }

                if (target < start) {
                    target += p.TWO_PI;
                }

                return target >= start && target <= end;
            }

            function isMouseInsideDonut(p, cx, cy, innerR, outerR) {
                var d = p.dist(p.mouseX, p.mouseY, cx, cy);
                return d >= innerR && d <= outerR;
            }
        }
    };
})();
