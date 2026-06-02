// viz_radar.js
// Breed radar chart — photo left, radar right, cleaner two-column layout

(function () {
    window.VizRadar = {
        draw: function (p, manager, ai, progress) {
            var data = manager.radarData || [];

            p.push();

            if (!data || data.length === 0) {
                p.noStroke();
                p.fill(80);
                p.textAlign(p.CENTER, p.CENTER);
                p.textSize(18);
                p.text("Loading breed radar data...", p.width / 2, p.height / 2);
                p.pop();
                return;
            }

            // ---------- Layout ----------
            var left = manager.offsetX || 40;

            // Top text block
            var titleY = 18;
            var subtitleY = 48;
            var introY = 72;

            // Breed information
            var breedInfoY = 125;

            // Main content area
            var contentTop = 245;

            // Left photo card
            var photoX = left + 20;
            var photoY = contentTop + 50;
            var photoW = 380;
            var photoH = 280;

            // Right radar area
            var radarRadius = 125;
            var radarX = photoX + photoW + 150;
            var radarY = contentTop + radarRadius - 20;

            // Dropdown area
            var dropdownW = 280;
            var dropdownX = radarX - dropdownW / 2;
            var dropdownY = 180;

            // ---------- Dropdown ----------
            if (!manager.radarSelect) {
                var sel = p.createSelect();

                for (var i = 0; i < data.length; i++) {
                    sel.option(data[i].shelterBreed, i);
                }

                sel.selected("0");
                sel.parent("vis");

                sel.style("font-size", "14px");
                sel.style("padding", "6px 12px");
                sel.style("border-radius", "8px");
                sel.style("border", "1px solid #ccc");
                sel.style("background", "white");
                sel.style("z-index", "20");
                sel.style("width", dropdownW + "px");

                manager.radarSelect = sel;
            }

            manager.radarSelect.show();
            manager.radarSelect.position(dropdownX, dropdownY);

            var idx = Number(manager.radarSelect.value());
            if (isNaN(idx) || idx < 0 || idx >= data.length) {
                idx = 0;
            }

            var d = data[idx];

            var traits = [
                { key: "grooming", label: "Grooming", detailKey: "groomingLabel" },
                { key: "shedding", label: "Shedding", detailKey: "sheddingLabel" },
                { key: "energy", label: "Energy", detailKey: "energyLabel" },
                { key: "trainability", label: "Trainability", detailKey: "trainabilityLabel" },
                { key: "demeanor", label: "Demeanor", detailKey: "demeanorLabel" }
            ];

            // ---------- Header ----------
            p.noStroke();
            p.fill(30);
            p.textAlign(p.LEFT, p.TOP);
            p.textSize(22);
            p.text("Breed Personality and Care Profile", left, titleY);

            p.fill(110);
            p.textSize(13);
            p.text("AKC trait scores for common shelter dog breeds", left, subtitleY);

            p.fill(80);
            p.textSize(13);
            p.text("Explore care needs and personality-related traits before choosing a dog.", left, introY);

            // ---------- Dropdown label ----------
            p.fill(80);
            p.textAlign(p.CENTER, p.CENTER);
            p.textSize(12);
            p.text("Select a breed:", radarX - 190, dropdownY - 75);

            // ---------- Breed info ----------
            p.fill(30);
            p.textAlign(p.LEFT, p.TOP);
            p.textSize(22);
            p.text(d.shelterBreed, left, breedInfoY);

            p.fill(100);
            p.textSize(12);
            p.text("AKC match: " + d.akcBreed, left, breedInfoY + 34);
            p.text("Shelter intake count: " + d.intakeCount.toLocaleString(), left, breedInfoY + 56);

            var temperamentText = "Temperament: " + d.temperament;
            drawWrappedText(p, temperamentText, left, breedInfoY + 78, 430, 16);

            // ---------- Breed photo ----------
            var photoURL = findBreedPhotoURL(manager, d);

            if (!manager.breedPhotoEl) {
                manager.breedPhotoEl = p.createImg("", "breed photo");
                manager.breedPhotoEl.parent("vis");

                manager.breedPhotoEl.style("position", "absolute");
                manager.breedPhotoEl.style("object-fit", "contain");
                manager.breedPhotoEl.style("object-position", "center center");
                manager.breedPhotoEl.style("box-sizing", "border-box");
                manager.breedPhotoEl.style("background", "#ffffff");
                manager.breedPhotoEl.style("border-radius", "12px");
                manager.breedPhotoEl.style("border", "1px solid #dddddd");
                manager.breedPhotoEl.style("box-shadow", "0 2px 8px rgba(0,0,0,0.10)");
                manager.breedPhotoEl.style("padding", "10px");
                manager.breedPhotoEl.style("z-index", "10");
            }

            if (photoURL && photoURL !== "") {
                if (manager.currentBreedPhotoURL !== photoURL) {
                    manager.currentBreedPhotoURL = photoURL;
                    manager.breedPhotoEl.attribute("src", photoURL);
                }

                manager.breedPhotoEl.position(photoX, photoY);
                manager.breedPhotoEl.size(photoW, photoH);
                manager.breedPhotoEl.show();
            } else {
                manager.breedPhotoEl.hide();

                p.push();
                p.fill(245);
                p.stroke(220);
                p.rect(photoX, photoY, photoW, photoH, 12);

                p.noStroke();
                p.fill(130);
                p.textAlign(p.CENTER, p.CENTER);
                p.textSize(13);
                p.text("No photo available", photoX + photoW / 2, photoY + photoH / 2);
                p.pop();
            }

            // ---------- Radar chart ----------
            var pointData = [];

            p.push();
            p.translate(radarX, radarY);

            // Grid rings
            for (var lv = 1; lv <= 5; lv++) {
                var r = radarRadius * (lv / 5);

                p.noFill();
                p.stroke(225);
                p.strokeWeight(1);

                p.beginShape();
                for (var a0 = 0; a0 < traits.length; a0++) {
                    var angle0 = -p.HALF_PI + a0 * p.TWO_PI / traits.length;
                    p.vertex(Math.cos(angle0) * r, Math.sin(angle0) * r);
                }
                p.endShape(p.CLOSE);
            }

            // Axes and labels
            for (var a = 0; a < traits.length; a++) {
                var angle = -p.HALF_PI + a * p.TWO_PI / traits.length;

                p.stroke(210);
                p.line(
                    0,
                    0,
                    Math.cos(angle) * radarRadius,
                    Math.sin(angle) * radarRadius
                );

                p.noStroke();
                p.fill(70);
                p.textSize(12);
                p.textAlign(p.CENTER, p.CENTER);

                p.text(
                    traits[a].label,
                    Math.cos(angle) * (radarRadius + 34),
                    Math.sin(angle) * (radarRadius + 34)
                );
            }

            // Radar polygon
            p.fill(80, 140, 220, 80);
            p.stroke(70, 130, 220);
            p.strokeWeight(3);

            p.beginShape();
            for (var t = 0; t < traits.length; t++) {
                var value = d[traits[t].key];
                var rr = radarRadius * value;
                var angle2 = -p.HALF_PI + t * p.TWO_PI / traits.length;

                p.vertex(Math.cos(angle2) * rr, Math.sin(angle2) * rr);
            }
            p.endShape(p.CLOSE);

            // Radar dots
            for (var q = 0; q < traits.length; q++) {
                var val = d[traits[q].key];
                var rr2 = radarRadius * val;
                var angle3 = -p.HALF_PI + q * p.TWO_PI / traits.length;

                var px = Math.cos(angle3) * rr2;
                var py = Math.sin(angle3) * rr2;

                pointData.push({
                    x: radarX + px,
                    y: radarY + py,
                    trait: traits[q].label,
                    value: val,
                    detail: d[traits[q].detailKey]
                });

                p.fill(255);
                p.stroke(70, 130, 220);
                p.strokeWeight(2);
                p.circle(px, py, 11);
            }

            p.pop();

            // ---------- Hover tooltip ----------
            var hovered = null;

            for (var j = 0; j < pointData.length; j++) {
                if (p.dist(p.mouseX, p.mouseY, pointData[j].x, pointData[j].y) < 13) {
                    hovered = pointData[j];
                    break;
                }
            }

            if (hovered) {
                drawTooltip(
                    p,
                    hovered.trait,
                    "Score: " + Math.round(hovered.value * 5) + " / 5",
                    hovered.detail,
                    p.mouseX + 14,
                    p.mouseY - 10
                );
            }

            p.pop();

            // ---------- Helpers ----------
            function findBreedPhotoURL(manager, d) {
                if (!manager.breedPhotoMap) {
                    manager.breedPhotoMap = {};
                }
            
                manager.breedPhotoMap["great pyrenees"] = "img/Great Pyrenees.webp";
            
                var manualMap = {
                    "pit bull": "american staffordshire terrier",
                    "german shepherd": "german shepherd dog",
                    "jack russell terrier": "russell terrier",
                    "staffordshire": "american staffordshire terrier"
                };

                var candidates = [];

                if (d.akcBreed) {
                    candidates.push(d.akcBreed.trim().toLowerCase());
                }

                if (d.shelterBreed) {
                    candidates.push(d.shelterBreed.trim().toLowerCase());

                    var shelterKey = d.shelterBreed.trim().toLowerCase();
                    if (manualMap[shelterKey]) {
                        candidates.push(manualMap[shelterKey]);
                    }
                }

                for (var i = 0; i < candidates.length; i++) {
                    var key = candidates[i];

                    if (manager.breedPhotoMap[key]) {
                        return manager.breedPhotoMap[key];
                    }
                }

                return null;
            }

            function drawWrappedText(p, str, x, y, maxWidth, lineHeight) {
                var words = String(str).split(" ");
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

            function drawTooltip(p, title, subtitle, detail, x, y) {
                p.push();

                p.textAlign(p.LEFT, p.TOP);
                p.textSize(12);

                var boxW = Math.max(
                    p.textWidth(title),
                    p.textWidth(subtitle),
                    p.textWidth(detail)
                ) + 24;

                var boxH = 62;

                if (x + boxW > p.width - 20) {
                    x = p.width - boxW - 20;
                }

                if (y + boxH > p.height - 20) {
                    y = p.height - boxH - 20;
                }

                if (y < 20) {
                    y = 20;
                }

                p.noStroke();
                p.fill(255, 250);
                p.rect(x, y, boxW, boxH, 8);

                p.stroke(210);
                p.noFill();
                p.rect(x, y, boxW, boxH, 8);

                p.noStroke();
                p.fill(30);
                p.text(title, x + 12, y + 10);

                p.fill(90);
                p.text(subtitle, x + 12, y + 27);

                p.fill(70, 130, 220);
                p.text(detail, x + 12, y + 44);

                p.pop();
            }
        }
    };
})();