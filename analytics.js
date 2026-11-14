/* ==========================================================
   Result Analysis — visual layer (charts, table polish, print)
   UI only: it never changes marks, grades or totals.
   All charts are lightweight inline SVG / CSS (no chart library),
   so they stay smooth on phones and print crisply to PDF.
   ========================================================== */
(function () {
  "use strict";

  var SUBJ = {
    Bengali:     { c: "#34d399", s: "Ben",  i: "i-book" },
    English:     { c: "#4cc9f0", s: "Eng",  i: "i-lang" },
    Physics:     { c: "#8b8cf8", s: "Phy",  i: "i-atom" },
    Mathematics: { c: "#f7b955", s: "Math", i: "i-sigma" },
    Chemistry:   { c: "#f472b6", s: "Chem", i: "i-flask" },
    Biology:     { c: "#fb923c", s: "Bio",  i: "i-leaf" }
  };
  var ORDER = ["Bengali", "English", "Physics", "Mathematics", "Chemistry", "Biology"];
  var GRADE_COLOR = { "A+": "#34d399", "A": "#4cc9f0", "B+": "#8b8cf8", "B": "#f7b955", "C": "#fb923c", "D": "#fb7185" };
  var GRADE_CLASS = { "A+": "g-ap", "A": "g-a", "B+": "g-bp", "B": "g-b", "C": "g-c", "D": "g-d" };

  function $(id) { return document.getElementById(id); }
  function ico(id) { return '<svg class="ico" aria-hidden="true"><use href="#' + id + '"/></svg>'; }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function clamp(v) { return Math.max(0, Math.min(100, v)); }
  function f1(n) { return (Math.round(n * 10) / 10).toFixed(1); }
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- table polish ---------- */
  function decorateTable(d) {
    ["ben", "eng", "sub1", "sub2", "sub3", "opt"].forEach(function (p) {
      var nameCell = $("res-" + p + "-name");
      var marks = Number($("res-" + p + "-marks").textContent) || 0;
      var nm = nameCell.textContent;
      var s = SUBJ[nm] || { c: "#94a3b8", i: "i-book" };
      var g = d.grade(marks).grade;

      nameCell.innerHTML = '<span class="sn" style="--c:' + s.c + '">' + ico(s.i) + "<span>" + esc(nm) + "</span></span>";
      $("res-" + p + "-grade").innerHTML = '<span class="pill ' + GRADE_CLASS[g] + '">' + esc(g) + "</span>";
      $("res-" + p + "-remarks").className = "rm" + (g === "D" ? " bad" : "");
      $("row-" + p).style.setProperty("--p", clamp(marks) + "%");
    });
    var optCat = $("row-opt").firstElementChild;
    optCat.innerHTML = 'Subject 4 <span class="tag">Not counted</span>';
    $("row-opt").classList.add("dropped");
  }

  /* ---------- hero ---------- */
  function decorateHero(d) {
    var words = String(d.studentName || "").trim().split(/\s+/).filter(Boolean);
    var initials = words.slice(0, 2).map(function (w) { return Array.from(w)[0]; }).join("").toUpperCase();
    $("avatar").textContent = initials || "R";
    $("resDate").textContent = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    $("ringBox").style.setProperty("--v", clamp(d.pct));
    $("tileGrade").style.setProperty("--c", GRADE_COLOR[d.grade(d.pct).grade]);
  }

  /* ---------- Best-5 horizontal bars ---------- */
  function bars(d) {
    var h = "";
    d.top5.forEach(function (t, i) {
      var s = SUBJ[t.name] || { c: "#94a3b8", i: "i-book" };
      h += '<div class="hb" style="--v:' + clamp(t.marks) + ";--c:" + s.c + ";--i:" + i + '">' +
        '<div class="hb-top"><span class="hb-n">' + ico(s.i) + esc(t.name) + '</span><span class="hb-m">' + t.marks + "</span></div>" +
        '<div class="hb-track"><i class="hb-fill"></i></div></div>';
    });
    $("subjectBars").innerHTML = h;
  }

  /* ---------- Column chart (all six subjects) ---------- */
  function columns(d) {
    var counted = {};
    d.top5.forEach(function (t) { counted[t.name] = 1; });
    var x0 = 36, x1 = 408, yb = 206, ph = 190, slot = (x1 - x0) / 6, bw = 34;
    var s = '<svg viewBox="0 0 420 250" role="img" aria-label="Marks in all six subjects">';

    [0, 25, 50, 75, 100].forEach(function (v) {
      var y = yb - v * ph / 100;
      s += '<line class="gl' + (v === 25 ? " pass" : "") + '" x1="' + x0 + '" x2="' + x1 + '" y1="' + y + '" y2="' + y + '"/>' +
           '<text class="ax" x="' + (x0 - 8) + '" y="' + (y + 3.5) + '" text-anchor="end">' + v + "</text>";
    });

    ORDER.forEach(function (n, i) {
      var m = Number(d.marks[n]) || 0, hgt = clamp(m) * ph / 100;
      var x = x0 + i * slot + (slot - bw) / 2, cx = x + bw / 2, on = !!counted[n];
      s += '<rect class="col' + (on ? "" : " off") + '" style="--c:' + SUBJ[n].c + ";--i:" + i + '" x="' + x + '" y="' + (yb - hgt) + '" width="' + bw + '" height="' + hgt + '" rx="6"/>' +
           '<text class="val" x="' + cx + '" y="' + (yb - hgt - 7) + '" text-anchor="middle">' + m + "</text>" +
           '<text class="ax2" x="' + cx + '" y="' + (yb + 20) + '" text-anchor="middle">' + SUBJ[n].s + "</text>";
      if (!on) s += '<text class="nc" x="' + cx + '" y="' + (yb + 33) + '" text-anchor="middle">not counted</text>';
    });
    $("colChart").innerHTML = s + '</svg><p class="note"><i class="dash"></i>Pass line (25 marks)</p>';
  }

  /* ---------- Radar ---------- */
  function radar(d) {
    var cx = 180, cy = 160, R = 105, n = ORDER.length;
    function pt(i, v, rr) {
      var a = -Math.PI / 2 + i * 2 * Math.PI / n, r = (rr || R) * v / 100;
      return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
    }
    function poly(v) { return ORDER.map(function (_, i) { return pt(i, v).map(f1).join(","); }).join(" "); }

    var s = '<svg viewBox="0 0 360 320" role="img" aria-label="Radar chart of all six subjects">';
    [25, 50, 75, 100].forEach(function (v) { s += '<polygon class="rg" points="' + poly(v) + '"/>'; });
    ORDER.forEach(function (_, i) {
      var p = pt(i, 100);
      s += '<line class="sp" x1="' + cx + '" y1="' + cy + '" x2="' + f1(p[0]) + '" y2="' + f1(p[1]) + '"/>';
    });

    var pts = ORDER.map(function (nm, i) { return pt(i, clamp(Number(d.marks[nm]) || 0)).map(f1).join(","); }).join(" ");
    s += '<g class="rdata"><polygon class="rpoly" points="' + pts + '"/>';
    ORDER.forEach(function (nm, i) {
      var p = pt(i, clamp(Number(d.marks[nm]) || 0));
      s += '<circle class="rdot" style="--c:' + SUBJ[nm].c + '" cx="' + f1(p[0]) + '" cy="' + f1(p[1]) + '" r="4.5"/>';
    });
    s += "</g>";

    ORDER.forEach(function (nm, i) {
      var a = -Math.PI / 2 + i * 2 * Math.PI / n, cs = Math.cos(a);
      var p = pt(i, 100, R + 22), anchor = cs > 0.3 ? "start" : (cs < -0.3 ? "end" : "middle");
      s += '<text class="rl" x="' + f1(p[0]) + '" y="' + f1(p[1] + 4) + '" text-anchor="' + anchor + '">' + SUBJ[nm].s +
           '<tspan class="rv" x="' + f1(p[0]) + '" dy="15">' + d.marks[nm] + "</tspan></text>";
    });
    $("radarChart").innerHTML = s + "</svg>";
  }

  /* ---------- Share-of-total donut ---------- */
  function share(d) {
    var tot = d.total, off = 0, segs = "", legend = "";
    d.top5.forEach(function (t, i) {
      var sh = tot > 0 ? t.marks / tot * 100 : 0;
      var gap = sh > 1.5 ? 0.8 : 0;
      var col = (SUBJ[t.name] || { c: "#94a3b8" }).c;
      segs += '<circle class="seg" cx="60" cy="60" r="40" pathLength="100" transform="rotate(-90 60 60)" style="--s:' + f1(sh - gap) + ";--o:" + f1(off + gap / 2) + ";--i:" + i + ";stroke:" + col + '"/>';
      legend += '<li style="--c:' + col + '"><i></i><span>' + esc(t.name) + "</span><b>" + f1(sh) + "%</b></li>";
      off += sh;
    });
    $("shareChart").innerHTML =
      '<div class="share"><svg viewBox="0 0 120 120" role="img" aria-label="Share of each Best-5 subject in the total">' +
      '<circle class="dtrack" cx="60" cy="60" r="40"/>' + segs +
      '<text class="dn" x="60" y="62" text-anchor="middle">' + tot + '</text><text class="ds" x="60" y="76" text-anchor="middle">of 500</text></svg>' +
      '<ul class="legend">' + legend + "</ul></div>";
  }

  /* ---------- Grade ladder ---------- */
  function ladder(d) {
    var bands = [[0, 25, "D"], [25, 45, "C"], [45, 60, "B"], [60, 80, "B+"], [80, 90, "A"], [90, 100, "A+"]];
    var pct = clamp(d.pct), g = d.grade(d.pct);
    var track = bands.map(function (b) {
      return '<div class="lb" style="flex:' + (b[1] - b[0]) + ";--c:" + GRADE_COLOR[b[2]] + '"><span>' + b[2] + "</span></div>";
    }).join("");
    var scale = [0, 25, 45, 60, 80, 90, 100].map(function (v) {
      var tr = v === 0 ? "0" : (v === 100 ? "-100%" : "-50%");
      return '<span style="left:' + v + "%;transform:translateX(" + tr + ')">' + v + "</span>";
    }).join("");

    var next = [[25, "C"], [45, "B"], [60, "B+"], [80, "A"], [90, "A+"]].filter(function (t) { return d.pct < t[0]; })[0];
    var cap = '<p class="cap"><b>Grade ' + esc(g.grade) + "</b> · " + esc(g.remark) + ". ";
    cap += next
      ? "You need " + Math.ceil(next[0] * 5 - d.total) + " more marks in total to reach Grade " + next[1] + "."
      : "You are in the top grade band.";
    cap += "</p>";

    $("ladder").innerHTML =
      '<div class="lad"><div class="lad-wrap"><div class="lad-track">' + track + "</div>" +
      '<div class="lm" style="--v:' + pct + '"><b>' + f1(d.pct) + '%</b><i></i></div>' +
      '<div class="lad-scale">' + scale + "</div></div></div>" + cap;
  }

  /* ---------- Insights ---------- */
  function insights(d) {
    var all = ORDER.map(function (n) { return { name: n, marks: Number(d.marks[n]) || 0 }; });
    var strongest = all.reduce(function (a, b) { return b.marks > a.marks ? b : a; });
    var low5 = d.top5.reduce(function (a, b) { return b.marks < a.marks ? b : a; });
    var avg6 = all.reduce(function (s, x) { return s + x.marks; }, 0) / all.length;
    var vals = d.top5.map(function (t) { return t.marks; });
    var spread = Math.max.apply(null, vals) - Math.min.apply(null, vals);
    var spreadNote = spread <= 10 ? "Very consistent" : (spread <= 25 ? "Fairly balanced" : "Uneven across subjects");
    var next = [[25, "C"], [45, "B"], [60, "B+"], [80, "A"], [90, "A+"]].filter(function (t) { return d.pct < t[0]; })[0];

    var items = [
      ["i-trophy",   "var(--c3)", "Strongest subject",   esc(strongest.name),                 strongest.marks + " / 100"],
      ["i-down",     "var(--c4)", "Lowest in Best-5",    esc(low5.name),                      low5.marks + " / 100"],
      ["i-chart",    "var(--c1)", "Average of all six",  f1(avg6) + "%",                      "Best-5 average " + f1(d.total / 5) + "%"],
      ["i-activity", "var(--c2)", "Score spread",        spread + " marks",                   spreadNote],
      ["i-layers",   "var(--c6)", "Left out of Best-5",  esc(d.dropped.name),                 d.dropped.marks + " / 100"],
      ["i-up",       "var(--c5)", "Next grade",          next ? "+" + Math.ceil(next[0] * 5 - d.total) + " marks" : "Top band", next ? "to reach Grade " + next[1] : "Grade A+ reached"]
    ];
    $("insights").innerHTML = '<div class="ins">' + items.map(function (it) {
      return '<div class="in-t" style="--c:' + it[1] + '"><span class="ti">' + ico(it[0]) + '</span><span class="tl">' + it[2] + '</span><b class="tv">' + it[3] + '</b><span class="tn">' + it[4] + "</span></div>";
    }).join("") + "</div>";
  }

  /* ---------- motion ---------- */
  function countUp(el, to, ms) {
    if (reduce) { el.textContent = to.toFixed(1) + "%"; return; }
    var t0 = null;
    function step(t) {
      if (t0 === null) t0 = t;
      var p = Math.min((t - t0) / ms, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = (to * e).toFixed(1) + "%";
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function setupMotion(d) {
    var hero = $("hero"), ringPct = $("ringPct");
    var final = d.pct.toFixed(1) + "%";
    ringPct.textContent = reduce ? final : "0.0%";

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        hero.classList.add("in");
        countUp(ringPct, d.pct, 1300);
      });
    });

    var blocks = Array.prototype.slice.call(document.querySelectorAll(".anim")).filter(function (el) { return el !== hero; });
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
      blocks.forEach(function (el) { io.observe(el); });
    } else {
      blocks.forEach(function (el) { el.classList.add("in"); });
    }

    /* PDF / print: show every chart in its final state and name the file */
    var oldTitle = document.title;
    function beforePrint() {
      document.querySelectorAll(".anim").forEach(function (el) { el.classList.add("in"); });
      ringPct.textContent = final;
      var nm = String(d.studentName || "").trim();
      document.title = nm ? "Result - " + nm : "Result Analysis";
    }
    function afterPrint() { document.title = oldTitle; }
    window.addEventListener("beforeprint", beforePrint);
    window.addEventListener("afterprint", afterPrint);
    if (window.matchMedia) {
      var mq = window.matchMedia("print");
      var h = function (e) { if (e.matches) beforePrint(); else afterPrint(); };
      if (mq.addEventListener) mq.addEventListener("change", h); else if (mq.addListener) mq.addListener(h);
    }
  }

  /* ---------- public ---------- */
  window.ResultUI = {
    render: function (d) {
      decorateTable(d);
      decorateHero(d);
      bars(d);
      columns(d);
      radar(d);
      share(d);
      ladder(d);
      insights(d);
      setupMotion(d);
    }
  };
})();
