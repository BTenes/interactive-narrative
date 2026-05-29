// sketch_renderer.js

// Responsible for rendering the main visualization based on the current active index
(function () {
    window.Renderer = {

        setData: function (manager) {
            manager.offsetX = (manager.margin && manager.margin.left) || 20;
            manager.offsetY = (manager.margin && manager.margin.top) || 0;

            manager.dogData = [];
            manager.outcomeData = [];

            // Load both CSV files
            var loadTimelineData = fetch("data/yearly_dog_intake_adoption_fixed.csv")
                .then(function (response) {
                    if (!response.ok) {
                        throw new Error("Cannot find data/yearly_dog_intake_adoption_fixed.csv");
                    }
                    return response.text();
                })
                .then(function (csvText) {
                    var rows = csvText.trim().split("\n");
                    var header = rows[0].split(",");

                    var yearIndex = header.indexOf("Year");
                    var intakeIndex = header.indexOf("Intakes");
                    var adoptionIndex = header.indexOf("Adoptions");
                    var gapIndex = header.indexOf("Gap");

                    var parsedData = [];

                    for (var i = 1; i < rows.length; i++) {
                        var cols = rows[i].split(",");

                        var year = Number(cols[yearIndex]);
                        var intake = Number(cols[intakeIndex]);
                        var adoption = Number(cols[adoptionIndex]);
                        var gap = Number(cols[gapIndex]);

                        // Keep only full years
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
                    console.error("Error loading timeline CSV:", error);
                    manager.dogData = [];
                    return manager.dogData;
                });


            var loadOutcomeData = fetch("data/outcome.csv")
                .then(function (response) {
                    if (!response.ok) {
                        throw new Error("Cannot find data/outcome.csv");
                    }
                    return response.text();
                })
                .then(function (csvText) {
                    var rows = parseCSV(csvText);
                    var header = rows[0];

                    var dateIndex = header.indexOf("DateTime");
                    var outcomeIndex = header.indexOf("Outcome Type");
                    var animalIndex = header.indexOf("Animal Type");

                    var counts = {};

                    for (var i = 1; i < rows.length; i++) {
                        var row = rows[i];

                        var dateText = row[dateIndex];
                        var animalType = row[animalIndex];
                        var outcomeType = row[outcomeIndex];

                        if (!dateText || !animalType) {
                            continue;
                        }

                        // Only dogs
                        if (animalType !== "Dog") {
                            continue;
                        }

                        var year = getYearFromDate(dateText);

                        // Keep only full years
                        if (year < 2014 || year > 2024) {
                            continue;
                        }

                        if (!outcomeType || outcomeType.trim() === "") {
                            outcomeType = "Unknown";
                        }

                        // Keep main categories, combine small categories into Other
                        if (
                            outcomeType !== "Adoption" &&
                            outcomeType !== "Return to Owner" &&
                            outcomeType !== "Transfer" &&
                            outcomeType !== "Euthanasia" &&
                            outcomeType !== "Rto-Adopt"
                        ) {
                            outcomeType = "Other";
                        }

                        if (!counts[outcomeType]) {
                            counts[outcomeType] = 0;
                        }

                        counts[outcomeType]++;
                    }

                    var orderedOutcomes = [
                        "Adoption",
                        "Return to Owner",
                        "Transfer",
                        "Euthanasia",
                        "Rto-Adopt",
                        "Other"
                    ];

                    var parsedData = [];

                    for (var j = 0; j < orderedOutcomes.length; j++) {
                        var name = orderedOutcomes[j];

                        parsedData.push({
                            outcome: name,
                            count: counts[name] || 0
                        });
                    }

                    manager.outcomeData = parsedData;
                    console.log("Loaded outcome data:", manager.outcomeData);
                    return manager.outcomeData;
                })
                .catch(function (error) {
                    console.error("Error loading outcome CSV:", error);
                    manager.outcomeData = [];
                    return manager.outcomeData;
                });

            return Promise.all([loadTimelineData, loadOutcomeData]);
        },

        draw: function (p, manager, ai, progress) {

            // Section 2: intake vs adoption timeline
            if (ai === 2) {
                window.VizBar.draw(p, manager, ai, progress);
                return;
            }

            // Section 3: outcome breakdown donut chart
            if (ai === 3) {
                window.VizOutcome.draw(p, manager, ai, progress);
                return;
            }

            // Original title sections
            if (ai === 0 || ai === 1) {
                window.VizTitle.draw(p, manager, ai, progress);
                return;
            }

            // Original progress color examples
            if (ai === 6 || ai === 9) {
                window.VizProgressColor.draw(p, manager, ai, progress);
                return;
            }

            // Original scatter examples
            if (ai >= 4 && ai < 6) {
                window.VizScatter.draw(p, manager, ai, progress);
                return;
            }

            // If no visualization is assigned, leave the canvas blank.
        }
    };


    // CSV parser that can handle commas inside quoted fields
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


    function getYearFromDate(dateText) {
        // outcome.csv DateTime example:
        // 2014-07-11T00:00:00-05:00
        // first 4 characters are the year
        return Number(dateText.substring(0, 4));
    }

})();