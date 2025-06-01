let data;
let dataPerNation = {};


let mapSvg;    
let nationInfoSvg;

let lppSvg;
let rentSvg;
let mealSvg;


//country data variables
let currentCountry = "South Korea";
let targetCountry;

//money variables
let currentIncome;
let currentHouseSize;
let currentMealPrice;

//map variable
let mapVis;
let path;
let projection;
let worldData;

//select variable

//nationInfo variable

let nationInfoVis;

let ni_xAxis, ni_yAxis, ni_attributes;
let ni_currentBar, ni_targetBar;

let targetCountryText;

//econvis variable

let ev_lpp_xAxis, ev_lpp_yAxis;
let ev_lpp_currentBar, ev_lpp_targetBar;
let ev_lpp_connectLine;

let ev_rent_currentArea, ev_rent_targetArea;

//svg specification data
let width = 800; 
let height = 400;
let mapMargin = {top: 20, right: 20, bottom: 20, left: 20};
let nationInfoMargin = {top: 20, right: 20, bottom: 20, left: 20};

let econVisMargin = {top: 20, right: 20, bottom: 20, left: 20};
let econVisSize = {width:100, height:100};


let nationInfoSize = {width: 400, height: 200}

//map section functions ---------------------------------------------------

//GENAI---------------------------------
function initMapSection()
{
    mapVis = mapSvg.append("g");

    projection = d3.geoMercator()
    .scale(width / (2 * Math.PI))
    .center([0, 0])
    .translate([width / 2, height / 2]);


     path = d3.geoPath()
    .projection(projection);
}
//------------------------------------------

function updateMapSection()
{
    mapVis.selectAll("path")
    .data(worldData.features)
    .join("path")
    .attr("d", path)
    .attr("class", "country")
    .attr("fill", d=>{
        return genCountryColor(d.properties.name)
    })
    .on('click', function(event, d) { 
        targetCountry = d.properties.name
        update();
    })
}


async function getGeoJsonData()
{
    worldData = await d3.json('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json');
}

function genCountryColor(country)
{
  
    const target = dataPerNation[country];
    const current = dataPerNation[currentCountry];

    if (!target || !current) return "#a6cee3"; 

    return target.lpp > current.lpp ? "#FFFFFF" : "#FEB24C";
}


//-------------------------------------------------------------------

//selectSection functions -----------------------------------------------------------
function initSelectSection()
{

    selectCountry();
    insertIncome();
}

function updateSelectSection()
{

}

function insertIncome()
{
    const incomeInput = document.getElementById("salaryInput");

    incomeInput.addEventListener("change", (e)=>{
        currentIncome = e.target.value;
        update();
    })
}

function selectCountry()
{
    const selectBox = document.getElementById("currentCountrySelector");

    //GENAI-----------------------------
    const countries = Object.keys(dataPerNation).sort();

    countries.forEach(country => {
        const option = document.createElement("option");
        option.value = country;
        option.textContent = country;
        selectBox.appendChild(option);
    });

    selectBox.value = currentCountry;
    //------------------------------------

    selectBox.addEventListener("change", (e) => {
        currentCountry = e.target.value;
        update(); 
    });
}

//---------------------------------------------------------------------


//nationInfo Section functions -----------------------------------------
function initNationInfoSection()
{   
    targetCountryText = document.getElementById("targetcountrytext");

    ni_xAxis = nationInfoSvg.append("g");
    ni_yAxis = nationInfoSvg.append("g");
    ni_currentBar = nationInfoSvg.append("g");
    ni_targetBar = nationInfoSvg.append("g");


    ni_xAxis.attr("transform", `translate(${nationInfoMargin.left}, ${nationInfoMargin.top})`)
    
    ni_yAxis.attr("transform", `translate(${nationInfoMargin.left}, ${nationInfoMargin.top})`)
    ni_currentBar.attr("transform", `translate(${nationInfoMargin.left}, ${nationInfoMargin.top})`);
    ni_targetBar.attr("transform", `translate(${nationInfoMargin.left}, ${nationInfoMargin.top})`);


}

