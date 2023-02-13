(() => {   
    // // Local attributs
    // var infoPanelText = 'Soonest RDV found in XXX, on AA/BB/CCCC';
    // var startDate = new Date(); // startDate.toISOString().split('T')[0] to get yyyy-mm-dd
    // var endDate = new Date(startDate.setMonth(startDate.getMonth() + 6));
    // console.log("Entered SoonestRDV extention!");


    // Inject the script.ts, in order to intercept http reponse
    var s = document.createElement('script');
    s.src = chrome.runtime.getURL('script.js');
    s.onload = function() {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(s);

    
    // // MutationObserver -----------------------------------------------
    // const observer = new MutationObserver(function (mutations, mutationInstance) {
    //     console.log(mutationInstance.takeRecords);

    //     // On search result displayed
    //     var postalCodeSearchBox = document.getElementById("postal-code-stepper");        
        
    //     if (postalCodeSearchBox) 
    //     {
    //         console.log("postalCodeSearchBox is loaded.");
    //         // mutationInstance.disconnect();
    //     }

    // });

    // observer.observe(document, {
    //     attributes: true,
    //     childList: true,
    //     subtree:   true
    // });
    
    // //-----------------------------------------------------------------------------


    // function renderInfoPanel() { 
    //     console.log("Entered renderInfoPanel");

    //     //Info Panel
    //     var infoPanel = document.createElement( 'div' );
    //     infoPanel.id = 'soonest-rdv-info-panel';
    //     infoPanel.style.position = 'fixed';
    //     infoPanel.style.top = '20%';
    //     infoPanel.style.left = '60%';
    //     infoPanel.style.width = '50vw';   
    //     infoPanel.style.height = '50px';
    //     infoPanel.style.borderRadius = '10px';
    //     infoPanel.style.paddingLeft = '20px'
    //     infoPanel.style.backgroundColor = 'rgba(0, 217, 255, 0.445)';
    //     infoPanel.style.display = 'flex';
    //     infoPanel.style.alignItems = 'center';
    //     infoPanel.style.zIndex = '9999';
    //     infoPanel.textContent = infoPanelText;

    //     document.body.appendChild( infoPanel );

    // }

})();