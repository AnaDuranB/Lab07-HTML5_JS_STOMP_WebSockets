var app = (function () {
    class Point {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
    }

    var stompClient = null;
    var canvas, context;

    // Función para dibujar un punto en el canvas
    var drawPoint = function (x, y) {
        context.beginPath();
        context.arc(x, y, 1, 0, 2 * Math.PI);  // Dibujar un círculo con radio 1
        context.fillStyle = "black";  // Color del punto
        context.fill();
    };

    var handleCanvasClick = function (event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        var pt = new Point(x, y);
        console.info("Publishing point at: ", pt);
        stompClient.send("/topic/newpoint", {}, JSON.stringify(pt));
        drawPoint(x, y);
    };

    var handleNewPointEvent = function (message) {
        var receivedPoint = JSON.parse(message.body);
        drawPoint(receivedPoint.x, receivedPoint.y);
    };

    var connectAndSubscribe = function () {
        console.info('Connecting to WebSocket...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);

        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe('/topic/newpoint', handleNewPointEvent);
        });
    };

    return {
        init: function () {
            canvas = document.getElementById('canvas');
            context = canvas.getContext('2d');
            connectAndSubscribe();
            canvas.addEventListener('click', handleCanvasClick); 
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            console.log("Disconnected");
        }
    };
})();
