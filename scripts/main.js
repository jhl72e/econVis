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
let ni_currentLine, ni_targetLine;

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
    ni_currentLine = nationInfoSvg.append("g");
    ni_targetLine = nationInfoSvg.append("g");

    ni_attributes = Object.keys(dataPerNation[currentCountry]).filter(function(d) {
        if(d != "coliAndRent" && d != "rank")
        {
            return d;
        }
     });



     console.log(ni_attributes)

    ni_xAxis.attr("transform", `translate(${nationInfoMargin.left}, ${nationInfoMargin.top})`)
    ni_currentLine.attr("transform", `translate(${nationInfoMargin.left}, ${nationInfoMargin.top})`);
    ni_targetLine.attr("transform", `translate(${nationInfoMargin.left}, ${nationInfoMargin.top})`);


}

// function updateNationInfoSection()
// {
//     const xScale = d3.scaleBand()
//     .domain(ni_attributes)
//     .padding(1)
//     .range([nationInfoMargin.left, width - nationInfoMargin.right]);

//     const yScale = d3.scaleLinear()
//     .domain([0,200])
//     .range([height - nationInfoMargin.bottom, nationInfoMargin.top]);

//     nationInfoSvg
//     .selectAll("path")
//     .data(data)
//     .join("path")
//     .attr("d",  ()=>d3.line()(dimensions.map(function(p) { return [x(p), y[p](d[p])]; })))
//     .style("fill", "none")
//     .style("stroke", "#69b3a2")
//     .style("opacity", 0.5)

//     nationInfoSvg.selectAll("axis")
//     // For each dimension of the dataset I add a 'g' element:
//     .data(dimensions)
//     .join("axis")
//     .append("g")
//     // I translate this element to its right position on the x axis
//     .attr("transform", `translate(${nationInfoMargin.left}, ${nationInfoMargin.top})`)
//     // And I build the axis with the call function
//     .each(function(d) { d3.select(this).call(d3.axisLeft().scale(y[d])); })
//     // Add axis title
//     .append("text")
//       .style("text-anchor", "middle")
//       .attr("y", -9)
//       .text(function(d) { return d; })
//       .style("fill", "black")

//     targetCountryText.innerHTML = targetCountry;
// }

function updateNationInfoSection()
{
    const xScale = d3.scalePoint()
        .domain(ni_attributes)
        .range([0, nationInfoSize.width]);

    const yScale = d3.scaleLinear()
        .domain([0, 200])
        .range([nationInfoSize.height, 0]);

    const lineGenerator = d3.line()
        .x(d => xScale(d))
        .y(d => yScale(dataPerNation[currentCountry][d]));

    const targetLineGenerator = d3.line()
        .x(d => xScale(d))
        .y(d => yScale(dataPerNation[targetCountry]?.[d]));

    ni_xAxis
        .attr("transform", `translate(${nationInfoMargin.left}, ${nationInfoSize.height})`)
        .call(d3.axisBottom(xScale));

    ni_yAxis
        .attr("transform", `translate(${nationInfoMargin.left}, 0)`)
        .call(d3.axisLeft(yScale));

    ni_currentLine.selectAll("path")
        .data([ni_attributes])
        .join("path")
        .attr("d", lineGenerator)
        .attr("stroke", "steelblue")
        .attr("fill", "none");

    if (targetCountry && dataPerNation[targetCountry]) {
        ni_targetLine.selectAll("path")
            .data([ni_attributes])
            .join("path")
            .attr("d", targetLineGenerator)
            .attr("stroke", "tomato")
            .attr("fill", "none");
    }


    targetCountryText.innerText = targetCountry || "";
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
