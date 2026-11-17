/*
 * Nhạc nền: giai điệu hộp nhạc "Canon in D" (Pachelbel, thuộc phạm vi công cộng),
 * tạo trực tiếp bằng Web Audio, không tải tệp nào. Nếu config có music.src thì phát tệp đó thay thế.
 * Chỉ phát sau khi khách chạm vào trang.
 */
(function () {
  'use strict';

  var BPM = 62;
  var SPB = 60 / BPM;
  var BASS = [50, 45, 47, 42, 43, 50, 43, 45];
  var ARP = [
    [62, 66, 69, 66], [61, 64, 69, 64], [62, 66, 71, 66], [61, 66, 69, 66],
    [62, 67, 71, 67], [62, 66, 69, 66], [62, 67, 71, 67], [61, 64, 69, 64],
  ];
  var MELODY_A = [90, 88, 86, 85, 83, 81, 83, 85];
  var MELODY_B = [86, 85, 83, 81, 79, 78, 79, 76];

  function buildScore() {
    var notes = [];
    var cycles = [MELODY_A, MELODY_B, MELODY_A];
    cycles.forEach(function (melody, cycle) {
      for (var c = 0; c < 8; c++) {
        var beat = cycle * 16 + c * 2;
        notes.push({ beat: beat, midi: BASS[c], vel: 0.3, voice: 'bass' });
        ARP[c].forEach(function (midi, i) {
          notes.push({ beat: beat + i * 0.5, midi: midi, vel: i === 0 ? 0.2 : 0.15, voice: 'bell' });
        });
        notes.push({ beat: beat, midi: melody[c], vel: 0.34, voice: 'bell' });
        if (cycle === 2) notes.push({ beat: beat + 1, midi: melody[c] - 12, vel: 0.18, voice: 'bell' });
      }
    });
    notes.sort(function (a, b) { return a.beat - b.beat; });
    return { notes: notes, beats: cycles.length * 16 };
  }

  function MusicBox() {
    this.ctx = null;
    this.master = null;
    this.bus = null;
    this.timer = null;
    this.suspendTimer = null;
    this.score = buildScore();
    this.index = 0;
    this.loop = 0;
    this.origin = 0;
    this.volume = 0.5;
  }

  MusicBox.prototype.ensure = function () {
    if (this.ctx) return this.ctx;
    var Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    if (navigator.audioSession) {
      try { navigator.audioSession.type = 'playback'; } catch (e) { /* bỏ qua */ }
    }
    var ctx = new Ctor();
    var master = ctx.createGain();
    master.gain.value = 0;
    var tone = ctx.createBiquadFilter();
    tone.type = 'lowpass';
    tone.frequency.value = 5200;
    var reverb = ctx.createConvolver();
    var length = Math.floor(ctx.sampleRate * 2.6);
    var buffer = ctx.createBuffer(2, length, ctx.sampleRate);
    for (var ch = 0; ch < 2; ch++) {
      var data = buffer.getChannelData(ch);
      for (var i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3.2);
    }
    reverb.buffer = buffer;
    var wet = ctx.createGain();
    wet.gain.value = 0.32;
    var bus = ctx.createGain();
    bus.connect(tone);
    tone.connect(master);
    tone.connect(reverb);
    reverb.connect(wet);
    wet.connect(master);
    master.connect(ctx.destination);
    this.ctx = ctx;
    this.master = master;
    this.bus = bus;
    return ctx;
  };

  MusicBox.prototype.start = function (volume) {
    this.volume = volume;
    var ctx = this.ensure();
    if (!ctx) return;
    clearTimeout(this.suspendTimer);
    ctx.resume();
    var now = ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(this.volume * 0.62, now + 2.2);
    if (this.timer === null) {
      if (this.origin === 0) this.origin = now + 0.12;
      this.schedule();
    }
  };

  MusicBox.prototype.stop = function () {
    var ctx = this.ctx;
    if (!ctx) return;
    var self = this;
    var now = ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(0, now + 0.7);
    clearTimeout(this.suspendTimer);
    this.suspendTimer = setTimeout(function () {
      clearTimeout(self.timer);
      self.timer = null;
      ctx.suspend();
    }, 800);
  };

  MusicBox.prototype.schedule = function () {
    var ctx = this.ctx;
    if (!ctx) return;
    var self = this;
    var horizon = ctx.currentTime + 0.3;
    var notes = this.score.notes;
    var beats = this.score.beats;
    for (;;) {
      var note = notes[this.index];
      var at = this.origin + (this.loop * beats + note.beat) * SPB;
      if (at > horizon) break;
      if (at >= ctx.currentTime - 0.05) this.play(note, at + (Math.random() - 0.5) * 0.012);
      this.index += 1;
      if (this.index >= notes.length) {
        this.index = 0;
        this.loop += 1;
      }
    }
    this.timer = setTimeout(function () { self.schedule(); }, 90);
  };

  MusicBox.prototype.play = function (note, at) {
    var ctx = this.ctx;
    var f = 440 * Math.pow(2, (note.midi - 69) / 12);
    var env = ctx.createGain();
    env.connect(this.bus);
    var bass = note.voice === 'bass';
    var partials = bass ? [[1, 1], [2, 0.35]] : [[1, 1], [2, 0.22], [4.02, 0.06]];
    var decay = bass ? 2.6 : Math.max(0.9, 2.1 - (note.midi - 60) * 0.035);
    env.gain.setValueAtTime(0.0001, at);
    env.gain.exponentialRampToValueAtTime(note.vel, at + (bass ? 0.02 : 0.004));
    env.gain.exponentialRampToValueAtTime(0.0001, at + decay);
    partials.forEach(function (p) {
      var osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = f * p[0];
      var g = ctx.createGain();
      g.gain.value = p[1];
      osc.connect(g);
      g.connect(env);
      osc.start(at);
      osc.stop(at + decay + 0.05);
    });
  };

  /* Trình phát chung: tệp nhạc nếu có, nếu không thì hộp nhạc. */
  function Player(config) {
    this.config = config || {};
    this.playing = false;
    this.box = null;
    this.audio = null;
  }

  Player.prototype.play = function () {
    var volume = typeof this.config.volume === 'number' ? this.config.volume : 0.55;
    if (this.config.src) {
      if (!this.audio) {
        this.audio = new Audio(this.config.src);
        this.audio.loop = true;
        this.audio.preload = 'auto';
      }
      this.audio.volume = volume;
      var p = this.audio.play();
      if (p && p.catch) p.catch(function () { /* trình duyệt chặn tự phát */ });
    } else {
      if (!this.box) this.box = new MusicBox();
      this.box.start(volume);
    }
    this.playing = true;
  };

  Player.prototype.pause = function () {
    if (this.audio) this.audio.pause();
    if (this.box) this.box.stop();
    this.playing = false;
  };

  Player.prototype.toggle = function () {
    if (this.playing) this.pause(); else this.play();
    return this.playing;
  };

  window.WeddingMusic = Player;
})();
