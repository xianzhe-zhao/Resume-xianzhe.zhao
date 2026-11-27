/* 简历管理后台：登录 → 编辑各版本 + 技能/经历/教育 + 面试题库 → 一键分享链接 / 导出独立 HTML */
(function () {
  var root = document.getElementById('root');
  var DATA = null;       // 完整数据 {base, versions}
  var IV = null;         // 面试题库 {categories}
  var curVer = 'ai';     // 当前编辑的版本
  var curTab = 'resume'; // 当前 tab：resume | interview
  var dirty = false;     // 是否有未保存改动

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }

  /* ============ 登录页 ============ */
  function renderLogin(msg, msgType) {
    root.innerHTML =
      '<div class="login-box">' +
      '<h1>简历管理后台</h1>' +
      '<p>请输入管理密码登录</p>' +
      '<div class="msg ' + (msgType || '') + '" id="loginMsg">' + esc(msg || '') + '</div>' +
      '<input type="password" id="pwd" placeholder="管理密码" autofocus>' +
      '<button class="btn" id="loginBtn">登录</button>' +
      '</div>';
    var btn = document.getElementById('loginBtn');
    var pwd = document.getElementById('pwd');
    function doLogin() {
      var p = pwd.value;
      fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: p }) })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          if (res.ok) { loadData(); }
          else { renderLogin(res.error || '密码错误', 'err'); }
        })
        .catch(function () { renderLogin('网络错误', 'err'); });
    }
    btn.onclick = doLogin;
    pwd.onkeydown = function (e) { if (e.key === 'Enter') doLogin(); };
  }

  /* ============ 加载数据 ============ */
  function loadData() {
    fetch('/api/data/full').then(function (r) { return r.json(); }).then(function (d) {
      DATA = d;
      // 同时加载面试题库
      return fetch('/api/interview').then(function (r) { return r.json(); });
    }).then(function (iv) {
      IV = iv || { categories: [] };
      renderEditor();
    }).catch(function () { renderLogin('数据加载失败（需重新登录）', 'err'); });
  }

  /* ============ 编辑器 ============ */
  function renderEditor() {
    if (curTab === 'interview') { renderInterview(); return; }
    var vers = DATA.versions;
    var verKeys = Object.keys(vers);
    var v = vers[curVer] || vers[Object.keys(vers)[0]];

    var tabs = verKeys.map(function (k) {
      return '<span class="ver-tab ' + (k === curVer ? 'active' : '') + '" data-ver="' + esc(k) + '">' + esc(vers[k].label) + '</span>';
    }).join('');

    root.innerHTML =
      '<div class="admin-wrap">' +
      '<div class="admin-header"><h1>简历管理后台</h1>' +
      '<div class="ver-tabs">' + tabs +
      '<span class="ver-tab ' + (curTab === 'interview' ? 'active' : '') + '" data-tab="interview">面试题库</span>' +
      '</div></div>' +

      /* —— 基础信息（所有版本共享）—— */
      '<div class="admin-card"><h2>基础信息（所有版本共享）</h2>' +
      '<div class="form-row"><label>个人头像</label>' +
      '<div class="avatar-row">' +
      '<div id="avatarPreview" class="avatar-preview">' +
      (DATA.base.avatar ? '<img src="' + esc(DATA.base.avatar) + '">' : esc(DATA.base.name.charAt(0))) +
      '</div>' +
      '<div class="avatar-side"><input type="file" id="avatarFile" accept="image/*">' +
      '<p class="avatar-hint">支持 JPG/PNG/GIF/WebP，限 2MB。上传后点「保存全部」生效。</p>' +
      '<button class="mini-btn avatar-remove" id="avatarRemoveBtn">移除头像</button></div>' +
      '</div></div>' +
      '<div class="form-grid">' +
      row('姓名', 'base_name', DATA.base.name) +
      row('工作年限', 'base_workYears', DATA.base.workYears) +
      row('手机号', 'base_phone', DATA.base.phone) +
      row('微信', 'base_wechat', DATA.base.wechat) +
      row('邮箱', 'base_email', DATA.base.email) +
      row('期望城市', 'base_city', DATA.base.city) +
      '</div>' +
      rowTA('资格证书（每行一条）', 'base_certs', (DATA.base.certs || []).join('\n')) +
      rowTA('荣誉（每行一条）', 'base_honors', (DATA.base.honors || []).join('\n')) +
      '</div>' +

      /* —— 技能编辑（新增）—— */
      '<div class="admin-card"><h2>核心技能（分组编辑）</h2>' +
      '<div id="skillsEditor" class="skills-editor">' + renderSkillsEditor() + '</div>' +
      '<button class="mini-btn" id="addSkillGroup">+ 添加技能分组</button>' +
      '</div>' +

      /* —— 工作经历编辑（新增）—— */
      '<div class="admin-card"><h2>工作经历</h2>' +
      '<div class="form-grid">' +
      row('公司', 'exp_company', DATA.base.experience[0].company) +
      row('职位', 'exp_role', DATA.base.experience[0].role) +
      row('时间段', 'exp_period', DATA.base.experience[0].period) +
      row('地点', 'exp_location', DATA.base.experience[0].location || '') +
      row('服务范围', 'exp_scope', DATA.base.experience[0].scope || '') +
      row('并行说明', 'exp_parallel', DATA.base.experience[0].parallel || '') +
      '</div>' +
      '<div id="experienceEditor" class="experience-editor">' + renderExperienceEditor() + '</div>' +
      '<button class="mini-btn" id="addExpProject">+ 添加经历段</button>' +
      '</div>' +

      /* —— 教育编辑（新增）—— */
      '<div class="admin-card"><h2>教育与职业转型</h2>' +
      '<div id="educationEditor">' + renderEducationEditor() + '</div>' +
      '<button class="mini-btn" id="addEdu">+ 添加教育条目</button>' +
      '</div>' +

      /* —— 个人项目（所有版本共享）—— */
      (DATA.base.projects || []).map(function (p, pi) {
        return '<div class="admin-card"><h2>个人项目：' + esc(p.title) + '</h2>' +
        row('项目标题', 'proj_' + pi + '_title', p.title) +
        '<div class="form-grid">' +
        row('徽章', 'proj_' + pi + '_badge', p.badge || '') +
        row('链接', 'proj_' + pi + '_link', p.link || '') +
        '</div>' +
        rowTA('项目描述', 'proj_' + pi + '_desc', p.desc || '') +
        rowTA('要点（每行一条）', 'proj_' + pi + '_items', (p.items || []).join('\n')) +
        rowTA('技术栈（每行一条）', 'proj_' + pi + '_stack', (p.stack || []).join('\n')) +
        '</div>';
      }).join('') +

      /* —— 当前版本专属 —— */
      '<div class="admin-card"><h2>当前版本：' + esc(v.label) + ' 专属内容</h2>' +
      row('求职意向 / 职位标题', 'ver_title', v.title) +
      rowTA('个人简介', 'ver_summary', v.summary) +
      '<div class="form-row"><label>核心优势（4 条，每条一行标题|描述）</label>' +
      '<textarea id="ver_advantages" rows="6" style="min-height:160px">' +
      esc((v.advantages || []).map(function (a) { return a.title + '|' + a.text; }).join('\n')) +
      '</textarea></div>' +
      '<div class="form-row"><label>主打项目（featuredProject）</label>' +
      '<select id="ver_featuredProject">' +
      (DATA.base.projects || []).map(function (p) {
        return '<option value="' + esc(p.id) + '"' + (p.id === v.featuredProject ? ' selected' : '') + '>' + esc(p.title) + '</option>';
      }).join('') +
      '</select></div>' +
      '</div>' +

      /* —— 分享与导出 —— */
      '<div class="admin-card"><h2>分享与导出</h2>' +
      '<p style="font-size:13px;color:#5a6068;margin-bottom:14px">把对应版本的链接发给不同的人，或导出独立 HTML 文件离线分享。</p>' +
      verKeys.map(function (k) {
        return '<div class="share-item"><div><div style="font-weight:600;font-size:14px">' + esc(vers[k].label) + '（' + esc(vers[k].title) + '）</div>' +
          '<div class="url">' + esc(location.origin + '/' + k) + '</div></div>' +
          '<div class="actions"><button class="mini-btn" data-copy="' + esc(k) + '">复制链接</button>' +
          '<button class="mini-btn accent" data-export="' + esc(k) + '">导出 HTML</button>' +
          '<a class="mini-btn" href="/' + esc(k) + '" target="_blank">预览</a></div></div>';
      }).join('') +
      '</div>' +

      /* —— 操作按钮 —— */
      '<div class="btn-row">' +
      '<button class="btn accent" id="saveBtn">保存全部</button>' +
      '<button class="btn ghost" id="logoutBtn">退出登录</button>' +
      '<span id="saveStatus" style="font-size:13px;color:#5a6068;align-self:center"></span>' +
      '</div>' +
      '</div>';

    bindEditorEvents();
  }

  /* —— 技能编辑器渲染 —— */
  function renderSkillsEditor() {
    var skills = DATA.base.skills || {};
    return Object.keys(skills).map(function (groupName, gi) {
      var items = skills[groupName];
      return '<div class="skill-group-edit" data-gi="' + gi + '">' +
        '<div class="form-row"><label>分组名</label>' +
        '<input type="text" class="skill-group-name" value="' + esc(groupName) + '" data-gi="' + gi + '"></div>' +
        '<textarea class="skill-items" rows="3" data-gi="' + gi + '">' + esc(items.join('\n')) + '</textarea>' +
        '<button class="mini-btn del-skill-group" data-gi="' + gi + '">删除分组</button>' +
        '</div>';
    }).join('');
  }

  /* —— 工作经历编辑器渲染 —— */
  function renderExperienceEditor() {
    var projs = DATA.base.experience[0].projects || [];
    return projs.map(function (p, pi) {
      var itemsText = (p.items || []).map(function (it) {
        return it.label + '|' + it.text;
      }).join('\n');
      return '<div class="exp-project-edit" data-pi="' + pi + '">' +
        '<div class="form-grid">' +
        row('段标题', 'exp_' + pi + '_title', p.title) +
        row('时间段', 'exp_' + pi + '_period', p.period || '') +
        '</div>' +
        row('技术栈', 'exp_' + pi + '_stack', p.stack || '') +
        rowTA('要点（每行 label|text）', 'exp_' + pi + '_items', itemsText) +
        '<button class="mini-btn del-exp-project" data-pi="' + pi + '">删除此段</button>' +
        '</div>';
    }).join('');
  }

  /* —— 教育编辑器渲染 —— */
  function renderEducationEditor() {
    var edus = DATA.base.education || [];
    return edus.map(function (e, ei) {
      return '<div class="edu-edit" data-ei="' + ei + '">' +
        '<div class="form-grid">' +
        row('学校', 'edu_' + ei + '_school', e.school) +
        row('时间段', 'edu_' + ei + '_period', e.period || '') +
        '</div>' +
        row('详情', 'edu_' + ei + '_detail', e.detail || '') +
        row('附加', 'edu_' + ei + '_extra', e.extra || '') +
        '<button class="mini-btn del-edu" data-ei="' + ei + '">删除</button>' +
        '</div>';
    }).join('');
  }

  function row(label, id, val) {
    return '<div class="form-row"><label>' + esc(label) + '</label><input type="text" id="' + id + '" value="' + esc(val) + '"></div>';
  }
  function rowTA(label, id, val) {
    return '<div class="form-row"><label>' + esc(label) + '</label><textarea id="' + id + '" rows="3">' + esc(val) + '</textarea></div>';
  }

  /* ============ 面试题库渲染 ============ */
  function renderInterview() {
    var vers = DATA.versions;
    var verKeys = Object.keys(vers);
    var tabs = verKeys.map(function (k) {
      return '<span class="ver-tab" data-ver="' + esc(k) + '">' + esc(vers[k].label) + '</span>';
    }).join('');
    var cats = (IV && IV.categories) || [];
    root.innerHTML =
      '<div class="admin-wrap">' +
      '<div class="admin-header"><h1>简历管理后台</h1>' +
      '<div class="ver-tabs">' + tabs +
      '<span class="ver-tab active" data-tab="resume">简历</span>' +
      '</div></div>' +
      '<div class="admin-card"><h2>面试题库（' + cats.reduce(function (s, c) { return s + (c.items || []).length; }, 0) + ' 题 · ' + cats.length + ' 分类）</h2>' +
      '<p style="font-size:13px;color:#5a6068;margin-bottom:14px">每条答案用 rel 绑定简历字段，用 dirs 标记所属方向。简历改动后只提示复核，不自动改写答案。</p>' +
      '<div id="interviewFilter" class="interview-filter">' +
      '<span class="iv-chip on" data-dir="ALL">全部</span>' +
      '<span class="iv-chip" data-dir="ai">AI</span>' +
      '<span class="iv-chip" data-dir="fullstack">全栈</span>' +
      '<span class="iv-chip" data-dir="erp">ERP</span>' +
      '<span class="iv-chip" data-dir="pm">PM</span>' +
      '</div>' +
      cats.map(function (c, ci) {
        return '<div class="iv-category" data-ci="' + ci + '">' +
          '<div class="form-grid">' +
          row('分类ID', 'iv_cat_' + ci + '_id', c.id) +
          row('分类名', 'iv_cat_' + ci + '_label', c.label) +
          '</div>' +
          '<div class="iv-items">' + (c.items || []).map(function (it, ii) {
            return '<div class="iv-item-edit" data-ci="' + ci + '" data-ii="' + ii + '">' +
              row('问题', 'iv_q_' + ci + '_' + ii, it.q) +
              rowTA('答案要点（每行一条）', 'iv_a_' + ci + '_' + ii, (it.a || []).join('\n')) +
              '<div class="form-grid">' +
              row('标签（逗号分隔）', 'iv_tags_' + ci + '_' + ii, (it.tags || []).join(',')) +
              row('关联简历字段 rel（逗号分隔）', 'iv_rel_' + ci + '_' + ii, (it.rel || []).join(',')) +
              row('所属方向 dirs（逗号分隔）', 'iv_dirs_' + ci + '_' + ii, (it.dirs || []).join(',')) +
              '</div>' +
              '<button class="mini-btn del-iv-item" data-ci="' + ci + '" data-ii="' + ii + '">删除题目</button>' +
              '</div>';
          }).join('') + '</div>' +
          '<button class="mini-btn add-iv-item" data-ci="' + ci + '">+ 添加题目</button> ' +
          '<button class="mini-btn del-iv-cat" data-ci="' + ci + '">删除分类</button>' +
          '</div>';
      }).join('') +
      '<button class="mini-btn" id="addIvCat">+ 添加分类</button>' +
      '</div>' +
      '<div class="btn-row">' +
      '<button class="btn accent" id="saveInterviewBtn">保存题库</button>' +
      '<button class="btn ghost" id="backResumeBtn">返回简历</button>' +
      '<span id="ivSaveStatus" style="font-size:13px;color:#5a6068;align-self:center"></span>' +
      '</div>' +
      '</div>';
    bindInterviewEvents();
  }

  /* ============ 事件绑定 ============ */
  function bindEditorEvents() {
    // 头像上传
    var avatarFile = document.getElementById('avatarFile');
    if (avatarFile) {
      avatarFile.onchange = function () {
        var file = avatarFile.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) { alert('图片不能超过 2MB'); return; }
        var reader = new FileReader();
        reader.onload = function () {
          fetch('/api/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data: reader.result }) })
            .then(function (r) { return r.json(); })
            .then(function (res) {
              if (res.ok) {
                DATA.base.avatar = res.path;
                var prev = document.getElementById('avatarPreview');
                prev.innerHTML = '<img src="' + esc(res.path) + '">';
                var st = document.getElementById('saveStatus');
                st.textContent = '头像已上传，请点「保存全部」生效'; st.style.color = '#256f82';
              } else { alert(res.error || '上传失败'); }
            })
            .catch(function () { alert('上传失败，请重试'); });
        };
        reader.readAsDataURL(file);
      };
    }
    var avatarRemove = document.getElementById('avatarRemoveBtn');
    if (avatarRemove) {
      avatarRemove.onclick = function () {
        DATA.base.avatar = '';
        var prev = document.getElementById('avatarPreview');
        prev.innerHTML = esc(DATA.base.name.charAt(0));
      };
    }
    // 版本切换 + tab 切换
    document.querySelectorAll('.ver-tab').forEach(function (t) {
      t.onclick = function () {
        var ver = t.getAttribute('data-ver');
        var tab = t.getAttribute('data-tab');
        if (tab === 'interview') { collectCurrent(); curTab = 'interview'; renderInterview(); return; }
        if (ver) { collectCurrent(); curVer = ver; renderEditor(); }
      };
    });
    // 技能分组增删
    var addSkillGroup = document.getElementById('addSkillGroup');
    if (addSkillGroup) addSkillGroup.onclick = function () {
      collectCurrent();
      var keys = Object.keys(DATA.base.skills || {});
      var newName = '新分组 ' + (keys.length + 1);
      DATA.base.skills[newName] = [];
      renderEditor();
    };
    document.querySelectorAll('.del-skill-group').forEach(function (b) {
      b.onclick = function () {
        collectCurrent();
        var gi = parseInt(b.getAttribute('data-gi'));
        var keys = Object.keys(DATA.base.skills);
        delete DATA.base.skills[keys[gi]];
        renderEditor();
      };
    });
    // 经历段增删
    var addExpProject = document.getElementById('addExpProject');
    if (addExpProject) addExpProject.onclick = function () {
      collectCurrent();
      DATA.base.experience[0].projects.push({ title: '新经历段', period: '', stack: '', items: [] });
      renderEditor();
    };
    document.querySelectorAll('.del-exp-project').forEach(function (b) {
      b.onclick = function () {
        collectCurrent();
        var pi = parseInt(b.getAttribute('data-pi'));
        DATA.base.experience[0].projects.splice(pi, 1);
        renderEditor();
      };
    });
    // 教育增删
    var addEdu = document.getElementById('addEdu');
    if (addEdu) addEdu.onclick = function () {
      collectCurrent();
      DATA.base.education.push({ school: '', period: '', detail: '', extra: '' });
      renderEditor();
    };
    document.querySelectorAll('.del-edu').forEach(function (b) {
      b.onclick = function () {
        collectCurrent();
        var ei = parseInt(b.getAttribute('data-ei'));
        DATA.base.education.splice(ei, 1);
        renderEditor();
      };
    });
    // 复制链接
    document.querySelectorAll('[data-copy]').forEach(function (b) {
      b.onclick = function () {
        var k = b.getAttribute('data-copy');
        var url = location.origin + '/' + k;
        navigator.clipboard.writeText(url).then(function () { b.textContent = '已复制'; setTimeout(function () { b.textContent = '复制链接'; }, 1500); });
      };
    });
    // 导出 HTML
    document.querySelectorAll('[data-export]').forEach(function (b) {
      b.onclick = function () { exportHTML(b.getAttribute('data-export')); };
    });
    // 保存
    document.getElementById('saveBtn').onclick = saveAll;
    // 退出
    document.getElementById('logoutBtn').onclick = function () {
      fetch('/api/logout', { method: 'POST' }).then(function () { DATA = null; renderLogin(); });
    };
  }

  /* ============ 面试题库事件绑定 ============ */
  function bindInterviewEvents() {
    document.querySelectorAll('.ver-tab').forEach(function (t) {
      t.onclick = function () {
        var tab = t.getAttribute('data-tab');
        var ver = t.getAttribute('data-ver');
        if (tab === 'resume') { collectInterview(); curTab = 'resume'; renderEditor(); return; }
      };
    });
    // 方向筛选
    document.querySelectorAll('.iv-chip').forEach(function (c) {
      c.onclick = function () {
        document.querySelectorAll('.iv-chip').forEach(function (x) { x.classList.remove('on'); });
        c.classList.add('on');
        var dir = c.getAttribute('data-dir');
        document.querySelectorAll('.iv-item-edit').forEach(function (item) {
          var dirsInput = item.querySelector('[id^="iv_dirs_"]');
          var dirs = dirsInput ? dirsInput.value.split(',').map(function (s) { return s.trim(); }) : [];
          item.style.display = (dir === 'ALL' || dirs.indexOf(dir) >= 0) ? '' : 'none';
        });
      };
    });
    // 增删题目/分类
    document.querySelectorAll('.add-iv-item').forEach(function (b) {
      b.onclick = function () {
        collectInterview();
        var ci = parseInt(b.getAttribute('data-ci'));
        IV.categories[ci].items.push({ id: IV.categories[ci].id.toLowerCase() + '-' + (IV.categories[ci].items.length + 1), q: '新问题', a: [], tags: [], rel: [], dirs: [] });
        renderInterview();
      };
    });
    document.querySelectorAll('.del-iv-item').forEach(function (b) {
      b.onclick = function () {
        collectInterview();
        var ci = parseInt(b.getAttribute('data-ci'));
        var ii = parseInt(b.getAttribute('data-ii'));
        IV.categories[ci].items.splice(ii, 1);
        renderInterview();
      };
    });
    document.querySelectorAll('.del-iv-cat').forEach(function (b) {
      b.onclick = function () {
        collectInterview();
        var ci = parseInt(b.getAttribute('data-ci'));
        IV.categories.splice(ci, 1);
        renderInterview();
      };
    });
    var addIvCat = document.getElementById('addIvCat');
    if (addIvCat) addIvCat.onclick = function () {
      collectInterview();
      IV.categories.push({ id: 'NEW' + (IV.categories.length + 1), label: '新分类', items: [] });
      renderInterview();
    };
    var backResumeBtn = document.getElementById('backResumeBtn');
    if (backResumeBtn) backResumeBtn.onclick = function () { collectInterview(); curTab = 'resume'; renderEditor(); };
    var saveInterviewBtn = document.getElementById('saveInterviewBtn');
    if (saveInterviewBtn) saveInterviewBtn.onclick = saveInterview;
  }

  /* ============ 收集当前表单到 DATA ============ */
  function collectCurrent() {
    var b = DATA.base;
    b.name = val('base_name'); b.workYears = val('base_workYears');
    b.phone = val('base_phone'); b.wechat = val('base_wechat');
    b.email = val('base_email'); b.city = val('base_city');
    b.certs = lines('base_certs'); b.honors = lines('base_honors');
    // 收集技能
    var skills = {};
    document.querySelectorAll('.skill-group-edit').forEach(function (g) {
      var nameEl = g.querySelector('.skill-group-name');
      var itemsEl = g.querySelector('.skill-items');
      if (nameEl && itemsEl) {
        var name = nameEl.value.trim() || '未命名';
        skills[name] = itemsEl.value.split('\n').map(function (s) { return s.trim(); }).filter(function (x) { return x; });
      }
    });
    b.skills = skills;
    // 收集工作经历公共字段
    var exp = b.experience[0];
    exp.company = val('exp_company'); exp.role = val('exp_role');
    exp.period = val('exp_period'); exp.location = val('exp_location');
    exp.scope = val('exp_scope'); exp.parallel = val('exp_parallel');
    // 收集经历段
    var projs = [];
    document.querySelectorAll('.exp-project-edit').forEach(function (pe) {
      var pi = parseInt(pe.getAttribute('data-pi'));
      var p = b.experience[0].projects[pi] || {};
      p.title = val('exp_' + pi + '_title');
      p.period = val('exp_' + pi + '_period');
      p.stack = val('exp_' + pi + '_stack');
      p.items = lines('exp_' + pi + '_items').map(function (line) {
        var i = line.indexOf('|');
        return i >= 0 ? { label: line.slice(0, i).trim(), text: line.slice(i + 1).trim() } : { label: line.trim(), text: '' };
      });
      projs.push(p);
    });
    exp.projects = projs;
    // 收集教育
    var edus = [];
    document.querySelectorAll('.edu-edit').forEach(function (ee) {
      var ei = parseInt(ee.getAttribute('data-ei'));
      var e = b.education[ei] || {};
      e.school = val('edu_' + ei + '_school');
      e.period = val('edu_' + ei + '_period');
      e.detail = val('edu_' + ei + '_detail');
      e.extra = val('edu_' + ei + '_extra');
      edus.push(e);
    });
    b.education = edus;
    // 收集个人项目
    (b.projects || []).forEach(function (p, pi) {
      p.title = val('proj_' + pi + '_title');
      p.badge = val('proj_' + pi + '_badge');
      p.link = val('proj_' + pi + '_link');
      p.desc = val('proj_' + pi + '_desc');
      p.items = lines('proj_' + pi + '_items');
      p.stack = lines('proj_' + pi + '_stack');
    });
    var v = DATA.versions[curVer];
    v.title = val('ver_title'); v.summary = val('ver_summary');
    v.advantages = val('ver_advantages').split('\n').filter(function (x) { return x.trim(); }).map(function (line) {
      var i = line.indexOf('|');
      return i >= 0 ? { title: line.slice(0, i).trim(), text: line.slice(i + 1).trim() } : { title: line.trim(), text: '' };
    });
    var fpEl = document.getElementById('ver_featuredProject');
    if (fpEl) v.featuredProject = fpEl.value;
  }

  /* ============ 收集面试题库到 IV ============ */
  function collectInterview() {
    var cats = [];
    document.querySelectorAll('.iv-category').forEach(function (ce) {
      var ci = parseInt(ce.getAttribute('data-ci'));
      var c = IV.categories[ci] || {};
      c.id = val('iv_cat_' + ci + '_id');
      c.label = val('iv_cat_' + ci + '_label');
      var items = [];
      ce.querySelectorAll('.iv-item-edit').forEach(function (ie) {
        var ii = parseInt(ie.getAttribute('data-ii'));
        var it = IV.categories[ci].items[ii] || {};
        it.q = val('iv_q_' + ci + '_' + ii);
        it.a = lines('iv_a_' + ci + '_' + ii);
        it.tags = val('iv_tags_' + ci + '_' + ii).split(',').map(function (s) { return s.trim(); }).filter(function (x) { return x; });
        it.rel = val('iv_rel_' + ci + '_' + ii).split(',').map(function (s) { return s.trim(); }).filter(function (x) { return x; });
        it.dirs = val('iv_dirs_' + ci + '_' + ii).split(',').map(function (s) { return s.trim(); }).filter(function (x) { return x; });
        items.push(it);
      });
      c.items = items;
      cats.push(c);
    });
    IV.categories = cats;
  }

  function val(id) { var el = document.getElementById(id); return el ? el.value : ''; }
  function lines(id) { return val(id).split('\n').map(function (s) { return s.trim(); }).filter(function (x) { return x; }); }

  /* ============ 保存 ============ */
  function saveAll() {
    collectCurrent();
    var st = document.getElementById('saveStatus');
    st.textContent = '保存中...';
    fetch('/api/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(DATA) })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (res.ok) {
          st.textContent = '已保存'; dirty = false;
          if (res.needsReview && res.needsReview.length > 0) {
            st.textContent = '已保存。' + res.needsReview.length + ' 条面试答案引用了你刚修改的经历，请到面试题库复核';
            st.style.color = '#a8631a';
          }
          setTimeout(function () { st.textContent = ''; }, 4000);
        }
        else { st.textContent = res.error || '保存失败'; }
      })
      .catch(function () { st.textContent = '网络错误'; });
  }

  /* ============ 保存面试题库 ============ */
  function saveInterview() {
    collectInterview();
    var st = document.getElementById('ivSaveStatus');
    st.textContent = '保存中...';
    fetch('/api/interview/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(IV) })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (res.ok) { st.textContent = '已保存'; dirty = false; setTimeout(function () { st.textContent = ''; }, 2000); }
        else { st.textContent = res.error || '保存失败'; }
      })
      .catch(function () { st.textContent = '网络错误'; });
  }

  /* ============ 导出独立 HTML ============ */
  function exportHTML(verKey) {
    collectCurrent();
    var payload = JSON.stringify({ base: DATA.base, version: DATA.versions[verKey], versionKey: verKey, allVersions: [verKey], en: DATA.en || null });
    Promise.all([
      fetch('/index.html').then(function (r) { return r.text(); }),
      fetch('/style.css').then(function (r) { return r.text(); }),
      fetch('/app.js').then(function (r) { return r.text(); }),
      fetch('/gsap.min.js').then(function (r) { return r.text(); }),
      fetch('/ScrollTrigger.min.js').then(function (r) { return r.text(); })
    ]).then(function (parts) {
      var html = parts[0]
        .replace('<link rel="stylesheet" href="/style.css">', function () { return '<style>' + parts[1] + '</style>'; })
        .replace('/*__RESUME_DATA__*/', function () { return 'window.RESUME = ' + payload + ';'; })
        .replace('<script src="/gsap.min.js"></script>', function () { return '<script>' + parts[3] + '</script>'; })
        .replace('<script src="/ScrollTrigger.min.js"></script>', function () { return '<script>' + parts[4] + '</script>'; })
        .replace('<script src="/app.js"></script>', function () { return '<script>' + parts[2] + '</script>'; });
      var blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'resume-' + verKey + '.html';
      a.click();
      URL.revokeObjectURL(a.href);
    }).catch(function () { alert('导出失败，请重试'); });
  }

  /* ============ 启动：检查登录状态 ============ */
  root.addEventListener('input', function () { dirty = true; });
  root.addEventListener('change', function () { dirty = true; });
  fetch('/api/check').then(function (r) { return r.json(); }).then(function (res) {
    if (res.authed) { loadData(); } else { renderLogin(); }
  }).catch(function () { renderLogin(); });

  window.addEventListener('beforeunload', function (e) { if (dirty) { e.preventDefault(); e.returnValue = ''; } });
})();
