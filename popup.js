function getSession()  {
    var newP = document.createElement("p");
    var someText = document.createTextNode("Hello world!");

    newP.appendChild(someText);
    var currentdiv = document.getElementById("somediv");
    document.body.insertBefore(newP, currentdiv);
}

document.addEventListener('DOMContentLoaded', function () {
  getSession();
});

/*chrome.tabs.query({'currentWindow': true}, function(tabs) {
    var count = document.getElementById('tabCount');
    count.innerHTML = "5";
});*/
