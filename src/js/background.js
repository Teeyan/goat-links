/**
* Goat-Links
*
* Primary background.js script and logic for goat-links interaction
*
* Event Flow:
*	When a go/<value> link is entered, parse out value and query chrome.storage.cache for the value
*
*	On value update, addition, and browser load we update the cache. This leaves room for transiet race condition
*	errors where the cache is not updated before a request is made. In practice, this is unlikely as we expect
*	the number of Goat-Links to be on the order of hundred so update should be relatively quick.
*
*/

var goatLinksCache = {}

function updateSnapshot() {
	chrome.storage.sync.get(null, function(data) {
		goatLinksCache = data;
	});
}

chrome.runtime.onInstalled.addListener(function() {
	console.log("Installed goat-links. You're the GOAT!")
});

// On browser creation and new tab creation / load get a snapshot of the goat-links in storage
chrome.windows.onCreated.addListener(function(content) {
	updateSnapshot();
});

chrome.tabs.onCreated.addListener(function(content) {
	updateSnapshot();
});

// Listener for when goat links values in storage are changed so that we can refresh our storage cache
chrome.storage.onChanged.addListener(function(changes, namespace) {
	updateSnapshot();
})

// Listener for main logic. Intercerpt url requests and only process if they follow the go/ convention
chrome.webRequest.onBeforeRequest.addListener(function(request) {
	var redirectUrl = chrome.extension.getURL("../html/redirect.html");
	// Grab the go/ value and search for a match in user log
	console.log("Received request for %s", request.url);
	goRegExp = new RegExp("go/");
	queryInd = request.url.search(goRegExp);
	
	// Check if out of bounds error is possible
	if(queryInd + 3 >= request.url.length || queryInd == -1 || queryInd > 8) {
		console.log("Request has no go/ value. Cannot redirect.");
		return;
	}

	console.log("searching for value match");
	goValue = request.url.substring(queryInd + 3,);
	
	if(goValue in goatLinksCache) {
		redirectUrl = goatLinksCache[goValue];
		console.log("found match, redirecting to %s", redirectUrl);
	} else {
		console.log("no redirect url found in Goat-Links storage snapshot");
	}
	return { "redirectUrl": redirectUrl };

}, { urls:["https://*/*", "http://*/*"] }, ["blocking"]);
