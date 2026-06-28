// Auth-aware site navigation.
// Fills the <span id="navAuth"> in the header based on Supabase login state:
//   logged out        -> "Log in"
//   logged in (worker) -> "Browse Jobs"  + "Log out"
//   logged in (admin)  -> "Admin"        + "Log out"
//
// This is cosmetic only. The admin/contractor pages still check the role against
// the database (RLS), so hiding/showing links here never grants access.
(function () {
  var host = document.getElementById("navAuth");
  if (!host) return;
  if (
    !window.supabase || !window.SUPABASE_URL || !window.SUPABASE_ANON_KEY ||
    /YOUR-/.test(window.SUPABASE_URL + window.SUPABASE_ANON_KEY)
  ) {
    return;
  }

  var sb = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

  function link(text, href, cls) {
    var a = document.createElement("a");
    a.textContent = text;
    a.href = href;
    if (cls) a.className = cls;
    return a;
  }

  function logoutButton() {
    var b = document.createElement("button");
    b.type = "button";
    b.textContent = "Log out";
    b.className = "nav-link";
    b.addEventListener("click", async function () {
      await sb.auth.signOut();
      window.location.reload();
    });
    return b;
  }

  function render(nodes) {
    host.textContent = "";
    nodes.forEach(function (n) { host.appendChild(n); });
  }

  function showLoggedOut() {
    render([
      link("Log in", "login.html", "nav-link"),
      link("Sign up", "signup.html", "nav-btn")
    ]);
  }

  async function showLoggedIn(session) {
    var role = "contractor";
    try {
      var prof = await sb.from("profiles").select("role").eq("id", session.user.id).maybeSingle();
      if (prof.data && prof.data.role) role = prof.data.role;
    } catch (e) {}
    if (window.AppShell) {
      // Logged-in users get the account button + slide-in drawer, same as the app.
      if (!host.querySelector(".lf-acct")) { host.textContent = ""; AppShell.attachButton(host); }
      AppShell.setUser({
        email: session.user.email,
        role: role,
        onLogout: async function () { await sb.auth.signOut(); window.location.reload(); },
      });
    } else {
      var nodes = [];
      if (role === "admin") nodes.push(link("Admin", "admin.html", "nav-btn nav-admin"));
      else nodes.push(link("Browse Jobs", "contractors.html", "nav-btn"));
      nodes.push(logoutButton());
      render(nodes);
    }
  }

  function apply(session) {
    if (session) { showLoggedIn(session); } else { showLoggedOut(); }
  }

  sb.auth.getSession().then(function (r) { apply(r.data.session); });
  sb.auth.onAuthStateChange(function (_event, session) { apply(session); });
})();
