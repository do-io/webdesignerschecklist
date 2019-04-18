vinoShipperInjector = (function(window) {
  var cartInitialized = false;
  var module = {};
  var config = {
    sidePanelId: "vs-cart",
    iframeId: "vs-iframe",
    disableResize: window.vsDisableResize ? window.vsDisableResize : false,
    server: "https://vinoshipper.com",
//    server: detectServer(),
    clientCss: detectClientCSSOverride(),
    injectorCss: "https://vinoshipper.com/static/css/iframe/v2/injector.css",
    defaultIFramePadding: 100,
    defaultClubSignUpCallback: function() {
      vsLog("Club Sign Up Complete");
    },
  };

  var SIDE_PANEL = '<div id="vs-cart"></div>';
  var CART_BUTTON =
    '<div id="vs-injected-div" class="vs-cart-closed"><a href="javascript:vinoShipperInjector.showCart()" aria-label="View Cart"><span class="item-count">{items}</span></a></div>';

  // Utility Functions
  var vsLog = (window.vsLog = function() {
    vsLog.history = vsLog.history || [];
    vsLog.history.push(arguments);
    if (this.console) {
      console.log(Array.prototype.slice.call(arguments));
    }
  });
  var onDocumentReady = (function() {
    var f,
      b,
      c = {};
    c["[object Boolean]"] = "boolean";
    c["[object Number]"] = "number";
    c["[object String]"] = "string";
    c["[object Function]"] = "function";
    c["[object Array]"] = "array";
    c["[object Date]"] = "date";
    c["[object RegExp]"] = "regexp";
    c["[object Object]"] = "object";
    var d = {
      isReady: false,
      readyWait: 1,
      holdReady: function(g) {
        if (g) {
          d.readyWait++;
        } else {
          d.ready(true);
        }
      },
      ready: function(g) {
        if ((g === true && !--d.readyWait) || (g !== true && !d.isReady)) {
          if (!document.body) {
            return setTimeout(d.ready, 1);
          }
          d.isReady = true;
          if (g !== true && --d.readyWait > 0) {
            return;
          }
          f.resolveWith(document, [d]);
        }
      },
      bindReady: function() {
        if (f) {
          return;
        }
        f = d._Deferred();
        if (document.readyState === "complete") {
          return setTimeout(d.ready, 1);
        }
        if (document.addEventListener) {
          document.addEventListener("DOMContentLoaded", b, false);
          window.addEventListener("load", d.ready, false);
        } else {
          if (document.attachEvent) {
            document.attachEvent("onreadystatechange", b);
            window.attachEvent("onload", d.ready);
            var g = false;
            try {
              g = window.frameElement == null;
            } catch (h) {}
            if (document.documentElement.doScroll && g) {
              a();
            }
          }
        }
      },
      _Deferred: function() {
        var j = [],
          k,
          h,
          i,
          g = {
            done: function() {
              if (!i) {
                var m = arguments,
                  n,
                  q,
                  p,
                  o,
                  l;
                if (k) {
                  l = k;
                  k = 0;
                }
                for (n = 0, q = m.length; n < q; n++) {
                  p = m[n];
                  o = d.type(p);
                  if (o === "array") {
                    g.done.apply(g, p);
                  } else {
                    if (o === "function") {
                      j.push(p);
                    }
                  }
                }
                if (l) {
                  g.resolveWith(l[0], l[1]);
                }
              }
              return this;
            },
            resolveWith: function(m, l) {
              if (!i && !k && !h) {
                l = l || [];
                h = 1;
                try {
                  while (j[0]) {
                    j.shift().apply(m, l);
                  }
                } catch (n) {
                } finally {
                  k = [m, l];
                  h = 0;
                }
              }
              return this;
            },
            resolve: function() {
              g.resolveWith(this, arguments);
              return this;
            },
            isResolved: function() {
              return !!(h || k);
            },
            cancel: function() {
              i = 1;
              j = [];
              return this;
            },
          };
        return g;
      },
      type: function(g) {
        return g == null ? String(g) : c[Object.prototype.toString.call(g)] || "object";
      },
    };
    function a() {
      if (d.isReady) {
        return;
      }
      try {
        document.documentElement.doScroll("left");
      } catch (g) {
        setTimeout(a, 1);
        return;
      }
      d.ready();
    }
    if (document.addEventListener) {
      b = function() {
        document.removeEventListener("DOMContentLoaded", b, false);
        d.ready();
      };
    } else {
      if (document.attachEvent) {
        b = function() {
          if (document.readyState === "complete") {
            document.detachEvent("onreadystatechange", b);
            d.ready();
          }
        };
      }
    }
    function e(h) {
      d.bindReady();
      var g = d.type(h);
      f.done(h);
    }
    return e;
  })();
  var whichAnimationEvent = function() {
    var t,
      el = document.createElement("fakeelement");
    var animations = {
      animation: "animationend",
      OAnimation: "oAnimationEnd",
      MozAnimation: "animationend",
      WebkitAnimation: "webkitAnimationEnd",
    };
    for (t in animations) {
      if (el.style[t] !== undefined) {
        return animations[t];
      }
    }
  };
  var detectAnimationSupport = function(id) {
    var animation = false,
      animationstring = "animation",
      keyframeprefix = "",
      domPrefixes = "Webkit Moz O ms Khtml".split(" "),
      pfx = "",
      elm = document.getElementById(id);
    if (elm.style.animationName !== undefined) {
      animation = true;
    }
    if (animation === false) {
      for (var i = 0; i < domPrefixes.length; i++) {
        if (elm.style[domPrefixes[i] + "AnimationName"] !== undefined) {
          pfx = domPrefixes[i];
          animationstring = pfx + "Animation";
          keyframeprefix = "-" + pfx.toLowerCase() + "-";
          animation = true;
          break;
        }
      }
    }
    return animation;
  };
  var supplant = function(input, model) {
    vsLog(input);
    vsLog(model);
    if (!input || !model) {
      return input;
    }
    return input.replace(/{([^{}]*)}/g, function(a, b) {
      var r = model[b];
      return typeof r === "string" || typeof r === "number" ? r : a;
    });
  };
  var qsParam = function(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
      results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  };

  // Detect Configuration
  function detectServer() {
    var server = "${env.serverUrl}";
    if (window.location.hostname && window.location.hostname.indexOf("aws.zlminc.com") > 0) {
      server = "//" + window.location.hostname;
    }
    return server;
  }

  function detectClientCSSOverride() {
    return window.vsCssUrl || window.vinoshipperCss || "";
  }

  //Page Manipulation Functions
  function injectCss(href) {
    // bail out if already injected
    var styles = document.styleSheets;
    for (var i = 0, max = styles.length; i < max; i++) {
      if (styles[i].href === href) return;
    }

    var head = document.getElementsByTagName("head")[0],
      style = document.createElement("link");

    style.type = "text/css";
    style.rel = "stylesheet";
    style.href = href;

    head.insertBefore(style, head.firstChild);
  }

  function injectHtml(html, containerId) {
    var container = containerId ? document.getElementById(containerId) : document.getElementsByTagName("body")[0];
    container.insertAdjacentHTML("beforeend", html);
    var x = document.getElementsByClassName("vs-loading-msg");
    for (var i = 0; i < x.length; i++) {
      x[i].style.display = "none";
    }
  }

  function appendHtmlInto(target, content, data) {
    clearHtml(target);
    var interpolated = supplant(content, data);
    var receiverDiv = document.getElementById(target);
    receiverDiv.insertAdjacentHTML("beforeend", interpolated);
  }

  function clearHtml() {
    var div = document.getElementById("vs-injected-div");
    if (div) {
      div.parentNode.removeChild(div);
    }
  }

  function injectFragmentFromServer(path, container) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", config.server + path, false);
    xhr.onload = function() {
      if (xhr.status == 404) {
        container.appendChild(document.createComment("Winery ID / Product ID combination not found"));
      }
      if (xhr.status == 200) {
        container.innerHTML = xhr.responseText;
      }
    };
    xhr.onerror = function() {
      container.appendChild(document.createComment("Server Error"));
    };
    xhr.send(null);
  }

  function resizeContentIframe(height) {
    var body = document.body,
      html = document.documentElement;

    //hack: need fixed height to deal with mobile safari iframe in a fixed div issues
    var width = Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth);
    if (width > 480) return;

    if (!height) {
      height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
    }
    document.getElementById("vs-iframe-wrapper").style.height = height + "px";
  }

  //HTML Generation Functions
  function contentIframeHTML(page, cssFile, angularPath, params) {
    module.onClubSignupComplete = params.callback || config.defaultClubSignUpCallback;
    module.padding = isNaN(params.padding) ? config.defaultIFramePadding : params.padding;
    var scrolling = config.disableResize ? "" : 'scrolling="no"';
    var angular = angularPath ? "#" + angularPath + "?" : "&";
    var tkit = window.tkit ? "tkit=" + window.tkit + "&" : "";
    var gaid = module.gaClientId ? module.gaClientId + "&" : "";

    return (
      '<div style="position:relative; height:600px; overflow:auto; -webkit-overflow-scrolling:touch;"> <iframe id="vs-iframe" src="' +
      config.server +
      page +
      "?" +
      gaid +
      tkit +
      "css=" +
      cssFile +
      angular +
      "id=" +
      params["wineryId"] +
      "&lid=" +
      params["listId"] +
      "&clubId=" +
      params["clubId"] +
      "&bustCache=" +
      params["bustCache"] +
      '" style="position:absolute; top:0; left:0; width:100%; height:100%;" frameborder="0"' +
      scrolling +
      "webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe></div>"
    );
  }

  function cartIFrameHTML() {
    var cartId = "";
    if (module.sessionid) {
      cartId = "cartId=" + module.sessionid + "&";
    }
    var returnUrl = window.vsReturnUrl || window.location.href;
    var gaid = module.gaClientId ? module.gaClientId + "&" : "";
    return (
      '<div id="vs-injected-div" class="vs-cart-open"><div id="vs-iframe-wrapper" class="vs-cart-contents"><iframe allowPaymentRequest="true" src="' +
      config.server +
      "/iframe/v2/cart?" +
      gaid +
      cartId +
      "css=" +
      config.clientCss +
      "&ret=" +
      encodeURIComponent(returnUrl) +
      '" style="width:100%; height:100%;" width="100%" frameborder="0"></iframe></div></div>'
    );
  }

  //Interact with the cart
  function initCart() {
    injectHtml(SIDE_PANEL);
    destroyCart();
    cartInitialized = true;
  }

  function cartContents(cartId) {
    var contents = { items: "" };
    if (!cartId) {
      return contents;
    }

    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://vinoshipper.com/json-api/v2/cart/" + cartId, false);
    xhr.send(null);

    if (!xhr.responseText) {
      return contents;
    }

    var cart = JSON.parse(xhr.responseText);
    var items = 0;
    for (var i = 0; i < cart.contents.length; i++) {
      items += cart.contents[i].qty;
    }
    return { items: items };
  }

  function addItemToCart(productId, quantity, landingPage) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://vinoshipper.com/iframe/v2/cart/add?cartId=" + module.sessionid, false);
    xhr.onload = showCart;
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send("id=" + productId + "&quantity=" + quantity + "&landingPage=" + landingPage);
  }

  function destroyCart() {
    appendHtmlInto(config.sidePanelId, CART_BUTTON, cartContents(module.sessionid));
    document.getElementsByTagName("body")[0].style.overflow = "visible";
    document.getElementById("vs-injected-div").onclick = showCart;
  }

  function hideCart() {
    if (detectAnimationSupport(config.sidePanelId)) {
      var elm = document.getElementById("vs-injected-div");
      var transitionEvent = whichAnimationEvent();

      var onAnimationEnd = function(event) {
        elm.removeEventListener(transitionEvent, onAnimationEnd);
        destroyCart();
      };

      elm.addEventListener(transitionEvent, onAnimationEnd);
      elm.className = "vs-cart-open vs-closing";
    } else {
      destroyCart();
    }
  }

  function showCart() {
    appendHtmlInto(config.sidePanelId, cartIFrameHTML());
    document.getElementsByTagName("body")[0].style.overflow = "hidden";
    document.getElementById("vs-injected-div").onclick = hideCart;
  }

  //Communicate with the IFrame
  function onMessage(message) {
    vsLog(message);
    if (typeof message.data !== "string") return;
    if (message.data === "canHazPostMessage") {
      document.getElementById(config.iframeId).contentWindow.postMessage("canHazPostMessage ack", "*");
    } else if (message.data.indexOf("canHazPostMessage:") >= 0) {
      module.sessionid = message.data.split(":")[1];
      vsLog("session id: " + module.sessionid);
      if (document.getElementById("vs-iframe")) {
        document.getElementById(config.iframeId).contentWindow.postMessage("canHazPostMessage ack", "*");
      }
    } else if (message.data.indexOf("displayCart:") >= 0) {
      module.sessionid = message.data.split(":")[1];
      showCart();
    } else if (message.data === "hideCart") {
      hideCart();
    } else if (message.data.indexOf("iframe-height:") >= 0) {
      var height = message.data.split(":")[1];
      if (!config.disableResize) {
        height = parseInt(height) + module.padding;
        document.getElementById("vs-iframe").parentNode.style.height = height + "px";
      }
    } else if (message.data.indexOf("height:") >= 0) {
      resizeContentIframe(message.data.split(":")[1]);
    } else if (message.data.indexOf("clubSignUpComplete") >= 0) {
      var payload = message.data.split(":")[1];
      module.onClubSignupComplete(payload);
    }
  }

  function initGoogle(callback, attempts) {
    attempts = attempts || 0;
    if (window.ga && ga.create && !window.vsSkipAnalytics) {
      ga(function() {
        if (ga.getAll && ga.getAll().length > 0) {
          module.gaClientId = ga.getAll()[0].get("linkerParam");
        }
        callback();
      });
    } else {
      if (attempts <= 3) {
        //retry in case GA is just slow
        setTimeout(function() {
          vsLog("attempt to load google: " + attempts + " skip:" + window.vsSkipAnalytics);
          initGoogle(callback, attempts + 1);
        }, 100);
      } else {
        vsLog("Google Analytics is blocked");
        callback();
      }
    }
  }
  
  // add parameters you need here
  var onReady = function(callback) {
    callback = callback || function() {};
    // wait until DOM is ready to append stuff
    onDocumentReady(function() {
      (function(callback) {
        injectCss(config.injectorCss);
        initGoogle(callback);
      })(callback);
    });
  };

  window.addEventListener ? window.addEventListener("message", onMessage) : window.attachEvent("onmessage", onMessage);

  var sessionid = "${cart.cartId}";
  "postMessage" in parent && parent.postMessage("canHazPostMessage:" + sessionid, "*");

  //Public functions
  module.sessionid = "";
  module.onReady = onReady;
  module.initCart = initCart;
  module.showCart = showCart;
  module.hideCart = hideCart;
  module.addToCart = addItemToCart;
  module.injectHtml = injectHtml;
  module.outerIFrame = contentIframeHTML;
  module.qsParam = qsParam;
  module.injectFragmentFromServer = injectFragmentFromServer;
  module.cartInitialized = cartInitialized;
  return module;
})(window);

