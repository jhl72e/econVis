let data;
let dataPerNation = {};

let mapSvg;
let nationInfoSvg;

let lppSvg;
let rentSvg;
let mealSvg;

//country data variables
let currentCountry = "South Korea";
let targetCountry = "Canada";
let foodPrice = 15;

const legendData = [
  { label: currentCountry, color: "#6B42C1" },
  { label: targetCountry, color: "#F5A623" },
];

//money variables
let currentIncome = 3000;
let currentRentSize = 20;
let currentMealPrice = foodPrice;

//map variable
let mapVis;
let path;
let projection;
let worldData;
let mapLegend;

//select variable

//nationInfo variable

let ni_allGraphs;
let ni_legend, ni_attributes;
let ni_currentPoly, ni_targetPoly;

let targetCountryText;

//econvis variable

let econVisTitleText;
let ev_lpp_xAxis, ev_lpp_yAxis;
let ev_lpp_bars;
let ev_lpp_connectLine;

let ev_rent_currentArea, ev_rent_targetArea;
let rentLegend;

let ev_meal_xAxis, ev_meal_yAxis;

//GENAI--------------------------------------

const burgerIcon =
  `data:image/svg+xml;utf8,` +
  encodeURIComponent(`
<svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
  <!-- Top bun -->
  <path d="M8 18 Q24 4 40 18 Z" fill="#F4A460" />

  <!-- Lettuce -->
  <rect x="8" y="18" width="32" height="4" rx="2" ry="2" fill="#7CFC00" />

  <!-- Patty -->
  <rect x="8" y="22" width="32" height="6" rx="2" ry="2" fill="#8B4513" />

  <!-- Bottom bun -->
  <path d="M8 28 Q24 34 40 28 Z" fill="#D2691E" />
</svg>
`);

const gukbapIcon =
  `data:image/svg+xml;utf8,` +
  encodeURIComponent(`
  <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <!-- Bowl -->
    <ellipse cx="24" cy="40" rx="18" ry="5" fill="#5C4033" />
    <rect x="6" y="20" width="36" height="20" rx="10" ry="10" fill="#5C4033" />

    <!-- Soup -->
    <ellipse cx="24" cy="24" rx="16" ry="4" fill="#D2B48C" />

    <!-- Rice -->
    <circle cx="18" cy="23" r="2" fill="#FFFFFF" />
    <circle cx="24" cy="25" r="1.8" fill="#FFFFFF" />
    <circle cx="30" cy="23" r="2" fill="#FFFFFF" />

    <!-- Green onion -->
    <circle cx="21" cy="22" r="1" fill="#3CB371" />
    <circle cx="27" cy="24" r="1" fill="#3CB371" />
  </svg>
`);
const icons = {
  other: { icon: burgerIcon, iconSize: 25 },
  korea: { icon: gukbapIcon, iconSize: 25 },
};
//------------------------------------------

//svg specification data
let width = 800;
let height = 400;

let mapMargin = { top: 20, right: 20, bottom: 20, left: 20 };

let nationInfoSize = { width: 400, height: 10 };
let nationInfoMargin = { top: 10, right: 10, bottom: 10, left: 10 };

let econVisMargin = { top: 20, right: 20, bottom: 20, left: 20 };
let econVisSize = { width: 100, height: 100 };

let lppVisSize = { width: 300, height: 80 };
let lppVisMargin = { top: 10, right: 10, bottom: 10, left: 10 };

let rentVisSize = { width: 70, height: 70 };
let rentVisMargin = { top: 10, right: 10, bottom: 10, left: 10 };

let mealVisSize = { width: 70, height: 70 };
let mealVisMargin = { top: 10, right: 10, bottom: 10, left: 10 };

//map section functions ---------------------------------------------------

