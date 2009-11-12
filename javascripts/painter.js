$(function() {
  
  var active = false,
      queue = [],
      activity;
      
      drops = [];
      painting = Raphael("painting", 900, 600);
  
  // Get coords
  var get_event_coordinates = function(e) {
    var src = e.srcElement || e.originalTarget.parentNode;
    // Return X and Y coordinates for this event
    return [(e.pageX - src.offsetLeft),
            (e.pageY - src.offsetTop)];
  };
  
  // Add a dot
  var paint = function(coords) {
    return painting.circle(coords[0], coords[1], 3).attr({ fill: "black" });
  };
  
  var paint_from_queue = function() {
    var steps, first;
    if (queue.length > 0) {
      first = queue.shift();
      steps = "M" + first.coords[0] + " " + first.coords[1];
      while (queue.length > 0) {
        point = queue.shift();
        steps += "L" + point.coords[0] + " " + point.coords[1];
      }
      drops.push(painting.path(steps));
    }
  };
  
  // When the mouse goes down we paint
  $(painting.node).bind("mousedown", function(e) {
    active = true;
  });
  
  // When the mouse goes up we don't paint
  $(painting.node).bind("mouseup", function(e) {
    active = false;
  });
  
  // When the mouse moves we might paint... it depends
  $(painting.node).bind("mousemove", function(e) {
    if (active === true) {
      queue.push({ coords: get_event_coordinates(e) });
    }
  });
  
  // Poll queue for new dots to paint
  activity = setInterval(paint_from_queue, 100);
  
  // So one can remove their rubbish
  $("a#clear").bind("click", function(e) {
    while(drops.length > 0) {
      drops.shift().remove();
    }
    e.preventDefault();
  });
  
});
