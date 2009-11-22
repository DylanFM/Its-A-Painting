var Painter = (function() {

  var self,
      busy = false,
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
        added: self.painting.path(steps).attr({ "stroke-width": from.brush_size, "stroke": from.colour }),
        action: action
      };
    },
    dot: function(point) {
      var brush_size = point.brush_size || self.brush_size,
          added = self.painting.circle(point.coords[0], point.coords[1], brush_size);
      added.attr({ fill: point.colour, stroke: point.colour, brush_size: brush_size });
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
    // If there's a state supplied, add it to the queue
    if (self.opts.state !== undefined) {
      add_many_to_queue(self.opts.state);
      paint_from_queue();
    }
    // Poll queue for new dots to paint
    activity = setInterval(paint_from_queue, 100);
  };
      
  var attach_events = function() {
    // When the mouse goes down we paint
    $(self.painting_surface).bind("mousedown", function(e) {
      active = true;
      has_moved = false;
      last = undefined;
      e.preventDefault();
    });
    
    $(self.painting_surface).bind("mouseout", function(e) {
      active = false;
      add_to_queue({ type: "nil" });
    });

    // When the mouse goes up we don't paint
    $(self.painting_surface).bind("mouseup", function(e) {
      if (has_moved === false) {
        enqueue_coords(e, "dot");
      }
      add_to_queue({ type: "nil" }); 
      active = false;
      e.preventDefault();
    });

    // When the mouse moves we might paint... it depends
    $(self.painting_surface).bind("mousemove", function(e) {
      enqueue_coords(e, "line");
      e.preventDefault();
    });
  };
  
  var enqueue_coords = function(e, type) {
    var coords;
    if (active === true) {
      has_moved = true;
      coords = get_event_coordinates(e);
      if (coords && coords_are_valid(e, coords)) {
        add_to_queue({ coords: coords, type: type, colour: self.colour, brush_size: self.brush_size });
      }
    }
  };
  
  var coords_are_valid = function(e, coords) {
    // Sometimes we get weirdness when clicking controls and having stuff then painted
    // We need to make sure that the coords are within the canvas
    var src = get_event_source(e),
        top_left = [src.offsetLeft, src.offsetTop],
        bottom_right = [(src.offsetLeft + src.clientWidth), (src.offsetTop + src.clientHeight)];
    return coords[0] >= top_left[0] && coords[0] <= bottom_right[0] 
        && coords[1] >= top_left[1] && coords[1] <= bottom_right[1];
  };
  
  var add_to_queue = function(obj) {
    queue.push(obj);
  };
  
  var add_many_to_queue = function(steps) {
    $.each(steps, function(i) {
      var action = this;
      switch (action.type) {
        case "line":
          $.each(action.points, function(i) {
            add_to_queue(this);
          });
          break;
        default:
          // nil or dot
          add_to_queue(action);
      }
    });
  };
  
  var setup_controls = function(controls) {
    self.controls = controls;
    add_clear_functionality();
    add_colour_selection();
    add_brush_size_functionality();
  };
  
  var add_brush_size_functionality = function() {
    $(self.controls.brush_size).slider({ 
        value: self.opts.default_brush_size, 
        max: self.opts.default_max_brush_size,
        change: function(event, ui) {
          set_brush_size($(this).slider("value"));
        }
      });
    set_brush_size($(self.controls.brush_size).slider("value"));
  };
  
  var set_brush_size = function(size) {
    self.brush_size = size;
  };
  
  var add_clear_functionality = function() {
    // So one can remove their rubbish
    $(self.controls.clear).bind("click", function(e) {
      clear_painting();
      e.preventDefault();
    });
  };
  
  var clear_painting = function() {
    var drop;
    while(drops.length > 0) {
      drop = drops.shift();
      if (drop && typeof drop.remove === "function") {
        drop.remove();
      }
    }
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

  var get_event_source = function(e) {
    return e.srcElement || e.originalTarget.parentNode;
  };
  
  var get_event_coordinates = function(e) {
    var src = get_event_source(e);
    // Return X and Y coordinates for this event
    return [(e.pageX - src.offsetLeft),
            (e.pageY - src.offsetTop)];
  };

  var paint_from_queue = function() {
    var initial, new_one;
    if (busy === false) {
      busy = true;
      if (queue.length > 0) {
        initial = queue.shift();
        if (typeof drawing_types[initial.type] === "function") {
          new_one = drawing_types[initial.type](initial);
          if (new_one) {
            if (new_one.added) {
              drops.push(new_one.added);
              // Safari thing
              self.painting.safari();
            }
            history.push(new_one.action);
          }
        }
      }
      busy = false;
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
    this.clear_painting = clear_painting;
    this.add_many_to_queue = add_many_to_queue;
    this.requeue_history = requeue_history;
    
    // Pass this
    return this;
  };
  
}());