vsWineList = (function(window) {
  var initialized = false;

  function initInjector(container, force) {
    if (!initialized || force) {
      vinoShipperInjector.onReady(function() {
        var wineryId = window.vsWineryId;
        var cssFile = window.vsCssUrl || "";
        var listId = window.vsWineListId || "";
        var bustCache = window.vsBustCache || false;

        if (document.getElementById(container)) {
          var iframe = vinoShipperInjector.outerIFrame("/iframe/v2/wine-list", cssFile, null, {
            wineryId: wineryId,
            listId: listId,
            bustCache: bustCache,
          });
          vinoShipperInjector.injectHtml(iframe, container);
          vinoShipperInjector.initCart();
          initialized = true;
        }
      }, true);
    }
  }

  return {
    init: initInjector,
    initialized: function() {
      return initialized;
    },
  };
})(window);

vsWineClub = (function(window) {
  var initialized = false;

  function initInjector(container, force) {
    if (!initialized || force) {
      vinoShipperInjector.onReady(function() {
        var wineryId = window.vsWineryId;
        var cssFile = window.vsCssUrl || "";
        var clubId = window.clubId || vinoShipperInjector.qsParam("clubId") || "";
        var padding = window.vsIFramePadding;

        if (document.getElementById(container)) {
          var iframe = vinoShipperInjector.outerIFrame("/apps/registration/club/CLUB", cssFile, null, {
            wineryId: wineryId,
            clubId: clubId,
            padding: padding,
            callback: window.vsOnClubSignUpComplete,
          });

          vinoShipperInjector.injectHtml(iframe, container);
          initialized = true;
        }
      }, true);
    }
  }

  return {
    init: initInjector,
    initialized: function() {
      return initialized;
    },
  };
})(window);

