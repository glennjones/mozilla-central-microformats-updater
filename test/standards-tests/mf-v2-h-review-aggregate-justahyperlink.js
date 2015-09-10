/*
Microformats Test Suite - Downloaded from github repo: glennjones/tests version v0.1.18 
Mocha integration test from: microformats-v2/h-review-aggregate/justahyperlink
The test was built on Wed Aug 05 2015 14:46:59 GMT+0100 (BST)
*/

assert = chai.assert;


describe('h-review-aggregate', function() {
   var htmlFragment = "<div class=\"h-review-aggregate\">\n    <h3 class=\"p-item h-item\">Mediterranean Wraps</h3>\n     <span class=\"p-summary\">\n        Customers flock to this small restaurant for their \n        tasty falafel and shawerma wraps and welcoming staff.\n    </span>\n    <span class=\"p-rating\">4.5</span> out of 5 \n</div>";
   var expected = {"items":[{"type":["h-review-aggregate"],"properties":{"item":[{"value":"Mediterranean Wraps","type":["h-item"],"properties":{"name":["Mediterranean Wraps"]}}],"summary":["Customers flock to this small restaurant for their \n        tasty falafel and shawerma wraps and welcoming staff."],"rating":["4.5"],"name":["Mediterranean Wraps\n     \n        Customers flock to this small restaurant for their \n        tasty falafel and shawerma wraps and welcoming staff.\n    \n    4.5 out of 5"]}}],"rels":{},"rel-urls":{}};

   it('justahyperlink', function(){
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
