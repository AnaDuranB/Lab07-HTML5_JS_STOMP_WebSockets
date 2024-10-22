package edu.eci.arsw.collabpaint.controller;

import edu.eci.arsw.collabpaint.model.Point;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.stereotype.Controller;

@Controller
public class CollabPaintController {

    @MessageMapping("/newpoint.{id}")
    @SendTo("/topic/newpoint.{id}")
    public Point handleNewPoint(@DestinationVariable String id, Point point) {
        System.out.println("Received point: " + point + " for id: " + id);
        return point;
    }
}
