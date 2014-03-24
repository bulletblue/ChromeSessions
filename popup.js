var currentDiv = document.getElementById("somediv");

function doc_insert(el) {
    document.body.insertBefore(el, currentDiv);
}

function sessionCount(obj){
    var length = 0;
    for (i in obj) {
        length++;
    }
    return length;
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

        var clearButton = document.createElement("BUTTON");
        clearButton.onclick = this.clear;
        var clearButtonText = document.createTextNode("Clear All");
        clearButton.appendChild(clearButtonText);
        doc_insert(clearButton);
    },

    getSessions: function() {
        var that = sessions;
        chrome.storage.sync.get(null, function(items) {
            for (item in items) {
                console.log(item);
                var session = document.createElement("p");
                //session.onclick =  that.openSession;
                
                session.addEventListener("click", function() {
                that.openSession(item);
                });
                
                var sessionName = document.createTextNode(item);
                session.appendChild(sessionName);
                doc_insert(session);
            }

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
                
                getLink.addEventListener("click", function() {
                    that.openSession(sessionKey);
                });
                
                var getLinkText = document.createTextNode(sessionKey);
                getLink.appendChild(getLinkText);
                doc_insert(getLink);
            });
        });
    },

    openSession: function(sessionKey) {
        chrome.storage.sync.get(sessionKey.toString(), function(items) {
            console.log(items[sessionKey]);
            chrome.windows.create({url: items[sessionKey], focused: true});
        });
    },

    clear: function() {
        chrome.storage.sync.clear();
        document.body.innerHTML = '';
        sessions.startup();
    }
};


document.addEventListener('DOMContentLoaded', function () {
    sessions.startup();
});