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
        getButton.appendChild(buttonText);
        doc_insert(getButton);

        var setButton = document.createElement("BUTTON");
        setButton.onclick = me.saveSession;
        var buttonText = document.createTextNode("Save Session");
        setButton.appendChild(buttonText);
        doc_insert(setButton);
    },

    getSession: function()  {
        chrome.windows.create({url: "http://yahoo.com", focused: true});
    },

    saveSession: function() {
        var me = this;
        var urls = [];
        chrome.tabs.query({"currentWindow": true}, function(tabs) {
            for (var i = 0; i < tabs.length; i++) {
                urls[i] = tabs[i].url;
            }
        });
        
        chrome.storage.sync.set({'urls': urls}, function() {
            alert ("plumpy stinks");
        });
    },

    blah: function() {
        alert(chrome.tabs);
    }
};


document.addEventListener('DOMContentLoaded', function () {
  Sessions.blah();
});



/*var newP = document.createElement("p");
var someText = document.createTextNode(allTabs);
newP.appendChild(someText);
doc_insert(newP);
document.body.insertBefore(newP, currentDiv);*/