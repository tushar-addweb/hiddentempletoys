// Add "product-detail-page" class on every product detail page (/product/...)
(function () {
  function tag() {
    var on = /^\/product\//.test(location.pathname);
    [document.documentElement, document.body].forEach(function (e) {
      if (e) e.classList.toggle('product-detail-page', on);
    });
  }
  tag();
  setInterval(tag, 300);
})();


/* ---------------------------------------------------------------
 * "Browse by category" accordion (filter sidebar)
 * Square renders this heading as a plain <p>, not a native accordion,
 * so we add the toggle ourselves. State lives on <html> so it survives
 * Square's re-renders. Works inside the mobile "Filters" panel too.
 * ------------------------------------------------------------- */
(function () {
  var root = document.documentElement;
  var CLOSED = 'htt-cat-closed';
  var HEAD = '.category__sidebar .sidebar-heading';

  function sync() {
    var open = !root.classList.contains(CLOSED);
    document.querySelectorAll(HEAD).forEach(function (h) {
      if (!h.hasAttribute('role')) {
        h.setAttribute('role', 'button');
        h.setAttribute('tabindex', '0');
      }
      var v = open ? 'true' : 'false';
      if (h.getAttribute('aria-expanded') !== v) h.setAttribute('aria-expanded', v);
    });
  }

  function toggle() {
    root.classList.toggle(CLOSED);
    sync();
  }

  document.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest(HEAD)) {
      e.preventDefault();
      toggle();
    }
  });

  document.addEventListener('keydown', function (e) {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.closest && e.target.closest(HEAD)) {
      e.preventDefault();
      toggle();
    }
  });

  new MutationObserver(sync).observe(document.documentElement, { childList: true, subtree: true });
  sync();
})();


/* JavaScript extracted from the two supplied snippets.
   Product page guard, shop page guard, and all dynamic behaviors are retained. */

(() => {
  // Product page: only run when the URL contains "product".
  if (!/product/.test(location)) return;

  const doc = document;
  const qs = (sel) => doc.querySelector(sel);
  const qsa = (sel) => doc.querySelectorAll(sel);

  const applyEnhancements = () => {
    if (qs("header p")) {
      qs("header p").textContent = "How do you want it?";
    }

    qsa(".card").forEach((card) => {
      card.classList.add("c");
      card.classList.toggle("on", /PayF3/.test(card.className));

      if (!card.querySelector(".dt") && /ship|pick/i.test(card.textContent)) {
        card.insertAdjacentHTML(
          "beforeend",
          `<div class=dt>${
            /pick/i.test(card.textContent)
              ? "Hidden Temple Toys<br>104 N Raiford St,Selma,NC<b>Free"
              : "Delivered to your door<br>Rates calculated at checkout<b>Carefully packed"
          }</b></div>`
        );
      }
    });

    if (!qs(".qb")) {
      qs(".add-to-cart__wrapper")?.insertAdjacentHTML(
        "afterend",
        `<div class=qb><i>💬</i><div><b>Questions?</b>Reach out anytime at <a href="mailto:info@hiddentempletoys.com">info@hiddentempletoys.com</a> - we're here to help!</div></div>`
      );
    }

    const descSection = qs(".product-description");
    if (descSection && !descSection._z) {
      const accordionBtns = descSection.querySelectorAll("button");
      if (accordionBtns[1]) {
        descSection._z = 1;
        descSection.classList.add("pd");
        qs(".product__wrapper")?.closest(".row")?.after(descSection);
        descSection.insertAdjacentHTML(
          "afterbegin",
          `<div class=p-tabs><a class='p-tab on'>Description</a><a class=p-tab>Shipping & returns</a></div>`
        );

        if (accordionBtns[0].getAttribute("aria-expanded") !== "true") {
          accordionBtns[0].click();
        }

        let activeTabIdx = 0;
        qsa(".p-tab").forEach((tab, idx, allTabs) => {
          tab.onclick = () => {
            if (activeTabIdx !== idx) {
              allTabs[activeTabIdx].className = "p-tab";
              tab.className = "p-tab on";
              accordionBtns[activeTabIdx].click();
              accordionBtns[(activeTabIdx = idx)].click();
            }
          };
        });
      }
    }
  };

  applyEnhancements();
  setInterval(applyEnhancements, 400);
})();


/* ===== Square Online – product image hover zoom =====
 * Works with Square's product gallery:
 *   .product-gallery .carousel__slide > .carousel__image > img
 * Uses event delegation, so it keeps working when Square re-renders
 * slides, switches variants or changes the active image.
 */
