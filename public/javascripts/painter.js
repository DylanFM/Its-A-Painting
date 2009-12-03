var Painter = (function() {

  var self,
      busy = false,
      active = false,
      has_moved = false,
      queue = [],
      drops = [],
      history = [],
      down_event = {},
      activity;
      
  var drawing_types = {
    nil: function() {
      return {
        added: undefined,
        action: {
          type: "nil"
        }
      };
    },
    line: (function() {
      var draw_line = function() {
            // Get the first point
            var point = action.points[0],
                steps = "M" + point.coords[0] + " " + point.coords[1], // Begin the line with its coordinates
                lkey = action.points.length-1,
                node, i;
            // Then loop through the rest, building the line as we go
            for (i = 1; i < action.points.length; i++) {
              steps += "L" + action.points[i].coords[0] + " " + action.points[i].coords[1];
            }
            node = self.painting.path(steps).attr({ "stroke-width": action.points[lkey].brush_size, "stroke": action.points[lkey].colour });
            return node;
          },
          reset_action = function() {
            action = { type: "line", points: [] };
          },
          action, down_event;
      return function(point) {
        var last_node,
            to_return = { action: undefined, action: undefined };
        // If this is the beginning of a new line, let's start a new one
        if (!down_event || point.down_event !== down_event || action.points === undefined) {
          if (point.down_event) {
            down_event = point.down_event;
            reset_action();
            action.points.push(point);
          } else {  
            reset_action();
            action.points = point.points;
            to_return.added = draw_line();
            to_return.action = action;
            reset_action();
          }
        } else {
          // Add point to list of points for this line
          action.points.push(point);
          // If we're going to redraw this line we should find the last version of it
          if (action.points.length > 2) {
            last_node = self.drops.pop();
          }
          // Delete the last node and action locally
          if (last_node && $.isFunction(last_node.remove)) {
            last_node.remove();
          }
          self.history.pop();
          // Draw the line again and return what the painter needs
          to_return.added = draw_line();
          to_return.action = action;
        }
        return to_return;
      };
    }()),
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
    activity = setInterval(paint_from_queue, 1);
  };
      
  var attach_events = function() {
    // When the mouse goes down we paint
    $(self.painting_surface).bind("mousedown", function(e) {
      active = true;
      has_moved = false;
      down_event = e;
      e.preventDefault();
    });
    
    $(self.painting_surface).bind("mouseout", function(e) {
      active = false;
      down_event = {};
      add_to_queue({ type: "nil" });
    });

    // When the mouse goes up we don't paint
    $(self.painting_surface).bind("mouseup", function(e) {
      if (has_moved === false) {
        enqueue_coords(e, "dot");
      }
      add_to_queue({ type: "nil" }); 
      active = false;
      down_event = {};
      e.preventDefault();
    });

    // When the mouse moves we might paint... it depends
    $(self.painting_surface).bind("mousemove", function(e) {
      has_moved = true;
      enqueue_coords(e, "line");
      e.preventDefault();
    });
  };
  
  var enqueue_coords = function(e, type) {
    var coords, colour;
    if (active === true) {
      coords = get_event_coordinates(e);
      colour = self.colour;
      if (coords && coords_are_valid(e, coords)) {
        if ((/^X.*/).test(colour)) {
          colour = colour.replace("X", "#");
        }
        add_to_queue({ coords: coords, type: type, colour: colour, brush_size: self.brush_size, timestamp: e.timeStamp, down_event: down_event.timeStamp });
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
      add_to_queue(this);
    });
  };
  
  var setup_controls = function(controls) {
    self.controls = controls;
    add_clear_functionality();
    add_colour_selection();
    add_brush_size_functionality();
  };
  
  var add_brush_size_functionality = function() {
    var current_size_id = "current-brush-size";
    $(self.controls.brush_size).slider({ 
        value: self.opts.default_brush_size, 
        max: self.opts.default_max_brush_size,
        change: function(event, ui) {
          var size = $(this).slider("value");
          // Set the size
          set_brush_size(size);
          // Show the size
          $("#" + current_size_id).text(self.brush_size);
        }
      });
    // Set the initial size
    set_brush_size($(self.controls.brush_size).slider("value"));
    // Show the current size to the user
    $(self.controls.brush_size).after("<span id=\"" + current_size_id + "\">" + self.brush_size + "</span>");
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
// Return X and Y coordinates for this event
    var src = get_event_source(e);
    return [(e.pageX - (src.offsetLeft > 0 ? src.offsetLeft : src.offsetParent.offsetLeft)),
            (e.pageY - (src.offsetTop > 0 ? src.offsetTop : src.offsetParent.offsetTop))];
  };

  var paint_from_queue = function() {
    var initial, new_one;
    if (busy === false) {
      busy = true;
      if (queue.length > 0) {
        initial = queue.shift();
        if ($.isFunction(drawing_types[initial.type])) {
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
  
  return function(painting, controls, opts, paintable) {
    self = this;
    // Sort out the options
    set_options(opts);
    // Initialise the painting
    init_painting(painting);
    
    // If it's not paintable, just show
    if (paintable === true) {
      // Attach events
      attach_events();
      // Controls for interface
      setup_controls(controls);
    }
    
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
