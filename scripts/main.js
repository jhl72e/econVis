let data;
let dataPerNation = {};


let mapSvg;    
let nationInfoSvg;



//country data variables
let currentCountry = "South Korea";
let targetCountry;

//money variables
let currentIncome;


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


//svg specification data
let width = 800; 
let height = 400;
let mapMargin = {top: 20, right: 20, bottom: 20, left: 20}
let nationInfoMargin = {top: 20, right: 20, bottom: 20, left: 20}

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

function updateNationInfoSection()
{

    //GENAI-------------------
    const currentBarData = Object.entries(dataPerNation[currentCountry])
    .filter(([key, _]) => key !== "coliAndRent" && key !== "rank")
    .map(([key, value]) => ({ attribute: key, value: value }));
    //----------------------------


    const xScale = d3.scaleLinear()
    .domain([0, 200])
    .rangeRound([nationInfoMargin.left, nationInfoSize.height - nationInfoMargin.top]);


    const yScale = d3.scaleBand()
    .domain(currentBarData.map(d=>d.attribute))
    .rangeRound([nationInfoMargin.top, nationInfoSize.height - nationInfoMargin.bottom])
    .padding(0.1);


    ni_currentBar.selectAll("rect")
    .data(currentBarData)
    .join("rect")
    .attr("fill",  (d) => d3.schemeRdBu[3][d.value > 0 ? 2 : 0])
    .attr("x", (d)=>xScale(Math.min(d.value, 0)))
    .attr("y", (d)=>yScale(d.attribute))
    .attr("width", (d)=>Math.abs(xScale(d.value))) //여기에 perception 함수 적용 
    .attr("height", yScale.bandwidth());


    

    ni_xAxis
    .attr("transform", `translate(${nationInfoMargin.left}, ${nationInfoMargin.top + nationInfoSize.height})`)
    .call(d3.axisTop(scaleX).ticks(width / 80).tickFormat(tickFormat))
    .call(g => g.selectAll(".tick line").clone()
          .attr("y2", nationInfoSize.height - nationInfoMargin.top - nationInfoMargin.bottom)
          .attr("stroke-opacity", 0.1))
    .call(g => g.select(".domain").remove());

    ni_yAxis
    .attr("transform", `translate(${nationInfoMargin.left}, ${nationInfoMargin.top})`)
    .call(d3.axisLeft(scaleY).tickSize(0).tickPadding(6))
    .call(g => g.selectAll(".tick text").filter((d, i) => data[i].value < 0)
        .attr("text-anchor", "start")
        .attr("x", 6));

    targetCountryText.innerHTML = targetCountry;
}

//---------------------------------------------------------------------


//economic visualizer section functions -------------------------------------

function initEconVisSection()
{

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
    
    mapSvg.attr("width", width + mapMargin.left + mapMargin.right)
    .attr("height", height + mapMargin.top + mapMargin.bottom);

    nationInfoSvg.attr("width", nationInfoSize.width + nationInfoMargin.left + nationInfoMargin.right)
    .attr("height", nationInfoSize.height+ nationInfoMargin.top + nationInfoMargin.bottom);


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