(function () {
  'use strict';
  if (window.__htZoomLoaded) return;
  window.__htZoomLoaded = true;

  var SCALE = 2.2;
  var BOX_SEL = '.product-gallery .carousel__image';
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function getBox(target) {
    return target && target.closest ? target.closest(BOX_SEL) : null;
  }

  function setOrigin(box, x, y) {
    var img = box.querySelector('img');
    if (!img) return;
    var r = box.getBoundingClientRect();
    var px = Math.max(0, Math.min(100, ((x - r.left) / r.width) * 100));
    var py = Math.max(0, Math.min(100, ((y - r.top) / r.height) * 100));
    img.style.transformOrigin = px + '% ' + py + '%';
  }

  function zoomIn(box, x, y) {
    box.style.setProperty('--ht-zoom-scale', SCALE);
    box.classList.add('ht-zoom', 'ht-zoom--active');
    setOrigin(box, x, y);
    var gallery = box.closest('.product-gallery');
    if (gallery) gallery.classList.add('ht-zooming');
  }

  function zoomOut(box) {
    box.classList.remove('ht-zoom--active');
    var img = box.querySelector('img');
    if (img) img.style.transformOrigin = '50% 50%';
    var gallery = box.closest('.product-gallery');
    if (gallery) gallery.classList.remove('ht-zooming');
  }

  // Mark boxes so CSS (cursor etc.) applies even before first hover
  function mark() {
    document.querySelectorAll(BOX_SEL).forEach(function (b) {
      b.classList.add('ht-zoom');
    });
  }

  if (canHover) {
    var current = null;

    document.addEventListener('mousemove', function (e) {
      var box = getBox(e.target);
      if (box !== current) {
        if (current) zoomOut(current);
        current = box;
        if (box) zoomIn(box, e.clientX, e.clientY);
        return;
      }
      if (box) setOrigin(box, e.clientX, e.clientY);
    }, { passive: true });

    document.addEventListener('mouseleave', function () {
      if (current) { zoomOut(current); current = null; }
    });

    // Reset when gallery arrows / thumbnails are clicked
    document.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('.product-gallery') && !getBox(e.target)) {
        document.querySelectorAll(BOX_SEL + '.ht-zoom--active').forEach(zoomOut);
        current = null;
      }
    });
  } else {
    // Touch: tap to zoom/unzoom, drag to pan
    document.addEventListener('click', function (e) {
      var box = getBox(e.target);
      document.querySelectorAll(BOX_SEL + '.ht-zoom--active').forEach(function (b) {
        if (b !== box) zoomOut(b);
      });
      if (!box) return;
      if (box.classList.contains('ht-zoom--active')) zoomOut(box);
      else zoomIn(box, e.clientX, e.clientY);
    });

    document.addEventListener('touchmove', function (e) {
      var box = getBox(e.target);
      if (!box || !box.classList.contains('ht-zoom--active')) return;
      e.preventDefault(); // stop carousel swipe while zoomed
      e.stopPropagation();
      var t = e.touches[0];
      setOrigin(box, t.clientX, t.clientY);
    }, { passive: false, capture: true });
  }

  // Square is a single-page app – keep marking new gallery images
  function start() {
    mark();
    new MutationObserver(mark).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();



(() => {
  // Shop page: preserve the original /s/shop condition.
  if (!/\/s\/shop/.test(location)) return;

  let d = document;
  let q = (s, e = d) => e.querySelector(s);
  let Q = s => d.querySelectorAll(s);
  let W = ".product-group,.fluid-carousel__slider,[class*=arrow],[class*=price],[class*=title],.featured-category__image,.carousel-item,background:,border-radius:,display:,#143d22,overflow:hidden,border:0,border:,width:,font-weight:700, sans-serif,padding:,height:,font:700 1".split(",");

  let run = () => Q(W[0]).forEach(p => {
    let a = q("a", p);
    a && !q(".ht-cart", p) && (q(W[3], p) || a).after(Object.assign(d.createElement("button"), {
      className: "ht-cart",
      innerHTML: `Add To Cart <svg width="15" height="15" viewBox="0 0 8 8" fill="none" stroke="#fff" stroke-width="1.2" stroke-linecap="round"><path d="M1 4h6M4 1l3 3-3 3"/></svg>`,
      onclick: () => a.click()
    }));
  });


(function () {
  var root = document.documentElement;
  var OPEN = 'htt-filters-open';
  root.classList.add('htt-filters-js');

  // Square re-renders the shop page, so re-add the button whenever it goes missing
  function addToggle() {
    var sb = document.querySelector('.category__sidebar');
    if (!sb || sb.querySelector('.htt-filters-toggle')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'htt-filters-toggle';
    btn.textContent = 'Filters';
    btn.setAttribute('aria-expanded', root.classList.contains(OPEN) ? 'true' : 'false');
    sb.insertBefore(btn, sb.firstChild);
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('.htt-filters-toggle');
    if (!btn) return;
    var open = root.classList.toggle(OPEN);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  new MutationObserver(addToggle).observe(document.documentElement, { childList: true, subtree: true });
  addToggle();
})();

  run();
  new MutationObserver(run).observe(d.body, { childList: 1, subtree: 1 });
})();

/* FILTERS – always-visible "Reset all" – one click clears everything */
(function(){
  function add(){
    var sb=document.querySelector('.category__sidebar.display-desktop');
    if(!sb||sb.querySelector('.ht-reset-all'))return;
    var a=document.createElement('a');
    a.className='ht-reset-all';a.href='/s/shop';a.textContent='Reset all';
    a.onclick=function(e){
      var onShopAll=/^\/s\/shop\/?$/.test(location.pathname);
      var b=document.querySelector('.category-page-content .clear__button');
      if(onShopAll&&b){e.preventDefault();b.click();}   /* Shop All + filters: Square's own reset */
      /* category page (or no Square button): link goes straight to Shop All with no filters */
    };
    sb.appendChild(a);
  }
  add();setInterval(add,500);
})();

/* NEW ARRIVALS JS – arrows disable at start/end */
(()=>{
  let d=document,I='<svg viewBox="0 0 8 8"><path d="M1 4h6M4 1l3 3-3 3"/></svg>',F='fluid-carousel',P='.product-group';
  let upd=(t,n)=>{
    let max=t.scrollWidth-t.clientWidth-2,[p,q]=n.children;
    p.disabled=t.scrollLeft<=2;
    q.disabled=t.scrollLeft>=max;
    n.classList.toggle('nn-off',max<=0);
  };
  setInterval(()=>{
    let s=d.querySelector(P)?.closest('section,[class*=w-block]'),c=s?.querySelector('.'+F),t=c?.querySelector('.'+F+'__slider');
    if(!t)return;
    s.classList.add('na');
    d.evaluate(".//*[contains(text(),'Landed')]",s,null,9,null).singleNodeValue?.classList.add('ey');
    let n=s.querySelector('.nn');
    if(!n){
      c.insertAdjacentHTML('beforebegin',`<div class=nn><button type=button aria-label="Previous">${I}</button><button type=button aria-label="Next">${I}</button></div>`);
      n=c.previousSibling;
      [...n.children].map((b,i)=>b.onclick=()=>{if(!b.disabled)t.scrollBy({left:(i?1:-1)*(t.children[0].offsetWidth+30),behavior:'smooth'})});
      let x,l,m;
      t.ondragstart=()=>!1;
      t.onmousedown=e=>{x=e.pageX;l=t.scrollLeft;m=0;t.classList.add('dr')};
      addEventListener('mousemove',e=>{if(x){m|=Math.abs(e.pageX-x)>5;t.scrollLeft=l-e.pageX+x}});
      addEventListener('mouseup',()=>{x=0;t.classList.remove('dr')});
      t.addEventListener('click',e=>m&&e.preventDefault(),!0);
      t.addEventListener('scroll',()=>upd(t,n),{passive:true});
      addEventListener('resize',()=>upd(t,n));
    }
    upd(t,n);
    for(let g of s.querySelectorAll(P)){
      let a=g.querySelector('.acb');
      if(!a){
        g.insertAdjacentHTML('beforeend',`<a class=acb href="${g.querySelector('a')?.href||'#'}"></a>`);
        a=g.querySelector('.acb')
      }
      a.textContent!=='Add To Cart'&&(a.textContent='Add To Cart')
    }
  },500)
})();




document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.qb i').forEach(function (i) {
    i.innerHTML = '<svg width="22" height="19" viewBox="0 0 22 19" fill="none" stroke="#FBFAF6" stroke-width="1.425" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M20.5462 8.18693C20.5382 9.79867 20.1129 11.3809 19.3118 12.7794C18.5107 14.178 17.3611 15.3453 15.9749 16.1676C14.5887 16.99 13.0132 17.4393 11.4017 17.4719C9.79029 17.5045 8.19788 17.1192 6.77956 16.3536L0.712891 18.1036L2.46289 12.7369C2.09914 11.5287 1.98414 10.2593 2.12484 9.00544C2.26554 7.75155 2.65902 6.5392 3.28151 5.44168C3.90399 4.34416 4.74255 3.38424 5.74649 2.61996C6.75044 1.85567 7.89894 1.30289 9.12256 0.995007C10.3462 0.687127 11.6195 0.630549 12.8656 0.828691C14.1117 1.02683 15.3047 1.47558 16.3725 2.14781C17.4403 2.82005 18.3607 3.70181 19.078 4.7398C19.7954 5.77779 20.2949 6.95046 20.5462 8.18693Z"/><path d="M5.96289 8.18652H5.97456M10.0462 8.18652H10.0579M14.1296 8.18652H14.1412"/></svg>';
  });
});


