var currentDiv = document.getElementById("somediv");

function doc_insert(el) {
    document.body.insertBefore(el, currentDiv);
}

var Sessions = {

    startup: function() {
        var me = this;

        var getButton = document.createElement("BUTTON");
        getButton.onclick = me.getSession;
        var getButtonText = document.createTextNode("Get Session");
        getButton.appendChild(getButtonText);
        doc_insert(getButton);

        var setButton = document.createElement("BUTTON");
        setButton.onclick = me.saveSession;
        var setButtonText = document.createTextNode("Save Session");
        setButton.appendChild(setButtonText);
        doc_insert(setButton);
    },

    getSession: function()  {
        //chrome.windows.create({url: "http://yahoo.com", focused: true});

        chrome.storage.sync.get(null, function(items) {
            var newP = document.createElement("p");
            var someText = document.createTextNode(items.urls[0]);
            newP.appendChild(someText);
            doc_insert(newP);
            document.body.insertBefore(newP, currentDiv);
        });
    },

    saveSession: function() {
        var me = this;

        chrome.tabs.query({"currentWindow": true}, function(tabs) {
            var urls = [];
            for (var i = 0; i < tabs.length; i++) {
                urls[i] = tabs[i].url;
            }
            
            chrome.storage.sync.set({'urls': urls}, function() {
                alert ("Session Saved!");
            });
        });
    },

    blah: function() {
        alert(chrome.storage);
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