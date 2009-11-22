var Painter = (function() {

  var self,
      active = false,
      has_moved = false,
      queue = [],
      drops = [],
      history = [],
      activity,
      last;
      
  var drawing_types = {
    nil: function() {
      last = false;
      return {
        added: undefined,
        action: {
          type: "nil"
        }
      };
    },
    line: function(point) {
      var steps,
          action = {
            type: "line",
            points: []
          },
          to,
          from;
      if (last) {
        from = last;
        to = point;
      } else {
        from = point;
        to = queue.shift();
      }
      steps = "M" + from.coords[0] + " " + from.coords[1];
      action.points.push(from);
      while (to && to.type === "line") {
        steps += "L" + to.coords[0] + " " + to.coords[1];
        last = to;
        action.points.push(to);
        to = queue.shift();
      }
      return {
        added: self.painting.path(steps).attr({ "stroke-width": 2, "stroke": from.colour }),
        action: action
      };
    },
    dot: function(point) {
      var added = self.painting.circle(point.coords[0], point.coords[1], 1);
      added.attr({ fill: point.colour, stroke: point.colour });
      return {
        added: added,
        action: point
      };
    }
  };
  
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
    
    $(self.painting.node).bind("mouseout", function(e) {
      active = false;
      add_to_queue({ type: "nil" });
    });

    // When the mouse goes up we don't paint
    $(self.painting.node).bind("mouseup", function(e) {
      // if (e.target.localName === "svg") {
        if (has_moved === false) {
          enqueue_coords(e, "dot");
        }
        add_to_queue({ type: "nil" }); 
      // }
      active = false;
    });

    // When the mouse moves we might paint... it depends
    $(self.painting.node).bind("mousemove", function(e) {
      // if (e.target.localName === "svg") {
        enqueue_coords(e, "line");
    });
  };
  
  var enqueue_coords = function(e, type) {
    var coords;
    if (active === true) {
      has_moved = true;
      coords = get_event_coordinates(e);
      if (coords) {
        add_to_queue({ coords: coords, type: type, colour: self.colour });
      }
    }
  };
  
  var add_to_queue = function(obj) {
    queue.push(obj);
  };
  
  var add_many_to_queue = function(steps) {
    $.each(steps, function(i) {
      switch (this.type) {
        case "line":
          $.each(this.points, function(i) {
            add_to_queue(this);
          });
          break;
        default:
          // nil or dot
          add_to_queue(this);
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
      var drop;
      while(drops.length > 0) {
        drop = drops.shift();
        if (drop && typeof drop.remove === "function") {
          drop.remove();
        }
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
    var initial, new_one;
    if (queue.length > 0) {
      initial = queue.shift();
      new_one = drawing_types[initial.type](initial);
      if (new_one) {
        if (new_one.added) {
          drops.push(new_one.added);
        }
        history.push(new_one.action);
      }
    }
  };
  
  var requeue_history = function() {
    if (history && history.length > 0) {
      add_many_to_queue(history);
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
    
    // Public methods
    this.history = history;
    this.queue = queue;
    this.drops = drops;
    this.add_many_to_queue = add_many_to_queue;
    this.requeue_history = requeue_history;
    
    // Pass this
    return this;
  };
  
}());
