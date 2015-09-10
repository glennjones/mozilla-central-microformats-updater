/*
Microformats Test Suite - Downloaded from github repo: glennjones/tests version v0.1.18 
Mocha integration test from: microformats-v2/h-event/dates
The test was built on Wed Aug 05 2015 14:46:59 GMT+0100 (BST)
*/

assert = chai.assert;


describe('h-event', function() {
   var htmlFragment = "<section class=\"h-event\">\n\t<p><span class=\"p-name\">The 4th Microformat party</span> will be on:</p>\n\t<ul>\n\t\t<li><time class=\"dt-start\" datetime=\"2009-06-26T19:00-08:00\">26 July</time></li>\n\t\t<li><time class=\"dt-start\" datetime=\"2009-06-26T19:00-08\">26 July</time></li>\n\t\t<li><time class=\"dt-start\" datetime=\"2009-06-26T19:00-0800\">26 July</time></li>\n\t\t<li><time class=\"dt-start\" datetime=\"2009-06-26T19:00+0800\">26 July</time></li>\n\t\t<li><time class=\"dt-start\" datetime=\"2009-06-26T19:00+08:00\">26 July</time></li>\n\t\t<li><time class=\"dt-start\" datetime=\"2009-06-26T19:00Z\">26 July</time></li>\n\t\t<li><time class=\"dt-start\" datetime=\"2009-06-26t19:00-08:00\">26 July</time></li>\n\t\t<li><time class=\"dt-start\" datetime=\"2009-06-26 19:00:00-08:00\">26 July</time></li>\n\t</ul>\n</section>";
   var expected = {"items":[{"type":["h-event"],"properties":{"name":["The 4th Microformat party"],"start":["2009-06-26T19:00-08:00","2009-06-26T19:00-08","2009-06-26T19:00-0800","2009-06-26T19:00+0800","2009-06-26T19:00+08:00","2009-06-26T19:00Z","2009-06-26t19:00-08:00","2009-06-26 19:00:00-08:00"]}}],"rels":{},"rel-urls":{}};

   it('dates', function(){
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