//GENAI---------------------------------
function initMapSection() {
  mapVis = mapSvg.append("g");

  projection = d3
    .geoMercator()
    .scale(width / (2 * Math.PI))
    .center([0, 0])
    .translate([width / 2, height / 2]);

  path = d3.geoPath().projection(projection);

  mapLegend = mapSvg
    .append("g")
    .attr("transform", `translate(${width - width / 10}, ${height * 1.2})`);

  mapLegend
    .selectAll("rect")
    .data(["#78f57a", "#e6475c"])
    .join("rect")
    .attr("width", 10)
    .attr("height", 10)
    .attr("x", (d, i) => 0)
    .attr("y", (d, i) => i * 20)
    .style("fill", (d) => d);

  mapLegend
    .selectAll("text")
    .data(["Higher Living Cost", "Lower Living Cost"])
    .join("text")
    .attr("x", (d, i) => 15)
    .attr("y", (d, i) => 9 + i * 20)
    .style("font-size", "12px")
    .text((d) => d);

  mapSvg.call(
    d3
      .zoom()
      .scaleExtent([1, 8])
      .on("zoom", (event) => {
        mapVis.attr("transform", event.transform);
      })
  );
}
//------------------------------------------

function updateMapSection() {
  mapVis
    .selectAll("path")
    .data(worldData.features)
    .join("path")
    .attr("d", path)
    .attr("class", "country")
    .attr("fill", (d) => {
      return genCountryColor(d.properties.name);
    })
    .on("click", function (event, d) {
      if (dataPerNation[d.properties.name]) {
        targetCountry = d.properties.name;
        legendData[1].label = targetCountry;
        update();
      }
    });
}

async function getGeoJsonData() {
  worldData = await d3.json(
    "https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json"
  );
  //GENAI----------------------------
  worldData.features = worldData.features.filter(
    (feature) => feature.properties.name !== "Bermuda"
  );
  //-----------------------------
}

function genCountryColor(country) {
  const target = dataPerNation[country];
  const current = dataPerNation[currentCountry];

  if (!target || !current) {
    return "#ffffff";
  }
  return target.lpp > current.lpp ? "#78f57a" : "#e6475c";
}

//-------------------------------------------------------------------

//selectSection functions -----------------------------------------------------------
function initSelectSection() {
  selectCountry();
  insertIncome();
  updateMeal();
  updateRent();
}

function updateSelectSection() {}

function insertIncome() {
  const incomeInput = document.getElementById("salaryInput");

  incomeInput.addEventListener("input", (e) => {
    currentIncome = e.target.value;
    update();
  });
}

function updateMeal() {
  const mealPriceInput = document.getElementById("mealPriceInput");

  mealPriceInput.addEventListener("input", (e) => {
    currentMealPrice = parseFloat(e.target.value);
    update();
  });
}

function updateRent() {
  const rentSizeInput = document.getElementById("houseSizeInput");

  rentSizeInput.addEventListener("input", (e) => {
    currentRentSize = parseFloat(e.target.value);
    update();
  });
}

function selectCountry() {
  const selectBox = document.getElementById("currentCountrySelector");

  //GENAI-----------------------------
  const countries = Object.keys(dataPerNation).sort();

  countries.forEach((country) => {
    const option = document.createElement("option");
    option.value = country;
    option.textContent = country;
    selectBox.appendChild(option);
  });

  selectBox.value = currentCountry;
  //------------------------------------

  selectBox.addEventListener("change", (e) => {
    currentCountry = e.target.value;
    legendData[0].label = currentCountry;
    update();
  });
}

//---------------------------------------------------------------------

