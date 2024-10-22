package edu.eci.arsw.collabpaint.controller;

import edu.eci.arsw.collabpaint.model.Point;
import edu.eci.arsw.collabpaint.model.Polygon;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Controller
public class STOMPMessagesHandler {

    @Autowired
    private SimpMessagingTemplate msgt;

    private ConcurrentHashMap<String, List<Point>> drawingPoints = new ConcurrentHashMap<>();

    @MessageMapping("/newpoint.{numdibujo}")
    public void handlePointEvent(Point pt, @DestinationVariable String numdibujo) throws Exception {
        System.out.println("Nuevo punto recibido en el servidor!: " + pt);

        drawingPoints.putIfAbsent(numdibujo, new CopyOnWriteArrayList<>());
        List<Point> points = drawingPoints.get(numdibujo);
        points.add(pt);

        msgt.convertAndSend("/topic/newpoint." + numdibujo, pt);

        if (points.size() >= 4) {
            Polygon polygon = new Polygon(new ArrayList<>(points));
            msgt.convertAndSend("/topic/newpolygon." + numdibujo, polygon);
            points.clear();
        }
    }
}