//header
(function () {
  var D = document;

  // Dropdown arrows after menu items that have a submenu
  function arrows() {
    D.querySelectorAll('.nav__subnav').forEach(function (s) {
      var a = s.previousElementSibling;
      if (a && !a.querySelector('.hv')) a.insertAdjacentHTML('beforeend', '<i class="hv"></i>');
    });
  }

  // Keep the cart dropdown below the (sticky) header
  function fixCart() {
    setTimeout(function () {
      var hd = D.querySelector('.w-header');
      if (!hd) return;
      var bottom = hd.getBoundingClientRect().bottom;
      D.querySelectorAll('[class*=cart]').forEach(function (e) {
        e.style.marginTop = '';
        var r = e.getBoundingClientRect();
        if (r.height > 99 && r.top < bottom) e.style.marginTop = (bottom - r.top) + 'px';
      });
    }, 60);
  }





  // Parent items with a submenu (Events, Grading, About) are not links:
  // desktop = hover only opens the dropdown; mobile menu = tap opens/closes the submenu
  D.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a');
    if (!a) return;
    var desk = a.nextElementSibling && a.nextElementSibling.classList.contains('nav__subnav');
    var mob = a.classList.contains('parent-link');
    if (!desk && !mob) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    if (mob) {
      var icon = a.parentNode.querySelector('.subnav-icon');
      if (icon) icon.click();
    }
  }, true);

  arrows();
  addEventListener('mouseover', fixCart);
  new MutationObserver(arrows).observe(D.documentElement, { childList: true, subtree: true });
})();

 
// product single page
document.addEventListener("DOMContentLoaded", function () {
  // Run only on product single pages
  const isProductPage =
    document.body.classList.contains("single-product") ||
    document.querySelector(".single-product");

  if (!isProductPage) return;

  const productDescription = document.querySelector(
    ".w-wrapper.product-description.pd"
  );
  const featuredProducts = document.querySelector(
    ".featured-products-carousel"
  );

  if (productDescription && featuredProducts) {
    featuredProducts.parentNode.insertBefore(
      productDescription,
      featuredProducts
    );
  }
});

