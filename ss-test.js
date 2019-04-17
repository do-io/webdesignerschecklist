class vsSquarespace {
  constructor(targetId, pageTitle, type) {
    this.targetId = targetId;
    this.pageTitle = pageTitle;
    this.type = type;
    this.targetEl = document.getElementById(this.targetId);
  }

  getId() {
    return this.targetId;
  }

  getTitle() {
    return this.pageTitle;
  }

  getType() {
    return this.type;
  }

  getContents() {
    switch (this.targetId) {
      case "vs-winelist":
        vsWineList.init(this.targetId);
        break;
      case "vs-wineclub":
        vsWineClub.init(this.targetId);
        break;
      default:
        switch (this.type) {
          case "club":
            vsWineClub.init(this.targetId);
            break;
          case "list":
            vsWineList.init(this.targetId);
            break;
        }
    }
  }
}

document.addEventListener("pageChange", () => {
  let title = document.getElementsByTagName("h1")[0].innerHTML;
  if (title == vsSS.getTitle()) {
    vsSS.getContents();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  let title = document.getElementsByTagName("h1")[0].innerHTML;
  if (title == vsSS.getTitle()) {
    vsSS.getContents();
  }
});

function watch() {
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
