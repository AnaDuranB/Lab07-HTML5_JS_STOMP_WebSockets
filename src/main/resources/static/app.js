var app = (function () {
    class Point {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
    }

    var stompClient = null;
    var topic = null;

    var setTopic = function (number) {
        topic = number;
        if (!stompClient) {
            connectAndSubscribe();
        } else {
            stompClient.disconnect();
            connectAndSubscribe();
        }
        clearCanvas();
    };

    var clearCanvas = function () {
        const canvas = document.getElementById("canvas");
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    var initCanvas = function () {
        var canvas = document.getElementById("canvas");
        canvas.addEventListener("mousedown", function (event) {
            var point = getMousePosition(event);
            publishPoint(point.x, point.y);
        });
    };

    var addPointToCanvas = function (point) {
        console.log('Adding point to canvas: ', point);
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.fillStyle = 'black';
        ctx.fill();
        ctx.stroke();
    };

    var getMousePosition = function (evt) {
        var canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };

    var connectAndSubscribe = function () {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);

        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            console.log('Subscribing to topic: /topic/newpoint.' + topic);
            stompClient.subscribe('/topic/newpoint.' + topic, function (eventbody) {
                var theObject = JSON.parse(eventbody.body);
                console.log('Received point: ', theObject);
                addPointToCanvas(theObject);
            });
        }, function (error) {
            console.error('STOMP error: ' + error);
        });
    };

    var publishPoint = function(px, py) {
        var pt = new Point(px, py);
        console.info("Publishing point at: ", pt);
        stompClient.send("/app/newpoint." + topic, {}, JSON.stringify(pt));
    };

    return {
        init: function () {
            initCanvas();
        },
        setTopic: setTopic,
        publishPoint: publishPoint,
        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            console.log("Disconnected");
        }
    };
})();

window.onload = function () {
    app.init();
};
