var currentDiv = document.getElementById("somediv");
var saveLock = 0;

function doc_insert(el) {
    document.body.insertBefore(el, currentDiv);
}

function keyExists(key) {
    var exists = false;
    console.log("start of func: " + exists);
    var items = chrome.storage.sync.get(null,function(items){});
    console.log(items);
    for (var item in items) {
        if (item == key) {
            exists = true;
            console.log("in conditional: " + exists);
        }
    }
    console.log("before return: " + exists);
    return exists;
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
            for (var item in items) {
                var session = document.createElement("p");
                that.makeEventListener(session, items[item]);
                var sessionName = document.createTextNode(item);
                session.appendChild(sessionName);
                doc_insert(session);
            }
        });
    },

    saveSession: function() {
        if (saveLock == 0) {
            var that = sessions;
            saveLock = 1;
            var sessionKey = "";
            
            var msgError = document.createElement("p");
            msgError.setAttribute("id", "msg_empty_session");
            msgError.style.visibility = "hidden";
            doc_insert(msgError);
            
            var sessionInputField = document.createElement("INPUT");
            sessionInputField.setAttribute('autofocus','autofocus');

            var cancelSaveButton = document.createElement("BUTTON");
            cancelSaveButton.appendChild(document.createTextNode("Cancel"));
            doc_insert(cancelSaveButton);
            cancelSaveButton.addEventListener("click", function() {
                saveLock = 0;
                msgError.remove();
                sessionInputField.remove();
                cancelSaveButton.remove();
            });

            sessionInputField.addEventListener("keydown", function(e) {
                if (e.keyIdentifier == "Enter") {
                    if (sessionInputField.value == "") {
                        msgError.innerHTML = "Please enter a session name";
                        msgError.style.visibility = "visible";
                    }
                    else if (keyExists(sessionInputField.value)) {
                        msgError.style.visibility = "visible";
                        msgError.innerHTML = "Session Exists!";
                    }
                    else {
                        sessionKey = sessionInputField.value;
                        
                        sessionInputField.remove();
                        msgError.remove();
                        cancelSaveButton.remove();
                    
                        chrome.tabs.query({"currentWindow": true}, function(tabs) {
                            var urls = [];
                            for (var i = 0; i < tabs.length; i++) {
                                urls[i] = tabs[i].url;
                            }

                            var sessionObj = {};
                            sessionObj[sessionKey] = urls;
                            chrome.storage.sync.set(sessionObj, function() {
                                var getLink = document.createElement("p");
                                
                                getLink.addEventListener("click", function() {
                                    that.openSession(urls);
                                });
                                
                                var getLinkText = document.createTextNode(sessionKey);
                                getLink.appendChild(getLinkText);
                                doc_insert(getLink);
                            });
                        });
                        saveLock = 0;
                    }
                }   
                else
                {
                    msgEmpty.style.visibility = "hidden";
                }
            });


            doc_insert(sessionInputField);
        }
    },

    openSession: function(urls) {
        //console.log("invoking openSession() " + urls);
        chrome.tabs.query({"currentWindow": true}, function(tabs) {
            if (tabs.length === 1 && tabs[0].url === "chrome://newtab/")
            {
                for (var i = 0; i < urls.length; i++) {
                    chrome.tabs.create({url: urls[i]});
                }

                //close empty tab in new window
                chrome.tabs.remove(tabs[0].id);
            }
            else {
                chrome.windows.create({url: urls, focused: true});
            }
        });
    },

    makeEventListener: function(session, urls) {
        session.addEventListener("click", function() {
            sessions.openSession(urls);
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