// similar items
(()=>{
  let d=document;
  function addLabel(){
    d.querySelectorAll('h3').forEach(h=>{
      if(h.textContent.trim().toLowerCase()!=='similar items')return;
      if(h.parentElement.querySelector('.keep-hunt'))return;
      let p=d.createElement('div');
      p.className='keep-hunt';
      p.textContent='Keep the hunt going';
      h.parentElement.insertBefore(p,h);
    });
  }
  addLabel();
  new MutationObserver(addLabel).observe(d.body,{
    childList:true,subtree:true
  });
})();


/* BREADCRUMB + PAGE HERO JS (Shop All, category, product & hero pages) */
(()=>{
  let d=document,last,busy;
  /* page hero titles: "path":"Title" */
  const heroes={"/category-listing":"Shop by Category"};
  const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
  const sep='<span>/</span>';
  const page=()=>esc(d.title.split(' | ')[0]);
  const clear=()=>d.querySelectorAll('.bc,.ph').forEach(e=>e.remove());
  const draw=(h,html)=>{clear();h.insertAdjacentHTML('afterend','<div class=bc><nav aria-label=Breadcrumb>'+html+'</nav></div>')};
  const product=async(h,p)=>{
    let id=p.split('/').pop(),name=page(),
        url=performance.getEntriesByType('resource').map(e=>e.name.split('?')[0]).find(n=>n.endsWith('/products/'+id));
    if(!url)return 0;
    draw(h,'<a href="/s/shop">Shop All</a>'+sep+'<b>'+name+'</b>');
    try{
      let base=url.split('/store-locations')[0],
          r=(await (await fetch(url+'?include=categories')).json()).data.categories,
          list=await Promise.all((r.data||r).map(c=>fetch(base+'/categories/'+c.site_link.split('/').pop()).then(x=>x.json()).then(x=>x.data||x))),
          map={},best=[];
      list.forEach(c=>map[c.id]=c);
      list.forEach(c=>{let chain=[],n=c;while(n&&chain.length<9){chain.unshift(n);n=map[n.parent]}if(chain.length>best.length)best=chain});
      if(location.pathname==p)draw(h,'<a href="/s/shop">Shop All</a>'+sep+best.map(c=>'<a href="/'+c.site_link+'">'+esc(c.name)+'</a>'+sep).join('')+'<b>'+name+'</b>');
    }catch(e){}
    return 1;
  };
  setInterval(async()=>{
    let p=location.pathname.replace(/(.)\/$/,'$1'),h=d.querySelector('.w-block-header');
    if(!h||busy||(p==last&&d.querySelector('.bc,.ph')))return;
    if(heroes[p]){
      last=p;clear();
      h.insertAdjacentHTML('afterend','<section class=ph><h1>'+heroes[p]+'</h1><nav aria-label=Breadcrumb><a href="/">Home</a>'+sep+'<b>'+page()+'</b></nav></section>');
    }else if(p=='/s/shop'||/^\/shop\//.test(p)){
      last=p;
      let cat=p=='/s/shop'?'':page();
      draw(h,'<a href="/">Home</a>'+sep+(cat?'<a href="/s/shop">Shop All</a>'+sep+'<b>'+cat+'</b>':'<b>Shop All</b>'));
    }else if(/^\/product\//.test(p)){
      busy=1;if(await product(h,p))last=p;busy=0;
    }else if(p!=last){last=p;clear()}
  },300);
})();

