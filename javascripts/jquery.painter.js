(function($) {
  
  var opts, controls, painting;
  
  $.fn.extend({
    isAPainting: function(controls, options) {
      controls = controls;
      opts = $.extend({}, $.fn.isAPainting.defaults, options);
      painting = new Painter(this, controls, opts);
      return painting.node || false;
    }
  });
  
  $.fn.isAPainting.defaults = {
    default_colour: "black",
    width: 900,
    height: 600
  };
  
}(jQuery));