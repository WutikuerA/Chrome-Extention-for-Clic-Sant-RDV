 // Local attributs
 var infoPanelText = 'Soonest RDV found in XXX, on AA/BB/CCCC';
 var startDate = new Date(); // startDate.toISOString().split('T')[0] to get yyyy-mm-dd
 var endDate = new Date();
 endDate = new Date(endDate.setMonth(endDate.getMonth() + 1));
 const LOADING_TEXT = "Loading...";
 var soonestDate = LOADING_TEXT;
 var soonestPlace = LOADING_TEXT;
 var bloodTestServiceId;
 console.log("Entered SoonestRDV extention!");

 // MutationObserver -----------------------------------------------
const observer = new MutationObserver(function (mutations, mutationInstance) {
    // On postal code search bar displayed
    var postalCodeSearchBox = document.getElementById("postal-code-stepper");        
    
    if (postalCodeSearchBox) 
    {
        console.log("postalCodeSearchBox is loaded.");
        renderInfoPanel();
        mutationInstance.disconnect();
    }

});

observer.observe(document, {
    attributes: true,
    childList: true,
    subtree:   true
});

//-----------------------------------------------------------------------------

 // Intercept HTTP response body from clic santé API
 let oldXHROpen = window.XMLHttpRequest.prototype.open;
 window.XMLHttpRequest.prototype.open = function() {
   this.addEventListener("load", function() {
        const responseBody = this.responseText;       
        ProcessHTTPReponseBody(responseBody);
   });
   return oldXHROpen.apply(this, arguments);
 };

 async function ProcessHTTPReponseBody(responseBody)
 {
     var currentIndex = 0;
     var jsonResponse = JSON.parse(responseBody);
     if(jsonResponse.establishments)
     {
        document.getElementById("soonest-date").innerHTML = LOADING_TEXT;
        document.getElementById("soonest-place").innerHTML = LOADING_TEXT;
        console.log(`Found ${jsonResponse.places.length} establishement`);
        for(const place of jsonResponse.places)
        {
            // Get the soonest RDV among the current reponse body

            await getSchedules(place);
            currentIndex++;
            document.getElementById("loading-text").innerHTML = `(Processing ${currentIndex} / ${jsonResponse.places.length})`;
        }
        console.log("All jobs done!")
        document.getElementById("soonest-date").innerHTML = soonestDate;
        document.getElementById("soonest-place").innerHTML = soonestPlace;
    }
}

async function getSchedules(place)
{
    console.log("Get Schedules begins...")
    bloodTestServiceId = await getServiceId(place);
    soonestDate = await getSoonestDateAndPlace(place, bloodTestServiceId)
    console.log("Leaving Get Schedules"); 
}

function isALaterThanB(a, b)
{

}

async function getServiceId(place)
{
    let bloodTestServiceId;
    // Get services, and choose blood test, get id where name_en has 'blood test'
    return fetch(`https://api3.clicsante.ca/v3/establishments/${place.establishment}/services?settings=true`, {
        "headers": {
            "accept": "application/json, text/plain, */*",
            "accept-language": "en-US,en;q=0.9,fr-FR;q=0.8,fr;q=0.7",
            "product": "clicsante",
            "sec-ch-ua": "\"Not_A Brand\";v=\"99\", \"Google Chrome\";v=\"109\", \"Chromium\";v=\"109\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
            "x-trimoz-role": "public"
          },
          "referrer": "https://clients3.clicsante.ca/",
          "referrerPolicy": "strict-origin-when-cross-origin",
          "body": null,
          "method": "GET",
          "mode": "cors",
          "credentials": "include"
    }).then((response) => response.json())
    .then((data) => {
        console.log("Service reponded!")
        console.log(data)
        if(data)
        {            
            for(const service of data)
            {
                if(service.name_en.toLowerCase().includes('blood test'))
                {
                    bloodTestServiceId = service.id;
                    console.log('Place: ' + place.id + ' ,Blood test service: ' + bloodTestServiceId);
                    break;
                }
                
            }
        }
        return bloodTestServiceId;
    });

}

