var Painter = (function() {

  var self,
      controls,
      opts,
      active = false,
      queue = [],
      drops = [],
      activity,
      last,
      colours,
      colour;
      
  var attach_events = function() {
    // When the mouse goes down we paint
    $(self.painting.node).bind("mousedown", function(e) {
      active = true;
      last = undefined;
    });

    // When the mouse goes up we don't paint
    $(self.painting.node).bind("mouseup", function(e) {
      active = false;
    });

    // When the mouse moves we might paint... it depends
    $(self.painting.node).bind("mousemove", function(e) {
      var coords;
      if (active === true) {
        coords = get_event_coordinates(e);
        if (coords) {
          queue.push({ coords: coords });
        }
      }
    });

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
  };

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
      path = self.painting.path(steps).attr({ "stroke-width": 2, "stroke": colour });
      drops.push(path);
    }
  };
  
  return function(painting, controls, opts) {
    self = this;
    controls = controls;
    opts = opts;
    self.painting = Raphael(painting.attr("id"), opts.width, opts.height);
    colours = controls.colours;
    colour = opts.default_colour;
    // Poll queue for new dots to paint
    activity = setInterval(paint_from_queue, 100);
    // Attach events
    attach_events();
    return painting;
  };
  
}());
