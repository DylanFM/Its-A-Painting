(function($) {
  
  var opts, controls, painting;
  
  $.fn.extend({
    isAPainting: function(controls, options) {
      controls = controls;
      opts = $.extend({}, $.fn.isAPainting.defaults, options);
      painting = new Painter(this, controls, opts);
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
