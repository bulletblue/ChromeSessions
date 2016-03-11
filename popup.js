function keyExists(key, sessionsList) {
    if (typeof(sessionsList) === "undefined") {
        return false;
    }

    for (var i = 0; i < sessionsList.length; i++)
    {
        if (key === sessionsList[i].name) {
            return true;
        }
    }

    return false;
}

function getTimeStamp() {
    var now = new Date();
    var hours;
    var seconds = (now.getSeconds() < 10) ? "0" + now.getSeconds() : now.getSeconds();
    var minutes = (now.getMinutes() < 10) ? "0" + now.getMinutes() : now.getMinutes();
    var amFlag;

    if (now.getHours() > 12) {
        hours = now.getHours() - 12;
        amFlag = "PM";
    }
    else if (now.getHours() === 12) {
        hours = 12;
        amFlag = "PM"
    }
    else if (now.getHours() === 0) {
        hours = 12;
        amFlag = "AM";
    }
    else {
        hours = now.getHours();
        amFlag = "AM";
    }

    return (now.getMonth() + 1) + "/" + now.getDate() + "/" + now.getFullYear() + " "
    + hours + ":" + minutes + ":" + seconds + " " + amFlag;
}

function hideSaveElements() {
    document.getElementById("msg_alert").style.visibility = "hidden";
    document.getElementById("msg_alert").innerHTML = "Please enter a session name.";
    document.getElementById("msg_alert").style.color = "#696969";
    document.getElementById("input_session").value = "";
    document.getElementById("input_session").style.visibility = "hidden";
    document.getElementById("btn_cancelSave").style.visibility = "hidden";
    document.getElementById("btn_confirmSave").style.visibility = "hidden";
}

function showSaveElements() {
    document.getElementById("msg_alert").style.visibility = "visible";
    document.getElementById("input_session").style.visibility = "visible";
    document.getElementById("input_session").focus();
    document.getElementById("btn_cancelSave").style.visibility = "visible";
    document.getElementById("btn_confirmSave").style.visibility = "visible";
}

