/**
 * fictional-time.js
 * Real 2026 dates → fictional timeline (F1CC time).
 * All boundary points at 12:00 UTC.
 * Output is identical worldwide (GMT/UTC based).
 *
 * Last range (WB): Aug 16 – Sep 16 → Dec 13 – Feb 11 (winter break)
 *
 * Simple usage (news page):
 *   FictionalTime.start({ dateEl: 'fic-date', timeEl: 'fic-time' });
 *
 * Extended usage (test page):
 *   FictionalTime.start({
 *     realDateEl, realTimeEl, realMsEl,
 *     ficDateEl, ficTimeEl, ficMsEl,
 *     rangeEl, speedEl, interval: 50
 *   });
 */
const FictionalTime = (() => {
  const RANGES = [
    { rn:'R1',  rs:[2026,4,23,12,0], re:[2026,4,24,12,0], fs:[2026,2,8,12,0],  fe:[2026,2,15,12,0] },
    { rn:'R2',  rs:[2026,4,24,12,0], re:[2026,4,30,12,0], fs:[2026,2,15,12,0], fe:[2026,2,29,12,0] },
    { rn:'R3',  rs:[2026,4,30,12,0], re:[2026,4,31,12,0], fs:[2026,2,29,12,0], fe:[2026,3,12,12,0] },
    { rn:'R4',  rs:[2026,4,31,12,0], re:[2026,5,6,12,0],  fs:[2026,3,12,12,0], fe:[2026,3,26,12,0] },
    { rn:'R5',  rs:[2026,5,6,12,0],  re:[2026,5,7,12,0],  fs:[2026,3,26,12,0], fe:[2026,4,10,12,0] },
    { rn:'R6',  rs:[2026,5,7,12,0],  re:[2026,5,13,12,0], fs:[2026,4,10,12,0], fe:[2026,4,24,12,0] },
    { rn:'R7',  rs:[2026,5,13,12,0], re:[2026,5,14,12,0], fs:[2026,4,24,12,0], fe:[2026,4,31,12,0] },
    { rn:'R8',  rs:[2026,5,14,12,0], re:[2026,5,20,12,0], fs:[2026,4,31,12,0], fe:[2026,5,14,12,0] },
    { rn:'R9',  rs:[2026,5,20,12,0], re:[2026,5,21,12,0], fs:[2026,5,14,12,0], fe:[2026,5,28,12,0] },
    { rn:'R10', rs:[2026,5,21,12,0], re:[2026,5,27,12,0], fs:[2026,5,28,12,0], fe:[2026,6,5,12,0]  },
    { rn:'R11', rs:[2026,5,27,12,0], re:[2026,5,28,12,0], fs:[2026,6,5,12,0],  fe:[2026,6,12,12,0] },
    { rn:'R12', rs:[2026,5,28,12,0], re:[2026,6,4,12,0],  fs:[2026,6,12,12,0], fe:[2026,6,26,12,0] },
    { rn:'R13', rs:[2026,6,4,12,0],  re:[2026,6,5,12,0],  fs:[2026,6,26,12,0], fe:[2026,7,2,12,0]  },
    { rn:'R14', rs:[2026,6,5,12,0],  re:[2026,6,25,12,0], fs:[2026,7,2,12,0],  fe:[2026,8,6,12,0]  },
    { rn:'R15', rs:[2026,6,25,12,0], re:[2026,6,26,12,0], fs:[2026,8,6,12,0],  fe:[2026,8,20,12,0] },
    { rn:'R16', rs:[2026,6,26,12,0], re:[2026,7,1,12,0],  fs:[2026,8,20,12,0], fe:[2026,8,27,12,0] },
    { rn:'R17', rs:[2026,7,1,12,0],  re:[2026,7,2,12,0],  fs:[2026,8,27,12,0], fe:[2026,9,25,12,0] },
    { rn:'R18', rs:[2026,7,2,12,0],  re:[2026,7,8,12,0],  fs:[2026,9,25,12,0], fe:[2026,10,1,12,0] },
    { rn:'R19', rs:[2026,7,8,12,0],  re:[2026,7,9,12,0],  fs:[2026,10,1,12,0], fe:[2026,10,8,12,0] },
    { rn:'R20', rs:[2026,7,9,12,0],  re:[2026,7,15,12,0], fs:[2026,10,8,12,0], fe:[2026,10,29,12,0]},
    { rn:'R21', rs:[2026,7,15,12,0], re:[2026,7,16,12,0], fs:[2026,10,29,12,0],fe:[2026,11,13,12,0]},
    // Winter Break: Aug 16 → Sep 16  real,  Dec 13 → Feb 11 (next year) fictional
    { rn:'WB',  rs:[2026,7,16,12,0], re:[2026,8,16,12,0], fs:[2026,11,13,12,0],fe:[2027,1,11,12,0] },
  ];

  function toUtcMs(arr) {
    return Date.UTC(arr[0], arr[1], arr[2], arr[3] || 0, arr[4] || 0);
  }

  function pad2(n) { return String(Math.floor(n)).padStart(2, '0'); }
  function pad3(n) { return String(Math.floor(n)).padStart(3, '0'); }

  function formatTime(dt) {
    return `${pad2(dt.getUTCHours())}:${pad2(dt.getUTCMinutes())}`;
  }

  function formatTimeHMS(dt) {
    return `${pad2(dt.getUTCHours())}:${pad2(dt.getUTCMinutes())}:${pad2(dt.getUTCSeconds())}`;
  }

  function formatMs(dt) {
    return `.${pad3(dt.getUTCMilliseconds())}`;
  }

  function formatDate(dt) {
    return `${pad2(dt.getUTCDate())}.${pad2(dt.getUTCMonth() + 1)}.${dt.getUTCFullYear()}`;
  }

  function getFictionalTime() {
    const nowMs = Date.now();

    let found = null;
    for (const r of RANGES) {
      if (nowMs >= toUtcMs(r.rs) && nowMs < toUtcMs(r.re)) {
        found = r;
        break;
      }
    }

    if (!found) return { inRange: false };

    const realStart = toUtcMs(found.rs);
    const realEnd   = toUtcMs(found.re);
    const ficStart  = toUtcMs(found.fs);
    const ficEnd    = toUtcMs(found.fe);
    const speed     = (ficEnd - ficStart) / (realEnd - realStart);
    const ficDt     = new Date(ficStart + (nowMs - realStart) * speed);

    return {
      inRange: true,
      rangeName: found.rn,
      speed: speed,
      ficDate: formatDate(ficDt),
      ficTime: formatTime(ficDt),
      ficTimeFull: formatTimeHMS(ficDt),
      ficMs: formatMs(ficDt),
    };
  }

  function start(options = {}) {
    const {
      dateEl, timeEl, interval = 1000,
      realDateEl, realTimeEl, realMsEl,
      ficDateEl, ficTimeEl, ficMsEl,
      rangeEl, speedEl,
      onTick
    } = options;

    const simple = !!(dateEl || timeEl);

    function set(id, val) {
      if (!id) return;
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    }

    function tick() {
      const info = getFictionalTime();

      if (info.inRange) {
        if (simple) {
          set(dateEl, info.ficDate);
          set(timeEl, info.ficTime);
        } else {
          const now = new Date();
          set(realDateEl, now.toLocaleDateString());
          set(realTimeEl, `${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`);
          set(realMsEl, `.${pad3(now.getMilliseconds())}`);
          set(ficDateEl, info.ficDate);
          set(ficTimeEl, info.ficTimeFull);
          set(ficMsEl,   info.ficMs);
          set(rangeEl,   info.rangeName);
          set(speedEl,   info.speed.toFixed(2) + '×');
        }
      } else {
        if (simple) {
          set(dateEl, '--.--.----');
          set(timeEl, '--:--');
        } else {
          set(ficDateEl, '—');
          set(ficTimeEl, '--:--:--');
          set(ficMsEl,   '');
          set(rangeEl,   'out of range');
          set(speedEl,   '—');
        }
      }

      if (typeof onTick === 'function') onTick(info);
    }

    tick();
    return setInterval(tick, interval);
  }

  return { start, getFictionalTime };
})();
