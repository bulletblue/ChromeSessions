var currentDiv = document.getElementById("somediv");

function doc_insert(el) {
    document.body.insertBefore(el, currentDiv);
}

var Sessions = {

    startup: function() {
        var me = this;
        var button = document.createElement("BUTTON");
        button.onclick = me.getSession;
        
        var buttonText = document.createTextNode("Get Session");
        button.appendChild(buttonText);
        doc_insert(button);
    },

    getSession: function()  {
        var me = this;
        chrome.tabs.query({'currentWindow': true}, function(tabs) {
            var urls = [];
            for (var i = 0; i < tabs.length; i++) {
                urls[i] = tabs[i].url;
        }

        chrome.windows.create({url: urls, focused: true});
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