<?php

define("SCRIPT_ROOT", "http://localhost:8000/tools/");
?>

<!doctype html>

<html class="no-js" lang="en" dir="ltr">

<head>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Taboola True PM Tool</title>

    <!-- jquery and lodash-->
    <script src="https://tapstone.com/tools/js/vendor/jquery.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.1.0/lodash.min.js"></script>

    <!-- styles -->
    <link rel="stylesheet" href="https://tapstone.com/tools/css/jquery-ui.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/foundation/6.4.3/css/foundation.min.css">
    <link rel="stylesheet" href="https://tapstone.com/tools/foundation-icons/foundation-icons.css" />
    <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/foundation-datepicker/1.5.6/css/foundation-datepicker.css" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/TableExport/5.0.0/css/tableexport.min.css">
    <link rel="stylesheet" href="https://rawgit.com/Mottie/tablesorter/master/css/theme.default.css">
    <link rel="stylesheet" href="./styles/style.css">

    <!-- scripts -->
    <!-- Minified version of `es6-promise-auto` -->
    <script src="https://cdn.jsdelivr.net/npm/es6-promise@4/dist/es6-promise.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/es6-promise@4/dist/es6-promise.auto.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/foundation-datepicker/1.5.6/js/foundation-datepicker.min.js"></script>
    <!-- moar styling and ui stuff -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/foundation/6.4.3/js/foundation.min.js"></script>
    <!-- d3 crap to draw and export-->
    <script src="https://d3js.org/d3.v5.js"></script>
    <script src="https://d3js.org/d3-collection.v1.min.js"></script>
    <script src="https://unpkg.com/xlsx/dist/xlsx.full.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.14.0/xlsx.full.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/1.3.8/FileSaver.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/TableExport/5.0.2/js/tableexport.min.js"></script>
    <script src="https://d3js.org/d3-time.v1.min.js"></script>
    <script src="https://d3js.org/d3-time-format.v2.min.js"></script>

    <!-- fuzzy searching -->
    <!-- load jQuery and tablesorter scripts to deal with the sorting and filtering-->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.tablesorter/2.31.0/js/jquery.tablesorter.min.js"></script>
    <!-- tablesorter widgets -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.tablesorter/2.31.0/js/jquery.tablesorter.widgets.min.js"></script>
    <!-- this assists with paginating multiple tbodies-->
    <script src="https://mottie.github.io/tablesorter/js/widgets/widget-sortTbodies.js"></script>
        <!--mobile-->
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.tablesorter/2.31.1/js/widgets/widget-reflow.min.js"></script>
    <!-- custom fuzzy search-->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/fuse.js/3.3.0/fuse.min.js"></script>
    <!-- and of course the main one -->
    <script src="./scripts/main.js"></script>


<body>

    <style type="text/css">
        #barLogo {
            max-width: 160px;
            vertical-align: text-top;
            padding: 0 0 0 10px;
        }
    </style>

    <style type="text/css">
        .ui-autocomplete {
            max-height: 200px;
            overflow-y: auto;
            overflow-x: hidden;
        }

        #barLogo {
            max-width: 160px;
            vertical-align: text-top;
            padding: 0 0 0 10px;
        }
    </style>
  <div class="top-bar">
    <div class="top-bar-title">
      <span data-responsive-toggle="responsive-menu" data-hide-for="medium">
        <button class="menu-icon dark" type="button" data-toggle></button>
      </span>
      <img id="barLogo" src="https://tapstone.com/tools/images/tapstoneLogo.png">
    </div>
    <div id="responsive-menu">
      <div class="top-bar-left">
        <ul class="dropdown menu" data-dropdown-menu>
          <li>
            <a href="https://tapstone.com/tools/">Tools</a>
            <ul class="menu vertical">
              <li>
                <a href="https://tapstone.com/tools/DoubleDateDashboard/">Double Date Dashboard</a>
              </li>
              <li>
                <a href="https://tapstone.com/tools/AffSub/">Aff Sub Report</a>
              </li>
              <li>
                <a href="https://tapstone.com/tools/FeedReport/">Feed Report</a>
              </li>
              <li>
                <a href="https://tapstone.com/tools/NetsphereReport/">Netsphere Report</a>
              </li>
              <li>
                <a href="https://tapstone.com/tools/PayoutRevEdit/">Payout & Revenue Editor</a>
              </li>
              <li>
                <a href="https://tapstone.com/tools/1QIS/">1QIS Daily Report</a>
              </li>
              <li>
                <a href="https://tapstone.com/tools/PublisherBidManager/">Publisher Bid Manager</a>
              </li>
              <li>
                <a href="https://tapstone.com/tools/HONeY/">Yahoo Tool</a>
              </li>
              <li>
                <a href="https://tapstone.com/tools/TaboolaTruePMReloaded/">Taboola TruePMv2</a>
              </li>
            </ul>
          </li>
        </ul>
      </div>
      <div class="top-bar-right">
      </div>
    </div>
  </div>
    <br />

    <div class="row expanded">
        <div class="row"> </div>
        <div class="large-12 columns">
            <div class="callout">
                <h3>Taboola Reloaded Tool</h3>
                <p>Make reports for a chosen range of dates.</p>
                <p style="display: inline-block; margin: 5px;">Data ready from Netsphere?
                    <div style="display: inline-block; margin: 5px;" id="netsphereStatus"></div>
                </p>
            </div>
        </div>
    </div>
    <div class="row">
        <div class="large-12 columns">
            <div class="callout" id="error-box">
                <div id="errorContainer"></div>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="large-12 columns" id="date-pickers">
            <form>
                <div class="small-4 large-2 columns" id="start-date-box">
                    <label for="start-date" class="text-right left">Start Date</label>
                    <input type="text" id="start-date">
                </div>
                <div class="small-4 large-2 columns" id="end-date-box">
                    <label for="end-date" class="text-right left">End Date</label>
                    <input type="text" id="end-date">
                </div>
                <div class="small-4 large-4 columns"></div>
            </form>
        </div>
    </div>
    <div class="row" style="width: 100%;">
        <div class="large-12 columns">
            <div id="table-wrapper"></div>
            <div class="small-4 large-4 columns" id="search-wrapper">
                <input class="search" type="search" data-column="any" placeholder="Search...">
            </div>
            <div id="buttons" class="small-4 large-4 columns">
             <button class="button" id="showEverything" data-id="showEverything">
                    Show All
                </button>
                <button class="button" id="collapseEverything" data-id="collapseEverything">
                    Collapse All
                </button>
                <!-- <button class="button" id="first" data-id="first">
                    First Page
                </button> -->
                <!-- <button class="button" id="previous-button" data-id="previous">
                    Prev 25
                </button>
                <button class="button" id="next-button" data-id="next">
                    Next 25
                </button>
                <button class="button" id="last" data-id="last">
                    Last Page
                </button>
                <button id="all-button" class="button hollow" data-id="all">
                    Show All
                </button> -->
            </div>
            <table id="table" class="tablesorter-default">
                <div class="loader">
                    <div class="spinner"></div>
                </div>
            </table>
        </div>
    </div>
    </div>

    </div>
    <br />
    <br />
    <br />
    <br />
    </div>


</body>
<script src="/tools/js/vendor/what-input.js"></script>
<script src="/tools/js/vendor/foundation.js"></script>
<script src="/tools/js/app.js"></script>

</html>