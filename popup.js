var currentDiv = document.getElementById("somediv");

function doc_insert(el) {
    document.body.insertBefore(el, currentDiv);
}


var Sessions = {

    startup: function() {
        var me = Sessions;

        //Display saved sessions on start
        me.getSessions();

        var setButton = document.createElement("BUTTON");
        setButton.onclick = me.saveSession;
        var setButtonText = document.createTextNode("Save Session");
        setButton.appendChild(setButtonText);
        doc_insert(setButton);
    },

    getSessions: function()  {
        chrome.storage.sync.get(null, function(items) {
            console.log(items);
            for (var i = 0; i < items.length; i++) {
                var newP = document.createElement("p");
                var someText = document.createTextNode(items[i].sessionKey);
                newP.appendChild(someText);
                doc_insert(newP);
                document.body.insertBefore(newP, currentDiv);
            }
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
            
            chrome.storage.sync.set({"urls": urls, "sessionKey": sessionKey}, function() {
                var getLink = document.createElement("p");
                getLink.onclick = me.openSession;
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
  Sessions.startup();
});