/* Thiệp cưới: đổ nội dung từ config.js vào trang và xử lý tương tác. */
(function () {
  'use strict';

  var cfg = window.WEDDING || {};
  var $ = function (id) { return document.getElementById(id); };
  var WEEKDAYS = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  var VN_OFFSET = 7 * 3600 * 1000;
  var STORE_KEY = 'thiepcuoi3';

  /* ── Tiện ích ── */
  function get(path) {
    return path.split('.').reduce(function (o, k) { return o == null ? undefined : o[k]; }, cfg);
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }
  function icon(name) {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    var use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', '#i-' + name);
    svg.appendChild(use);
    svg.setAttribute('aria-hidden', 'true');
    return svg;
  }
  /** Tách ngày giờ theo giờ Việt Nam, không phụ thuộc múi giờ của máy khách. */
  function vn(iso) {
    var t = new Date(iso).getTime();
    var d = new Date(t + VN_OFFSET);
    return {
      time: t,
      y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate(),
      hh: d.getUTCHours(), mm: d.getUTCMinutes(), wd: d.getUTCDay(),
    };
  }
  function dateText(p) { return pad(p.d) + '.' + pad(p.m) + '.' + p.y; }
  function clockText(p) { return pad(p.hh) + ':' + pad(p.mm); }
  function store(read, value) {
    try {
      if (read) return JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
      localStorage.setItem(STORE_KEY, JSON.stringify(value));
    } catch (e) { /* trình duyệt chặn lưu trữ */ }
    return null;
  }
  var toastTimer;
  function toast(msg) {
    var t = $('toast');
    t.textContent = msg;
    t.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('is-on'); }, 2600);
  }
  function isPlaceholder(text) { return !text || /^\s*\(/.test(text); }

  /* ── Tên khách từ đường dẫn ── */
  var params = new URLSearchParams(location.search);
  var guestParam = (cfg.guest && cfg.guest.param) || 'khach';
  var guestName = (params.get(guestParam) || params.get('to') || '').replace(/\s+/g, ' ').trim().slice(0, 60);
  var guestWord = guestName || (cfg.guest && cfg.guest.fallback) || 'bạn';

  /* ── Chữ tĩnh ── */
  document.querySelectorAll('[data-t]').forEach(function (node) {
    var value = get(node.getAttribute('data-t'));
    node.textContent = value == null ? '' : String(value).replace(/\{guest\}/g, guestWord);
  });

  var groom = (cfg.couple && cfg.couple.groom) || {};
  var bride = (cfg.couple && cfg.couple.bride) || {};
  var main = vn(cfg.mainDate);
  document.title = groom.name + ' ♥ ' + bride.name + ' · Thiệp mời cưới';

  if (guestName) {
    $('gateGuestName').textContent = guestName;
    $('gateGuest').hidden = false;
    $('heroGuest').textContent = guestName;
    $('heroGuest').hidden = false;
  }
  $('gateDate').textContent = pad(main.d) + ' · ' + pad(main.m) + ' · ' + main.y;
  $('heroWeekday').textContent = WEEKDAYS[main.wd];
  $('heroDate').textContent = dateText(main);
  $('thanksDate').textContent = dateText(main);
  $('inviteTime').textContent = main.hh + ' giờ' + (main.mm ? ' ' + pad(main.mm) : '');
  $('dbWeekday').textContent = WEEKDAYS[main.wd];
  $('dbDay').textContent = pad(main.d);
  $('dbMonth').appendChild(el('span', null, 'Tháng ' + pad(main.m)));
  $('dbMonth').appendChild(el('span', null, String(main.y)));
  if (cfg.previewMode) $('previewTag').hidden = false;

  var artist = cfg.thanks && cfg.thanks.artist;
  $('artCredit').textContent = artist
    ? 'Tranh cô dâu chú rể và hai bạn hổ do ' + artist + ' vẽ tặng. Cảm ơn bạn thật nhiều!'
    : 'Tranh cô dâu chú rể và hai bạn hổ do một người bạn thân vẽ tặng.';

  /* ── Hai họ ── */
  (function families() {
    var box = $('families');
    var data = (cfg.invitation && cfg.invitation.families) || {};
    ['groom', 'bride'].forEach(function (side) {
      var f = data[side];
      if (!f) return;
      var col = el('div', 'family family--' + side);
      col.appendChild(el('p', 'family__label', f.label));
      if (f.father) col.appendChild(el('p', 'family__name', f.father));
      if (f.mother) col.appendChild(el('p', 'family__name', f.mother));
      if (f.address) col.appendChild(el('p', 'family__addr', f.address));
      box.appendChild(col);
    });
    if (!box.children.length) box.hidden = true;
  })();

  /* ── Lịch tháng ── */
  (function calendar() {
    var box = $('calendar');
    box.appendChild(el('p', 'cal__title', 'Tháng ' + main.m + ' · ' + main.y));
    var grid = el('div', 'cal__grid');
    ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].forEach(function (d) { grid.appendChild(el('span', 'cal__dow', d)); });
    var first = new Date(Date.UTC(main.y, main.m - 1, 1)).getUTCDay();
    var lead = (first + 6) % 7;
    var days = new Date(Date.UTC(main.y, main.m, 0)).getUTCDate();
    for (var i = 0; i < lead; i++) grid.appendChild(el('span', 'cal__day'));
    for (var d = 1; d <= days; d++) {
      var cell = el('span', 'cal__day', String(d));
      if ((lead + d) % 7 === 0) cell.classList.add('cal__day--sun');
      if (d === main.d) {
        cell.classList.add('cal__day--on');
        cell.setAttribute('aria-label', 'Ngày cưới: ' + dateText(main));
      }
      grid.appendChild(cell);
    }
    box.appendChild(grid);
  })();

  /* ── Đếm ngược ── */
  (function countdown() {
    var cells = $('countdown');
    var msg = $('countMsg');
    var c = cfg.countdown || {};
    var timer;
    function tick() {
      var now = Date.now();
      var diff = main.time - now;
      if (diff <= 0) {
        var today = new Date(now + VN_OFFSET);
        var same = today.getUTCFullYear() === main.y && today.getUTCMonth() + 1 === main.m && today.getUTCDate() === main.d;
        cells.hidden = true;
        msg.hidden = false;
        msg.textContent = same ? c.todayMessage : c.pastMessage;
        clearInterval(timer);
        return;
      }
      var s = Math.floor(diff / 1000);
      $('cdD').textContent = Math.floor(s / 86400);
      $('cdH').textContent = pad(Math.floor(s % 86400 / 3600));
      $('cdM').textContent = pad(Math.floor(s % 3600 / 60));
      $('cdS').textContent = pad(s % 60);
    }
    timer = setInterval(tick, 1000);
    tick();
  })();

  /* ── Lịch trình ── */
  function icsStamp(ms) { return new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); }
  function icsEscape(s) { return String(s || '').replace(/\\/g, '\\\\').replace(/([,;])/g, '\\$1').replace(/\r?\n/g, '\\n'); }
  function eventPlace(ev) {
    return [ev.venue, ev.address].filter(function (x) { return !isPlaceholder(x); }).join(', ');
  }
  function addToCalendar(ev) {
    var start = new Date(ev.start).getTime();
    var end = ev.end ? new Date(ev.end).getTime() : start + 2 * 3600 * 1000;
    var title = ev.title + ' ' + groom.name + ' & ' + bride.name;
    var place = eventPlace(ev);
    var apple = /iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent);
    if (!apple) {
      var url = 'https://calendar.google.com/calendar/render?action=TEMPLATE'
        + '&text=' + encodeURIComponent(title)
        + '&dates=' + icsStamp(start) + '/' + icsStamp(end)
        + '&location=' + encodeURIComponent(place)
        + '&ctz=Asia/Ho_Chi_Minh';
      window.open(url, '_blank', 'noopener');
      return;
    }
    var ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Thiep cuoi//VI', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT',
      'UID:' + ev.id + '-' + start + '@thiepcuoi',
      'DTSTAMP:' + icsStamp(Date.now()),
      'DTSTART:' + icsStamp(start),
      'DTEND:' + icsStamp(end),
      'SUMMARY:' + icsEscape(title),
      'LOCATION:' + icsEscape(place),
      'END:VEVENT', 'END:VCALENDAR',
    ].join('\r\n');
    var link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
    link.download = ev.id + '.ics';
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  (function events() {
    var box = $('events');
    (cfg.events || []).forEach(function (ev) {
      var p = vn(ev.start);
      var card = el('article', 'paper event event--' + (ev.side || 'both') + ' rv');
      if (ev.tag) card.appendChild(el('span', 'event__tag', ev.tag));
      card.appendChild(el('h3', 'event__title', ev.title));

      var rows = el('div', 'event__rows');
      var when = el('div', 'event__row');
      when.appendChild(icon('clock'));
      var whenText = el('div');
      whenText.appendChild(el('b', null, clockText(p) + ' · ' + WEEKDAYS[p.wd] + ', ' + dateText(p)));
      if (ev.timeNote) whenText.appendChild(el('small', null, ev.timeNote));
      when.appendChild(whenText);
      rows.appendChild(when);

      var where = el('div', 'event__row');
      where.appendChild(icon('pin'));
      var whereText = el('div');
      whereText.appendChild(el('b', null, ev.venue));
      if (ev.address) whereText.appendChild(el('small', null, ev.address));
      where.appendChild(whereText);
      rows.appendChild(where);
      card.appendChild(rows);

      var actions = el('div', 'event__actions');
      var map = el('a', 'btn');
      map.appendChild(icon('pin'));
      map.appendChild(document.createTextNode('Chỉ đường'));
      var place = eventPlace(ev);
      if (ev.mapUrl || place) {
        map.href = ev.mapUrl || 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(place);
        map.target = '_blank';
        map.rel = 'noopener';
      } else {
        map.href = '#lich-trinh';
        map.addEventListener('click', function (e) {
          e.preventDefault();
          toast('Địa chỉ đang là dữ liệu mẫu, sẽ cập nhật sau nhé');
        });
      }
      actions.appendChild(map);

      var cal = el('button', 'btn');
      cal.type = 'button';
      cal.appendChild(icon('cal'));
      cal.appendChild(document.createTextNode('Thêm vào lịch'));
      cal.addEventListener('click', function () { addToCalendar(ev); });
      actions.appendChild(cal);
      card.appendChild(actions);
      box.appendChild(card);
    });
  })();

  /* ── Album ── */
  (function album() {
    var photos = cfg.photos || [];
    var grid = $('albumGrid');
    if (!photos.length && !cfg.previewMode) return;
    $('album').hidden = false;
    var list = photos.length ? photos : [{}, {}, {}, {}];
    list.forEach(function (ph, i) {
      var fig = el('figure', 'photo rv');
      if (ph.src) {
        var img = el('img');
        img.src = ph.src;
        img.alt = ph.alt || ph.caption || 'Ảnh cưới ' + (i + 1);
        img.loading = 'lazy';
        fig.appendChild(img);
      } else {
        var holder = el('div', 'photo__ph');
        holder.appendChild(icon('paw'));
        fig.appendChild(holder);
      }
      fig.appendChild(el('figcaption', null, ph.caption || (ph.src ? '' : 'Chỗ đặt ảnh cưới ' + (i + 1))));
      grid.appendChild(fig);
    });
  })();

  /* ── Lời chúc ── */
  var wishesList = $('wishesList');
  function addWish(w, first) {
    if (!w || !w.message) return;
    var item = el('li', 'wish');
    var name = el('p', 'wish__name', w.name || 'Một người bạn');
    if (w.sample) name.appendChild(el('span', 'wish__tag', 'mẫu'));
    item.appendChild(name);
    item.appendChild(el('p', 'wish__msg', w.message));
    if (first && wishesList.firstChild) wishesList.insertBefore(item, wishesList.firstChild);
    else wishesList.appendChild(item);
    $('wishesBox').hidden = false;
  }

  /* ── Xác nhận tham dự ── */
  (function rsvp() {
    var r = cfg.rsvp || {};
    var endpoint = r.endpoint;
    if (!endpoint && !cfg.previewMode) return;
    $('xac-nhan').hidden = false;
    if (!endpoint) $('rsvpDemo').hidden = false;

    var form = $('rsvpForm');
    var select = $('rsvpGuests');
    for (var i = 1; i <= (r.maxGuests || 4); i++) {
      var opt = el('option', null, i + ' người');
      opt.value = i;
      select.appendChild(opt);
    }
    if (r.deadline) {
      var dl = vn(r.deadline + 'T12:00:00+07:00');
      $('rsvpDeadline').textContent = 'Bạn xác nhận giúp tụi mình trước ngày ' + dateText(dl) + ' nhé';
    }
    if (guestName) form.elements.name.value = guestName;

    form.addEventListener('change', function () {
      $('rsvpExtra').hidden = form.elements.attend.value === 'no';
    });

    var saved = store(true) || {};
    if (cfg.previewMode) ((cfg.wishes && cfg.wishes.samples) || []).forEach(function (w) {
      addWish({ name: w.name, message: w.message, sample: true });
    });
    (saved.wishes || []).forEach(function (w) { addWish(w, true); });

    if (endpoint) {
      fetch(endpoint + (endpoint.indexOf('?') < 0 ? '?' : '&') + 'type=wishes')
        .then(function (res) { return res.ok ? res.json() : []; })
        .then(function (list) {
          if (Array.isArray(list)) list.slice(0, 60).forEach(function (w) { addWish({ name: w.name, message: w.message }); });
        })
        .catch(function () { /* không tải được sổ lời chúc thì bỏ qua */ });
    }

    function done(data) {
      var coming = data.attend === 'yes';
      form.hidden = true;
      $('rsvpDone').hidden = false;
      $('rsvpDone').classList.add('in');
      $('rsvpDoneTitle').textContent = coming ? 'Hẹn gặp ' + data.name + ' nhé!' : 'Cảm ơn ' + data.name + ' nhiều!';
      $('rsvpDoneText').textContent = (coming
        ? 'Tụi mình đã ghi nhận và rất mong được gặp bạn trong ngày vui.'
        : 'Tiếc là bạn không đến được. Tụi mình vẫn rất vui khi nhận được lời nhắn của bạn.')
        + (endpoint ? '' : ' (Bản xem trước: thông tin chưa được gửi đi.)');
      if (data.message) {
        var wish = { name: data.name, message: data.message };
        addWish(wish, true);
        saved.wishes = (saved.wishes || []).concat(wish).slice(-5);
        store(false, saved);
      }
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = form.elements;
      var err = $('rsvpError');
      err.hidden = true;
      if (f.website.value) return;
      var data = {
        type: 'rsvp',
        name: f.name.value.replace(/\s+/g, ' ').trim(),
        attend: f.attend.value,
        guests: f.attend.value === 'yes' ? Number(f.guests.value) : 0,
        side: f.side.value || '',
        message: f.message.value.trim().slice(0, 500),
        invited: guestName,
        at: new Date().toISOString(),
      };
      if (data.name.length < 2) {
        err.textContent = 'Bạn cho tụi mình xin tên với nhé.';
        err.hidden = false;
        f.name.focus();
        return;
      }
      if (!endpoint) { done(data); return; }
      var btn = $('rsvpSubmit');
      btn.disabled = true;
      btn.textContent = 'Đang gửi...';
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(data),
      })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          done(data);
        })
        .catch(function () {
          err.textContent = 'Chưa gửi được, bạn kiểm tra mạng rồi thử lại giúp tụi mình nhé.';
          err.hidden = false;
          btn.disabled = false;
          btn.textContent = 'Gửi xác nhận';
        });
    });
  })();

  /* ── Mừng cưới ── */
  (function gift() {
    var g = cfg.gift || {};
    if (!g.enabled) return;
    var accounts = (g.accounts || []).filter(function (a) { return a.number || cfg.previewMode; });
    if (!accounts.length) return;
    $('mung-cuoi').hidden = false;
    var box = $('gifts');
    accounts.forEach(function (a) {
      var card = el('article', 'paper gift gift--' + (a.side || 'groom') + ' rv');
      card.appendChild(el('h3', 'gift__label', a.label));
      if (a.qr) {
        var img = el('img', 'gift__qr');
        img.src = a.qr;
        img.alt = 'Mã QR chuyển khoản: ' + a.label;
        img.loading = 'lazy';
        card.appendChild(img);
      } else {
        card.appendChild(el('div', 'gift__qr gift__qr--ph', a.number ? 'Chưa có mã QR' : 'Chỗ đặt mã QR (mẫu)'));
      }
      card.appendChild(el('p', 'gift__bank', a.bank || 'Tên ngân hàng (mẫu)'));
      card.appendChild(el('p', 'gift__holder', a.holder || 'Tên chủ tài khoản (mẫu)'));
      card.appendChild(el('p', 'gift__num', a.number || '0000 0000 0000'));
      var btn = el('button', 'btn');
      btn.type = 'button';
      btn.appendChild(icon('copy'));
      btn.appendChild(document.createTextNode('Sao chép số tài khoản'));
      btn.addEventListener('click', function () {
        if (!a.number) { toast('Số tài khoản đang là mẫu'); return; }
        var text = String(a.number).replace(/\s+/g, '');
        var ok = function () { toast('Đã sao chép số tài khoản'); };
        var fallback = function () {
          var ta = el('textarea');
          ta.value = text;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand('copy'); ok(); } catch (e2) { toast('Bạn chép tay giúp mình nhé: ' + text); }
          ta.remove();
        };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok, fallback);
        else fallback();
      });
      card.appendChild(btn);
      box.appendChild(card);
    });
  })();

  /* ── Nhạc nền ── */
  var player = null;
  var musicBtn = $('musicBtn');
  function syncMusic() {
    var on = !!(player && player.playing);
    musicBtn.setAttribute('aria-pressed', String(on));
    musicBtn.setAttribute('aria-label', on ? 'Tắt nhạc nền' : 'Bật nhạc nền');
  }
  if (cfg.music && cfg.music.enabled && window.WeddingMusic) {
    player = new window.WeddingMusic(cfg.music);
    musicBtn.hidden = false;
    musicBtn.addEventListener('click', function () { player.toggle(); syncMusic(); });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden && player.playing) { player.pause(); player.resumeOnShow = true; }
      else if (!document.hidden && player.resumeOnShow) { player.resumeOnShow = false; player.play(); }
      syncMusic();
    });
  }

  /* ── Hiện dần khi cuộn ── */
  function watchReveal() {
    var nodes = document.querySelectorAll('.rv');
    if (!('IntersectionObserver' in window)) {
      nodes.forEach(function (n) { n.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    nodes.forEach(function (n) { io.observe(n); });
  }

  /* ── Cổng hỷ ── */
  (function gate() {
    var gateEl = $('gate');
    var opened = false;
    function finish() {
      gateEl.classList.add('is-gone');
      document.body.classList.remove('is-locked');
      watchReveal();
    }
    function open(withMusic) {
      if (opened) return;
      opened = true;
      gateEl.classList.add('is-open');
      document.body.classList.add('is-opened');
      if (withMusic && player && cfg.music.startOnOpen) { player.play(); syncMusic(); }
      setTimeout(finish, 1950);
    }
    // ?mo=1: vào thẳng thiệp, bỏ qua cổng (tiện khi xem lại hoặc chụp màn hình)
    if (params.get('mo') === '1') {
      opened = true;
      document.body.classList.add('is-opened');
      finish();
      return;
    }
    gateEl.addEventListener('click', function () { open(true); });

    // Tên dài thì tự thu nhỏ cho vừa nửa cánh cổng.
    function fitNames() {
      var fit = 1;
      gateEl.style.removeProperty('--fit');
      gateEl.querySelectorAll('.gate__who').forEach(function (who) {
        var cs = getComputedStyle(who);
        var inset = parseFloat(who.parentNode.classList.contains('gate__door--l') ? cs.right : cs.left) || 0;
        var room = who.parentNode.clientWidth * 0.84 - inset;
        var need = who.querySelector('.gate__name').getBoundingClientRect().width;
        if (room > 0 && need > room) fit = Math.min(fit, room / need);
      });
      if (fit < 1) gateEl.style.setProperty('--fit', fit.toFixed(3));
    }
    fitNames();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitNames);
    window.addEventListener('resize', fitNames);
  })();
})();
