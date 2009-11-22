var painting;

// Initialise painting
$(function() {
  
  var canvas = $("#painting"),
      id = $(canvas).attr("rel").replace("id-", ""),
      polling = {};
  
  // This is the painting
  painting = $(canvas).isAPainting({
    clear: $("#clear"),
    colours: $(".colours a")
  });
  
  // Interval for updating the history
  var send_history = function() {
    var history = painting.history;
    if (history && history.length > 0) {
      $.post("/paintings/" + id + "/history/update", {
        history: JSON.stringify(history)
      }, function(data) {
        console.log(data);
      }, "json");
    }
  };
  polling.updates = setInterval(send_history, 2000);
  
  var get_history = function() {
    $.getJSON("/paintings/" + id + "/history", function(data) {
      painting.add_many_to_queue(data);
    });
  };
  polling.fetches = setInterval(get_history, 2000);
  
});