vsAddToCartButton = (function(window) {
  function renderWidget(target) {
    var productId = target.getAttribute("data-product-id");
    var wineryId = target.getAttribute("data-account-id") || target.getAttribute("data-winery-id");
    var program = target.getAttribute("data-affinity-program");
    var isMember = target.getAttribute("data-is-member");
    var units = target.getAttribute("data-product-units") || "";

    vinoShipperInjector.injectFragmentFromServer(
      "/iframe/v3/add-to-cart-button?wineryId=" +
        wineryId +
        "&productId=" +
        productId +
        "&program=" +
        program +
        "&member=" +
        isMember +
        "&units=" +
        units,
      target
    );
  }

  function handleSubmit(event, form) {
    event.preventDefault();
    var productId = form.productId ? form.productId.value : form.id.value;
    var quantity = 0;
    var minimumOrder = form.minimumOrder ? form.minimumOrder.value || 1 : 1;
    var landingPage = form.landingPage && form.landingPage.value ? form.landingPage.value : "";

    for (var i = 0; i < form.elements.length; i++) {
      var el = form.elements[i];
      if (el.name === "quantity") {
        quantity += parseInt(el.value);
      }
    }

    quantity = quantity > 0 ? quantity : minimumOrder;
    vinoShipperInjector.addToCart(productId, quantity, landingPage);
    return false;
  }

  function initInjector(selector) {
    vinoShipperInjector.onReady(function() {
      var buttons = document.querySelectorAll(selector);
      for (var i = 0; i < buttons.length; i++) {
        renderWidget(buttons[i]);
      }
    });
  }

  return {
    submit: handleSubmit,
    init: initInjector,
  };
})(window);

