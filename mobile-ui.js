/*
 * DJ FAMILY KOST — SHARED MOBILE APP SHELL
 * Injects navigation only; existing page logic remains untouched.
 */
(function(){

  const path = (window.location.pathname || "").toLowerCase();
  const file = path.split("/").pop() || "index.html";

  const publicPages = {
    "aturan.html":true,
    "kunjungan.html":true,
    "hubungi.html":true,
    "aktivasi.html":true
  };

  const tenantPages = {
    "portal.html":true,
    "pembayaran.html":true,
    "maintenance.html":true,
    "checkinout.html":true,
    "cafe.html":true,
    "laundry.html":true,
    "ganti-password.html":true
  };

  if(!publicPages[file] && !tenantPages[file]) return;

  const body = document.body;
  if(!body) return;

  const isTenant = !!tenantPages[file];

  body.classList.add("mobile-ui-page");
  body.classList.add(isTenant ? "mobile-ui-tenant" : "mobile-ui-public");

  if(file==="kunjungan.html") body.classList.add("mobile-ui-visit");
  if(file==="hubungi.html") body.classList.add("mobile-ui-contact");
  if(file==="pembayaran.html") body.classList.add("mobile-ui-payment");
  if(file==="maintenance.html") body.classList.add("mobile-ui-maintenance");
  if(file==="checkinout.html") body.classList.add("mobile-ui-checkin");
  if(file==="cafe.html") body.classList.add("mobile-ui-cafe");
  if(file==="ganti-password.html") body.classList.add("mobile-ui-password");

  let header = document.querySelector("header.nav");
  let navLinks = header ? header.querySelector(".nav-links") : null;

  if(!header && file==="ganti-password.html"){
    header = document.createElement("header");
    header.className = "nav mobile-generated-header";
    header.innerHTML =
      '<div class="container nav-inner">' +
        '<a class="brand" href="portal.html">' +
          '<span class="brand-mark"></span>' +
          'DJ FAMILY KOST · TENANT' +
        '</a>' +
      '</div>';
    body.insertBefore(header,body.firstChild);
    navLinks = null;
  }

  let toggle = document.querySelector(".mobile-ui-toggle");

  if(header && !toggle){
    const navInner = header.querySelector(".nav-inner");

    if(navInner){
      toggle = document.createElement("button");
      toggle.className = "mobile-ui-toggle";
      toggle.type = "button";
      toggle.setAttribute("aria-label","Buka menu");
      toggle.setAttribute("aria-expanded","false");
      toggle.innerHTML = "<span></span><span></span><span></span>";
      navInner.appendChild(toggle);
    }
  }

  let backdrop = document.querySelector(".mobile-ui-backdrop");

  if(!backdrop){
    backdrop = document.createElement("div");
    backdrop.className = "mobile-ui-backdrop";
    backdrop.setAttribute("aria-hidden","true");
    body.appendChild(backdrop);
  }

  let drawer = document.querySelector(".mobile-ui-drawer");

  if(!drawer){
    drawer = document.createElement("aside");
    drawer.className = "mobile-ui-drawer";
    drawer.setAttribute("aria-hidden","true");
    drawer.innerHTML =
      '<div class="mobile-ui-drawer-head">' +
        '<div class="mobile-ui-drawer-brand">' +
          '<span class="brand-mark"></span>' +
          '<strong>' + (isTenant ? "DJ FAMILY KOST · TENANT" : "DJ FAMILY KOST") + '</strong>' +
        '</div>' +
        '<button class="mobile-ui-drawer-close" type="button" aria-label="Tutup menu">×</button>' +
      '</div>' +
      '<nav class="mobile-ui-drawer-links" aria-label="Menu mobile"></nav>';
    body.appendChild(drawer);
  }

  const drawerLinks = drawer.querySelector(".mobile-ui-drawer-links");

  if(drawerLinks && !drawerLinks.children.length){

    let sourceLinks = navLinks
      ? Array.from(navLinks.querySelectorAll("a"))
      : [];

    if(!sourceLinks.length && isTenant){
      sourceLinks = [
        {href:"portal.html",textContent:"Dashboard"},
        {href:"pembayaran.html",textContent:"Pembayaran"},
        {href:"maintenance.html",textContent:"Maintenance"},
        {href:"checkinout.html",textContent:"Check-in/out"},
        {href:"cafe.html",textContent:"Cafe"},
        {href:"laundry.html",textContent:"Laundry"},
        {href:"ganti-password.html",textContent:"Ganti Password"}
      ];
    }

    sourceLinks.forEach(function(source){

      const href = typeof source.getAttribute==="function"
        ? (source.getAttribute("href") || "")
        : (source.href || "");

      const label = String(source.textContent || "")
        .replace(/\s+/g," ")
        .trim();

      if(!href || !label) return;

      const a = document.createElement("a");
      a.href = href;

      const icon = document.createElement("span");
      icon.textContent = isTenant ? "→" : "•";

      a.appendChild(icon);
      a.appendChild(
        document.createTextNode(label)
      );

      const low = label.toLowerCase();

      if(
        href.indexOf(file) >= 0 ||
        (file==="portal.html" && low==="dashboard") ||
        (file==="ganti-password.html" && low.indexOf("password")>=0)
      ){
        a.classList.add("is-active");
      }

      if(
        low.indexOf("login")>=0 ||
        low.indexOf("masuk")>=0
      ){
        a.classList.add("is-login");
      }

      if(
        low.indexOf("keluar")>=0 &&
        navLinks
      ){
        a.addEventListener("click",function(event){
          event.preventDefault();

          const original =
            Array.from(navLinks.querySelectorAll("a"))
            .find(function(item){
              return String(item.textContent || "")
                .toLowerCase()
                .indexOf("keluar")>=0;
            });

          if(original) original.click();
          setDrawer(false);
        });
      }else{
        a.addEventListener("click",function(){
          setDrawer(false);
        });
      }

      drawerLinks.appendChild(a);
    });
  }

  let bottom = document.querySelector(".mobile-ui-bottom");

  if(!bottom){
    bottom = document.createElement("nav");
    bottom.className = "mobile-ui-bottom";
    bottom.setAttribute("aria-label","Navigasi utama mobile");

    if(isTenant){
      bottom.innerHTML =
        '<a href="portal.html"><span>⌂</span><span>Portal</span></a>' +
        '<a href="pembayaran.html"><span>Rp</span><span>Bayar</span></a>' +
        '<a href="maintenance.html"><span>M</span><span>Layanan</span></a>' +
        '<a href="ganti-password.html"><span>○</span><span>Akun</span></a>';
    }else{
      bottom.innerHTML =
        '<a href="index.html"><span>⌂</span><span>Beranda</span></a>' +
        '<a href="index.html#kamar"><span>▣</span><span>Kamar</span></a>' +
        '<a href="pendaftaran.html"><span>＋</span><span>Daftar</span></a>' +
        '<a href="login.html"><span>◯</span><span>Akun</span></a>';
    }

    body.appendChild(bottom);
  }

  Array.from(bottom.querySelectorAll("a")).forEach(function(a){

    const href = a.getAttribute("href") || "";
    const label = String(a.textContent || "")
      .replace(/\s+/g," ")
      .trim()
      .toLowerCase();

    let active = false;

    if(
      !isTenant &&
      file === "aktivasi.html" &&
      label === "daftar"
    ){
      active = true;
    }

    if(
      isTenant &&
      file === "portal.html" &&
      label === "portal"
    ){
      active = true;
    }

    if(
      isTenant &&
      file === "pembayaran.html" &&
      label === "bayar"
    ){
      active = true;
    }

    if(
      isTenant &&
      [
        "maintenance.html",
        "checkinout.html",
        "cafe.html",
        "laundry.html"
      ].includes(file) &&
      label === "layanan"
    ){
      active = true;
    }

    if(
      isTenant &&
      file === "ganti-password.html" &&
      label === "akun"
    ){
      active = true;
    }

    if(active){
      a.classList.add("is-active");
    }
  });

  function setDrawer(open){

    drawer.classList.toggle("is-open",open);
    backdrop.classList.toggle("is-open",open);

    drawer.setAttribute(
      "aria-hidden",
      open ? "false" : "true"
    );

    backdrop.setAttribute(
      "aria-hidden",
      open ? "false" : "true"
    );

    if(toggle){
      toggle.setAttribute(
        "aria-expanded",
        open ? "true" : "false"
      );
    }

    body.classList.toggle(
      "mobile-ui-menu-open",
      open
    );
  }

  if(toggle){
    toggle.addEventListener("click",function(){
      setDrawer(
        !drawer.classList.contains("is-open")
      );
    });
  }

  const close = drawer.querySelector(
    ".mobile-ui-drawer-close"
  );

  if(close){
    close.addEventListener("click",function(){
      setDrawer(false);
    });
  }

  backdrop.addEventListener("click",function(){
    setDrawer(false);
  });

  document.addEventListener("keydown",function(event){
    if(event.key==="Escape"){
      setDrawer(false);
    }
  });

})();
