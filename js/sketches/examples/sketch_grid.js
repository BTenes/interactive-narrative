let table;
let data = [];

let margin = { top: 70, right: 60, bottom: 90, left: 80 };
let chartX, chartY, chartW, chartH;

function preload() {
  table = loadTable("yearly_dog_intake_adoption_fixed.csv", "csv", "header");
}

function setup() {
  createCanvas(1000, 600);

  chartX = margin.left;
  chartY = margin.top;
  chartW = width - margin.left - margin.right;
  chartH = height - margin.top - margin.bottom;

  for (let r = 0; r < table.getRowCount(); r++) {
    let year = table.getNum(r, "Year");

    // 2013 和 2025 都不是完整年份
    // 这里先保留 2014 到 2024
    if (year >= 2014 && year <= 2024) {
      data.push({
        year: year,
        intake: table.getNum(r, "Intakes"),
        adoption: table.getNum(r, "Adoptions"),
        gap: table.getNum(r, "Gap")
      });
    }
  }

  textFont("Arial");
}

function draw() {
  background(250);

  drawTitle();
  drawAxes();
  drawGapArea();
  drawLine("intake");
  drawLine("adoption");
  drawLegend();
  drawHover();
}

function drawTitle() {
  noStroke();
  fill(35);
  textAlign(LEFT, CENTER);
  textSize(24);
  text("Dog Intake and Adoption by Year", margin.left, 32);

  fill(110);
  textSize(14);
  text("Austin Animal Center, dogs only", margin.left, 55);
}

function drawAxes() {
  let maxY = getMaxValue();

  // grid lines and y labels
  for (let i = 0; i <= 5; i++) {
    let value = (maxY / 5) * i;
    let y = valueToY(value);

    stroke(230);
    strokeWeight(1);
    line(chartX, y, chartX + chartW, y);

    noStroke();
    fill(120);
    textSize(12);
    textAlign(RIGHT, CENTER);
    text(round(value), chartX - 12, y);
  }

  // axis lines
  stroke(170);
  strokeWeight(1);
  line(chartX, chartY, chartX, chartY + chartH);
  line(chartX, chartY + chartH, chartX + chartW, chartY + chartH);

  // x-axis labels
  noStroke();
  fill(100);
  textSize(13);
  textAlign(CENTER, TOP);

  for (let i = 0; i < data.length; i++) {
    let x = indexToX(i);
    text(data[i].year, x, chartY + chartH + 15);
  }

  // y-axis label
  push();
  translate(25, height / 2);
  rotate(-HALF_PI);
  fill(90);
  textSize(14);
  textAlign(CENTER, CENTER);
  text("Number of Dogs", 0, 0);
  pop();
}

function drawGapArea() {
  noStroke();
  fill(80, 140, 220, 35);

  beginShape();

  // top line: intake
  for (let i = 0; i < data.length; i++) {
    let x = indexToX(i);
    let y = valueToY(data[i].intake);
    vertex(x, y);
  }

  // bottom line: adoption
  for (let i = data.length - 1; i >= 0; i--) {
    let x = indexToX(i);
    let y = valueToY(data[i].adoption);
    vertex(x, y);
  }

  endShape(CLOSE);
}

function drawLine(type) {
  noFill();

  if (type === "intake") {
    stroke(70, 130, 220);
    strokeWeight(3);
    drawingContext.setLineDash([]);
  }

  if (type === "adoption") {
    stroke(80, 165, 120);
    strokeWeight(3);
    drawingContext.setLineDash([10, 7]);
  }

  beginShape();
  for (let i = 0; i < data.length; i++) {
    let x = indexToX(i);
    let y = valueToY(data[i][type]);
    vertex(x, y);
  }
  endShape();

  drawingContext.setLineDash([]);

  // points
  for (let i = 0; i < data.length; i++) {
    let x = indexToX(i);
    let y = valueToY(data[i][type]);

    fill(250);
    if (type === "intake") {
      stroke(70, 130, 220);
    } else {
      stroke(80, 165, 120);
    }
    strokeWeight(2);
    circle(x, y, 9);
  }
}

function drawLegend() {
  let lx = margin.left;
  let ly = height - 30;

  textSize(14);
  textAlign(LEFT, CENTER);

  // intake
  stroke(70, 130, 220);
  strokeWeight(3);
  line(lx, ly, lx + 40, ly);
  noStroke();
  fill(60);
  text("intake", lx + 50, ly);

  // adoption
  stroke(80, 165, 120);
  strokeWeight(3);
  drawingContext.setLineDash([10, 7]);
  line(lx + 130, ly, lx + 170, ly);
  drawingContext.setLineDash([]);
  noStroke();
  fill(60);
  text("adoption", lx + 180, ly);

  // gap
  fill(80, 140, 220, 35);
  rect(lx + 310, ly - 8, 24, 16);
  fill(60);
  text("gap = intake - adoption", lx + 345, ly);
}

function drawHover() {
  if (
    mouseX < chartX ||
    mouseX > chartX + chartW ||
    mouseY < chartY ||
    mouseY > chartY + chartH
  ) {
    return;
  }

  let idx = getClosestIndex(mouseX);
  let d = data[idx];

  let x = indexToX(idx);
  let intakeY = valueToY(d.intake);
  let adoptionY = valueToY(d.adoption);

  // vertical guide line
  stroke(190);
  strokeWeight(1);
  line(x, chartY, x, chartY + chartH);

  // highlight points
  noStroke();
  fill(70, 130, 220);
  circle(x, intakeY, 14);

  fill(80, 165, 120);
  circle(x, adoptionY, 14);

  // tooltip box
  let boxW = 190;
  let boxH = 120;
  let tx = x + 18;
  let ty = min(intakeY, adoptionY) - 30;

  if (tx + boxW > width - 15) {
    tx = x - boxW - 18;
  }

  if (ty < 15) {
    ty = 15;
  }

  fill(255);
  stroke(210);
  strokeWeight(1);
  rect(tx, ty, boxW, boxH, 12);

  noStroke();
  textAlign(LEFT, TOP);

  fill(35);
  textSize(17);
  text(d.year, tx + 16, ty + 14);

  fill(70, 130, 220);
  textSize(15);
  text("Intake: " + d.intake, tx + 16, ty + 48);

  fill(80, 165, 120);
  text("Adoption: " + d.adoption, tx + 16, ty + 73);

  fill(60);
  text("Gap: " + d.gap, tx + 16, ty + 98);
}

function getClosestIndex(mx) {
  let closest = 0;
  let minDist = Infinity;

  for (let i = 0; i < data.length; i++) {
    let x = indexToX(i);
    let d = abs(mx - x);

    if (d < minDist) {
      minDist = d;
      closest = i;
    }
  }


  return closest;
}

function indexToX(i) {
  return map(i, 0, data.length - 1, chartX, chartX + chartW);
}

function valueToY(value) {
  return map(value, 0, getMaxValue(), chartY + chartH, chartY);
}

function getMaxValue() {
  let maxVal = 0;

  for (let d of data) {
    maxVal = max(maxVal, d.intake, d.adoption);
  }

  return ceil(maxVal / 1000) * 1000;
}