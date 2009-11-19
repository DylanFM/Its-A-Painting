$(function() {
  
  var active = false,
      queue = [],
      drops = [],
      painting = Raphael("painting", 900, 600),
      activity,
      last,
      colours = $(".colours a"),
      colour = "black";
  
  // Get coords
  var get_event_coordinates = function(e) {
    var src = e.srcElement || e.originalTarget.parentNode;
    // Return X and Y coordinates for this event
    return [(e.pageX - src.offsetLeft),
            (e.pageY - src.offsetTop)];
  };
  
  var paint_from_queue = function() {
    var steps, initial, path;
    if (queue.length > 0) {
      initial = last || queue.shift();
      steps = "M" + initial.coords[0] + " " + initial.coords[1];
      for (var i = 0; i < queue.length; i++) {
        point = queue[i];
        steps += "L" + point.coords[0] + " " + point.coords[1];
        if (i === (queue.length - 1)) {
          last = point;
        }
      }
      queue = [];
      path = painting.path(steps).attr({ "stroke-width": 2, "stroke": colour });
      drops.push(path);
    }
  };
  
  // When the mouse goes down we paint
  $(painting.node).bind("mousedown", function(e) {
    active = true;
    last = undefined;
  });
  
  // When the mouse goes up we don't paint
  $(painting.node).bind("mouseup", function(e) {
    active = false;
  });
  
  // When the mouse moves we might paint... it depends
  $(painting.node).bind("mousemove", function(e) {
    var coords;
    if (active === true) {
      coords = get_event_coordinates(e);
      if (coords) {
        queue.push({ coords: coords });
      }
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
  
  // Support changning the colour
  $(colours).bind('click', function(e) {
    var handle = $(e.target);
    colours.removeClass("active");
    colour = $(handle).attr("class").replace("to-", "");
    $(handle).addClass("active");
    e.preventDefault();
  });
  
});
