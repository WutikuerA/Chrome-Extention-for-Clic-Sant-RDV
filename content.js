(() => { 
    // Inject the script.ts, in order to intercept http reponse
    var s = document.createElement('script');
    s.src = chrome.runtime.getURL('script.js');
    s.onload = function() {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(s);

})();