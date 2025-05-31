let data;
let mapInfo = {};

let svg;    
let map;


//current and target nation
let currentCountry = "South Korea";
let targetCountry;


//map variable
let path;
let projection;
let worldData;

//select variable

//nationInfo variable

//econvis variable


//svg specification data
let width = 800; 
let height = 400;
let margin = {top: 20, right: 20, bottom: 20, left: 20}


//map section functions ---------------------------------------------------

//GENAI---------------------------------
function initMapSection()
{
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
    map.selectAll("path")
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
  
    const target = mapInfo[country];
    const current = mapInfo[currentCountry];

    if (!target || !current) return "#a6cee3"; 

    return target.lpp > current.lpp ? "#FFFFFF" : "#FEB24C";
}


//-------------------------------------------------------------------

//selectSection functions -----------------------------------------------------------
function initSelectSection()
{
    selectCountry();
}

function updateSelectSection()
{

}

function selectCountry()
{
    const selectBox = document.getElementById("currentCountrySelector");

    const countries = Object.keys(mapInfo).sort();

    countries.forEach(country => {
        const option = document.createElement("option");
        option.value = country;
        option.textContent = country;
        selectBox.appendChild(option);
    });

    selectBox.value = currentCountry;

    selectBox.addEventListener("change", (e) => {
        currentCountry = e.target.value;
        update(); 
    });
}

//---------------------------------------------------------------------


//nationInfo Section functions -----------------------------------------
function initNationInfoSection()
{

}

function updateNationInfoSection()
{

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
    svg = d3.select("#map-svg");
    map = svg.append("g");

    svg.attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);
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
  
        mapInfo[d["Country"]] = {
            coli: d["Cost of Living Index"],
            lpp: d["Local Purchasing Power Index"],
            rank: d["Rank"]
        }
    })

    
    await getGeoJsonData();
    data = csvData;
    
    init();
    update();
})
