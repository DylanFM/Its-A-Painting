$(function() {
  
  var painting = Raphael("painting", 900, 600),
      active = false;
  
  var get_event_coordinates = function(event) {
    // Return X and Y coordinates for this event
    return [(event.pageX - event.srcElement.offsetLeft),
            (event.pageY - event.srcElement.offsetTop)];
  };
  
  var circle_at = function(coords) {
    // Add a dot where they clicked
    var x = painting.circle(coords[0], coords[1], 2);
    x.attr({ fill: "black" });
  };
  
  var paint = function(coords) {
    circle_at(coords);
  };
  
  // Test code for mouse down
  $(painting.node).bind("mousedown", function(e) {
    active = true;
  });
  $(painting.node).bind("mouseup", function(e) {
    active = false;
  });
  $(painting.node).bind("mousemove", function(e) {
    if (active === true) {
      paint(get_event_coordinates(e));
    }
  });
  
});
