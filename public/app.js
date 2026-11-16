/* 简历渲染器 · 暖色 8 区编号式 + 中英双语 + GSAP 动效层（v1.3.0）
   数据由服务端注入（在线）或内联（导出的独立 HTML）。
   本页面向查看者，不包含任何指向管理后台的入口。
   板块结构：Hero → 00/ABOUT → 01/EXPERIENCE → 02/PROJECTS → 03/SKILLS
            → 04/EDUCATION & HONORS → 05/OFF DUTY → Footer
   占位图全部内联 SVG（零外部请求）；关键数据压图做视觉锤。 */
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
      print: '打印 / 存为 PDF',
      printTip: '选择横版或竖版，在打印对话框中选择「另存为 PDF」即可下载。',
      printDlgTitle: '选择打印版式',
      printDlgSub: '页面支持三端展示，请选择 PDF 版式：',
      printPortrait: '竖版',
      printPortraitDesc: 'A4 竖版 · 单列紧凑',
      printLandscape: '横版',
      printLandscapeDesc: 'A4 横版 · 双列宽版',
      printDlgHint1: '选择后打开系统打印对话框，在「目标打印机」中选择「',
      printDlgHintKey: '另存为 PDF',
      printDlgHint2: '」即可下载 PDF 文件。',
      printDlgClose: '关闭',
      /* Hero 增强 */
      helloBadge: 'HELLO / 你好',
      openToWork: '开放求职',
      nowLabel: 'NOW',
      /* C27 自动隐藏导航栏 */
      navBrand: '简历',
      navMenuLabel: '菜单',
      navItems: [
        { label: '关于我', href: '#about' },
        { label: '工作经历', href: '#experience' },
        { label: '个人作品', href: '#projects' },
        { label: '技能档案', href: '#skills' },
        { label: '教育与荣誉', href: '#edu-honors' },
        { label: '兴趣爱好', href: '#off-duty' },
        { label: '联系我', href: '#contact' }
      ],
      /* 8 区编号头部（英文眉标固定，中文大标题+副标题随语言） */
      secAbout: '关于我',
      secAboutNote: '从核心系统到 AI 落地，每一步都有据可查。',
      secExperience: '工作经历',
      secExperienceNote: '9 年三星 IT 研发 · 3 个核心项目持续迭代。',
      secProjects: '个人作品',
      secProjectsNote: '3 个独立完整项目，从 AI 助手到实时协作。',
      secSkills: '技能档案',
      secSkillsNote: '5 个方向 · 16 项技能，分组呈现。',
      secEdu: '教育与荣誉',
      secEduNote: '学历与认证，AWS 认证只出现一次。',
      secOffDuty: '兴趣爱好',
      secOffDutyNote: '工作之外，也在认真生活。占位内容，后续可替换。',
      edu: '教育背景',
      honors: '荣誉与认证',
      footerOpen: '开放',
      footerRelated: '相关岗位，',
      footerCityFirst: '优先，远程亦可。',
      howContact: '如何联系我？',
      wechat: '微信',
      thanks: '感谢阅读。',
      credit: '插画：原创卡通人像 + 内联 SVG 占位。',
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
      ],
      /* 工作经历数据压图 metric（按项目索引） */
      expMetrics: ['4.5年', '1400h', '9年'],
      expMetricLabels: ['RMS 持续迭代', 'RPA 年替代人工', 'ERP 实施年限'],
      /* 个人作品数据压图 metric（按 project id） */
      projMetrics: { baobao: '2150+', 'aipro-bridge': '3 API', deskshare: 'CRDT' },
      projMetricLabels: { baobao: '科技文章聚合', 'aipro-bridge': '格式互转', deskshare: '实时协同算法' },
      /* 兴趣爱好占位（版本无关，不入 resume.json） */
      interests: [
        { tag: 'CODE & TINKER', title: '技术折腾', desc: '业余独立开发 3 个完整项目，保持对 AI 领域的持续探索。', hint: '后续可替换 / 增加图片 /' },
        { tag: 'READ & THINK', title: '阅读思考', desc: '关注 AI、系统工程与效率工具，把阅读转化为实践。', hint: '后续可替换 / 增加图片 /' },
        { tag: 'MOVE & TRAIN', title: '运动健身', desc: '规律训练保持能量，长期主义也适用于身体。', hint: '后续可替换 / 增加图片 /' }
      ]
    },
    en: {
      print: 'Print / Save as PDF',
      printTip: 'Pick portrait or landscape, then choose "Save as PDF" in the print dialog.',
      printDlgTitle: 'Choose print layout',
      printDlgSub: 'The page adapts to 3 device widths — pick a PDF layout:',
      printPortrait: 'Portrait',
      printPortraitDesc: 'A4 portrait · compact single column',
      printLandscape: 'Landscape',
      printLandscapeDesc: 'A4 landscape · wide two columns',
      printDlgHint1: 'After choosing, the print dialog opens. Under "Destination", select "',
      printDlgHintKey: 'Save as PDF',
      printDlgHint2: '" to download the PDF file.',
      printDlgClose: 'Close',
      helloBadge: 'HELLO',
      openToWork: 'OPEN TO WORK',
      nowLabel: 'NOW',
      navBrand: 'Resume',
      navMenuLabel: 'Menu',
      navItems: [
        { label: 'About', href: '#about' },
        { label: 'Experience', href: '#experience' },
        { label: 'Projects', href: '#projects' },
        { label: 'Skills', href: '#skills' },
        { label: 'Education', href: '#edu-honors' },
        { label: 'Off Duty', href: '#off-duty' },
        { label: 'Contact', href: '#contact' }
      ],
      secAbout: 'About Me',
      secAboutNote: 'From core systems to AI in production — every step verifiable.',
      secExperience: 'Experience',
      secExperienceNote: '9 years of Samsung IT R&D · 3 core projects, continuously iterated.',
      secProjects: 'Projects',
      secProjectsNote: 'Three complete solo projects, from AI assistant to real-time collaboration.',
      secSkills: 'Skill Archive',
      secSkillsNote: '5 directions · 16 skills, grouped.',
      secEdu: 'Education & Honors',
      secEduNote: 'Degree and certifications; AWS cert appears once.',
      secOffDuty: 'Off Duty',
      secOffDutyNote: 'Life beyond work. Placeholder content — replaceable later.',
      edu: 'Education',
      honors: 'Honors & Certifications',
      footerOpen: 'Open to',
      footerRelated: 'roles. ',
      footerCityFirst: ' preferred, remote OK.',
      howContact: 'How to reach me?',
      wechat: 'WeChat',
      thanks: 'Thanks for reading.',
      credit: 'Illustration: original cartoon portrait + inline SVG placeholders.',
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
      ],
      expMetrics: ['4.5 yrs', '1,400h', '9 yrs'],
      expMetricLabels: ['RMS continuous iteration', 'RPA hours saved / year', 'ERP delivery years'],
      projMetrics: { baobao: '2,150+', 'aipro-bridge': '3 APIs', deskshare: 'CRDT' },
      projMetricLabels: { baobao: 'tech articles aggregated', 'aipro-bridge': 'format interconvert', deskshare: 'real-time collab algo' },
      interests: [
        { tag: 'CODE & TINKER', title: 'Tech Tinkering', desc: 'Three complete solo projects in spare time, exploring AI continuously.', hint: 'replaceable / add images later /' },
        { tag: 'READ & THINK', title: 'Reading & Thinking', desc: 'Follow AI, systems and productivity tools; turn reading into practice.', hint: 'replaceable / add images later /' },
        { tag: 'MOVE & TRAIN', title: 'Fitness', desc: 'Regular training keeps energy up; long-termism applies to the body too.', hint: 'replaceable / add images later /' }
      ]
    }
  };

  var VER_SHORT = { ai: 'AI', it: 'IT', test: '测试', erp: 'ERP' };
  var VER_SHORT_EN = { ai: 'AI', it: 'IT', test: 'Test', erp: 'ERP' };
  /* NOW 状态卡按版本切换 */
  var NOW_TAG = {
    zh: { ai: 'AI 落地', it: '系统稳定', test: '质量保障', erp: 'ERP 交付' },
    en: { ai: 'AI in prod', it: 'System stable', test: 'QA driven', erp: 'ERP delivery' }
  };

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }

  /* en 字段缺失时回退中文值（C12 失败行为） */
  function fb(en, zh) {
    if (en === undefined || en === null) return zh;
    if (typeof en === 'string' && en.trim() === '') return zh;
    if (Array.isArray(en) && en.length === 0) return zh;
    return en;
  }

  /* 按当前语言取数据源 */
  /* 按当前语言取数据源（ver 兜底空对象，防数据缺失时整页白屏） */
  function dataFor() {
    var ui = UI[lang];
    var e = (lang === 'en') ? R.en : null;
    if (!e || !e.base) { return { base: R.base || {}, ver: R.version || {}, ui: ui }; }
    var ver = (e.versions && e.versions[R.versionKey]) || null;
    return {
      base: e.base,
      ver: ver || R.version || {},
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
    'chat': '<path d="M4 6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H9l-5 4V6z"/><path d="M9 8.5h6M9 12h4"/>',
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

  /* ============ 内联 SVG 主题插画占位（C25 · 暖色 · 按模块主题）============
     统一暖色调：accent-soft 底 + accent-ink 描边/线条 + accent 点缀。
     返回完整 <svg> 字符串，铺满封面容器（viewBox + preserveAspectRatio）。 */
  function svgArt(theme) {
    /* 公共暖色（与 style.css :root token 对齐） */
    var SOFT = '#f7e7cd', INK = '#9a5518', ACC = '#e08a3c', DEEP = '#c26e24', CREAM = '#fffdf8';
    var arts = {
      /* 工作经历：RMS 服务器/代码栈 */
      rms: '<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="RMS 服务器与代码插画占位">'
        + '<rect width="400" height="300" fill="' + SOFT + '"/>'
        + '<g stroke="' + INK + '" stroke-width="2" fill="none" stroke-linecap="round">'
        + '<rect x="70" y="70" width="120" height="160" rx="10" fill="' + CREAM + '"/>'
        + '<rect x="90" y="90" width="80" height="14" rx="4" fill="' + SOFT + '"/>'
        + '<rect x="90" y="112" width="80" height="14" rx="4" fill="' + SOFT + '"/>'
        + '<rect x="90" y="134" width="50" height="14" rx="4" fill="' + SOFT + '"/>'
        + '<circle cx="100" cy="200" r="6" fill="' + ACC + '" stroke="none"/>'
        + '<circle cx="120" cy="200" r="6" fill="' + SOFT + '" stroke="' + INK + '"/>'
        + '<path d="M210 80l40 0M210 100l60 0M210 120l50 0M210 140l60 0M210 160l40 0M210 180l55 0M210 200l45 0" stroke="' + INK + '"/>'
        + '<path d="M250 60l20 20-20 20" stroke="' + DEEP + '" stroke-width="2.5"/>'
        + '</g></svg>',
      /* 工作经历：RPA 机器人/齿轮 */
      rpa: '<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="RPA 机器人与齿轮插画占位">'
        + '<rect width="400" height="300" fill="' + SOFT + '"/>'
        + '<g stroke="' + INK + '" stroke-width="2" fill="none" stroke-linecap="round">'
        + '<circle cx="200" cy="150" r="70" fill="' + CREAM + '"/>'
        + '<circle cx="200" cy="150" r="26" fill="' + SOFT + '"/>'
        + '<g>' + Array.from({length:8}, function(_,i){var a=i*Math.PI/4;return '<line x1="'+(200+Math.cos(a)*30)+'" y1="'+(150+Math.sin(a)*30)+'" x2="'+(200+Math.cos(a)*46)+'" y2="'+(150+Math.sin(a)*46)+'"/>';}).join('') + '</g>'
        + '<circle cx="120" cy="90" r="22" fill="' + SOFT + '"/>'
        + '<circle cx="120" cy="90" r="8" fill="' + ACC + '" stroke="none"/>'
        + '<rect x="250" y="180" width="70" height="50" rx="8" fill="' + CREAM + '"/>'
        + '<path d="M265 195h40M265 210h30" stroke="' + INK + '"/>'
        + '<circle cx="285" cy="225" r="4" fill="' + ACC + '" stroke="none"/>'
        + '</g></svg>',
      /* 工作经历：ERP 网格/报表 */
      erp: '<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ERP 网格与报表插画占位">'
        + '<rect width="400" height="300" fill="' + SOFT + '"/>'
        + '<g stroke="' + INK + '" stroke-width="2" fill="none" stroke-linecap="round">'
        + '<rect x="80" y="60" width="240" height="180" rx="10" fill="' + CREAM + '"/>'
        + '<path d="M80 100h240M80 140h240M80 180h240" stroke="' + SOFT + '"/>'
        + '<path d="M80 100v140M160 60v180M240 60v180" stroke="' + SOFT + '"/>'
        + '<rect x="100" y="112" width="44" height="16" rx="3" fill="' + ACC + '" stroke="none"/>'
        + '<rect x="180" y="152" width="44" height="16" rx="3" fill="' + SOFT + '" stroke="' + INK + '"/>'
        + '<rect x="260" y="192" width="44" height="16" rx="3" fill="' + DEEP + '" stroke="none"/>'
        + '<path d="M120 240l30-30 30 20 40-50" stroke="' + DEEP + '" stroke-width="2.5"/>'
        + '</g></svg>',
      /* 个人作品：豹豹助手 海豹/对话气泡 */
      baobao: '<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="豹豹助手 海豹与对话气泡插画占位">'
        + '<rect width="400" height="300" fill="' + SOFT + '"/>'
        + '<g stroke="' + INK + '" stroke-width="2" fill="none" stroke-linecap="round">'
        + '<path d="M150 220c-30 0-50-20-50-50s20-50 50-50 50 20 50 50-20 50-50 50z" fill="' + CREAM + '"/>'
        + '<path d="M100 220c-10 20-5 40 15 45 15-5 20-25 10-40" fill="' + CREAM + '"/>'
        + '<circle cx="140" cy="165" r="4" fill="' + INK + '" stroke="none"/>'
        + '<circle cx="165" cy="165" r="4" fill="' + INK + '" stroke="none"/>'
        + '<path d="M138 185c8 6 16 6 24 0" stroke="' + INK + '"/>'
        + '<path d="M250 80h60a20 20 0 0 1 20 20v30a20 20 0 0 1-20 20h-20l-15 18 3-18h-28a20 20 0 0 1-20-20v-30a20 20 0 0 1 20-20z" fill="' + CREAM + '"/>'
        + '<path d="M262 105h36M262 120h24" stroke="' + ACC + '" stroke-width="2.5"/>'
        + '</g></svg>',
      /* 个人作品：AiPro Bridge API 桥接/插头 */
      'aipro-bridge': '<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="AiPro Bridge API 桥接插画占位">'
        + '<rect width="400" height="300" fill="' + SOFT + '"/>'
        + '<g stroke="' + INK + '" stroke-width="2" fill="none" stroke-linecap="round">'
        + '<rect x="60" y="110" width="90" height="80" rx="10" fill="' + CREAM + '"/>'
        + '<path d="M80 130h50M80 150h40M80 170h30" stroke="' + INK + '"/>'
        + '<rect x="250" y="110" width="90" height="80" rx="10" fill="' + CREAM + '"/>'
        + '<path d="M270 130h50M270 150h40M270 170h30" stroke="' + INK + '"/>'
        + '<path d="M150 150h100" stroke="' + DEEP + '" stroke-width="3"/>'
        + '<path d="M240 142l16 8-16 8" stroke="' + DEEP + '" stroke-width="3"/>'
        + '<circle cx="200" cy="150" r="8" fill="' + ACC + '" stroke="none"/>'
        + '</g></svg>',
      /* 个人作品：Deskshare 协作文档/光标 */
      deskshare: '<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Deskshare 协作文档插画占位">'
        + '<rect width="400" height="300" fill="' + SOFT + '"/>'
        + '<g stroke="' + INK + '" stroke-width="2" fill="none" stroke-linecap="round">'
        + '<rect x="90" y="60" width="150" height="180" rx="10" fill="' + CREAM + '"/>'
        + '<path d="M110 90h110M110 115h90M110 140h110M110 165h70" stroke="' + SOFT + '"/>'
        + '<rect x="180" y="120" width="130" height="150" rx="10" fill="' + CREAM + '" opacity="0.96"/>'
        + '<path d="M200 150h90M200 175h70M200 200h90M200 225h50" stroke="' + SOFT + '"/>'
        + '<path d="M250 180l8 4-3 14 14-3 4 8-14 3 3 14-8-4 3-14-14 3z" fill="' + ACC + '" stroke="' + INK + '"/>'
        + '</g></svg>',
      /* 教育：校园 */
      campus: '<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="校园插画占位">'
        + '<rect width="400" height="300" fill="' + SOFT + '"/>'
        + '<g stroke="' + INK + '" stroke-width="2" fill="none" stroke-linecap="round">'
        + '<path d="M200 70l90 50v10h-180v-10z" fill="' + CREAM + '"/>'
        + '<path d="M140 130v70M260 130v70M120 200h160" stroke="' + INK + '"/>'
        + '<rect x="170" y="150" width="60" height="50" rx="4" fill="' + SOFT + '"/>'
        + '<path d="M200 150v50M170 175h60" stroke="' + INK + '"/>'
        + '<circle cx="200" cy="95" r="6" fill="' + ACC + '" stroke="none"/>'
        + '<path d="M80 230h240M60 250h280" stroke="' + SOFT + '"/>'
        + '</g></svg>',
      /* 兴趣爱好：技术折腾 */
      interest0: '<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="技术折腾插画占位">'
        + '<rect width="400" height="300" fill="' + SOFT + '"/>'
        + '<g stroke="' + INK + '" stroke-width="2" fill="none" stroke-linecap="round">'
        + '<rect x="120" y="80" width="160" height="110" rx="10" fill="' + CREAM + '"/>'
        + '<path d="M140 105h120M140 125h90M140 145h110M140 165h70" stroke="' + SOFT + '"/>'
        + '<path d="M200 190v40M180 230h40" stroke="' + INK + '"/>'
        + '<path d="M260 60l10 10-10 10M280 60l10 10-10 10" stroke="' + ACC + '" stroke-width="2.5"/>'
        + '</g></svg>',
      /* 兴趣爱好：阅读思考 */
      interest1: '<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="阅读思考插画占位">'
        + '<rect width="400" height="300" fill="' + SOFT + '"/>'
        + '<g stroke="' + INK + '" stroke-width="2" fill="none" stroke-linecap="round">'
        + '<path d="M120 90h80v130h-80zM280 90h-80v130h80z" fill="' + CREAM + '"/>'
        + '<path d="M200 90c-20-10-60-10-80 0M200 90c20-10 60-10 80 0" stroke="' + INK + '"/>'
        + '<path d="M140 120h50M140 140h50M140 160h40M210 120h50M210 140h50M210 160h40" stroke="' + SOFT + '"/>'
        + '<circle cx="200" cy="70" r="10" fill="' + ACC + '" stroke="none"/>'
        + '</g></svg>',
      /* 兴趣爱好：运动健身 */
      interest2: '<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="运动健身插画占位">'
        + '<rect width="400" height="300" fill="' + SOFT + '"/>'
        + '<g stroke="' + INK + '" stroke-width="2" fill="none" stroke-linecap="round">'
        + '<circle cx="200" cy="150" r="60" fill="' + CREAM + '"/>'
        + '<path d="M200 110v80M160 150h80" stroke="' + INK + '"/>'
        + '<path d="M170 130a40 40 0 0 1 60 0M170 170a40 40 0 0 0 60 0" stroke="' + SOFT + '"/>'
        + '<circle cx="200" cy="150" r="6" fill="' + ACC + '" stroke="none"/>'
        + '<path d="M120 90l20 20M280 90l-20 20M120 210l20-20M280 210l-20-20" stroke="' + DEEP + '" stroke-width="2.5"/>'
        + '</g></svg>'
    };
    return arts[theme] || arts.rms;
  }

  /* ============ C27 自动隐藏悬浮导航栏（胶囊形 · 鼠标靠近顶部出现 · 离开 2 秒隐藏 · 丝滑上下动画）============ */
  function navBar(D) {
    var ui = D.ui;
    var brandInitial = (lang === 'en') ? 'Z' : '赵';
    var s = '<header class="navbar" id="navbar" data-state="hidden">';
    s += '<div class="nav-inner">';
    /* 左：Logo + 字标 */
    s += '<a class="nav-brand" href="#hero" aria-label="' + esc(D.base.name) + '">';
    s += '<span class="nav-logo">' + esc(brandInitial) + '</span>';
    s += '<span class="nav-brand-text">' + esc(ui.navBrand) + '</span>';
    s += '</a>';
    /* 中：7 项锚点菜单 */
    s += '<nav class="nav-menu" aria-label="section navigation">';
    (ui.navItems || []).forEach(function (it) {
      s += '<a class="nav-link" href="' + esc(it.href) + '">' + esc(it.label) + '</a>';
    });
    s += '</nav>';
    /* 右：语言 + 打印 + 手机端汉堡按钮（C28：移除版本切换链接，版本管理仅限后台；C2：≤760px 汉堡菜单） */
    s += '<div class="nav-right">';
    s += '<button class="lang-btn" id="langBtn" aria-label="Switch language">' + esc(ui.langBtn) + '</button>';
    s += '<button class="nav-print" id="printBtn" title="' + esc(ui.printTip) + '" aria-label="' + esc(ui.print) + '">';
    s += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9V3h12v6"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="7" rx="1.5"/></svg>';
    s += '</button>';
    /* C2: 2 条杠汉堡按钮（苹果官网式，非 3 条杠） */
    s += '<button class="nav-burger" id="navBurger" aria-label="' + esc(ui.navMenuLabel || 'Menu') + '" aria-expanded="false">';
    s += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 9h16"/><path d="M4 15h16"/></svg>';
    s += '</button>';
    s += '</div></div></header>';
    /* 顶部感应区（隐形，监听鼠标进入触发显示） */
    s += '<div class="nav-sensor" id="navSensor" aria-hidden="true"></div>';
    /* C2: 手机端展开面板 + 遮罩（≤760px 由 CSS 激活，桌面端 display:none） */
    s += '<div class="nav-panel-overlay" id="navPanelOverlay" data-open="false" aria-hidden="true"></div>';
    s += '<nav class="nav-panel" id="navPanel" data-open="false" aria-label="' + esc(ui.navMenuLabel || 'Menu') + '">';
    (ui.navItems || []).forEach(function (it) {
      s += '<a class="nav-panel-link" href="' + esc(it.href) + '">' + esc(it.label) + '</a>';
    });
    s += '</nav>';
    return s;
  }

  /* ============ ① Hero 头图（增强：问候徽章 + 荧光笔划线职位 + 拱形人像 + 状态标签）============ */
  function hero(D) {
    var ui = D.ui;
    var summary = String(fb(D.ver.summary, D.zhVer && D.zhVer.summary) || '');
    var dotIdx = summary.indexOf(lang === 'en' ? '. ' : '。');
    var lead = dotIdx > -1 ? summary.slice(0, dotIdx + (lang === 'en' ? 1 : 1)) : summary;
    var chips = ui.chips[R.versionKey] || ui.chips.ai;
    var alt = (lang === 'en' ? 'Cartoon portrait of ' : '卡通人像：') + esc(D.base.name) + (lang === 'en' ? ' — round glasses, light blue shirt, warm background' : '，圆框黑眼镜、浅蓝衬衫、暖色背景');
    var nowTag = (NOW_TAG[lang] || NOW_TAG.zh)[R.versionKey] || '';

    var s = '<section class="hero" id="hero">';
    s += '<img class="hero-bg" src="/img/portrait-cartoon.jpg" alt="" aria-hidden="true">';
    s += '<div class="hero-veil"></div>';
    s += '<div class="hero-inner">';
    s += '<div class="hero-text">';
    s += '<span class="hero-hello"><span class="hero-hello-dot"></span>' + esc(ui.helloBadge) + '</span>';
    s += '<h1 class="hero-name">' + esc(D.base.name) + '</h1>';
    s += '<p class="hero-title"><span class="hero-title-mark">' + esc(D.ver.title) + '</span></p>';
    s += '<p class="hero-lead">' + esc(lead) + '</p>';
    s += '<div class="hero-chips">';
    chips.forEach(function (c) { s += '<span class="chip">' + esc(c) + '</span>'; });
    s += '</div>';
    s += '<div class="hero-actions">';
    s += '<button class="btn ghost" id="printBtn" title="' + esc(ui.printTip) + '">' + esc(ui.print) + '</button>';
    s += '</div></div>';
    s += '<div class="hero-portrait">';
    s += '<span class="hero-open">' + esc(ui.openToWork) + '</span>';
    s += '<img class="hero-card" src="/img/portrait-cartoon.jpg" alt="' + alt + '">';
    s += '<span class="hero-now"><strong>' + esc(ui.nowLabel) + '</strong>' + esc(nowTag) + '</span>';
    s += '</div></div></section>';
    return s;
  }

  /* ============ 统一编号头部（00 / LABEL · 大标题 · 副标题）============ */
  function secHead(num, label, title, note) {
    var s = '<div class="sec-head-wrap">';
    s += '<span class="sec-eyebrow">' + esc(num) + ' / ' + esc(label) + '</span>';
    s += '<h2 class="sec-head">' + esc(title) + '</h2>';
    s += '<p class="sec-note">' + esc(note) + '</p>';
    s += '</div>';
    return s;
  }

  /* ============ ② 00 / ABOUT 关于我（特质气泡，复用 advantages）============ */
  function about(D) {
    var ui = D.ui;
    var advs = D.ver.advantages || (D.zhVer && D.zhVer.advantages) || [];
    if (!advs.length) return '';
    var s = '<section class="about" id="about">';
    s += secHead('00', 'ABOUT', ui.secAbout, ui.secAboutNote);
    s += '<div class="about-wrap">';
    s += '<div class="about-center">' + svgArt('rms') + '</div>';
    s += '<div class="about-bubbles">';
    advs.forEach(function (a, i) {
      s += '<div class="bubble" style="--bi:' + i + '">';
      s += '<strong>' + esc(fb(a.title, '')) + '</strong>';
      s += '<span>' + esc(fb(a.text, '')) + '</span>';
      s += '</div>';
    });
    s += '</div></div></section>';
    return s;
  }

  /* ============ ③ 01 / EXPERIENCE 工作经历（镜像交错时间线卡 + 数据压图）============ */
  function experience(D) {
    var ui = D.ui;
    var base = D.base;
    var exp = base.experience || [];
    if (!exp.length) return '';
    /* 展平为项目列表（公司作为公共头展示一次） */
    var projs = [];
    exp.forEach(function (e) {
      (e.projects || []).forEach(function (p) {
        projs.push({ company: e.company, role: e.role, period: e.period, proj: p });
      });
    });
    var themes = ['rms', 'rpa', 'erp'];
    var metrics = ui.expMetrics || [];
    var metricLabels = ui.expMetricLabels || [];

    var s = '<section class="experience" id="experience">';
    s += secHead('01', 'EXPERIENCE', ui.secExperience, ui.secExperienceNote);
    if (exp[0]) s += '<p class="exp-company">' + esc(fb(exp[0].company, '')) + ' · ' + esc(fb(exp[0].role, '')) + ' · ' + esc(fb(exp[0].period, '')) + '</p>';
    s += '<div class="exp-timeline">';
    projs.forEach(function (item, i) {
      var mirror = i % 2 === 0 ? '' : ' mirror';
      var theme = themes[i] || 'rms';
      var metric = metrics[i] || '';
      var metricLabel = metricLabels[i] || '';
      s += '<div class="exp-item' + mirror + '">';
      s += '<span class="exp-node">' + esc(String(i + 1).padStart(2, '0')) + '</span>';
      s += '<div class="exp-cover">';
      s += svgArt(theme);
      if (metric) s += '<span class="exp-metric">' + esc(metric) + '</span><span class="exp-metric-label">' + esc(metricLabel) + '</span>';
      s += '</div>';
      s += '<div class="exp-info">';
      s += '<span class="exp-period">' + esc(fb(item.proj.period, '')) + '</span>';
      s += '<h3>' + esc(fb(item.proj.title, '')) + ' <span class="exp-role">' + esc(fb(item.role, '')) + '</span></h3>';
      var firstItem = (item.proj.items || [])[0] || {};
      s += '<p class="exp-desc">' + esc(fb(firstItem.text, '')) + '</p>';
      s += '<ul class="exp-results">';
      (item.proj.items || []).slice(1).forEach(function (it) {
        s += '<li><strong>' + esc(fb(it.label, '')) + '</strong>　' + esc(fb(it.text, '')) + '</li>';
      });
      s += '</ul>';
      s += '</div></div>';
    });
    s += '</div></section>';
    return s;
  }

  /* ============ ④ 02 / PROJECTS 个人作品（镜像交错卡 + 数据压图）============ */
  function projects(D) {
    var ui = D.ui;
    var base = D.base;
    var projs = base.projects || [];
    if (!projs.length) return '';
    var metrics = ui.projMetrics || {};
    var metricLabels = ui.projMetricLabels || {};

    var s = '<section class="projects" id="projects">';
    s += secHead('02', 'PROJECTS', ui.secProjects, ui.secProjectsNote);
    s += '<div class="proj-list">';
    projs.forEach(function (p, i) {
      var mirror = i % 2 === 0 ? '' : ' mirror';
      var metric = metrics[p.id] || '';
      var metricLabel = metricLabels[p.id] || '';
      var featured = (p.id === D.ver.featuredProject) ? ' featured' : '';
      s += '<div class="proj-item' + mirror + featured + '">';
      s += '<div class="proj-cover">';
      s += svgArt(p.id);
      if (metric) s += '<span class="proj-metric">' + esc(metric) + '</span><span class="proj-metric-label">' + esc(metricLabel) + '</span>';
      s += '</div>';
      s += '<div class="proj-info">';
      s += '<span class="proj-badge">' + esc(fb(p.badge, lang === 'en' ? 'Solo-built' : '独立开发')) + '</span>';
      s += '<h3>' + esc(fb(p.title, '')) + '</h3>';
      if (p.link && typeof p.link === 'string' && /^https?:\/\//i.test(p.link)) s += '<a class="proj-link" href="' + esc(p.link) + '" target="_blank" rel="noopener noreferrer">' + esc(p.link.replace(/^https?:\/\//, '')) + ' →</a>';
      s += '<p class="proj-desc">' + esc(fb(p.desc, '')) + '</p>';
      s += '<ul class="proj-items">';
      (p.items || []).forEach(function (it, idx) {
        var ico = (p.id === 'baobao') ? (FEATURE_ICONS[idx] || 'chat') : '';
        s += '<li>' + (ico ? icon(ico, 'proj-ico') : '<span class="proj-dot"></span>') + '<span>' + esc(it) + '</span></li>';
      });
      s += '</ul>';
      s += '<div class="proj-stack">' + (p.stack || []).map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('') + '</div>';
      s += '</div></div>';
    });
    s += '</div></section>';
    return s;
  }

  /* ============ ⑤ 03 / SKILLS 技能档案（5 组分组卡片化）============ */
  function skills(D) {
    var ui = D.ui;
    var base = D.base;
    var groups = base.skills || {};
    var keys = Object.keys(groups);
    if (!keys.length) return '';
    var s = '<section class="skills" id="skills">';
    s += secHead('03', 'SKILLS', ui.secSkills, ui.secSkillsNote);
    s += '<div class="skill-cards">';
    keys.forEach(function (group) {
      var items = groups[group] || [];
      if (!items.length) return;
      s += '<div class="skill-card">';
      s += '<h3 class="skill-group">' + esc(group) + '</h3>';
      s += '<div class="skill-badges">';
      items.forEach(function (name) {
        s += '<div class="skill-badge" data-group="' + esc(group) + '">';
        s += '<span class="skill-icon">' + icon(name) + '</span>';
        s += '<span class="skill-name">' + esc(name) + '</span>';
        s += '</div>';
      });
      s += '</div></div>';
    });
    s += '</div></section>';
    return s;
  }

  /* ============ ⑥ 04 / EDUCATION & HONORS 教育与荣誉（独立卡片 + 占位照 + 校徽）============ */
  function eduHonors(D) {
    var ui = D.ui;
    var base = D.base;
    var edu = base.education || [];
    var honors = base.honors || [];
    var certs = base.certs || [];
    if (!edu.length && !honors.length && !certs.length) return '';
    var s = '<section class="edu-honors" id="edu-honors">';
    s += secHead('04', 'EDUCATION & HONORS', ui.secEdu, ui.secEduNote);
    s += '<div class="eh-grid">';
    /* 教育卡 */
    s += '<div class="eh-card eh-edu">';
    s += '<div class="eh-edu-img">' + svgArt('campus') + '<span class="eh-badge">DLMU</span></div>';
    s += '<div class="eh-edu-text"><h3>' + esc(ui.edu) + '</h3>';
    edu.forEach(function (e) {
      s += '<div class="eh-row"><strong>' + esc(e.school) + '</strong><span>' + esc(e.period) + '</span></div>';
      s += '<p>' + esc(e.detail) + '</p>';
    });
    s += '</div></div>';
    /* 荣誉卡 */
    s += '<div class="eh-card eh-honors"><h3>' + esc(ui.honors) + '</h3><ul>';
    honors.forEach(function (h) { s += '<li>' + esc(h) + '</li>'; });
    certs.forEach(function (c) { s += '<li>' + esc(c) + '</li>'; });
    s += '</ul></div>';
    s += '</div></section>';
    return s;
  }

  /* ============ ⑦ 05 / OFF DUTY 兴趣爱好（占位交替卡）============ */
  function offDuty(D) {
    var ui = D.ui;
    var interests = ui.interests || [];
    if (!interests.length) return '';
    var s = '<section class="off-duty" id="off-duty">';
    s += secHead('05', 'OFF DUTY', ui.secOffDuty, ui.secOffDutyNote);
    s += '<div class="od-list">';
    interests.forEach(function (it, i) {
      var mirror = i % 2 === 0 ? '' : ' mirror';
      var theme = 'interest' + i;
      s += '<div class="od-item' + mirror + '">';
      s += '<div class="od-cover">' + svgArt(theme) + '<span class="od-num">' + esc(String(i + 1).padStart(2, '0')) + '</span></div>';
      s += '<div class="od-text">';
      s += '<span class="od-tag">' + esc(it.tag) + '</span>';
      s += '<h3>' + esc(it.title) + '</h3>';
      s += '<p>' + esc(it.desc) + '</p>';
      s += '<span class="od-hint">' + esc(it.hint) + '</span>';
      s += '</div></div>';
    });
    s += '</div></section>';
    return s;
  }

  /* ============ ⑧ 结尾页脚 ============ */
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

  /* ============ 打印版式对话框（C13：横版/竖版选择 + 另存为 PDF 指引） ============ */
  function printDialog(D) {
    var ui = D.ui;
    var s = '<div class="print-dialog" id="printDialog" hidden>';
    s += '<div class="pd-overlay" data-pd-close></div>';
    s += '<div class="pd-card" role="dialog" aria-modal="true" aria-label="' + esc(ui.printDlgTitle) + '">';
    s += '<button class="pd-close" type="button" data-pd-close aria-label="' + esc(ui.printDlgClose) + '">&times;</button>';
    s += '<h3 class="pd-title">' + esc(ui.printDlgTitle) + '</h3>';
    s += '<p class="pd-sub">' + esc(ui.printDlgSub) + '</p>';
    s += '<div class="pd-options">';
    s += '<button class="pd-opt" type="button" data-orient="portrait">';
    s += '<svg class="pd-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="3.5" width="12" height="17" rx="2"/><path d="M9 7.5h6M9 10.5h6M9 13.5h4"/></svg>';
    s += '<span class="pd-opt-name">' + esc(ui.printPortrait) + '</span>';
    s += '<span class="pd-opt-desc">' + esc(ui.printPortraitDesc) + '</span>';
    s += '</button>';
    s += '<button class="pd-opt" type="button" data-orient="landscape">';
    s += '<svg class="pd-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="6" width="17" height="12" rx="2"/><path d="M7 9.5h6M7 12.5h4"/></svg>';
    s += '<span class="pd-opt-name">' + esc(ui.printLandscape) + '</span>';
    s += '<span class="pd-opt-desc">' + esc(ui.printLandscapeDesc) + '</span>';
    s += '</button>';
    s += '</div>';
    s += '<p class="pd-hint">' + esc(ui.printDlgHint1) + '<strong>' + esc(ui.printDlgHintKey) + '</strong>' + esc(ui.printDlgHint2) + '</p>';
    s += '</div></div>';
    return s;
  }

  function openPrintDialog() {
    var dialog = document.getElementById('printDialog');
    if (!dialog || !dialog.hidden) return; // 幂等：已打开不叠层
    dialog.hidden = false;
    document.body.classList.add('pd-open');
  }
  function closePrintDialog() {
    var dialog = document.getElementById('printDialog');
    if (!dialog || dialog.hidden) return;
    dialog.hidden = true;
    document.body.classList.remove('pd-open');
  }
  function choosePrintOrient(o) {
    closePrintDialog();
    /* 动态 @page：横竖版纸张方向（C15），打印结束 afterprint 清理 */
    var st = document.getElementById('print-orient-style');
    if (!st) {
      st = document.createElement('style');
      st.id = 'print-orient-style';
      document.head.appendChild(st);
    }
    st.textContent = '@page { size: A4 ' + o + '; margin: 16mm; }';
    document.documentElement.className = 'print-' + o;
    var cleanup = function () {
      document.documentElement.className = '';
      if (st) st.textContent = '';
    };
    window.addEventListener('afterprint', cleanup, { once: true });
    window.print();
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
    if (printBtn) printBtn.addEventListener('click', function () { openPrintDialog(); });
    var dialog = document.getElementById('printDialog');
    if (dialog) {
      dialog.querySelectorAll('[data-pd-close]').forEach(function (el) {
        el.addEventListener('click', function () { closePrintDialog(); });
      });
      dialog.querySelectorAll('.pd-opt').forEach(function (el) {
        el.addEventListener('click', function () { choosePrintOrient(el.getAttribute('data-orient')); });
      });
    }
    /* 图片 404 兜底：纯色块，不破版 */
    document.querySelectorAll('.hero-card, .footer-avatar').forEach(function (img) {
      img.addEventListener('error', function () { img.onerror = null; img.src = SOLID; });
    });
    var bg = document.querySelector('.hero-bg');
    if (bg) bg.addEventListener('error', function () { bg.onerror = null; bg.style.display = 'none'; });
    /* C27 自动隐藏导航栏：鼠标靠近顶部出现 · 离开 2 秒隐藏 · 首屏常驻 */
    initNavBar();
  }

  /* ============ C27 导航栏自动隐藏逻辑（纯 JS，不依赖 GSAP）============ */
  var navHideTimer = null;
  function showNavBar() {
    var nb = document.getElementById('navbar');
    if (!nb) return;
    if (navHideTimer) { clearTimeout(navHideTimer); navHideTimer = null; }
    nb.setAttribute('data-state', 'visible');
  }
  function hideNavBar() {
    var nb = document.getElementById('navbar');
    if (!nb) return;
    /* C2: 手机端汉堡面板展开时锁定导航栏常驻可见，不因 mouseleave/2 秒计时隐藏 */
    var panel = document.getElementById('navPanel');
    if (panel && panel.getAttribute('data-open') === 'true') return;
    if (navHideTimer) { clearTimeout(navHideTimer); navHideTimer = null; }
    navHideTimer = setTimeout(function () {
      nb.setAttribute('data-state', 'hidden');
      navHideTimer = null;
    }, 2000);
  }
  function initNavBar() {
    var nb = document.getElementById('navbar');
    var sensor = document.getElementById('navSensor');
    if (!nb) return;
    /* 首屏常驻：滚动在顶部时保持显示 */
    function atTop() { return (window.pageYOffset || document.documentElement.scrollTop) <= 100; }
    /* C5: 手机端滚动隐藏/停止显示 —— 记录上次滚动位置与方向 */
    var lastScrollY = window.pageYOffset || document.documentElement.scrollTop;
    var scrollTimer = null;
    var scrollHideActive = false; /* 下滑隐藏锁：防止惯性 scroll 的微小 delta 立即触发恢复 */
    function isMobile() { return window.innerWidth <= 760; }
    function syncNavState() {
      if (atTop()) { showNavBar(); scrollHideActive = false; return; }
      /* C5: 手机端滚动方向检测 —— 下滑隐藏、停止/上滑显示 */
      if (isMobile()) {
        var panel = document.getElementById('navPanel');
        /* 面板展开时不隐藏（C2 锁定优先） */
        if (panel && panel.getAttribute('data-open') === 'true') { showNavBar(); return; }
        var curY = window.pageYOffset || document.documentElement.scrollTop;
        var delta = curY - lastScrollY;
        lastScrollY = curY;
        if (delta > 6) {
          /* 明显下滑 → 立即隐藏，锁定恢复（滚动中持续隐藏）；设兜底恢复计时，确保滚动结束后能恢复 */
          nb.setAttribute('data-state', 'hidden');
          scrollHideActive = true;
          if (navHideTimer) { clearTimeout(navHideTimer); navHideTimer = null; }
          if (scrollTimer) clearTimeout(scrollTimer);
          scrollTimer = setTimeout(function () { scrollHideActive = false; showNavBar(); scrollTimer = null; }, 600);
        } else if (delta < -6) {
          /* 明显上滑 → 立即显示，解除锁定 */
          scrollHideActive = false;
          showNavBar();
          if (scrollTimer) { clearTimeout(scrollTimer); scrollTimer = null; }
        } else {
          /* 停止滚动（delta 极小）→ 仅在已隐藏且锁定时，等 600ms 确认真正停止后恢复显示 */
          if (scrollHideActive) {
            if (scrollTimer) clearTimeout(scrollTimer);
            scrollTimer = setTimeout(function () { scrollHideActive = false; showNavBar(); scrollTimer = null; }, 600);
          }
        }
      }
    }
    syncNavState();
    /* 鼠标进入顶部感应区 → 立即出现 */
    if (sensor) sensor.addEventListener('mouseenter', showNavBar);
    /* 鼠标进入导航栏 → 取消隐藏计时、保持显示 */
    nb.addEventListener('mouseenter', function () {
      if (navHideTimer) { clearTimeout(navHideTimer); navHideTimer = null; }
    });
    /* 鼠标离开导航栏 → 若不在顶部，启动 2 秒隐藏计时（桌面端行为） */
    nb.addEventListener('mouseleave', function () {
      if (!atTop() && !isMobile()) hideNavBar();
    });
    /* 鼠标离开感应区 → 若不在顶部，启动 2 秒隐藏计时（桌面端行为） */
    if (sensor) sensor.addEventListener('mouseleave', function () {
      if (!atTop() && !isMobile()) hideNavBar();
    });
    /* 滚动：到顶部立即显示；手机端方向检测；桌面端等鼠标离开再计时 */
    window.addEventListener('scroll', syncNavState, { passive: true });
    /* 点击导航项：平滑滚动（锚点默认行为 + smooth），跳转后保持显示 2 秒再隐藏 */
    nb.querySelectorAll('.nav-link, .nav-brand').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var href = a.getAttribute('href') || '';
        if (href.charAt(0) === '#' && href.length > 1) {
          var target = document.querySelector(href);
          if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            showNavBar();
            if (!atTop()) hideNavBar();
          }
        }
      });
    });

    /* ============ C2 手机端汉堡菜单：点击展开/收起 + 菜单项跳转后收起 ============ */
    var burger = document.getElementById('navBurger');
    var panel = document.getElementById('navPanel');
    var overlay = document.getElementById('navPanelOverlay');
    function openPanel() {
      if (!panel) return;
      panel.setAttribute('data-open', 'true');
      if (overlay) overlay.setAttribute('data-open', 'true');
      if (burger) { burger.setAttribute('aria-expanded', 'true'); }
      /* 展开时锁定导航栏常驻可见，避免 2 秒隐藏打断操作 */
      showNavBar();
    }
    function closePanel() {
      if (!panel) return;
      panel.setAttribute('data-open', 'false');
      if (overlay) overlay.setAttribute('data-open', 'false');
      if (burger) { burger.setAttribute('aria-expanded', 'false'); }
      if (!atTop()) hideNavBar();
    }
    function togglePanel() {
      if (!panel) return;
      if (panel.getAttribute('data-open') === 'true') { closePanel(); } else { openPanel(); }
    }
    if (burger) burger.addEventListener('click', function (e) { e.stopPropagation(); togglePanel(); });
    if (overlay) overlay.addEventListener('click', closePanel);
    /* 菜单项点击：复用平滑滚动跳转，跳转后收起面板 */
    if (panel) {
      panel.querySelectorAll('.nav-panel-link').forEach(function (a) {
        a.addEventListener('click', function (e) {
          var href = a.getAttribute('href') || '';
          if (href.charAt(0) === '#' && href.length > 1) {
            var target = document.querySelector(href);
            if (target) {
              e.preventDefault();
              target.scrollIntoView({ behavior: 'smooth', block: 'start' });
              closePanel();
              showNavBar();
              if (!atTop()) hideNavBar();
            }
          }
        });
      });
    }
    /* Esc 收起面板（复用已有 Esc 监听机制，此处单独绑定不冲突） */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel && panel.getAttribute('data-open') === 'true') closePanel();
    });
    /* 视口变宽到 >760px 时收起面板（避免横竖屏切换残留展开态） */
    window.addEventListener('resize', function () {
      if (window.innerWidth > 760 && panel && panel.getAttribute('data-open') === 'true') closePanel();
    });
  }

  /* ============ GSAP 动效层（失败则内容完整可见） ============ */
  function initAnims() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    /* C6: 只用 prefers-reduced-motion 作 matchMedia 条件（不用 min-width），
       避免 resize 跨断点时 matchMedia 重新执行 gsap.from 重置 opacity:0 导致空白。
       视口宽度在回调内用 JS 判断：≤1024px 跳过入场动画，内容直接可见。 */
    gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', function () {
      var isSmallViewport = window.innerWidth <= 1024;

      /* 签名动作：封面人像卡片升起 + 模糊背景缓慢漂移 + 增强元素入场（仅大屏） */
      if (!isSmallViewport) {
        gsap.from('.hero-card', { y: 44, autoAlpha: 0, duration: 1.1, ease: 'power3.out', delay: 0.15 });
        gsap.from('.hero-text > *', { y: 24, autoAlpha: 0, duration: 0.8, stagger: 0.09, ease: 'power2.out', delay: 0.05 });
        gsap.from('.hero-open, .hero-now', { autoAlpha: 0, scale: 0.85, duration: 0.6, stagger: 0.12, ease: 'back.out(1.6)', delay: 0.7 });
        gsap.to('.hero-bg', { scale: 1.08, duration: 24, ease: 'sine.inOut', yoyo: true, repeat: -1 });

        /* 技能图标悬浮（3–5px，2–4s，错开相位；幅度 < 网格间距，保证不重合） */
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

        /* 各 section 入场：标题先行，内容级联 */
        var SEL = {
          about: { head: '.about .sec-head', items: '.bubble', itemY: 24 },
          experience: { head: '.experience .sec-head', items: '.exp-item', itemY: 28 },
          projects: { head: '.projects .sec-head', items: '.proj-item', itemY: 28 },
          skills: { head: '.skills .sec-head', items: '.skill-card', itemY: 20 },
          'edu-honors': { head: '.edu-honors .sec-head', items: '.eh-card', itemY: 24 },
          'off-duty': { head: '.off-duty .sec-head', items: '.od-item', itemY: 28 }
        };
        Object.keys(SEL).forEach(function (key) {
          var sec = document.querySelector('.' + key);
          if (!sec) return;
          var head = sec.querySelector(SEL[key].head);
          var items = sec.querySelectorAll(SEL[key].items);
          /* immediateRender:false —— 初始态不在创建时写入，元素保持 CSS 默认可见；
             ScrollTrigger 触发时才设 opacity:0 并动画到 1。
             这样 resize 回桌面后元素默认可见，不会残留 opacity:0 空白。 */
          var tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: 'top 82%', once: true } });
          if (head) tl.fromTo(head, { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.55, ease: 'power2.out', immediateRender: false });
          if (items.length) tl.fromTo(items, { y: SEL[key].itemY, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.55, stagger: 0.07, ease: 'power2.out', immediateRender: false }, head ? '-=0.25' : 0);
        });

        /* 页脚入场 */
        gsap.fromTo('.footer-main > *', { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.08, ease: 'power2.out', immediateRender: false, scrollTrigger: { trigger: '.footer', start: 'top 88%', once: true } });
      }
      /* 中小视口（≤1024px）：不创建入场动画，内容直接可见，无 opacity:0 空白 */

      /* 控件按压反馈：所有视口都保留（轻量、无 opacity 初始态问题） */
      gsap.utils.toArray('.btn, .lang-btn, .nav-print, .nav-burger, .proj-link, .fc-links a').forEach(function (el) {
        el.addEventListener('pointerdown', function () { gsap.to(el, { scale: 0.97, duration: 0.1, ease: 'power1.out' }); });
        ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) {
          el.addEventListener(ev, function () { gsap.to(el, { scale: 1, duration: 0.18, ease: 'power2.out' }); });
        });
      });
    });
  }

  /* C6 补充：resize 时重新初始化动画 —— killAnims 清除旧动画 + initAnims 按新视口重建。
     因 matchMedia 只用 prefers-reduced-motion（不含 min-width），resize 不会触发 matchMedia 重新执行，
     避免了跨断点时 gsap.from 重置 opacity:0 导致的残留空白。
     fromTo + immediateRender:false 保证元素默认可见，无需清除内联态。 */
  var resizeAnimTimer = null;
  window.addEventListener('resize', function () {
    clearTimeout(resizeAnimTimer);
    resizeAnimTimer = setTimeout(function () {
      if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
      killAnims();
      initAnims();
    }, 400);
  });

  function render() {
    killAnims();
    var D = dataFor();
    document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN';
    document.title = D.base.name + (lang === 'en' ? ' - Resume' : ' - 个人简历');
    app.innerHTML = navBar(D) + hero(D) + '<main>' + about(D) + experience(D) + projects(D) + skills(D) + eduHonors(D) + offDuty(D) + '</main>' + footer(D) + printDialog(D);
    bind(D);
    initAnims();
  }

  /* Esc 关闭打印对话框（只绑定一次，重渲染不叠加） */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closePrintDialog();
  });

  render();
})();