//nationInfo Section functions -----------------------------------------
function initNationInfoSection() {
  targetCountryText = document.getElementById("targetcountrytext");

  ni_allGraphs = nationInfoSvg.append("g");
  ni_xAxis = ni_allGraphs.append("g");
  ni_yAxis = ni_allGraphs.append("g");
  ni_currentPoly = ni_allGraphs.append("g");
  ni_targetPoly = ni_allGraphs.append("g");

  ni_legend = ni_allGraphs.append("g").attr("class", "legend");

  ni_legend.attr(
    "transform",
    `translate(${nationInfoMargin.left}, ${nationInfoMargin.top})`
  );

  ni_currentPoly.attr(
    "transform",
    `translate(${nationInfoMargin.left}, ${nationInfoMargin.top})`
  );
  ni_targetPoly.attr(
    "transform",
    `translate(${nationInfoMargin.left}, ${nationInfoMargin.top})`
  );
}

function initNationInfoSection() {
  targetCountryText = document.getElementById("targetcountrytext");

  ni_allGraphs = nationInfoSvg.append("g");
  ni_xAxis = ni_allGraphs.append("g");
  ni_yAxis = ni_allGraphs.append("g");
  ni_currentBar = ni_allGraphs.append("g");
  ni_targetBar = ni_allGraphs.append("g");

  ni_xAxis.attr(
    "transform",
    `translate(${nationInfoMargin.left}, ${nationInfoMargin.top})`
  );

  ni_yAxis.attr(
    "transform",
    `translate(${nationInfoMargin.left}, ${nationInfoMargin.top})`
  );
  ni_currentBar.attr(
    "transform",
    `translate(${nationInfoMargin.left}, ${nationInfoMargin.top})`
  );
  ni_targetBar.attr(
    "transform",
    `translate(${nationInfoMargin.left}, ${nationInfoMargin.top})`
  );
}

