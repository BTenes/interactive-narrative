// sketch_renderer.js

// Responsible for rendering the main visualization based on the current active index
(function () {
    window.Renderer = {

        setData: function (manager) {
            manager.offsetX = (manager.margin && manager.margin.left) || 20;
            manager.offsetY = (manager.margin && manager.margin.top) || 0;

            manager.dogData = [];

            // Load CSV from the data folder
            return fetch("data/yearly_dog_intake_adoption_fixed.csv")
                .then(function (response) {
                    if (!response.ok) {
                        throw new Error("CSV file not found. Check the file path.");
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
                        // 2013 and 2025 are partial years in this dataset
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
                    return manager.dogData;
                })
                .catch(function (error) {
                    console.error("Error loading dog CSV:", error);
                    manager.dogData = [];
                    return manager.dogData;
                });
        },

        draw: function (p, manager, ai, progress) {

            // Show dog intake and adoption timeline
            // activeIndex 2 is the current "No visualization" section
            // activeIndex 7 is the original bar chart section
            if (ai === 2 || ai === 7) {
                window.VizBar.draw(p, manager, ai, progress);
                return;
            }

            if (ai === 0 || ai === 1) {
                window.VizTitle.draw(p, manager, ai, progress);
                return;
            }

            if (ai === 6 || ai === 9) {
                window.VizProgressColor.draw(p, manager, ai, progress);
                return;
            }

            if (ai >= 4 && ai < 6) {
                window.VizScatter.draw(p, manager, ai, progress);
                return;
            }

            // If no visualization is assigned to this section,
            // leave the canvas blank.
        }
    };
})();
