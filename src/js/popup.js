/**
* Goat-Links
*
* popup.js script handling go-links creation storage and listing through popup page
*
*/
// Form overhead buttons
var goValueField;
var goLinkField;
var viewLinksButton;
var createLinkButton;
var allLinksDiv;


var viewLinksSet = false;
var goatLinksCache = {};

window.onload = function() {
	goValueField = document.getElementById("goValue");
	goLinkField = document.getElementById("goLink");

	createLinkButton = document.getElementById("createLinkButton");
	viewLinksButton = document.getElementById("viewLinksButton");

	createLinkButton.addEventListener("click", createGoLink);
	viewLinksButton.addEventListener("click", displayAllLinks);

	allLinksDiv = document.getElementById("linksDiv");
}

/**
* Creates new Goat-Link given the values in the form then clears it
*/
function createGoLink(event) {
	console.log("creating go link");
	// Sanitize input
	goValue = goValueField.value;
	goLink = goLinkField.value;
	if(goValue == "" || goLink == "") {
		console.log("cannot have blank input");
		goValue = "";
		goLink = "";
		return;
	}

	// Create Go Link in database
	chrome.storage.sync.set({ [goValue] : goLink }, function() {
		console.log("set %s to %s in storage", goValue, goLink);
	});
	goValueField.value = "";
	goLinkField.value = "";
}

/**
* Delete Goat-Link and remove it from the div table
* :param key: goValue key
* :param value: goLink value
* :param tr: table row to be deleted
*/
function deleteGoLink(key, value, tr) {
	if(confirm("Are you sure you want to delete this GOAT link?")) {
		chrome.storage.sync.remove(key, function() {
			console.log("deleting %s with %s", key, value);
		});
		tr.parentNode.removeChild(tr);
	} else {
		console.log("aborting delete...");
	}
}

/**
* Given a table, add a row to it containing key value and a button that deletes the row
* :param table: table element to append row to
* :param key: goValue key
* :param value: goLink value
* :param index: index of the row being added to the table used to id the element
*/
function addLinksTableRow(table, key, value, index) {
	var tr = document.createElement('tr');

	var keyTd = document.createElement('td');
	keyTd.appendChild(document.createTextNode(key));
	tr.appendChild(keyTd);

	var valueTd = document.createElement('td');
	valueTd.appendChild(document.createTextNode(value))
	tr.appendChild(valueTd);

	var deleteTd = document.createElement('td');
	var deleteBttn = document.createElement('button');
	deleteBttn.innerHTML = "delete";
	deleteBttn.onclick = function() { deleteGoLink(key, value, tr); }
	deleteTd.appendChild(deleteBttn);
	tr.appendChild(deleteBttn);
	
	table.appendChild(tr);
}

/**
* Displays all the links in the linksDiv and gives option for deleting them as well
*/
function displayAllLinks(event) {
	console.log("viewing or hiding links");
	// Hide the div from view if viewLinksSet
	if(viewLinksSet) {
		console.log("hiding links view")
		allLinksDiv.innerHTML = "";
		viewLinksButton.innerHTML = "View My Links";
		viewLinksSet = false;
	}
	// Populate the div if unset
	else {
		console.log("populating links view")
		chrome.storage.sync.get(null, function(data) {
			var table = document.createElement('table');
			var content = document.createElement('tbody');
			table.setAttribute("id", "linksTable");
			table.appendChild(content);

			index = 0;
			for(key in data) {
				addLinksTableRow(table, key, data[key], index)
				index++;
			}
			allLinksDiv.appendChild(table);
		});
		viewLinksButton.innerHTML = "Hide Links";
		viewLinksSet = true;
	}
}
