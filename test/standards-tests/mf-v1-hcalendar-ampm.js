/*
Microformats Test Suite - Downloaded from github repo: glennjones/tests version v0.1.18 
Mocha integration test from: microformats-v1/hcalendar/ampm
The test was built on Wed Aug 05 2015 14:46:59 GMT+0100 (BST)
*/

assert = chai.assert;


describe('hcalendar', function() {
   var htmlFragment = "<div class=\"vevent\">\n    <span class=\"summary\">The 4th Microformat party</span> will be on \n    <ul>\n        <li class=\"dtstart\">\n            <time class=\"value\" datetime=\"2009-06-26\">26 July</time>, from\n            <span class=\"value\">07:00:00pm \n        </span></li>\n        <li class=\"dtstart\">\n            <time class=\"value\" datetime=\"2009-06-26\">26 July</time>, from\n            <span class=\"value\">07:00:00am \n        </span></li>\n        <li class=\"dtstart\">\n            <time class=\"value\" datetime=\"2009-06-26\">26 July</time>, from\n            <span class=\"value\">07:00pm \n        </span></li>\n        <li class=\"dtstart\">\n            <time class=\"value\" datetime=\"2009-06-26\">26 July</time>, from\n            <span class=\"value\">07pm \n        </span></li>\n        <li class=\"dtstart\">\n            <time class=\"value\" datetime=\"2009-06-26\">26 July</time>, from\n            <span class=\"value\">7pm \n        </span></li>\n        <li class=\"dtstart\">\n            <time class=\"value\" datetime=\"2009-06-26\">26 July</time>, from\n            <span class=\"value\">7:00pm \n        </span></li>\n        <li class=\"dtstart\">\n            <time class=\"value\" datetime=\"2009-06-26\">26 July</time>, from\n            <span class=\"value\">07:00p.m. \n        </span></li>\n        <li class=\"dtstart\">\n            <time class=\"value\" datetime=\"2009-06-26\">26 July</time>, from\n            <span class=\"value\">07:00PM \n        </span></li>\n        <li class=\"dtstart\">\n            <time class=\"value\" datetime=\"2009-06-26\">26 July</time>, from\n            <span class=\"value\">7:00am \n        </span></li>\n    </ul>\n</div>";
   var expected = {"items":[{"type":["h-event"],"properties":{"name":["The 4th Microformat party"],"start":["2009-06-26T19:00:00","2009-06-26T07:00:00","2009-06-26T19:00","2009-06-26T19","2009-06-26T19","2009-06-26T19:00","2009-06-26T19:00","2009-06-26T19:00","2009-06-26T07:00"]}}],"rels":{},"rel-urls":{}};

   it('ampm', function(){
       var doc, dom, node, options, parser, found;
       dom = new DOMParser();
       doc = dom.parseFromString( htmlFragment, 'text/html' );
       options ={
       		'document': doc,
       		'node': doc,
       		'baseUrl': 'http://example.com'
       };
       found = Microformats.get( options );
       assert.deepEqual(found, expected);
   });
});
