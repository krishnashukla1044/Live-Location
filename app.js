const express = require('express');
const app = express();
const path = require('path');
const fileUpload = require('express-fileupload');

const http = require('http');
const socketio = require('socket.io');
const server = http.createServer(app);
const io = socketio(server);

app.use(fileUpload());
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.post('/upload', (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    let image = req.files.image;
    let uploadPath = path.join(__dirname, 'public/uploads/', image.name);

    image.mv(uploadPath, function(err) {
        if (err) {
            return res.status(500).send(err);
        }

        res.json({ imageUrl: '/uploads/' + image.name });
    });
});

io.on("connection", function (socket) {
    socket.on("send-location", function (data) {
        io.emit("receive-location", { id: socket.id, ...data });
    });

    socket.on("disconnect", function () {
        io.emit("user-disconnected", socket.id);
    });
});

app.get('/', (req, res) => {
    res.render("index");
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