//GENAI----------------------------------------
function updateNationInfoSection() {
  ni_allGraphs.selectAll("*").remove();
  const width =
    nationInfoSize.width - nationInfoMargin.left - nationInfoMargin.right;
  const height =
    nationInfoSize.height - nationInfoMargin.top - nationInfoMargin.bottom;
  const radius = Math.min(width, height) / 2;

  ni_allGraphs.attr(
    "transform",
    `translate(${width / 2 + nationInfoMargin.left}, ${
      height / 2 + nationInfoMargin.top
    })`
  );

  const features = ["coli", "rent", "groceries", "restaurant", "lpp"];
  const featureLabels = [
    "Cost of Living",
    "Renting price",
    "Grocery price",
    "Restaurant Price",
    "Local Purchasing Power",
  ];

  const currentData = features.map((feat) => ({
    feature: feat,
    value: dataPerNation[currentCountry][feat],
  }));

  const targetData = features.map((feat) => ({
    feature: feat,
    value: targetCountry ? dataPerNation[targetCountry][feat] : 0,
  }));

  const baseData = features.map((feat) => ({
    feature: feat,
    value: 100,
  }));

  const angleSlice = (Math.PI * 2) / features.length;

  // Scale for features
  const rScale = d3.scaleLinear().domain([0, 150]).range([0, radius]);

  const levels = 5;
  const gridData = [...Array(levels).keys()].map((i) => (i + 1) * 30);

  gridData.forEach((level) => {
    const gridPath = features.map((_, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      return [rScale(level) * Math.cos(angle), rScale(level) * Math.sin(angle)];
    });

    ni_allGraphs
      .selectAll("basePolygon")
      .data([gridPath])
      .join("polygon")
      .attr("class", "grid-line")
      .style("stroke", "#ddd")
      .style("fill", "none")
      .attr("points", (d) => d.map((p) => p.join(",")).join(" "));
  });

  // Draw the axes
  features.forEach((f, i) => {
    const angle = angleSlice * i - Math.PI / 2;
    const lineData = [
      [0, 0],
      [rScale(150) * Math.cos(angle), rScale(150) * Math.sin(angle)],
    ];

    ni_allGraphs
      .append("line")
      .attr("x1", lineData[0][0])
      .attr("y1", lineData[0][1])
      .attr("x2", lineData[1][0])
      .attr("y2", lineData[1][1])
      .style("stroke", "#ddd")
      .style("stroke-width", "1px");

    if (f == "lpp") {
      ni_allGraphs
        .append("text")
        .attr("transform", `translate(${-1}, ${-10})`)
        .attr("x", rScale(300) * Math.cos(angle))
        .attr("y", rScale(190) * Math.sin(angle))
        .style("text-anchor", "middle")
        .style("font-size", "12px")
        .text(featureLabels[i]);
    } else if (f == "groceries" || f == "restaurant") {
      ni_allGraphs
        .append("text")
        .attr("x", rScale(250) * Math.cos(angle))
        .attr("y", rScale(200) * Math.sin(angle))
        .style("text-anchor", "middle")
        .style("font-size", "12px")
        .text(featureLabels[i]);
    } else if (f == "rent") {
      ni_allGraphs
        .append("text")
        .attr("x", rScale(280) * Math.cos(angle))
        .attr("y", rScale(170) * Math.sin(angle))
        .style("text-anchor", "middle")
        .style("font-size", "12px")
        .text(featureLabels[i]);
    } else {
      ni_allGraphs
        .append("text")
        .attr("x", rScale(200) * Math.cos(angle))
        .attr("y", rScale(180) * Math.sin(angle))
        .style("text-anchor", "middle")
        .style("font-size", "12px")
        .text(featureLabels[i]);
    }
  });

  function drawSpiderPath(data, color, opacity) {
    const points = data.map((d, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      return [
        rScale(d.value) * Math.cos(angle),
        rScale(d.value) * Math.sin(angle),
      ];
    });

    ni_allGraphs
      .append("path")
      .datum(points)
      .attr("d", (d) => `M ${d.map((p) => p.join(",")).join(" L ")} Z`)
      .style("stroke", color)
      .style("fill", color)
      .style("fill-opacity", opacity)
      .style("stroke-width", "2px");
  }

  drawSpiderPath(baseData, "#ddd", 0.1);
  drawSpiderPath(currentData, "#6B42C1", 0.5);
  if (targetCountry) {
    drawSpiderPath(targetData, "#F5A623", 0.5);
  }

  // Add legend
  const legend = ni_allGraphs
    .append("g")
    .attr("transform", `translate(${width / 2 - 30}, ${-height / 2 - 10})`);

  legendData.forEach((d, i) => {
    const legendRow = legend
      .append("g")
      .attr("transform", `translate(0, ${i * 20})`);

    legendRow
      .append("rect")
      .attr("width", 10)
      .attr("height", 10)
      .style("fill", d.color);

    legendRow
      .append("text")
      .attr("x", 15)
      .attr("y", 10)
      .style("font-size", "12px")
      .text(d.label);
  });

  targetCountryText.innerHTML = targetCountry || "Select a country";
}
//-------------------------------------------

//---------------------------------------------------------------------

//economic visualizer section functions -------------------------------------

function initEconVisSection() {
  econVisTitleText = document.getElementById("capabilitytranslateText");
  //lpp-----------
  ev_lpp_xAxis = initEachEconGraph(lppSvg, lppVisMargin);
  ev_lpp_yAxis = initEachEconGraph(lppSvg, lppVisMargin);
  ev_lpp_bars = initEachEconGraph(lppSvg, lppVisMargin);
  ev_lpp_connectLine = initEachEconGraph(lppSvg, lppVisMargin);

  ev_lpp_xAxis.attr(
    "transform",
    `translate(${lppVisMargin.left}, ${
      lppVisSize.height - lppVisMargin.bottom
    })`
  );

  //-------------------

  //rent-----------------
  ev_rent_currentArea = initEachEconGraph(rentSvg, rentVisMargin);
  ev_rent_targetArea = initEachEconGraph(rentSvg, rentVisMargin);

  rentLegend = rentSvg.append("g").attr("transform", `translate(${5}, ${5})`);

  //-------------

  //restaurant-------------

  ev_meal_xAxis = initEachEconGraph(mealSvg, mealVisMargin);
  ev_meal_yAxis = initEachEconGraph(mealSvg, mealVisMargin);

  ev_meal_currentFood = initEachEconGraph(mealSvg, mealVisMargin);
  ev_meal_targetFood = initEachEconGraph(mealSvg, mealVisMargin);

  //-------------------
}
function initEachEconGraph(group, margin) {
  return group
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);
}

