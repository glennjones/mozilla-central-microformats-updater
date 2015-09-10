/*
Microformats Test Suite - Downloaded from github repo: glennjones/tests version v0.1.18 
Mocha integration test from: microformats-v1/hreview/implieditem
The test was built on Wed Aug 05 2015 14:46:59 GMT+0100 (BST)
*/

assert = chai.assert;


describe('hreview', function() {
   var htmlFragment = "<div class=\"hreview\">\n    <a class=\"item\" href=\"http://example.com/crepeoncole\">Crepes on Cole</a>\n    <p><span class=\"rating\">4.7</span> out of 5 stars</p>\n</div>";
   var expected = {"items":[{"type":["h-review"],"properties":{"item":[{"value":"Crepes on Cole","type":["h-item"],"properties":{"name":["Crepes on Cole"],"url":["http://example.com/crepeoncole"]}}],"rating":["4.7"],"name":["Crepes on Cole\n    4.7 out of 5 stars"]}}],"rels":{},"rel-urls":{}};

   it('implieditem', function(){
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