/* AFTERPAY POPUP JS - replaces Afterpay's default modal with the Figma design */
(()=>{
  let d=document,m;
  const step=(n,t,s)=>'<div class=apm-step><b>'+n+'</b><div><strong>'+t+'</strong><span>'+s+'</span></div></div>';
  const open=kb=>{
    if(!m){
      m=d.createElement('div');m.className='apm';m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');m.setAttribute('aria-label','Pay over time with Afterpay');
      m.innerHTML='<div class=apm-box><div class=apm-head><div class=apm-logo><i>$</i>Afterpay</div><button class=apm-x type=button aria-label=Close><svg viewBox="0 0 14 14" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"><path d="M2 2l10 10M12 2 2 12"/></svg></button></div>'
        +'<h3 class=apm-title>Pay over time with Afterpay</h3>'
        +'<div class=apm-how><h4>How it works</h4><div class=apm-steps>'
        +step(1,'Add to cart &amp; choose Afterpay','Select Afterpay as your payment at checkout.')+'<i class=apm-line></i>'
        +step(2,'Log in or create an account','Instant approval - no long forms, no hard credit checks.')+'<i class=apm-line></i>'
        +step(3,'Get your order &amp; enjoy','Pay the rest automatically every 2 weeks. Zero interest.')
        +'</div></div><p class=apm-legal>You must be over 18, a resident of the U.S. and meet additional eligibility criteria to qualify. Late fees may apply. Payment amounts shown are estimates and depend on eligibility and exclude taxes and shipping charges, which are added at checkout. For complete terms see <a href="https://www.afterpay.com/en-US/installment-agreement" target="_blank" rel="noopener">Afterpay terms</a> and <a href="https://cash.app/legal/us/en-us/tos" target="_blank" rel="noopener">Cash App terms</a>. Loans to California residents made or arranged pursuant to a California Finance Lenders Law license.© Afterpay</p></div>';
      m.onclick=e=>{if(e.target==m||e.target.closest('.apm-x'))close()};
      d.body.append(m);
    }
    m.classList.add('on');d.documentElement.style.overflow='hidden';
    if(kb)m.querySelector('.apm-x').focus();
  };
  const close=()=>{m.classList.remove('on');d.documentElement.style.overflow=''};
  const hit=e=>e.composedPath().some(x=>x.tagName=='AFTERPAY-MESSAGING-PLACEMENT'||x.tagName=='SQUARE-PLACEMENT');
  ['click','keydown'].forEach(t=>d.addEventListener(t,e=>{
    if(t=='keydown'&&e.key=='Escape'&&m?.classList.contains('on'))return close();
    if(!hit(e)||(t=='keydown'&&e.key!='Enter'&&e.key!=' '))return;
    e.preventDefault();e.stopImmediatePropagation();open(t=='keydown');
  },true));
})();

// footer
/* =====================================================================
   FOOTER (Figma 896:540) - rebuilds Square's footer-5 into the Figma layout
   ===================================================================== */
