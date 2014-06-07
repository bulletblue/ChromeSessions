function keyExists(key, sessionsList) {
    for (var i = 0; i < sessionsList.length; i++)
    {
        if (key === sessionsList[i]) {
            return true;
        }
    }
    return false;
}

function hideSaveElements() {
    document.getElementById("msg_alert").style.visibility = "hidden";
    document.getElementById("msg_alert").innerHTML = "Enter a session name";
    document.getElementById('input_session').value = "";
    document.getElementById("input_session").style.visibility = "hidden";
    document.getElementById("btn_cancelSave").style.visibility = "hidden"; 
}

function showSaveElements() {
    document.getElementById("msg_alert").style.visibility = "visible";
    document.getElementById("input_session").style.visibility = "visible";
    document.getElementById("input_session").focus();
    document.getElementById("btn_cancelSave").style.visibility = "visible"; 
}

var sessions = {

    startup: function() {
        this.getSessions();
        
        var saveButton = document.getElementById("btn_save");
        saveButton.onclick = showSaveElements;

        var deleteButton = document.getElementById("btn_deleteAll");
        deleteButton.onclick = this.deleteAll;

        var cancelSaveButton = document.getElementById("btn_cancelSave");
        cancelSaveButton.onclick = hideSaveElements;

        var inputSession = document.getElementById("input_session");
        inputSession.addEventListener("keydown", this.saveSession);
        hideSaveElements();
    },

    getSessions: function() {
        chrome.storage.sync.get(null, function(items) { for (var item in items) { sessions.setInTable(item, items[item]); }});
    },

    saveSession: function(e) {
        if (e.keyIdentifier === "Enter") {
            chrome.storage.sync.get(null, function(items) {

                var sessionsList = [];
                for (item in items) { 
                    sessionsList.push(item); 
                }

                var msgAlert = document.getElementById("msg_alert");
                var sessionInputField = document.getElementById("input_session");
                var cancelSaveButton = document.getElementById("btn_cancelSave");



                /* Session names must be max of 200 characters, unique, non-null, 
                and a session will only be saved if there are less than 100 current sessions saved.*/
                
                if (sessionInputField.value === "") {
                    msgAlert.innerHTML = "Enter a session name";
                    msgAlert.style.visibility = "visible";
                }
                else if (sessionInputField.value.length > 200) {
                    msgAlert.innerHTML = "Session name exceeds 200 characters.";
                    msgAlert.style.visibility = "visible";
                }
                else if (keyExists(sessionInputField.value, sessionsList)) {
                    msgAlert.innerHTML = "Session already exists!";
                    msgAlert.style.visibility = "visible";
                }
                else if (sessionsList.length === 100) //Allow storage of only 100 sessions
                {
                    msgAlert.innerHTML = "Max sessions exceeded.";
                    msgAlert.style.visibility = "visible";
                }
                else {
                    chrome.tabs.query({"currentWindow": true}, function(tabs) {
                        var urls = [];
                        for (var i = 0; i < tabs.length; i++) {
                            urls[i] = tabs[i].url;
                        }

                        var sessionObj = {};
                        sessionObj[sessionInputField.value] = urls;

                        chrome.storage.sync.set(sessionObj, function() {
                            sessions.setInTable(sessionInputField.value, urls);
                            sessionInputField.value = "";
                            hideSaveElements();
                        });
                    });
                }
            });
        }   
        else
        {
           document.getElementById("msg_alert").style.visibility = "hidden";
        }
    },

    setInTable: function(sessionName, urls) {
        var session = document.createElement("p");
        session.setAttribute("class", "session_cell ellipsis");
        session.appendChild(document.createTextNode(sessionName));

        var iconRemove = document.createElement("i");
        iconRemove.setAttribute("class", "fa fa-minus");

        var removeP = document.createElement("p");
        removeP.setAttribute("class", "remove_session");
        removeP.appendChild(iconRemove);

        var table = document.getElementById("sessions_table");
        var row = table.insertRow(0);

        sessions.openSessionEV(session, urls);
        sessions.removeSessionEV(removeP, sessionName);
        
        var cellSession = row.insertCell(0);
        cellSession.appendChild(session);

        var cellRemove = row.insertCell(1);
        cellRemove.appendChild(removeP);
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
                chrome.tabs.remove(tabs[0].id);
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
        hideSaveElements();
        var table = document.getElementById("sessions_table");
        chrome.storage.sync.clear();
        document.createElement('tbody');
        table.replaceChild(document.createElement('tbody'), table.firstChild);
    }
};


document.addEventListener('DOMContentLoaded', function () {
    sessions.startup();
});