function updateNationInfoSection() {
    // Clear previous chart
    ni_currentBar.selectAll("*").remove();
    ni_targetBar.selectAll("*").remove();
    ni_xAxis.selectAll("*").remove();
    ni_yAxis.selectAll("*").remove();

    // Data preparation
    const features = ['coli', 'rent', 'groceries', 'restaurant', 'lpp'];
    const featureLabels = ["Cost of Living", "Renting price", "Grocery price", "Restaurant Price", "Local Purchasing Power(LPP)"]

    const currentData = features.map(feat => ({
        feature: feat,
        value: dataPerNation[currentCountry][feat]
    }));

    const targetData = features.map(feat => ({
        feature: feat,
        value: targetCountry ? dataPerNation[targetCountry][feat] : 0
    }));

    const baseData = features.map(feat => ({
        feature: feat,
        value: 100
    }));

    // Spider chart configuration
    const width = nationInfoSize.width - nationInfoMargin.left - nationInfoMargin.right;
    const height = nationInfoSize.height - nationInfoMargin.top - nationInfoMargin.bottom;
    const radius = Math.min(width, height) / 2;
    
    // Move the center point
    const g = ni_currentBar
        .attr("transform", `translate(${width/2 + nationInfoMargin.left}, ${height/2 + nationInfoMargin.top})`);

    // Calculate angles for each feature
    const angleSlice = (Math.PI * 2) / features.length;

    // Scale for features
    const rScale = d3.scaleLinear()
        .domain([0, 150])
        .range([0, radius]);

    // Draw the grid lines
    const levels = 5;
    const gridData = [...Array(levels).keys()].map(i => (i + 1) * 30);

    gridData.forEach(level => {
        const gridPath = features.map((_, i) => {
            const angle = angleSlice * i - Math.PI / 2;
            return [
                rScale(level) * Math.cos(angle),
                rScale(level) * Math.sin(angle)
            ];
        });

        g.append("polygon")
            .data([gridPath])
            .attr("class", "grid-line")
            .style("stroke", "#ddd")
            .style("fill", "none")
            .attr("points", d => d.map(p => p.join(",")).join(" "));
    });

    // Draw the axes
    features.forEach((_, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const lineData = [[0, 0], [
            rScale(150) * Math.cos(angle),
            rScale(150) * Math.sin(angle)
        ]];

        g.append("line")
            .attr("x1", lineData[0][0])
            .attr("y1", lineData[0][1])
            .attr("x2", lineData[1][0])
            .attr("y2", lineData[1][1])
            .style("stroke", "#ddd")
            .style("stroke-width", "1px");

        // Add feature labels
        g.append("text")
            .attr("x", rScale(170) * Math.cos(angle))
            .attr("y", rScale(170) * Math.sin(angle))
            .style("text-anchor", "middle")
            .style("font-size", "12px")
            .text(features[i]);
    });

    function drawSpiderPath(data, color, opacity) {
        const points = data.map((d, i) => {
            const angle = angleSlice * i - Math.PI / 2;
            return [
                rScale(d.value) * Math.cos(angle),
                rScale(d.value) * Math.sin(angle)
            ];
        });

        g.append("path")
            .datum(points)
            .attr("d", d => `M ${d.map(p => p.join(",")).join(" L ")} Z`)
            .style("stroke", color)
            .style("fill", color)
            .style("fill-opacity", opacity)
            .style("stroke-width", "2px");
    }

    drawSpiderPath(baseData, "#ddd", 0.1);  
    drawSpiderPath(currentData, "#ff6b6b", 0.5); 
    if(targetCountry) {
        drawSpiderPath(targetData, "#4ecdc4", 0.5); 
    }

    // Add legend
    const legend = g.append("g")
        .attr("transform", `translate(${-width/2 -10}, ${-height/2 + 20})`);

    const legendData = [
        { label: "Base (100)", color: "#ddd" },
        { label: currentCountry, color: "#ff6b6b" }
    ];
    
    if(targetCountry) {
        legendData.push({ label: targetCountry, color: "#4ecdc4" });
    }

    legendData.forEach((d, i) => {
        const legendRow = legend.append("g")
            .attr("transform", `translate(0, ${i * 20})`);
        
        legendRow.append("rect")
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", d.color);
        
        legendRow.append("text")
            .attr("x", 15)
            .attr("y", 10)
            .style("font-size", "12px")
            .text(d.label);
    });

    targetCountryText.innerHTML = targetCountry || "Select a country";
}