(function () {
  var D = document;

  /* ---- Edit these if needed ---- */
  var EMAIL = 'info@hiddentempletoys.com';
  var DESC = 'A family-owned toy, collectible, and game store in Downtown Selma, NC. Shop, play, trade, connect.';
  var SOCIAL = { instagram: 'https://www.instagram.com/hiddentempletoys', facebook: 'https://www.facebook.com/hiddentempletoys', tiktok: 'https://www.tiktok.com/@hidden.temple.toy' };   // put real profile URLs here
  // Column titles + how many links (from Square's footer menu, in order) go in each
  // Column title + the first link of that column (from Square's footer menu)
var COLS = [['Events & Rewards', 'Event Schedule'], ['Grading & Trade-Ins', 'PSA Submission'], ['Shop Now', 'Shop All'], ['About', 'About Us']];

  /* ---- Fonts (an @import in the middle of a CSS file is ignored, so load them here) ---- */
  if (!D.getElementById('ht-fonts')) {
    var l = D.createElement('link');
    l.id = 'ht-fonts';
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css?family=Montserrat:400,500,600,700,800|Bebas+Neue&display=swap';
    D.head.appendChild(l);
  }

  /* ---- Icons ---- */
  var ST = ' stroke="#FBFAF6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"';
  var RING = '<path d="M19 0.5C29.2173 0.5 37.5 8.78273 37.5 19C37.5 29.2173 29.2173 37.5 19 37.5C8.78273 37.5 0.5 29.2173 0.5 19C0.5 8.78273 8.78273 0.5 19 0.5Z" stroke="#FFFCEE"/>';
  var ICON = {
    instagram: '<svg viewBox="0 0 38 38" fill="none">' + RING +
      '<path d="M15.25 11.5H22.75C24.8211 11.5 26.5 13.1789 26.5 15.25V22.75C26.5 24.8211 24.8211 26.5 22.75 26.5H15.25C13.1789 26.5 11.5 24.8211 11.5 22.75V15.25C11.5 13.1789 13.1789 11.5 15.25 11.5Z"' + ST + '/>' +
      '<path d="M22 18.5277C22.0926 19.1519 21.9859 19.7894 21.6953 20.3495C21.4047 20.9096 20.9449 21.3638 20.3812 21.6475C19.8176 21.9312 19.1788 22.0299 18.5558 21.9297C17.9328 21.8294 17.3573 21.5353 16.9111 21.0891C16.4649 20.6429 16.1708 20.0674 16.0706 19.4444C15.9703 18.8214 16.0691 18.1826 16.3527 17.619C16.6364 17.0554 17.0906 16.5955 17.6507 16.3049C18.2108 16.0143 18.8483 15.9077 19.4725 16.0002C20.1092 16.0946 20.6986 16.3913 21.1538 16.8465C21.6089 17.3016 21.9056 17.891 22 18.5277Z"' + ST + '/>' +
      '<path d="M23.125 14.875H23.1325"' + ST + '/></svg>',
    facebook: '<svg viewBox="0 0 38 38" fill="none">' + RING +
      '<path d="M23.5 11.5H21.25C20.2554 11.5 19.3016 11.8951 18.5983 12.5983C17.8951 13.3016 17.5 14.2554 17.5 15.25V17.5H15.25V20.5H17.5V26.5H20.5V20.5H22.75L23.5 17.5H20.5V15.25C20.5 15.0511 20.579 14.8603 20.7197 14.7197C20.8603 14.579 21.0511 14.5 21.25 14.5H23.5V11.5Z"' + ST + '/></svg>',
    tiktok: '<svg viewBox="0 0 38 38" fill="none">' + RING +
      '<path fill="white" d="M17.3372 26C16.3181 26 15.357 25.6749 14.5577 25.0596C14.4084 24.9448 14.2649 24.8193 14.1309 24.687C13.1979 23.7649 12.7284 22.5369 12.8091 21.2291C12.8701 20.2406 13.2682 19.2877 13.9307 18.5458C14.8082 17.5634 16.0179 17.0222 17.3375 17.0222C17.5642 17.0222 17.7931 17.0392 18.0184 17.0725L18.3684 17.1245V20.2305L17.8294 20.0525C17.6725 20.0005 17.5092 19.9743 17.3441 19.9743C16.9268 19.9743 16.5361 20.1378 16.2438 20.4345C15.9528 20.7298 15.7961 21.1202 15.8022 21.5345C15.8101 22.0685 16.0914 22.5525 16.5547 22.8298C16.7679 22.9572 17.0107 23.0318 17.2574 23.0455C17.4521 23.0562 17.6443 23.0307 17.8291 22.9698C18.4611 22.7611 18.8857 22.1749 18.8857 21.5112L18.8884 18.2902V12H21.8569L21.8604 12.4063C21.8621 12.5904 21.8809 12.7744 21.9165 12.9527C22.0559 13.6537 22.4491 14.2786 23.0236 14.7117C23.5336 15.0964 24.1423 15.2996 24.7832 15.2996C24.7982 15.2996 24.7982 15.2996 24.9352 15.3091L25.3167 15.3359V17.8516V18.2617L25.18 18.2614H24.9073C24.9052 18.2614 24.903 18.2614 24.9005 18.2614H24.7695C24.769 18.2614 24.7682 18.2614 24.7673 18.2614C23.9768 18.2614 23.2361 18.1108 22.5019 17.801C22.2832 17.7086 22.0702 17.603 21.8645 17.4852L21.8738 21.5268C21.8689 22.7223 21.3964 23.8437 20.5436 24.6867C19.8515 25.3705 18.9781 25.8075 18.0178 25.9497C17.7939 25.983 17.565 26 17.3372 26ZM17.3372 17.8425C16.2547 17.8425 15.2621 18.2863 14.5424 19.0921C14.0021 19.6973 13.6773 20.4741 13.6275 21.2794C13.5619 22.3471 13.9452 23.3501 14.7073 24.1032C14.8175 24.212 14.9354 24.3151 15.0579 24.4094C15.7125 24.9134 16.5008 25.1797 17.3372 25.1797C17.5248 25.1797 17.7132 25.1657 17.8978 25.1384C18.6845 25.0219 19.4 24.664 19.9672 24.1034C20.6639 23.4149 21.0497 22.4997 21.0538 21.5263L21.0409 15.8828L21.7035 16.3939C22.0456 16.6577 22.4218 16.877 22.8213 17.0457C23.3673 17.2762 23.9178 17.4042 24.4961 17.4346V16.1098C23.7813 16.0562 23.1062 15.8021 22.5295 15.3671C21.794 14.8126 21.2906 14.012 21.1118 13.1132C21.0926 13.0166 21.077 12.919 21.0656 12.8206H19.7085V18.2904L19.7057 21.5115C19.7057 22.5295 19.055 23.4286 18.0862 23.7485C17.8037 23.8418 17.5098 23.8806 17.2123 23.8645C16.8333 23.8437 16.4603 23.7291 16.1333 23.5336C15.4243 23.1095 14.9936 22.3666 14.9816 21.5465C14.9723 20.9111 15.2126 20.3117 15.6589 19.8586C16.1065 19.4041 16.7048 19.1539 17.3435 19.1539C17.4119 19.1539 17.4797 19.157 17.5475 19.1627V17.8483C17.4775 17.8445 17.4072 17.8425 17.3372 17.8425Z"/></svg>'
  };
  var MAIL = '<svg viewBox="0 0 18 18"><path fill="white" d="M3 15C2.5875 15 2.23438 14.8531 1.94063 14.5594C1.64688 14.2656 1.5 13.9125 1.5 13.5V4.5C1.5 4.0875 1.64688 3.73438 1.94063 3.44063C2.23438 3.14688 2.5875 3 3 3H15C15.4125 3 15.7656 3.14688 16.0594 3.44063C16.3531 3.73438 16.5 4.0875 16.5 4.5V13.5C16.5 13.9125 16.3531 14.2656 16.0594 14.5594C15.7656 14.8531 15.4125 15 15 15H3ZM9 9.75L3 6V13.5H15V6L9 9.75ZM9 8.25L15 4.5H3L9 8.25ZM3 6V4.5V13.5V6Z"/></svg>';

  function build() {
    var f5 = D.querySelector('[layout=footer-5]');
    if (!f5) return;

    // Copyright row: full width, centered, top border
    var c = D.evaluate(".//*[contains(text(),'©')]", f5, null, 9, null).singleNodeValue;
    var copyText = c && !c.closest('.hf-copyline') ? c.textContent.trim() : '';
    var cr = c && c.closest('.align-start.row');
    if (cr && !cr.querySelector('ul.nav__main') && !cr.querySelector('.hf') && !cr.classList.contains('hf-copy')) cr.classList.add('hf-copy');

    // Square's footer row that holds the logo + footer menu
    var row = [].slice.call(f5.querySelectorAll('.align-start.row')).filter(function (r) {
      return r.querySelector('ul.nav__main');
    })[0];
    var links, logo;
    if (row && !row.querySelector('.hf')) {
      links = [].slice.call(row.querySelectorAll('ul.nav__main a'));
      logo = row.querySelector('img');
    } else {
      // Old footer snippet already turned the menu into ".f" - rebuild from that
      var f = f5.querySelector('.f');
      if (!f) return;
      links = [].slice.call(f.querySelectorAll(':scope>div:not(:first-child)>a'));
      logo = f.querySelector('img');
      row = f;
      row.className = 'w-cell row';
    }

    var html = '<div class="hf-brand">' +
      (logo ? '<img src="' + logo.src + '" alt="Hidden Temple Toys">' : '') +
      '<p class="hf-desc">' + DESC + '</p>' +
      '<a class="hf-mail" href="mailto:' + EMAIL + '">' + MAIL + '<span>' + EMAIL + '</span></a>' +
      '<div class="hf-social">';
    ['instagram', 'facebook', 'tiktok'].forEach(function (n) {
      html += '<a href="' + SOCIAL[n] + '" target="_blank" rel="noopener" aria-label="' + n + '">' + ICON[n] + '</a>';
    });
    html += '</div></div>';

    var p = 0, txt = links.map(function (a) { return a.textContent.trim(); });
COLS.forEach(function (col, c) {
  var end = c < COLS.length - 1 ? txt.indexOf(COLS[c + 1][1]) : -1;
  if (end < p) end = links.length;
  html += '<div><h4>' + col[0] + '</h4>';
  for (; p < end; p++) html += '<a href="' + links[p].href + '">' + txt[p] + '</a>';
  html += '</div>';
});

    row.classList.add('hf-row');
    // Square keeps the copyright in the same row as the menu, so add it back under the columns
    var copy = (row.contains(c) && copyText) ? '<div class="hf-copyline">' + copyText + '</div>' : '';
    row.classList.remove('hf-copy');
    row.innerHTML = '<div class="hf">' + html + '</div>' + copy;
  }

  build();
  setInterval(build, 500);
})();


