function stackedhorizontalbar() {

    var _NAME = 'stackedhorizontalbar';

    var _config,
        _dimension,
        _measure,
        _showLegend,
        _legendPosition,
        _showValueAs,
        _valueAsArc,
        _valuePosition,
        _sort,
        _tooltip,
        _showXaxis,
        _showYaxis,
        _showXaxisLabel,
        _showYaxisLabel,
        _xAxisColor,
        _yAxisColor,
        _showGrid,
        _stacked,
        _displayName,
        _measureProp,
        _legendData;


    var _local_svg,
        _Local_data,
        _local_total = 0,
        _local_transition_time = 500,
        _local_transition_map = d3.map(),
        _local_sorted_measure_value = [],
        _local_tooltip;

    var parentWidth,
        parentHeight,
        plotWidth,
        plotHeight;

    var legendSpace = 20,
        axisLabelSpace = 20,
        offsetX = 16,
        offsetY = 3,
        div;

    var filter = false,
        filterData = [];

    var _pie = d3.pie()
        .sort(null);

    var _arc = d3.arc()
        .innerRadius(0);

    var _arcMask = d3.arc();

    var _labelArc = d3.arc();

    var _setConfigParams = function (config) {
        this.dimension(config.dimension);
        this.measure(config.measure);
        this.showLegend(config.showLegend);
        this.legendPosition(config.legendPosition);
        this.showValueAs(config.showValueAs);
        this.valueAsArc(config.valueAsArc);
        this.valuePosition(config.valuePosition);
        this.showXaxis(config.showXaxis);
        this.showYaxis(config.showYaxis);
        this.showXaxisLabel(config.showXaxisLabel);

        this.showYaxisLabel(config.showYaxisLabel);
        this.xAxisColor(config.xAxisColor);
        this.yAxisColor(config.yAxisColor);
        this.displayName(config.displayName);
        this.showYaxis(config.showYaxis);
        this.showXaxisLabel(config.showXaxisLabel);
        this.forEachMeasure(config.forEachMeasure);
        this.legendData(config.forEachMeasure, config.measure);
    }

    var _buildTooltipData = function (datum, chart) {
        var output = "";

        output += "<table><tr>"
            + "<th>" + chart.dimension() + ": </th>"
            + "<td>" + datum.data[_dimension[0]] + "</td>"
            + "</tr><tr>"
            + "<th>" + datum.key + ": </th>"
            + "<td>" + datum.data[datum.key] + "</td>"
            + "</tr></table>";

        return output;
    }

    var onLassoStart = function (lasso, chart) {
        return function () {
            if (filter) {
                lasso.items().selectAll('rect')
                    .classed('not_possible', true)
                    .classed('selected', false);
            }
        }
    }

    var onLassoDraw = function (lasso, chart) {
        return function () {
            filter = true;
            lasso.items().selectAll('rect')
                .classed('selected', false);

            lasso.possibleItems().selectAll('rect')
                .classed('not_possible', false)
                .classed('possible', true);

            lasso.notPossibleItems().selectAll('rect')
                .classed('not_possible', true)
                .classed('possible', false);
        }
    }

    var onLassoEnd = function (lasso, chart) {
        return function () {
            var data = lasso.selectedItems().data();
            if (!filter) {
                return;
            }
            if (data.length > 0) {
                lasso.items().selectAll('rect')
                    .classed('not_possible', false)
                    .classed('possible', false);
            }

            lasso.selectedItems().selectAll('rect')
                .classed('selected', true)

            lasso.notSelectedItems().selectAll('rect');

            var confirm = d3.select('.confirm')
                .style('visibility', 'visible');

            var _filter = [];
            data.forEach(function (d) {
                var obj = new Object();
                var temp = d.data[_dimension[0]];
                var searchObj = _filter.find(o => o[_dimension[0]] === temp);
                if (searchObj == undefined) {
                    obj[_dimension[0]] = d.data[_dimension[0]];
                    for (var index = 0; index < _measure.length; index++) {
                        obj[_measure[index]] = d.data[_measure[index]];
                    }
                    _filter.push(obj)
                }
            });
            if (_filter.length > 0) {
                filterData = _filter;
            }
        }
    }

    var applyFilter = function (chart) {
        return function () {
            if (filterData.length > 0) {
                chart.update(filterData);
            }
        }
    }

    var _handleMouseOverFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {
            d3.select(this).style('cursor', 'pointer')
                .style('cursor', 'pointer')
                .style('fill', COMMON.HIGHLIGHTER);

            if (tooltip) {
                UTIL.showTooltip(tooltip);
                UTIL.updateTooltip.call(tooltip, _buildTooltipData(d, me), container);
            }
        }
    }

    var _handleMouseMoveFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {
            if (tooltip) {
                UTIL.updateTooltip.call(tooltip, _buildTooltipData(d, me), container);
            }
        }
    }

    var _handleMouseOutFn = function (tooltip, container) {
        var me = this;

        return function (d, i) {
            d3.select(this).style('cursor', 'default')
                .style('fill', function (d1, i) {
                    return UTIL.getDisplayColor(_measure.indexOf(d1.key), _measureProp);
                })
                .style('stroke', function (d1, i) {
                    return UTIL.getBorderColor(_measure.indexOf(d1.key), _measureProp);
                });

            if (tooltip) {
                UTIL.hideTooltip(tooltip);
            }
        }
    }

    function chart(selection) {
        _local_svg = selection;

        selection.each(function (data) {
            chart._Local_data = data;
            var margin = {
                top: 0,
                right: 0,
                bottom: 0,
                left: 45
            };

            var div = d3.select(this).node().parentNode;

            var svg = d3.select(this),
                width = div.clientWidth,
                height = div.clientHeight;

            parentWidth = width - 2 * COMMON.PADDING - margin.left;
            parentHeight = (height - 2 * COMMON.PADDING - axisLabelSpace * 2);

            svg.attr('width', width)
                .attr('height', height)


            d3.select(div).append('div')
                .attr('class', 'sort_selection');

            d3.select(div).append('div')
                .attr('class', 'arrow-down');

            var container = svg.append('g')
                .attr('transform', 'translate(' + COMMON.PADDING + ', ' + COMMON.PADDING + ')');

            var legendWidth = 0,
                legendHeight = 0,
                legendBreakCount;

            plotWidth = parentWidth;
            plotHeight = parentHeight;

            if (_showLegend) {
                var stackedhorizontalLegend = LEGEND.bind(chart);

                var result = stackedhorizontalLegend(_legendData, container, {
                    width: parentWidth,
                    height: parentHeight,
                    legendBreakCount: legendBreakCount
                });

                legendWidth = result.legendWidth;
                legendHeight = result.legendHeight;
                legendBreakCount = result.legendBreakCount;

                switch (_legendPosition) {
                    case 'top':
                        plotHeight = parentHeight - legendHeight - axisLabelSpace;
                        break;
                    case 'bottom':
                        plotHeight = parentHeight - legendHeight - axisLabelSpace * 2;
                        break;
                    case 'right':
                    case 'left':
                        plotWidth = parentWidth - legendWidth;
                        break;
                }
            }

            if (_tooltip) {
                tooltip = d3.select(this.parentNode).select('#tooltip');
            }

            chart.drawPlot = function (data) {
                var me = this;
                _Local_data = data;
                var plot = container.append('g')
                    .attr('class', 'stackedhorizontalbar-plot')
                    .classed('plot', true)
                    .attr('transform', function () {
                        if (_legendPosition == 'top') {
                            return 'translate(' + margin.left + ', ' + parseInt(legendSpace * 2 + (20 * parseInt(legendBreakCount))) + ')';
                        } else if (_legendPosition == 'bottom') {
                            return 'translate(' + margin.left + ', 0)';
                        } else if (_legendPosition == 'left') {
                            return 'translate(' + (legendSpace + margin.left + axisLabelSpace) + ', 0)';
                        } else if (_legendPosition == 'right') {
                            return 'translate(' + margin.left + ', 0)';
                        }
                    });


                var x = d3.scaleBand()
                    .rangeRound([0, plotHeight])
                    .padding([0.2])

                var y = d3.scaleLinear()
                    .rangeRound([0, plotWidth]);

                var keys = Object.keys(data[0]);
                keys.splice(keys.indexOf(_dimension[0]), 1);

                for (i = 0; i < data.length; i++) {
                    var t = 0;
                    for (j = 0; j < keys.length; j++) {
                        t = parseInt(t) + parseInt(data[i][keys[j]]);
                    }
                    data[i].total = t;
                }

                x.domain(data.map(function (d) { return d[_dimension[0]]; }));
                y.domain([0, d3.max(data, function (d) {
                    return d.total;
                })]).nice();

                data.map(function (val) {
                    delete val['total'];
                })

                var labelStack = [];
                var stack = plot.append('g')
                    .attr('class', 'stack')
                    .selectAll('g')
                    .data(d3.stack().keys(keys)(data))
                    .enter().append('g')
                    .attr('class', 'stackedhorizontalbar-group');

                var stackedhorizontalbar = stack.selectAll('g')
                    .data(function (d, i) {
                        d.forEach(function (datum) {
                            datum.key = d.key;
                        })
                        return d;
                    })
                    .enter().append('g')
                    .attr('class', 'stackedhorizontalbar');

                var rect = stackedhorizontalbar.append('rect')
                    .style('fill', function (d, i) {
                        return UTIL.getDisplayColor(_measure.indexOf(d.key), _measureProp);
                    })
                    .style('stroke', function (d, i) {
                        return UTIL.getBorderColor(_measure.indexOf(d.key), _measureProp);
                    })
                    .attr("y", function (d) {
                        return x(d.data[_dimension[0]]);
                    })
                    .attr("x", function (d) {
                        return (d[0] < d[1]) ? (y(d[0]) + 1) : (y(d[1]) + 1);
                    })
                    .attr("width", function (d) {
                        return Math.abs(y(d[1]) - y(d[0]));
                    })
                    .attr("height", x.bandwidth())
                    .style('stroke-width', 2)
                    .on('mouseover', _handleMouseOverFn.call(chart, tooltip, svg))
                    .on('mousemove', _handleMouseMoveFn.call(chart, tooltip, svg))
                    .on('mouseout', _handleMouseOutFn.call(chart, tooltip, svg));

                var text = stackedhorizontalbar.append('text')
                    .text(function (d, i) {
                        return UTIL.getFormattedValue(d.data[d.key], UTIL.getValueNumberFormat(_measure.indexOf(d.key), _measureProp));
                    })
                    .attr('x', function (d, i) {
                        return y(d[1]) - 20;
                    })
                    .attr('y', function (d, i) {
                        return x(d.data[_dimension[0]]) + x.bandwidth() / 2;
                    })
                    .attr('dy', function (d, i) {
                        return offsetX / 2;
                    })
                    .style('text-anchor', 'middle')
                    .attr('visibility', function (d, i) {
                        return UTIL.getVisibility(_measureProp[_measure.indexOf(d.key)]["showValues"]);
                    })
                    .attr('visibility', function (d, i) {
                        if (this.getAttribute('visibility') == 'hidden') return 'hidden';
                        var rect = d3.select(this.previousElementSibling).node(),
                            rectWidth = rect.getAttribute('width'),
                            rectHeight = rect.getAttribute('height');

                        if (rectHeight <= parseFloat(d3.select(this).style('font-size').replace('px', ''))) {
                            return 'hidden';
                        }

                        if ((this.getComputedTextLength() + (offsetX / 4)) > parseFloat(rectWidth)) {
                            return 'hidden';
                        }

                        return 'visible';
                    })
                    .style('font-style', function (d, i) {
                        return _measureProp[_measure.indexOf(d.key)]["fontStyle"];
                    })
                    .style('font-weight', function (d, i) {
                        return _measureProp[_measure.indexOf(d.key)]["fontWeight"];
                    })
                    .style('font-size', function (d, i) {
                        return _measureProp[_measure.indexOf(d.key)]['fontSize'] + 'px';
                    })
                    .style('fill', function (d, i) {
                        return _measureProp[_measure.indexOf(d.key)]["textColor"];
                    });

                plot.append("g")
                    .attr("class", "x_axis")
                    .attr("transform", "translate(0," + plotHeight + ")")
                    .call(d3.axisBottom(y))
                    .append("text")
                    .attr("x", plotWidth / 2)
                    .attr("y", 2 * axisLabelSpace)
                    .attr("dy", "0.32em")
                    .attr("fill", "#000")
                    .attr("font-weight", "bold")
                    .style('text-anchor', 'middle')
                    .style('visibility', UTIL.getVisibility(_showXaxisLabel))
                    .text(function () {
                        return _measureProp.map(function (p) { return p.displayName; }).join(', ');
                    });

                plot.append("g")
                    .attr("class", "y_axis")
                    .call(d3.axisLeft(x).ticks(null, "s"))
                    .append("text")
                    .attr("x", plotHeight / 2)
                    .attr("y", 2 * axisLabelSpace)
                    .attr("transform", function (d) { return "rotate(" + 90 + ")"; })
                    .attr("dy", "0.32em")
                    .style('visibility', UTIL.getVisibility(_showYaxisLabel))
                    .attr("font-weight", "bold")
                    .style('text-anchor', 'middle')
                    .text(function () {
                        return _displayName;
                    });

                UTIL.setAxisColor(svg, _yAxisColor, _xAxisColor, _showYaxis, _showXaxis, _showYaxis, _showXaxis);
                var sortButton = container.append('g')
                    .attr('class', 'stackedverticalbar-sort')
                    .attr('transform', function () {
                        return 'translate(0, ' + parseInt((parentHeight - 2 * COMMON.PADDING + 20 + (legendBreakCount * 20))) + ')';
                    })

                var ascendingSort = sortButton.append('svg:text')
                    .attr('fill', '#afafaf')
                    .attr('cursor', 'pointer')
                    .style('font-family', 'FontAwesome')
                    .style('font-size', 12)
                    .attr('transform', function () {
                        return 'translate(' + (parentWidth - 3 * offsetX) + ', ' + 2 * axisLabelSpace + ')';
                    })
                    .style('text-anchor', 'end')
                    .text(function () {
                        return "\uf161";
                    })
                    .on('click', UTIL.toggleSortSelection(me, 'ascending', chart.drawPlot, svg, keys, _Local_data))


                var descendingSort = sortButton.append('svg:text')
                    .attr('fill', '#afafaf')
                    .attr('cursor', 'pointer')
                    .style('font-family', 'FontAwesome')
                    .style('font-size', 12)
                    .attr('transform', function () {
                        return 'translate(' + (parentWidth - 1.5 * offsetX) + ', ' + 2 * axisLabelSpace + ')';
                    })
                    .style('text-anchor', 'end')
                    .text(function () {
                        return "\uf160";
                    })
                    .on('click', UTIL.toggleSortSelection(me, 'descending', chart.drawPlot, svg, keys, _Local_data))

                var resetSort = sortButton.append('svg:text')
                    .attr('fill', '#afafaf')
                    .attr('cursor', 'pointer')
                    .style('font-family', 'FontAwesome')
                    .style('font-size', 12)
                    .attr('transform', function () {
                        return 'translate(' + parentWidth + ', ' + 2 * axisLabelSpace + ')';
                    })
                    .style('text-anchor', 'end')
                    .text(function () {
                        return "\uf0c9";
                    })
                    .on('click', function () {
                        d3.select(me.parentElement).select('.stackedhorizontalbar-plot').remove();
                        chart.drawPlot.call(me, _Local_data);
                    });
                d3.select('.confirm')
                    .on('click', applyFilter(chart));

                var lasso = d3.lasso()
                    .hoverSelect(true)
                    .closePathSelect(true)
                    .closePathDistance(100)
                    .items(stackedhorizontalbar)
                    .targetArea(svg);

                lasso.on('start', onLassoStart(lasso, chart))
                    .on('draw', onLassoDraw(lasso, chart))
                    .on('end', onLassoEnd(lasso, chart));

                svg.call(lasso);
            }
            chart.drawPlot.call(this, data);
        });
    }

    chart._legendInteraction = function (event, data) {
        var clustered = d3.selectAll('g.stackedhorizontalbar')
            .filter(function (d) {
                return d.key === data;
            });

        if (event === 'mouseover') {
            clustered.select('rect')
                .style('fill', COMMON.HIGHLIGHTER);
        } else if (event === 'mousemove') {
            // do something
        } else if (event === 'mouseout') {
            clustered.select('rect')
                .style('fill', function (d, i) {
                    return UTIL.getDisplayColor(_measure.indexOf(d.key), _measureProp);
                });
        } else if (event === 'click') {

        }
    }
    chart.update = function (data) {

        var exampleData = data,
            svg = _local_svg;
        filterData = [];

        var x = d3.scaleBand()
            .rangeRound([0, plotHeight])
            .padding([0.2])

        var y = d3.scaleLinear()
            .rangeRound([0, plotWidth]);

        var keys = Object.keys(data[0]);
        keys.splice(keys.indexOf(_dimension[0]), 1);

        for (i = 0; i < data.length; i++) {
            var t = 0;
            for (j = 0; j < keys.length; j++) {
                t = parseInt(t) + parseInt(data[i][keys[j]]);
            }
            data[i].total = t;
        }

        x.domain(data.map(function (d) { return d[_dimension[0]]; }));
        y.domain([0, d3.max(data, function (d) {
            return d.total;
        })]).nice();

        data.map(function (val) {
            delete val['total'];
        })

        var labelStack = [];
        var plot = svg.select('.plot')

        var stack = svg.select('g.stack').selectAll('g.stackedhorizontalbar-group')
            .data(d3.stack().keys(keys)(data))

        stack.enter().append('g')
            .attr('class', 'stackedhorizontalbar-group');

        stack.exit().remove();

        var stackedhorizontalbarGroup = plot.select('g.stack').selectAll('g.stackedhorizontalbar-group');

        var stackedhorizontalbar = stackedhorizontalbarGroup.selectAll('g.stackedhorizontalbar')
            .data(function (d, i) {
                d.forEach(function (datum) {
                    datum.key = d.key;
                })
                return d;
            });


        stackedhorizontalbar.select('rect')
            .attr("y", function (d) {
                return x(d.data[_dimension[0]]);
            })
            .attr("x", function (d) {
                return (d[0] < d[1]) ? (y(d[0]) + 1) : (y(d[1]) + 1);
            })
            .attr("width", function (d) {
                return Math.abs(y(d[1]) - y(d[0]));
            })
            .classed('selected', false)
            .classed('possible', false)
            .attr("height", x.bandwidth())
            .style('stroke-width', 2)

        stackedhorizontalbar.select('text')
            .text(function (d, i) {
                return UTIL.getFormattedValue(d.data[d.key], UTIL.getValueNumberFormat(_measure.indexOf(d.key), _measureProp));
            })
            .attr('x', function (d, i) {
                return y(d[1]) - 20;
            })
            .attr('y', function (d, i) {
                return x(d.data[_dimension[0]]) + x.bandwidth() / 2;
            })
            .attr('dy', function (d, i) {
                return offsetX / 2;
            })
            .style('text-anchor', 'middle')
            .attr('visibility', function (d, i) {
                return UTIL.getVisibility(_measureProp[_measure.indexOf(d.key)]["showValues"]);
            })
            .attr('visibility', function (d, i) {
                if (this.getAttribute('visibility') == 'hidden') return 'hidden';
                var rect = d3.select(this.previousElementSibling).node(),
                    rectWidth = rect.getAttribute('width'),
                    rectHeight = rect.getAttribute('height');

                if (rectHeight <= parseFloat(d3.select(this).style('font-size').replace('px', ''))) {
                    return 'hidden';
                }

                if ((this.getComputedTextLength() + (offsetX / 4)) > parseFloat(rectWidth)) {
                    return 'hidden';
                }

                return 'visible';
            })

        plot.select('.x_axis')
            .transition()
            .duration(1000)
            .call(d3.axisBottom(y));

        plot.select('.y_axis')
            .transition()
            .duration(1000)
            .call(d3.axisLeft(x).ticks(null, "s"));

        stackedhorizontalbar.exit()
            .transition()
            .duration(1000)
            .remove();

        UTIL.setAxisColor(svg, _yAxisColor, _xAxisColor, _showYaxis, _showXaxis);
    }
    chart._getName = function () {
        return _NAME;
    }

    chart.config = function (value) {
        if (!arguments.length) {
            return _config;
        }
        _config = value;
        _setConfigParams.call(chart, _config);
        return chart;
    }

    chart.dimension = function (value) {
        if (!arguments.length) {
            return _dimension;
        }
        _dimension = value;
        return chart;
    }

    chart.measure = function (value) {
        if (!arguments.length) {
            return _measure;
        }
        _measure = value;
        _pie.value(function (d) { return d[_measure[0]]; });
        return chart;
    }

    chart.showLegend = function (value) {
        if (!arguments.length) {
            return _showLegend;
        }
        _showLegend = value;
        return chart;
    }

    chart.legendPosition = function (value) {
        if (!arguments.length) {
            return _legendPosition;
        }
        _legendPosition = value;
        return chart;
    }

    chart.showValueAs = function (value) {
        if (!arguments.length) {
            return _showValueAs;
        }
        _showValueAs = value;
        return chart;
    }

    chart.valueAsArc = function (value) {
        if (!arguments.length) {
            return _valueAsArc;
        }
        _valueAsArc = value;
        return chart;
    }

    chart.valuePosition = function (value) {
        if (!arguments.length) {
            return _valuePosition;
        }
        _valuePosition = value;
        return chart;
    }

    chart.sort = function (value) {
        if (!arguments.length) {
            return _sort;
        }
        _sort = value;
        return chart;
    }

    chart.filterData = function (value) {
        if (!arguments.length) {
            return filterData;
        }
        filterData = value;
        return chart;
    }


    chart.tooltip = function (value) {
        if (!arguments.length) {
            return _tooltip;
        }
        _tooltip = value;
        return chart;
    }

    chart.showXaxis = function (value) {
        if (!arguments.length) {
            return _showXaxis;
        }
        _showXaxis = value;
        return chart;
    }

    chart.showYaxis = function (value) {
        if (!arguments.length) {
            return _showYaxis;
        }
        _showYaxis = value;
        return chart;
    }

    chart.showXaxisLabel = function (value) {
        if (!arguments.length) {
            return _showXaxisLabel;
        }
        _showXaxisLabel = value;
        return chart;
    }

    chart.showYaxisLabel = function (value) {
        if (!arguments.length) {
            return _showYaxisLabel;
        }
        _showYaxisLabel = value;
        return chart;
    }

    chart.xAxisColor = function (value) {
        if (!arguments.length) {
            return _xAxisColor;
        }
        _xAxisColor = value;
        return chart;
    }

    chart.yAxisColor = function (value) {
        if (!arguments.length) {
            return _yAxisColor;
        }
        _yAxisColor = value;
        return chart;
    }

    chart.showGrid = function (value) {
        if (!arguments.length) {
            return _tooltip;
        }
        _showGrid = value;
        return chart;
    }

    chart.stacked = function (value) {
        if (!arguments.length) {
            return _tooltip;
        }
        _stacked = value;
        return chart;
    }

    chart.displayName = function (value) {
        if (!arguments.length) {
            return _tooltip;
        }
        _displayName = value;
        return chart;
    }

    chart.forEachMeasure = function (value) {
        if (!arguments.length) {
            return _measureProp;
        }
        _measureProp = value;
        return chart;
    }

    chart.legendData = function (measureConfig, measureName) {
        _legendData = {
            measureConfig: measureConfig,
            measureName: measureName
        }
        return _legendData;
    }
    chart.Local_data = function () {
        if (!arguments.length) {
            return _Local_data;
        }
        _Local_data = value;
        return chart;
    }
    return chart;
}