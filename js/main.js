/* eslint-disable no-undef */
const width = 1200;
const height = 800;

const years = [1930, 1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010];

let yearIndex = 0;

function getColorFromName(name) {
  return `#${md5(name).slice(0, 6)}`;
}

const svg = d3.select('body').append('svg')
  .attr('width', width)
  .attr('height', height);

const projection = d3.geo.mercator()
  .scale(1000)
  .center([-52, -15])
  .translate([width / 2, height / 2]);

const path = d3.geo.path()
  .projection(projection);

const renderMap = (countryContour, states, stateMap) => {
  svg.selectAll('*').remove();

  svg.append('path')
    .datum(countryContour)
    .attr('d', path)
    .attr('class', 'country_contour');

  svg.selectAll('.state')
    .data(states.features)
    .enter()
    .append('path')
    .attr('class', (d) => `state ${d.id}`)
    .attr('d', path)
    .style('fill', (d) => getColorFromName(stateMap[d.id][0]))
    .style('stroke', 'black')
    .style('stroke-linejoin', 'round')
    .style('stroke-width', 3);

  svg.selectAll('.state_label')
    .data(states.features)
    .enter().append('text')
    .attr('class', (d) => `state_label ${d.id}`)
    .attr('transform', (d) => `translate(${path.centroid(d)})`)
    .attr('dy', '.35em')
    .text((d) => stateMap[d.id][0]);
};

const ready = (error, file1, file2, file3) => {
  if (error) throw error;

  const states = topojson.feature(file1, file1.objects.estados);
  const countryContour = topojson.mesh(file1, file1.objects.estados);

  const backButton = document.getElementById('back');
  const nextButton = document.getElementById('next');
  const radioMale = document.getElementById('male');
  const radioFemale = document.getElementById('female');
  const yearTitle = document.getElementById('year');

  yearTitle.innerText = years[yearIndex];
  backButton.disabled = yearIndex <= 0;
  nextButton.disabled = yearIndex >= 10;

  let file;

  if (radioMale.checked === true) {
    file = file2;
  } else if (radioFemale.checked === true) {
    file = file3;
  }

  radioMale.onclick = () => {
    file = file2;
    renderMap(countryContour, states, file[years[yearIndex]]);
  };

  radioFemale.onclick = () => {
    file = file3;
    renderMap(countryContour, states, file[years[yearIndex]]);
  };

  backButton.onclick = () => {
    yearIndex -= 1;
    backButton.disabled = yearIndex <= 0;
    nextButton.disabled = yearIndex >= 8;
    yearTitle.innerText = years[yearIndex];
    renderMap(countryContour, states, file[years[yearIndex]]);
  };

  nextButton.onclick = () => {
    yearIndex += 1;
    backButton.disabled = yearIndex <= 0;
    nextButton.disabled = yearIndex >= years.length - 1;
    yearTitle.innerText = years[yearIndex];
    renderMap(countryContour, states, file[years[yearIndex]]);
  };

  renderMap(countryContour, states, file[years[yearIndex]]);
};

d3_queue.queue()
  .defer(d3.json, './br-states.json')
  .defer(d3.json, './scripts/male-data.json')
  .defer(d3.json, './scripts/female-data.json')
  .await(ready);
