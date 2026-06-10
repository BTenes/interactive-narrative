// viz_heatmap.js
// Dog adoptions heatmap by month and day

(function () {
    window.VizHeatmap = {
        draw: function (p, manager, ai, progress) {
            var data = manager.heatmapData || [];

            p.push();

            p.textFont('Georgia');

            if (!data || data.length === 0) {
                p.noStroke();
                p.fill(80);
                p.textAlign(p.CENTER, p.CENTER);
                p.textSize(18);
                p.text("Loading heatmap data...", p.width / 2, p.height / 2);
                p.pop();
                return;
            }

            var left = manager.offsetX || 80;
            var top = 90;
            var chartW = (manager.width || 600) * 0.76;
            var chartH = (manager.height || 520) - 180;

            var rows = 12;
            var cols = 31;
            var cellW = chartW / cols;
            var cellH = chartH / rows;

            var maxCount = 0;
            for (var i = 0; i < data.length; i++) {
                if (data[i].count > maxCount) {
                    maxCount = data[i].count;
                }
            }

            // title
            p.noStroke();
            p.fill(30);
            p.textAlign(p.LEFT, p.CENTER);
            p.textSize(22);
            p.text("When Are Dog Adoptions Most Common?", left, 25);

            p.fill(110);
            p.textSize(13);
            p.text("Austin Animal Center, dogs only, adoption outcomes, 2014 to 2024", left, 48);

            p.fill(80);
            p.textSize(14);
            p.text("Cells are grouped into Low, Medium, High, and Very High adoption levels.", left, 72);

            // month labels
            var monthLabels = [
                "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
            ];

            p.textAlign(p.RIGHT, p.CENTER);
            p.textSize(12);
            p.fill(90);

            for (var r = 0; r < rows; r++) {
                var y = top + r * cellH + cellH / 2;
                p.text(monthLabels[r], left - 10, y);
            }

            // day labels
            p.textAlign(p.CENTER, p.TOP);
            for (var c = 0; c < cols; c++) {
                var x = left + c * cellW + cellW / 2;
                p.text(c + 1, x, top + chartH + 8);
            }

            // axis labels
            p.push();
            p.translate(25, top + chartH / 2);
            p.rotate(-p.HALF_PI);
            p.textAlign(p.CENTER, p.CENTER);
            p.textSize(13);
            p.fill(90);
            p.text("Month", 0, 0);
            p.pop();

            p.textAlign(p.CENTER, p.TOP);
            p.textSize(13);
            p.fill(90);
            p.text("Day of Month", left + chartW / 2, top + chartH + 32);

            // heatmap
            var hovered = null;

            for (var r2 = 0; r2 < rows; r2++) {
                for (var c2 = 0; c2 < cols; c2++) {
                    var item = getItem(data, r2 + 1, c2 + 1);
                    var count = item ? item.count : 0;

                    var x2 = left + c2 * cellW;
                    var y2 = top + r2 * cellH;

                    var fillColor = getHeatColor(count, maxCount);

                    p.noStroke();
                    p.fill(fillColor.r, fillColor.g, fillColor.b);
                    p.rect(x2, y2, cellW - 1, cellH - 1);

                    if (
                        p.mouseX >= x2 &&
                        p.mouseX <= x2 + cellW &&
                        p.mouseY >= y2 &&
                        p.mouseY <= y2 + cellH
                    ) {
                        hovered = {
                            month: r2 + 1,
                            day: c2 + 1,
                            count: count,
                            x: x2,
                            y: y2
                        };

                        p.noFill();
                        p.stroke(35);
                        p.strokeWeight(2);
                        p.rect(x2, y2, cellW - 1, cellH - 1);
                    }
                }
            }

            // discrete legend with ranges
            var legendX = left + chartW + 25;
            var legendY = top + 20;
            var boxW = 22;
            var boxH = 28;
            var gap = 8;

            var lowMax = Math.floor(maxCount * 0.25);
            var medMin = lowMax + 1;
            var medMax = Math.floor(maxCount * 0.5);
            var highMin = medMax + 1;
            var highMax = Math.floor(maxCount * 0.75);
            var veryHighMin = highMax + 1;

            var legendItems = [
                {
                    label: "Very High",
                    range: veryHighMin + " - " + maxCount,
                    color: { r: 8, g: 48, b: 107 }
                },
                {
                    label: "High",
                    range: highMin + " - " + highMax,
                    color: { r: 49, g: 130, b: 189 }
                },
                {
                    label: "Medium",
                    range: medMin + " - " + medMax,
                    color: { r: 158, g: 202, b: 225 }
                },
                {
                    label: "Low",
                    range: "0 - " + lowMax,
                    color: { r: 239, g: 243, b: 255 }
                }
            ];

            p.noStroke();
            p.fill(80);
            p.textAlign(p.LEFT, p.CENTER);
            p.textSize(13);
            p.text("Adoption Level", legendX, legendY - 18);

            for (var li = 0; li < legendItems.length; li++) {
                var ly = legendY + li * (boxH + gap);

                p.noStroke();
                p.fill(
                    legendItems[li].color.r,
                    legendItems[li].color.g,
                    legendItems[li].color.b
                );
                p.rect(legendX, ly, boxW, boxH, 4);

                p.fill(70);
                p.textAlign(p.LEFT, p.CENTER);
                p.textSize(12);
                p.text(
                    legendItems[li].label,
                    legendX + boxW + 10,
                    ly + 8
                );

                p.fill(105);
                p.textSize(11);
                p.text(
                    legendItems[li].range + " adoptions",
                    legendX + boxW + 10,
                    ly + 22
                );
            }

            p.fill(110);
            p.textSize(11);
            p.textAlign(p.LEFT, p.TOP);
            p.text("Range based on max count", legendX, legendY + 4 * (boxH + gap) + 10);
            p.text("Max count: " + maxCount, legendX, legendY + 4 * (boxH + gap) + 28);

            // tooltip
            if (hovered) {
                var tooltipW = 205;
                var tooltipH = 98;
                var tx = p.mouseX + 15;
                var ty = p.mouseY - 10;

                if (tx + tooltipW > p.width - 10) {
                    tx = p.mouseX - tooltipW - 15;
                }

                if (ty + tooltipH > p.height - 10) {
                    ty = p.mouseY - tooltipH - 15;
                }

                if (ty < 10) {
                    ty = 10;
                }

                var level = getHeatLevel(hovered.count, maxCount);
                var range = getHeatRange(hovered.count, maxCount);

                p.fill(255);
                p.stroke(210);
                p.strokeWeight(1);
                p.rect(tx, ty, tooltipW, tooltipH, 10);

                p.noStroke();
                p.fill(30);
                p.textAlign(p.LEFT, p.TOP);
                p.textSize(15);
                p.text(monthLabels[hovered.month - 1] + " " + hovered.day, tx + 12, ty + 12);

                p.fill(70);
                p.textSize(14);
                p.text("Adoptions: " + hovered.count, tx + 12, ty + 40);
                p.text("Level: " + level, tx + 12, ty + 62);

                p.fill(105);
                p.textSize(12);
                p.text("Range: " + range + " adoptions", tx + 12, ty + 80);
            }

            p.pop();

            function getItem(data, month, day) {
                for (var i = 0; i < data.length; i++) {
                    if (data[i].month === month && data[i].day === day) {
                        return data[i];
                    }
                }
                return null;
            }

            function getHeatColor(value, maxValue) {
                if (maxValue === 0 || value === 0) {
                    return { r: 239, g: 243, b: 255 };
                }

                var t = value / maxValue;

                // Low
                if (t <= 0.25) {
                    return { r: 239, g: 243, b: 255 };
                }

                // Medium
                if (t <= 0.5) {
                    return { r: 158, g: 202, b: 225 };
                }

                // High
                if (t <= 0.75) {
                    return { r: 49, g: 130, b: 189 };
                }

                // Very High
                return { r: 8, g: 48, b: 107 };
            }

            function getHeatLevel(value, maxValue) {
                if (maxValue === 0 || value === 0) {
                    return "Low";
                }

                var t = value / maxValue;

                if (t <= 0.25) {
                    return "Low";
                }

                if (t <= 0.5) {
                    return "Medium";
                }

                if (t <= 0.75) {
                    return "High";
                }

                return "Very High";
            }

            function getHeatRange(value, maxValue) {
                if (maxValue === 0) {
                    return "0";
                }

                var lowMax = Math.floor(maxValue * 0.25);
                var medMin = lowMax + 1;
                var medMax = Math.floor(maxValue * 0.5);
                var highMin = medMax + 1;
                var highMax = Math.floor(maxValue * 0.75);
                var veryHighMin = highMax + 1;

                var t = value / maxValue;

                if (t <= 0.25) {
                    return "0 - " + lowMax;
                }

                if (t <= 0.5) {
                    return medMin + " - " + medMax;
                }

                if (t <= 0.75) {
                    return highMin + " - " + highMax;
                }

                return veryHighMin + " - " + maxValue;
            }
        }
    };
})();