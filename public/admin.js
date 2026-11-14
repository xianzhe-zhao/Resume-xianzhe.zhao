/* 简历管理后台：登录 → 编辑各版本 → 一键分享链接 / 导出独立 HTML */
(function () {
  var root = document.getElementById('root');
  var DATA = null;       // 完整数据 {base, versions}
  var curVer = 'ai';     // 当前编辑的版本
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
  // 必须用 /api/data/full（完整数据）：/api/data 是脱敏版，会把手机号变成 176****xxxx，
  // 若编辑后保存会把脱敏值写回文件，永久损坏真实数据
  function loadData() {
    fetch('/api/data/full').then(function (r) { return r.json(); }).then(function (d) {
      DATA = d;
      renderEditor();
    }).catch(function () { renderLogin('数据加载失败（需重新登录）', 'err'); });
  }

  /* ============ 编辑器 ============ */
  function renderEditor() {
    var vers = DATA.versions;
    var verKeys = Object.keys(vers);
    var v = vers[curVer];

    var tabs = verKeys.map(function (k) {
      return '<span class="ver-tab ' + (k === curVer ? 'active' : '') + '" data-ver="' + esc(k) + '">' + esc(vers[k].label) + '</span>';
    }).join('');

    root.innerHTML =
      '<div class="admin-wrap">' +
      '<div class="admin-header"><h1>简历管理后台</h1><div class="ver-tabs">' + tabs + '</div></div>' +

      /* —— 基础信息（所有版本共享）—— */
      '<div class="admin-card"><h2>基础信息（所有版本共享）</h2>' +
      /* 头像上传 */
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
      row('性别', 'base_gender', DATA.base.gender) +
      row('年龄', 'base_age', DATA.base.age) +
      row('工作年限', 'base_workYears', DATA.base.workYears) +
      row('手机号', 'base_phone', DATA.base.phone) +
      row('微信', 'base_wechat', DATA.base.wechat) +
      row('邮箱', 'base_email', DATA.base.email) +
      row('期望城市', 'base_city', DATA.base.city) +
      '</div>' +
      rowTA('资格证书（每行一条）', 'base_certs', (DATA.base.certs || []).join('\n')) +
      rowTA('荣誉（每行一条）', 'base_honors', (DATA.base.honors || []).join('\n')) +
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

  function row(label, id, val) {
    return '<div class="form-row"><label>' + esc(label) + '</label><input type="text" id="' + id + '" value="' + esc(val) + '"></div>';
  }
  function rowTA(label, id, val) {
    return '<div class="form-row"><label>' + esc(label) + '</label><textarea id="' + id + '" rows="3">' + esc(val) + '</textarea></div>';
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
          // 上传到服务器
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
    // 版本切换
    document.querySelectorAll('.ver-tab').forEach(function (t) {
      t.onclick = function () { collectCurrent(); curVer = t.getAttribute('data-ver'); renderEditor(); };
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

  /* ============ 收集当前表单到 DATA ============ */
  function collectCurrent() {
    var b = DATA.base;
    b.name = val('base_name'); b.gender = val('base_gender'); b.age = val('base_age');
    b.workYears = val('base_workYears'); b.phone = val('base_phone'); b.wechat = val('base_wechat');
    b.email = val('base_email'); b.city = val('base_city');
    b.certs = lines('base_certs'); b.honors = lines('base_honors');
    // 收集个人项目
    (DATA.base.projects || []).forEach(function (p, pi) {
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
        if (res.ok) { st.textContent = '已保存'; dirty = false; setTimeout(function () { st.textContent = ''; }, 2000); }
        else { st.textContent = res.error || '保存失败'; }
      })
      .catch(function () { st.textContent = '网络错误'; });
  }

  /* ============ 导出独立 HTML ============ */
  function exportHTML(verKey) {
    collectCurrent();
    var payload = JSON.stringify({ base: DATA.base, version: DATA.versions[verKey], versionKey: verKey, allVersions: [verKey], en: DATA.en || null });
    // 拉取页面模板和渲染器，内联成单文件
    Promise.all([
      fetch('/index.html').then(function (r) { return r.text(); }),
      fetch('/style.css').then(function (r) { return r.text(); }),
      fetch('/app.js').then(function (r) { return r.text(); }),
      fetch('/gsap.min.js').then(function (r) { return r.text(); }),
      fetch('/ScrollTrigger.min.js').then(function (r) { return r.text(); })
    ]).then(function (parts) {
      // 用函数形式替换，防数据内容含 $& / $' 等 replace 特殊模式被错误展开
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
  // 脏标记（事件委托，绑定一次，覆盖后续所有 innerHTML 重渲染的输入控件）
  root.addEventListener('input', function () { dirty = true; });
  root.addEventListener('change', function () { dirty = true; });
  fetch('/api/check').then(function (r) { return r.json(); }).then(function (res) {
    if (res.authed) { loadData(); } else { renderLogin(); }
  }).catch(function () { renderLogin(); });

  // 离开前提醒
  window.addEventListener('beforeunload', function (e) { if (dirty) { e.preventDefault(); e.returnValue = ''; } });
})();