function updateEconVisSection() {
  updateLppVis();
  updateRentVis();
  updateMealVis();

  econVisTitleText.innerHTML = `${targetCountry} to ${currentCountry}`;
}

function updateLppVis() {
  const width = lppVisSize.width - lppVisMargin.left - lppVisMargin.right;
  const height = lppVisSize.height - lppVisMargin.top - lppVisMargin.bottom;

  const currentLPP = currentIncome;

  let targetLPP = incomeConversion(
    currentIncome,
    dataPerNation[currentCountry].coli,
    dataPerNation[targetCountry].coli
  );

  if (targetLPP < currentLPP) {
    const perceivedChange = cogScale.prospectTheory(
      (targetLPP - currentLPP) / currentLPP
    );
    targetLPP = currentLPP * (1 + perceivedChange);
  }

  const drawData = [currentLPP, targetLPP];
  const additionalGraphMargin = lppVisMargin.left * 0.2;
  const barHeight = 20;
  const xScale = d3
    .scaleLinear()
    .domain([0, Math.max(d3.max(drawData), 20000)])
    .range([0, width - lppVisMargin.right])
    .nice();

  const yScale = d3
    .scaleBand()
    .domain([currentCountry, targetCountry || ""])
    .range([0, height]);

  ev_lpp_xAxis
    .attr(
      "transform",
      `translate(${lppVisMargin.left + additionalGraphMargin}, ${
        lppVisSize.height - lppVisMargin.bottom
      })`
    )
    .call(
      d3
        .axisBottom(xScale)
        .ticks(5)
        .tickFormat((d) => "$" + d + "USD")
    )
    .attr("font-size", "9px");

  ev_lpp_yAxis
    .attr(
      "transform",
      `translate(${lppVisMargin.left + additionalGraphMargin}, ${
        lppVisMargin.top
      })`
    )
    .call(d3.axisLeft(yScale).ticks(2))
    .attr("font-size", "0.5em");

  ev_lpp_bars
    .selectAll("rect")
    .data(drawData)
    .join("rect")
    .attr("x", additionalGraphMargin)
    .attr(
      "y",
      (d, i) =>
        yScale(i === 0 ? currentCountry : targetCountry || "") +
        yScale.bandwidth() / 2 -
        barHeight / 2
    )
    .attr("width", (d) => xScale(d))
    .attr("height", barHeight)
    .attr("fill", (d, i) => (i == 0 ? "#6B42C1" : "#F5A623"));

  ev_lpp_bars
    .selectAll("text")
    .data(drawData)
    .join("text")
    .attr("x", (d) => xScale(d) + 5 + additionalGraphMargin)
    .attr(
      "y",
      (d, i) =>
        yScale(i === 0 ? currentCountry : targetCountry || "") +
        yScale.bandwidth() / 2 -
        barHeight / 2
    )
    .attr("dy", "0.9em")
    .attr("fill", "#333")
    .style("font-size", "11px")
    .text((d) => `$${Math.round(d)}`);
}

