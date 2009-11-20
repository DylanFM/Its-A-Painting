var Painter = (function() {

  var self,
      active = false,
      queue = [],
      drops = [],
      activity,
      last;
  
  var set_options = function(opts) {
    self.opts = opts;
    self.colour = self.opts.default_colour;
  };
      
  var init_painting = function(painting) {
    // Make the raphael canvas
    self.painting = Raphael(painting.attr("id"), self.opts.width, self.opts.height);
    // Poll queue for new dots to paint
    activity = setInterval(paint_from_queue, 100);
  };
      
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
  };
  
  var setup_controls = function(controls) {
    self.controls = controls;
    add_clear_functionality();
    add_colour_selection();
  };
  
  var add_clear_functionality = function() {
    // So one can remove their rubbish
    $(self.controls.clear).bind("click", function(e) {
      while(drops.length > 0) {
        drops.shift().remove();
      }
      e.preventDefault();
    });
  };
  
  var add_colour_selection = function() {
    self.colours = self.controls.colours;
    // Support changning the colour
    $(self.colours).bind('click', function(e) {
      var handle = $(e.target);
      self.colours.removeClass("active");
      self.colour = $(handle).attr("class").replace("to-", "");
      $(handle).addClass("active");
      e.preventDefault();
    });
  };

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
      path = self.painting.path(steps).attr({ "stroke-width": 2, "stroke": self.colour });
      drops.push(path);
    }
  };
  
  return function(painting, controls, opts) {
    self = this;
    // Sort out the options
    set_options(opts);
    // Initialise the painting
    init_painting(painting);
    // Attach events
    attach_events();
    // Controls for interface
    setup_controls(controls);
    // Pass the painting back
    return self.painting;
  };
  
}());
