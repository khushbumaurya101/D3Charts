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
    
    var getPivotedDimension = function () {
        var result = [];

        _dimensionProp.forEach(function (dp, i) {
            if (dp.isPivoted) {
                result.push(_dimension[i]);
            }
        });

        return result;
    }

    var getUnPivotedDimension = function () {
        var result = [];

        _dimensionProp.forEach(function (dp, i) {
            if (!dp.isPivoted) {
                result.push(_dimension[i]);
            }
        });

        return result;
    }

    var getValueNumberFormat = function (index) {
        var si = _measureProp[index]['numberFormat'],
            nf = getNumberFormatter(si);

        return nf;
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
    var getDisplayName = function (value, isDimension) {
        if (isDimension) {
            return _dimensionProp.filter(function (item) {
                return item['dimension'] == value;
            })[0]['displayName'];
        }
        return _measureProp.filter(function (item) {
            return item['measure'] == value;
        })[0]['displayName'];
    }

    var getCellColor = function (value, isDimension) {
        if (isDimension) {
            return _dimensionProp.filter(function (item) {
                return item['dimension'] == value;
            })[0]['cellColor'];
        }
        return _measureProp.filter(function (item) {
            return item['measure'] == value;
        })[0]['cellColor'];
    }

    var getFontStyle = function (value, isDimension) {
        if (isDimension) {
            return _dimensionProp.filter(function (item) {
                return item['dimension'] == value;
            })[0]['fontStyle'];
        }
        return _measureProp.filter(function (item) {
            return item['measure'] == value;
        })[0]['fontStyle'];
    }

    var getFontWeight = function (value, isDimension) {
        if (isDimension) {
            return _dimensionProp.filter(function (item) {
                return item['dimension'] == value;
            })[0]['fontWeight'];
        }
        return _measureProp.filter(function (item) {
            return item['measure'] == value;
        })[0]['fontWeight'];
    }

    var getFontSize = function (value, isDimension) {
        if (isDimension) {
            return _dimensionProp.filter(function (item) {
                return item['dimension'] == value;
            })[0]['fontSize'] + 'px';
        }
        return _measureProp.filter(function (item) {
            return item['measure'] == value;
        })[0]['fontSize'] + 'px';
    }

    var getTextColor = function (value, isDimension) {
        if (isDimension) {
            return _dimensionProp.filter(function (item) {
                return item['dimension'] == value;
            })[0]['textColor'];
        }
        return _measureProp.filter(function (item) {
            return item['measure'] == value;
        })[0]['textColor'];
    }

    var getTextAlignment = function (value, isDimension) {
        if (isDimension) {
            return _dimensionProp.filter(function (item) {
                return item['dimension'] == value;
            })[0]['textAlignment'];
        }
        return _measureProp.filter(function (item) {
            return item['measure'] == value;
        })[0]['textAlignment'];
    }

    var getValueNumberFormat = function (value) {
        var si = _measureProp.filter(function (item) {
            return item['measure'] == value;
        })[0]['numberFormat'],
            nf = UTIL.getNumberFormatter(si);

        return nf;
    }

    var getPivotedDimension = function () {
        var me = this,
            result = [];

        _dimensionProp.forEach(function (dp, i) {
            if (dp.isPivoted) {
                result.push(_dimension[i]);
            }
        });

        return result;
    }

    var getUnPivotedDimension = function () {
        var me = this,
            result = [];

        _dimensionProp.forEach(function (dp, i) {
            if (!dp.isPivoted) {
                result.push(_dimension[i]);
            }
        });

        return result;
    }

    var getUniqueData = function (data, pivoted_dimension) {
        var result = [];

        data.forEach(function (d) {
            if (result.indexOf(d[pivoted_dimension]) == -1) {
                result.push(d[pivoted_dimension]);
            }
        });

        return result;
    }

    var getColspanValue = function (mapper, index) {
        var arr = mapper.values().slice(index),
            multiplier = 1;

        arr.forEach(function (v) {
            multiplier *= v.length;
        });

        return multiplier;
    }

    var getCloneFactor = function (mapper, index) {
        var arr = mapper.values(),
            multiplier = _dimensionProp.length;

        for (var i = 0; i < index; i++) {
            multiplier *= arr[i].length;
        }

        return multiplier;
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
            var disv = d3.select("#pivottable");

            $('#pivottable').css('width', width)
                .css('height', height).css('overflow-y', 'hidden').css('overflow-x', 'auto');

            var nester = d3.nest(),
                pivotedDimension = getPivotedDimension();

            var unpivotedDimension = getUnPivotedDimension();

            unpivotedDimension.forEach(function (dim) {
                nester = nester.key(function (d) {
                    return d[dim];
                })
            });

            nester.rollup(function (values) {
                var _sorter = function (x, y, i) {
                    if (typeof (pivotedDimension[i]) === 'undefined') {
                        return 0;
                    }

                    return x[pivotedDimension[i]] < y[pivotedDimension[i]]
                        ? -1 : x[pivotedDimension[i]] > y[pivotedDimension[i]] ? 1 : _sorter(x, y, i + 1);
                }

                var sortedValues = values.sort(function (x, y) {
                    return _sorter(x, y, 0);
                });

                sortedValues = values;

                var leafNode = function (data, measure, value) {
                    var leafDim = "";

                    pivotedDimension.forEach(function (pd) {
                        leafDim += "_" + data[pd];
                    });

                    return {
                        name: measure + leafDim,
                        value: value
                    };
                }

                var result = [];

                _measure.forEach(function (m) {
                    var temp = sortedValues.map(function (d) {
                        return leafNode(d, m, d[m]);
                    });

                    result = Array.prototype.concat(result, temp);
                });

                return result;
            });

            var nestedData = nester.entries(data),
                pivotedData = [];

            var getGeneratedPivotData = function (nestedData, depth, obj) {
                nestedData.forEach(function (kv) {
                    var a = kv.key;
                    obj = (depth !== 0) ? (jQuery.extend(true, {}, obj) || {}) : {};
                    obj[unpivotedDimension[depth]] = a;

                    if (kv.value) {
                        kv.value.forEach(function (d) {
                            obj[d.name] = d.value;
                        });
                        pivotedData.push(obj);
                    } else {
                        getGeneratedPivotData(kv.values, depth + 1, obj);
                    }
                });
            }
            getGeneratedPivotData(nestedData, 0);

            var mapper = d3.map();

            pivotedDimension.forEach(function (pd) {
                mapper.set(pd, getUniqueData(data, pd));
            });

            var table = $('<table id="viz_pivot-table" class="display nowrap" style="width:100%"></table>').addClass('table table-condensed table-hover');

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


            var createHeaders = function (iterator, key, depth) {
                var row = "<tr>",
                    content = "",
                    output = "";

                iterator.forEach(function (item) {
                    var style = {
                        'text-align': getTextAlignment(key, true),
                        'background-color': getCellColor(key, true),
                        'font-style': getFontStyle(key, true),
                        'font-weight': getFontWeight(key, true),
                        'font-size': getFontSize(key, true),
                        'color': getTextColor(key, true)
                    };

                    style = JSON.stringify(style);
                    style = style.replace(/","/g, ';').replace(/["{}]/g, '');

                    content += "<th style=\"" + style + "\" colspan=\"" + getColspanValue(mapper, depth + 1) + "\">" + item + "</th>";
                });

                for (var i = 0; i < getCloneFactor(mapper, depth); i++) {
                    output += content;
                }

                if (depth == (pivotedDimension.length - 1)) {
                    var temp = "";

                    unpivotedDimension.forEach(function (upd) {
                        var style = {
                            'text-align': getTextAlignment(upd, true),
                            'background-color': '#f7f7f7',
                            'font-weight': 'bold'
                        };

                        style = JSON.stringify(style);
                        style = style.replace(/","/g, ';').replace(/["{}]/g, '');

                        temp += "<th style=\"" + style + "\">" + upd + "</th>";
                    });

                    output = temp + output;
                }

                row += output + "</tr>";
                return row;
            }

            mapper.entries().forEach(function (entry, index) {
                thead += createHeaders(entry.value, entry.key, index);
            });

            thead += "</thead>";

            var temp = mapper.values();

            var getGeneratedRecord = function (content, parent, depth, datum) {
                if (typeof (temp[depth]) == 'object') {
                    temp[depth].forEach(function (item) {
                        parent.push(item);
                        content = getGeneratedRecord(content, parent, depth + 1, datum);
                    });
                } else {
                    var style = {
                        'text-align': getTextAlignment(parent[0]),
                        'background-color': getCellColor(parent[0]),
                        'font-style': getFontStyle(parent[0]),
                        'font-weight': getFontWeight(parent[0]),
                        'font-size': getFontSize(parent[0]),
                        'color': getTextColor(parent[0])
                    };

                    style = JSON.stringify(style);
                    style = style.replace(/","/g, ';').replace(/["{}]/g, '');

                    content += "<td style=\"" + style + "\">" + ((datum[parent.join('_')] !== undefined) ? getValueNumberFormat(parent[0])(datum[parent.join('_')]) : "-") + "</td>";
                }

                parent.pop();
                return content;
            }

            var createEntries = function (datum) {
                var content = "";

                unpivotedDimension.forEach(function (upd) {
                    var style = {
                        'text-align': getTextAlignment(upd, true),
                        'background-color': getCellColor(upd, true),
                        'font-style': getFontStyle(upd, true),
                        'font-weight': getFontWeight(upd, true),
                        'font-size': getFontSize(upd, true),
                        'color': getTextColor(upd, true)
                    };

                    style = JSON.stringify(style);
                    style = style.replace(/","/g, ';').replace(/["{}]/g, '');

                    content += "<td style=\"" + style + "\">" + datum[upd] + "</td>";
                });

                _measure.forEach(function (m) {
                    content = getGeneratedRecord(content, [m], 0, datum);
                });

                return content;
            }

            pivotedData.forEach(function (pd) {
                tbody += "<tr>" + createEntries(pd) + "</tr>";
            });

            tbody += "</tbody></table>";

            table.append((thead + tbody));

            $('#pivottable').append(table);

            $('#pivottable').find('#viz_pivot-table').dataTable({
                scrollY: height - 50,
                scrollX: true,
                scrollCollapse: true,
                ordering: true,
                info: true,
                searching: false,
                'sDom': 't'
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