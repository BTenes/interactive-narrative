// viz_progress_color.js
// Demonstrates progress-based animation for students.
(function () {
    var YEARS    = [2015,2016,2017,2018,2019,2020,2021,2022,2023,2024];
    var ADOPT    = [2.4, 2.6, 2.7, 2.9, 3.1, 3.6, 4.4, 3.9, 4.0, 4.1];
    var PURCHASE = [3.1, 3.0, 2.9, 2.8, 2.8, 3.2, 2.6, 2.5, 2.5, 2.4];

    var COLOR_ADOPT    = [29,  158, 117];
    var COLOR_PURCHASE = [216,  90,  48];

    window.VizProgressColor = {
        draw: function (p, manager, ai, progress) {
            
            var ox = manager.offsetX || 0;
            var oy = manager.offsetY || 0;
            var W     = manager.width   || 600;
            var H     = manager.height  || 520;

            var padL = 40, padR = 16, padT = 40, padB = 50;
            var chartW = W - padL - padR;
            var chartH = H - padT - padB;

            var n      = YEARS.length;
            var groupW = chartW / n;
            var maxVal = 5.5;

            function toX(i)   { return ox + padL + i * groupW + groupW / 2; }
            function toY(val) { return oy + padT + chartH - (val / maxVal) * chartH; }

            // gridlines + y labels
            p.textAlign(p.RIGHT, p.CENTER);
            p.textSize(11);
            [0, 1, 2, 3, 4, 5].forEach(function (v) {
                var y = toY(v);
                p.stroke(180); p.strokeWeight(0.5);
                p.line(ox + padL, y, ox + padL + chartW, y);
                p.noStroke();
                p.fill(120);
                p.text(v + 'M', ox + padL - 6, y);
            });

            // x labels
            p.textAlign(p.CENTER, p.TOP);
            p.textSize(11);
            p.noStroke();
            YEARS.forEach(function (yr, i) {
                p.fill(120);
                p.text(yr, toX(i), oy + padT + chartH + 8);
            });

            // progress phases:
            // 0.0 → 0.1  axes visible
            // 0.1 → 0.7  bars grow left to right
            var barW        = groupW * 0.35;
            var barProgress = p.constrain((progress - 0.1) / 0.6, 0, 1);

            YEARS.forEach(function (yr, i) {
                var colStart    = i / n;
                var colEnd      = (i + 1) / n;
                var colProgress = p.constrain(
                    (barProgress - colStart) / (colEnd - colStart), 0, 1
                );

                var cx = toX(i);
                var aH = (ADOPT[i]    / maxVal) * chartH * colProgress;
                var pH = (PURCHASE[i] / maxVal) * chartH * colProgress;

                p.noStroke();
                p.fill(COLOR_ADOPT[0], COLOR_ADOPT[1], COLOR_ADOPT[2], 210);
                p.rect(cx - barW - 2, oy + padT + chartH - aH, barW, aH, 2);

                p.fill(COLOR_PURCHASE[0], COLOR_PURCHASE[1], COLOR_PURCHASE[2], 210);
                p.rect(cx + 2, oy + padT + chartH - pH, barW, pH, 2);
            });

            // trend lines 
            var lineProgress = p.constrain((progress - 0.1) / 0.6, 0, 1);
            var visibleCount = Math.floor(lineProgress * n);

            // adoption trend line
            p.noFill();
            p.stroke(COLOR_ADOPT[0], COLOR_ADOPT[1], COLOR_ADOPT[2], 200);
            p.strokeWeight(2.5);
            p.beginShape();
            for (var i = 0; i <= visibleCount && i < n; i++) {
                p.curveVertex(toX(i), toY(ADOPT[i]));
            }
            p.endShape();

            //purchase trend line
            p.stroke(COLOR_PURCHASE[0], COLOR_PURCHASE[1], COLOR_PURCHASE[2], 200);
            p.strokeWeight(2.5);
            p.beginShape();
            for (var i = 0; i <= visibleCount && i < n; i++) {
                p.curveVertex(toX(i), toY(PURCHASE[i]));
            }
            p.endShape();

            p.noStroke();

            // crossover annotation at 2019 (index 4)
            // 0.7 → 1.0  annotation fades in
            var annoAlpha = p.constrain((progress - 0.7) / 0.2, 0, 1);

            if (annoAlpha > 0) {
                var cx2019 = toX(4);
                p.stroke(80);
                p.strokeWeight(1);
                p.drawingContext.setLineDash([4, 4]);
                p.line(cx2019, oy + padT, cx2019, oy + padT + chartH);
                p.drawingContext.setLineDash([]);
                p.noStroke();
                p.fill(60, 60, 60, annoAlpha * 220);
                p.textAlign(p.CENTER, p.BOTTOM);
                p.textSize(12);
                p.text('Adoptions overtook purchases', cx2019, toY(4.8));
                p.text('in 2019', cx2019, toY(4.8) + 16);
            }

            // legend
            p.noStroke();
            p.textAlign(p.LEFT, p.CENTER);
            p.textSize(12);
            p.fill(COLOR_ADOPT[0], COLOR_ADOPT[1], COLOR_ADOPT[2]);
            p.rect(ox + padL, oy + 12, 12, 12, 2);
            p.fill(80);
            p.text('Adopted', ox + padL + 18, oy + 18);
            p.fill(COLOR_PURCHASE[0], COLOR_PURCHASE[1], COLOR_PURCHASE[2]);
            p.rect(ox + padL + 90, oy + 12, 12, 12, 2);
            p.fill(80);
            p.text('Purchased', ox + padL + 108, oy + 18);
        }
    };

})();
            

   
            