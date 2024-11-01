let tollMarkers = []; // Lista para almacenar los peajes

let stopMarkers = []; // Array para guardar las paradas intermedias
let stopCoords = []; // Array para almacenar las coordenadas de las paradas


var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18
});

var googleSatLayer = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
});

var miniMapLayerOSM = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18
});

var miniMapLayerGoogle = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
});

var cities = L.tileLayer.wms("http://localhost:8080/geoserver/wms", {
    layers: 'Waos:ciudades_mundo',
    format: 'image/png',
    transparent: true,
    tiled: true,
    attribution: "Natural Earth"
});

var rios = L.tileLayer.wms("http://localhost:8080/geoserver/wms", {
    layers: 'Waos:hidrografia_mundo',
    format: 'image/png',
    transparent: true,
    tiled: true,
    attribution: "Natural Earth"
});

var departamentos = L.tileLayer.wms("http://localhost:8080/geoserver/wms", {
    layers: 'Waos:dv_departamento',
    format: 'image/png',
    transparent: true,
    tiled: true,
    attribution: "Natural Earth"
});

var paises = L.tileLayer.wms("http://localhost:8080/geoserver/wms", {
    layers: 'Waos:paises_mundo',
    format: 'image/png',
    transparent: true,
    tiled: true,
    attribution: "Natural Earth"
});

var map = L.map('map', {
    center: [10.590812687530157, -74.18780172831298],
    zoom: 4,
    layers: [osm, paises, departamentos, cities, rios],
    scrollWheelZoom: true,
    fullscreenControl: true,
    fullscreenControlOptions: {
        position: 'topright'
    },
    zoomControl: false // Desactiva el control de zoom predeterminado
});

// Agrega el control de zoom en la posición 'topright'
L.control.zoom({
    position: 'topright'
}).addTo(map);

var markersCluster = L.markerClusterGroup();

const iconCategory1 = L.icon({
    iconUrl: '/img/INVIAS.png',  
    iconSize: [35, 35]          
});
const iconCategory2 = L.icon({
    iconUrl: '/img/ANI.png',
    iconSize: [35, 35]
});
const iconCategory3 = L.icon({
    iconUrl: '/img/Departamento.png',
    iconSize: [35, 35]
});
const iconCategory4 = L.icon({
    iconUrl: '/img/Municipio.png',
    iconSize: [35, 35]
});
const iconCategory5 = L.icon({
    iconUrl: '/img/Distrito.png',
    iconSize: [35, 35]
});


function getPeajesGeoJSON() {
    const owsrootUrl = 'http://localhost:8080/geoserver/Waos/ows';

    const defaultParameters = {
        service: 'WFS',
        version: '1.0.0',
        request: 'GetFeature',
        typeName: 'Waos:PeajesCol',
        outputFormat: 'application/json'
    };

    const parameters = L.Util.extend(defaultParameters);
    const url = owsrootUrl + L.Util.getParamString(parameters);



    function loadGeojson(data) {
        console.log(data);
        data.features.forEach((peaje) => {
            const latlng = [
                peaje.geometry.coordinates[1], // Latitud
                peaje.geometry.coordinates[0]  // Longitud
            ];

            let icon;
            switch (peaje.properties.administrador) {
                case '1':
                    icon = iconCategory1;
                    break;
                case '2':
                    icon = iconCategory2;
                    break;
                case '3':
                    icon = iconCategory3;
                    break;
                case '4':
                    icon = iconCategory4;
                    break;
                case '5':
                    icon = iconCategory5;
                    break;

            }

            const marker = L.marker(latlng, { icon: icon }).bindPopup(`
                <strong>Nombre:</strong> ${peaje.properties.nombrepeaje}<br>
            `);

            markersCluster.addLayer(marker);
            tollMarkers.push(marker); // Guarda cada marcador de peaje en la lista

        });

        map.addLayer(markersCluster);
    }

    $.ajax({
        url: url,
        dataType: 'json',
        success: loadGeojson,
        error: function (xhr) {
            console.error("Error al cargar los datos de peajes:", xhr.statusText);
        }
    });
}

getPeajesGeoJSON();

var baseMaps = {
    "OpenStreetMap": osm,
    "Google Satellite": googleSatLayer
};

var overlayMaps = {
    "Paises": paises,
    "Departamentos": departamentos,
    "Ciudades": cities,
    "Ríos": rios
};

L.control.layers(baseMaps, overlayMaps, { position: 'bottomright', collapsed: true }).addTo(map);

L.control.scale({ position: 'bottomleft', imperial: false }).addTo(map);
L.control.locate({ flyTo: true, position:'topright' }).addTo(map);



var miniMap = new L.Control.MiniMap(miniMapLayerOSM, {
    position: 'bottomleft',
    toggleDisplay: true,
    minimized: false
}).addTo(map);

map.on('baselayerchange', function (e) {
    if (e.name === "OpenStreetMap") {
        miniMap.changeLayer(miniMapLayerOSM);
    } else if (e.name === "Google Satellite") {
        miniMap.changeLayer(miniMapLayerGoogle);
    }
});

