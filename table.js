function table() {

    var _NAME = 'table';

    var _config,
        _dimension,
        _measure,
        _measureProp,
        _dimensionProp;


    var _setConfigParams = function (config) {
        this.dimension(config.dimension);
        this.measure(config.measure);
        this.forEachMeasure(config.forEachMeasure);
        this.forEachDimension(config.forEachDimension);

    }

    var getIcon = function (index) {
        if (getIconName(index) !== "") {
            return '<span style="display:block; text-align:' + getIconPosition(index) + ';"><i class="' + getIconName(index) + '" aria-hidden="true"></i></span>';
        }

        return "";
    }
    var getIconPosition = function (index) {
        return _measureProp[index]['iconPosition'];
    }
    var getIconName = function (index) {
        return _measureProp[index]['iconName'];
    }

    function chart(selection) {
        _local_svg = selection;

        selection.each(function (data) {

            var margin = {
                top: 0,
                right: 0,
                bottom: 0,
                left: 45
            };

            var div = d3.select(this);

            var width = +div.attr('width');
            var height = +div.attr('height');
            var disv = d3.select("#donut");
            $('#donut').css('width', width)
                .css('height', height).css('overflow-y', 'hidden').css('overflow-x', 'auto');

            var table = $('<table id="viz_table" class="display nowrap" style="width:100%"></table>').addClass('table table-condensed table-hover');

            var thead = "<thead><tr>",
                tbody = "<tbody>";

            _dimension.forEach(function (item, index) {
                var title = _dimensionProp[index]["displayName"],
                    style = {
                        'text-align': _dimensionProp[index]["textAlignment"],
                        'background-color': '#f1f1f1',
                        'font-weight': 'bold'
                    };

                style = JSON.stringify(style);
                style = style.replace(/","/g, ';').replace(/["{}]/g, '');

                if (title != "") {
                    thead += "<th style=\"" + style + "\">" + title + "</th>";
                } else {
                    thead += "<th style=\"" + style + "\">" + item + "</th>";
                }
            });

            _measure.forEach(function (item, index) {
                var title = _measureProp[index]["displayName"],
                    style = {
                        'text-align': _measureProp[index]["textAlignment"],
                        'background-color': '#f1f1f1',
                        'font-weight': 'bold'
                    };

                style = JSON.stringify(style);
                style = style.replace(/","/g, ';').replace(/["{}]/g, '');

                if (title != "") {
                    thead += "<th style=\"" + style + "\">" + title + "</th>";
                } else {
                    thead += "<th style=\"" + style + "\">" + item + "</th>";
                }
            });

            thead += "</tr></thead>";
            table.append(thead);

            data.forEach(function (d) {
                tbody += "<tr>";
                _dimensionProp.forEach(function (item, index) {
                    var style = {
                        'text-align': _dimensionProp[index]["textAlignment"],
                        'background-color': _dimensionProp[index]["cellColor"],
                        'font-style': _dimensionProp[index]["fontStyle"],
                        'font-weight': _dimensionProp[index]["fontWeight"],
                        'font-size': _dimensionProp[index]["fontSize"],
                        'color': _dimensionProp[index]["textColor"]
                    };

                    style = JSON.stringify(style);
                    style = style.replace(/","/g, ';').replace(/["{}]/g, '');
                    tbody += "<td style=\"" + style + "\">" + d[_dimension[index]] + "</td>";
                });

                _measureProp.forEach(function (item, index) {
                    var style = {
                        'text-align': _measureProp[index]["textAlignment"],
                        'background-color': _measureProp[index]["cellColor"],
                        'font-style': _measureProp[index]["fontStyle"],
                        'font-weight': _measureProp[index]["fontWeight"],
                        'font-size': _measureProp[index]["fontSize"],
                        'color': _measureProp[index]["textColor"]
                    };

                    style = JSON.stringify(style);
                    style = style.replace(/","/g, ';').replace(/["{}]/g, '');
                    tbody += "<td style=\"" + style + "\">" + getIcon(index) +UTIL.getFormattedValue(d[_measure[index]], UTIL.getValueNumberFormat(index,_measureProp)) + "</td>";
                });
                tbody += "</tr>";
            });

            tbody += "</tbody>";
            table.append(tbody);

            $('#donut').append(table);

            $('#donut').find('#viz_table').dataTable({
                scrollY: height - 150,
                scrollX: true,
                scrollCollapse: true,
                ordering: true,
                info: true,
              
                pagingType: "full_numbers",
                aLengthMenu: [[2, 5, 10, 15, 20, 25, -1], [2, 5, 10, 15, 20, 25, "All"]],
                iDisplayLength: 20,
                bDestroy: true,
                dom: '<"table-header">rt<"table-footer"lp>',
                fnDrawCallback: function (oSettings) {
                    if (oSettings._iDisplayLength > oSettings.fnRecordsDisplay()) {
                        $(oSettings.nTableWrapper).find('.dataTables_paginate').hide();
                        $(oSettings.nTableWrapper).find('.dataTables_info').hide();
                    }
                }
            });
        }

        );
    }
    /**
     * Builds the html data for the tooltip
     *
     * @param {object} datum Datum forming the arc
     * @param {function} chart Pie chart function
     * @return {string} String encoded HTML data
     */
    chart._legendInteraction = function (event, data) {
        var arcGroup = d3.selectAll('g.arc')
            .filter(function (d) {
                return d.data[_dimension[0]] === data[_dimension[0]];
            });

        if (event === 'mouseover') {
            arcGroup.select('path')
                .style('fill', COMMON.HIGHLIGHTER);
        } else if (event === 'mousemove') {
            // do something
        } else if (event === 'mouseout') {
            arcGroup.select('path')
                .style('fill', function (d, i) {
                    return COMMON.COLORSCALE(d.data[_dimension[0]]);
                });
        } else if (event === 'click') {

        }
    }

    chart._getName = function () {
        return _NAME;
    }

    var _mergeForTransition = function (fData, sData) {
        var secondSet = d3.set();

        sData.forEach(function (d) {
            secondSet.add(d[_dimension[0]]);
        });

        var onlyFirst = fData.filter(function (d) {
            return !secondSet.has(d[_dimension[0]]);
        })
            .map(function (d) {
                var obj = {};

                obj[_dimension[0]] = d[_dimension[0]];
                obj[_measure[0]] = 0;

                return obj;
            });

        return d3.merge([sData, onlyFirst])
            .sort(function (a, b) {
                return a[_measure[0]] > b[_measure] ? _sort
                    : a[_measure[0]] < b[_measure] ? -_sort
                        : 0;
            })
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


    chart.forEachMeasure = function (value) {
        if (!arguments.length) {
            return _measureProp;
        }
        _measureProp = value;
        return chart;
    }

    chart.forEachDimension = function (value) {
        if (!arguments.length) {
            return _dimensionProp;
        }
        _dimensionProp = value;
        return chart;
    }

    return chart;
}