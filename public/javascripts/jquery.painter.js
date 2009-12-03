(function($) {
  
  var opts, controls, painting;
  
  $.fn.extend({
    isAPainting: function(controls, options, paintable) {
      controls = controls;
      opts = $.extend({}, $.fn.isAPainting.defaults, options);
      painting = new Painter(this, controls, opts, paintable);
      return painting || false;
    }
  });
  
  $.fn.isAPainting.defaults = {
    default_colour: "black",
    default_brush_size: 8,
    default_max_brush_size: 200,
    width: 900,
    height: 600
  };
  
}(jQuery));
