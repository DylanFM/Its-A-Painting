var painting;

// Initialise painting
$(function() {
  painting = $("#painting").isAPainting({
    clear: $("#clear"),
    colours: $(".colours a")
  });
});
