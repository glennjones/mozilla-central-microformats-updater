mozilla-central microformats updater
================
The scripts for updating mozilla-central with the latest version of microformat-shiv microformats parser and all the related tests.

Installation
------------
Make sure your have a copy of node.js on your machine then using a command line navigate the 
directory containing the update.js and run the following commands: 

```sh	
	$ npm install
	$ node unpdate.js
```

The script will 

1. Checks the current build status of the project.
2. Checks the date of the last commit
3. Downloads and updates the following directories and files:
	* microformat-shiv.js (note: modern version)
	* test/lib
	* test/interface-tests
	* test/module-tests
	* test/standards-tests
	* test/static
4. Adds the EXPORTED_SYMBOLS to the bottom of microformat-shiv.js
5. Repath the links in test/module-tests/index.html file
	
	
Running tests
------------
The test are written for marionette testrunner. To run just the microformats parser excute the following command from the mozilla-central repo directory.	
```sh
$ ./mach marionette-test toolkit/components/microformats2/test/manifest.ini
```

Updating mozilla-central
------------
Details on updating mozilla-central can be found on MDN, but as a quick reminder.
```sh
$ hg pull -u
```

License
-------

[MIT][] © [Glenn Jones][]

[MIT]: ./License.md
[Glenn Jones]: https://github.com/glennjones


