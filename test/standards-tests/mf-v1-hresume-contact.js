/*
Microformats Test Suite - Downloaded from github repo: glennjones/tests version v0.1.18 
Mocha integration test from: microformats-v1/hresume/contact
The test was built on Wed Aug 05 2015 14:46:59 GMT+0100 (BST)
*/

assert = chai.assert;


describe('hresume', function() {
   var htmlFragment = "<div class=\"hresume\">\n    <div class=\"contact vcard\">\n        <p class=\"fn\">Tim Berners-Lee</p>\n        <p class=\"org\">MIT</p>\n        <p class=\"adr\">\n            <span class=\"street-address\">32 Vassar Street</span>, \n            <span class=\"extended-address\">Room 32-G524</span>, \n            <span class=\"locality\">Cambridge</span>,  \n            <span class=\"region\">MA</span> \n            <span class=\"postal-code\">02139</span>, \n            <span class=\"country-name\">USA</span>.  \n            (<span class=\"type\">Work</span>)\n        </p>\n        <p>Tel:<span class=\"tel\">+1 (617) 253 5702</span></p>\n        <p>Email:<a class=\"email\" href=\"mailto:timbl@w3.org\">timbl@w3.org</a></p>\n    </div>\n    <p class=\"summary\">Invented the World Wide Web.</p>\n</div>";
   var expected = {"items":[{"type":["h-resume"],"properties":{"contact":[{"value":"Tim Berners-Lee","type":["h-card"],"properties":{"name":["Tim Berners-Lee"],"org":["MIT"],"adr":[{"value":"32 Vassar Street, \n            Room 32-G524, \n            Cambridge,  \n            MA \n            02139, \n            USA.  \n            (Work)","type":["h-adr"],"properties":{"street-address":["32 Vassar Street"],"extended-address":["Room 32-G524"],"locality":["Cambridge"],"region":["MA"],"postal-code":["02139"],"country-name":["USA"],"name":["32 Vassar Street, \n            Room 32-G524, \n            Cambridge,  \n            MA \n            02139, \n            USA.  \n            (Work)"]}}],"tel":["+1 (617) 253 5702"],"email":["mailto:timbl@w3.org"]}}],"summary":["Invented the World Wide Web."],"name":["Tim Berners-Lee\n        MIT\n        \n            32 Vassar Street, \n            Room 32-G524, \n            Cambridge,  \n            MA \n            02139, \n            USA.  \n            (Work)\n        \n        Tel:+1 (617) 253 5702\n        Email:timbl@w3.org\n    \n    Invented the World Wide Web."]}}],"rels":{},"rel-urls":{}};

   it('contact', function(){
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