var sessions = {

    startup: function() {
        this.getSessions();

        var saveButton = document.getElementById("btn_save");
        saveButton.onclick = showSaveElements;

        var cancelSaveButton = document.getElementById("btn_cancelSave");
        cancelSaveButton.onclick = hideSaveElements;

        var confirmSaveButton = document.getElementById("btn_confirmSave");
        confirmSaveButton.onclick = function() { sessions.saveSession({"keyIdentifier": "Enter"}); };

        var inputSession = document.getElementById("input_session");
        inputSession.addEventListener("keydown", this.saveSession);
        hideSaveElements();
    },

    getSessions: function() {
        chrome.storage.sync.get(null, function(items) {
            if (typeof(items["sessions"]) != "undefined") {
                for (var i=0; i < items["sessions"].length; i++) {
                    sessions.setInTable(items["sessions"][i].name, items["sessions"][i].urls, items["sessions"][i].timeStamp, false);
                }
            }
        });
    },

    saveSession: function(e) {
        if (e.keyIdentifier === "Enter") {
            chrome.storage.sync.get(null, function(items) {
                var msgAlert = document.getElementById("msg_alert");
                var sessionInputField = document.getElementById("input_session");
                var cancelSaveButton = document.getElementById("btn_cancelSave");

                /* Session names must be max of 200 characters, unique, non-null,
                and a session will only be saved if there are less than 100 current sessions saved.*/

                if (sessionInputField.value === "") {
                    msgAlert.innerHTML = "Session name is required.";
                    msgAlert.style.visibility = "visible";
                    msgAlert.style.color = "red";
                }
                else if (sessionInputField.value.length > 200) {
                    msgAlert.innerHTML = "Session name exceeds 200 characters.";
                    msgAlert.style.visibility = "visible";
                    msgAlert.style.color = "red";
                }
                else if (keyExists(sessionInputField.value, items["sessions"])) {
                    msgAlert.innerHTML = "Session already exists.";
                    msgAlert.style.visibility = "visible";
                    msgAlert.style.color = "red";
                }
                else if (typeof(items["sessions"]) != "undefined" && items["sessions"].length === 100)
                {
                    msgAlert.innerHTML = "Max sessions exceeded.";
                    msgAlert.style.visibility = "visible";
                    msgAlert.style.color = "red";
                }
                else {
                    chrome.tabs.query({"currentWindow": true}, function(tabs) {
                        var time = getTimeStamp();
                        var urls = [];
                        for (var i = 0; i < tabs.length; i++) {
                            urls[i] = tabs[i].url;
                        }

                        var details = {};
                        details["name"] = sessionInputField.value;
                        details["urls"] = urls;
                        details["timeStamp"] = time;

                        if (typeof(items["sessions"]) === "undefined") {
                            var sessionArr = [];
                            sessionArr.push(details);
                            items["sessions"] = sessionArr;
                        }
                        else {
                            items["sessions"].push(details);
                        }

                        chrome.storage.sync.set(items, function() {
                            sessions.setInTable(sessionInputField.value, urls, time, true);
                            sessionInputField.value = "";
                            hideSaveElements();
                        });
                    });
                }
            });
        }
        else
        {
            if (document.getElementById("input_session").value == "") {
                document.getElementById("msg_alert").style.visibility = "visible";
            }
            else {
                document.getElementById("msg_alert").style.visibility = "hidden";
            }
        }
    },

    setInTable: function(sessionName, urls, timeStamp, isNew) {

        //Session HTML Element and TimeStamp
        var session = document.createElement("p");
        session.setAttribute("class", "session_cell ellipsis");
        session.appendChild(document.createTextNode(sessionName));
        var date = document.createElement("p");
        date.setAttribute("class", "date");
        date.appendChild(document.createTextNode(timeStamp));

        //Open in new window button icon and HTML Element
        var openNew = document.createElement("i");
        openNew.setAttribute("class", "fa fa-external-link fa-lg");
        var openNewP = document.createElement("p");
        openNewP.setAttribute("class", "new_window_session");
        openNewP.setAttribute("title", "New Window");
        openNewP.appendChild(openNew);
        openNewP.style.visibility = "hidden";

        //Remove button icon and HTML Element
        var iconRemove = document.createElement("i");
        iconRemove.setAttribute("class", "fa fa-times");
        var removeP = document.createElement("p");
        removeP.setAttribute("class", "remove_session");
        removeP.setAttribute("title", "Delete");
        removeP.appendChild(iconRemove);
        removeP.style.visibility = "hidden";

        //Adding session HTML elements to the table
        var table = document.getElementById("sessions_table");
        var row = table.insertRow(0);
        row.setAttribute("class", "session_row");

        var cellSession = row.insertCell(0);
        cellSession.setAttribute("title", sessionName);
        cellSession.setAttribute("class", "session_name");
        cellSession.appendChild(session);
        cellSession.appendChild(date);

        var cellNewWindow = row.insertCell(1);
        cellNewWindow.setAttribute("class", "new_window_cell");
        cellNewWindow.appendChild(openNewP);

        var cellRemove = row.insertCell(2);
        cellRemove.setAttribute("class", "remove_cell");
        cellRemove.appendChild(removeP);

        cellSession.addEventListener("click", function() { sessions.openSession(urls, false) });
        cellNewWindow.addEventListener("click", function() { sessions.openSession(urls, true) });
        cellRemove.addEventListener("click", function() { sessions.removeSession(sessionName, $(this).parent().index()); });

        row.onmouseover =  function() {
            removeP.style.visibility = "visible";
            openNewP.style.visibility = "visible";
            cellSession.style.borderRight = "2px solid white";
            cellNewWindow.style.borderRight = "2px solid white";
        }

        row.onmouseout =  function() {
            removeP.style.visibility = "hidden";
            openNewP.style.visibility = "hidden";
            cellSession.style.borderRight = "";
            cellNewWindow.style.borderRight = "";
        }

        if (isNew) {
            $("tr:first-child").effect("highlight",{color: "#FFFFCB"}, 1000);
        }
    },

    openSession: function(urls, useNewWindow) {
        chrome.tabs.query({"currentWindow": true}, function(tabs) {
          if (useNewWindow === true) {
            chrome.windows.create({url: urls, focused: true});
          }
          else {
            for (var i = 0; i < urls.length; i++) {
                chrome.tabs.create({url: urls[i]});
            }
          }
        });
    },

    removeSession: function(sessionKey, row) {
        chrome.storage.sync.get(null, function(items) {
            var index;
            for (var i = 0; i < items["sessions"].length; i++) {
                if (items["sessions"][i].name == sessionKey) index = i;
            }

            items["sessions"].splice(index, 1);
            chrome.storage.sync.set(items);
            var table = document.getElementById("sessions_table");
            table.deleteRow(row);
        });
    }
};


document.addEventListener('DOMContentLoaded', function () {
    sessions.startup();
});
