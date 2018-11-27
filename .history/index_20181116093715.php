<?php

define("SCRIPT_ROOT", "http://localhost:8000/tools/");
?>

<!doctype html>

<html class="no-js" lang="en" dir="ltr">

<head>
  <meta charset="utf-8">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HONeY</title>

  <!-- jquery -->
  <!-- <script src="https://tapstone.com/tools/js/vendor/jquery.js"></script> -->
  <script src='https://cdn.jsdelivr.net/g/lodash@4(lodash.min.js+lodash.fp.min.js)'></script>
  <script src="https://code.jquery.com/jquery-3.3.1.js"></script>


  <!-- styles -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.css">
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
  <!-- handling time so we can deal with OM's weird date querying -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.22.2/moment.min.js"></script>

  <!-- moar styling and ui stuff -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/foundation/6.4.3/js/foundation.min.js"></script>
  <!-- cookie madness-->
  <script src="https://cdn.jsdelivr.net/npm/js-cookie@2/src/js.cookie.min.js"></script>
  <!-- d3 crap to draw and export-->
  <script src="https://d3js.org/d3.v5.js"></script>
  <script src="https://d3js.org/d3-collection.v1.min.js"></script>
  <script src="https://unpkg.com/xlsx/dist/xlsx.full.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/1.3.8/FileSaver.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/TableExport/5.0.2/js/tableexport.min.js"></script>
  <script src="https://d3js.org/d3-time.v1.min.js"></script>
  <script src="https://d3js.org/d3-time-format.v2.min.js"></script>

  <!-- load jQuery and tablesorter scripts to deal with the sorting and filtering-->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.tablesorter/2.31.0/js/jquery.tablesorter.min.js"></script>
  <!-- tablesorter widgets -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.tablesorter/2.31.0/js/jquery.tablesorter.widgets.min.js"></script>
  <!-- this assists with paginating multiple tbodies-->
  <script src="https://mottie.github.io/tablesorter/js/widgets/widget-sortTbodies.js"></script>
  <!-- and of course the main one -->
  <script src="./scripts/main.js"></script>


</head>

<body>

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

  <br />

  <div class="row expanded">
    <div class="row">
      <div class="large-12 columns">
        <div class="callout">
          <h3> HONeY Tool</h3>
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
        <table id="table" class="tablesorter">
          <div class="loader">
            <div class="spinner"></div>
          </div>
        </table>
        <div id="buttons">
          <button class="button" id="first" data-id="first">
            First Page
          </button>
          <button class="button" id="previous-button" data-id="previous">
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
          </button>
        </div>
      </div>

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

</html>