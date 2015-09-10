/*!
	Parser
	
	Copyright (C) 2010 - 2015 Glenn Jones. All Rights Reserved.
	MIT License: https://raw.github.com/glennjones/microformat-shiv/master/license.txt
	Dependencies  dates.js, domutils.js, html.js, isodate,js, text.js, utilities.js, url.js
*/


var Modules = (function (modules) {
	
	/**
	 * constructor
	 *
	 */
	modules.Parser = function () {
		this.rootPrefix = 'h-';
		this.propertyPrefixes = ['p-', 'dt-', 'u-', 'e-'];
	};
	
	
	// create objects in case v1 maps modules don't load
	modules.maps = (modules.maps)? modules.maps : {};
	modules.rels = (modules.rels)? modules.rels : {};
	
	
	modules.Parser.prototype = {
		
		init: function(){
			this.rootNode = null;
			this.document = null;
			this.options = {
				'baseUrl': '',
				'filters': [],
				'textFormat': 'whitespacetrimmed',
				'dateFormat': 'auto'
			};
			this.rootID = 0;
			this.errors = [];
		},
		
		
		/**
		 * internal parse function 
		 *
		 * @param  {Object} options
		 * @return {Object}
		 */
		get: function(options) {
			var out = this.formatEmpty(),
				data = [],
				rels;
	
			this.init();
			options = (options)? options : {};
			this.mergeOptions(options);
			this.getDOMContext( options );
				
			// if we do not have any context create error
			if(!this.rootNode || !this.document){
				this.errors.push('No options.node was provided and no document object could be found.');
			}else{
			
				// only parse h-* microformats if we need too
				// this is added to speed up parsing 
				if(this.hasMicroformats(this.rootNode, options)){
					this.prepareClonedDOM( options );
			
					if(this.options.filters.length > 0){
						// parse flat list of items
						var newRootNode = this.findFilterNodes(this.rootNode, this.options.filters);
						data = this.walkRoot(newRootNode);
					}else{
						// parse whole document from root
						data = this.walkRoot(this.rootNode);
					}
		
					out.items = data;
					// dont clearup DOM if it was cloned
					if(modules.domUtils.canCloneDocument(this.document) === false){
						this.clearUpDom(this.rootNode);
					}
				}
				
				// find any rels
				if(this.findRels){
					rels = this.findRels(this.rootNode);
					out.rels = rels.rels;
					out['rel-urls'] = rels['rel-urls'];
					if(rels.alternate){
						out.alternates = rels.alternate;
					}
				}
				
			}
			
			// drop memory usage ie cloned DOM
			this.init();

			if(this.errors.length > 0){
				return this.formatError();
			}
			return out;
		},
		
		
		/**
		 * parse to get parent microformat of passed node
		 *
		 * @param  {DOM Node} node
		 * @param  {Object} options
		 * @return {Object}
		 */
		getParent: function(node, options) {
			this.init();
			options = (options)? options : {};
			
			if(node && node.nodeType && node.nodeType === 1){
				return this.getParentTreeWalk(node, options);
			}else{
				this.errors.push('No node was provided or it was the wrong type of object.');
				return this.formatError();
			}
		},
		
		
		/**
		 * internal parse to get parent microformat by walking up the tree
		 *
		 * @param  {DOM Node} node
		 * @param  {Object} options
		 * @return {Object}
		 */
		getParentTreeWalk: function (node, options) {
			options = (options)? options : {};
			
			// recursive calls
		    if (arguments.length === 2) {
		        if (node.parentNode && node.nodeName !== 'BODY'){
		            return this.getParentTreeWalk(node.parentNode, options, 1);
				}else{
		            return this.formatEmpty();
				}
		    }
		    if (node !== null && node !== undefined) {
		        if (this.isMicroformat( node, options )) {
					// if we have match return microformats
					options.node = node;
		            return this.get( options );
		        }else{
					// no match keep looking there is no parent
		            if (node.parentNode){
		                return this.getParentTreeWalk(node.parentNode, options, 1);
					}else{
		                return this.formatEmpty();
					}
		        }
		    }else{
		        return this.formatEmpty();
		    }
		},

		
				
		/**
		 * configures what are the base DOM objects for parsing
		 *
		 * @param  {Object} options
		 */
		getDOMContext: function( options ){
				
			// if a node is passed in options use it
			if(options.node){
				this.rootNode = options.node;
				// if document is passed in as options.node get html element
				if(this.rootNode.nodeType === 9){
					this.document = this.rootNode;
					this.rootNode = modules.domUtils.querySelector(this.rootNode, 'html');
				}else{
					// if its DOM Node get parent DOM Document
					this.document = modules.domUtils.ownerDocument(this.rootNode);
				} 
			}

			// if no node is passed in options but there is a global document object use that
			if(!this.rootNode && document){
				this.rootNode = modules.domUtils.querySelector(document, 'html');
				this.document = document;
			}
			
		},
		
		
		/**
		 * prepares DOM before the parse beginning
		 *
		 * @param  {Object} options
		 * @return {Boolean}
		 */
		prepareClonedDOM: function( options ){
			var baseTag,
				href;
				
			// use current document to define baseUrl
			if(!options.baseUrl && this.document && this.document.location){
				this.options.baseUrl = this.document.location.href;
			}
			
			// find base tag to set baseUrl
			baseTag = modules.domUtils.querySelector(this.document,'base');
			if(baseTag) {
				href = modules.domUtils.getAttribute(baseTag, 'href');
				if(href){
					this.options.baseUrl = href;
				}
			}
			
			// get path to rootNode 
			// then clone document
			// then reset the rootNode to its cloned version in new document
			var path,
				newDocument,
				newRootNode; 
			
			path = modules.domUtils.getNodePath(this.rootNode);
			newDocument = modules.domUtils.cloneDocument(this.document);
			newRootNode = modules.domUtils.getNodeByPath(newDocument, path);
			
			// check results as early IE fails
			if(newDocument && newRootNode){
				this.document = newDocument;
				this.rootNode = newRootNode;	
			}
			
			// add includes
			if(this.addIncludes){
				this.addIncludes( this.document );
			}
						
			return (this.rootNode && this.document);
		},

							
		/**
		 * returns an empty structure with errors
		 *
		 *   @return {Object}
		 */
		formatError: function(){
			var out = this.formatEmpty();
			out.errors = this.errors;
			return out;
		},
		
		
		/**
		 * returns an empty structure
		 *
		 *   @return {Object}
		 */
		formatEmpty: function(){
			return {
			    'items': [],
			    'rels': {},
			    'rel-urls': {}
			};
		},
		
		
		/**
		 * add a new V1 mapping object to parser
		 *
		 * @param  {Array} maps
		 */
		add: function( maps ){
			maps.forEach(function(map){
				if(map && map.root && map.name && map.properties){
				modules.maps[map.name] = JSON.parse(JSON.stringify(map));	
				}
			});
		},

		
		// find uf's of a given type and return a dom and node structure of just that type of ufs
		findFilterNodes: function(rootNode, filters) {
			
			var newRootNode = this.document.createElement('div'),
				items = this.findRootNodes(rootNode, true),
				i = 0,
				x = 0,
				y = 0;
	
			if(items){
				i = items.length;		
				while(x < i) {
					// add v1 names
					y = filters.length;
					while (y--) {
						if(this.getMapping(filters[y])){
							var v1Name = this.getMapping(filters[y]).root;
							filters.push(v1Name);
						}
					}
					// append matching nodes into newRootNode
					y = filters.length;
					while (y--) {
						if(modules.domUtils.hasAttributeValue(items[x], 'class', filters[y])){
							var clone = modules.domUtils.clone(items[x]);
							modules.domUtils.appendChild(newRootNode, clone);
							break;
						}
					}
					x++;
				}
			}	
	
			return newRootNode;
		},
		
		
		/**
		 * get the count of microformats
		 *
		 * @param  {DOM Node} rootNode
		 * @return {Int}
		 */
		count: function( options ) {
			var out = {},
				items,
				classItems,
				x,
				i;
				
			this.init();
			options = (options)? options : {};	
			this.getDOMContext( options );
			
			// if we do not have any context create error
			if(!this.rootNode || !this.document){
				return {'errors': ['No options.node was provided and no document object could be found.']};
			}else{	
					
				items = this.findRootNodes( this.rootNode, true );	
				i = items.length;
				while(i--) {
					classItems = modules.domUtils.getAttributeList(items[i], 'class');
					x = classItems.length;
					while(x--) {
						// find v2 names
						if(modules.utils.startWith( classItems[x], 'h-' )){
							this.appendCount(classItems[x], 1, out);
						}
						// find v1 names
						for(var key in modules.maps) {
							// has v1 root but not also a v2 root so we dont double count
							if(modules.maps[key].root === classItems[x] && classItems.indexOf(key) === -1) {
								this.appendCount(key, 1, out);
							}
						}
					}
				}
				var relCount = this.countRels( options.node );
				if(relCount > 0){
					out.rels = relCount;
				}
	
				return out;
			}
		},
		
		
		/**
		 * appends data to output object for count
		 *
		 * @param  {string} name
		 * @param  {Int} count
		 * @param  {Object}
		 */
		appendCount: function(name, count, out){
			if(out[name]){
				out[name] = out[name] + count;
			}else{
				out[name] = count;
			}
		},	
		
		
		
		/**
		 * does a node have a class that marks it as a microformats root
		 *
		 * @param  {DOM Node} node
		 * @param  {Objecte} options
		 * @return {Boolean}
		 */
		isMicroformat: function( node, options ) {
			var classes,
				i;
				
			if(!node || !node.nodeType){
				return false;
			}
			
			// if documemt get topmost node
			if(node.nodeType === 9){
				node = modules.domUtils.querySelector(node, 'html');
			}
			
			// look for h-* microformats		
			classes = this.getUfClassNames(node);
			if(options && options.filters && modules.utils.isArray(options.filters)){
				i = options.filters.length;
				while(i--) {
					if(classes.root.indexOf(options.filters[i]) > -1){
						return true;
					}
				}
				return false;
			}else{
				return (classes.root.length > 0);
			}
		},	
		
		
		/**
		 * does a node or its children have microformats
		 *
		 * @param  {DOM Node} node
		 * @param  {Objecte} options
		 * @return {Boolean}
		 */
		hasMicroformats: function( node, options ) {
			var items,
				i;
			
			if(!node || !node.nodeType){
				return false;
			}
	
			// if documemt get topmost node
			if(node.nodeType === 9){
				node = modules.domUtils.querySelector(node, 'html');
			}
			
			// returns all microformats roots	
			items = this.findRootNodes( node, true );
			if(options && options.filters && modules.utils.isArray(options.filters)){
				i = items.length;
				while(i--) {
					if( this.isMicroformat( items[i], options ) ){
						return true;
					}
				}
				return false;
			}else{
				return (items.length > 0);
			}
		},		
			
	
		/**
		 * is the microformats type in the filter list
		 *
		 * @param  {Object} uf
		 * @param  {Array} filters
		 * @return {Boolean}
		 */
		shouldInclude: function(uf, filters) {
			var i;
	
			if(modules.utils.isArray(filters) && filters.length > 0) {
				i = filters.length;
				while(i--) {
					if(uf.type[0] === filters[i]) {
						return true;
					}
				}
				return false;
			} else {
				return true;
			}
		},
	
		
		/**
		 * finds microformat within the tree microformat a parent uf - child has to have properties to count
		 *
		 * @param  {DOM Node} rootNode
		 * @param  {String} ufName
		 * @return {Array}
		 */
		findChildItems: function(rootNode, ufName) {
			var items, 
				out = [],
				ufs = [],
				x,
				i,
				z,			
				y;
	
			items = this.findRootNodes(rootNode, true);
			if(items.length > 0) {
				i = items.length;
				x = 0; // 1 excludes parent
				while(x < i) {
					var classes = this.getUfClassNames(items[x], ufName);
					if(classes.root.length > 0 && classes.properties.length === 0) {
						ufs = this.walkTree(items[x], true);
						y = ufs.length;
						z = 0;
						while(z < y) {
							// make sure its a valid structure 
							if(ufs[z] && modules.utils.hasProperties(ufs[z].properties)) {
								out.push(ufs[z]);
							}
							z++;
						}
					}
					x++;
				}
			}
	
			return out;
		},
	
	
		/**
		 * finds all microformat roots in a rootNode
		 *
		 * @param  {DOM Node} rootNode
		 * @param  {Boolean} includeRoot
		 * @return {Array}
		 */
		findRootNodes: function(rootNode, includeRoot) {
			var arr = null,			
				out = [], 
				classList = [],
				items,
				x,
				i,
				y,
				key;
	
	
			// build any array of v1 root names    
			for(key in modules.maps) {
				if (modules.maps.hasOwnProperty(key)) {
					classList.push(modules.maps[key].root);
				}
			}
	
			// get all elements that have a class attribute  
			includeRoot = (includeRoot) ? includeRoot : false;
			if(includeRoot && rootNode.parentNode) {
				arr = modules.domUtils.getNodesByAttribute(rootNode.parentNode, 'class');
			} else {
				arr = modules.domUtils.getNodesByAttribute(rootNode, 'class');
			}
	
			// loop elements that have a class attribute
			x = 0;    
			i = arr.length;
			while(x < i) {
	
				items = modules.domUtils.getAttributeList(arr[x], 'class');
	
				// loop classes on an element
				y = items.length;
				while(y--) {
					// match v1 root names 
					if(classList.indexOf(items[y]) > -1) {
						out.push(arr[x]);
						break;
					}
	
					// match v2 root name prefix
					if(modules.utils.startWith(items[y], 'h-')) {
						out.push(arr[x]);
						break;
					}
				}
	
				x++;
			}
			return out;
		},
		
		
		/**
		 * starts the tree walk to find microformats
		 *
		 * @param  {DOM Node} node
		 * @return {Array}
		 */
		walkRoot: function(node){
			var context = this,
				classes,
				items = [],
				out = [];
	
			classes = this.getUfClassNames(node);
			// if a root uf node
			if(classes && classes.root.length > 0){
				items = this.walkTree(node);
	
				if(items.length > 0){
					out = out.concat(items);
				}
			}else{
				// check if there are children and one of the children has a root uf
				if(node && node.children && node.children.length > 0 && this.findRootNodes(node, true).length > -1){
					for (var i = 0; i < node.children.length; i++) {
						var child = node.children[i];
						items = context.walkRoot(child);
						if(items.length > 0){
							out = out.concat(items);
						}
					}
				}
			}
			return out;
		},
	
	
		/**
		 * starts the tree walking for a single microformat
		 *
		 * @param  {DOM Node} node
		 * @return {Array}
		 */
		walkTree: function(node) {
			var classes,
				out = [],
				obj,
				itemRootID;
	
			// loop roots found on one element
			classes = this.getUfClassNames(node);
			if(classes && classes.root.length && classes.root.length > 0){
	
				this.rootID++;
				itemRootID = this.rootID;
				obj = this.createUfObject(classes.root);
	
				this.walkChildren(node, obj, classes.root, itemRootID, classes);
				if(this.impliedRules){
					this.impliedRules(node, obj, classes);
				}
				out.push(obj);
			
				
			}
			return out;
		},
	
	
		/**
		 * finds child properties of microformat
		 *
		 * @param  {DOM Node} node
		 * @param  {Object} out
		 * @param  {String} ufName
		 * @param  {Int} rootID
		 * @param  {Object} parentClasses
		 */
		walkChildren: function(node, out, ufName, rootID, parentClasses) {
			var context = this,
				rootItem,
				itemRootID,
				value,
				propertyName,
				i,
				x,
				y,
				z, 
				child;
	
			y = 0;
			z = node.children.length;
			while(y < z) {
				child = node.children[y];
		
				// get uf classes for this single element
				var classes = context.getUfClassNames(child, ufName);
	
				// a property which is a microformat
				if(classes.root.length > 0 && classes.properties.length > 0 && !child.addedAsRoot) {
					// create object with type, property and value
					rootItem = context.createUfObject(
						classes.root, 
						modules.text.parse(this.document, child, context.options.textFormat)
					);
					
					// modifies value with "implied value rule"
					if(parentClasses && parentClasses.root.length === 1 && parentClasses.properties.length === 1){
						if(context.impliedValueRule){
							out = context.impliedValueRule(out, parentClasses.properties[0], classes.properties[0], value);
						}
					}
	
					// add the microformat as an array of properties
					propertyName = context.removePropPrefix(classes.properties[0]);
					if(out.properties[propertyName]) {
						out.properties[propertyName].push(rootItem);
					} else {
						out.properties[propertyName] = [rootItem];
					}
					context.rootID++;
					// used to stop duplication in heavily nested structures
					child.addedAsRoot = true;
					
	
					x = 0;
					i = rootItem.type.length;
					itemRootID = context.rootID;
					while(x < i) {
						context.walkChildren(child, rootItem, rootItem.type, itemRootID, classes);
						x++;
					}
					if(this.impliedRules){
						context.impliedRules(child, rootItem, classes);
					}
	
				}
	
				// a property which is NOT a microformat and has not been use for a given root element
				if(classes.root.length === 0 && classes.properties.length > 0) {
					
					x = 0;
					i = classes.properties.length;
					while(x < i) {
	
						value = context.getValue(child, classes.properties[x], out);
						propertyName = context.removePropPrefix(classes.properties[x]);
						
						// modifies value with "implied value rule"
						if(parentClasses && parentClasses.root.length === 1 && parentClasses.properties.length === 1){
							if(context.impliedValueRule){
								out = context.impliedValueRule(out, parentClasses.properties[0], classes.properties[x], value);
							}
						}
	
						// if the value is not empty 
						// and we have not added this value into a property with the same name already
						if(value !== '' && !context.hasRootID(child, rootID, propertyName)) {
						//if(value !== '') {
							// add the property as a an array of properties 
							if(out.properties[propertyName]) {
								out.properties[propertyName].push(value);
							} else {
								out.properties[propertyName] = [value];
							}
							// add rootid to node so we track it use
							context.appendRootID(child, rootID, propertyName);
						}
						x++;
					}
	
					context.walkChildren(child, out, ufName, rootID, classes);
				}
	
				// if the node has no uf classes, see if its children have
				if(classes.root.length === 0 && classes.properties.length === 0) {
					context.walkChildren(child, out, ufName, rootID, classes);
				}
				
				
				// if the node is child root that should be add to children tree
				
				if(classes.root.length > 0 && classes.properties.length === 0) {
		
					// create object with type, property and value
					rootItem = context.createUfObject(
						classes.root, 
						modules.text.parse(this.document, child, context.options.textFormat)
					);

					// add the microformat as an array of properties
					if(!out.children){
						out.children =  [];
					}

					if(!context.hasRootID(child, rootID, 'child-root')) {
						out.children.push(rootItem);
						context.appendRootID(child, rootID, 'child-root');
						context.rootID++;
					}

					x = 0;
					i = rootItem.type.length;
					itemRootID = context.rootID;
					while(x < i) {
						context.walkChildren(child, rootItem, rootItem.type, itemRootID, classes);
						x++;
					}
					if(context.impliedRules){
						context.impliedRules(child, rootItem, classes);
					}
					
				}
				
	
	
				y++;
			}
	
		},
	
	
		/**
		 * gets the value of a property from a node
		 *
		 * @param  {DOM Node} node
		 * @param  {String} className
		 * @param  {Object} uf
		 * @return {String || Object}
		 */
		getValue: function(node, className, uf) {
			var value = '';
	
			if(modules.utils.startWith(className, 'p-')) {
				value = this.getPValue(node, true);
			}
	
			if(modules.utils.startWith(className, 'e-')) {
				value = this.getEValue(node);
			}
	
			if(modules.utils.startWith(className, 'u-')) {
				value = this.getUValue(node, true);
			}
	
			if(modules.utils.startWith(className, 'dt-')) {
				value = this.getDTValue(node, className, uf, true);
			}
			return value;
		},
	
	
		/**
		 * gets the value of node which contain 'p-' property
		 *
		 * @param  {DOM Node} node
		 * @param  {Boolean} valueParse
		 * @return {String}
		 */
		getPValue: function(node, valueParse) {
			var out = '';
			if(valueParse) {
				out = this.getValueClass(node, 'p');
			}
	
			if(!out && valueParse) {
				out = this.getValueTitle(node);
			}
	
			if(!out) {
				out = modules.domUtils.getAttrValFromTagList(node, ['abbr'], 'title');
			}
	
			if(!out) {
				out = modules.domUtils.getAttrValFromTagList(node, ['data'], 'value');
			}
	
			if(node.name === 'br' || node.name === 'hr') {
				out = '';
			}
	
			if(!out) {
				out = modules.domUtils.getAttrValFromTagList(node, ['img', 'area'], 'alt');
			}
	
			if(!out) {
				out = modules.text.parse(this.document, node, this.options.textFormat);
			}
	
			return(out) ? out : '';
		},
	
	
		/**
		 * gets the value of node which contain 'e-' property
		 *
		 * @param  {DOM Node} node
		 * @return {Object}
		 */
		getEValue: function(node) {
					
			var out = {value: '', html: ''};
	
			// replace all relative links with absolute ones where it can
			function expandUrls(node, attrName, baseUrl){
				var i,
					nodes,
					attr;
	
				nodes = modules.domUtils.getNodesByAttribute(node, attrName);
				i = nodes.length;
				while (i--) {
					try{
						// the url parser can blow up if the format is not right
						attr = modules.domUtils.getAttribute(nodes[i], attrName);
						if(attr && attr !== '' && baseUrl !== '' && attr.indexOf(':') === -1) {
							//attr = urlParser.resolve(baseUrl, attr);
							attr = modules.url.resolve(attr, baseUrl);
							modules.domUtils.setAttribute(nodes[i], attrName, attr);
						}	
					}catch(err){
						// do nothing convert only the urls we can leave the rest as they where
					}
				}
			}
			
			expandUrls(node, 'src', this.options.baseUrl);
			expandUrls(node, 'href', this.options.baseUrl);
	
			out.value = modules.text.parse(this.document, node, this.options.textFormat);
			out.html = modules.html.parse(node);
	
			return out;
		},
		
		
		/**
		 * gets the value of node which contain 'u-' property
		 *
		 * @param  {DOM Node} node
		 * @param  {Boolean} valueParse
		 * @return {String}
		 */
		getUValue: function(node, valueParse) {
			// not sure this should be used for u property
			var out = '';
			if(valueParse) {
				out = this.getValueClass(node, 'u');
			}
	
			if(!out && valueParse) {
				out = this.getValueTitle(node);
			}
	
			if(!out) {
				out = modules.domUtils.getAttrValFromTagList(node, ['a', 'area'], 'href');
			}
	
			if(!out) {
				out = modules.domUtils.getAttrValFromTagList(node, ['img'], 'src');
			}
	
			if(!out) {
				out = modules.domUtils.getAttrValFromTagList(node, ['object'], 'data');
			}
	
			// if we have no protocal separator, turn relative url to absolute ones
			if(out && out !== '' && out.indexOf(':') === -1) {
				out = modules.url.resolve(out, this.options.baseUrl);
			}
	
			if(!out) {
				out = modules.domUtils.getAttrValFromTagList(node, ['abbr'], 'title');
			}
	
			if(!out) {
				out = modules.domUtils.getAttrValFromTagList(node, ['data'], 'value');
			}
	
			if(!out) {
				out = modules.text.parse(this.document, node, this.options.textFormat);
			}
	
			return(out) ? out : '';
		},
	

		/**
		 * gets the value of node which contain 'dt-' property
		 *
		 * @param  {DOM Node} node
		 * @param  {String} className
		 * @param  {Object} uf
		 * @param  {Boolean} valueParse
		 * @return {String}
		 */
		getDTValue: function(node, className, uf, valueParse) {
			var out = '';
	
			if(valueParse) {
				out = this.getValueClass(node, 'dt');
			}
	
			if(!out && valueParse) {
				out = this.getValueTitle(node);
			}
	
			if(!out) {
				out = modules.domUtils.getAttrValFromTagList(node, ['time', 'ins', 'del'], 'datetime');
			}
	
			if(!out) {
				out = modules.domUtils.getAttrValFromTagList(node, ['abbr'], 'title');
			}
	
			if(!out) {
				out = modules.domUtils.getAttrValFromTagList(node, ['data'], 'value');
			}
	
			if(!out) {
				out = modules.text.parse(this.document, node, this.options.textFormat);
			}
	
			if(out) {
				if(modules.dates.isDuration(out)) {
					// just duration
					return out;
				} else if(modules.dates.isTime(out)) {
					// just time or time+timezone
					if(uf) {
						uf.times.push([className, modules.dates.parseAmPmTime(out, this.options.dateFormat)]);
					}
					return modules.dates.parseAmPmTime(out, this.options.dateFormat);
				} else {
					// returns a date - uf profile 
					if(uf) {
						uf.dates.push([className, new modules.ISODate(out).toString( this.options.dateFormat )]);
					}
					return new modules.ISODate(out).toString( this.options.dateFormat );
				}
			} else {
				return '';
			}
		},
	
	
		/**
		 * appends a new rootid to a given node
		 *
		 * @param  {DOM Node} node
		 * @param  {String} id
		 * @param  {String} propertyName
		 */
		appendRootID: function(node, id, propertyName) {
			if(this.hasRootID(node, id, propertyName) === false){
				var rootids = [];
				if(modules.domUtils.hasAttribute(node,'rootids')){
					rootids = modules.domUtils.getAttributeList(node,'rootids');
				}
				rootids.push('id' + id + '-' + propertyName);
				modules.domUtils.setAttribute(node, 'rootids', rootids.join(' '));
			}
		},
	
	
		/**
		 * does a given node already have a rootid
		 *
		 * @param  {DOM Node} node
		 * @param  {String} id
		 * @param  {String} propertyName
		 * @return {Boolean}
		 */
		hasRootID: function(node, id, propertyName) {
			var rootids = [];
			if(!modules.domUtils.hasAttribute(node,'rootids')){
				return false;
			} else {
				rootids = modules.domUtils.getAttributeList(node, 'rootids');
				return (rootids.indexOf('id' + id + '-' + propertyName) > -1);
			}
		},
	
	

		/**
		 * gets the text of any child nodes with the class value
		 *
		 * @param  {DOM Node} node
		 * @param  {String} propertyName
		 * @return {String || null}
		 */
		getValueClass: function(node, propertyType) {
			var context = this,
				out = [],
				child,
				x,
				i;
	
			x = 0;
			i = node.children.length;
			while(x < i) {
				child = node.children[x];
				var value = null;
				if(modules.domUtils.hasAttributeValue(child, 'class', 'value')) {
					switch(propertyType) {
					case 'p':
						value = context.getPValue(child, false);
						break;
					case 'u':
						value = context.getUValue(child, false);
						break;
					case 'dt':
						value = context.getDTValue(child, '', null, false);
						break;
					}
					if(value) {
						out.push(modules.utils.trim(value));
					}
				}
				x++;
			}
			if(out.length > 0) {
				if(propertyType === 'p') {
					return modules.text.parseText( this.document, out.join(' '), this.options.textFormat);
				}
				if(propertyType === 'u') {
					return out.join('');
				}
				if(propertyType === 'dt') {
					return modules.dates.concatFragments(out,this.options.dateFormat).toString(this.options.dateFormat);
				}
			} else {
				return null;
			}
		},
		
		
		/**
		 * returns a single string of the 'title' attr from all 
		 * the child nodes with the class 'value-title' 
		 *
		 * @param  {DOM Node} node
		 * @return {String}
		 */
		getValueTitle: function(node) {
			var out = [],
				items,
				i,
				x;
	
			items = modules.domUtils.getNodesByAttributeValue(node, 'class', 'value-title');
			x = 0;
			i = items.length;		
			while(x < i) {
				if(modules.domUtils.hasAttribute(items[x], 'title')) {
					out.push(modules.domUtils.getAttribute(items[x], 'title'));
				}
				x++;
			}
			return out.join('');
		},
		
		
	   /**
		 * finds out weather a node has h-* class v1 and v2 
		 *
		 * @param  {DOM Node} node
		 * @return {Boolean}
		 */
		hasHClass: function(node){
			var classes = this.getUfClassNames(node);
			if(classes.root && classes.root.length > 0){
				return true;
			}else{
				return false;
			}
		},
	
	
		/**
		 * get both root and property class names form a node
		 *
		 * @param  {DOM Node} node
		 * @param  {Array} ufNameArr
		 * @return {Object}
		 */
		getUfClassNames: function(node, ufNameArr) {
			var context = this,
				out = {
					'root': [],
					'properties': []
				},
				classNames,
				key,
				items,
				item,
				i,
				x,
				z,
				y,
				map,
				prop,
				propName,
				v2Name,
				impiedRel,
				ufName;
	
	
			classNames = modules.domUtils.getAttribute(node, 'class');
			if(classNames) {
				items = classNames.split(' ');
				x = 0;
				i = items.length;
				while(x < i) {
	
					item = modules.utils.trim(items[x]);
	
					// test for root prefix - v2
					if(modules.utils.startWith(item, context.rootPrefix)) {
						out.root.push(item);
					}
					
					// test for property prefix - v2
					z = context.propertyPrefixes.length;
					while(z--) {
						if(modules.utils.startWith(item, context.propertyPrefixes[z])) {
							out.properties.push(item);
						}
					}
	
					// test for mapped root classnames v1
					for(key in modules.maps) {
						if(modules.maps.hasOwnProperty(key)) {
							// only add a root once
							if(modules.maps[key].root === item && out.root.indexOf(key) === -1) {
								// if root map has subTree set to true
								// test to see if we should create a property or root
								if(modules.maps[key].subTree && context.isSubTreeRoot(node, modules.maps[key], items) === false) {
									out.properties.push('p-' + modules.maps[key].root);
								} else {
									out.root.push(key);
								}
							}
						}
					}

					
					// test for mapped property classnames v1 -- ufNameArr is 
					if(ufNameArr){
						for (var a = 0; a < ufNameArr.length; a++) {
							ufName = ufNameArr[a];
							// get mapped property v1 microformat
							map = context.getMapping(ufName);
							if(map) {
								for(key in map.properties) {
									if (map.properties.hasOwnProperty(key)) {
										
										prop = map.properties[key];
										propName = (prop.map) ? prop.map : 'p-' + key;
	
										if(key === item) {
											if(prop.uf) {
												// loop all the classList make sure 
												//   1. this property is a root
												//   2. that there is not already a equivalent v2 property ie url and u-url on the same element
												y = 0;
												while(y < i) {
													v2Name = context.getV2RootName(items[y]);
													// add new root
													if(prop.uf.indexOf(v2Name) > -1 && out.root.indexOf(v2Name) === -1) {
														out.root.push(v2Name);
													}
													y++;
												}
												//only add property once
												if(out.properties.indexOf(propName) === -1) {
													out.properties.push(propName);
												}
											} else {
												if(out.properties.indexOf(propName) === -1) {
													out.properties.push(propName);
												}
											}
										}
									}

								}
							}
						}
					
					}
					
					x++;
	
				}
			}
	
	
			// finds any alt rel=* mappings for a given node/microformat
			if(ufNameArr && this.findRelImpied){
				for (var b = 0; b < ufNameArr.length; b++) {
					ufName = ufNameArr[b];
					impiedRel = this.findRelImpied(node, ufName);
					if(impiedRel && out.properties.indexOf(impiedRel) === -1) {
						out.properties.push(impiedRel);
					}
				}
			}
			
	
			return out;
		},

		
		/**
		 * given a V1 or V2 root name return mapping object
		 *
		 * @param  {String} name
		 * @return {Object || null}
		 */
		getMapping: function(name) {
			var key;
			for(key in modules.maps) {
				if(modules.maps[key].root === name || key === name) {
					return modules.maps[key];
				}
			}
			return null;
		},
	
		
		/**
		 * given a V1 root name returns a V2 root name ie vcard >>> h-card
		 *
		 * @param  {String} name
		 * @return {String || null}
		 */
		getV2RootName: function(name) {
			var key;
			for(key in modules.maps) {
				if(modules.maps[key].root === name) {
					return key;
				}
			}
			return null;
		},
	
	
		/**
		 * is subTree mapping should be a property or root
		 *
		 * @param  {DOM Node} node
		 * @param  {Object} map
		 * @param  {Array} classList
		 * @return {Boolean}
		 */
		isSubTreeRoot: function(node, map, classList) {
			var out,
				hasSecondRoot,
				i,
				x;
	
			out = this.createUfObject(map.name);
			hasSecondRoot = false;	
	
			// loop the classList to see if there is a second root
			x = 0;
			i = classList.length;	
			while(x < i) {
				var item = modules.utils.trim(classList[x]);
				for(var key in modules.maps) {
					if(modules.maps.hasOwnProperty(key)) {
						if(modules.maps[key].root === item && modules.maps[key].root !== map.root) {
							hasSecondRoot = true;
							break;
						}
					}
				}
				x++;
			}
	
			// walk the sub tree for properties that match this subTree
			this.walkChildren(node, out, map.name, null, null);
	
			if(modules.utils.hasProperties(out.properties) && hasSecondRoot === false) {
				return true;
			} else {
				return false;
			}
		},
	

		/**
		 * creates a blank microformats object
		 *
		 * @param  {String} name
		 * @param  {String} value
		 * @return {Object}
		 */
		createUfObject: function(names, value) {
			var out = {};
	
			// is more than just whitespace
			if(value && modules.utils.isOnlyWhiteSpace(value) === false) {
				out.value = value;
			}
			// add type ie ["h-card", "h-org"]
			if(modules.utils.isArray(names)) {
				out.type = names;
			} else {
				out.type = [names];
			}
			out.properties = {};
			out.times = [];
			out.dates = [];
			out.altValue = null;
			return out;
		},
	
		
		/**
		 * removes uf property prefixs from a text
		 *
		 * @param  {String} text
		 * @return {String}
		 */
		removePropPrefix: function(text) {
			var i;
	
			i = this.propertyPrefixes.length;
			while(i--) {
				var prefix = this.propertyPrefixes[i];
				if(modules.utils.startWith(text, prefix)) {
					text = text.substr(prefix.length);
				}
			}
			return text;
		},
	
	

		/**
		 * expandes all relative URLs in DOM structures
		 *
		 * @param  {DOM Node} node
		 * @param  {String} baseUrl
		 * @return {DOM Node}
		 */
		expandURLs: function(node, baseUrl){

			node = modules.domUtils.clone(node);
	
			function expand( nodeList, attrName ){
				if(nodeList && nodeList.length){
					var i = nodeList.length;
					while (i--) {
						// this gives the orginal text
						var href =  nodeList[i].getAttribute(attrName);
						if(href.toLowerCase().indexOf('http') !== 0){
							nodeList[i].setAttribute(attrName, modules.url.resolve(href, baseUrl));
						}
					}
				}
			}
			
			expand( modules.domUtils.getNodesByAttribute(node, 'href'), 'href' );
			expand( modules.domUtils.getNodesByAttribute(node, 'src'), 'src' );
			
			return node;
		},
	
	
		
		/**
		 * merges passed and default options -single level clone of properties
		 *
		 * @param  {Object} options
		 */
		mergeOptions: function(options) {
			var key;
			for(key in options) {
				if(options.hasOwnProperty(key)) {
					this.options[key] = options[key];
				}
			}
		},
		
		
		/**
		 * romoves all rootid attributes
		 *
		 * @param  {DOM Node} rootNode
		 */
		removeRootIds: function(rootNode){
			var arr,
				i;
				
			arr = modules.domUtils.getNodesByAttribute(rootNode, 'rootids');
			i = arr.length;
			while(i--) {
				modules.domUtils.removeAttribute(arr[i],'rootids');
			}
		},
		
		
		/**
		 * removes all changes made to DOM
		 *
		 * @param  {DOM Node} rootNode
		 */
		clearUpDom: function(rootNode){
			if(this.removeIncludes){
				this.removeIncludes(rootNode);
			}	
			this.removeRootIds(rootNode);
		}
		
	
	};
	
	
	modules.Parser.prototype.constructor = modules.Parser;

	return modules;

} (Modules || {}));


