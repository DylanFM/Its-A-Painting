$(function() {
  
  var painting = Raphael("painting", 900, 600);
  
  var get_click_coordinates = function(event) {
    // Return X and Y coordinates for this click event
    return [
      (event.pageX - event.srcElement.offsetLeft),
      (event.pageY - event.srcElement.offsetTop)
    ];
  };
  
  // If there's a click in the painting
  $(painting.node).bind('click', function(e) {
    var coords = get_click_coordinates(e),
        x;
    // Add a dot where they clicked
    x = painting.circle(coords[0], coords[1], 2);
    x.attr({ fill: "black" });
  });
  
});
