// sketch_renderer.js

(function () {
    window.Renderer = {

        setData: function (manager) {
            manager.offsetX = (manager.margin && manager.margin.left) || 20;
            manager.offsetY = (manager.margin && manager.margin.top) || 0;

            manager.dogData = [];
            manager.outcomeData = [];
            manager.heatmapData = [];
            manager.breedData = [];
            manager.radarData = [];
            manager.breedPhotoMap = {};

            // 1. Load intake vs adoption timeline data
            var loadTimelineData = fetch("data/yearly_dog_intake_adoption_fixed.csv")
                .then(function (response) {
                    if (!response.ok) {
                        throw new Error("Cannot find data/yearly_dog_intake_adoption_fixed.csv");
                    }
                    return response.text();
                })
                .then(function (csvText) {
                    var rows = parseCSV(csvText);
                    var header = cleanHeader(rows[0]);

                    var yearIndex = header.indexOf("Year");
                    var intakeIndex = header.indexOf("Intakes");
                    var adoptionIndex = header.indexOf("Adoptions");
                    var gapIndex = header.indexOf("Gap");

                    var parsedData = [];

                    for (var i = 1; i < rows.length; i++) {
                        var row = rows[i];

                        var year = Number(row[yearIndex]);
                        var intake = Number(row[intakeIndex]);
                        var adoption = Number(row[adoptionIndex]);
                        var gap = Number(row[gapIndex]);

                        if (year >= 2014 && year <= 2024) {
                            parsedData.push({
                                year: year,
                                intake: intake,
                                adoption: adoption,
                                gap: gap
                            });
                        }
                    }

                    manager.dogData = parsedData;
                    console.log("Loaded timeline data:", manager.dogData);
                    return manager.dogData;
                })
                .catch(function (error) {
                    console.error("Error loading timeline data:", error);
                    manager.dogData = [];
                    return manager.dogData;
                });


            // 2. Load outcome breakdown data
            var loadOutcomeData = fetch("data/dog_outcome_breakdown.csv")
                .then(function (response) {
                    if (!response.ok) {
                        throw new Error("Cannot find data/dog_outcome_breakdown.csv");
                    }
                    return response.text();
                })
                .then(function (csvText) {
                    var rows = parseCSV(csvText);
                    var header = cleanHeader(rows[0]);

                    var outcomeIndex = header.indexOf("Outcome");
                    var countIndex = header.indexOf("Count");

                    var parsedData = [];

                    for (var i = 1; i < rows.length; i++) {
                        var row = rows[i];

                        if (!row || row.length < 2) {
                            continue;
                        }

                        parsedData.push({
                            outcome: row[outcomeIndex],
                            count: Number(row[countIndex])
                        });
                    }

                    manager.outcomeData = parsedData;
                    console.log("Loaded outcome data:", manager.outcomeData);
                    return manager.outcomeData;
                })
                .catch(function (error) {
                    console.error("Error loading outcome data:", error);
                    manager.outcomeData = [];
                    return manager.outcomeData;
                });


            // 3. Load adoption heatmap data
            var loadHeatmapData = fetch("data/dog_adoption_heatmap.csv")
                .then(function (response) {
                    if (!response.ok) {
                        throw new Error("Cannot find data/dog_adoption_heatmap.csv");
                    }
                    return response.text();
                })
                .then(function (csvText) {
                    var rows = parseCSV(csvText);
                    var header = cleanHeader(rows[0]);

                    var monthIndex = header.indexOf("Month");
                    var dayIndex = header.indexOf("Day");
                    var countIndex = header.indexOf("Count");

                    var parsedData = [];

                    for (var i = 1; i < rows.length; i++) {
                        var row = rows[i];

                        if (!row || row.length < 3) {
                            continue;
                        }

                        parsedData.push({
                            month: Number(row[monthIndex]),
                            day: Number(row[dayIndex]),
                            count: Number(row[countIndex])
                        });
                    }

                    manager.heatmapData = parsedData;
                    console.log("Loaded heatmap data:", manager.heatmapData);
                    return manager.heatmapData;
                })
                .catch(function (error) {
                    console.error("Error loading heatmap data:", error);
                    manager.heatmapData = [];
                    return manager.heatmapData;
                });


            // 4. Load breed intake vs adoption data
            var loadBreedData = fetch("data/dog_breed_intake_adoption.csv")
                .then(function (response) {
                    if (!response.ok) {
                        throw new Error("Cannot find data/dog_breed_intake_adoption.csv");
                    }
                    return response.text();
                })
                .then(function (csvText) {
                    var rows = parseCSV(csvText);
                    var header = cleanHeader(rows[0]);

                    var breedIndex = header.indexOf("Breed");
                    var intakeIndex = header.indexOf("Intake");
                    var adoptionIndex = header.indexOf("Adoption");
                    var gapIndex = header.indexOf("Gap");
                    var rateIndex = header.indexOf("AdoptionRate");

                    var parsedData = [];

                    for (var i = 1; i < rows.length; i++) {
                        var row = rows[i];

                        if (!row || row.length < 5) {
                            continue;
                        }

                        parsedData.push({
                            breed: row[breedIndex],
                            intake: Number(row[intakeIndex]),
                            adoption: Number(row[adoptionIndex]),
                            gap: Number(row[gapIndex]),
                            adoptionRate: Number(row[rateIndex])
                        });
                    }

                    manager.breedData = parsedData;
                    console.log("Loaded breed data:", manager.breedData);
                    return manager.breedData;
                })
                .catch(function (error) {
                    console.error("Error loading breed data:", error);
                    manager.breedData = [];
                    return manager.breedData;
                });


            // 5. Load breed radar data
            var loadRadarData = fetch("data/dog_breed_radar_top20.csv")
                .then(function (response) {
                    if (!response.ok) {
                        throw new Error("Cannot find data/dog_breed_radar_top20.csv");
                    }
                    return response.text();
                })
                .then(function (csvText) {
                    var rows = parseCSV(csvText);
                    var header = cleanHeader(rows[0]);

                    var shelterIndex = header.indexOf("ShelterBreed");
                    var akcIndex = header.indexOf("AKCBreed");
                    var intakeIndex = header.indexOf("IntakeCount");

                    var groomingIndex = header.indexOf("Grooming");
                    var sheddingIndex = header.indexOf("Shedding");
                    var energyIndex = header.indexOf("Energy");
                    var trainIndex = header.indexOf("Trainability");
                    var demeanorIndex = header.indexOf("Demeanor");

                    var groomingLabelIndex = header.indexOf("GroomingLabel");
                    var sheddingLabelIndex = header.indexOf("SheddingLabel");
                    var energyLabelIndex = header.indexOf("EnergyLabel");
                    var trainLabelIndex = header.indexOf("TrainabilityLabel");
                    var demeanorLabelIndex = header.indexOf("DemeanorLabel");
                    var tempIndex = header.indexOf("Temperament");

                    var parsedData = [];

                    for (var i = 1; i < rows.length; i++) {
                        var row = rows[i];

                        if (!row || row.length < 14) {
                            continue;
                        }

                        parsedData.push({
                            shelterBreed: row[shelterIndex],
                            akcBreed: row[akcIndex],
                            intakeCount: Number(row[intakeIndex]),

                            grooming: Number(row[groomingIndex]),
                            shedding: Number(row[sheddingIndex]),
                            energy: Number(row[energyIndex]),
                            trainability: Number(row[trainIndex]),
                            demeanor: Number(row[demeanorIndex]),

                            groomingLabel: row[groomingLabelIndex],
                            sheddingLabel: row[sheddingLabelIndex],
                            energyLabel: row[energyLabelIndex],
                            trainabilityLabel: row[trainLabelIndex],
                            demeanorLabel: row[demeanorLabelIndex],
                            temperament: row[tempIndex]
                        });
                    }

                    manager.radarData = parsedData;
                    console.log("Loaded radar data:", manager.radarData);
                    return manager.radarData;
                })
                .catch(function (error) {
                    console.error("Error loading radar data:", error);
                    manager.radarData = [];
                    return manager.radarData;
                });


            // 6. Load breed photo data from GitHub raw JSON
            var loadBreedPhotoData = fetch("https://raw.githubusercontent.com/chrisvogt/dog-breeds/main/dog-breeds.json")
                .then(function (response) {
                    if (!response.ok) {
                        throw new Error("Cannot load dog breed photo JSON");
                    }
                    return response.json();
                })
                .then(function (json) {
                    var photoMap = {};

                    for (var i = 0; i < json.length; i++) {
                        var item = json[i];

                        if (item.name && item.imageURL && item.imageURL.trim() !== "") {
                            photoMap[item.name.trim().toLowerCase()] = item.imageURL.trim();
                        }
                    }

                    manager.breedPhotoMap = photoMap;
                    console.log("Loaded breed photo map:", Object.keys(photoMap).length);
                    return photoMap;
                })
                .catch(function (error) {
                    console.error("Error loading breed photo data:", error);
                    manager.breedPhotoMap = {};
                    return manager.breedPhotoMap;
                });


            return Promise.all([
                loadTimelineData,
                loadOutcomeData,
                loadHeatmapData,
                loadBreedData,
                loadRadarData,
                loadBreedPhotoData
            ]);
        },


        draw: function (p, manager, ai, progress) {

            // Hide radar dropdown and photo when not on radar section
            if (ai !== 6) {
                if (manager.radarSelect) {
                    manager.radarSelect.hide();
                }

                if (manager.breedPhotoEl) {
                    manager.breedPhotoEl.hide();
                }
            }

            // Section 0 and 1: title pages
            if (ai === 0) {
                window.VizTitle.draw(p, manager, ai, progress);
                return;
            }

            // Section 1: map
            if (ai === 1) {
                window.VizMap.draw(p, manager, ai, progress);
                return;
            }

            // Section 3: intake vs adoption timeline
            if (ai === 2) {
                window.VizBar.draw(p, manager, ai, progress);
                return;
            }

            // Section 4: outcome breakdown
            if (ai === 3) {
                window.VizOutcome.draw(p, manager, ai, progress);
                return;
            }

            // Section 5: adoption heatmap
            if (ai === 4) {
                window.VizHeatmap.draw(p, manager, ai, progress);
                return;
            }

            // Section 6: breed intake vs adoption
            if (ai === 5) {
                window.VizBreed.draw(p, manager, ai, progress);
                return;
            }

            // Section 7: breed radar chart
            if (ai === 6) {
                window.VizRadar.draw(p, manager, ai, progress);
                return;
            }
            // If no visualization is assigned, leave blank.
        }
    };


    function cleanHeader(headerRow) {
        var cleaned = [];

        for (var i = 0; i < headerRow.length; i++) {
            cleaned.push(headerRow[i].replace(/^\uFEFF/, "").trim());
        }

        return cleaned;
    }


    function parseCSV(text) {
        var rows = [];
        var row = [];
        var field = "";
        var insideQuotes = false;

        for (var i = 0; i < text.length; i++) {
            var char = text[i];
            var nextChar = text[i + 1];

            if (char === '"' && insideQuotes && nextChar === '"') {
                field += '"';
                i++;
            } else if (char === '"') {
                insideQuotes = !insideQuotes;
            } else if (char === "," && !insideQuotes) {
                row.push(field);
                field = "";
            } else if ((char === "\n" || char === "\r") && !insideQuotes) {
                if (field.length > 0 || row.length > 0) {
                    row.push(field);
                    rows.push(row);
                    row = [];
                    field = "";
                }

                if (char === "\r" && nextChar === "\n") {
                    i++;
                }
            } else {
                field += char;
            }
        }

        if (field.length > 0 || row.length > 0) {
            row.push(field);
            rows.push(row);
        }

        return rows;
    }

})();