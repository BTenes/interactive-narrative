// viz_heatmap.js
// Dog adoptions heatmap by month and day

(function () {
    window.VizHeatmap = {
        draw: function (p, manager, ai, progress) {
            var data = manager.heatmapData || [];

            p.push();

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
            var chartW = (manager.width || 600) * 0.82;
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
            p.text("Darker cells show days with more dog adoptions across all years.", left, 72);

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

                    var fillColor = getHeatColor(p, count, maxCount);

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
                        p.stroke(40);
                        p.strokeWeight(2);
                        p.rect(x2, y2, cellW - 1, cellH - 1);
                    }
                }
            }

            // color legend
            var legendX = left + chartW + 35;
            var legendY = top + 15;
            var legendH = 220;
            var steps = 50;

            for (var s = 0; s < steps; s++) {
                var t = s / (steps - 1);
                var value = maxCount * (1 - t);
                var color = getHeatColor(p, value, maxCount);

                p.noStroke();
                p.fill(color.r, color.g, color.b);
                p.rect(legendX, legendY + s * (legendH / steps), 18, legendH / steps + 1);
            }

            p.noFill();
            p.stroke(180);
            p.rect(legendX, legendY, 18, legendH);

            p.noStroke();
            p.fill(80);
            p.textAlign(p.LEFT, p.CENTER);
            p.textSize(12);
            p.text(maxCount, legendX + 28, legendY + 5);
            p.text("0", legendX + 28, legendY + legendH - 5);

            p.push();
            p.translate(legendX + 55, legendY + legendH / 2);
            p.rotate(-p.HALF_PI);
            p.textAlign(p.CENTER, p.CENTER);
            p.text("Number of Adoptions", 0, 0);
            p.pop();

            // callout text
            p.noStroke();
            p.fill(60);
            p.textAlign(p.LEFT, p.CENTER);
            p.textSize(14);
            p.text(
                "This heatmap helps reveal seasonal patterns in adoption activity. Lower-activity periods may be times when shelters need more community attention and support.",
                left,
                top + chartH + 62
            );

            // tooltip
            if (hovered) {
                var tooltipW = 180;
                var tooltipH = 80;
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

            function getHeatColor(p, value, maxValue) {
                if (maxValue === 0) {
                    return { r: 240, g: 245, b: 255 };
                }

                var t = value / maxValue;

                // light blue to dark blue
                var r = p.lerp(235, 36, t);
                var g = p.lerp(242, 99, t);
                var b = p.lerp(250, 171, t);

                return { r: r, g: g, b: b };
            }
        }
    };
})();