// inject hidden h1 tag on shop page only
// Hidden H1 (SEO): only on /s/shop
(function () {
  var D = document;
  function h1() {
    var p = location.pathname.replace(/\/+$/, '') || '/';
    var on = p === '/s/shop';
    var el = D.getElementById('ht-h1');
    if (on && !el && D.body) {
      el = D.createElement('h1');
      el.id = 'ht-h1';
      el.textContent = 'hidden-temple-toys';
      el.style.cssText = 'position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important';
      D.body.prepend(el);
    } else if (!on && el) {
      el.remove();
    }
  }
  h1();
  setInterval(h1, 500);
})();


/* "Join the Community" heading - same style as staging (#CgHJSx h3); only this heading */
(function () {
  var CSS = { 'font-family': 'Montserrat,sans-serif', 'font-weight': '700', 'font-size': '14px', 'line-height': '20px', 'letter-spacing': '2px', 'text-transform': 'none', 'color': '#45924F' };
  function fix() {
    document.querySelectorAll('h3').forEach(function (h) {
      if (!/^\s*join the community\s*$/i.test(h.textContent)) return;
      [h].concat([].slice.call(h.querySelectorAll('*'))).forEach(function (e) {
        for (var k in CSS) if (e.style.getPropertyValue(k) !== CSS[k]) e.style.setProperty(k, CSS[k], 'important');
      });
    });
  }
  fix();
  setInterval(fix, 500);
})();

