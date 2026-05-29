// viz_breed.js
// Dog breed intake vs adoption grouped bar chart

(function () {
    window.VizBreed = {
        draw: function (p, manager, ai, progress) {
            var data = manager.breedData || [];

            p.push();

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
            var left = 260;
            var top = 105;
            var chartW = (manager.width || 600) * 0.58;
            var chartH = (manager.height || 520) - 180;

            var maxValue = 0;
            for (var i = 0; i < data.length; i++) {
                maxValue = Math.max(maxValue, data[i].intake, data[i].adoption);
            }

            maxValue = Math.ceil(maxValue / 1000) * 1000;

            var rowH = chartH / data.length;
            var barH = rowH * 0.28;

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
            drawWrappedText(
                p,
                "Some breeds enter shelters more often than others. Comparing intake and adoption helps show which breeds may need more visibility.",
                left,
                76,
                chartW + 220,
                18
            );

            // grid and x labels
            var gridCount = 5;

            for (var g = 0; g <= gridCount; g++) {
                var value = (maxValue / gridCount) * g;
                var x = left + p.map(value, 0, maxValue, 0, chartW);

                p.stroke(230);
                p.strokeWeight(1);
                p.line(x, top, x, top + chartH);

                p.noStroke();
                p.fill(120);
                p.textAlign(p.CENTER, p.TOP);
                p.textSize(11);
                p.text(Math.round(value), x, top + chartH + 8);
            }

            // bars
            var hovered = null;

            for (var r = 0; r < data.length; r++) {
                var item = data[r];

                var y = top + r * rowH + rowH / 2;
                var intakeW = p.map(item.intake, 0, maxValue, 0, chartW);
                var adoptionW = p.map(item.adoption, 0, maxValue, 0, chartW);

                // breed label
                p.noStroke();
                p.fill(45);
                p.textAlign(p.RIGHT, p.CENTER);
                p.textSize(12);
                p.text(item.breed, left - 16, y);

                // intake bar
                p.fill(70, 130, 220, 210);
                p.rect(left, y - barH - 3, intakeW, barH, 4);

                // adoption bar
                p.fill(80, 165, 120, 210);
                p.rect(left, y + 3, adoptionW, barH, 4);

                // hover area
                if (
                    p.mouseX >= left - 225 &&
                    p.mouseX <= left + chartW &&
                    p.mouseY >= y - rowH / 2 &&
                    p.mouseY <= y + rowH / 2
                ) {
                    hovered = {
                        item: item,
                        y: y
                    };

                    p.noFill();
                    p.stroke(80);
                    p.strokeWeight(1.5);
                    p.rect(left - 225, y - rowH / 2 + 2, chartW + 230, rowH - 4, 6);
                }
            }

            // axis
            p.stroke(170);
            p.strokeWeight(1);
            p.line(left, top, left, top + chartH);
            p.line(left, top + chartH, left + chartW, top + chartH);

            // x-axis label
            p.noStroke();
            p.fill(90);
            p.textAlign(p.CENTER, p.TOP);
            p.textSize(13);
            p.text("Number of Dogs", left + chartW / 2, top + chartH + 35);

            // legend
            var legendX = left + chartW + 35;
            var legendY = top + 25;

            p.noStroke();

            // intake legend
            p.fill(70, 130, 220, 210);
            p.rect(legendX, legendY, 18, 18, 4);

            p.fill(50);
            p.textAlign(p.LEFT, p.CENTER);
            p.textSize(13);
            p.text("Intake", legendX + 28, legendY + 9);

            // adoption legend
            p.fill(80, 165, 120, 210);
            p.rect(legendX, legendY + 34, 18, 18, 4);

            p.fill(50);
            p.text("Adoption", legendX + 28, legendY + 43);

            // tooltip
            if (hovered) {
                var d = hovered.item;

                var boxW = 230;
                var boxH = 125;
                var tx = p.mouseX + 16;
                var ty = p.mouseY - 20;

                if (tx + boxW > p.width - 10) {
                    tx = p.mouseX - boxW - 16;
                }

                if (ty + boxH > p.height - 10) {
                    ty = p.mouseY - boxH - 16;
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
                p.textSize(15);
                p.text(d.breed, tx + 14, ty + 12);

                p.fill(70, 130, 220);
                p.textSize(13);
                p.text("Intake: " + d.intake.toLocaleString(), tx + 14, ty + 42);

                p.fill(80, 165, 120);
                p.text("Adoption: " + d.adoption.toLocaleString(), tx + 14, ty + 64);

                p.fill(70);
                p.text("Gap: " + d.gap.toLocaleString(), tx + 14, ty + 86);
                p.text("Adoption rate: " + Math.round(d.adoptionRate * 100) + "%", tx + 14, ty + 108);
            }

            p.pop();


            function drawWrappedText(p, str, x, y, maxWidth, lineHeight) {
                var words = str.split(" ");
                var line = "";
                var currentY = y;

                for (var i = 0; i < words.length; i++) {
                    var testLine = line + words[i] + " ";
                    var testWidth = p.textWidth(testLine);

                    if (testWidth > maxWidth && i > 0) {
                        p.text(line, x, currentY);
                        line = words[i] + " ";
                        currentY += lineHeight;
                    } else {
                        line = testLine;
                    }
                }

                p.text(line, x, currentY);
            }
        }
    };
})();