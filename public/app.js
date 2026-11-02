/* 简历渲染器 · 暖色五段式 + 中英双语 + GSAP 动效层
   数据由服务端注入（在线）或内联（导出的独立 HTML）。
   本页面向查看者，不包含任何指向管理后台的入口。 */
(function () {
  var R = window.RESUME;
  var app = document.getElementById('app');
  if (!R || !R.base || !R.version) {
    if (app) app.innerHTML = '<div style="padding:60px;text-align:center;color:#8a7d6a;font-size:17px">数据加载失败。</div>';
    return;
  }

  var lang = 'zh'; // 当前语言：zh | en

  /* ============ 文案字典（页面结构文案，非数据模型） ============ */
  var UI = {
    zh: {
      print: '打印 / PDF',
      secHistory: '个人履历',
      historyNote: '从核心系统到 AI 落地，每一步都有据可查。',
      secSkills: '技能展示',
      skillsNote: '5 个方向 · 16 项技能，悬停查看归属。',
      secProjects: '项目展示',
      projectsNote: '3 个独立完整项目，从 AI 助手到实时协作。',
      edu: '教育背景',
      honors: '荣誉与认证',
      footerOpen: '开放',
      footerRelated: '相关岗位，',
      footerCityFirst: '优先，远程亦可。',
      howContact: '如何联系我？',
      wechat: '微信',
      thanks: '感谢阅读。',
      credit: '插画：原创卡通人像。',
      online: '在线体验',
      langBtn: 'EN',
      title: '个人简历',
      chips: {
        ai: ['9 年 · 世界 500 强', 'AWS Certified AI Practitioner', '3 个独立 AI 项目'],
        it: ['9 年 · 核心系统运维', 'RPA 每年替代 1400h', '全栈排障能力'],
        test: ['9 年 · 核心系统研发', '质量保障 + 性能调优', '自动化提效'],
        erp: ['9 年 · ERP 实施', 'Next ERP 项目经理', 'SAP Hybris 电商对接']
      },
      stats: [
        { num: '9 年', fact: '世界 500 强研发' },
        { num: '1400h', fact: 'RPA 每年替代人工' },
        { num: '4.5 年', fact: 'RMS 持续迭代' },
        { num: '3 个', fact: '独立完整项目' }
      ]
    },
    en: {
      print: 'Print / PDF',
      secHistory: 'Experience',
      historyNote: 'From core systems to AI in production — every step verifiable.',
      secSkills: 'Skill Showcase',
      skillsNote: '5 directions · 16 skills. Hover to see the group.',
      secProjects: 'Projects',
      projectsNote: 'Three complete solo projects, from AI assistant to real-time collaboration.',
      edu: 'Education',
      honors: 'Honors & Certifications',
      footerOpen: 'Open to',
      footerRelated: 'roles. ',
      footerCityFirst: ' preferred, remote OK.',
      howContact: 'How to reach me?',
      wechat: 'WeChat',
      thanks: 'Thanks for reading.',
      credit: 'Illustration: original cartoon portrait.',
      online: 'Live demo',
      langBtn: '中文',
      title: 'Resume',
      chips: {
        ai: ['9 Years · Fortune 500', 'AWS Certified AI Practitioner', '3 Solo AI Projects'],
        it: ['9 Years · Core System Ops', '1,400h RPA Saved / Year', 'Full-Stack Troubleshooting'],
        test: ['9 Years · Core System R&D', 'QA + Performance Tuning', 'Automation Efficiency'],
        erp: ['9 Years · ERP Delivery', 'Next ERP Project Manager', 'SAP Hybris Integration']
      },
      stats: [
        { num: '9 yrs', fact: 'Fortune 500 R&D' },
        { num: '1,400h', fact: 'RPA hours saved / year' },
        { num: '4.5 yrs', fact: 'RMS continuous iteration' },
        { num: '3', fact: 'complete solo projects' }
      ]
    }
  };

  var VER_SHORT = { ai: 'AI', it: 'IT', test: '测试', erp: 'ERP' };
  var VER_SHORT_EN = { ai: 'AI', it: 'IT', test: 'Test', erp: 'ERP' };

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  /* en 字段缺失时回退中文值（C12 失败行为） */
  function fb(en, zh) {
    if (en === undefined || en === null) return zh;
    if (typeof en === 'string' && en.trim() === '') return zh;
    if (Array.isArray(en) && en.length === 0) return zh;
    return en;
  }

  /* 按当前语言取数据源 */
  function dataFor() {
    var ui = UI[lang];
    var e = (lang === 'en') ? R.en : null;
    if (!e || !e.base) { return { base: R.base, ver: R.version, ui: ui }; }
    var ver = (e.versions && e.versions[R.versionKey]) || null;
    return {
      base: e.base,
      ver: ver || R.version,
      zhBase: R.base,
      zhVer: R.version,
      ui: ui
    };
  }

  /* ============ 图标（内联 SVG，24×24 线性） ============ */
  var ICONS = {
    'Java': '<path d="M4 10h13v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-6z"/><path d="M17 11h1.5a2.5 2.5 0 0 1 0 5H17"/><path d="M7 3.5c0 1-1.5 1.5-1.5 2.5S7 7.5 7 8.5M11 3.5c0 1-1.5 1.5-1.5 2.5S11 7.5 11 8.5"/>',
    'ASP.Net': '<path d="M12 3l7 4.5v9L12 21l-7-4.5v-9L12 3z"/><path d="M12 8v8M8.5 10l7 4M15.5 10l-7 4"/>',
    'ABAP': '<path d="M6 3h9l4 4v14H6V3z"/><path d="M14 3v5h5"/><path d="M9 12h7M9 16h5"/>',
    'REST API': '<path d="M4 9a8 8 0 0 1 14-3l2 2"/><path d="M20 4v4h-4"/><path d="M20 15a8 8 0 0 1-14 3l-2-2"/><path d="M4 20v-4h4"/>',
    'JWT': '<circle cx="8" cy="14" r="4"/><path d="M11 11l8-8M15 7l3 3M18 4l2 2"/>',
    'Vue.js': '<path d="M3 5l9 13 9-13"/><path d="M8 5l4 6 4-6"/>',
    'JavaScript': '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M13 8l-3.5 5H12l-1.5 4L15 11h-2.5L15 8h-2z"/>',
    '小程序': '<rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M10.5 7h3M12 17.5h.01"/>',
    'PostgreSQL': '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6"/><path d="M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3"/>',
    'Brity Works RPA': '<rect x="5" y="8" width="14" height="11" rx="3"/><path d="M12 8V5"/><circle cx="12" cy="3.5" r="1.5"/><path d="M9.5 13h.01M14.5 13h.01"/><path d="M9.5 16h5"/>',
    'SAP Hybris': '<circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4c2.5 2.3 3.8 5.2 3.8 8S14.5 17.7 12 20c-2.5-2.3-3.8-5.2-3.8-8S9.5 6.3 12 4z"/>',
    'Next ERP': '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
    'Crystal Reports': '<path d="M4 20h16"/><rect x="6" y="11" width="3.5" height="9" rx="1"/><rect x="12" y="6" width="3.5" height="14" rx="1"/><rect x="18" y="9" width="3.5" height="11" rx="1"/>',
    'AWS': '<path d="M7 17a4.5 4.5 0 0 1-.5-9 5.5 5.5 0 0 1 10.6-1.2A4.2 4.2 0 0 1 17 17H7z"/>',
    'LLM / Agent': '<path d="M4 6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H9l-5 4V6z"/><path d="M9 8.5h6M9 12h4"/>',
    'Linux': '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 9l3 3-3 3M13 15h4"/>',
    'chat': '<path d="M4 6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H9l-5 4V6z"/>',
    'news': '<path d="M5 4h13v16H7a2 2 0 0 1-2-2V4z"/><path d="M18 8h2v10a2 2 0 0 1-2 2"/><path d="M8 8h6M8 12h6M8 16h4"/>',
    'kanban': '<rect x="4" y="4" width="16" height="16" rx="2.5"/><path d="M9 4v10M15 4v6"/>',
    'calendar': '<rect x="4" y="5" width="16" height="15" rx="2.5"/><path d="M4 10h16M8 3v4M16 3v4"/><path d="M12 17.5c-1.8-1.2-2.6-2.3-2.2-3.3.4-1 1.5-1.1 2.2-.4.7-.7 1.8-.6 2.2.4.4 1-.4 2.1-2.2 3.3z"/>',
    'home': '<path d="M4 11l8-7 8 7"/><path d="M6 9.5V20h12V9.5"/><path d="M10 20v-5h4v5"/>'
  };
  function icon(name, cls) {
    var p = ICONS[name] || ICONS['chat'];
    return '<svg class="' + (cls || 'ic') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>';
  }
  var FEATURE_ICONS = ['chat', 'news', 'kanban', 'calendar', 'home'];

  var SOLID = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="4" height="3"><rect width="4" height="3" fill="#f3ead9"/></svg>');

  /* ============ 顶栏 ============ */
  function topbar(D) {
    var ui = D.ui;
    var s = '<header class="topbar" id="topbar">';
    s += '<div class="topbar-inner">';
    s += '<a class="tb-name" href="#hero">' + esc(D.base.name) + '<span class="tb-title">' + esc(D.ver.title) + '</span></a>';
    s += '<div class="tb-right">';
    s += '<nav class="tb-versions">';
    (R.allVersions || []).forEach(function (v) {
      if (v !== R.versionKey) {
        s += '<a class="tb-ver" href="/' + esc(v) + '">' + esc((lang === 'en' ? VER_SHORT_EN : VER_SHORT)[v] || v) + '</a>';
      }
    });
    s += '</nav>';
    s += '<button class="lang-btn" id="langBtn" aria-label="Switch language">' + esc(ui.langBtn) + '</button>';
    s += '</div></div></header>';
    return s;
  }

  /* ============ ① 头图封面（模糊背景 + 清晰前景） ============ */
  function hero(D) {
    var ui = D.ui;
    var summary = String(fb(D.ver.summary, D.zhVer && D.zhVer.summary) || '');
    var dotIdx = summary.indexOf(lang === 'en' ? '. ' : '。');
    var lead = dotIdx > -1 ? summary.slice(0, dotIdx + (lang === 'en' ? 1 : 1)) : summary;
    var chips = ui.chips[R.versionKey] || ui.chips.ai;
    var alt = (lang === 'en' ? 'Cartoon portrait of ' : '卡通人像：') + esc(D.base.name) + (lang === 'en' ? ' — round glasses, light blue shirt, warm background' : '，圆框黑眼镜、浅蓝衬衫、暖色背景');

    var s = '<section class="hero" id="hero">';
    s += '<img class="hero-bg" src="/img/portrait-cartoon.jpg" alt="" aria-hidden="true">';
    s += '<div class="hero-veil"></div>';
    s += '<div class="hero-inner">';
    s += '<div class="hero-text">';
    s += '<h1 class="hero-name">' + esc(D.base.name) + '</h1>';
    s += '<p class="hero-title">' + esc(D.ver.title) + '</p>';
    s += '<p class="hero-lead">' + esc(lead) + '</p>';
    s += '<div class="hero-chips">';
    chips.forEach(function (c) { s += '<span class="chip">' + esc(c) + '</span>'; });
    s += '</div>';
    s += '<div class="hero-actions">';
    s += '<button class="btn ghost" id="printBtn">' + esc(ui.print) + '</button>';
    s += '</div></div>';
    s += '<div class="hero-portrait">';
    s += '<img class="hero-card" src="/img/portrait-cartoon.jpg" alt="' + alt + '">';
    s += '</div></div></section>';
    return s;
  }

  /* ============ ② 个人履历（时间线） ============ */
  function history(D) {
    var ui = D.ui;
    var base = D.base;
    var s = '<section class="history" id="history">';
    s += '<div class="sec-head-wrap">';
    s += '<h2 class="sec-head">' + esc(ui.secHistory) + '</h2>';
    s += '<p class="sec-note">' + esc(ui.historyNote) + '</p>';
    s += '</div>';

    /* 量化成果（醒目不粘连） */
    s += '<div class="stats">';
    ui.stats.forEach(function (st) {
      s += '<div class="stat"><span class="stat-num">' + esc(st.num) + '</span><span class="stat-fact">' + esc(st.fact) + '</span></div>';
    });
    s += '</div>';

    /* 时间线 */
    s += '<div class="timeline">';
    (base.experience || []).forEach(function (exp) {
      s += '<div class="tl-item">';
      s += '<span class="tl-dot"></span>';
      s += '<div class="tl-card">';
      s += '<div class="tl-top"><h3>' + esc(fb(exp.role, '')) + '</h3><span class="tl-period">' + esc(exp.period) + '</span></div>';
      s += '<div class="tl-company">' + esc(exp.company) + '</div>';
      (exp.projects || []).forEach(function (p) {
        s += '<div class="tl-proj">';
        s += '<h4>' + esc(p.title) + ' <span class="tl-proj-period">' + esc(p.period) + '</span></h4>';
        s += '<ul>';
        (p.items || []).forEach(function (it) {
          s += '<li><strong>' + esc(fb(it.label, '')) + '</strong>　' + esc(fb(it.text, '')) + '</li>';
        });
        s += '</ul></div>';
      });
      s += '</div></div>';
    });
    s += '</div>';

    /* 教育 + 荣誉 */
    s += '<div class="edu-honors">';
    s += '<div class="eh-card"><h3>' + esc(ui.edu) + '</h3>';
    (base.education || []).forEach(function (e) {
      s += '<div class="eh-row"><strong>' + esc(e.school) + '</strong><span>' + esc(e.period) + '</span></div>';
      s += '<p>' + esc(e.detail) + '</p>';
    });
    s += '</div>';
    s += '<div class="eh-card"><h3>' + esc(ui.honors) + '</h3><ul>';
    (base.honors || []).forEach(function (h) { s += '<li>' + esc(h) + '</li>'; });
    (base.certs || []).forEach(function (c) { s += '<li>' + esc(c) + '</li>'; });
    s += '</ul></div>';
    s += '</div></section>';
    return s;
  }

  /* ============ ③ 作品目录（技能图标悬浮物） ============ */
  function skills(D) {
    var ui = D.ui;
    var base = D.base;
    var s = '<section class="skills" id="skills">';
    s += '<div class="sec-head-wrap">';
    s += '<h2 class="sec-head">' + esc(ui.secSkills) + '</h2>';
    s += '<p class="sec-note">' + esc(ui.skillsNote) + '</p>';
    s += '</div>';
    s += '<div class="skill-grid">';
    var i = 0;
    Object.keys(base.skills || {}).forEach(function (group) {
      (base.skills[group] || []).forEach(function (name) {
        s += '<div class="skill-badge" data-group="' + esc(group) + '">';
        s += '<span class="skill-icon">' + icon(name) + '</span>';
        s += '<span class="skill-name">' + esc(name) + '</span>';
        s += '<span class="skill-tip">' + esc(group) + '</span>';
        s += '</div>';
        i++;
      });
    });
    s += '</div></section>';
    return s;
  }

  /* ============ ④ 项目展示（豹豹助手主打 + 2 小卡） ============ */
  function projects(D) {
    var ui = D.ui;
    var base = D.base;
    var featured = null, others = [];
    (base.projects || []).forEach(function (p) {
      if (p.id === D.ver.featuredProject) featured = p; else others.push(p);
    });

    var s = '<section class="projects" id="projects">';
    s += '<div class="sec-head-wrap">';
    s += '<h2 class="sec-head">' + esc(ui.secProjects) + '</h2>';
    s += '<p class="sec-note">' + esc(ui.projectsNote) + '</p>';
    s += '</div>';

    if (featured) {
      s += '<div class="proj-feature">';
      s += '<div class="pf-text">';
      s += '<div class="pf-badge">' + esc(featured.badge || '独立开发') + '</div>';
      s += '<h3>' + esc(featured.title) + '</h3>';
      s += '<p class="pf-desc">' + esc(featured.desc) + '</p>';
      s += '<ul class="pf-items">';
      (featured.items || []).forEach(function (it, idx) {
        s += '<li>' + icon(FEATURE_ICONS[idx] || 'chat', 'pf-ico') + '<span>' + esc(it) + '</span></li>';
      });
      s += '</ul>';
      s += '<div class="pf-stack">' + (featured.stack || []).map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('') + '</div>';
      s += '</div>';
      s += '<div class="pf-side">';
      if (featured.link) {
        s += '<a class="pf-link" href="' + esc(featured.link) + '" target="_blank" rel="noopener">' + esc(featured.link.replace(/^https?:\/\//, '')) + ' →</a>';
      }
      s += '<p class="pf-note">' + esc(ui.online) + '</p>';
      s += '</div></div>';
    }

    s += '<div class="proj-grid">';
    others.forEach(function (p) {
      s += '<div class="proj">';
      s += '<div class="proj-badge">' + esc(p.badge || '独立开发') + '</div>';
      s += '<h3>' + esc(p.title) + '</h3>';
      if (p.link) s += '<a class="proj-link" href="' + esc(p.link) + '" target="_blank" rel="noopener">' + esc(p.link.replace(/^https?:\/\//, '')) + '</a>';
      s += '<p class="proj-desc">' + esc(p.desc) + '</p>';
      s += '<ul class="proj-items">';
      (p.items || []).forEach(function (it) { s += '<li>' + esc(it) + '</li>'; });
      s += '</ul>';
      s += '<div class="proj-stack">' + (p.stack || []).map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('') + '</div>';
      s += '</div>';
    });
    s += '</div></section>';
    return s;
  }

  /* ============ ⑤ 结尾页脚 ============ */
  function footer(D) {
    var ui = D.ui;
    var base = D.base;
    var portrait = base.avatar || '/img/portrait-cartoon.jpg';
    var s = '<footer class="footer" id="contact">';
    s += '<div class="footer-inner">';
    s += '<div class="footer-main">';
    s += '<h2 class="footer-sentence">' + esc(ui.footerOpen) + ' ' + esc(D.ver.title) + ' ' + esc(ui.footerRelated) + esc(base.city) + esc(ui.footerCityFirst) + '</h2>';
    s += '<div class="footer-right">';
    s += '<img class="footer-avatar" src="' + esc(portrait) + '" alt="' + esc(base.name) + '">';
    s += '<div class="footer-contact">';
    s += '<div class="fc-label">' + esc(ui.howContact) + '</div>';
    s += '<div class="fc-links">';
    s += '<a href="tel:' + esc(base.phone) + '">' + esc(base.phone) + '</a>';
    s += '<a href="mailto:' + esc(base.email) + '">' + esc(base.email) + '</a>';
    s += '</div>';
    s += '<div class="fc-meta">' + esc(base.city) + (lang === 'en' ? ' · China · ' : ' · 中国 · ') + esc(ui.wechat) + ' ' + esc(base.wechat) + '</div>';
    s += '</div></div></div>';
    s += '<p class="footer-line">' + esc(base.name) + ' · ' + esc(ui.thanks) + ' ' + esc(ui.credit) + '</p>';
    s += '</div></footer>';
    return s;
  }

  /* ============ 组装与绑定 ============ */
  function killAnims() {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.getAll().forEach(function (t) { t.kill(); });
      gsap.killTweensOf('*');
    }
  }

  function bind(D) {
    var langBtn = document.getElementById('langBtn');
    if (langBtn) langBtn.addEventListener('click', function () {
      lang = (lang === 'zh') ? 'en' : 'zh';
      render();
    });
    var printBtn = document.getElementById('printBtn');
    if (printBtn) printBtn.addEventListener('click', function () { window.print(); });
    /* 图片 404 兜底：纯色块，不破版 */
    document.querySelectorAll('.hero-card, .footer-avatar').forEach(function (img) {
      img.addEventListener('error', function () { img.onerror = null; img.src = SOLID; });
    });
    var bg = document.querySelector('.hero-bg');
    if (bg) bg.addEventListener('error', function () { bg.onerror = null; bg.style.display = 'none'; });
  }

  /* ============ GSAP 动效层（失败则内容完整可见） ============ */
  function initAnims() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', function () {
      /* 签名动作：封面人像卡片升起 + 模糊背景缓慢漂移 */
      gsap.from('.hero-card', { y: 44, autoAlpha: 0, duration: 1.1, ease: 'power3.out', delay: 0.15 });
      gsap.from('.hero-text > *', { y: 24, autoAlpha: 0, duration: 0.8, stagger: 0.09, ease: 'power2.out', delay: 0.05 });
      gsap.to('.hero-bg', { scale: 1.08, duration: 24, ease: 'sine.inOut', yoyo: true, repeat: -1 });

      /* 技能图标悬浮（3–5px，2–4s，错开相位；幅度 < 网格间距 22px，保证不重合） */
      gsap.utils.toArray('.skill-badge').forEach(function (el, i) {
        gsap.to(el, {
          y: -(3 + (i % 3) * 1),
          duration: 1.8 + (i % 4) * 0.5,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: (i % 5) * 0.25
        });
      });

      /* 各 section 入场：标题先行，内容 60–90ms 级联（技能徽章位移 12px < 网格间距，入场不重合） */
      var SEL = {
        history: { head: '.history .sec-head', items: '.stat, .tl-item, .eh-card', itemY: 24 },
        skills: { head: '.skills .sec-head', items: '.skill-badge', itemY: 12 },
        projects: { head: '.projects .sec-head', items: '.proj-feature, .proj', itemY: 24 }
      };
      Object.keys(SEL).forEach(function (key) {
        var sec = document.querySelector('.' + key);
        if (!sec) return;
        var head = sec.querySelector(SEL[key].head);
        var items = sec.querySelectorAll(SEL[key].items);
        var tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: 'top 82%', once: true } });
        if (head) tl.from(head, { y: 20, autoAlpha: 0, duration: 0.55, ease: 'power2.out' });
        if (items.length) tl.from(items, { y: SEL[key].itemY, autoAlpha: 0, duration: 0.55, stagger: 0.07, ease: 'power2.out' }, head ? '-=0.25' : 0);
      });

      /* 页脚入场 */
      gsap.from('.footer-main > *', { y: 20, autoAlpha: 0, duration: 0.6, stagger: 0.08, ease: 'power2.out', scrollTrigger: { trigger: '.footer', start: 'top 88%', once: true } });

      /* 控件按压反馈 */
      gsap.utils.toArray('.btn, .tb-ver, .lang-btn, .pf-link, .proj-link, .fc-links a').forEach(function (el) {
        el.addEventListener('pointerdown', function () { gsap.to(el, { scale: 0.97, duration: 0.1, ease: 'power1.out' }); });
        ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) {
          el.addEventListener(ev, function () { gsap.to(el, { scale: 1, duration: 0.18, ease: 'power2.out' }); });
        });
      });
    });
  }

  function render() {
    killAnims();
    var D = dataFor();
    document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN';
    document.title = D.base.name + (lang === 'en' ? ' - Resume' : ' - 个人简历');
    app.innerHTML = topbar(D) + hero(D) + '<main>' + history(D) + skills(D) + projects(D) + '</main>' + footer(D);
    bind(D);
    initAnims();
  }

  render();
})();
