describe('My First Test', function () {
  it('Does not do much!', function () {
    expect(true).to.equal(true)
  })
})

describe('Visit Cypress', function () {
  it('Visits the test tool site', function () {
    cy.visit('https://example.cypress.io')
  })
})

describe('Visit HybridTheory Test', function () {
  it('Visits the server version', function () {
    cy.visit('https://tapstone.com/tools/HybridTheory/', {
      auth: {
        username: 'tapstone',
        password: 'tools123!'
      }
    })
  })
})

describe('Get Netsphere Test', function () {
  it('Visits the netsphere api', function () {
    cy.server() // enable response stubbing
    cy.route({
      method: 'GET', // Route all GET requests
      url: 'https://tapstone.com/tools/includes/netsphereData.php?startDate=2018-08-01&endDate=2018-08-01',
      auth: {
        username: 'tapstone',
        password: 'tools123!'
      },
      response: [] // and force the response to be: []
    })
  })
})

describe('HasOffers API Test', function () {
  it('Visits the has offers api', function () {
    cy.server() // enable response stubbing
    cy.route({
      method: 'GET', // Route all GET requests
      url: 'https://tsh.api.hasoffers.com/Apiv3/json?NetworkToken=NETXqfUQYBBISOBfs6ixG8BeFg5sKe&Target=Report&Method=getStats&fields[]=Affiliate.company&fields[]=Stat.revenue&fields[]=Stat.offer_id&fields[]=Stat.date&fields[]=Stat.affiliate_id&fields[]=Offer.name&sort[Stat.revenue]=desc&limit=1000000&page=1&data_start=2018-08-01&data_end=2018-08-01',
      response: [] // and force the response to be: []
    })
  })
})

describe('Get Taboola Backend Test', function () {
  it('Visits the taboola api backend', function () {
    cy.server() // enable response stubbing
    cy.route({
      method: 'GET', // Route all GET requests
      url: 'https://tapstone.com/tools/includes/taboolaReportRequest.php?account=tapstone-auto-sc&start_date=2018-08-01&end_date=2018-08-01',
      response: [] // and force the response to be: []
    })
  })
})

describe('Revisit HybridTheory Test', function () {
  it('Visits the server version again', function () {
    cy.visit('https://tapstone.com/tools/HybridTheory/', {
      auth: {
        username: 'tapstone',
        password: 'tools123!'
      }
    })
  })
})

describe('Download CSV Test', function () {
  it('Clicks the button to export to csv', function () {
    cy.get('.exportCsvButton', { timeout: 15000 } ).click()
  })
})

describe('Download XLSX Test', function () {
  it('Clicks the button to export to excel', function () {
    cy.get('.exportExcelButton', { timeout: 15000 }).click()
  })
})

describe('Navbar Test', function () {
  it('Checks to see if there is a ul navbar containing the word tools so we have the navbar here', function () {
    cy.get('ul')})
})

describe('Table row Test', function () {
  it('Checks to see if there is a table row in the completed page', function () {
    cy.get('tr')})
})

describe('Table detail Test', function () {
  it('Checks to see if there is a table row of the details in the completed page', function () {
    cy.get('tr.detail-row')})
})

describe('Scrolling header test', function () {
  it('Scrolls to the head of the table', function () {
    cy.get('ul:first').scrollIntoView() // Scrolls 'footer' into view
  })
})

describe('Table summary Test', function () {
  it('Checks to see if there is a table row of the summary in the completed page', function () {
    cy.get('tr.group')})
})

describe('Scrolling header test', function () {
  it('Scrolls to the head of the table', function () {
    cy.get('ul:first').scrollIntoView() // Scrolls 'footer' into view
  })
})

describe('Screenshot Test', function () {
  it('takes a screenshot upon failed tests', function () {
    // screenshot will be saved as
    // cypress/screenshots/special_spec.js/my tests -- takes a screenshot.png
    cy.screenshot('/cypress/screenshots/special_spec.js/')
  })
})

describe('Logs Test', function () {
  it('logs while testing', function () {
    cy.log('Cypress is logging in a test')

  })
})

describe('Dates - start date test', function () {
  it('Checks the start date and puts in a new one', function () {
    cy.get('#start-date').type('{backspace}{enter}')
    cy.get('#start-date').type('{enter}')
  })
})

describe('Scrolling header test', function () {
  it('Scrolls to the head of the table', function () {
    cy.get('ul:first').scrollIntoView() // Scrolls 'footer' into view
  })
})

describe('Toggle open the details of the entry', function () {
  it('Clicks the button to open up the details of a particular entry', function () {
    cy.get('tr.group:first', { timeout: 35000 }).should('be.visible');
    cy.get('ul:first').scrollIntoView();
    cy.get('button.showDetails:first', {force: true}, { timeout: 35000 } ).click()
  })
})

describe('Download CSV Test with more days', function () {
  it('Clicks the button to export to csvand shows all dates', function () {
    cy.get('.exportCsvButton', { timeout: 15000 } ).click()
  })
})

describe('Download XLSX Test with more days', function () {
  it('Clicks the button to export to excel and should show all dates', function () {
    cy.get('.exportExcelButton', { timeout: 15000 }).click()
  })
})


describe('Toggle closed the details of the entry', function () {
  it('Clicks the button to close the details of a particular entry', function () {
    cy.get('tr.detail-row', {force: true}, {multiple: true}).should('be.visible');
    cy.get('button.showDetails:first').scrollIntoView();
    cy.get('button.showDetails:first', {force: true}, { timeout: 35000 } ).click()
  })
})

describe('Scrolling footer test', function () {
  it('Goes to the foot of the table abd scrolls down', function () {
    cy.get('tfoot:first').scrollIntoView() // Scrolls 'footer' into view
  })
})

describe('Dates - end date test', function () {
  it('Checks the end date and puts in a new one', function () {
    cy.get('#end-date').type('{backspace}{enter}')
    cy.get('#end-date').type('{enter}')
  })
})

describe('Revisit yesterday Test', function () {
  it('Goes back to yesterday in the application', function () {
    cy.visit('https://tapstone.com/tools/HybridTheory/', {
      auth: {
        username: 'tapstone',
        password: 'tools123!'
      }
    })
  })
})
