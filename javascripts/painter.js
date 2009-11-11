$(function() {
  
  var painting = Raphael("painting", 900, 600),
      active = false,
      queue = [],
      dots = [],
      activity;
  
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
    while (queue.length > 0) {
      dot = queue.shift();
      dot.point = paint(dot.coords);
      dots.push(dot);
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
    while(dots.length > 0) {
      dots.shift().point.remove();
    }
    e.preventDefault();
  });
  
});