function updateRentVis() {
  const maxArea = 200;
  const currentArea = currentRentSize;
  const targetArea = rentSizeConversion(
    currentRentSize,
    dataPerNation[currentCountry].rent,
    dataPerNation[targetCountry].rent
  );

  const iconSize = rentVisSize.width / 2;
  //const scale = d3.scaleSqrt().domain([0, maxArea]).range([0, iconSize]);

  const currentSize = iconSize * cogScale.powerAreaScale(currentArea / maxArea);
  const targetSize = iconSize * cogScale.powerAreaScale(targetArea / maxArea);

  // const currentSize = scale(currentArea);
  // const targetSize = scale(targetArea);

  const anchorX = rentVisMargin.left / 5;
  const anchorY = rentVisSize.height;

  ev_rent_currentArea
    .selectAll("rect")
    .data([currentArea])
    .join("rect")
    .attr("x", anchorX)
    .attr("y", anchorY - currentSize)
    .attr("width", currentSize)
    .attr("height", currentSize)
    .attr("fill", "#6B42C1")
    .attr("opacity", 0.9)
    .attr("stroke", "#333")
    .attr("stroke-width", 2);

  ev_rent_currentArea
    .selectAll("text")
    .data([currentArea])
    .join("text")
    .attr("x", anchorX + currentSize)
    .attr("y", anchorY - currentSize)
    .style("font-size", "12px")
    .text(currentArea + " sqft(current)");

  ev_rent_targetArea
    .selectAll("rect")
    .data([targetArea])
    .join("rect")
    .attr("x", anchorX)
    .attr("y", anchorY - targetSize)
    .attr("width", targetSize)
    .attr("height", targetSize)
    .attr("fill", "#F5A623")
    .attr("opacity", 0.5)
    .attr("stroke", "#333")
    .attr("stroke-dasharray", "4 2");

  ev_rent_targetArea
    .selectAll("text")
    .data([currentArea])
    .join("text")
    .attr("x", anchorX)
    .attr("y", anchorY - targetSize)
    .style("font-size", "12px")
    .text(Math.round(targetArea) + " sqft(target)");

  rentLegend
    .selectAll("rect")
    .data(legendData)
    .join("rect")
    .attr("width", 10)
    .attr("height", 10)
    .attr("x", (d, i) => 0)
    .attr("y", (d, i) => i * 20)
    .style("fill", (d) => d.color);

  rentLegend
    .selectAll("text")
    .data(legendData)
    .join("text")
    .attr("x", (d, i) => 15)
    .attr("y", (d, i) => 9 + i * 20)
    .style("font-size", "12px")
    .text((d) => d.label);
}

