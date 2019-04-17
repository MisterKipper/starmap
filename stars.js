var canvas = document.getElementById("stars");
var context = canvas.getContext("2d");
var cameraFov = {
    horizontal: 90,
    vertical: 90 * canvas.height / canvas.width,
};
var scale = canvas.width / cameraFov.horizontal;

// Data loading
var stars = [];

var Star = function (string) {
    this.id = string.slice(0, 4).trim();
    this.lon = Number(string.slice(90, 96));
    this.lat = Number(string.slice(96, 102));
    this.mag = Number(string.slice(102, 107));
    this.brightness = Math.round(255 * Math.pow(10, -0.4 * (-5 + this.mag)));
    // TODO: check brightness calculation
};

function processStar(line) {
    var star = new Star(line);
    if (star.brightness) stars.push(star);
}

fetch("stars.dat").then(function (response) {
    response.text().then(function (text) {
        var lines = text.split("\n");
        lines.forEach(processStar);
    });
});

// Controls
var cameraDirection = {
    lat: 0,
    lon: 0,
};

function Controls() {
    document.addEventListener('mousedown', this.onClick.bind(this), false);
    this.dragging = false;
    // document.addEventListener('touchstart', this.onTouch.bind(this), false);
    // document.addEventListener('touchmove', this.onTouchMove.bind(this), false);
    // document.addEventListener('touchend', this.onTouchEnd.bind(this), false);
}

Controls.prototype.onClick = function (e) {
    console.log(e);
    e.preventDefault();
    this.oldX = e.pageX;
    this.oldY = e.pageY;
    this.oldLat = cameraDirection.lat;
    this.oldLon = cameraDirection.lon;
    this.dragging = true;
    document.addEventListener('mouseup', this.onClickEnd.bind(this), false);
    document.addEventListener('mousemove', this.onMouseMove.bind(this), false);
};

Controls.prototype.onMouseMove = function (e) {
    e.preventDefault();
    if (this.dragging) {
    cameraDirection.lat = this.oldLat + (e.pageY - this.oldY) / scale;
    cameraDirection.lon = this.oldLon + (e.pageX - this.oldX) / scale;
    }
};

Controls.prototype.onClickEnd = function (e) {
    e.preventDefault();
    this.dragging = false;
    document.removeEventListener('mouseup', this.onClickEnd.bind(this));
    document.removeEventListener('mousemove', this.onMouseMove.bind(this));
};

var controls = new Controls();

// Drawing

function coordinatesToPosition(lat, lon) {
    var center, radius;
    var x, y;
    var dLat = function (lat) {
        return cameraDirection.lat + cameraFov.vertical / 2 - lat;
    };
    var dLon = lon - cameraDirection.lon % 180;

    polePosition = scale * dLat(Math.sign(lat) * 90);

    radius = Math.abs(polePosition - scale * dLat(lat));
    x = canvas.width / 2 + radius * Math.sin(Math.sign(lat) * dLon * Math.PI / 180);
    y = polePosition + radius * Math.cos(Math.sign(lat) * dLon * Math.PI / 180);
    return {x: x, y: y};
}

function drawStar(star) {
    var brightness = star.brightness;
    var pos = coordinatesToPosition(star.lat, star.lon);
    context.beginPath();
    context.arc(pos.x, pos.y, 1, 0, 2 * Math.PI);
    context.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;
    context.fill();
}

function drawParallels() {
    var i, y, pole;
    for (i = -80; i < 90; i += 10) {
        context.beginPath();
        context.fillStyle = 'blue';
        if (i == 0) {
            y = scale * (cameraDirection.lat + cameraFov.vertical / 2);
            context.moveTo(0, y);
            context.lineTo(canvas.width, y);
        } else if (i > 0) {
            pole = 0; // TODO
        }
        context.fill();
    }
}

function drawMeridians() {}

// Main loop
function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "black";
    context.fillRect(0, 0, canvas.width, canvas.height);

    // drawParallels();
    // drawMeridians();
    stars.forEach(drawStar);

    requestAnimationFrame(draw);
}

draw();
