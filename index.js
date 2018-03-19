const apiUrl = 'https://raw.githubusercontent.com/DealPete/forceDirected/master/countries.json';
const tooltip = document.getElementsByClassName('tooltip')[0];

const plotData = (data) => {
  const margin = {
    top: 20,
    right: 20,
    bottom: 10,
    left: 100
  };
  const width = Math.max((((window.innerWidth / 100) * 80) - margin.right - margin.left), 700);
  const height = ((window.innerHeight / 100) * 80) - margin.bottom - margin.top;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const colors = ['#fff5eb', '#fee6ce', '#fdd0a2', '#fdae6b', '#fd8d3c', '#f16913', '#d94801', '#a63603', '#7f2704'];
  const x = d3.scaleTime().range([0, width]);
  const y = d3.scaleTime().range([0, height]);
  const baseTemp = data.baseTemperature;
  const monthlyVariance = data.monthlyVariance;
  const years = ((year) => year.filter((y, i) => year.indexOf(y) === i))(monthlyVariance.map(mv => mv.year));
  const variances = monthlyVariance.map(mv => mv.variance);
  const gridWidth = width / years.length;
  const gridHeight = height / months.length;
  const legendElementSize = 50;
  const minVariance = d3.min(variances);
  const maxVariance = d3.max(variances);
  const startYear = d3.min(years);
  const endYear = d3.max(years);
  const colorScale = d3.scaleQuantile()
    .domain([minVariance + baseTemp, maxVariance + baseTemp])
    .range(colors);
  x.domain([new Date(startYear, 0), new Date(endYear, 0)]);
  y.domain([new Date(0, 0, 1), new Date(0, 11, 31)]);

  const svg = d3.select('svg')
    .attr('width', width + margin.left + margin.right + 100)
    .attr('height', height + margin.top + margin.bottom + 100)
    .append('g')
    .attr('transform',
      `translate(${margin.left}, ${margin.top})`);

  svg.append('g')
    .attr('class', 'axis')
    .attr('transform',
      `translate(0, ${height})`)
    .call(d3.axisBottom(x).ticks(20).tickFormat(d3.timeFormat('%Y')));

  svg.append('g')
    .attr('class', 'axis')
    .call(d3.axisLeft(y).tickFormat(d3.timeFormat('%B')));

  svg.selectAll('.items')
    .data(monthlyVariance)
    .enter()
    .append('rect')
    .attr('x', d => (d.year - startYear) * gridWidth)
    .attr('y', d => (d.month - 1) * gridHeight)
    .attr('rx', 0)
    .attr('ry', 0)
    .attr('width', gridWidth)
    .attr('height', gridHeight)
    .style('fill', d => colorScale(d.variance + baseTemp))
    .on('mouseover', d => {
      tooltip.classList.remove('hidden');
      tooltip.innerHTML = `${months[d.month-1]}, ${d.year}<br />Temp: ${(d.variance + baseTemp).toFixed(3)} &deg;C<br />Variance: ${d.variance} &deg;C`;
    })
    .on('mouseout', d => {
      tooltip.classList.add('hidden');
    })
    .exit();

  const legend = svg.selectAll(".legend")
    .data([0].concat(colorScale.quantiles()), (d) => d);

  const legend_g = legend.enter().append("g")
    .attr("class", "legend");
  legend_g.append("rect")
    .attr("x", (d, i) => legendElementSize * i)
    .attr("y", height + 40)
    .attr("width", legendElementSize)
    .attr("height", 30)
    .style("fill", (d, i) => colors[i]);

  legend_g.append("text")
    .attr("class", "mono")
    .text((d) => d.toFixed(2))
    .attr("x", (d, i) => legendElementSize * i)
    .attr("y", height + 80 );

  legend.exit();

}

const plot = (data) => {
  const width = Math.max((((window.innerWidth / 100) * 80) - margin.right - margin.left), 700);
  const height = ((window.innerHeight / 100) * 80) - margin.bottom - margin.top;
  const svg = d3.select('svg');  
}

const fetchData = () => {
  return fetch(apiUrl)
    .then(response => {
      return response.json();
    });
};

const fetchAndPlot = async () => {
  try {
    const response = await fetchData();   
    console.log(response);
    plot(response); 
  } catch (e) {
    console.error(e);
  }
}

fetchAndPlot();