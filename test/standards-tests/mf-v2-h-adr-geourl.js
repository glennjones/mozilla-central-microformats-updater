/*
Microformats Test Suite - Downloaded from github repo: glennjones/tests version v0.1.18 
Mocha integration test from: microformats-v2/h-adr/geourl
The test was built on Wed Aug 05 2015 14:46:59 GMT+0100 (BST)
*/

assert = chai.assert;


describe('h-adr', function() {
   var htmlFragment = "<p class=\"h-adr\">\n    <a class=\"p-name u-geo\" href=\"geo:51.526421;-0.081067;crs=wgs84;u=40\">Bricklayer's Arms</a>, \n    <span class=\"p-locality\">London</span> \n</p>";
   var expected = {"items":[{"type":["h-adr"],"properties":{"name":["Bricklayer's Arms"],"geo":["geo:51.526421;-0.081067;crs=wgs84;u=40"],"locality":["London"],"url":["geo:51.526421;-0.081067;crs=wgs84;u=40"]}}],"rels":{},"rel-urls":{}};

   it('geourl', function(){
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
