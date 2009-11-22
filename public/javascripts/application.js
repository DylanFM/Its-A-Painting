var painting;

// Initialise painting
$(function() {
  
  var canvas = $("#painting"),
      id = $(canvas).attr("rel").replace("id-", ""),
      get_history = function() {
        $.getJSON("/paintings/" + id + "/history", function(data) {
          painting.clear_painting();
          painting.add_many_to_queue(data);
        });
      },
      send_history = function() {
        var history = painting.history;
        if (history && history.length > 0) {
          $.post("/paintings/" + id + "/history/update", {
            history: JSON.stringify(history)
          }, function(data) {
            console.log(data);
          }, "json");
        }
      };
  
  // This is the painting
  painting = $(canvas).isAPainting({
    clear: $("#clear"),
    colours: $(".colours a"),
    brush_size: $("#slider")
  });
  
  $("#save").bind('click', function(event) {
    send_history();
    event.preventDefault();
  });
  
  $("#refresh").bind('click', function(event) {
    get_history();
    event.preventDefault();
  });
  
});
