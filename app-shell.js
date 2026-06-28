// app-shell.js — shared account chrome.
//   • Always injects a right-side account drawer (used on every page).
//   • AppShell.appHeader()      → injects the app header (logo + account button); app pages only.
//   • AppShell.attachButton(el) → drops an account button into a container (e.g. the marketing nav).
//   • AppShell.setUser({email, role, onLogout}) → populates the drawer + reveals account buttons.
(function () {
  var iconChev = "<svg viewBox='0 0 24 24' width='16' height='16' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='m6 9 6 6 6-6'/></svg>";
  var iconX = "<svg viewBox='0 0 24 24' width='20' height='20' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M18 6 6 18M6 6l12 12'/></svg>";
  var iconChevR = "<svg viewBox='0 0 24 24' width='18' height='18' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='m9 18 6-6-6-6'/></svg>";
  var iconInbox = "<svg viewBox='0 0 24 24' width='18' height='18' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'><path d='M3 13h4l2 3h6l2-3h4'/><path d='M5 13V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7'/></svg>";
  var iconJobs = "<svg viewBox='0 0 24 24' width='18' height='18' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'><circle cx='11' cy='11' r='7'/><path d='m21 21-4.3-4.3'/></svg>";
  var iconLogout = "<svg viewBox='0 0 24 24' width='18' height='18' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'><path d='M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4'/><path d='m16 17 5-5-5-5'/><path d='M21 12H9'/></svg>";

  // ---- drawer (present on every page that loads this script) ----
  var drawer = document.createElement("div");
  drawer.className = "lf-drawer-overlay";
  drawer.id = "lfDrawer";
  drawer.hidden = true;
  drawer.innerHTML =
    "<aside class='lf-drawer' role='dialog' aria-modal='true' aria-label='Account menu'>"
    + "<div class='lf-drawer-top'>"
    +   "<div class='lf-drawer-id'><span class='lf-avatar lf-avatar--lg' id='lfDrawerAvatar'></span>"
    +     "<div class='lf-drawer-idtext'><div class='lf-drawer-email' id='lfDrawerEmail'></div><span class='lf-drawer-badge' id='lfAdminBadge' hidden>Admin</span></div>"
    +   "</div>"
    +   "<button class='lf-drawer-x' id='lfDrawerX' aria-label='Close menu'>" + iconX + "</button>"
    + "</div>"
    + "<nav class='lf-drawer-nav' id='lfDrawerNav'></nav>"
    + "<div class='lf-drawer-foot'><button class='lf-drawer-logout' id='lfLogout'><span class='lf-di-icon'>" + iconLogout + "</span><span>Log out</span></button></div>"
    + "</aside>";
  document.body.appendChild(drawer);

  var $ = function (id) { return document.getElementById(id); };
  var accountBtns = [];

  function open() { drawer.hidden = false; requestAnimationFrame(function () { drawer.classList.add("open"); }); accountBtns.forEach(function (b) { b.setAttribute("aria-expanded", "true"); }); }
  function close() {
    drawer.classList.remove("open");
    accountBtns.forEach(function (b) { b.setAttribute("aria-expanded", "false"); });
    var done = function () { drawer.hidden = true; drawer.removeEventListener("transitionend", done); };
    drawer.addEventListener("transitionend", done);
    setTimeout(done, 340);
  }
  $("lfDrawerX").addEventListener("click", close);
  drawer.addEventListener("click", function (e) { if (e.target === drawer) close(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !drawer.hidden) close(); });

  function makeButton() {
    var b = document.createElement("button");
    b.className = "lf-acct";
    b.type = "button";
    b.hidden = true;
    b.setAttribute("aria-haspopup", "dialog");
    b.setAttribute("aria-expanded", "false");
    b.setAttribute("aria-label", "Account menu");
    b.innerHTML = "<span class='lf-avatar'></span><span class='lf-acct-chev'>" + iconChev + "</span>";
    b.addEventListener("click", open);
    accountBtns.push(b);
    return b;
  }

  function initial(email) { return ((email || "?").trim().charAt(0) || "?").toUpperCase(); }
  function here() { return location.pathname.split("/").pop() || "index.html"; }

  window.AppShell = {
    appHeader: function () {
      if (document.querySelector(".lf-appbar")) return;
      var header = document.createElement("header");
      header.className = "lf-appbar";
      var inner = document.createElement("div");
      inner.className = "lf-appbar-inner";
      inner.innerHTML =
        "<a class='brand' href='index.html' aria-label='Local Fix home'><img class='brand-logo' src='logos/Localfix-HorzontalLogoNewBLACK.png' alt='Local Fix'></a>"
        + "<span class='lf-tag' id='lfAdminTag' hidden>Admin</span>"
        + "<span class='lf-appbar-spacer'></span>";
      inner.appendChild(makeButton());
      header.appendChild(inner);
      document.body.insertAdjacentElement("afterbegin", header);
    },
    attachButton: function (container) { var b = makeButton(); container.appendChild(b); return b; },
    setUser: function (opts) {
      opts = opts || {};
      var email = opts.email || "";
      var role = opts.role || "contractor";
      var ini = initial(email);
      accountBtns.forEach(function (b) { var av = b.querySelector(".lf-avatar"); if (av) av.textContent = ini; b.hidden = false; });
      $("lfDrawerAvatar").textContent = ini;
      var emailEl = $("lfDrawerEmail"); emailEl.textContent = email; emailEl.title = email;
      $("lfAdminBadge").hidden = role !== "admin";
      var tag = $("lfAdminTag"); if (tag) tag.hidden = role !== "admin";

      var links = role === "admin"
        ? [{ label: "Admin view (all jobs)", href: "admin.html", icon: iconInbox }, { label: "Worker view (browse jobs)", href: "contractors.html", icon: iconJobs }]
        : [{ label: "Browse jobs", href: "contractors.html", icon: iconJobs }];
      var nav = $("lfDrawerNav");
      nav.innerHTML = "";
      links.forEach(function (l) {
        var a = document.createElement("a");
        a.className = "lf-drawer-item" + (here() === l.href ? " is-active" : "");
        a.href = l.href;
        a.innerHTML = "<span class='lf-di-icon'>" + l.icon + "</span><span class='lf-di-label'></span><span class='lf-di-chev'>" + iconChevR + "</span>";
        a.querySelector(".lf-di-label").textContent = l.label;
        nav.appendChild(a);
      });

      $("lfLogout").onclick = function () { if (typeof opts.onLogout === "function") opts.onLogout(); };
    },
    openDrawer: open,
    closeDrawer: close,
  };
})();
