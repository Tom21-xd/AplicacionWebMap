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
    layers: [googleSatLayer, paises, departamentos, cities, rios],
    scrollWheelZoom: true
});

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
L.control.locate({ flyTo : true}).addTo(map);

var miniMap = new L.Control.MiniMap(miniMapLayerGoogle, {
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