//---------------------------------------------------------------------


//economic visualizer section functions -------------------------------------

function initEconVisSection()
{
    //lpp-----------
    ev_lpp_xAxis = initEachEconGraph(lppSvg);
    ev_lpp_yAxis = initEachEconGraph(lppSvg);
    ev_lpp_currentBar = initEachEconGraph(lppSvg);
    ev_lpp_targetBar = initEachEconGraph(lppSvg);
    ev_lpp_connectLine = initEachEconGraph(lppSvg);
    //-------------------

    //rent-----------------
    ev_rent_currentArea = initEachEconGraph(rentSvg);
    ev_rent_targetArea = initEachEconGraph(rentSvg);

    //-------------

    //restaurant-------------
    
    //-------------------
    

}

function initEachEconGraph(group)
{
    return group.append("g").attr("transform", `translate(${econVisMargin.left}, ${econVisMargin.top})`)
}

function updateEconVisSection()
{

}
//---------------------------------------------------------------------------

//framework ------------------------------------------------------------------
function init()
{

//svg change and variable init
    mapSvg = d3.select("#map-svg");
    nationInfoSvg = d3.select("#nationinfo-svg");
    
    lppSvg = d3.select("#lpp-svg");
    rentSvg = d3.select("#rent-svg");
    mealSvg = d3.select("#meal-svg");

    
    mapSvg.attr("width", width + mapMargin.left + mapMargin.right)
    .attr("height", height + mapMargin.top + mapMargin.bottom);

    nationInfoSvg.attr("width", nationInfoSize.width + nationInfoMargin.left + nationInfoMargin.right)
    .attr("height", nationInfoSize.height+ nationInfoMargin.top + nationInfoMargin.bottom);


    lppSvg.attr("width", econVisSize.width + econVisMargin.left + econVisMargin.right)
    .attr("height", econVisSize.height+ econVisMargin.top + econVisMargin.bottom);

    rentSvg.attr("width", econVisSize.width + econVisMargin.left + econVisMargin.right)
    .attr("height", econVisSize.height+ econVisMargin.top + econVisMargin.bottom);

    mealSvg.attr("width", econVisSize.width + econVisMargin.left + econVisMargin.right)
    .attr("height", econVisSize.height+ econVisMargin.top + econVisMargin.bottom);

    
//----------------------------------------


    initMapSection();
    initSelectSection();
    initNationInfoSection();
    initEconVisSection();
    

}


function update()
{
    updateMapSection();
    updateSelectSection();
    updateNationInfoSection();
    updateEconVisSection();
}


//-----------------------------------------------------------------------------



//execution---------------------------------------------------------------------

d3.csv("COLI.csv")
.then(async csvData=>{
    csvData.forEach(d=>{
        d["Rank"] = +d["Rank"];
        d["Cost of Living Index"] = + d["Cost of Living Index"]
        d["Rent Index"] = +d["Rent Index"]
        d["Cost of Living Plus Rent Index"] = +d["Cost of Living Plus Rent Index"]
        d["Groceries Index"] = +d["Groceries Index"]
        d["Restaurant Price Index"] = +d["Restaurant Price Index"]
        d["Local Purchasing Power Index"] = +d["Local Purchasing Power Index"]
  
        dataPerNation[d["Country"]] = {
            rank: d["Rank"],
            coli: d["Cost of Living Index"],
            rent: d["Rent Index"],
            coliAndRent : d["Cost of Living Plus Rent Index"],
            groceries: d["Groceries Index"],
            restaurant: d["Restaurant Price Index"],
            lpp: d["Local Purchasing Power Index"],
          
        }
    })

    
    await getGeoJsonData();
    data = csvData;
    
    init();
    update();
})
