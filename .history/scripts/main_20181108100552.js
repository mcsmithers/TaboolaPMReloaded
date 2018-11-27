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
                entry.revenue = Number(revenue);
                return entry;
            });
            // console.log("Netsphere object data looks like...");
            // console.log(netsphere);
            if (netsphere.length == 0) {
                $('#netsphereStatus').html('Netsphere Data is not available yet');
                document.getElementById("netsphereStatus").style.color = "red";

            } else {
                $('#netsphereStatus').html(' Netsphere is ready');
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
            url: "https://tsh.api.hasoffers.com/Apiv3/json?NetworkToken=NETXqfUQYBBISOBfs6ixG8BeFg5sKe&Target=Report&Method=getStats&fields[]=Affiliate.company&fields[]=Stat.revenue&fields[]=Stat.offer_id&fields[]=Stat.conversions&fields[]=Stat.date&fields[]=Stat.affiliate_id&fields[]=Offer.name&sort[Stat.revenue]=desc&limit=1000000&page=1&filters[Stat.goal_id][conditional]=EQUAL_TO&filters[Stat.goal_id][values]=0" + "&data_start=" + startDateSelect + "&data_end=" + endDateSelect,
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
                entry.actions = Number(actions);
                entry.revenue = Number(revenue);
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
                entry.cost = Number(cost);
                entry.campaign = campaign;
                entry.clicks = Number(clicks);
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

    // // Once we merge, we fill in the empty elements with empty string and calculate as needed


    function performCleanupAndCalcs(merged) {
        calcs = [];
        merged.forEach(function (element, index) {
            // First let's deal with undefined
            const clicks = Number(merged[index].clicks);
            if (!isNaN(clicks)) {
                merged[index].clicks = Number(clicks);
                calcs.push(clicks);
            } else {
                merged[index].clicks = '';
                calcs.push(clicks);
            }

            const actions = Number(merged[index].actions);
            if (!isNaN(actions)) {
                merged[index].actions = Number(actions.toFixed(2).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }));
                calcs.push(actions);
            } else {
                merged[index].actions = '';
                calcs.push(actions);
            }

            // const cost = Number.parseFloat(merged[index].cost);
            // if (!isNaN(cost) && cost !== 0) {
            //     merged[index].cost = Number(cost.toFixed(2).toLocaleString(undefined, {
            //         minimumFractionDigits: 2,
            //         maximumFractionDigits: 2
            //     }));
            //     calcs.push(cost);
            // } else {
            //     merged[index].cost = '';
            //     calcs.push(cost);
            // }

            const revenue = Number.parseFloat(merged[index].revenue);
            if (!isNaN(revenue) && revenue !== 0) {
                merged[index].revenue = Number(revenue.toFixed(2).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }));
                calcs.push(revenue);
            } else {
                merged[index].revenue = '';
                calcs.push(revenue);
            }

            const name = merged[index].name;
            if (typeof name !== "undefined") {
                calcs.push(name);
            } else {
                merged[index].name = '';
                calcs.push(name);
            }

            const affiliate = merged[index].affiliate;
            if (typeof affiliate !== "undefined") {
                calcs.push(affiliate);
            } else {
                merged[index].affiliate = '';
                calcs.push(affiliate);
            }

            const offer = merged[index].offer;
            if (typeof offer !== "undefined") {
                calcs.push(offer);
            } else {
                merged[index].offer = '';
                calcs.push(offer);
            }

            const profit = Number(revenue - cost);
            if (Number.isFinite(profit) && !isNaN(profit) && profit !== 0) {
                merged[index].profit = Number(profit.toFixed(2));
                calcs.push(profit);
            } else {
                merged[index].profit = '';
                calcs.push(profit);
            }

            const profitMargin = Number.parseInt(profit / revenue);
            if (Number.isFinite(profitMargin) || !isNaN(profitMargin)) {
                merged[index].profitMargin = Number.parseInt(profitMargin);
                calcs.push(profitMargin);
            }           
            else {
                calcs.push(profitMargin);
            }

            const cpc = Number.parseFloat(cost / clicks);
            if (Number.isFinite(cpc) && !isNaN(cpc)) {
                merged[index].cpc = Number(cpc.toFixed(2));
                calcs.push(cpc);
            } else {
                merged[index].cpc = '';
                calcs.push(cpc);
            }

            const rpc = Number.parseFloat(revenue / clicks);
            if (Number.isFinite(rpc) && !isNaN(rpc)) {
                merged[index].rpc = Number(rpc.toFixed(2));
                calcs.push(rpc);
            } else {
                merged[index].rpc = '';
                calcs.push(rpc);
            }

            const rpa = Number.parseFloat(revenue / actions);
            if (Number.isFinite(rpa) && !isNaN(rpa)) {
                merged[index].rpa = Number(rpa.toFixed(2));
                calcs.push(rpa);
            } else {
                merged[index].rpa = '';
                calcs.push(rpa);
            }
        });

        // // Now that we have what we need, let's filter out the inactive accounts from the affiliates and offers that are blank
        // merged = merged.filter(m => {
        //     return (m.affiliate !== '' && m.offer !== '' && m.cost !== ''); // v2 will have the option to do either all 3 filter or just to 2 so we see the entires with 0 cost

        // });
        // merged = merged.filter(m => {
        //     return (m.affiliate !== '' && m.offer !== '' && m.cost !== ''); // v2 will have the option to do either all 3 filter or just to 2 so we see the entires with 0 cost

        // });
                merged = merged.filter(m => {
            return (m.affiliate !== '' && m.offer !== '' && m.cost !== ''); // v2 will have the option to do either all 3 filter or just to 2 so we see the entires with 0 cost

        });

        console.log("Detail rows data");
        console.log(merged);
        return merged;
    }
    

    function buildTableBodyEntries(merged) {
        console.log('The final data will get sent to a table here');
        console.log(merged);
        $('body').css('background-image', 'none');

        $('.loader').remove();

//         // Time to make the summary
        const columnHeaderMap = {
            Date: "date",
            AffiliateId: "affId_offId",
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
                .html(function (d) {
                    if (d.column === 'RPA' || d.column === 'Profit' || d.column === 'Revenue' || d.column === 'Cost') {
                        if (Number.isFinite(d.value)) {
                            return d.value.toFixed(2);
                        }
                    }
                    if (d.column === 'PM') {
                        if (Number.isFinite(d.value)) {
                            return d.value.toFixed(0);
                        }
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
                widgets: ['sortTbody', 'zebra'],
                widgetOptions: {
                    sortTbody_lockHead: true,
                    sortTbody_primaryRow: '.summary',
                    sortTbody_sortRows: true,
                    zebra: ["even", "odd"],

                    // include child row content while filtering the second demo table
                    filter_childRows: true
                }
            });

// // Count the stuff
        const totalRows = merged.length;
        const shownSummaryRows = $('tr.summary:visible').length;
        const shownDetailRows = $('tr.detail-row:visible').length;
        console.log('showing ', totalRows, ' of ', shownDetailRows, ' details and ', shownSummaryRows, ' summaries');


        // using d3 to paginate 
        let tbodiesPerPage = 15;
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
            console.log('next portion was ', d.portion);
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

        // // // search the entries
        $('button.button-default:first').after('<div id="small-4 columns"><input id="searchbox" placeholder="Type to search" input type="text"></div>');
        // hide any dupes
        if ($(searchbox).length > 1) {
            $('#searchbox').remove();
        }

        $('#searchbox').keyup(function () {
            var val = $.trim($(this).val()).replace(/ +/g, ' ').toLowerCase();

            $('#table tbody tr').show().filter(function () {
                // hide the summary on page chagne if it's the same day
                if (startDateSelect == endDateSelect) {
                    $('.summary').remove();
                }

                if (startDateSelect != endDateSelect) {
                    $('.detail-row').css("display", "none");
                }

                var text = $(this).text().replace(/\s+/g, ' ').toLowerCase();
                return !~text.indexOf(val);
            }).hide();
        });



        // Click prevention removed
        $("body").find("*").removeAttr("disabled");
        $("body").find("a").unbind("click");
    }

    // Chaining everything up
    Promise.all([
            getNetsphere(startDateSelect, endDateSelect),
            getTune(startDateSelect, endDateSelect),
            getTaboola(startDateSelect, endDateSelect)
        ])
        .then(data => mergeData(...data))
        .then(merged => {
            // console.log(merged);
            return merged;
        })
        .then(performCleanupAndCalcs)
        .then(data => {
            // console.log(data);
            return data;
        })
        .then(buildTableBodyEntries)
        .then(data => {
            $('.loader').remove();
            // console.log(data);
            return data;
        }).catch(function (err) {
            $('#errorContainer').html('Oh snap, something broke. <br/><b>Error: ' + err + '</b>.  Try refreshing the page.');
            $('#errorContainer').css('display', 'block');
            $('#error-box').css('display', 'block');

            document.getElementById("errorContainer").style.color = "red";
            console.log(err);
        });

    $("#start-date").change(function () {
        $('#error-box').hide();
        startDateSelect = $('#start-date').val(); // update here before executing the chain.
        endDateSelect = $('#end-date').val();
        console.log("new start date is " + startDateSelect + " and end date is " + endDateSelect);
        $("body").find("*").attr("disabled", "disabled");
        $("body").find("a").click(function (e) {
            e.preventDefault();
        });
        $('.count').remove();
        console.log("new start date is " + startDateSelect + " and end date is " + endDateSelect);
        $('#table tr').remove();
        $('#table tbody').off('click', '.summary');
        $('.loader').show();
        $('div.pager').hide();

        Promise.all([

                getNetsphere(startDateSelect, endDateSelect),

                getTune(startDateSelect, endDateSelect),

                getTaboola(startDateSelect, endDateSelect)

            ])
            .then(data => mergeData(...data))
            .then(merged => {
                // console.log(merged);
                return merged;
            })
            .then(performCleanupAndCalcs)
            .then(data => {
                // console.log(data);
                return data;
            })
            .then(buildTableBodyEntries)
            .then(data => {
                $('.loader').hide();
                // console.log(data);
                return data;
            }).catch(function (err) {
                $('#errorContainer').html('Oh noes, something broke. <br/><b>Error: ' + requestStatus + '</b>. ');
                $('#error-box').css('display', 'block');
                $('#errorContainer').css('display', 'block');
                document.getElementById("errorContainer").style.color = "red";
                console.log(err);
            });

    });

    $("#end-date").change(function () {
        $('#error-box').hide();
        startDateSelect = $('#start-date').val();
        endDateSelect = $('#end-date').val(); // update here before executing the chain.
        console.log("new end date is " + endDateSelect + " and start date is " + startDateSelect + ".  Fetching the new data...");
        if (endDateSelect < startDateSelect) {
            $('#errorContainer').html('End date cannot be before the start date.  Try again.');
            $('#errorContainer').css('display', 'block');
            $('#error-box').css('display', 'block');
            document.getElementById("errorContainer").style.color = "red";
        }
        $("body").find("*").attr("disabled", "disabled");
        $("body").find("a").click(function (e) {
            e.preventDefault();
        });
        $('.count').remove();
        console.log("new start date is " + startDateSelect + " and end date is " + endDateSelect);
        $('#table tr').remove();
        $('#table tbody').off('click', '.summary');
        $('.loader').show();
        $('div.pager').hide();

        Promise.all([
                getNetsphere(startDateSelect, endDateSelect),
                getTune(startDateSelect, endDateSelect),
                getTaboola(startDateSelect, endDateSelect)
            ])
            .then(data => mergeData(...data))
            .then(merged => {
                // console.log(merged);
                return merged;
            })
            .then(performCleanupAndCalcs)
            .then(data => {
                // console.log(data);
                return data;
            })
            .then(buildTableBodyEntries)
            .then(data => {
                $('.loader').hide();
                // console.log(data);
                return data;
            }).catch(function (err) {
                $('#errorContainer').html('Oh no! Something broke. <br/><b>Error: ' + requestStatus + '</b>.  Try refreshing the page.');
                $('#errorContainer').css('display', 'block');
                $('#error-box').css('display', 'block');
                document.getElementById("errorContainer").style.color = "red";
                console.log(err);
            });
    });

});