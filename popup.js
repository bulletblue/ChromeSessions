var currentDiv = document.getElementById("somediv");
var saveLock = 0;

function doc_insert(el) {
    document.body.insertBefore(el, currentDiv);
}

function keyExists(key, sessions) {
    for (var i = 0; i < sessions.length; i++)
    {
        if (key === sessions[i]) return true;
    }
    return false;
}

function hideSaveElements() {
    document.getElementById("msg_empty").style.visibility = "hidden";
    document.getElementById("input_session").style.visibility = "hidden";
    document.getElementById("btn_cancel").style.visibility = "hidden"; 
}

function showSaveElements() {
    document.getElementById("msg_empty").style.visibility = "visible";
    document.getElementById("input_session").style.visibility = "visible";
    document.getElementById("btn_cancel").style.visibility = "visible"; 
}

var sessions = {

    startup: function() {
        //Display saved sessions on start
        this.getSessions();

        var saveButton = document.createElement("BUTTON");
        saveButton.onclick = this.saveSession;
        var saveButtonText = document.createTextNode("Save Session");
        saveButton.appendChild(saveButtonText);
        doc_insert(saveButton);

        var clearButton = document.createElement("BUTTON");
        clearButton.onclick = this.clear;
        var clearButtonText = document.createTextNode("Clear All");
        clearButton.appendChild(clearButtonText);
        doc_insert(clearButton);

        var msgError = document.createElement("p");
        msgError.setAttribute("id", "msg_empty");
        doc_insert(msgError);

        var sessionInputField = document.createElement("INPUT");
        sessionInputField.setAttribute("id", "input_session");
        sessionInputField.setAttribute("autofocus","autofocus");
        doc_insert(sessionInputField);

        var cancelSaveButton = document.createElement("BUTTON");
        cancelSaveButton.setAttribute("id", "btn_cancel");
        cancelSaveButton.appendChild(document.createTextNode("Cancel"));;
        cancelSaveButton.addEventListener("click", function() {
            saveLock = 0;
            hideSaveElements();
        });
        doc_insert(cancelSaveButton)

        console.log("created all elements");

        hideSaveElements();
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

            showSaveElements();

            var msgError = document.getElementById("msg_empty");
            var sessionInputField = document.getElementById("input_session");
            var cancelSaveButton = document.getElementById("btn_cancel");               

            sessionInputField.addEventListener("keydown", function(e) {
                chrome.storage.sync.get(null, function(items) {

                    var sessions = [];
                    for (item in items) {
                        sessions.push(item);
                    }

                    if (e.keyIdentifier === "Enter") {
                        if (sessionInputField.value === "") {
                            msgError.innerHTML = "Please enter a session name";
                            msgError.style.visibility = "visible";
                        }
                        else if (keyExists(sessionInputField.value, sessions)) { 
                            msgError.innerHTML = "Session already exists";
                            msgError.style.visibility = "visible";
                        }
                        else {
                            sessionKey = sessionInputField.value;
                            
                            hideSaveElements();
                        
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
                        msgError.style.visibility = "hidden";
                    }
                });
            });
        }
        else {
            document.getElementById("msg_empty_session").style.visibility = "hidden";
            document.getElementById("input_session").focus(); 
        }
    },

    openSession: function(urls) {
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