vsSquarespace = (function(window) {
  var targetId = window.vsWineryId,
    type = window.type,
    module = {};
  
  function isSquarespace() {
    if ( ( document.getElementsByTagName('head')[0].innerHTML.search("<!-- This is Squarespace. -->") ) > -1 ) {
      console.log('Squarespace found');
      return true;
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

  module.isSquarespace = isSquarespace;
  module.vsPageWatch = vsPageWatch;
  return module;
})(window);

// Initialize the iframes
window.onload = (function(window) {
  if (vsSquarespace.isSquarespace()) {
    vsSquarespace.vsPageWatch();
    
    document.addEventListener("pageChange", function () {
      if (document.getElementById("vs-winelist")) {
          vsWineList.init("vs-winelist");
      }
      if (document.getElementById("vs-wineclub")) {
          vsWineClub.init("vs-wineclub-signup");
      }
    });
    document.addEventListener("DOMContentLoaded", function () {
      if (document.getElementById("vs-winelist")) {
          vsWineList.init("vs-winelist");
      }
      if (document.getElementById("vs-wineclub")) {
          vsWineClub.init("vs-wineclub-signup");
      }
    });
  }
})(window);
vsWineClub.init("vs-wineclub-signup");
vsWineList.init("vs-winelist");
vsAddToCartButton.init(".vs-add-to-cart");

vinoShipperInjector.onReady(function() {
  if (!vinoShipperInjector.cartInitialized && !vsWineClub.initialized()) {
    vinoShipperInjector.initCart();
  }
});