function searchLocation(inputId, suggestionsId) {
    const query = document.getElementById(inputId).value;
    const suggestionsList = document.getElementById(suggestionsId);

    if (query.length < 3) {
        suggestionsList.innerHTML = '';
        const useLocationOption = document.createElement('li');
        useLocationOption.classList.add('p-2', 'hover:bg-gray-200', 'cursor-pointer');
        useLocationOption.textContent = 'Usar la ubicación del usuario';

        useLocationOption.addEventListener('click', () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;

                    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
                        .then(response => response.json())
                        .then(data => {
                            const address = data.display_name;
                            document.getElementById(inputId).value = address; // Mostrar dirección en el input

                            addMarker(inputId, lat, lon, "Tu ubicación actual");

                            suggestionsList.classList.add('hidden');
                        })
                        .catch(() => {
                            alert("No se pudo obtener la dirección.");
                        });
                }, () => {
                    alert("No se pudo obtener la ubicación.");
                });
            } else {
                alert("La geolocalización no es compatible con este navegador.");
            }
        });

        suggestionsList.appendChild(useLocationOption);
        suggestionsList.classList.remove('hidden');
    } else {
        fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${query}`)
            .then(response => response.json())
            .then(data => {
                suggestionsList.innerHTML = '';
                data.forEach(item => {
                    const listItem = document.createElement('li');
                    listItem.classList.add('p-2', 'hover:bg-gray-200', 'cursor-pointer');
                    listItem.textContent = item.display_name;
                    listItem.addEventListener('click', () => {
                        document.getElementById(inputId).value = item.display_name;

                        addMarker(inputId, item.lat, item.lon);

                        suggestionsList.classList.add('hidden');
                    });
                    suggestionsList.appendChild(listItem);
                });
                suggestionsList.classList.remove('hidden');
            });
    }
}

//function addMarker(inputId, lat, lon, popupText = "Ubicación seleccionada") {
//    if (inputId === "start") {
//        if (startMarker) {
//            map.removeLayer(startMarker);
//        }
//        startMarker = L.marker([lat, lon]).addTo(map).bindPopup(popupText);
//        startCoords = L.latLng(lat, lon); // Guarda las coordenadas de inicio
//    } else if (inputId === "end") {
//        if (endMarker) {
//            map.removeLayer(endMarker);
//        }
//        endMarker = L.marker([lat, lon]).addTo(map).bindPopup(popupText);
//        endCoords = L.latLng(lat, lon); // Guarda las coordenadas de destino
//    }

//    if (startMarker && endMarker) {
//        const group = L.featureGroup([startMarker, endMarker]);
//        map.fitBounds(group.getBounds());
//        calculateRoute();
//    }
//}

function addMarker(inputId, lat, lon, popupText = "Ubicación seleccionada") {
    let marker = L.marker([lat, lon]).addTo(map).bindPopup(popupText);

        stopMarkers.push(marker);
        stopCoords.push([lat, lon]); 

    if (stopMarkers.length > 0) {
        const group = L.featureGroup(stopMarkers);
        map.fitBounds(group.getBounds());
        calculateRoute();
    }
}


document.getElementById('start').addEventListener('input', () => searchLocation('start', 'start-suggestions'));
document.getElementById('end').addEventListener('input', () => searchLocation('end', 'end-suggestions'));

document.addEventListener('click', (event) => {
    if (!event.target.closest('.relative')) {
        document.getElementById('start-suggestions').classList.add('hidden');
        document.getElementById('end-suggestions').classList.add('hidden');
    }
});

let routingControl; 

function calculateRoute() {
    if (stopCoords.length >= 2) {
        if (routingControl) {
            map.removeControl(routingControl);
        }

        routingControl = L.Routing.control({
            waypoints: stopCoords.map(coord => L.latLng(coord[0], coord[1])), 
            createMarker: () => null,
        }).addTo(map);

        routingControl.on('routesfound', function (e) {
            const route = e.routes[0];
            const tollsPassed = countTollsOnRoute(route);

            document.getElementById('routeResult').textContent = `La ruta pasa por ${tollsPassed} peajes.`;
        });
    }
}


function countTollsOnRoute(route) {
    const toleranceInMeters = 75;
    let tollCount = 0;

    tollMarkers.forEach(marker => {
        const markerLatLng = marker.getLatLng();
        let isNearRoute = route.coordinates.some(coord => {
            const routePoint = L.latLng(coord.lat, coord.lng);
            return markerLatLng.distanceTo(routePoint) <= toleranceInMeters;
        });

        if (isNearRoute) tollCount++;
    });

    return tollCount;
}

const lista = document.getElementById('lista');

Sortable.create(lista, {
    animation: 150,
    ghostClass: 'blue-background-class'
});

function addStop() {
    const stopsContainer = document.getElementById('lista');
    const stopId = `stop-${stopCoords.length + 1}`;
    const stopInput = document.createElement('div');

    stopInput.classList.add('relative', 'mb-3', 'rounded', 'border', 'border-black', 'p-2');
    stopInput.innerHTML = `
        <input id="${stopId}" type="text" placeholder="Parada intermedia" class="w-full rounded border border-gray-300 p-2 focus:border-orange-500 focus:ring focus:ring-orange-200" autocomplete="off" />
        <ul id="${stopId}-suggestions" class="z-10 absolute left-0 right-0 mt-1 hidden max-h-48 overflow-auto rounded border border-gray-300 bg-white shadow-lg"></ul>
        <button type="button" class="absolute top-1 right-1 text-red-500 hover:text-red-700" onclick="removeStop('${stopId}')">
            &times;
        </button>
    `;

    stopsContainer.appendChild(stopInput);

    document.getElementById(stopId).addEventListener('input', () => searchLocation(stopId, `${stopId}-suggestions`));
}

function removeStop(stopId) {
    const stopElement = document.getElementById(stopId).parentElement; // Selecciona el contenedor del input
    stopElement.remove(); // Elimina el contenedor de la parada

    const stopIndex = parseInt(stopId.split("-")[1]) - 1;
    if (stopMarkers[stopIndex]) {
        map.removeLayer(stopMarkers[stopIndex]); // Elimina el marcador del mapa
        stopMarkers.splice(stopIndex, 1);
        stopCoords.splice(stopIndex, 1);
        updateRoute(); // Actualiza la ruta sin el punto eliminado
    }
}