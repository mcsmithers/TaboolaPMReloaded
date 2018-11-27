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
            // console.log(summedRevenues);
            return summedRevenues;
        }).fail(failFunction);


    $("body").find("*").attr("disabled", "disabled");
    $("body").find("a").click(function (e) {
        e.preventDefault();
    });

    console.log("Incoming data from HasOffers api...");

    const getTune = (startDateSelect, endDateSelect) => $.ajax({
            type: "GET",
            url: "https://tsh.api.hasoffers.com/Apiv3/json?NetworkToken=NETXqfUQYBBISOBfs6ixG8BeFg5sKe&Target=Report&Method=getStats&fields[]=Affiliate.company&fields[]=Stat.revenue&fields[]=Stat.offer_id&fields[]=Stat.conversions&fields[]=Stat.date&fields[]=Stat.affiliate_id&fields[]=Offer.name&sort[Stat.revenue]=desc&limit=1000000&page=1" + "&data_start=" + startDateSelect + "&data_end=" + endDateSelect,
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
                entry.date = date;
                entry.actions = Number(actions);
                entry.revenue = Number(revenue);

                return entry;
            })
            // console.log("Tune object looks like...");
            // console.log(tune);
            return tune;
        }).fail(failFunction);

    // // Params needed for backend to make the call for us
    const account = "tapstone";
    const xmlhttp = new XMLHttpRequest();
    var requestStatus;
    var request = "https://tapstone.com/tools/includes/taboolaReportRequest.php?account=";

    // // Failure function in case something is broken
    function failFunction(response) {
        $.busyLoadFull("hide", {
            // // Options here if we want more
        });
        $.busyLoadFull("show", {
            image: 'error.gif',
            text: 'Oops, something went wrong... try your request again'
        });
        console.log("ERROR: ")
        console.log(response)
        $('#errorContainer').html('Oh no! Something broke. <br/><b>Error: ' + response + '</b>.  Try refreshing the page.');
        $('#errorContainer').css('display', 'block');
        $('#error-box').css('display', 'block');
        document.getElementById("errorContainer").style.color = "red";
    }

    // // Loading for processing
    $.busyLoadFull("show", {
        image: 'fidgetSpinner.gif',
        text: 'Fetching data from Taboola.  Might take some time...'
    });
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

            // console.log("Taboola Data object looks like...");
            // console.log(taboola);
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

        // // Loading for processing
        $.busyLoadFull("show", {
            image: 'fidgetSpinner.gif',
            text: 'Processing data...'
        });
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
        // Loader changes
        $.busyLoadFull("hide", {
            // // Options here if we want more
        });
        $.busyLoadFull("show", {
            image: 'fidgetSpinner.gif',
            text: 'Yay!  Data is done, now processing and making the table'
        });

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

            const cost = Number(merged[index].cost);
            if (!isNaN(cost) && cost !== 0) {
                merged[index].cost = Number(cost.toFixed(2).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }));
                calcs.push(cost);
            } else {
                merged[index].cost = '';
                calcs.push(cost);
            }

            const revenue = Number(merged[index].revenue);
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

            const profitMargin = Number(profit / revenue);
            if (Number.isFinite(profitMargin) || !isNaN(profitMargin)) {
                merged[index].profitMargin = Number((profitMargin) * 100);
                calcs.push(profitMargin);
            } else {
                calcs.push(profitMargin);
            }

            const cpc = Number(cost / clicks);
            if (Number.isFinite(cpc) && !isNaN(cpc)) {
                merged[index].cpc = Number(cpc.toFixed(2));
                calcs.push(cpc);
            } else {
                merged[index].cpc = '';
                calcs.push(cpc);
            }

            const rpc = Number(revenue / clicks);
            if (Number.isFinite(rpc) && !isNaN(rpc)) {
                merged[index].rpc = Number(rpc.toFixed(2));
                calcs.push(rpc);
            } else {
                merged[index].rpc = '';
                calcs.push(rpc);
            }

            const rpa = Number(revenue / actions);
            if (Number.isFinite(rpa) && !isNaN(rpa)) {
                merged[index].rpa = Number(rpa.toFixed(2));
                calcs.push(rpa);
            } else {
                merged[index].rpa = '';
                calcs.push(rpa);
            }
        });

        // // Now that we have what we need, let's filter out the inactive accounts from the affiliates and offers that are blank
        merged = merged.filter(m => {
            return (m.affiliate !== '' && m.offer !== '' && m.cost !== ''); // v2 will have the option to do either all 3 filter or just to 2 so we see the entires with 0 cost

        });

        // console.log("Detail rows data");
        // console.log(merged);
        return merged;
    }

    function buildTableBodyEntries(merged) {
        // console.log(merged);
        // console.log("Merged and filtered data:");
        // console.log(merged);

        console.log("Generating table...");
        // // Loading for processing
        $.busyLoadFull("show", {
            image: 'fidgetSpinner.gif',
            text: 'Generating table...'
        });
        $("body").find("*").attr("disabled", "disabled");
        $("body").find("a").click(function (e) {
            e.preventDefault();
        });

        // // Datatables needs to clear anything existing before making new
        $("#report-table").dataTable().fnDestroy();
        // // Stop the previous group drawings if they exist so we can toggle the summaries and details
        $('#report-table tbody').off('click', '.group');


        // Get table to show up and loader to hide
        $(document).ajaxStop(function () {
            $('#report-table').fadeIn('fast');
        });

        // // Loader hides
        $.busyLoadFull("hide", {
            // // Options here if we want more
        });

        // Click prevention removed
        $("body").find("*").removeAttr("disabled");
        $("body").find("a").unbind("click");

        // affId_offId is where the table is getting grouped so we make all the same ids group together
        var collapsedGroups = {};

        var table = $('#report-table').DataTable({
            data: merged,
            columns: [{
                    // // This is the column for toggling buttons to show the summary details for that particular id over the range of dates
                    className: 'summaryBtnCol',
                    sortable: false,
                    orderable: false,
                    data: null,
                    defaultContent: ''
                },
                {
                    className: 'dateCol',
                    data: "date",

                },
                {
                    className: 'idCol',
                    data: "affId_offId",

                },
                {
                    data: "cost",
                    render: $.fn.dataTable.render.number(',', '.', 2, '$'),
                    className: 'costCol',

                },
                {
                    data: "revenue",
                    render: $.fn.dataTable.render.number(',', '.', 2, '$'),
                    className: 'revCol',


                },
                {
                    data: "profit",
                    render: $.fn.dataTable.render.number(',', '.', 2, '$'),
                    className: 'profCol',

                },
                {
                    data: "profitMargin",
                    className: 'pmCol',

                },
                {
                    data: "cpc",
                    render: $.fn.dataTable.render.number(',', '.', 2, '$'),
                    className: 'cpcCol',

                },
                {
                    data: "rpc",
                    render: $.fn.dataTable.render.number(',', '.', 2, '$'),
                    className: 'rpcCol',

                },
                {
                    data: "rpa",
                    render: $.fn.dataTable.render.number(',', '.', 2, '$'),
                    className: 'rpaCol',

                },
                {
                    data: "name",
                    className: 'campaignCol',

                },
                {
                    data: "offer",
                    className: 'offerCol',

                },
                {
                    data: "affiliate",
                    className: 'affCol',
                }
            ],
            columnDefs: [{
                    "visible": true,
                    "targets": 2
                },

                {
                    "targets": 6,
                    "render": function (data, type, row, meta) {
                        return type === 'display' && data !== '' ?
                            parseInt(data) + '%' :
                            parseInt(data);
                    }
                }
            ],
            order: [
                [2, 'asc']
            ],
            dom: 'B<"row"><"row"fl>rtip',
            lengthChange: true,
            lengthMenu: [
                [20, 50, 100, 500, -1],
                [20, 50, 100, 500, "All"]
            ],
            paging: true,
            buttons: [{
                    extend: 'csvHtml5',
                    text: '<i class="fi-save"></i> Save to CSV',
                    className: 'exportCsvButton',
                    filename: 'Multi-Api Report',
                    rows: '.detail-row',
                    exportOptions: {
                        columns: ':not(:eq(0))',
                        format: {
                            body: function (data, row, column, node) {
                                data = data.replace(/[$]/g, '');
                                data = data.replace(/<(?:.|\n)*?>/gm, '');
                                return data;
                            }
                        },
                        modifier: {
                            "search": 'none'
                        }
                    }
                },
                {
                    extend: 'excelHtml5',
                    text: '<i class="fi-save"></i> Save to Excel',
                    className: 'exportExcelButton',
                    filename: 'Multi-Api Report',
                    exportOptions: {
                        columns: ':not(:eq(0))',
                        rows: '.detail-row',
                        format: {
                            body: function (data, row, column, node) {
                                data = data.replace(/[$]/g, '');
                                // data = data.replace(/[%]/g, '');
                                data = data.replace(/<(?:.|\n)*?>/gm, '');
                                return data;
                            }
                        },
                        modifier: {
                            "search": 'none'
                        }
                    }
                }
            ],
            createdRow: function (row, data, dataIndex) {
                $(row).addClass('detail-row');
                if (startDateSelect !== endDateSelect) {
                    $('.detail-row').hide();
                }
            },
            rowGroup: {
                // Uses the 'row group' plugin
                startRender: function (rows, group) {

                    var totalCosts = rows
                        .data()
                        .pluck('cost')
                        .reduce(function (a, b) {
                            return a + b * 1;
                        }, 0);

                    var totalRev = rows
                        .data()
                        .pluck('revenue')
                        .reduce(function (a, b) {
                            return a + b * 1;
                        }, 0);

                    var totalProfit = rows
                        .data()
                        .pluck('profit')
                        .reduce(function (a, b) {
                            return a + b * 1;
                        }, 0);

                    var totalClicks = rows
                        .data()
                        .pluck('clicks')
                        .reduce(function (a, b) {
                            return a + b * 1;
                        }, 0);

                    var totalActions = rows
                        .data()
                        .pluck('actions')
                        .reduce(function (a, b) {
                            return a + b * 1;
                        }, 0);

                    var totalProfitMargin = parseInt((totalProfit) / (totalRev) * 100);

                    var totalCpc = totalCosts / totalClicks;
                    var totalRpc = totalRev / totalClicks;
                    var totalRpa = totalRev / totalActions;

                    // // CPC, RPC, RPA will go here
                    $('tr.group').each(function () {
                        // // Coloring in the summary profit margin values in the 7th column
                        $('td:nth-child(7)', this).each(function () {
                            var sumPmStr = $(this).text();
                            sumPmStr = sumPmStr.substring(0, sumPmStr.length - 1);
                            // console.log(sumPmStr);

                            if (sumPmStr < 0) {
                                $(this).css({
                                    'color': 'red'
                                });

                            }

                            if (sumPmStr >= 0 && sumPmStr <= 20) {
                                $(this).css({
                                    'color': '#FF9400'
                                });

                            }

                            if (sumPmStr > 20) {
                                $(this).css({
                                    'color': 'green'
                                });
                            }

                            if (sumPmStr == "") {
                                // console.log(sumPmStr);
                                $(this).css({
                                    'color': 'transparent'
                                });
                            }

                        });


                    $('td:nth-child(6)', this).each(function () {
                        var sumProfStr = $(this).text();
                        sumProfStr = sumProfStr.substring(1, sumProfStr.length - 1);
                        if (sumProfStr <= 0) {
                            $(this).css({
                                'color': 'red'
                            });
                        }
                    });

                    });

                    totalCosts = $.fn.dataTable.render.number(',', '.', 2, '$').display(totalCosts);
                    totalRev = $.fn.dataTable.render.number(',', '.', 2, '$').display(totalRev);
                    totalCpc = $.fn.dataTable.render.number(',', '.', 2, '$').display(totalCpc);
                    totalRpc = $.fn.dataTable.render.number(',', '.', 2, '$').display(totalRpc);
                    totalRpa = $.fn.dataTable.render.number(',', '.', 2, '$').display(totalRpa);

                    var summaryCampaign = rows
                        .data()
                        .pluck('name')[0];

                    var summaryOffer = rows
                        .data()
                        .pluck('offer')[0];

                    var summaryAffiliate = rows
                        .data()
                        .pluck('affiliate')[0];


                    if (startDateSelect !== endDateSelect) {
                        $('.group').show();
                        $('.detail-row').hide();
                    }

                    // Getting ready to animate the buttons
                    var thisButton = "button-" + group;

                    // Shutting off previous click events
                    $('#report-table tbody').off('click', "#" + thisButton);

                    // Turning on the click event to show more details
                    $("#report-table tbody").on("click", "#" + thisButton, function () {
                        if ($('#' + thisButton).css("transform") == 'none') {
                            $('#' + thisButton).css("transform", "rotate(90deg)");
                        } else {
                            $('#' + thisButton).css("transform", "");
                        }
                        $(this).parent().parent().nextUntil(".group").toggle(0);
                    });


                    return $('<tr/>')
                        .append('<td colspan="1"><button class="showDetails" id="button-' + group + '">&#9658;</button></td>')
                        .append('<td colspan="1">' + startDateSelect.slice(5) + ' to ' + endDateSelect.slice(5) + '</td>')
                        .append('<td colspan="1">' + group + '</td>')
                        .append('<td>' + totalCosts + '</td>')
                        .append('<td>' + totalRev + '</td>')
                        .append('<td>' + '$' + totalProfit.toFixed(2) + '</td>')
                        .append('<td>' + totalProfitMargin + '%' + '</td>')
                        .append('<td>' + totalCpc + '</td>')
                        .append('<td>' + totalRpc + '</td>')
                        .append('<td>' + totalRpa + '</td>')
                        .append('<td>' + summaryCampaign + '</td>')
                        .append('<td>' + summaryOffer + '</td>')
                        .append('<td>' + summaryAffiliate + '</td>')


                },
                dataSrc: 'affId_offId'
            },
            rowCallback: function (row, data, index, full) {
                // // Color-coding the profit margin
                pmCol = this.api().column(6).index('visible');
                if (data.profitMargin < 0) {
                    $('td', row).eq(pmCol).css('color', 'red');
                }
                if (data.profitMargin <= 20 && data.profitMargin >= 0) {
                    $('td', row).eq(pmCol).css('color', '#FF9400');
                    $('td', row).eq(pmCol).css('font-weight', 'bold');
                }
                if (data.profitMargin > 20) {
                    $('td', row).eq(pmCol).css('color', 'green');
                } else if (isNaN(data.profitMargin)) {
                    $('td', row).eq(pmCol).css('color', 'transparent');
                }

                // // Color coding the profits
                profCol = this.api().column(5).index('visible');
                if (data.profit < 0) {
                    $('td', row).eq(profCol).css('color', 'red');
                }

            }


        });

        console.log("Done unless we want to change dates!");

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
        startDateSelect = $('#start-date').val(); // update here before executing the chain.
        endDateSelect = $('#end-date').val();
        console.log("new start date is " + startDateSelect + " and end date is " + endDateSelect);
        $("body").find("*").attr("disabled", "disabled");
        $("body").find("a").click(function (e) {
            e.preventDefault();
        });

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