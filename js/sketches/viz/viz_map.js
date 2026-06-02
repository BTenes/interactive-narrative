// viz_map.js
// viz_map.js
(function () {

    var geoData = null;
    var csvData = null;
    var dataLoaded = false;

    var fipsToName = {
        "01":"Alabama","02":"Alaska","04":"Arizona","05":"Arkansas",
        "06":"California","08":"Colorado","09":"Connecticut","10":"Delaware",
        "11":"District of Columbia","12":"Florida","13":"Georgia","15":"Hawaii",
        "16":"Idaho","17":"Illinois","18":"Indiana","19":"Iowa","20":"Kansas",
        "21":"Kentucky","22":"Louisiana","23":"Maine","24":"Maryland",
        "25":"Massachusetts","26":"Michigan","27":"Minnesota","28":"Mississippi",
        "29":"Missouri","30":"Montana","31":"Nebraska","32":"Nevada",
        "33":"New Hampshire","34":"New Jersey","35":"New Mexico","36":"New York",
        "37":"North Carolina","38":"North Dakota","39":"Ohio","40":"Oklahoma",
        "41":"Oregon","42":"Pennsylvania","44":"Rhode Island","45":"South Carolina",
        "46":"South Dakota","47":"Tennessee","48":"Texas","49":"Utah","50":"Vermont",
        "51":"Virginia","53":"Washington","54":"West Virginia","55":"Wisconsin",
        "56":"Wyoming"
    };

    function loadData() {
        if (dataLoaded) return;
        dataLoaded = true;

        Promise.all([
            fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json').then(r => r.json()),
            fetch('data/shelter_animals_state_data.csv').then(r => r.text())
        ]).then(function (results) {
            // parse topojson → geojson
            var us = results[0];
            var features = topojson.feature(us, us.objects.states).features;
            geoData = features;

            // parse CSV
            var lines = results[1].trim().split('\n');
            var headers = lines[0].split(',').map(h => h.trim());
            var stateIdx   = headers.indexOf('State');
            var rescueIdx  = headers.indexOf('Rescues');
            var shelterIdx = headers.indexOf('Shelters');
            var intakeIdx  = headers.indexOf('Avg_Community_Intakes_Dogs');
            csvData = {};
            for (var i = 1; i < lines.length; i++) {
                var cols = lines[i].split(',');
                if (!cols[stateIdx]) continue;
                csvData[cols[stateIdx].trim()] = {
                    rescues:  +cols[rescueIdx],
                    shelters: +cols[shelterIdx],
                    intakes:  +cols[intakeIdx]
                };
            }
        }).catch(function (err) {
            console.error('VizMap load error:', err);
        });
    }

    window.VizMap = {

        draw: function (p, manager, ai, progress) {

            loadData();

            var ox = manager.offsetX || 0;
            var oy = manager.offsetY || 0;
            var W  = manager.width   || 600;
            var H  = manager.height  || 520;

            // loading state
            if (!geoData || !csvData) {
                p.fill(160);
                p.noStroke();
                p.textAlign(p.CENTER, p.CENTER);
                p.textSize(14);
                p.text('Loading map...', ox + W / 2, oy + H / 2);
                return;
            }

            // map title
            p.noStroke();
            p.fill(40);
            p.textAlign(p.LEFT, p.TOP);
            p.textSize(22);
            p.text('Where are the Stray Dogs?', ox, oy + 8);

            // find max for color scale
            var maxVal = 0;
            Object.values(csvData).forEach(function (d) {
                if (d.intakes > maxVal) maxVal = d.intakes;
            });

            // AlbersUSA-like projection parameters (approximate)
            var scale  = W * 1.25;
            var transX = ox + W * 0.43;
            var transY = oy + H * 0.54;

            function project(lon, lat) {
                // simple Albers USA approximation
                var lam = lon * Math.PI / 180;
                var phi = lat * Math.PI / 180;
                var lam0 = -96 * Math.PI / 180;
                var phi0 =  38 * Math.PI / 180;
                var phi1 =  29.5 * Math.PI / 180;
                var phi2 =  45.5 * Math.PI / 180;
                var n  = (Math.sin(phi1) + Math.sin(phi2)) / 2;
                var c  = Math.cos(phi1) * Math.cos(phi1) + 2 * n * Math.sin(phi1);
                var r0 = Math.sqrt(c - 2 * n * Math.sin(phi0)) / n;
                var r  = Math.sqrt(c - 2 * n * Math.sin(phi))  / n;
                var th = n * (lam - lam0);
                var x  = r * Math.sin(th);
                var y  = -(r0 - r * Math.cos(th));
                return [transX + x * scale, transY + y * scale];
            }

            // tooltip state tracking
            var mx = p.mouseX;
            var my = p.mouseY;
            var hoveredName = null;

            // draw each state
            function projectCoord(lon, lat, fips) {
                // Hawaii: shift right and up into view
                if (fips === '15') {
                    return project(lon + 57, lat + 5);
                }
                return project(lon, lat);
            }

            // hover tooltip using p5 text
            geoData.forEach(function (feature) {
                var fips = String(feature.id).padStart(2, '0');
                var name = fipsToName[fips];
                if (!name) return;
                var info = csvData[name];
                if (!info) return;

                // Alaska uses fixed coords, check separately
                if (fips === '02') {
                    var akGeom2  = feature.geometry;
                    var akPolys2 = akGeom2.type === 'Polygon' ? [akGeom2.coordinates] : akGeom2.coordinates;
                    akPolys2.forEach(function(poly) {
                        var ring = poly[0];
                        var inside = false;
                        for (var i = 0, j = ring.length - 1; i < ring.length; j = i++) {
                            var lon1 = ring[i][0], lat1 = ring[i][1];
                            var lon2 = ring[j][0], lat2 = ring[j][1];
                            var nx1 = (lon1 - (-180)) / ((-130) - (-180));
                            var ny1 = (lat1 - 50) / (72 - 50);
                            var nx2 = (lon2 - (-180)) / ((-130) - (-180));
                            var ny2 = (lat2 - 50) / (72 - 50);
                            var ax1 = ox + W * 0.01 + nx1 * W * 0.18;
                            var ay1 = oy + H * 0.95 - ny1 * H * 0.22;
                            var ax2 = ox + W * 0.01 + nx2 * W * 0.18;
                            var ay2 = oy + H * 0.95 - ny2 * H * 0.22;
                            if (((ay1 > my) !== (ay2 > my)) &&
                                (mx < (ax2 - ax1) * (my - ay1) / (ay2 - ay1) + ax1)) {
                                inside = !inside;
                            }
                        }
                        if (inside) hoveredName = 'Alaska';
                    });
                    return;
                }

                var geom = feature.geometry;
                var polys = geom.type === 'Polygon'
                    ? [geom.coordinates]
                    : geom.coordinates;

                polys.forEach(function (poly) {
                    var ring = poly[0];
                    // point-in-polygon check
                    var inside = false;
                    for (var i = 0, j = ring.length - 1; i < ring.length; j = i++) {
                        var pi = projectCoord(ring[i][0], ring[i][1], fips);
                        var pj = projectCoord(ring[j][0], ring[j][1], fips);
                        if (((pi[1] > my) !== (pj[1] > my)) &&
                            (mx < (pj[0] - pi[0]) * (my - pi[1]) / (pj[1] - pi[1]) + pi[0])) {
                            inside = !inside;
                        }
                    }
                    if (inside) hoveredName = name;
                });
            });

            geoData.forEach(function (feature) {
                var fips = String(feature.id).padStart(2, '0');
                if (fips === '02') return; // Alaska drawn separately
                if (fips === '15') return; // Hawaii drawn separately
                var name = fipsToName[fips];
                var info = name && csvData[name];
                var rescues = info ? info.intakes : 0;

                // color: light green → dark green
                var t  = rescues / maxVal;
                var r  = Math.round(p.lerp(200, 27,  t));
                var g  = Math.round(p.lerp(230, 94,  t));
                var bv = Math.round(p.lerp(201, 32,  t));

                // check hover
                var geom = feature.geometry;
                var polys = geom.type === 'Polygon'
                    ? [geom.coordinates]
                    : geom.coordinates;

                var isHovered = (name === hoveredName);
                p.stroke(isHovered ? p.color(40, 40, 40) : 255);
                p.strokeWeight(isHovered ? 2.5 : 0.8);
                p.fill(isHovered ? p.color(r, g, bv, 255) : p.color(r, g, bv, 210));

                polys.forEach(function (poly) {
                    poly.forEach(function (ring) {
                        p.beginShape();
                        ring.forEach(function (coord) {
                            var pt = projectCoord(coord[0], coord[1], fips);
                            p.vertex(pt[0], pt[1]);
                        });
                        p.endShape(p.CLOSE);
                    });
                });
            });

            // draw Alaska separately in bottom-left
            var akFeature = geoData.find(function(f) {
                return String(f.id).padStart(2,'0') === '02';
            });
            if (akFeature && csvData['Alaska']) {
                var akInfo = csvData['Alaska'];
                var t3 = akInfo.intakes / maxVal;
                var ar = Math.round(p.lerp(200, 27,  t3));
                var ag = Math.round(p.lerp(230, 94,  t3));
                var ab = Math.round(p.lerp(201, 32,  t3));

                var akHovered = (hoveredName === 'Alaska');
                p.fill(ar, ag, ab);
                p.stroke(akHovered ? p.color(40, 40, 40) : 255);
                p.strokeWeight(akHovered ? 2.5 : 0.8);

                var akGeom = akFeature.geometry;
                var akPolys = akGeom.type === 'Polygon'
                    ? [akGeom.coordinates]
                    : akGeom.coordinates;

                akPolys.forEach(function(poly) {
                    poly.forEach(function(ring) {
                        p.beginShape();
                        ring.forEach(function(coord) {
                            var lon = coord[0];
                            var lat = coord[1];
                            var nx = (lon - (-180)) / ((-130) - (-180));
                            var ny = (lat - 50)     / (72 - 50);
                            var ax = ox + W * 0.01 + nx * W * 0.18;
                            var ay = oy + H * 0.95 - ny * H * 0.22;
                            p.vertex(ax, ay);
                        });
                        p.endShape(p.CLOSE);
                    });
                });
            }

            // draw Hawaii separately
            var hiFeature = geoData.find(function(f) {
                return String(f.id).padStart(2,'0') === '15';
            });
            if (hiFeature && csvData['Hawaii']) {
                var hiInfo2 = csvData['Hawaii'];
                var t4 = hiInfo2.intakes / maxVal;
                var hr = Math.round(p.lerp(200, 27, t4));
                var hg = Math.round(p.lerp(230, 94, t4));
                var hb = Math.round(p.lerp(201, 32, t4));
                var hiHovered = (hoveredName === 'Hawaii');
                p.fill(hr, hg, hb);
                p.stroke(hiHovered ? p.color(40,40,40) : 255);
                p.strokeWeight(hiHovered ? 2.5 : 0.8);
                var hiGeom2 = hiFeature.geometry;
                var hiPolys2 = hiGeom2.type === 'Polygon' ? [hiGeom2.coordinates] : hiGeom2.coordinates;
                hiPolys2.forEach(function(poly) {
                    poly.forEach(function(ring) {
                        p.beginShape();
                        ring.forEach(function(coord) {
                            var pt = projectCoord(coord[0], coord[1], '15');
                            p.vertex(pt[0], pt[1]);
                        });
                        p.endShape(p.CLOSE);
                    });
                });
            }

            // draw tooltip
            if (hoveredName && csvData[hoveredName]) {
                var info = csvData[hoveredName];
                var tx = mx + 12;
                var ty = my - 10;
                var tw = 160, th = 66;
                p.noStroke();
                p.fill(255);
                p.rect(tx, ty, tw, th, 4);
                p.stroke(220); p.strokeWeight(0.5);
                p.rect(tx, ty, tw, th, 4);
                p.noStroke();
                p.fill(40);
                p.textAlign(p.LEFT, p.TOP);
                p.textSize(12);
                p.text(hoveredName, tx + 8, ty + 8);
                p.textSize(11);
                p.fill(100);
                p.text('Rescues: '  + info.rescues,  tx + 8, ty + 24);
                p.text('Shelters: ' + info.shelters, tx + 8, ty + 38);
                p.text('Stray Dogs: ' + info.intakes,  tx + 8, ty + 52);
            }

            // legend
            p.noStroke();
            p.textAlign(p.LEFT, p.TOP);
            p.textSize(11);
            p.fill(80);
            p.text('Stray dogs per state', ox + W - 160, oy + H - 48);
            for (var i = 0; i <= 100; i++) {
                var t2 = i / 100;
                var lr = Math.round(p.lerp(200, 27,  t2));
                var lg = Math.round(p.lerp(230, 94,  t2));
                var lb = Math.round(p.lerp(201, 32,  t2));
                p.fill(lr, lg, lb);
                p.rect(ox + W - 160 + i * 1.4, oy + H - 32, 1.4, 10);
            }
            p.fill(120);
            p.textSize(10);
            p.text('Fewer', ox + W - 160, oy + H - 18);
            p.textAlign(p.RIGHT, p.TOP);
            p.text('More', ox + W, oy + H - 18);

             // top 5 states by stray dogs
            var stateList = Object.keys(csvData).map(function(name) {
                return { name: name, intakes: csvData[name].intakes };
            });
            stateList.sort(function(a, b) { return b.intakes - a.intakes; });
            var top5 = stateList.slice(0, 5);

            var listX = ox + W - 160;
            var listY = oy + H - 160;

            p.noStroke();
            p.fill(60);
            p.textAlign(p.LEFT, p.TOP);
            p.textSize(12);
            p.text('Top 5 Stray Dog States', listX, listY);

            p.textSize(11);
            top5.forEach(function(s, i) {
                p.fill(80);
                p.text((i + 1) + '. ' + s.name, listX, listY + 18 + i * 16);
                p.fill(130);
                p.textAlign(p.RIGHT, p.TOP);
                p.text(s.intakes, ox + W, listY + 18 + i * 16);
                p.textAlign(p.LEFT, p.TOP);
            });

            // abbreviations for top 5 states on map
            var abbrMap = {
                'Alabama':'AL','Alaska':'AK','Arizona':'AZ','Arkansas':'AR',
                'California':'CA','Colorado':'CO','Connecticut':'CT','Delaware':'DE',
                'District of Columbia':'DC','Florida':'FL','Georgia':'GA','Hawaii':'HI',
                'Idaho':'ID','Illinois':'IL','Indiana':'IN','Iowa':'IA','Kansas':'KS',
                'Kentucky':'KY','Louisiana':'LA','Maine':'ME','Maryland':'MD',
                'Massachusetts':'MA','Michigan':'MI','Minnesota':'MN','Mississippi':'MS',
                'Missouri':'MO','Montana':'MT','Nebraska':'NE','Nevada':'NV',
                'New Hampshire':'NH','New Jersey':'NJ','New Mexico':'NM','New York':'NY',
                'North Carolina':'NC','North Dakota':'ND','Ohio':'OH','Oklahoma':'OK',
                'Oregon':'OR','Pennsylvania':'PA','Rhode Island':'RI','South Carolina':'SC',
                'South Dakota':'SD','Tennessee':'TN','Texas':'TX','Utah':'UT',
                'Vermont':'VT','Virginia':'VA','Washington':'WA','West Virginia':'WV',
                'Wisconsin':'WI','Wyoming':'WY'
            };

            var stateCenters = {
                'District of Columbia': [-77.03, 38.90],
                'New Mexico':           [-106.0, 34.5],
                'Hawaii':               [-156.5, 20.5],
                'Alabama':              [-86.8,  32.8],
                'Kansas':               [-98.4,  38.5]
            };

            top5.forEach(function(s) {
                var abbr = abbrMap[s.name];
                var center = stateCenters[s.name];
                if (!abbr || !center) return;
                var fips = Object.keys(fipsToName).find(function(k) {
                    return fipsToName[k] === s.name;
                });
                var pt = projectCoord(center[0], center[1], fips || '00');
                p.noStroke();
                p.fill(255);
                p.textAlign(p.CENTER, p.CENTER);
                p.textSize(11);
                p.text(abbr, pt[0], pt[1]);
            });

            // DC annotation with leader line
            var dcInfo = csvData['District of Columbia'];
            if (dcInfo) {
                var dcCoord = projectCoord(-77.0369, 38.9072, '11');
                var dcLabelX = ox + W - 160;
                var dcLabelY = oy + H * 0.25;

                // leader line
                p.stroke(120);
                p.strokeWeight(0.8);
                p.line(dcCoord[0], dcCoord[1], dcLabelX, dcLabelY + 8);

                // dot on DC
                p.noStroke();
                p.fill(80);
                p.ellipse(dcCoord[0], dcCoord[1], 5, 5);

                // label
                p.fill(60);
                p.textAlign(p.LEFT, p.TOP);
                p.textSize(11);
                p.text('D.C.', dcLabelX, dcLabelY);
                p.fill(120);
                p.textSize(10);
                p.text('Stray Dogs: ' + dcInfo.intakes, dcLabelX, dcLabelY + 14);
            }

             // Hawaii label directly on island
            var hiInfo = csvData['Hawaii'];
            if (hiInfo) {
                var hiCoord = projectCoord(-155.5, 19.6, '15');
                p.noStroke();
                p.fill(255);
                p.textAlign(p.CENTER, p.CENTER);
                p.textSize(10);
                p.text('HI', hiCoord[0], hiCoord[1]);
            }

            // Austin marker on Texas
            var austinCoord = projectCoord(-97.7431, 30.2672, '48');
            
            // pulsing circle animation
            var pulse = Math.sin(p.millis() / 400) * 0.5 + 0.5;
            var pulseR = 10 + pulse * 8;
            
            p.noFill();
            p.stroke(180, 50, 50, 150 * (1 - pulse));
            p.strokeWeight(1.5);
            p.ellipse(austinCoord[0], austinCoord[1], pulseR * 2, pulseR * 2);

            p.fill(200, 50, 50);
            p.noStroke();
            p.ellipse(austinCoord[0], austinCoord[1], 8, 8);
            p.fill(255);
            p.ellipse(austinCoord[0], austinCoord[1], 3, 3);

            // Austin label
            p.noStroke();
            p.fill(160, 40, 40);
            p.textAlign(p.LEFT, p.TOP);
            p.textSize(11);
            p.text('Austin', austinCoord[0] + 8, austinCoord[1] - 6);
            p.fill(180, 60, 60);
            p.textSize(10);
            p.text('our focus', austinCoord[0] + 8, austinCoord[1] + 6);
        }
    };

})();