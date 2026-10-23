/* 简历渲染器：读取 window.RESUME 并渲染到 #app
   数据由服务端注入（在线）或内联（导出的独立 HTML）。
   注意：本页面向查看者，不包含任何指向管理后台的入口。 */
(function () {
  var R = window.RESUME;
  var app = document.getElementById('app');
  if (!R || !R.base || !R.version) {
    if (app) app.innerHTML = '<div style="padding:60px;text-align:center;color:#c0392b;font-size:15px">数据加载失败。请通过服务器访问（node server.js），或检查数据是否已注入。</div>';
    return;
  }
  var base = R.base, ver = R.version;

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  var ICONS = {
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
    wechat: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
    mail: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>'
  };

  function contactItem(icon, content) {
    return '<div class="contact-item"><svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' + icon + '</svg>' + content + '</div>';
  }
  function infoLine(k, v) {
    return '<div class="info-line"><span class="k">' + esc(k) + '</span><span class="v">' + esc(v) + '</span></div>';
  }
  function projCard(p, featured) {
    var h = '<div class="proj-card' + (featured ? ' featured' : '') + '"><h3>' + esc(p.title);
    if (p.badge) h += ' <span class="badge">' + esc(p.badge) + '</span>';
    if (p.link) h += ' <a class="proj-link" href="' + esc(p.link) + '" target="_blank">' + esc(p.link.replace(/^https?:\/\//, '')) + ' ↗</a>';
    h += '</h3><p class="proj-desc">' + esc(p.desc) + '<ul>';
    (p.items || []).forEach(function (it) { h += '<li>' + esc(it) + '</li>'; });
    h += '</ul></p><div class="proj-stack">';
    (p.stack || []).forEach(function (s) { h += '<span class="chip">' + esc(s) + '</span>'; });
    h += '</div></div>';
    return h;
  }

  /* ---- 左侧栏 ---- */
  var sidebar = '<aside class="sidebar">';
  sidebar += '<div class="avatar-wrap"><span class="avatar-placeholder">' + esc(base.name.charAt(0)) + '</span></div>';
  sidebar += '<h1>' + esc(base.name) + '</h1>';
  sidebar += '<div class="title-role">' + esc(ver.title) + '</div>';

  sidebar += '<div class="side-section"><h2>联系方式</h2>';
  sidebar += contactItem(ICONS.phone, '<a href="tel:' + esc(base.phone) + '">' + esc(base.phone) + '</a>');
  sidebar += contactItem(ICONS.wechat, '<span>微信：' + esc(base.wechat) + '</span>');
  sidebar += contactItem(ICONS.mail, '<a href="mailto:' + esc(base.email) + '">' + esc(base.email) + '</a>');
  sidebar += '</div>';

  sidebar += '<div class="side-section"><h2>求职信息</h2>';
  sidebar += infoLine('求职意向', ver.title);
  sidebar += infoLine('工作年限', base.workYears);
  sidebar += infoLine('期望城市', base.city);
  sidebar += infoLine('性别 / 年龄', base.gender + ' / ' + base.age);
  sidebar += '</div>';

  sidebar += '<div class="side-section"><h2>资格证书</h2>';
  (base.certs || []).forEach(function (c) { sidebar += '<div class="cert-item">' + esc(c) + '</div>'; });
  sidebar += '</div>';

  sidebar += '<div class="side-section"><h2>核心技能</h2>';
  Object.keys(base.skills || {}).forEach(function (group) {
    sidebar += '<div class="skill-group"><div class="sg-title">' + esc(group) + '</div><div class="tag-list">';
    (base.skills[group] || []).forEach(function (t) { sidebar += '<span class="tag">' + esc(t) + '</span>'; });
    sidebar += '</div></div>';
  });
  sidebar += '</div></aside>';

  /* ---- 右侧主区 ---- */
  var main = '<main class="main">';

  main += '<section class="main-section"><h2>个人简介</h2><p class="summary">' + esc(ver.summary) + '</p></section>';

  main += '<section class="main-section"><h2>核心优势</h2><div class="adv-grid">';
  (ver.advantages || []).forEach(function (a) {
    main += '<div class="adv-card"><h3>' + esc(a.title) + '</h3><p>' + esc(a.text) + '</p></div>';
  });
  main += '</div></section>';

  main += '<section class="main-section"><h2>工作经历</h2><div class="timeline">';
  (base.experience || []).forEach(function (exp) {
    main += '<div class="tl-item">';
    main += '<div class="tl-head"><span class="role">' + esc(exp.role) + '</span><span class="date">' + esc(exp.period) + '</span></div>';
    main += '<div class="tl-org-line">' + esc(exp.company) + '</div>';
    (exp.projects || []).forEach(function (p) {
      main += '<div class="tl-sub">▸ ' + esc(p.title) + '（' + esc(p.period) + '）</div>';
      main += '<div class="tl-desc"><ul>';
      (p.items || []).forEach(function (it) { main += '<li><b>' + esc(it.label) + '：</b>' + esc(it.text) + '</li>'; });
      main += '</ul></div>';
    });
    main += '</div>';
  });
  main += '</div></section>';

  var featured = (base.projects || []).filter(function (p) { return p.id === ver.featuredProject; })[0] || (base.projects || [])[0];
  if (featured) {
    main += '<section class="main-section"><h2>个人项目</h2><div class="proj-grid">' + projCard(featured, true) + '</div></section>';
  }

  main += '<section class="main-section"><h2>教育背景</h2>';
  (base.education || []).forEach(function (e) {
    main += '<div class="edu-item"><div class="edu-head"><span class="school">' + esc(e.school) + '</span><span class="date">' + esc(e.period) + '</span></div><div class="edu-detail">' + esc(e.detail) + '</div></div>';
  });
  main += '</section>';

  main += '<section class="main-section"><h2>荣誉</h2><ul class="honor-list">';
  (base.honors || []).forEach(function (h) { main += '<li>' + esc(h) + '</li>'; });
  main += '</ul></section>';

  main += '</main>';

  var toolbar = '<div class="toolbar"><button class="tool-btn" onclick="window.print()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z"/></svg>打印 / 导出PDF</button></div>';

  app.innerHTML = toolbar + '<div class="page">' + sidebar + main + '</div>';

  /* 进入视口淡入动画 */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.style.opacity = 1; e.target.style.transform = 'translateY(0)'; } });
    }, { threshold: 0.1 });
    document.querySelectorAll('.tl-item,.proj-card,.adv-card').forEach(function (el) {
      el.style.opacity = 0; el.style.transform = 'translateY(16px)';
      el.style.transition = 'opacity .5s ease,transform .5s ease';
      io.observe(el);
    });
  }
})();
