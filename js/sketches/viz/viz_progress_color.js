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
        }
    };

})();

   
            