// an angular gradient that varies over time and follows a clockwise direction 
let stateColors;
let stateBoundaries;

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  noStroke();

  stateColors = {
    night:     [color('#6A4C93'), color('#2B3549'), color('#0B1D3A')],
    sunrise:   [color('#C06C84'), color('#F67280'), color('#F8B195')],
    day:       [color('#87CEEB'), color('#BFE9FF'), color('#EAF6FF')],
    afternoon: [color('#F6BD60'), color('#5AA9E6'), color('#87CEEB')],
    sunset:    [color('#C4458F'), color('#E76F51'), color('#F6BD60')],
    night2:    [color('#6A4C93'), color('#2B3549'), color('#0B1D3A')],
  };

  stateBoundaries = [
    { state: 'night',     start: 0,  end: 6  },
    { state: 'sunrise',   start: 6,  end: 10 },
    { state: 'day',       start: 10, end: 15 },
    { state: 'afternoon', start: 15, end: 18 },
    { state: 'sunset',    start: 18, end: 21 },
    { state: 'night2',    start: 21, end: 24 },
  ];
}

function getBlendedColors(h) {
  let segIndex = 0;
  for (let i = 0; i < stateBoundaries.length; i++) {
    if (h >= stateBoundaries[i].start && h < stateBoundaries[i].end) {
      segIndex = i;
      break;
    }
  }

  let seg     = stateBoundaries[segIndex];
  let nextSeg = stateBoundaries[(segIndex + 1) % stateBoundaries.length];
  let t       = constrain((h - seg.start) / (seg.end - seg.start), 0, 1);

  let cA = stateColors[seg.state];
  let cB = stateColors[nextSeg.state];

  return [
    lerpColor(cA[0], cB[0], t),
    lerpColor(cA[1], cB[1], t),
    lerpColor(cA[2], cB[2], t),
  ];
}

// returns the color for a given angle based on distance from darkAngle
function colorAtAngle(angle, darkAngle, colors) {
  let d  = abs(angle - darkAngle);
  d      = min(d, 360 - d);
  let t  = d / 180;          // 0 = darkest, 1 = lightest
  let s  = t * 2;            // scale to 0–2 across 3 colors
  let i  = constrain(floor(s), 0, 1);
  let amt = s - i;
  return lerpColor(colors[i], colors[i + 1], amt);
}

function drawSky(colors) {
  if (!colors || !colors[0] || !colors[2]) return;

  let r  = min(width, height) * 0.42;
  let cx = width / 2;
  let cy = height / 2;
  let h  = hour() + minute() / 60 + second() / 3600;

  let h12       = h % 12;
  let darkAngle = map(h12, 0, 12, -90, 270);

  let segments = 360;
  let step     = 360 / segments;

  for (let i = 0; i < segments; i++) {
    let a1 = i * step - 90;       // start angle, offset so 12 = top
    let a2 = a1 + step + 0.3;     // tiny overlap to avoid gaps

    // measure angular distance from dark point (no -90 offset needed here
    // since darkAngle is already in the same space)
    let midAngle = a1 + step / 2;
    // normalise to 0–360
    let normMid  = (midAngle + 360) % 360;
    let normDark = (darkAngle + 360) % 360;

    let d = abs(normMid - normDark);
    d     = min(d, 360 - d);
    let t = d / 180;
    let s = t * 2;
    let idx = constrain(floor(s), 0, 1);
    let amt = s - idx;
    let c   = lerpColor(colors[idx], colors[idx + 1], amt);

    fill(c);
    noStroke();
    // draw a pie slice; we'll cover the center with a white circle later
    arc(cx, cy, r * 2, r * 2, a1, a2, PIE);
  }

  // cover center so it looks like a ring 

  // Tick marks
  for (let hr = 1; hr <= 12; hr++) {
    let a     = map(hr, 0, 12, -90, 270);
    let inner = hr % 3 === 0 ? r * 0.82 : r * 0.88;
    stroke(255, hr % 3 === 0 ? 200 : 80);
    strokeWeight(hr % 3 === 0 ? 2 : 1);
    line(cx + cos(a) * inner, cy + sin(a) * inner,
         cx + cos(a) * r,     cy + sin(a) * r);
  }
  noStroke();

  // Hour labels 
  fill(255, 180);
  textAlign(CENTER, CENTER);
  textSize(14);
  for (let hr = 1; hr <= 12; hr++) {
    let a = map(hr, 0, 12, -90, 270);
    text(hr, cx + cos(a) * r * 0.75, cy + sin(a) * r * 0.75);
  }
/*
  // Current time center
  fill(255, 220);
  textSize(20);
  textStyle(BOLD);
  text(nf(hour(), 2) + ':' + nf(minute(), 2) + ':' + nf(second(), 2), cx, cy);
  textStyle(NORMAL);*/
}

function draw() {
  background(0);
  let h      = hour() + minute() / 60 + second() / 3600;
  let colors = getBlendedColors(h);
  drawSky(colors);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}