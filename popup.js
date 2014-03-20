var currentDiv = document.getElementById("somediv");

function doc_insert(el) {
    document.body.insertBefore(el, currentDiv);
}

var Sessions = {

    startup: function() {
        var button = document.createElement("BUTTON");
        var buttonText = document.createTextNode("Click Me");
        button.appendChild(buttonText);
        doc_insert(button);

        //retrieve all sessions
    },

    getSession: function()  {
        chrome.tabs.query({'currentWindow': true}, function(tabs) {
            var newP = document.createElement("p");
            var someText = document.createTextNode(tabs[1].url);
            newP.appendChild(someText);
            doc_insert(newP);
            //document.body.insertBefore(newP, currentDiv);
        });
    },

    scroll: function() {
    }
};



document.addEventListener('DOMContentLoaded', function () {
  Sessions.startup();
});