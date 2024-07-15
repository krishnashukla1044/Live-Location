const socket = io();
let uploadedImageUrl = '';

if (navigator.geolocation) {
    navigator.geolocation.watchPosition((position) => {
        const { latitude, longitude } = position.coords;
        socket.emit("send-location", { latitude, longitude, imageUrl: uploadedImageUrl });
    },
        (error) => {
            console.error(error)
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        }
    );
}

const map = L.map("map").setView([0, 0], 16);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: "OpenStreetMap",
}).addTo(map);

const markers = {};

const createIcon = (imageUrl) => {
    return L.icon({
        iconUrl: imageUrl || 'path/to/default-icon.png',
        iconSize: [38, 95],
        iconAnchor: [22, 94],
        popupAnchor: [-3, -76]
    });
}

socket.on("receive-location", (data) => {
    const { id, latitude, longitude, imageUrl } = data;
    map.setView([latitude, longitude]);
    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        markers[id] = L.marker([latitude, longitude], { icon: createIcon(imageUrl) }).addTo(map);
    }
});

socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});

function uploadImage() {
    const input = document.getElementById('imageUpload');
    const file = input.files[0];
    const formData = new FormData();
    formData.append('image', file);

    fetch('/upload', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        uploadedImageUrl = data.imageUrl;
    })
    .catch(error => {
        console.error('Error uploading image:', error);
    });
}