function updateMealVis() {
  const foodIndex =
    dataPerNation[currentCountry].restaurant * (5 / 13) +
    dataPerNation[currentCountry].groceries * (8 / 13);

  const fixedFoodPrice = foodPrice * (foodIndex / 100);

  console.log(fixedFoodPrice);
  const ev_meal_data = [
    currentMealPrice / fixedFoodPrice,
    mealConversion(
      currentMealPrice,
      (dataPerNation[currentCountry].restaurant * (5 / 13) +
        dataPerNation[currentCountry].groceries) *
        (8 / 13),
      (dataPerNation[targetCountry].restaurant * (5 / 13) +
        dataPerNation[targetCountry].groceries) *
        (8 / 13)
    ) / fixedFoodPrice,
  ];

  const maxFood = 8;
  const iconSize = mealVisSize.height * 0.2;
  const yMargin = iconSize * 0.5;

  //변환 라이브러리 사용시 여기서 ev_meal_data를 변환에 넣어서 새로운 glpyh 그리기용 scale 함수 다시 만들기

  const ev_meal_xScale = d3
    .scaleBand()
    .domain([currentCountry, targetCountry])
    .range([0, mealVisSize.width]);

  const ev_meal_yScale = d3
    .scaleLinear()
    .domain([0, maxFood])
    .range([0, mealVisSize.height]);

  //GENAI--------------------------
  const currentFoodCount = Math.round(ev_meal_data[0]);
  const currentFoodData = d3.range(currentFoodCount);
  //-----------------------------------

  let curIcon = currentCountry == "South Korea" ? icons.korea : icons.other;

  ev_meal_currentFood
    .selectAll("image")
    .data(currentFoodData)
    .join("image")
    .attr("href", curIcon.icon)
    .attr(
      "x",
      (d, i) =>
        ev_meal_xScale(currentCountry) +
        ev_meal_xScale.bandwidth() / 2 -
        iconSize -
        10 +
        Math.floor(i / maxFood) * curIcon.iconSize
    )
    .attr(
      "y",
      (d, i) =>
        mealVisSize.height -
        ((i % maxFood) + 1) * yMargin -
        curIcon.iconSize -
        13
    )
    .attr("width", curIcon.iconSize)
    .attr("height", curIcon.iconSize);

  //GENAI--------------------------
  const targetFoodCount = Math.round(ev_meal_data[1]);
  const targetFoodData = d3.range(targetFoodCount);
  //-----------------------------------

  ev_meal_targetFood
    .selectAll("image")
    .data(targetFoodData)
    .join("image")
    .attr("href", curIcon.icon)
    .attr(
      "x",
      (d, i) =>
        ev_meal_xScale(targetCountry) +
        ev_meal_xScale.bandwidth() / 2 -
        10 -
        curIcon.iconSize +
        Math.floor(i / maxFood) * curIcon.iconSize -
        5
    )
    .attr(
      "y",
      (d, i) =>
        mealVisSize.height -
        ((i % maxFood) + 1) * yMargin -
        curIcon.iconSize -
        13
    )
    .attr("width", curIcon.iconSize)
    .attr("height", curIcon.iconSize);

  //GENAI----------------------------------
  const currentXCenter =
    ev_meal_xScale(currentCountry) + ev_meal_xScale.bandwidth() / 2;
  const targetXCenter =
    ev_meal_xScale(targetCountry) + ev_meal_xScale.bandwidth() / 2;

  // 중앙 x 좌표 계산
  const midX = (currentXCenter + targetXCenter) / 2;
  mealSvg
    .append("line")
    .attr("x1", midX)
    .attr("y1", 0)
    .attr("x2", midX)
    .attr("y2", mealVisSize.height)
    .attr("stroke", "#888")
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "5,5");
  //--------------------------------------------------

  ev_meal_xAxis
    .attr("transform", `translate(${0}, ${mealVisSize.height})`)
    .call(d3.axisBottom(ev_meal_xScale).ticks(2));
}
//---------------------------------------------------------------------------

//calculation functions
function mealConversion(currentNationFoodSpend, currentRate, targetRate) {
  return currentNationFoodSpend * (currentRate / targetRate);
}

function rentSizeConversion(currentRentSize, currentRate, targetRate) {
  return currentRentSize * (currentRate / targetRate);
}

function incomeConversion(income, currentColi, targetColi) {
  return income * (currentColi / targetColi);
}
//

//UI modification functions

//GENAI------------------------------
function computeLayoutFromContainer() {
  function getRect(id) {
    return document.getElementById(id).parentElement.getBoundingClientRect();
  }

  function getMargin(rect, top = 0.1, right = 0.05, bottom = 0.2, left = 0.05) {
    return {
      top: rect.height * top,
      right: rect.width * right,
      bottom: rect.height * bottom,
      left: rect.width * left,
    };
  }

  // Map SVG
  const mapRect = getRect("map-svg");
  mapMargin = getMargin(mapRect);
  width = mapRect.width - mapMargin.left - mapMargin.right;
  height = mapRect.height - mapMargin.top - mapMargin.bottom;

  // Nation Info
  const niRect = getRect("nationinfo-svg");
  nationInfoMargin = getMargin(niRect);
  nationInfoMargin.top += 10;
  nationInfoMargin.bottom -= 25;
  nationInfoSize = {
    width: niRect.width - nationInfoMargin.left - nationInfoMargin.right,
    height: niRect.height - nationInfoMargin.top - nationInfoMargin.bottom,
  };

  // LPP
  const lppRect = getRect("lpp-svg");
  lppVisMargin = getMargin(lppRect);
  lppVisMargin.left *= 3;
  lppVisMargin.right = 0;
  lppVisSize = {
    width: lppRect.width - lppVisMargin.left - lppVisMargin.right,
    height: lppRect.height - lppVisMargin.top - lppVisMargin.bottom,
  };

  // Rent
  const rentRect = getRect("rent-svg");
  rentVisMargin = getMargin(rentRect);
  rentVisSize = {
    width: rentRect.width - rentVisMargin.left - rentVisMargin.right,
    height: rentRect.height - rentVisMargin.top - rentVisMargin.bottom,
  };

  // Meal
  const mealRect = getRect("meal-svg");
  mealVisMargin = getMargin(mealRect);
  mealVisSize = {
    width: mealRect.width - mealVisMargin.left - mealVisMargin.right,
    height: mealRect.height - mealVisMargin.top - mealVisMargin.bottom,
  };
}

