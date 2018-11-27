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


    $('#error-box').hide();
    $('.loader').show();
    // fp stuff called in
    const fp = _.noConflict(); // allows both _ and fp using the lodash/fp module, see: https://github.com/lodash/lodash/wiki/FP-Guide
    const {
        compose
    } = fp;
    const {
        zipObject
    } = _;

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


    // // Prod env
    const yahooClientId = 'dj0yJmk9RkVLa3BYbnoxNDNDJmQ9WVdrOWFuQlJibE56TjJrbWNHbzlNQS0tJnM9Y29uc3VtZXJzZWNyZXQmeD03Ng--';

    // Dev env
    // const yahooClientId = 'dj0yJmk9ZzVMQTdSWmw4SEI0JmQ9WVdrOU1sRXhaMUJOTlRnbWNHbzlNQS0tJnM9Y29uc3VtZXJzZWNyZXQmeD04OA--';

    // Prod env
    const yahooRedirectUri = 'https://tapstone.com/tools/HONeY/getGeminiRequest.php';


    // // // dev env
    // const yahooRedirectUri = 'https://local.tapstone.com/tools/HONeY/getGeminiRequest.php';

    const yahooAuthUrl = 'https://api.login.yahoo.com/oauth2/request_auth?client_id=' + yahooClientId + '+&redirect_uri=' + yahooRedirectUri + '&response_type=code&language=en-us';

    const accessToken = Cookies.get('AccessTokenCookie') || gotoUrl(yahooAuthUrl);

    function gotoUrl(url) {
        window.location.href = url;
    }

    $("body").find("*").attr("disabled", "disabled");
    $("body").find("a").click(function (e) {
        e.preventDefault();
    });

    function queryYahoo(startDateSelect, endDateSelect) {
        console.log("Getting the yahoo stuff...");
        $('.loader').show();
        return $.ajax({
            // // Prod
            url: 'https://tapstone.com/tools/HONeY/queryYahoo.php?start_date=' + startDateSelect + '&end_date=' + endDateSelect,

            // // Dev
            // url: 'https://local.tapstone.com/tools/HONeY/queryYahoo.php?start_date=' + startDateSelect + '&end_date=' + endDateSelect,
            type: 'GET',
            dataType: 'json',
            crossDomain: true,
            // // dev only
            // headers: {
            //     Authorization: 'Bearer: ' + accessToken
            // },
            data: {},
        }).fail(
            $('#errorContainer').html('Uh oh, Yahoo is not responding.  Try again later'),
            failFunction
        );
    }

    function changeSpacesToUnderscore(str) {
        return str.replace(/\s+/g, '_');
    }

    function parseYahooResponse(response) {
        const {
            rows,
            fields
        } = JSON.parse(response);
        // console.log(fields);
        // console.log(rows);

        const keys = fields.map(({
            fieldName
        }) => changeSpacesToUnderscore(fieldName));

        // return [keys, ...rows];

        function setupData() {
            // declare and initialize in the scope of setupData
            const yahoo = [];

            // have to derive the ids so we can match them later
            for (var i = 0; i < rows.length; i++) {
                var obj = {};
                for (var j = 0; j < keys.length; j++) {
                    obj[keys[j]] = rows[i][j];
                    camp = obj.Campaign_Name;
                    obj.date = obj.Day;
                    if (typeof camp != 'undefined') {
                        splitter = camp.split('_');
                        //     // // i know this isn't pretty, i will refactor more later
                        obj.affiliateId = splitter[0].slice(-4);
                    }
                }
                yahoo.push(obj);
            }
            // return the object here
            return yahoo;
        }
        // then return it here so whoever can use the result directly from the return value of parseYahooResponse, in this case, the next `.then()` handler function
        return setupData();
    }


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

                // // Now putting this into something we can actually use
                const entry = new Object();
                entry.affiliateId = affiliateId;
                entry.offerId = offerId;
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
                        currentValue.hasOwnProperty('affiliateId') &&
                        element.hasOwnProperty('affiliateId') &&
                        currentValue.affiliateId === element.affiliateId &&
                        currentValue.date === element.date
                    ));

                    if (duplicatedElement) {
                        duplicatedElement.revenue += currentValue.revenue;

                        // console.log(duplicatedElement.affiliateId + " is a dupe with rev " + duplicatedElement.revenue);
                        // console.log(currentValue.affiliateId + " is current with  rev that is " + currentValue.revenue);
                    } else {
                        accumulator.push(Object.assign({}, currentValue));
                    }

                    return accumulator;
                }, []
            )
        ).then(summedRevenues => {
            console.log("Netsphere data looks like...");
            console.log(summedRevenues);
            return summedRevenues;
        }).fail(failFunction);

    console.log("Incoming data from HasOffers api...");

    const getTune = (startDateSelect, endDateSelect) => $.ajax({
            type: "GET",
            url: "https://tsh.api.hasoffers.com/Apiv3/json?NetworkToken=NETXqfUQYBBISOBfs6ixG8BeFg5sKe&Target=Report&Method=getStats&fields[]=Stat.hour&fields[]=Stat.date&fields[]=Affiliate.company&fields[]=Advertiser.company&fields[]=Stat.revenue&fields[]=Stat.affiliate_id&fields[]=Stat.advertiser_id&limit=1000000&page=1&data_start=" + startDateSelect + "&data_end=" + endDateSelect,
            data: {},
            dataType: "json",
        })
        .then(response => {
            tuneData = response.response.data.data;
            // console.log(tuneData);

            const tune = tuneData.map(function (value, key) {
                const affiliateId = value.Stat.affiliate_id;
                const revenue = value.Stat.revenue;
                const affiliate = value.Affiliate.company;
                const advertiser = value.Advertiser.company;
                const date = value.Stat.date;
                const entry = new Object();
                entry.affiliate = affiliate;
                if (entry.affiliateId != undefined) {
                    entry.affiliateId = affiliateId;
                }
                if (entry.affiliateId != undefined) {
                    entry.affiliateId = affiliateId;
                }
                entry.date = date;
                entry.affiliateId = affiliateId;
                entry.revenue = Number(revenue);
                entry.advertiser = advertiser;
                entry.affiliate = affiliate;

                return entry;
            })
            console.log("Tune object looks like...");
            console.log(tune);
            return tune;
        }).fail(failFunction);

    // Time for the openmail, as they say in Jurassic Park, hold onto ya butts...
    console.log("Getting the open mail data...");

    const getOpenMail = (startDateSelect, endDateSelect) => $.ajax({
            type: "GET",
            url: "https://reports.openmail.com/v1/subid.json?auth_key=BFLxumbQ8uh8th32buir&days=" + startDateSelect + "," + endDateSelect,
            data: {},
            dataType: "json",
        })
        .then(response => {
            // console.log(response);
            const omData = response;
            // const fp = _.noConflict(); // allows both _ and fp using the lodash/fp module, see: https://github.com/lodash/lodash/wiki/FP-Guide
            // const {
            //     compose
            // } = fp;
            // const {
            //     zipObject
            // } = _;

            const formatPercentSign = str => str.replace(/%/g, 'Percentage'); // can't have the percent character in the keys so we replace with a word

            const changeSpacesToUnderscore = str => str.replace(/\s+/g, '_'); // can't have spaces, so this replaces with an underscore

            const formatKey = compose(changeSpacesToUnderscore, formatPercentSign);

            const formatHeaders = ([headers, ...rows]) => ([headers.map(formatKey), ...rows]); // map the keys so we have all the changes

            const deserializeTableData = ([headers, ...rows]) => rows.map(row => zipObject(headers, row)); // functional programming to the rescue, this is pretty much a pipe that works  right to left so the data in the remaining arrays is easier to work with when we put

            const transformTableData = compose(deserializeTableData, formatHeaders); // Now we put together 

            const formattedOm = transformTableData(omData);

            // Yay!  that was interesting, time to now put all this into a format we can use to merge and compare with the other data for the merger
            const entry = new Object();
            // console.log(formattedOm);

            const om = formattedOm.map(function (value, key) {
                const omId = value.Sub_ID;
                const date = value.Date;
                const revenue = value.Estimated_Gross_Revenue;
                // // Splitting the subid from netsphere to get the subid and offer id for the new table
                const splitter = omId.split("_");
                const affiliateId = splitter[0];
                // console.log(splitter[2]);
                if (splitter[2] !== undefined) {
                    const suffix = splitter[2];
                    affiliateId.slice(suffix);
                }
                // // Now putting this into something we can actually use
                const entry = new Object();
                entry.affiliateId = affiliateId;
                entry.revenue = Number(revenue);
                entry.date = date;
                return entry;
            })
            console.log("OpenMail data looks like...");
            console.log(om);
            return om;
        }).then(om => om
            .reduce(
                (accumulator, currentValue) => {
                    // console.log(accumulator);
                    // console.log(currentValue);
                    const duplicatedElement = accumulator.find(element => (
                        currentValue.hasOwnProperty('affiliateId') &&
                        element.hasOwnProperty('affiliateId') &&
                        currentValue.affiliateId === element.affiliateId &&
                        currentValue.date === element.date
                    ));

                    if (duplicatedElement) {
                        duplicatedElement.revenue += currentValue.revenue;
                    } else {
                        accumulator.push(Object.assign({}, currentValue));
                    }

                    return accumulator;
                }, []
            )
        ).then(summedRevenues => {
            // console.log("here's the totaled openmail info:");
            // console.log(summedRevenues);
            return summedRevenues;
        }).fail(failFunction);

    function failFunction(response) {
        console.log("ERROR: ");
        console.log(response);
        $('#error-box').show();
        $('.loader').remove();
        $('#table').prepend('<img id="error" src="error.gif" />');
        $('#errorContainer').html('Oh no! Something looks unavailable. Try refreshing the page or come back later.');
        $('#errorContainer').css('display', 'block');
        $('#error-box').css('display', 'block');
        document.getElementById("errorContainer").style.color = "red";
    }

    /***********************************************************
     * Mutate the objects to make one bigger object based 
     * on matching values and perform math to get new vals with es6
     ************************************************************/

    function mergeData(...args) {
        let fullCollection = [];
        // console.log(fullCollection);
        args.forEach(arg => {
            fullCollection = fullCollection.concat(arg)
        })
        // console.log(fullCollection);


        const comparator = (arrVal, othVal) => (
            arrVal.hasOwnProperty('affiliateId') &&
            othVal.hasOwnProperty('affiliateId') && arrVal.affiliateId === othVal.affiliateId && arrVal.date === othVal.date
        );
        // // // This gives us over all entries from all apis and compares side-by-side

        // // // Start out with an empty array to populate that will act as the accumulator
        // // CurrentValue is the element of the iteration
        console.log("Preparing data for merge...");

        const merge = (accumulator, currentValue) => {
            // // Check to make sure the ids are the same in each object
            // // Trying to find the current value of the accumulator
            const existing = accumulator.find(element =>
                comparator(element, currentValue)
            );
            // //     // // This will try to find the currentValue in the accumulator array

            const customizer = (existing, currentValue) => _.isUndefined(existing) ? currentValue : existing;

            if (existing !== undefined) {
                _.assignWith(existing, currentValue, customizer);
            } else {
                // // If a value found, it will merge into the existing object
                accumulator.push(currentValue);
            }
            return accumulator;
            //     // // Returns the accumulator to the next iteration of merge
        };
        // // // // Get the whole collection and then turn into the full data object
        const merged = fullCollection.reduce(merge, []);

        console.log("Merging the stuff from each API...");
        // console.log(merged);
        // // We get to see where everything is joined with the matching ids

        return merged;
    }

    // // Once we merge, we fill in the empty elements with empty string and calculate as needed
    function performCleanupAndCalcs(merged) {

        calcs = [];
        merged.forEach(function (element, index) {
            // First let's deal with undefined
            const clicks = Number(merged[index].Clicks);
            if (!isNaN(clicks)) {
                merged[index].Clicks = Number.parseFloat(clicks);
                calcs.push(clicks);
            } else {
                merged[index].Clicks = '';
                calcs.push(clicks);
            }

            const conversions = Number(merged[index].Conversions);
            if (!isNaN(conversions)) {
                merged[index].Conversions = Number.parseFloat(conversions.toFixed(2).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }));
                calcs.push(conversions);
            } else {
                merged[index].Conversions = '';
                calcs.push(conversions);
            }

            const spend = Number(merged[index].Spend);
            if (!isNaN(spend) && spend !== 0.00) {
                merged[index].spend = Number.parseFloat(spend.toFixed(2));
                calcs.push(spend);
            } else {
                merged[index].spend = '';
                calcs.push(spend);
            }

            const revenue = Number(merged[index].revenue);
            if (!isNaN(revenue) && revenue !== 0.00) {
                merged[index].revenue = Number.parseFloat(revenue.toFixed(2).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }));
                calcs.push(revenue);
            } else {
                merged[index].revenue = '';
                calcs.push(revenue);
            }

            delete merged[index].Day;
            delete merged[index].Ad_Title;
            delete merged[index].Impressions;
            delete merged[index].CTR;
            delete merged[index].advertiserId;
            // delete merged[index].Spend;


            const profit = Number.parseFloat(revenue - spend);
            if (Number.isFinite(profit) && !isNaN(profit) && profit !== 0) {
                merged[index].profit = Number.parseFloat(profit.toFixed(2));
                calcs.push(profit).toFixed(2);
            } else {
                merged[index].profit = '';
                calcs.push(profit);
            }

            const profitMargin = Number.parseFloat(profit / revenue);
            if (Number.isFinite(profitMargin) && !isNaN(profitMargin)) {
                merged[index].profitMargin = Number.parseFloat(profitMargin).toFixed(0);
                calcs.push(Number.parseFloat(profitMargin));
            } else {
                calcs.push(profitMargin);
            }

            const cpc = Number(spend / clicks);
            if (Number.isFinite(cpc) && !isNaN(cpc)) {
                merged[index].cpc = Number.parseFloat(cpc.toFixed(2));
                calcs.push(cpc);
            } else {
                merged[index].cpc = '';
                calcs.push(cpc);
            }

            const rpc = Number(revenue / clicks);
            if (Number.isFinite(rpc) && !isNaN(rpc)) {
                merged[index].rpc = Number.parseFloat(rpc.toFixed(2));
                calcs.push(rpc);
            } else {
                merged[index].rpc = '';
                calcs.push(rpc);
            }

            const rpa = Number(revenue / conversions);
            if (Number.isFinite(rpa) && !isNaN(rpa)) {
                merged[index].rpa = Number.parseFloat(rpa.toFixed(2));
                calcs.push(rpa);
            } else {
                merged[index].rpa = '';
                calcs.push(rpa);
            }
        });

        // // Now that we have what we need, let's filter out the inactive accounts from the affiliates and offers that are blank
        merged = merged.filter(m => {
            return (m.affiliate !== '' && m.offer !== '' && m.spend !== ''); // v2 will have the option to do either all 3 filter or just to 2 so we see the entires with 0 spend

        });


        return merged;
    }

    function buildTableBodyEntries(merged) {
        console.log('The final data will get sent to a table here');
        console.log(merged);

        $('.loader').remove();

        // Time to make the summary
        const columnHeaderMap = {
            Date: "date",
            AffiliateId: "affiliateId",
            Spend: "spend",
            Revenue: "revenue",
            CPC: "cpc",
            RPC: "rpc",
            RPA: "rpa",
            Profit: "profit",
            PM: "profitMargin",
            Campaign: "Campaign_Name",
            Advertiser: "advertiser",
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
            .range(['red', '#FDE541', 'green']);

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
            if (!val[acc.affiliateId]) val[acc.affiliateId] = {
                affiliateId: acc.affiliateId,
                spend: 0,
                revenue: 0,
                profit: 0,
                Clicks: 0,
                rpa: 0,
                cpc: 0,
                rpc: 0,
                Conversions: 0
            };

            val[acc.affiliateId].Clicks += Number.isFinite(acc.Clicks) ? Number.parseFloat(acc.Clicks) : 0;

            val[acc.affiliateId].Conversions += Number.isFinite(acc.Conversions) ? Number.parseFloat(acc.Conversions) : 0;

            val[acc.affiliateId].spend += Number.isFinite(acc.spend) ? Number.parseFloat(acc.spend) : 0;

            val[acc.affiliateId].revenue += Number.isFinite(acc.revenue) ? Number.parseFloat(acc.revenue) : 0;

            val[acc.affiliateId].profit += Number.isFinite(acc.profit) ? Number.parseFloat(acc.profit) : 0;

            val[acc.affiliateId].Campaign_Name = acc.Campaign_Name;

            val[acc.affiliateId].affiliate = acc.affiliate;

            val[acc.affiliateId].advertiser = acc.advertiser;

            val[acc.affiliateId].cpc = Number.isFinite(val[acc.affiliateId].spend / val[acc.affiliateId].Clicks) ? Number.parseFloat(acc.cpc) : 0;


            val[acc.affiliateId].rpc = Number.isFinite(Number.parseFloat(acc.revenue) / Number.parseFloat(acc.Clicks)) ? Number.parseFloat(acc.rpc) : 0;

            val[acc.affiliateId].rpa = Number.isFinite(Number.parseFloat(acc.revenue) / Number.parseFloat(acc.Conversions)) ? Number.parseFloat(acc.rpa) : 0;

            val[acc.affiliateId].profitMargin = Number.isFinite(Number.parseFloat(acc.profit) / Number.parseFloat(acc.revenue)) ? Number.parseFloat(acc.profitMargin) : 0;

            return val;
        }, {});

        const nested = d3.nest()
            .key(d => d.affiliateId)
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
                    if (d.column === 'RPA' || d.column === 'Profit' || d.column === 'Revenue' || d.column === 'Spend') {
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
                theme: 'blue',
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

            const totalBodies = $('tbody').length;
            var counter = 0; // set counter initially to 0
            d3.selectAll('#toggle-buttons button').on('click', function () {
                if(d3.select(this).classed('disabled'))
                  return ;
                
                switch(d3.select(this).attr('data-id')) {
                  case 'first':
                       counter = 0;
                  d3.select(this.parentNode).select('[data-id="previous"]').classed('disabled', true);
                  d3.select(this.parentNode).select('[data-id="next"]').classed('disabled', false);
                          break;
                case 'last':
                       counter = totalBodies-1;
                  d3.select(this.parentNode).select('[data-id="next"]').classed('disabled', true);        
                  d3.select(this.parentNode).select('[data-id="previous"]').classed('disabled', false);        
                     break;
                case 'next':
                          counter++;
                  if(counter === totalBodies-1) {
                      d3.select(this).classed('disabled', true);
                  }
                      d3.select(this.parentNode).select('[data-id="previous"]').classed('disabled', false);         
                  break;
                case 'previous':
                          counter--;
                  if(!counter) {
                      d3.select(this).classed('disabled', true);
                  }
                      d3.select(this.parentNode).select('[data-id="next"]').classed('disabled', false);         
                          break;
              }
              redraw(counter);
            });
            
            // the chain select here pushes the datum onto the up and down buttons also
            function redraw(start) {
              d3.select("table").selectAll("tbody")
                .style("display", function(d, i) {
                  return i >= start && i < start + 1 ? null : "none";
                })
            }
            redraw(counter);




        const shownRows = merged.length;
        $('#table').prepend('<div class="count">' + shownRows + ' total results</div>');

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

        TableExport(document.getElementsByTagName("table"), {
            headers: true, // (Boolean), display table headers (th or td elements) in the <thead>, (default: true)
            footers: true, // (Boolean), display table footers (th or td elements) in the <tfoot>, (default: false)
            formats: ['xlsx', 'csv'], // (String[]), filetype(s) for the export, (default: ['xlsx', 'csv', 'txt'])
            filename: 'yahooReports', // (id, String), filename for the downloaded file, (default: 'id')
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
        $('button.button-default:first').after('<input id="searchbox" placeholder="Type to search" input type="text"></>');
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

                var text = $(this).text().replace(/\s+/g, ' ').toLowerCase();
                return !~text.indexOf(val);
            }).hide();
        });



        // Click prevention removed
        $("body").find("*").removeAttr("disabled");
        $("body").find("a").unbind("click");
    }

    // // Chaining everything up
    Promise.all([
            queryYahoo(startDateSelect, endDateSelect).then(parseYahooResponse)
            .then(data => {
                console.log('Yahoo data:', data);
                return data;
            }),
            getNetsphere(startDateSelect, endDateSelect),
            getTune(startDateSelect, endDateSelect),
            getOpenMail(startDateSelect, endDateSelect)
        ])
        .then(data => mergeData(...data))
        .then(merged => {
            console.log(merged);
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
        $("body").find("*").attr("disabled", "disabled");
        $("body").find("a").click(function (e) {
            e.preventDefault();
        });
        $('.count').remove();
        console.log("new start date is " + startDateSelect + " and end date is " + endDateSelect);
        $('#table tr').remove();
        $('#table tbody').off('click', '.summary');
        $('.loader').show();
        $('#table').prepend('<p id="loadmsg">Loading...</p>');
        $('div.pager').hide();
        $('#table').prepend('<img id="loadpup" src="fidgetSpinner.gif" />')


        Promise.all([
                queryYahoo(startDateSelect, endDateSelect).then(parseYahooResponse)
                .then(data => {
                    console.log('Yahoo data:', data);
                    return data;
                }),
                getNetsphere(startDateSelect, endDateSelect),
                getTune(startDateSelect, endDateSelect),
                getOpenMail(startDateSelect, endDateSelect)

            ])
            .then(data => mergeData(...data))
            .then(merged => {
                console.log(merged);
                return merged;
            })
            .then(performCleanupAndCalcs)
            .then(data => {
                console.log(data);
                return data;
            })
            .then(buildTableBodyEntries)
            .then(data => {
                // Click prevention removed
                $("body").find("*").removeAttr("disabled");
                $("body").find("a").unbind("click");
                $('#loadpup').remove();
                $('#loadmsg').remove();
                // $('div.pager').show();

                return data;
            }).catch(function (err) {
                $('.count').remove();
                $('.loader').remove();
                $('#table').prepend('<img id="error" src="error.gif" />')
                $('#table').remove();
                $('#errorContainer').html('Oh noes, something broke. Try again later or refresh the page.</b>');
                $('#error-box').css('display', 'block');
                $('#errorContainer').css('display', 'block');
                document.getElementById("errorContainer").style.color = "red";
                console.log(err);
            });

    });

    $("#end-date").change(function () {
        startDateSelect = $('#start-date').val();
        endDateSelect = $('#end-date').val(); // update here before executing the chain.
        $("body").find("*").attr("disabled", "disabled");
        $("body").find("a").click(function (e) {
            e.preventDefault();
        });
        $('.count').remove();
        console.log("new end date is " + endDateSelect + " and start date is " + startDateSelect + ".  Fetching the new data...");
        $('#table tr').remove();
        $('#table').prepend('<p id="loadmsg">Loading...</p>');
        // $('div.pager').hide();
        $('#table').prepend('<img id="loadcat" src="fidgetSpinner.gif" />')
        if (endDateSelect < startDateSelect) {
            $('#table').prepend('<img id="error" src="shining.gif" />');
            $('#loadcat').remove();
            $('#loadmsg').remove();
            $('.count').remove();
            // Click prevention removed
            $("body").find("*").removeAttr("disabled");
            $("body").find("a").unbind("click");
            $('#table tr').remove();
            $('#errorContainer').html('<em>Past time travel not possible: </em>End date cannot be before the start date.  Try again.');
            $('#errorContainer').css('display', 'block');
            $('#error-box').css('display', 'block');
            document.getElementById("errorContainer").style.color = "red";
        }

        $('#table tbody').off('click', '.summary');


        Promise.all([
                queryYahoo(startDateSelect, endDateSelect).then(parseYahooResponse)
                .then(data => {
                    return data;
                    // console.log('Yahoo data:', data);
                }),
                getNetsphere(startDateSelect, endDateSelect),
                getTune(startDateSelect, endDateSelect),
                getOpenMail(startDateSelect, endDateSelect)
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
                // Click prevention removed
                $("body").find("*").removeAttr("disabled");
                $("body").find("a").unbind("click");
                $('#loadcat').remove();
                $('#loadmsg').remove();
                $('div.pager').show();
                // console.log(data);
                return data;
            }).catch(function (err) {
                $('.loader').remove();
                $('.count').remove();
                $('#table').prepend('<img id="error" src="shining.gif" />')
                $('#table').remove();
                $('#errorContainer').html('Oh no! Something broke. Try refreshing the page.');
                $('#errorContainer').css('display', 'block');
                $('#error-box').css('display', 'block');
                document.getElementById("errorContainer").style.color = "red";
                console.log(err);

            });
    });

});