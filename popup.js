var currentDiv = document.getElementById("somediv");

function doc_insert(el) {
    document.body.insertBefore(el, currentDiv);
}


var Sessions = {

    startup: function() {
        var me = Sessions;

        /*var getButton = document.createElement("BUTTON");
        getButton.onclick = me.getSession;
        var getButtonText = document.createTextNode("Get Session");
        getButton.appendChild(getButtonText);
        doc_insert(getButton);*/

        var setButton = document.createElement("BUTTON");
        setButton.onclick = me.saveSession;
        var setButtonText = document.createTextNode("Save Session");
        setButton.appendChild(setButtonText);
        doc_insert(setButton);
    },

    getSession: function()  {
        //OPEN THE SESSION HERE!
        //chrome.windows.create({url: "http://yahoo.com", focused: true});

        chrome.storage.sync.get(null, function(items) {
            var allLinks = "";
            for (var i = 0; i < items.urls.length; i++) {
                allLinks += items.urls[i] + ",";
            }

            var newP = document.createElement("p");
            var someText = document.createTextNode(allLinks);
            newP.appendChild(someText);
            doc_insert(newP);
            document.body.insertBefore(newP, currentDiv);
        });
    },

    saveSession: function() {
        var me = Sessions;

        chrome.tabs.query({"currentWindow": true}, function(tabs) {
            var urls = [];
            for (var i = 0; i < tabs.length; i++) {
                urls[i] = tabs[i].url;
            }

            sessionKey = Date.now();
            
            chrome.storage.sync.set({sessionKey: urls}, function() {
                var getLink = document.createElement("p");
                getLink.onclick = me.openSession(sessionKey);
                var getLinkText = document.createTextNode(sessionKey);
                getLink.appendChild(getLinkText);
                doc_insert(getLink);
            });
        });
    },

    openSession: function(sessionKey) {
        //OPEN THE SESSION HERE!
        //chrome.windows.create({url: "http://yahoo.com", focused: true});

        chrome.storage.sync.get(sessionKey.toString(), function(items) {
            chrome.windows.create({url: items.urls, focused: true});

            /*var allLinks = [];
            for (var i = 0; i < items.urls.length; i++) {
                allLinks = items.urls[i];
            }*/

            /*var newP = document.createElement("p");
            var someText = document.createTextNode(allLinks);
            newP.appendChild(someText);
            doc_insert(newP);
            document.body.insertBefore(newP, currentDiv);*/
        });
    }
};


document.addEventListener('DOMContentLoaded', function () {
  Sessions.startup();
});



/*var newP = document.createElement("p");
var someText = document.createTextNode(allTabs);
newP.appendChild(someText);
doc_insert(newP);
document.body.insertBefore(newP, currentDiv);*/