import React, { Component } from 'react';
import '../App.css';
import * as d3 from 'd3';

const width = 1200;
const height = 500;
const margin = { top: 100, left: 15, bottom: 20, right: 150 };
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

class HeatMap extends Component {
    loadData = () => {
        d3.json("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json")
            .then(data => {
                this.setState({
                    dataset: data
                });
                this.drawChart(this.state.dataset);
            });
    }
    drawChart = (data) => {
        const colorDataset = ["#313695", "#4575b4", "#74add1", "#abd9e9", "#e0f3f8", "#ffffbf", "#fee090", "#fdae61", "#f46d43", "#d73027", "#a50026"];

        const legendWidth = 400;
        const variance = data.monthlyVariance.map((d) => { return d.variance });
        const minVariance = data.baseTemperature + Math.min.apply(null, variance);
        const maxVariance = data.baseTemperature + Math.max.apply(null, variance);

        const varianceDomain = (min, max, count) => {
            const arr = [];
            const step = (max - min) / count;
            const base = min;
            for (let i = 1; i < count; i++) {
                arr.push(base + i * step);
            }
            return arr;
        }

        const svg = d3.select("svg");

        const xScale = d3.scaleLinear()
            .domain(d3.extent(data.monthlyVariance, (d) => { return d.year }))
            .range([0, innerWidth + 20]);

        const yScale = d3.scaleTime()
            .domain([0, 11])
            .range([0, innerHeight - margin.top]);

        const legendThreshold = d3.scaleThreshold()
            .domain(varianceDomain(minVariance, maxVariance, (colorDataset.length)))
            .range(colorDataset);

        const legendXScale = d3.scaleLinear()
            .domain([minVariance, maxVariance])
            .range([0, legendWidth]);

        const g = svg.append("g")
            .attr("transform", "translate(100, " + innerHeight + ")");

        const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d")).ticks(20);

        g.append("g")
            .attr("id", "x-axis")
            .call(xAxis)
            .attr("transform", "translate(0, 0)")
            .append("text")
            .attr("x", innerWidth)
            .attr("dy", "2.5em")
            .attr("text-anchor", "end")
            .attr("stroke", "black")
            .text("Years");

        const yAxis = d3.axisLeft(yScale).tickFormat((month) => {
            return d3.timeFormat("%B")(new Date().setUTCMonth(month))
        });

        g.append("g")
            .attr("id", "y-axis")
            .call(yAxis)
            .attr("transform", "translate(0," + -280 + ")")
            .append("text")
            .attr("y", 2)
            .attr("transform", "rotate(-90)")
            .attr("dy", "-5.5em")
            .attr("text-anchor", "end")
            .attr("stroke", "black")
            .text("Months");

        const legendXAxis = d3.axisBottom(legendXScale)
            .tickValues(legendThreshold.domain())
            .tickFormat(d3.format(".1f"));

        const legend = g.append("g")
            .attr("class", "legend")
            .call(legendXAxis)
            .attr("transform", "translate(0, 100)");

        legend.selectAll("rect")
            .data(legendThreshold.range().map((color) => {
                const dd = legendThreshold.invertExtent(color);
                if (dd[0] == null) dd[0] = legendXScale.domain()[0]
                if (dd[1] == null) dd[1] = legendXScale.domain()[1]
                return dd;
            }))
            .enter()
            .append("rect")
            .attr("fill", (d) => { return legendThreshold(d[0]) })
            .attr("x", d => legendXScale(d[0]))
            .attr("y", -20)
            .attr("width", 37)
            .attr("height", 20)
            .attr("stroke", "black");

        legend.append("g")
            .attr("transform", "translate(0, 100)")
            .call(legendXAxis);

        g.selectAll("rect")
            .data(data.monthlyVariance)
            .enter()
            .append("rect")
            .attr("fill", d => legendThreshold(data.baseTemperature + d.variance))
            .attr("x", (d) => xScale(d.year) + 2)
            .attr("y", (d) => yScale(d.month) - innerHeight + 50)
            .attr("width", d => 4)
            .attr("height", (innerHeight - margin.top + 24) / 12)
            .attr("data-month", d => d3.timeFormat("%B")(new Date().setUTCMonth(d.month - 1)))
            .attr("data-year", d => d.year)
            .attr("data-temp", d => (data.baseTemperature + d.variance))
            .attr("class", "cell")
            .on('mouseover', (d, i) => {
                tooltip.transition().duration(100)
                    .style("opacity", 0.9)
                    .style("left", (d3.event.pageX + 15) + "px")
                    .style("top", (d3.event.pageY - 15) + "px");
                tooltip
                    .attr("data-month", d.month)
                    .attr("data-year", d.year);

                tooltip.html(d.year + " - " + d3.timeFormat("%B")(new Date().setUTCMonth(d.month - 1)) + "<br/>"
                    + d3.format(".1f")(data.baseTemperature + d.variance) + "<br/>" + (d.variance))
            });

        const tooltip = d3.select("body")
            .append("div")
            .attr("id", "tooltip");

        svg.append("text")
            .attr("id", "title")
            .attr("x", width / 2)
            .attr("y", (margin.top / 2))
            .attr("text-anchor", "middle")
            .attr("font-size", "30")
            .text("Monthly Global Land-Surface Temperature");

        svg.append("text")
            .attr("id", "description")
            .attr("x", width / 2)
            .attr("y", (margin.top - 30))
            .attr("text-anchor", "middle")
            .attr("font-size", "15")
            .text(Math.min.apply(null, data.monthlyVariance.map((d) => { return d.year })) + " - " +
                Math.max.apply(null, data.monthlyVariance.map((d) => { return d.year })) + ": base temperature " +
                data.baseTemperature);
    }

    componentDidMount() {
        this.loadData();
    }

    render() {
        return (
            <div>
                <svg width={width} height={height} padding="20px" ></svg>
            </div>
        )
    }
}

export default HeatMap;