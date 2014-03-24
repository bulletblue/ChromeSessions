var currentDiv = document.getElementById("somediv");

function doc_insert(el) {
    document.body.insertBefore(el, currentDiv);
}

var sessions = {

    startup: function() {
        //Display saved sessions on start
        this.getSessions();

        var setButton = document.createElement("BUTTON");
        setButton.onclick = this.saveSession;
        var setButtonText = document.createTextNode("Save Session");
        setButton.appendChild(setButtonText);
        doc_insert(setButton);
    },

    getSessions: function()  {
        chrome.storage.sync.get(null, function(items) {
            console.log(items);

            /*Create list of available sessions here. 
            Each session will click thru to a new window and open all associated tabs.*/
        });
    },

    saveSession: function() {
        var that = sessions;

        chrome.tabs.query({"currentWindow": true}, function(tabs) {
            var urls = [];
            for (var i = 0; i < tabs.length; i++) {
                urls[i] = tabs[i].url;
            }

            var sessionKey = Date.now();
            var sessionObj = {};
            sessionObj[sessionKey] = urls;
            
            console.log("session: " + sessionKey + " urls: " + urls.length);

            chrome.storage.sync.set(sessionObj, function() {
                var getLink = document.createElement("p");
                getLink.onclick = that.openSession;
                var getLinkText = document.createTextNode(sessionKey);
                getLink.appendChild(getLinkText);
                doc_insert(getLink);
            });
        });
    },

    openSession: function() {
        chrome.storage.sync.get(null, function(items) {
            //chrome.windows.create({url: items.urls, focused: true});

            var allLinks = '';
            for (var i = 0; i < items.urls.length; i++) {
                allLinks += items.urls[i] + ",";
            }

            var newP = document.createElement("p");
            var someText = document.createTextNode(allLinks);
            newP.appendChild(someText);
            doc_insert(newP);
            document.body.insertBefore(newP, currentDiv);
        });
    }
};


document.addEventListener('DOMContentLoaded', function () {
    //chrome.storage.sync.clear();
    sessions.startup();
});