async function getSoonestDateAndPlace(place, serviceId)
{
    return fetch(`https://api3.clicsante.ca/v3/establishments/${place.establishment}/schedules/public?dateStart=${startDate.toISOString().split('T')[0]}&dateStop=${endDate.toISOString().split('T')[0]}&service=${serviceId}&timezone=America/Toronto&filter1=1&filter2=undefined&filter3=undefined&gapMode=false`, {
        "headers": {
            "accept": "application/json, text/plain, */*",
            "accept-language": "en-US,en;q=0.9,fr-FR;q=0.8,fr;q=0.7",
            "product": "clicsante",
            "sec-ch-ua": "\"Not_A Brand\";v=\"99\", \"Google Chrome\";v=\"109\", \"Chromium\";v=\"109\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
            "x-trimoz-role": "public"
        },
        "referrer": "https://clients3.clicsante.ca/",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
        })
        .then(response=>response.json())
        .then(data=>{ 
            console.log("Availabilities responded!"); 
            console.log(data); 
            if(data)
            {
                var availabilities = data.availabilities;
                if(availabilities && availabilities.length > 0)
                {
                    // Compare the current date with the previous one
                    if(soonestDate == LOADING_TEXT || Date.parse(availabilities[0]) < Date.parse(soonestDate))
                    {
                        soonestDate =  availabilities[0];
                        soonestPlace = place.name_fr;
                        console.log(soonestDate); 
                    }
                                        
                }
                else
                {
                    console.log("No availabilities found!"); 
                }
            }
            return soonestDate;
        });   
}


function renderInfoPanel() { 
    console.log("Entered renderInfoPanel");

    //Info Panel
    var infoPanel = document.createElement( 'div' );
    infoPanel.id = 'soonest-rdv-info-panel';
    infoPanel.style.position = 'fixed';
    infoPanel.style.top = '70%';
    infoPanel.style.right = '0px';
    infoPanel.style.width = '300px';   
    infoPanel.style.height = '250px';
    infoPanel.style.borderRadius = '20px';
    infoPanel.style.padding = '20px';
    infoPanel.style.paddingTop = '35px';
    infoPanel.style.backgroundColor = '#00577dd7'; //'#00577dbb';
    infoPanel.style.display = 'flex';
    infoPanel.style.flexDirection = 'column';
    infoPanel.style.alignItems = 'center';
    infoPanel.style.zIndex = '9999';
    infoPanel.style.fontFamily = 'sans-serif';    
    infoPanel.style.color = 'white';
    // infoPanel.textContent = 'Soonest RDV found on: ' + soonestDate + '\n' + 'at: ' + soonestPlace;
    document.body.appendChild( infoPanel );

    // Panel
    // var panelIcon = document.createElement("img");
    // panelIcon.src = chrome.extension.getURL('images/icon_32.png');
    // infoPanel.appendChild( panelIcon );


    var panelTitle = document.createElement( 'div' );
    panelTitle.style.marginTop = '10px';
    panelTitle.textContent = "Soonest RDV for blood test:";  
    panelTitle.style.fontWeight = 'bold';
    infoPanel.appendChild( panelTitle );

    var dateSpan = document.createElement( 'div' );    
    dateSpan.id = "loading-text";
    dateSpan.textContent = '(Processing 0 / 15)';
    dateSpan.style.textAlign = 'left';
    dateSpan.style.marginTop = '5px';
    dateSpan.style.fontSize = 'smaller';
    dateSpan.style.backgroundColor = 'smaller';
    infoPanel.appendChild( dateSpan );

    var dateSpan = document.createElement( 'div' );    
    dateSpan.id = "soonest-date";
    dateSpan.textContent = soonestDate;
    dateSpan.style.textAlign = 'left';
    dateSpan.style.marginTop = '15px';
    infoPanel.appendChild( dateSpan );

    var palceSpan = document.createElement( 'div' );
    palceSpan.id = "soonest-place";
    palceSpan.textContent = soonestPlace;
    palceSpan.style.marginTop = '15px';
    palceSpan.style.textAlign = 'left';
    infoPanel.appendChild( palceSpan );


}
