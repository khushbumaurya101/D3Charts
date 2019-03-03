function clusteredverticalbar() {

    var _NAME = 'clusteredverticalbar';

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
        _legendData,
        drawPlot;


    var _local_svg,
        _Local_data;
        
    var parentWidth,
        parentHeight,
        plotWidth,
        plotHeight;

    var legendSpace = 20,
        axisLabelSpace = 20,
        offsetX = 16,
        offsetY = 3,
        div;


    var threshold = [];
    var filter = false,
        filterData = [];

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
            + "<td>" + datum[chart.dimension()] + "</td>"
            + "</tr><tr>"
            + "<th>" + datum["measure"] + ": </th>"
            + "<td>" + datum[datum["measure"]] + "</td>"
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
            if (data.length > 0) {
                var keys = Object.keys(data[0]);
                keys.splice(keys.indexOf(_dimension[0]), 1);
                data.forEach(function (d) {
                    var obj = new Object();
                    obj[_dimension[0]] = d[_dimension[0]];
                    for (var index = 0; index < keys.length; index++) {
                        obj[keys[index]] = d[keys[index]];
                    }

                    _filter.push(obj)
                });
            }

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
            d3.select(this)
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
                    return UTIL.getDisplayColor(_measure.indexOf(d1.measure), _measureProp);
                })
                .style('stroke', function (d1, i) {
                    return UTIL.getBorderColor(_measure.indexOf(d1.measure), _measureProp);
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

            div = d3.select(this).node().parentNode;

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

            var str = UTIL.createAlert($(div).attr('id'), _measure);
            $(div).append(str);

            var container = svg.append('g')
                .attr('transform', 'translate(' + COMMON.PADDING + ', ' + COMMON.PADDING + ')');

            $(document).on('click', 'svg', function (e) {
                if ($("#myonoffswitch").prop('checked') == false) {
                    var element = e.target
                    if (element.tagName == "svg") {
                        $('#Modal_' + $(div).attr('id') + ' .measure').val('')
                        $('#Modal_' + $(div).attr('id') + ' .threshold').val('')
                        $('#Modal_' + $(div).attr('id') + ' .measure').attr('disabled', false)
                        $('#Modal_' + $(div).attr('id')).modal('toggle');
                    }
                }
            })

            $(document).on('click', '#Modal_' + $(div).attr('id') + ' .ThresholdSubmit', function (e) {
                var newValue = $('#Modal_' + $(div).attr('id') + ' .threshold').val();
                var obj = new Object()
                obj.measure = $('#Modal_' + $(div).attr('id') + ' .measure').val()
                obj.threshold = newValue;
                threshold.push(obj);
                $('#Modal_' + $(div).attr('id')).modal('toggle');
            })

            var legendWidth = 0,
                legendHeight = 0;

            plotWidth = parentWidth;
            plotHeight = parentHeight;

            var legendBreakCount;

            if (_showLegend) {
                var clusteredverticalbarLegend = LEGEND.bind(chart);

                var result = clusteredverticalbarLegend(_legendData, container, {
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
                filterData = [];
                var confirm = d3.select('.confirm')
                    .style('visibility', 'hidden');
                var x0 = d3.scaleBand()
                    .rangeRound([0, plotWidth])
                    .paddingInner(0.1)
                    .padding([0.1]);

                var x1 = d3.scaleBand()
                    .padding(0.2);

                var y = d3.scaleLinear()
                    .rangeRound([plotHeight, 0]);

                var tickLength = d3.scaleLinear()
                    .domain([22, 34])
                    .range([4, 6]);

                var plot = container.append('g')
                    .attr('class', 'clusteredverticalbar-plot')
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

                var keys = Object.keys(data[0]);
                keys.splice(keys.indexOf(_dimension[0]), 1);

                x0.domain(data.map(function (d) { return d[_dimension[0]]; }));
                x1.domain(keys).rangeRound([0, x0.bandwidth()]);
                y.domain([0, d3.max(data, function (d) {
                    return d3.max(keys, function (key) {
                        return parseInt(d[key]);
                    });
                })]).nice();

                var cluster = plot.selectAll('.cluster')
                    .data(data)
                    .enter().append('g')
                    .attr('class', 'cluster')
                    .attr('transform', function (d) {
                        return 'translate(' + x0(d[_dimension[0]]) + ', 0)';
                    });

                var labelStack = []
                var clusteredverticalbar = cluster.selectAll('g.clusteredverticalbar')
                    .data(function (d) {
                        return keys.filter(function (m) {
                            return labelStack.indexOf(m) == -1;
                        }).map(function (m) {
                            var obj = {};
                            obj[_dimension[0]] = d[_dimension[0]];
                            obj[m] = d[m];
                            obj['dimension'] = _dimension[0];
                            obj['measure'] = m;
                            return obj;
                        });
                    })
                    .enter().append('g')
                    .attr('class', 'clusteredverticalbar');

                var rect = clusteredverticalbar.append('rect')
                    .attr("x", function (d) {
                        return x1(d.measure);
                    })
                    .attr("y", function (d) {
                        return y(d[d.measure]);
                    })
                    .attr('class', 'bar')
                    .attr("width", x1.bandwidth())
                    .attr("height", function (d) {
                        return plotHeight - y(d[d.measure]);
                    })
                    .style('fill', function (d, i) {
                        return UTIL.getDisplayColor(_measure.indexOf(d.measure), _measureProp);
                    })
                    .style('stroke', function (d, i) {
                        return UTIL.getBorderColor(_measure.indexOf(d.measure), _measureProp);
                    })
                    .style('stroke-width', 2)
                    .on('mouseover', _handleMouseOverFn.call(chart, tooltip, svg, _measureProp))
                    .on('mousemove', _handleMouseMoveFn.call(chart, tooltip, svg, _measureProp))
                    .on('mouseout', _handleMouseOutFn.call(chart, tooltip, svg, _measureProp))
                    .on('click', function (d) {
                        if ($("#myonoffswitch").prop('checked') == false) {
                            $('#Modal_' + $(div).attr('id') + ' .measure').val(d.measure);
                            $('#Modal_' + $(div).attr('id') + ' .threshold').val('');
                            $('#Modal_' + $(div).attr('id') + ' .measure').attr('disabled', true);;
                            $('#Modal_' + $(div).attr('id')).modal('toggle');
                        }
                        else {
                            var confirm = d3.select('.confirm')
                                .style('visibility', 'visible');
                            var _filter = chart._Local_data.filter(function (d1) {
                                return d[_dimension[0]] === d1[_dimension[0]]
                            })
                            var rect = d3.select(this);
                            if (rect.classed('selected')) {
                                rect.classed('selected', false);
                                filterData.map(function (val, i) {
                                    if (val[_dimension[0]] == d[_dimension[0]]) {
                                        filterData.splice(i, 1)
                                    }
                                })
                            } else {
                                rect.classed('selected', true);
                                var isExist = filterData.filter(function (val) {
                                    if (val[_dimension[0]] == d[_dimension[0]]) {
                                        return val
                                    }
                                })
                                if (isExist.length == 0) {
                                    filterData.push(_filter[0]);
                                }
                            }
                        }
                    })

                var text = clusteredverticalbar.append('text')
                    .text(function (d, i) {
                        return UTIL.getFormattedValue(d[d.measure], UTIL.getValueNumberFormat(i, _measureProp));
                    })
                    .attr("y", function (d, i) {
                        return y(d[d.measure]) - _measureProp[i]['fontSize'];
                    })
                    .attr("x", function (d) {
                        return x1(d.measure);
                    })
                    .attr('dy', function (d, i) {
                        return -offsetX / 10;
                    })
                    .attr('dx', function (d, i) {
                        return x1.bandwidth() / 2;
                    })
                    .style('text-anchor', 'middle')
                    .attr('visibility', function (d, i) {
                        return UTIL.getVisibility(_measureProp[i]["showValues"]);
                    })
                    .style('font-style', function (d, i) {
                        return _measureProp[i]["fontStyle"];
                    })
                    .style('font-weight', function (d, i) {
                        return _measureProp[i]["fontWeight"];
                    })
                    .style('font-size', function (d, i) {
                        return _measureProp[i]['fontSize'] + 'px';
                    })
                    .style('fill', function (d, i) {
                        return _measureProp[i]["textColor"];
                    })
                    .text(function (d, i) {
                        var barWidth = (1 - x0.padding()) * plotWidth / (data.length - 1);
                        barWidth = (1 - x1.padding()) * barWidth / keys.length;
                        return UTIL.getTruncatedTick(d3.select(this).text(), barWidth, tickLength);
                    });


                plot.append("g")
                    .attr("class", "x_axis")
                    .attr("transform", "translate(0," + plotHeight + ")")
                    .call(d3.axisBottom(x0))
                    .append("text")
                    .attr("x", plotWidth / 2)
                    .attr("y", 2 * axisLabelSpace)
                    .attr("dy", "0.32em")
                    .attr("fill", "#000")
                    .attr("font-weight", "bold")
                    .style('text-anchor', 'middle')
                    .style('visibility', UTIL.getVisibility(_showXaxisLabel))
                    .text(function () {
                        return _displayName;
                    });

                plot.append("g")
                    .attr("class", "y_axis")
                    .call(d3.axisLeft(y).ticks(null, "s"))
                    .append("text")
                    .attr("x", plotHeight / 2)
                    .attr("y", 2 * axisLabelSpace)
                    .attr("transform", function (d) { return "rotate(" + 90 + ")"; })
                    .attr("dy", "0.32em")
                    .style('visibility', UTIL.getVisibility(_showYaxisLabel))
                    .attr("font-weight", "bold")
                    .style('text-anchor', 'middle')
                    .text(function () {
                        return _measureProp.map(function (p) { return p.displayName; }).join(', ');
                    });

                svg.select('g.clusteredverticalbar-sort').remove();

                var sortButton = container.append('g')
                    .attr('class', 'clusteredverticalbar-sort')
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
                    .on('click', UTIL.toggleSortSelection(me, 'descending', chart.drawPlot, svg, keys, _Local_data));

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
                        d3.select(me.parentElement).select('.clusteredverticalbar-plot').remove();
                        chart.drawPlot.call(me, _Local_data);
                    });

                d3.select('.confirm')
                    .on('click', applyFilter(chart));

                svg.select('g.lasso').remove()
                var lasso = d3.lasso()
                    .hoverSelect(true)
                    .closePathSelect(true)
                    .closePathDistance(100)
                    .items(cluster)
                    .targetArea(svg);

                lasso.on('start', onLassoStart(lasso, chart))
                    .on('draw', onLassoDraw(lasso, chart))
                    .on('end', onLassoEnd(lasso, chart));

                svg.call(lasso);

                UTIL.setAxisColor(svg, _yAxisColor, _xAxisColor, _showYaxis, _showXaxis, _showYaxis, _showXaxis);
            }
            chart.drawPlot.call(this, data);
        });

    }

    chart._legendInteraction = function (event, data) {
        var clustered = d3.selectAll('g.clusteredverticalbar')
            .filter(function (d) {
                return d.measure === data;
            });

        if (event === 'mouseover') {
            clustered.select('rect')
                .style('fill', COMMON.HIGHLIGHTER);
        } else if (event === 'mousemove') {
            // do something
        } else if (event === 'mouseout') {
            clustered.select('rect')
                .style('fill', function (d, i) {
                    return UTIL.getDisplayColor(_measure.indexOf(d.measure), _measureProp);
                });
        } else if (event === 'click') {

        }
    }

    chart._getName = function () {
        return _NAME;
    }

    chart.update = function (data) {

        var exampleData = data,
            svg = _local_svg;
        filterData = [];

        var x0 = d3.scaleBand()
            .rangeRound([0, plotWidth])
            .paddingInner(0.1)
            .padding([0.1]);

        var x1 = d3.scaleBand()
            .padding(0.2);

        var y = d3.scaleLinear()
            .rangeRound([plotHeight, 0]);

        var tickLength = d3.scaleLinear()
            .domain([22, 34])
            .range([4, 6]);

        var keys = Object.keys(data[0]);
        keys.splice(keys.indexOf(_dimension[0]), 1);

        x0.domain(data.map(function (d) { return d[_dimension[0]]; }));
        x1.domain(keys).rangeRound([0, x0.bandwidth()]);
        y.domain([0, d3.max(data, function (d) {
            return d3.max(keys, function (key) {
                return parseInt(d[key]);
            });
        })]).nice();

        var plot = svg.select('.plot')
        var cluster = svg.selectAll("g.cluster")
            .data(data);

        cluster.enter().append('g')
            .attr('class', 'cluster')
            .attr('transform', function (d) {
                return 'translate(' + x0(d[_dimension[0]]) + ', 0)';
            });

        cluster.exit()
            .transition()
            .duration(1000)
            .remove();

        cluster = plot.selectAll('g.cluster');
        var labelStack = [];

        var clusteredverticalbar = cluster.selectAll('g.clusteredverticalbar')
            .data(function (d) {
                return keys.filter(function (m) {
                    return labelStack.indexOf(m) == -1;
                }).map(function (m) {
                    var obj = {};
                    obj[_dimension[0]] = d[_dimension[0]];
                    obj[m] = d[m];
                    obj['dimension'] = _dimension[0];
                    obj['measure'] = m;
                    return obj;
                });
            });

        clusteredverticalbar.select('rect')
            .attr("x", function (d) {
                return x1(d.measure);
            })
            .attr("y", function (d) {
                return y(d[d.measure]);
            })
            .attr('class', 'bar')
            .attr("width", x1.bandwidth())
            .attr("height", function (d) {
                return plotHeight - y(d[d.measure]);
            })

        clusteredverticalbar.select('text')
            .text(function (d, i) {
                return UTIL.getFormattedValue(d[d.measure], UTIL.getValueNumberFormat(i, _measureProp));
            })
            .attr("y", function (d, i) {
                return y(d[d.measure]) - _measureProp[i]['fontSize'];
            })
            .attr("x", function (d) {
                return x1(d.measure);
            })
            .attr('dy', function (d, i) {
                return -offsetX / 10;
            })
            .attr('dx', function (d, i) {
                return x1.bandwidth() / 2;
            })
            .text(function (d, i) {
                var barWidth = (1 - x0.padding()) * plotWidth / (data.length - 1);
                barWidth = (1 - x1.padding()) * barWidth / keys.length;
                return UTIL.getTruncatedTick(d3.select(this).text(), barWidth, tickLength);
            });


        d3.selectAll('g.cluster')
            .attr('transform', function (d) {
                return 'translate(' + x0(d[_dimension[0]]) + ', 0)';
            });

        plot.select('.x_axis')
            .transition()
            .duration(1000)
            .call(d3.axisBottom(x0));

        plot.select('.y_axis')
            .transition()
            .duration(1000)
            .call(d3.axisLeft(y).ticks(null, "s"));

        UTIL.setAxisColor(svg, _yAxisColor, _xAxisColor, _showYaxis, _showXaxis);

        for (var index = 0; index < threshold.length; index++) {
            data.filter(function (val) {
                for (var j = 0; j < keys.length; j++) {
                    if (threshold[index]["measure"] == keys[j]) {
                        if (val[keys[j]] > threshold[0]["threshold"]) {
                            alert('threshold value :' + threshold[0]["threshold"] + " measure: " + keys[j]);
                        }
                    }
                }
            });
        }



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