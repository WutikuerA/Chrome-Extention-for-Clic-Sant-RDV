 // Local attributs
 var infoPanelText = 'Soonest RDV found in XXX, on AA/BB/CCCC';
 var startDate = new Date(); // startDate.toISOString().split('T')[0] to get yyyy-mm-dd
 var endDate = new Date();
 endDate = new Date(endDate.setMonth(endDate.getMonth() + 1));
 var soonestDate = "Loading...";
 var soonestPlace = "Loading...";
 var bloodTestServiceId;
 console.log("Entered SoonestRDV extention!");

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
    var jsonResponse = JSON.parse(responseBody);
    if(jsonResponse.establishments)
    {
        console.log(`Found ${jsonResponse.places.length} establishement`);
        for(const place of jsonResponse.places)
        {
            // Get the soonest RDV among the current reponse body
            await getSchedules(place);
        }
        console.log("All jobs done!")
        renderInfoPanel();
    }
}

async function getSchedules(place)
{
    console.log("Get Schedules begins...")
    bloodTestServiceId = await getServiceId(place);
    soonestDate = await getSoonestDateAndPlace(place, bloodTestServiceId)
    console.log("Leaving Get Schedules"); 
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
                    soonestDate = availabilities[0];
                    soonestPlace = place.name_fr;
                    infoPanelText = soonestDate;
                    console.log(soonestDate); 
                }
                else
                {
                    console.log("No availabilities found!"); 
                }
            }
            return soonestDate;
        });   
}




// MutationObserver -----------------------------------------------
const observer = new MutationObserver(function (mutations, mutationInstance) {
    // On postal code search bar displayed
    var postalCodeSearchBox = document.getElementById("postal-code-stepper");        
    
    if (postalCodeSearchBox) 
    {
        console.log("postalCodeSearchBox is loaded.");
        // renderInfoPanel();
        mutationInstance.disconnect();
    }

});

observer.observe(document, {
    attributes: true,
    childList: true,
    subtree:   true
});

//-----------------------------------------------------------------------------


function renderInfoPanel(number=null) { 
    console.log("Entered renderInfoPanel");

    //Info Panel
    var infoPanel = document.createElement( 'div' );
    infoPanel.id = 'soonest-rdv-info-panel';
    infoPanel.style.position = 'fixed';
    infoPanel.style.top = '20%';
    infoPanel.style.left = '60%';
    infoPanel.style.width = '50vw';   
    infoPanel.style.height = '50px';
    infoPanel.style.borderRadius = '10px';
    infoPanel.style.paddingLeft = '20px'
    infoPanel.style.backgroundColor = 'rgba(0, 217, 255, 0.445)';
    infoPanel.style.display = 'flex';
    infoPanel.style.alignItems = 'center';
    infoPanel.style.zIndex = '9999';
    infoPanel.textContent = 'Soonest RDV found on: ' + soonestDate + '\n' + 'at: ' + soonestPlace;

        // Panel title
        // if(number)
        // {
        //     var panelTitle = document.createElement( 'div' );
        //     infoPanel.textContent = `Found ${number} establishments`;
        //     infoPanel.appendChild( panelTitle );
        // }

    document.body.appendChild( infoPanel );

}
