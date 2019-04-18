vsSquarespace = (function(window) {
  var targetId = window.vsWineryId,
    type = window.type;

  function getContents() {
    if (document.getElementById("vs-winelist")) {
      vsWineList.init("vs-winelist");
    }

    if (document.getElementById("vs-wineclub")) {
      vsWineClub.init("vs-wineclub");
    }
    switch (type) {
      case "club":
        vsWineClub.init(targetId);
        break;
      case "list":
        vsWineList.init(targetId);
        break;
    }
  }

  function vsPageWatch() {
    MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    var a = new MutationObserver(function(a) {
      for (var b = 0; b < a.length; b++) {
        var c = a[b];
        if ("attributes" === c.type) {
          var d = new Event("pageChange");
          document.dispatchEvent(d);
        }
      }
    });
    a.observe(document.body, { attributes: !0, attributeFilter: ["id"] });
  }
  module.vsPageWatch = vsPageWatch;
  module.getContents = getContents;
  return module;
})(window);
