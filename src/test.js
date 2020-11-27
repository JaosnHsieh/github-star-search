const x = require('x-ray')().timeout(8000);

x('https://github.com/matthewmueller/x-ray', {
    description:
      '#js-repo-pjax-container > div.container-xl.clearfix.new-discussion-timeline.px-3.px-md-4.px-lg-5 > div > div.gutter-condensed.gutter-lg.flex-column.flex-md-row.d-flex > div.flex-shrink-0.col-12.col-md-3 > div > div.BorderGrid-row.hide-sm.hide-md > div > p',
    readme: 'div.Box-body',
  }).then((...args)=>{
      console.log(`$ args`,args)
  })