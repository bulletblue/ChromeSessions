var saveLock = 0;

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
        clearButton.onclick = this.deleteAll;

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
            console.log(Object.keys(items).length);
            for (var item in items) {

                var session = document.createElement("p");
                session.setAttribute("class", "session_cell");
                session.appendChild(document.createTextNode(item));

                var iconRemove = document.createElement("p");
                iconRemove.setAttribute("class", "remove_session");
                iconRemove.appendChild(document.createTextNode("Rm"));

                var table = document.getElementById("sessions_table");
                var row = table.insertRow(0);

                that.openSessionEV(session, items[item]);
                that.removeSessionEV(iconRemove, item);
                
                var cellSession = row.insertCell(0);
                cellSession.width = "100%";
                cellSession.appendChild(session);

                var cellRemove = row.insertCell(1);
                cellRemove.appendChild(iconRemove);
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
                                    newSession.setAttribute("class", "session_cell");
                                    newSession.appendChild(document.createTextNode(sessionKey));

                                    var iconRemove = document.createElement("p");
                                    iconRemove.setAttribute("class", "remove_session");
                                    iconRemove.appendChild(document.createTextNode("Rm"));

                                    var table = document.getElementById("sessions_table");
                                    var row = table.insertRow(0);

                                    that.openSessionEV(newSession, urls);
                                    that.removeSessionEV(iconRemove, sessionKey);

                                    var cellSession = row.insertCell(0);
                                    cellSession.width = "100%";
                                    cellSession.appendChild(newSession);

                                    var cellRemove = row.insertCell(1);
                                    cellRemove.appendChild(iconRemove);
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

    openSessionEV: function(session, urls) {
        session.addEventListener("click", function() {
            sessions.openSession(urls);
        });
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

    removeSessionEV: function(iconRemove, item) {
        iconRemove.addEventListener("click", function() {
            var rows = document.getElementById("sessions_table").getElementsByTagName('tbody')[0].getElementsByTagName('tr');
            
            for (i = 0; i < rows.length; i++) {
                rows[i].onclick = function() {
                    sessions.removeSession(item, this.rowIndex);
                }
            }
        });
    },

    removeSession: function(sessionKey, row) {
        chrome.storage.sync.remove(sessionKey, function() {
            var table = document.getElementById("sessions_table");
            table.deleteRow(row);
        });
    },

    deleteAll: function() {
        var table = document.getElementById("sessions_table");
        chrome.storage.sync.clear();
        var new_tBody = document.createElement('tbody');
        table.replaceChild(new_tBody, table.firstChild);
    }
};


document.addEventListener('DOMContentLoaded', function () {
    sessions.startup();
});