applyEnhancements();



// Re-apply instantly whenever Square re-renders (runs before paint → no flash)
const fixCards = () => {
  document.querySelectorAll('.selector .card').forEach(card => {
    if (!card.classList.contains('c')) card.classList.add('c');
    const selected = /PayF3/.test(card.className);
    if (card.classList.contains('on') !== selected) card.classList.toggle('on', selected);
  });
  const h = document.querySelector('header p');
  if (h && h.textContent !== 'How do you want it?') h.textContent = 'How do you want it?';
};

new MutationObserver(() => { fixCards(); applyEnhancements(); })
  .observe(document.body, {
    subtree: true, childList: true, characterData: true,
    attributes: true, attributeFilter: ['class']
  });




/* ---------------------------------------------------------------
 * Mobile full-screen filter (works with the existing .htt-filters-toggle)
 * Adds: "Show results" button, close on Esc / category tap, labels.
 * Place ABOVE the stray `applyEnhancements();` line (keep it at the top).
 * ------------------------------------------------------------- */
(function () {
  var root = document.documentElement;
  var OPEN = 'htt-filters-open';
  // the old toggle code only runs on /s/shop, so set it up here for every page
  root.classList.add('htt-filters-js');

  function close() {
    root.classList.remove(OPEN);
    var t = document.querySelector('.htt-filters-toggle');
    if (t) t.setAttribute('aria-expanded', 'false');
  }

  function count() {
    var el = document.querySelector('.total-items');
    var m = el && el.textContent.match(/\d+/);
    return m ? 'Show ' + m[0] + ' results' : 'Show results';
  }

  function sync() {
    var sb = document.querySelector('.category__sidebar');
    if (!sb) return;
    var t = sb.querySelector('.htt-filters-toggle');
    if (!t) {
      t = document.createElement('button');
      t.type = 'button';
      t.className = 'htt-filters-toggle';
      t.setAttribute('aria-expanded', root.classList.contains(OPEN) ? 'true' : 'false');
      sb.insertBefore(t, sb.firstChild);
    }
    if (t) {
      var open = root.classList.contains(OPEN);
      var label = open ? 'Filters' : 'Filter';
      if (t.textContent !== label) t.textContent = label;
      var al = open ? 'Close filters' : 'Open filters';
      if (t.getAttribute('aria-label') !== al) t.setAttribute('aria-label', al);
    }
    var done = sb.querySelector('.htt-filters-done');
    if (!done) {
      done = document.createElement('button');
      done.type = 'button';
      done.className = 'htt-filters-done';
      sb.appendChild(done);
    }
    var txt = count();
    if (done.textContent !== txt) done.textContent = txt;
  }

  // open/close the panel. Capture phase + stopPropagation so the old
  // /s/shop toggle handler doesn't also fire (which would undo it).
  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('.htt-filters-toggle');
    if (!btn) return;
    e.stopPropagation();
    var open = root.classList.toggle(OPEN);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }, true);

  document.addEventListener('click', function (e) {
    if (!e.target.closest) return;
    if (e.target.closest('.htt-filters-done')) { close(); window.scrollTo(0, 0); return; }
    // tapping a category (incl. "All Items") closes the panel
    if (root.classList.contains(OPEN) && e.target.closest('.category__sidebar .sidebar__categories li')) close();
  });



  // ticking any other filter (checkbox / radio) closes the panel
  document.addEventListener('change', function (e) {
    var t = e.target;
    if (!root.classList.contains(OPEN) || !t.closest || !t.closest('.category__sidebar')) return;
    if (t.type === 'checkbox' || t.type === 'radio') setTimeout(close, 150);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && root.classList.contains(OPEN)) close();
  });

  // close if the screen grows to desktop size while open
  window.addEventListener('resize', function () {
    if (window.innerWidth > 890 && root.classList.contains(OPEN)) close();
  });

  new MutationObserver(sync).observe(document.documentElement, {
    childList: true, subtree: true, attributes: true, attributeFilter: ['class']
  });
  sync();
})();