//-----------------------

//framework ------------------------------------------------------------------
function init() {
  computeLayoutFromContainer();

  //svg change and variable init
  mapSvg = d3.select("#map-svg");
  nationInfoSvg = d3.select("#nationinfo-svg");

  lppSvg = d3.select("#lpp-svg").attr("id", "lppSvgVis");
  rentSvg = d3.select("#rent-svg").attr("id", "rentSvgVis");
  mealSvg = d3.select("#meal-svg").attr("id", "mealSvgVis");

  mapSvg
    .attr("width", width + mapMargin.left + mapMargin.right)
    .attr("height", height + mapMargin.top + mapMargin.bottom);

  nationInfoSvg
    .attr(
      "width",
      nationInfoSize.width + nationInfoMargin.left + nationInfoMargin.right
    )
    .attr(
      "height",
      nationInfoSize.height + nationInfoMargin.top + nationInfoMargin.bottom
    );

  lppSvg
    .attr("width", lppVisSize.width + lppVisMargin.left + lppVisMargin.right)
    .attr("height", lppVisSize.height + lppVisMargin.top + lppVisMargin.bottom);

  rentSvg
    .attr("width", rentVisSize.width + rentVisMargin.left + rentVisMargin.right)
    .attr(
      "height",
      rentVisSize.height + rentVisMargin.top + rentVisMargin.bottom
    );

  mealSvg
    .attr("width", econVisSize.width + econVisMargin.left + econVisMargin.right)
    .attr(
      "height",
      econVisSize.height + econVisMargin.top + econVisMargin.bottom
    );

  //----------------------------------------

  initMapSection();
  initSelectSection();
  initNationInfoSection();
  initEconVisSection();
}

function update() {
  updateMapSection();
  updateSelectSection();
  updateNationInfoSection();
  updateEconVisSection();
}

//-----------------------------------------------------------------------------

//execution---------------------------------------------------------------------

d3.csv("COLI.csv").then(async (csvData) => {
  csvData.forEach((d) => {
    d["Rank"] = +d["Rank"];
    d["Cost of Living Index"] = +d["Cost of Living Index"];
    d["Rent Index"] = +d["Rent Index"];
    d["Cost of Living Plus Rent Index"] = +d["Cost of Living Plus Rent Index"];
    d["Groceries Index"] = +d["Groceries Index"];
    d["Restaurant Price Index"] = +d["Restaurant Price Index"];
    d["Local Purchasing Power Index"] = +d["Local Purchasing Power Index"];

    dataPerNation[d["Country"]] = {
      rank: d["Rank"],
      coli: d["Cost of Living Index"],
      rent: d["Rent Index"],
      coliAndRent: d["Cost of Living Plus Rent Index"],
      groceries: d["Groceries Index"],
      restaurant: d["Restaurant Price Index"],
      lpp: d["Local Purchasing Power Index"],
    };
  });

  await getGeoJsonData();
  data = csvData;

  init();
  update();
});
