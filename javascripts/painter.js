$(function() {
  
  var painting = Raphael("painting", 900, 600),
      active = false,
      dots = [];
  
  // Get coords
  var get_event_coordinates = function(e) {
    var src = (e.srcElement || e.originalTarget.parentNode);
    // Return X and Y coordinates for this event
    return [(e.pageX - src.offsetLeft),
            (e.pageY - src.offsetTop)];
  };
  
  // Add a dot
  var paint = function(coords) {
    return painting.circle(coords[0], coords[1], 3).attr({ fill: "black" });
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
    var dot;
    if (active === true) {
      dot = { coords: get_event_coordinates(e) };
      dot.point = paint(dot.coords);
      dots.push(dot);
    }
  });
  
  // So one can remove their rubbish
  $("a#clear").bind("click", function(e) {
    $.each(dots, function(i) {
      this.point.remove();
    })
    dots = [];
    e.preventDefault();
  });
  
});
