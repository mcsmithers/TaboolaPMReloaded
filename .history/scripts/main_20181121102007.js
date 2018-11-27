// // Document Ready so jQuery does its thing for us
$(document).ready(function () {
    /****************************************************
     *Get the setups ready for the apis
     ****************************************************/
    // // Setup Date Pickers
    var today = new Date();
    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    $('#start-date').fdatepicker({
        initialDate: (yesterday.getFullYear()) + '-' + (yesterday.getMonth() + 1) + '-' + (yesterday.getDate()),

        format: 'yyyy-mm-dd',
        disableDblClickSelection: true,
        leftArrow: '<<',
        rightArrow: '>>',
        closeIcon: 'X',
        endDate: yesterday
    });

    $('#end-date').fdatepicker({
        initialDate: (yesterday.getFullYear()) + '-' + (yesterday.getMonth() + 1) + '-' + (yesterday.getDate()),
        format: 'yyyy-mm-dd',
        disableDblClickSelection: true,
        leftArrow: '<<',
        rightArrow: '>>',
        closeIcon: 'X',
        endDate: yesterday
    });


    /**************************************************** 
     * Get the report data from all APIs
     ******************************************************/
    var startDate;
    var startDateString;
    var endDate;
    var endDateString;
    var dateRange;

    // // Calculate Date Range
    startDateString = $('#start-date').val().replace(new RegExp("-", "g"), '-');
    startDate = new Date(startDateString);
    endDateString = $('#end-date').val().replace(new RegExp("-", "g"), '-');
    endDate = new Date(endDateString);
    console.log("Original start date is ", startDateString);
    console.log("Original end date is ", endDateString);
    var startDateSelect = $('#start-date').val();
    var endDateSelect = $('#end-date').val();

    $("body").find("*").attr("disabled", "disabled");
    $("body").find("a").click(function (e) {
        e.preventDefault();
    });
    $('#error-box').hide();


    console.log("Incoming netsphere data...");

    // // For date changes, we need to get those and send them through all the endpoints as args
    const getNetsphere = (startDateSelect, endDateSelect) => $.ajax({
            type: "GET",
            url: "https://tapstone.com/tools/includes/netsphereData.php?startDate=" + startDateSelect + "&endDate=" + endDateSelect,
            data: {},
            dataType: "json"
        })
        .then(response => {
            // console.log(response);

            const netsphere = response.map(function (value, key) {
                const subId = value.Subid;
                const revenue = value.Net_Revenue;
                const date = value.Date;
                // // Splitting the subid from netsphere to get the subid and offer id for the new table
                const splitter = subId.split("_");
                const affiliateId = splitter[0];
                const offerId = splitter[1];
                var affId_offId;
                if (splitter[2] !== undefined) {
                    const suffix = splitter[2];
                    affId_offId = affiliateId + '_' + offerId;
                } else {
                    affId_offId = affiliateId + '_' + offerId;
                }

                // // Now putting this into something we can actually use
                const entry = new Object();
                entry.affiliateId = affiliateId;
                entry.offerId = offerId;
                entry.affId_offId = affId_offId;
                entry.date = date;
                entry.revenue = revenue;
                return entry;
            });
            // console.log("Netsphere object data looks like...");
            // console.log(netsphere);
            if (netsphere.length == 0) {
                $('#netsphereStatus').html('Not available yet');
                document.getElementById("netsphereStatus").style.color = "red";

            } else {
                $('#netsphereStatus').html('Ready');
                document.getElementById("netsphereStatus").style.color = "green";
            }
            return netsphere;
        }).then(netsphere => netsphere
            .reduce(
                (accumulator, currentValue) => {
                    // console.log(accumulator);
                    // console.log(curr);
                    const duplicatedElement = accumulator.find(element => (
                        currentValue.hasOwnProperty('affId_offId') &&
                        element.hasOwnProperty('affId_offId') &&
                        currentValue.affId_offId === element.affId_offId &&
                        currentValue.date === element.date
                    ));

                    if (duplicatedElement) {
                        duplicatedElement.revenue += currentValue.revenue;

                        // console.log(duplicatedElement.affId_offId + " is a dupe with rev " + duplicatedElement.revenue);
                        // console.log(currentValue.affId_offId + " is current with  rev that is " + currentValue.revenue);
                    } else {
                        accumulator.push(Object.assign({}, currentValue));
                    }

                    return accumulator;
                }, []
            )
        ).then(summedRevenues => {
            console.log('here is netsphere...');
            // console.log(JSON.stringify(summedRevenues));
            console.log(summedRevenues);
            return summedRevenues;
        }).fail(failFunction);


    $("body").find("*").attr("disabled", "disabled");
    $("body").find("a").click(function (e) {
        e.preventDefault();
    });

    console.log("Incoming data from HasOffers api...");

    const getTune = (startDateSelect, endDateSelect) => $.ajax({
            type: "GET",
            url: "https://tsh.api.hasoffers.com/Apiv3/json?NetworkToken=NETXqfUQYBBISOBfs6ixG8BeFg5sKe&Target=Report&Method=getStats&fields[]=Affiliate.company&fields[]=Stat.revenue&fields[]=Stat.offer_id&fields[]=Stat.conversions&fields[]=Stat.date&fields[]=Stat.affiliate_id&fields[]=Offer.name&sort[Stat.revenue]=desc&limit=1000000&page=1&filters[Stat.goal_id][conditional]=EQUAL_TO&filters[Stat.goal_id][values]=0&filters[Stat.revenue][conditional]=GREATER_THAN&filters[Stat.revenue][values]=0&" + "&data_start=" + startDateSelect + "&data_end=" + endDateSelect,
            data: {},
            dataType: "json",
        })
        .then(response => {
            tuneData = response.response.data.data;
            // console.log(tuneData);

            const tune = tuneData.map(function (value, key) {
                const affiliateId = value.Stat.affiliate_id;
                const offerId = value.Stat.offer_id;
                const revenue = value.Stat.revenue;
                const affiliate = value.Affiliate.company;
                const offer = value.Offer.name;
                const date = value.Stat.date;
                const actions = value.Stat.conversions;
                const entry = new Object();
                entry.affiliate = affiliate;
                entry.offer = offer;
                if (entry.affiliateId != undefined) {
                    entry.affiliateId = affiliateId;
                }
                entry.offerId = offerId;
                if (entry.affiliateId != undefined || entry.offerId != undefined) {
                    entry.affId_offId = affiliateId + '_' + offerId;
                }
                entry.affiliateId = affiliateId;
                entry.offerId = offerId;
                entry.date = date;
                entry.actions = actions;
                entry.revenue = revenue;
                return entry;
            })
            console.log("Tune object looks like...");
            console.log(tune);
            // console.log(JSON.stringify(tune));
            return tune;
        }).fail(failFunction);

    // // Params needed for backend to make the call for us
    const account = "tapstone";
    const xmlhttp = new XMLHttpRequest();
    var requestStatus;
    var request = "https://tapstone.com/tools/includes/taboolaReportRequest.php?account=";

    // // Failure function in case something is broken
    function failFunction(response) {
        console.log("ERROR: ")
        console.log(response)
        $('#errorContainer').html('Oh no! Something broke. <br/><b>Error: ' + response + '</b>.  Try refreshing the page.');
        $('#errorContainer').css('display', 'block');
        $('#error-box').css('display', 'block');
        document.getElementById("errorContainer").style.color = "red";
    }

    $("body").find("*").attr("disabled", "disabled");
    $("body").find("a").click(function (e) {
        e.preventDefault();
    });
    console.log("Taboola report data incoming...");

    // // Now to make this perform well, let's setup async tasks... I also want to refactor to be more es6 later so performance is optimized


    const getTaboola = () => $.ajax({
            type: "GET",
            url: request + account + '&start_date=' + startDateSelect + '&end_date=' + endDateSelect,
            data: {},
            dataType: "json"
        })
        .then(response => {

            taboolaReportData = response.data.results;

            // console.log(taboolaReportData);
            const taboola = taboolaReportData.map(function (value, key) {
                // // Slicing off the time so we only use the date
                const date = value.date.slice(0, 10);
                const campaign = value.campaign;
                const name = value.campaign_name;
                const clicks = value.clicks;
                // const actions = value.cpa_actions_num;
                const cost = value.spent;
                const splitter = name.split("_");
                const affId = splitter[0].slice(-4);
                // // Getting rid of the entries without ids since they won't match anything
                const affiliateId = affId.replace(/[^0-9]/g, '');
                const offerId = splitter[1];
                const entry = new Object();
                entry.affiliateId = affiliateId;
                entry.offerId = offerId;
                if (entry.affiliateId !== undefined || entry.offerId !== undefined) {
                    entry.affId_offId = affiliateId + '_' + offerId;
                } else if (entry.affiliateId === undefined || entry.offerId === undefined) {
                    console.log("non-numeric affiliate id detected " + affiliateId);
                }
                entry.date = date;
                // entry.affId_offId = affId_offId;
                entry.cost = cost;
                entry.campaign = campaign;
                entry.clicks = clicks;
                // entry.actions = Number(actions);
                entry.name = name;
                return entry;
            });

            console.log("Taboola Data object looks like...");
            // Look out for 7395, 7397, 7399, and 7401
            console.log(taboola);
            // console.log(JSON.stringify(taboola));
            return taboola;
        }).fail(failFunction);

    /***********************************************************
     * Mutate the objects to make one bigger object based 
     * on matching values and perform math to get new vals with es6
     ************************************************************/

    function mergeData(...args) {
        //Putting up a loading message for table while this runs
        //     // This is the big object with everything in it for all the apis
        $("body").find("*").attr("disabled", "disabled");
        $("body").find("a").click(function (e) {
            e.preventDefault();
        });

        let fullCollection = [];

        args.forEach(arg => {
            fullCollection = fullCollection.concat(arg)
        })

        const comparator = (arrVal, othVal) => (
            arrVal.hasOwnProperty('affId_offId') &&
            othVal.hasOwnProperty('affId_offId') && arrVal.affId_offId === othVal.affId_offId && arrVal.date === othVal.date
        );
        // // This gives us over all entries from all apis and compares side-by-side

        // // Start out with an empty array to populate that will act as the accumulator
        // CurrentValue is the element of the iteration
        console.log("Preparing data for merge...");

        const merge = (accumulator, currentValue) => {
            // // Check to make sure the ids are the same in each object
            // // Trying to find the current value of the accumulator
            const existing = accumulator.find(element =>
                comparator(element, currentValue)
            );
            // // This will try to find the currentValue in the accumulator array

            const customizer = (existing, currentValue) => _.isUndefined(existing) ? currentValue : existing;

            if (existing !== undefined) {
                _.assignWith(existing, currentValue, customizer);
            } else {
                // // If a value found, it will merge into the existing object
                accumulator.push(currentValue);
            }
            return accumulator;
            // // Returns the accumulator to the next iteration of merge
        };
        // // Get the whole collection and then turn into the full data object
        const merged = fullCollection.reduce(merge, []);

        console.log("Time to merge the stuff from each API...");
        // console.log(JSON.stringify(merged));
        // // We get to see where everything is joined with the matching ids

        return merged;
    }

    function performCleanupAndCalcs(merged) {
        console.log(merged);

        merged = merged.map(element => {
            // First let's deal with undefined
            const name = element.name;
            const date = element.date;
            const affId_offId = element.affId_offId;
            const affiliate = element.affiliate;
            const offer = element.offer;
            const clicks = element.clicks;
            const actions = element.actions;
            const cost = element.cost;
            const revenue = Number.parseFloat(element.revenue).toFixed(2);
            const profit = revenue - cost;
            const profitMargin = (profit / revenue) * 100;
            const cpc = cost / clicks;
            const rpc = revenue / clicks;
            const rpa = revenue / actions;


            return {
                date,
                affId_offId,
                clicks,
                actions,
                cost,
                revenue,
                name,
                affiliate,
                offer,
                profit,
                profitMargin,
                cpc,
                rpc,
                rpa
            };
        });

        // // Now that we have what we need, let's filter out the inactive accounts from the affiliates and offers that are blank
        merged = merged.filter(({
            affiliate,
            cost
        }) => !(affiliate === '' && affiliate == null && cost === 0 && cost === NaN && cost === '' && cost == undefined && cost == null && affiliate == undefined));



        console.log("Detail rows data");
        console.log(merged);
        return merged;
    }


    function buildTableBodyEntries(merged) {
        $('body').css('background-image', 'none');

        // console.log('The final data will get sent to a table here');
        // console.log(merged);
        $('.loader').remove();

        merged = merged.filter(({
            cost,
            affiliate
        }) => !(cost == undefined || cost == null || affiliate == null));

        //         // Time to make the summary
        const columnHeaderMap = {
            Date: "date",
            AffiliateId_OfferId: "affId_offId",
            Cost: "cost",
            Revenue: "revenue",
            CPC: "cpc",
            RPC: "rpc",
            RPA: "rpa",
            Profit: "profit",
            PM: "profitMargin",
            Campaign: "name",
            Offer: "offer",
            Affiliate: "affiliate"
        };

        const headers = Object.keys(columnHeaderMap);

        const columns = headers.map(header => columnHeaderMap[header]);

        const getHeaderWithColumn = column => {
            for (let header in columnHeaderMap) {
                if (columnHeaderMap[header] === column) {
                    return header;
                }
            }
        };

        const pmColorScale = d3.scaleThreshold()
            .domain([0, 20])
            .range(['red', '#FF9400', 'green']);

        // // This works to show all entries on sort, but for some reason the jquery selector for the tablesort isn't selecting just the table of id element
        // clear existing table
        d3.select('#table').select('table').remove();
        // create new table
        const table = d3.select('#table').append('table');

        // // // remove old headers then append new ones in case this is a new date range
        const thead = table.selectAll('thead').data([null]).enter().append('thead');
        const tfoot = table.selectAll('tfoot').data([null]).enter().append('tfoot');

        //   // append the header row
        thead.append('tr')
            .selectAll('th')
            .data(headers)
            .enter()
            .append('th')
            .text(function (column) {
                return column;
            })
            .on('click', function (d) {
                thead.attr('class', 'header');
                const columnName = columnHeaderMap[d];
            });

        tfoot.append('tr')
            .selectAll('th')
            .data(headers)
            .enter()
            .append('th')
            .attr("class", "tableexport-ignore")
            .text(function (column) {
                return column;
            });

        // // // This is a subtotal reducer so each id has its total
        const summary = merged.reduce(function (val, acc) {
            if (!val[acc.affId_offId]) val[acc.affId_offId] = {
                affId_offId: acc.affId_offId,
                cost: 0,
                revenue: 0,
                profit: 0,
                clicks: 0,
                rpa: 0,
                cpc: 0,
                rpc: 0,
                actions: 0
            };

            val[acc.affId_offId].clicks += Number.isFinite(acc.clicks) ? Number.parseFloat(acc.clicks) : 0;

            val[acc.affId_offId].actions += Number.isFinite(acc.actions) ? Number.parseFloat(acc.actions) : 0;

            val[acc.affId_offId].cost += Number.isFinite(acc.cost) ? Number.parseFloat(acc.cost) : 0;

            val[acc.affId_offId].revenue += Number.isFinite(acc.revenue) ? Number.parseFloat(acc.revenue) : 0;

            val[acc.affId_offId].profit += Number.isFinite(acc.profit) ? Number.parseFloat(acc.profit) : 0;

            val[acc.affId_offId].name = acc.name;

            val[acc.affId_offId].affiliate = acc.affiliate;

            val[acc.affId_offId].offer = acc.offer;

            val[acc.affId_offId].cpc = Number.isFinite(val[acc.affId_offId].cost / val[acc.affId_offId].clicks) ? Number.parseFloat(acc.cpc) : 0;


            val[acc.affId_offId].rpc = Number.isFinite(Number.parseFloat(acc.revenue) / Number.parseFloat(acc.clicks)) ? Number.parseFloat(acc.rpc) : 0;

            val[acc.affId_offId].rpa = Number.isFinite(Number.parseFloat(acc.revenue) / Number.parseFloat(acc.actions)) ? Number.parseFloat(acc.rpa) : 0;

            val[acc.affId_offId].profitMargin = Number.isFinite(Number.parseFloat(acc.profit) / Number.parseFloat(acc.revenue)) ? Number.parseFloat(acc.profitMargin) : 0;

            return val;
        }, {});

        const nested = d3.nest()
            .key(d => d.affId_offId)
            .entries(merged)
            .map(d => {
                d.header = summary[d.key];
                return d
            });
        console.log("Nested : ", nested);

        const tbody = table.selectAll('tbody')
            .data(nested)
            .remove()
            .enter()
            .append('tbody');

        const summaryRow = tbody
            .selectAll('tr.summary')
            .data(d => [d.header])
            .remove()
            .enter()
            .append('tr')
            .attr("class", "tableexport-ignore")
            .on("click", function (d) {
                const entryDetails = $(this).nextUntil(".summary");
                entryDetails.toggle();
            })
            .classed('summary', true);

        addCells(summaryRow);

        // create a row for each object in the data
        const rows = tbody.selectAll('tr.entry')
            .data(d => {
                return d.values
            })
            .remove()
            .enter()
            .append('tr')
            .attr("class", "tableexport-string target")
            .attr("class", "detail-row")
            .classed('entry', true)

        addCells(rows);

        function addCells(selection) {
            // create a cell in each row for each column
            selection.selectAll('td')
                .data(function (row) {
                    return columns.map(function (column) {
                        return {
                            column: getHeaderWithColumn(column),
                            value: row[column],
                        };
                    });
                })
                .enter()
                .append('td')
                .attr("class", "tableexport-string target")
                .html(function (d) {
                    if (d.column === 'RPA' || d.column === 'RPC' || d.column === 'CPC' || d.column === 'Profit' || d.column === 'Cost') {
                        if (Number.isFinite(d.value)) {
                            return '$'+ d.value.toFixed(2);
                        } else {
                            return '';
                        }

                    }
                    if (d.column === 'PM') {
                        if (Number.isFinite(d.value)) {
                            return d.value.toFixed(0) + '%';
                        } else {
                            return '';
                        }
                    }
                    if (d.column === 'Revenue') {
                        if (isNaN(d.value)) {
                            return '';
                        }
                        console.log(typeof d.value);
                    }
                    return d.value;
                })
                .style("color", function (d) {
                    if (d.column === 'PM') {
                        return pmColorScale(d.value);
                    }

                    if (d.column === 'Profit') {
                        if (d.value < 0) {
                            return "red";
                        }
                    }
                });
        }

        // // Sorting magic for the lovely media divas, I am teasing, promise
        // // This works like datatables but with a little more freedom
        $('#table table')
            .trigger("destroy", false)
            .tablesorter({
                // this option only adds a table class name "tablesorter-{theme}"
                theme: 'default',
                // widgets: ['sortTbody', 'filter', 'zebra', 'stickyHeaders'],
                widgets: ['sortTbody', 'filter', 'zebra'],
                widgetOptions: {
                    filter_external: '.search',
                    filter_columnFilters: false,
                    resizable: true,
                    filter_defaultFilter: {
                        all: '~{q}',
                    },
                    filter_selectSourceSeparator: ' ',
                    filter_ignoreCase: true,
                    sortTbody_lockHead: true,
                    sortTbody_primaryRow: '.summary',
                    sortTbody_sortRows: true,
                    zebra: ["even", "odd"],
                    usNumberFormat: true,

                    // include child row content while filtering the second demo table
                    filter_childRows: true
                    // stickyHeaders_offset: 0,
                    // // added to table ID, if it exists
                    // stickyHeaders_cloneId: '-sticky',
                    // // trigger "resize" event on headers
                    // stickyHeaders_addResizeEvent: true,
                    // // if false and a caption exist, it won't
                    // // be included in the sticky header
                    // stickyHeaders_includeCaption: true,
                    // // The zIndex of the stickyHeaders, allows
                    // // the user to adjust this to their needs
                    // stickyHeaders_zIndex: 2,
                    // // scroll table top into view after filtering
                    // stickyHeaders_filteredToTop: true
                }
            });

                    //  // Dealing with redraws
        if ($('.tablesorter-headerRow').length > 0 || $('.tablesorter-tfoot').length > 0) {
            // console.log($('.tablesorter-headerRow').length);
            // console.log($('tfoot').length);
            $(".tablesorter-headerRow:not(:first)").remove();
            $("tfoot:not(:first)").remove();
        }
        // // Count the stuff
        const totalRows = merged.length;
        const shownSummaryRows = $('tr.summary:visible').length;
        const shownDetailRows = $('tr.detail-row:visible').length;
        console.log('showing ', totalRows, ' of ', shownDetailRows, ' details and ', shownSummaryRows, ' summaries');


        // using d3 to paginate 
        let tbodiesPerPage = 25;
        const totalBodies = $('tbody').length;

        d3.select("#buttons").datum({
            portion: 0
        });

        // the chain select here pushes the datum onto the up and down buttons also
        d3.select("#buttons").select("#first").on("click", function (d) {
            console.log('first clicked');
            console.log('next portion was ', d.portion);
            d3.select(this.parentNode).select('[id="previous-button"]').classed('disabled', true);
            d3.select(this.parentNode).select('[id="next-button"]').classed('disabled', false);
            d.portion = 0;
            redraw(d.portion);
        });

        d3.select("#buttons").select("#previous-button").on("click", function (d) {
            console.log('next portion was ', d.portion);
            if (d.portion - tbodiesPerPage >= 0) {
                d.portion -= tbodiesPerPage;
                redraw(d.portion);
            }
        });

        d3.select("#buttons").select("#next-button").on("click", function (d) {
            // let the bodies hit the floor
            console.log('previous portion was', d.portion);
            if (d.portion < (totalBodies - tbodiesPerPage)) {
                d.portion += tbodiesPerPage;
                redraw(d.portion);
            }
        });

        d3.select("#buttons").select("#last").on("click", function (d) {
            console.log('last clicked');
            d.portion = totalBodies - tbodiesPerPage;
            console.log('next portion was ', d.portion);
            d3.select(this.parentNode).select('[id="next"]').classed('disabled', true);
            d3.select(this.parentNode).select('[id="previous"]').classed('disabled', false);
            redraw(d.portion);
        });

        d3.select("#buttons").select("#all-button").on("click", function (d) {
            tbodiesPerPage = totalBodies;
            d.portion = 0;
            // console.log('next portion was ', d.portion);
            d3.select(this.parentNode).select('[id="next"]').classed('disabled', true);
            d3.select(this.parentNode).select('[data-id="previous"]').classed('disabled', true);
            d3.select(this.parentNode).select('[data-id="last"]').classed('disabled', true);
            d3.select(this.parentNode).select('[data-id="first"]').classed('disabled', true);
            d3.select(this.parentNode).select('[data-id="next"]').classed('disabled', true);
            redraw(d.portion);
        });

        function redraw(start) {
            d3
                .select("table")
                .selectAll("tbody")
                .style("display", function (d, i) {
                    return i >= start && i < start + tbodiesPerPage ? null : "none";
                });
            if (startDateSelect == endDateSelect) {
                $('.summary').hide();
            }
            if (startDateSelect != endDateSelect) {
                $("tr.detail-row").css("display", "none"); // hides the row
            }
        }

        redraw(0);


        $('#table').prepend('<div class="count">' + totalRows + ' total results</div>');

        // toggle rows
        $("#table").off("click").on("click", ".summary", function () {
            // hide other rows when clicking on primary row
            $(this).nextUntil(".summary").toggleClass("detail-row");
        });

        if (startDateSelect != endDateSelect) {
            $("tr.detail-row").css("display", "none"); // hides the row
        }

        if (startDateSelect == endDateSelect) {
            $('.summary').hide();
        }

        $('.search').keyup(function () {
            $('#table tbody tr').show().filter(function () {
                // hide the summary on page chagne if it's the same day
                if (startDateSelect == endDateSelect) {
                    $('.summary').remove();
                }
            }).hide();
        });

        // // Export the table
        TableExport.prototype.formatConfig.xlsx.buttonContent = 'Export to Excel';
        TableExport.prototype.formatConfig.csv.buttonContent = 'Export to CSV';
        // TableExport.prototype.typeConfig.date.assert = function(value) { return false; };


        TableExport(document.getElementsByTagName("table"), {
            headers: true, // (Boolean), display table headers (th or td elements) in the <thead>, (default: true)
            footers: false, // (Boolean), display table footers (th or td elements) in the <tfoot>, (default: false)
            formats: ['xlsx', 'csv'], // (String[]), filetype(s) for the export, (default: ['xlsx', 'csv', 'txt'])
            filename: 'taboolaReports', // (id, String), filename for the downloaded file, (default: 'id')
            bootstrap: false, // (Boolean), style buttons using bootstrap, (default: true)
            exportButtons: true, // (Boolean), automatically generate the built-in export buttons for each of the specified formats (default: true)
            position: 'top', // (top, bottom), position of the caption element relative to table, (default: 'bottom')
            ignoreRows: null, // (Number, Number[]), row indices to exclude from the exported file(s) (default: null)
            ignoreCols: null, // (Number, Number[]), column indices to exclude from the exported file(s) (default: null)
            trimWhitespace: true // (Boolean), remove all leading/trailing newlines, spaces, and tabs from cell text in the exported file(s) (default: false)            
        });

        // // clear out the old export buttons
        var buttonsObj = {};
        const oldButtons = $('button.button-default');
        if (oldButtons != null) {
            oldButtons.each(function () {
                var text = $.trim($(this).text());
                if (buttonsObj[text]) {
                    $(this).remove();
                } else {
                    buttonsObj[text] = true;
                }
            })
        }

        // Click prevention removed
        $("body").find("*").removeAttr("disabled");
        $("body").find("a").unbind("click");
    }

    // Chaining everything up
    Promise.all([
            getNetsphere(startDateSelect, endDateSelect),
            getTaboola(startDateSelect, endDateSelect),
            getTune(startDateSelect, endDateSelect)

        ])
        .then(data => mergeData(...data))
        .then(merged => {
            // console.log(merged);
            return merged;
        })
        .then(performCleanupAndCalcs)
        .then(data => {
            console.log('this is the then after cleanups');
            console.log(data);
            // console.log(data);
            return data;
        })
        .then(buildTableBodyEntries)
        .then(data => {
            $('.loader').hide();
            // console.log(data);
            return data;
        }).catch(function (err) {
            $('.loader').remove();
            $('.count').remove();
            // Click prevention removed
            $("body").find("*").removeAttr("disabled");
            $("body").find("a").unbind("click");
            $('#table').prepend('<img id="error" src="error.gif" />')
            $('#errorContainer').html('Oh snap, something seems unavailable.  Try refreshing the page or try again later.');
            $('#errorContainer').css('display', 'block');
            $('#error-box').css('display', 'block');
            document.getElementById("errorContainer").style.color = "red";
            console.log(err);
        });


    $("#start-date").change(function () {
        startDateSelect = $('#start-date').val(); // update here before executing the chain.
        endDateSelect = $('#end-date').val();
        console.log("new start date is " + startDateSelect + " and end date is " + endDateSelect);

        // // Disable user actions while processing
        $("body").find("*").attr("disabled", "disabled");
        $("body").find("a").click(function (e) {
            e.preventDefault();
        });

        // // UI cues
        $('.loader').show();
        $('#table').prepend('<p id="loadmsg">Loading...</p>');
        $('#table').prepend('<img id="loadpup" src="fidgetSpinner.gif" />');

        // // Cancel out events of previous drawing
        $('#table tbody').off('click', '.summary');
        $('.count').remove();
        $('div.pager').hide();

        Promise.all([
                getNetsphere(startDateSelect, endDateSelect),
                getTaboola(startDateSelect, endDateSelect),
                getTune(startDateSelect, endDateSelect)

            ])
            .then(data => mergeData(...data))
            .then(merged => {
                // console.log(merged);
                return merged;
            })
            .then(performCleanupAndCalcs)
            .then(data => {
                console.log('this is the then after cleanups');
                console.log(data);                
                return data;
            })
            .then(buildTableBodyEntries)
            .then(data => {
                $('#loadpup').remove();
                $('#loadmsg').remove();
                return data;
            }).catch(function (err) {
                $('#errorContainer').css('display', 'none');
                $('#error-box').css('display', 'none');
                $('#loadpup').remove();
                $('#loadmsg').remove();
                $('.loader').remove();
                $('.count').remove();
                // Click prevention removed
                $("body").find("*").removeAttr("disabled");
                $("body").find("a").unbind("click");
                $('#table').prepend('<img id="error" src="error.gif" />')
                $('#errorContainer').html('Oh snap, something seems unavailable.  Try refreshing the page or try again later.');
                $('#errorContainer').css('display', 'block');
                $('#error-box').css('display', 'block');
                document.getElementById("errorContainer").style.color = "red";
                console.log(err);
            });

    });

    $("#end-date").change(function () {
        startDateSelect = $('#start-date').val(); // update here before executing the chain.
        endDateSelect = $('#end-date').val();
        console.log("new start date is " + startDateSelect + " and end date is " + endDateSelect);

        // // Disable user actions while processing
        $("body").find("*").attr("disabled", "disabled");
        $("body").find("a").click(function (e) {
            e.preventDefault();
        });

        // // UI cues
        $('.loader').show();
        $('#table').prepend('<p id="loadmsg">Loading...</p>');
        $('#table').prepend('<img id="loadpup" src="fidgetSpinner.gif" />');

        // // Cancel out events of previous drawing
        $('#table tbody').off('click', '.summary');
        $('.count').remove();
        $('div.pager').hide();

        Promise.all([
                getNetsphere(startDateSelect, endDateSelect),
                getTaboola(startDateSelect, endDateSelect),
                getTune(startDateSelect, endDateSelect)

            ])
            .then(data => mergeData(...data))
            .then(merged => {
                // console.log(merged);
                return merged;
            })
            .then(performCleanupAndCalcs)
            .then(data => {
                console.log('this is the then after cleanups');
                console.log(data);                
                return data;
            })
            .then(buildTableBodyEntries)
            .then(data => {
                $('#loadpup').remove();
                $('#loadmsg').remove();
                return data;
            }).catch(function (err) {
                $('#errorContainer').css('display', 'none');
                $('#error-box').css('display', 'none');
                $('#loadpup').remove();
                $('#loadmsg').remove();
                $('.loader').remove();
                $('.count').remove();
                // Click prevention removed
                $("body").find("*").removeAttr("disabled");
                $("body").find("a").unbind("click");
                $('#table').prepend('<img id="error" src="error.gif" />')
                $('#errorContainer').html('Oh snap, something seems unavailable.  Try refreshing the page or try again later.');
                $('#errorContainer').css('display', 'block');
                $('#error-box').css('display', 'block');
                document.getElementById("errorContainer").style.color = "red";
                console.log(err);
            });

    });
    // $("#end-date").change(function () {
    //     startDateSelect = $('#start-date').val();
    //     endDateSelect = $('#end-date').val(); // update here before executing the chain.
    //     $("body").find("*").attr("disabled", "disabled");
    //     $("body").find("a").click(function (e) {
    //         e.preventDefault();
    //     });
    //     $('#error').remove();
    //     $('.count').remove();
    //     console.log("new end date is " + endDateSelect + " and start date is " + startDateSelect + ".  Fetching the new data...");
    //     $('#table tr').remove();
    //     $('#table').prepend('<p id="loadmsg">Loading...</p>');
    //     $('div.pager').hide();
    //     $('#table').prepend('<img id="loadpup" src="fidgetSpinner.gif" />');

    //     if (endDateSelect < startDateSelect) {
    //         $('#table').prepend('<img id="error" src="shining.gif" />');
    //         $('#loadcat').remove();
    //         $('#loadmsg').remove();
    //         $('.count').remove();
    //         // Click prevention removed
    //         $("body").find("*").removeAttr("disabled");
    //         $("body").find("a").unbind("click");
    //         $('#table tr').remove();
    //         $('#errorContainer').html('<em>Past time travel not possible: </em>End date cannot be before the start date.  Try again.');
    //         $('#errorContainer').css('display', 'block');
    //         $('#error-box').css('display', 'block');
    //         document.getElementById("errorContainer").style.color = "red";
    //     }

    //     Promise.all([
    //             getNetsphere(startDateSelect, endDateSelect),
    //             getTaboola(startDateSelect, endDateSelect),
    //             getTune(startDateSelect, endDateSelect)

    //         ])
    //         .then(data => mergeData(...data))
    //         .then(merged => {
    //             // console.log(merged);
    //             return merged;
    //         })
    //         .then(performCleanupAndCalcs)
    //         .then(data => {
    //             return data;
    //         })
    //         .then(buildTableBodyEntries)
    //         .then(data => {
    //             $('#loadpup').remove();
    //             $('#loadcat').remove();
    //             $('#loadmsg').remove();
    //             $('.loader').remove();
    //             // console.log(data);
    //             return data;
    //         }).catch(function (err) {
    //             $('.loader').remove();
    //             $('.count').remove();
    //             $('#loadpup').remove();
    //             $('#loadmsg').remove();
    //             // Click prevention removed
    //             $("body").find("*").removeAttr("disabled");
    //             $("body").find("a").unbind("click");
    //             $('#table').prepend('<img id="error" src="error.gif" />')
    //             $('#errorContainer').html('Oh snap, a data source seems unavailable.  Try refreshing the page or try again later.');
    //             $('#errorContainer').css('display', 'block');
    //             $('#error-box').css('display', 'block');
    //             document.getElementById("errorContainer").style.color = "red";
    //             console.log(err);
    //         });
    // });
});