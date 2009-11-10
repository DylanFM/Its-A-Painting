$(function() {
  
  var painting = Raphael("painting", 900, 600),
      active = false,
      dots = [];
  
  var get_event_coordinates = function(e) {
    var src = (e.srcElement || e.originalTarget.parentNode);
    // Return X and Y coordinates for this event
    return [(e.pageX - src.offsetLeft),
            (e.pageY - src.offsetTop)];
  };
  
  var paint = function(coords) {
    // Add a dot where they clicked
    return painting.circle(coords[0], coords[1], 3).attr({ fill: "black" });
  };
  
  // Test code for mouse down
  $(painting.node).bind("mousedown", function(e) {
    active = true;
  });
  $(painting.node).bind("mouseup", function(e) {
    active = false;
  });
  $(painting.node).bind("mousemove", function(e) {
    var dot;
    if (active === true) {
      dot = { coords: get_event_coordinates(e) };
      dot.point = paint(dot.coords);
      dots.push(dot);
    }
  });
  
  $("a#clear").bind("click", function(e) {
    $.each(dots, function(i) {
      this.point.remove();
    })
    dots = [];
    e.preventDefault();
  });
  
});
