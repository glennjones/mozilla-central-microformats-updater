/*
Microformats Test Suite - Downloaded from github repo: glennjones/tests version v0.1.18 
Mocha integration test from: microformats-v1/includes/hyperlink
The test was built on Wed Aug 05 2015 14:46:59 GMT+0100 (BST)
*/

assert = chai.assert;


describe('includes', function() {
   var htmlFragment = "<div class=\"vcard\">\n    <span class=\"name\">Ben Ward</span>\n    <a class=\"include\" href=\"#twitter\">Twitter</a>\n</div>\n<div class=\"vcard\">\n    <span class=\"name\">Dan Webb</span>\n    <a class=\"include\" href=\"#twitter\">Twitter</a>\n</div>\n\n<div id=\"twitter\">\n    <p class=\"org\">Twitter</p>\n    <p class=\"adr\">\n        <span class=\"street-address\">1355 Market St</span>,\n        <span class=\"locality\">San Francisco</span>, \n        <span class=\"region\">CA</span>\n        <span class=\"postal-code\">94103</span>\n    </p>\n</div>";
   var expected = {"items":[{"type":["h-card"],"properties":{"org":["Twitter"],"adr":[{"value":"1355 Market St,\n        San Francisco, \n        CA\n        94103","type":["h-adr"],"properties":{"street-address":["1355 Market St"],"locality":["San Francisco"],"region":["CA"],"postal-code":["94103"],"name":["1355 Market St,\n        San Francisco, \n        CA\n        94103"]}}],"name":["Ben Ward\n    Twitter\n    Twitter\n    \n        1355 Market St,\n        San Francisco, \n        CA\n        94103"]}},{"type":["h-card"],"properties":{"org":["Twitter"],"adr":[{"value":"1355 Market St,\n        San Francisco, \n        CA\n        94103","type":["h-adr"],"properties":{"street-address":["1355 Market St"],"locality":["San Francisco"],"region":["CA"],"postal-code":["94103"],"name":["1355 Market St,\n        San Francisco, \n        CA\n        94103"]}}],"name":["Dan Webb\n    Twitter\n    Twitter\n    \n        1355 Market St,\n        San Francisco, \n        CA\n        94103"]}},{"type":["h-adr"],"properties":{"street-address":["1355 Market St"],"locality":["San Francisco"],"region":["CA"],"postal-code":["94103"],"name":["1355 Market St,\n        San Francisco, \n        CA\n        94103"]}}],"rels":{},"rel-urls":{}};

   it('hyperlink', function(){
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
