var Painter = (function() {

  var self,
      active = false,
      has_moved = false,
      queue = [],
      drops = [],
      history = [],
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
      has_moved = false;
      last = undefined;
    });

    // When the mouse goes up we don't paint
    $(self.painting.node).bind("mouseup", function(e) {
      if (has_moved === false) {
        enqueue_coords(e, "dot");
      }
      active = false;
    });

    // When the mouse moves we might paint... it depends
    $(self.painting.node).bind("mousemove", function(e) {
      enqueue_coords(e, "line");
    });
  };
  
  var enqueue_coords = function(e, type) {
    var coords;
    if (active === true) {
      has_moved = true;
      coords = get_event_coordinates(e);
      if (coords) {
        add_to_queue({ coords: coords, type: type });
      }
    }
  };
  
  var add_to_queue = function(obj) {
    queue.push(obj);
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
  
  var select_current_colour = function() {
    self.colours.removeClass("active");
    $(self.colours).filter(".to-" + self.colour).addClass("active");
  };
  
  var add_colour_selection = function() {
    self.colours = self.controls.colours;
    // Select the default colour
    select_current_colour();
    // Support changning the colour
    $(self.colours).bind('click', function(e) {
      var handle = $(e.target);
      self.colour = $(handle).attr("class").replace("to-", "");
      select_current_colour();
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
    var steps, initial, added, action;
    if (queue.length > 0) {
      initial = last || queue.shift();
      switch (initial.type) {
        case "line":
          action = {
            type: "line",
            points: [initial]
          };
          steps = "M" + initial.coords[0] + " " + initial.coords[1];
          for (var i = 0; i < queue.length; i++) {
            point = queue[i];
            action.points.push(point);
            steps += "L" + point.coords[0] + " " + point.coords[1];
            if (i === (queue.length - 1)) {
              last = point;
            }
          }
          queue = [];
          added = self.painting.path(steps).attr({ "stroke-width": 2, "stroke": self.colour });
          break;
        case "dot":
          added = self.painting.circle(initial.coords[0], initial.coords[1], 1);
          added.attr({ fill: self.colour, stroke: self.colour });
          action = initial;
          break;
      }
      if (added) {
        drops.push(added);
        history.push(action);
      }
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
    // Allow access to history
    this.history = history;
    // Allow access to queue for the time being
    this.queue = queue;
    // Pass this
    return this;
  };
  
}());
