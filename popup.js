var top_div = document.getElementById("top_div");

var saveLock = 0;

function doc_insert(el) {
    document.body.insertBefore(el, top_div);
}

function keyExists(key, sessions) {
    for (var i = 0; i < sessions.length; i++)
    {
        if (key === sessions[i]) return true;
    }
    return false;
}

function hideSaveElements() {
    document.getElementById("msg_alert").style.visibility = "hidden";
    document.getElementById("input_session").style.visibility = "hidden";
    document.getElementById("btn_cancelSave").style.visibility = "hidden"; 
}

function showSaveElements() {
    document.getElementById("msg_alert").style.visibility = "visible";
    document.getElementById("input_session").style.visibility = "visible";
    document.getElementById("btn_cancelSave").style.visibility = "visible"; 
}

var sessions = {

    startup: function() {
        this.getSessions();
        
        var saveButton = document.getElementById("btn_save");
        saveButton.onclick = this.saveSession;

        var clearButton = document.getElementById("btn_clear");
        clearButton.onclick = this.clear;

        var cancelSaveButton = document.getElementById("btn_cancelSave");
        cancelSaveButton.addEventListener("click", function() {
            saveLock = 0;
            document.getElementById('msg_alert').innerHTML = "Enter a session name";
            hideSaveElements();
        });

        hideSaveElements();
    },

    getSessions: function() {
        var that = sessions;
        chrome.storage.sync.get(null, function(items) {
            for (var item in items) {

                var session = document.createElement("p");
                session.appendChild(document.createTextNode(item));
                that.makeEventListener(session, items[item]);

                var table = document.getElementById("sessions_table");
                var row = table.insertRow(0);
                var cell = row.insertCell(0);
                cell.appendChild(session);
            }
        });
    },

    saveSession: function() {
        if (saveLock === 0) {
            var that = sessions;
            saveLock = 1;
            var sessionKey = ""; //user provided name will be key in session object

            showSaveElements();

            var msgAlert = document.getElementById("msg_alert");
            var sessionInputField = document.getElementById("input_session");
            sessionInputField.focus();
            var cancelSaveButton = document.getElementById("btn_cancelSave");    

            sessionInputField.addEventListener("keydown", function(e) {

                chrome.storage.sync.get(null, function(items) {

                    var sessions = [];
                    for (item in items) {
                        sessions.push(item);
                    }

                    if (e.keyIdentifier === "Enter") {

                        if (sessionInputField.value === "") {
                            msgAlert.innerHTML = "Please enter a session name";
                            msgAlert.style.visibility = "visible";
                        }
                        else if (keyExists(sessionInputField.value, sessions)) { 
                            msgAlert.innerHTML = "Session already exists";
                            msgAlert.style.visibility = "visible";
                        }
                        else {
                            msgAlert.style.visibility = "hidden";
                            sessionKey = sessionInputField.value;
                            
                            sessionInputField.value = "";
                            hideSaveElements();
                        
                            chrome.tabs.query({"currentWindow": true}, function(tabs) {
                                var urls = [];
                                for (var i = 0; i < tabs.length; i++) {
                                    urls[i] = tabs[i].url;
                                }

                                var sessionObj = {};
                                sessionObj[sessionKey] = urls;

                                chrome.storage.sync.set(sessionObj, function() {
                                    var newSession = document.createElement("p");
                                    newSession.appendChild(document.createTextNode(sessionKey));
                                    that.makeEventListener(newSession, urls);

                                    var table = document.getElementById("sessions_table");
                                    var row = table.insertRow(0);
                                    var cell = row.insertCell(0);
                                    cell.appendChild(newSession);
                                });
                            });
                            saveLock = 0;
                        }
                    }   
                    else
                    {
                        msgAlert.style.visibility = "hidden";
                    }
                });
            });
        }
        else {
            document.getElementById("msg_empty").style.visibility = "hidden";
            var input = document.getElementById("input_session").focus();
            input.select(); 
        }
    },

    openSession: function(urls) {
        chrome.tabs.query({"currentWindow": true}, function(tabs) {
            if (tabs.length === 1 && tabs[0].url === "chrome://newtab/") {
                for (var i = 0; i < urls.length; i++) {
                    chrome.tabs.create({url: urls[i]});
                }
                chrome.tabs.remove(tabs[0].id);  //close empty tab in new window
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
        var table = document.getElementById("sessions_table");
        chrome.storage.sync.clear();
        for (var i = 0; i < table.rows.length; i++) {
            table.deleteRow(i);
        }
    }
};


document.addEventListener('DOMContentLoaded', function () {
    sessions.startup();
});