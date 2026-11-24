(function () {
  var CONTENT = {
    settings: "content/settings.json",
    hero: "content/hero.json",
    join: "content/join.json",
    academy: "content/academy.json",
    salary: "content/salary.json",
    referral: "content/referral.json",
    videos: "content/videos.json",
    events: "content/events.json",
    gallery: "content/gallery.json",
    stories: "content/stories.json",
    about: "content/about.json",
    contact: "content/contact.json"
  };

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function safeUrl(u) {
    if (!u) return "";
    u = String(u).trim();
    if (/^(https?:|mailto:|tel:|sms:|\/|#)/i.test(u)) return u;
    return "";
  }

  function assetUrl(p) {
    if (!p) return "";
    p = String(p).trim();
    if (/^https?:\/\//i.test(p)) return p;
    return p.replace(/^\//, "");
  }

  function fmt(str, vars) {
    var s = String(str == null ? "" : str);
    if (vars) {
      s = s.replace(/\{([a-zA-Z0-9]+)\}/g, function (_, k) {
        return vars[k] != null ? String(vars[k]) : "";
      });
    }
    var re = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
    var out = "";
    var last = 0;
    var m;
    while ((m = re.exec(s))) {
      out += esc(s.slice(last, m.index));
      var t = m[0];
      if (t.indexOf("**") === 0) {
        out += "<strong>" + esc(t.slice(2, -2)) + "</strong>";
      } else if (t.charAt(0) === "*") {
        out += "<em>" + esc(t.slice(1, -1)) + "</em>";
      } else {
        var mm = t.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        var href = mm ? safeUrl(mm[2]) : "";
        if (href) {
          var abs = /^https?:/i.test(href) || /^mailto:/i.test(href);
          out +=
            '<a href="' +
            esc(href) +
            '"' +
            (abs ? ' rel="noopener" target="_blank"' : "") +
            ">" +
            esc(mm[1]) +
            "</a>";
        } else {
          out += esc(t);
        }
      }
      last = re.lastIndex;
    }
    return out + esc(s.slice(last));
  }

  function digits(num) {
    return String(num || "").replace(/\D/g, "");
  }

  function toWa(num) {
    var d = digits(num);
    if (!d) return "2347065046266";
    if (d.indexOf("234") === 0) return d;
    if (d.charAt(0) === "0") return "234" + d.slice(1);
    if (d.length === 10) return "234" + d;
    return d;
  }

  function waLink(settings, text) {
    var href = "https://wa.me/" + toWa(settings.whatsappNumber || settings.whatsappDisplay);
    if (text) href += "?text=" + encodeURIComponent(text);
    return href;
  }

  function setMeta(sel, attr, val) {
    if (!val) return;
    var el = document.querySelector(sel);
    if (el) el.setAttribute(attr, val);
  }

  function ready(settings) {
    var drawer = document.getElementById("drawer");
    var btn = document.getElementById("menuBtn");
    if (btn && drawer && !btn._bound) {
      btn._bound = true;
      btn.addEventListener("click", function () {
        var open = drawer.classList.toggle("open");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
      });
      drawer.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () {
          drawer.classList.remove("open");
          btn.setAttribute("aria-expanded", "false");
        });
      });
    }

    var shareBtn = document.getElementById("shareBtn");
    if (shareBtn && !shareBtn._bound) {
      shareBtn._bound = true;
      shareBtn.addEventListener("click", function () {
        var data = {
          title: settings.shareTitle || settings.ogTitle || settings.siteName,
          text: settings.shareText || settings.ogDescription || "",
          url: location.href
        };
        var done = function () {
          shareBtn.textContent = "Link copied!";
          setTimeout(function () {
            shareBtn.textContent = (window._shareLabel || "Share this page");
          }, 1600);
        };
        if (navigator.share) {
          navigator.share(data).catch(function () {
            if (navigator.clipboard && navigator.clipboard.writeText) {
              navigator.clipboard.writeText(location.href).then(done).catch(function () {});
            }
          });
          return;
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(location.href).then(done).catch(function () {});
        }
      });
    }
  }

  function fetchJson(path) {
    return fetch(path, { cache: "no-cache" }).then(function (res) {
      if (!res.ok) throw new Error("Could not load " + path);
      return res.json();
    });
  }

  function loadAll() {
    var keys = Object.keys(CONTENT);
    return Promise.all(
      keys.map(function (k) {
        return fetchJson(CONTENT[k]).then(
          function (data) {
            return { k: k, data: data };
          },
          function (err) {
            return { k: k, error: err };
          }
        );
      })
    ).then(function (rows) {
      var out = {};
      var failed = [];
      rows.forEach(function (row) {
        if (row.error) failed.push(row.k);
        else out[row.k] = row.data;
      });
      if (failed.indexOf("settings") !== -1 || failed.indexOf("hero") !== -1) {
        throw new Error("Missing core content: " + failed.join(", "));
      }
      return out;
    });
  }

  function applySettings(s) {
    if (s.title) document.title = s.title;
    setMeta('meta[name="description"]', "content", s.description);
    setMeta('meta[property="og:title"]', "content", s.ogTitle || s.title);
    setMeta('meta[property="og:description"]', "content", s.ogDescription || s.description);
    setMeta('meta[name="twitter:title"]', "content", s.ogTitle || s.title);
    setMeta('meta[name="twitter:description"]', "content", s.ogDescription || s.description);
    var origin = (s.publicUrl || "").replace(/\/$/, "");
    if (origin) {
      setMeta('link[rel="canonical"]', "href", origin + "/");
      setMeta('meta[property="og:url"]', "content", origin + "/");
      var ogImg = assetUrl(s.ogImage);
      if (ogImg) {
        var abs = /^https?:/i.test(ogImg) ? ogImg : origin + "/" + ogImg;
        setMeta('meta[property="og:image"]', "content", abs);
        setMeta('meta[name="twitter:image"]', "content", abs);
      }
    }
    var wa = waLink(s);
    var logoHtml =
      '<span class="logo-mark">' +
      esc(s.logoLetter || "R") +
      "</span><span>" +
      esc(s.siteName || "Roxy Agency") +
      (s.logoTagline ? "<small>" + esc(s.logoTagline) + "</small>" : "") +
      "</span>";
    var brand = document.getElementById("brandLogo");
    if (brand) brand.innerHTML = logoHtml;
    ["navWa", "drawerWa", "floatWa"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.setAttribute("href", wa);
    });
    var navWa = document.getElementById("navWa");
    if (navWa && s.headerCta) navWa.textContent = s.headerCta;
    var drawerWa = document.getElementById("drawerWa");
    if (drawerWa && s.headerCta) drawerWa.textContent = s.headerCta + " — free";
  }

  function renderHero(h, s) {
    var bg = document.getElementById("heroBg");
    if (bg && h.backgroundImage) {
      bg.style.setProperty("--hero-image", 'url("' + assetUrl(h.backgroundImage) + '")');
    }
    var chips = (h.chips || [])
      .map(function (c) {
        return '<span class="chip">' + esc(c) + "</span>";
      })
      .join("");
    var mount = document.getElementById("heroMount");
    var img = assetUrl(h.asideImage);
    mount.innerHTML =
      "<div>" +
      (h.eyebrow ? '<span class="eyebrow">' + esc(h.eyebrow) + "</span>" : "") +
      "<h1>" +
      esc(h.headline || "") +
      (h.headlineAccent ? " <em>" + esc(h.headlineAccent) + "</em>" : "") +
      "</h1>" +
      (h.lead ? '<p class="lead">' + fmt(h.lead) + "</p>" : "") +
      (chips ? '<div class="tagrow">' + chips + "</div>" : "") +
      '<div class="cta-row">' +
      '<a class="btn btn-wa" href="' +
      esc(waLink(s)) +
      '">' +
      esc(h.primaryCta || "Join on WhatsApp — free") +
      "</a>" +
      '<a class="btn btn-ghost" href="#download">' +
      esc(h.secondaryCta || "Download BIGO") +
      "</a>" +
      '<a class="btn btn-gold" href="#join">' +
      esc(h.tertiaryCta || "Apply now") +
      "</a>" +
      "</div>" +
      (h.finePrint ? '<p class="fine">' + esc(h.finePrint) + "</p>" : "") +
      "</div>" +
      (img
        ? '<div class="hero-aside"><img src="' +
          esc(img) +
          '" width="720" height="1280" alt="' +
          esc(h.asideAlt || "") +
          '"></div>'
        : "");
    show("top");
  }

  function renderJoin(j, s) {
    var stores = (j.stores || [])
      .map(function (st) {
        var href = safeUrl(st.url);
        return (
          '<a class="store-card" href="' +
          esc(href) +
          '" rel="noopener" target="_blank">' +
          '<span class="store-ico" aria-hidden="true">' +
          esc(st.icon || "▶") +
          "</span><span><b>" +
          esc(st.name) +
          "</b><span>" +
          esc(st.note || "") +
          "</span></span></a>"
        );
      })
      .join("");
    document.getElementById("download").innerHTML =
      '<div class="wrap">' +
      '<p class="sec-kicker">' +
      esc(j.downloadKicker || "Get the app") +
      "</p>" +
      '<h2 class="sec-h">' +
      esc(j.downloadTitle || "Download official BIGO Live") +
      "</h2>" +
      (j.downloadSub ? '<p class="sec-sub">' + fmt(j.downloadSub) + "</p>" : "") +
      '<div class="store-grid">' +
      stores +
      "</div></div>";
    show("download");

    var vars = { invite: s.inviteUrl || "", search: s.searchTerm || "presido" };
    var steps = (j.steps || [])
      .map(function (step) {
        if (step.divider) {
          return '<div class="or">' + esc(step.divider) + "</div>";
        }
        return (
          '<article class="step"><h3>' +
          fmt(step.title, vars) +
          "</h3><p>" +
          fmt(step.text, vars) +
          "</p></article>"
        );
      })
      .join("");
    document.getElementById("join").innerHTML =
      '<div class="wrap">' +
      '<p class="sec-kicker">' +
      esc(j.kicker || "Start here") +
      "</p>" +
      '<h2 class="sec-h">' +
      esc(j.title || "How to join Roxy") +
      "</h2>" +
      (j.sub ? '<p class="sec-sub">' + fmt(j.sub) + "</p>" : "") +
      '<div class="steps">' +
      steps +
      "</div>" +
      (j.warning ? '<p class="warn">' + fmt(j.warning, vars) + "</p>" : "") +
      '<p style="margin-top:18px" class="cta-row">' +
      '<a class="btn btn-gold" href="' +
      esc(safeUrl(s.inviteUrl)) +
      '">' +
      esc(j.inviteButton || "Open invite link") +
      "</a>" +
      '<a class="btn btn-wa" href="' +
      esc(waLink(s)) +
      '">' +
      esc(j.whatsappButton || "Message WhatsApp") +
      "</a></p></div>";
    show("join");
  }

  function renderAcademy(a, salary) {
    var cards = (a.cards || [])
      .map(function (card) {
        var body = "";
        if (card.text) body += "<p>" + fmt(card.text) + "</p>";
        if (card.bullets && card.bullets.length) {
          body +=
            "<ul>" +
            card.bullets
              .map(function (b) {
                return "<li>" + fmt(b) + "</li>";
              })
              .join("") +
            "</ul>";
        }
        return (
          '<details class="card"' +
          (card.open ? " open" : "") +
          "><summary><span class=\"ico-pill\">" +
          esc(card.icon || "•") +
          "</span> " +
          esc(card.title || "") +
          '</summary><div class="body">' +
          body +
          "</div></details>"
        );
      })
      .join("");

    var table = "";
    if (salary && salary.rows && salary.rows.length) {
      table =
        '<h3 class="display" style="margin-top:36px;font-size:1.35rem">' +
        esc(salary.title || "Host salary ladder") +
        "</h3>" +
        (salary.intro ? '<p class="note">' + fmt(salary.intro) + "</p>" : "") +
        '<div class="table-wrap" tabindex="0"><table><thead><tr>' +
        "<th>Rank</th><th>Bean target</th><th>Live hours</th><th>Host salary (USD)</th>" +
        "</tr></thead><tbody>" +
        salary.rows
          .map(function (r) {
            return (
              "<tr><td>" +
              esc(r.rank) +
              "</td><td>" +
              esc(r.beans) +
              "</td><td>" +
              esc(r.hours) +
              "</td><td>" +
              esc(r.salary) +
              "</td></tr>"
            );
          })
          .join("") +
        "</tbody></table></div>" +
        (salary.note ? '<p class="note">' + fmt(salary.note) + "</p>" : "") +
        (salary.payoutTitle || salary.payoutText
          ? '<div class="pay-card"><p style="margin:0 0 8px"><strong>' +
            fmt(salary.payoutTitle || "") +
            "</strong></p><p style=\"margin:0\">" +
            fmt(salary.payoutText || "") +
            "</p></div>"
          : "");
    }

    document.getElementById("academy").innerHTML =
      '<div class="wrap">' +
      '<p class="sec-kicker">' +
      esc(a.kicker || "Roxy Academy") +
      "</p>" +
      '<h2 class="sec-h">' +
      esc(a.title || "") +
      "</h2>" +
      (a.sub ? '<p class="sec-sub">' + fmt(a.sub) + "</p>" : "") +
      '<div class="acc">' +
      cards +
      "</div>" +
      table +
      "</div>";
    show("academy");
  }

  function renderReferral(r, s) {
    var tiers = (r.tiers || [])
      .map(function (t) {
        return (
          '<div class="ref-item"><span>' +
          esc(t.label) +
          "</span><b>" +
          esc(t.amount) +
          "</b></div>"
        );
      })
      .join("");
    document.getElementById("referral").innerHTML =
      '<div class="wrap">' +
      '<p class="sec-kicker">' +
      esc(r.kicker || "Invite & earn") +
      "</p>" +
      '<h2 class="sec-h">' +
      esc(r.title || "") +
      "</h2>" +
      (r.sub ? '<p class="sec-sub">' + fmt(r.sub) + "</p>" : "") +
      '<div class="ref-grid">' +
      tiers +
      "</div>" +
      (r.body ? "<p>" + fmt(r.body) + "</p>" : "") +
      '<a class="btn btn-gold" href="' +
      esc(waLink(s, r.buttonMessage || "Hello Roxy, I want to refer a new host")) +
      '">' +
      esc(r.button || "Tell us about a new host") +
      "</a></div>";
    show("referral");
  }

  function renderVideos(v) {
    var items = (v && v.items) || (Array.isArray(v) ? v : []);
    if (!items.length) {
      hide("videos");
      return;
    }
    var vids = items
      .map(function (item) {
        var src = assetUrl(item.src);
        var poster = assetUrl(item.poster);
        return (
          '<figure class="vid"><video controls preload="none" playsinline' +
          (poster ? ' poster="' + esc(poster) + '"' : "") +
          (src ? ' src="' + esc(src) + '"' : "") +
          ' title="' +
          esc(item.title || "") +
          '"></video><figcaption><b>' +
          esc(item.title || "") +
          "</b> " +
          esc(item.caption || "") +
          "</figcaption></figure>"
        );
      })
      .join("");
    document.getElementById("videos").innerHTML =
      '<div class="wrap">' +
      '<p class="sec-kicker">' +
      esc((v && v.kicker) || "Watch") +
      "</p>" +
      '<h2 class="sec-h">' +
      esc((v && v.title) || "Videos from Roxy") +
      "</h2>" +
      (v && v.sub ? '<p class="sec-sub">' + fmt(v.sub) + "</p>" : "") +
      '<div class="vids">' +
      vids +
      "</div></div>";
    show("videos");
  }

  function renderEvents(e) {
    var items = ((e && e.items) || (Array.isArray(e) ? e : [])).filter(function (it) {
      return it && it.published !== false;
    });
    if (!items.length) {
      hide("events");
      return;
    }
    var cards = items
      .map(function (it) {
        var img = assetUrl(it.image);
        return (
          '<article class="e-card">' +
          (img
            ? '<img src="' +
              esc(img) +
              '" alt="' +
              esc(it.imageAlt || it.title || "") +
              '" width="720" height="1280">'
            : "") +
          '<div class="pad"><h3>' +
          esc(it.title || "") +
          "</h3>" +
          (it.date ? '<p class="note">' + esc(it.date) + "</p>" : "") +
          "<p>" +
          fmt(it.text || "") +
          "</p></div></article>"
        );
      })
      .join("");
    document.getElementById("events").innerHTML =
      '<div class="wrap">' +
      '<p class="sec-kicker">' +
      esc((e && e.kicker) || "Vibes") +
      "</p>" +
      '<h2 class="sec-h">' +
      esc((e && e.title) || "Events, PK and posters") +
      "</h2>" +
      (e && e.sub ? '<p class="sec-sub">' + fmt(e.sub) + "</p>" : "") +
      '<div class="cards">' +
      cards +
      "</div></div>";
    show("events");
  }

  function renderGallery(g) {
    var photos = (g && g.photos) || [];
    if (!photos.length) {
      hide("gallery");
      return;
    }
    var cards = photos
      .map(function (p) {
        var img = assetUrl(p.image);
        if (!img) return "";
        return (
          '<figure class="g-card"><img src="' +
          esc(img) +
          '" alt="' +
          esc(p.alt || p.caption || "") +
          '">' +
          (p.caption ? "<figcaption>" + esc(p.caption) + "</figcaption>" : "") +
          "</figure>"
        );
      })
      .join("");
    document.getElementById("gallery").innerHTML =
      '<div class="wrap">' +
      '<p class="sec-kicker">' +
      esc(g.kicker || "Photos") +
      "</p>" +
      '<h2 class="sec-h">' +
      esc(g.title || "Pictures from the agency") +
      "</h2>" +
      (g.sub ? '<p class="sec-sub">' + fmt(g.sub) + "</p>" : "") +
      '<div class="gallery">' +
      cards +
      "</div></div>";
    show("gallery");
  }

  function renderStories(st, s) {
    var items = (st && st.items) || [];
    var quotes = items
      .filter(function (it) {
        return it && it.quote && it.published !== false;
      })
      .map(function (it) {
        var img = assetUrl(it.photo);
        return (
          '<figure class="story-card">' +
          (img ? '<img src="' + esc(img) + '" alt="' + esc(it.name || "") + '">' : "") +
          "<blockquote>" +
          fmt(it.quote) +
          "</blockquote>" +
          (it.name ? "<figcaption>— " + esc(it.name) + "</figcaption>" : "") +
          "</figure>"
        );
      })
      .join("");
    var placeholder = "";
    if (!quotes) {
      placeholder =
        '<div class="story"><p>' +
        fmt(st.placeholder || "") +
        "</p>" +
        '<a class="btn btn-navy" href="' +
        esc(waLink(s, st.buttonMessage || "Hello Roxy, I want to share my host story")) +
        '">' +
        esc(st.button || "Share your story") +
        "</a></div>";
    } else {
      placeholder =
        '<div class="story-list">' +
        quotes +
        "</div>" +
        '<p style="margin-top:18px"><a class="btn btn-navy" href="' +
        esc(waLink(s, st.buttonMessage || "Hello Roxy, I want to share my host story")) +
        '">' +
        esc(st.button || "Share your story") +
        "</a></p>";
    }
    document.getElementById("stories").innerHTML =
      '<div class="wrap">' +
      '<p class="sec-kicker">' +
      esc((st && st.kicker) || "Hosts") +
      "</p>" +
      '<h2 class="sec-h">' +
      esc((st && st.title) || "Your story here") +
      "</h2>" +
      placeholder +
      "</div>";
    show("stories");
  }

  function renderAbout(a, s) {
    var paras = (a.paragraphs || [])
      .map(function (p) {
        return "<p>" + fmt(p) + "</p>";
      })
      .join("");
    var bullets = (a.whyBullets || [])
      .map(function (b) {
        return "<li>" + fmt(b) + "</li>";
      })
      .join("");
    var photo = assetUrl(a.photo);
    document.getElementById("about").innerHTML =
      '<div class="wrap split"><div>' +
      '<p class="sec-kicker">' +
      esc(a.kicker || "Meet your agent") +
      "</p>" +
      '<h2 class="sec-h">' +
      esc(a.title || "") +
      "</h2>" +
      paras +
      (photo
        ? '<p><img src="' +
          esc(photo) +
          '" alt="' +
          esc(a.photoAlt || "") +
          '" style="border-radius:18px;max-width:100%"></p>'
        : "") +
      '<a class="btn btn-wa" href="' +
      esc(waLink(s)) +
      '">' +
      esc(a.button || "Chat Pride on WhatsApp") +
      "</a></div>" +
      (bullets
        ? '<div class="panel"><h3>' +
          esc(a.whyTitle || "Why Roxy?") +
          "</h3><ul>" +
          bullets +
          "</ul></div>"
        : "") +
      "</div>";
    show("about");
  }

  function renderContact(c, s) {
    var wa = waLink(s);
    var qr = assetUrl(s.qrImage);
    if (!qr && s.whatsappNumber) {
      qr =
        "https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=" +
        encodeURIComponent(wa);
    }
    window._shareLabel = (c && c.shareButton) || "Share this page";
    document.getElementById("contact").innerHTML =
      '<div class="wrap split"><div>' +
      '<p class="sec-kicker">' +
      esc((c && c.kicker) || "Talk to us") +
      "</p>" +
      '<h2 class="sec-h">' +
      esc((c && c.title) || "WhatsApp, email, and a scan-to-chat code") +
      "</h2>" +
      '<ul class="contact-list">' +
      "<li>WhatsApp: <a href=\"" +
      esc(wa) +
      '">' +
      esc(s.whatsappDisplay || s.whatsappNumber) +
      "</a><br><span style=\"font-weight:500;color:#c3d2f0\">" +
      esc(s.whatsappInternational || "") +
      "</span></li>" +
      (s.email
        ? "<li>Email: <a href=\"mailto:" +
          esc(s.email) +
          '">' +
          esc(s.email) +
          "</a></li>"
        : "") +
      "</ul>" +
      '<div class="cta-row">' +
      '<a class="btn btn-wa" href="' +
      esc(wa) +
      '">' +
      esc((c && c.whatsappButton) || "Open WhatsApp chat") +
      "</a>" +
      '<button class="btn btn-ghost" type="button" id="shareBtn">' +
      esc((c && c.shareButton) || "Share this page") +
      "</button></div>" +
      (c && c.note ? '<p class="fine">' + fmt(c.note) + "</p>" : "") +
      "</div>" +
      (qr
        ? '<div class="qr-box"><img src="' +
          esc(qr) +
          '" width="468" height="558" alt="QR code that opens a WhatsApp chat with ' +
          esc(s.siteName || "Roxy Agency") +
          " on " +
          esc(s.whatsappInternational || s.whatsappDisplay || "") +
          '"><p>' +
          esc((c && c.qrCaption) || "Scan to chat us on WhatsApp") +
          "</p></div>"
        : "") +
      "</div>";
    show("contact");
  }

  function renderFooter(s) {
    var vars = {
      whatsapp: s.whatsappDisplay || s.whatsappNumber,
      email: s.email,
      search: s.searchTerm || "presido"
    };
    var extra = s.footerExtra
      ? s.footerExtra
          .replace("{whatsapp}", "[" + vars.whatsapp + "](" + waLink(s) + ")")
          .replace("{email}", "[" + vars.email + "](mailto:" + vars.email + ")")
          .replace("{search}", vars.search)
      : "";
    document.getElementById("siteFooter").innerHTML =
      '<div class="wrap">' +
      '<a class="logo" href="#top"><span class="logo-mark">' +
      esc(s.logoLetter || "R") +
      "</span><span>" +
      esc(s.siteName || "Roxy Agency") +
      "</span></a>" +
      (s.legal ? '<p class="legal">' + fmt(s.legal) + "</p>" : "") +
      (extra ? '<p class="legal">' + fmt(extra) + "</p>" : "") +
      "</div>";
  }

  function show(id) {
    var el = document.getElementById(id);
    if (el) el.classList.remove("is-pending", "is-empty");
  }
  function hide(id) {
    var el = document.getElementById(id);
    if (el) {
      el.classList.add("is-empty");
      el.classList.remove("is-pending");
      el.innerHTML = "";
    }
  }

  function fail(err) {
    var box = document.getElementById("pageLoad");
    if (!box) return;
    box.className = "loading-screen";
    box.innerHTML =
      '<span class="logo-mark">R</span><div class="load-error"><p><strong>The page could not load its content.</strong></p><p>Check your connection and refresh. Or chat us on WhatsApp: 0706 504 6266.</p></div>';
    console.error(err);
  }

  loadAll()
    .then(function (data) {
      var s = data.settings || {};
      applySettings(s);
      renderHero(data.hero || {}, s);
      renderJoin(data.join || {}, s);
      renderAcademy(data.academy || {}, data.salary || {});
      renderReferral(data.referral || {}, s);
      renderVideos(data.videos);
      renderEvents(data.events);
      renderGallery(data.gallery);
      renderStories(data.stories || {}, s);
      renderAbout(data.about || {}, s);
      renderContact(data.contact || {}, s);
      renderFooter(s);
      var load = document.getElementById("pageLoad");
      if (load) load.remove();
      ready(s);
      if (location.hash) {
        var target = document.querySelector(location.hash);
        if (target) target.scrollIntoView();
      }
    })
    .catch(fail);
})();
