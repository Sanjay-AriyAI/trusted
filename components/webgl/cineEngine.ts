/**
 * Cinematic scroll engine — ported from the POC `cine-js` script.
 * Scroll = timeline: <main> is pinned as a fixed stage and scrollY scrubs scene transitions,
 * with a stop-by-stop snap engine (one wheel gesture / key press / swipe = one stop).
 *
 * Differences from the POC:
 *  - React renders the scene wrappers, the portal scroll section, the focus pill and the spacer up front;
 *    this engine never moves or clones DOM nodes, it only sets inline styles/classes.
 *  - Writes the planet journey to lib/motion/journey instead of window globals.
 *  - Global key/wheel/touch handlers stand down inside dialogs, the mobile menu and form fields.
 *  - Everything is undone by the returned dispose().
 */
import { Disposer, clamp, ease, isCoarsePointer, isDialogOpen, isTypingTarget, lerp } from "@/lib/motion/env";
import { planetJourney, planetTarget, resetJourney } from "@/lib/motion/journey";

/** Scene order (must match app/(public)/page.tsx). */
export const SCENE_INDEX = {
  hero: 0,
  manifesto: 1,
  portal: 2,
  programs: 3,
  method: 4,
  outcomes: 5,
  employers: 6,
  stories: 7,
  faq: 8,
  finalCta: 9,
} as const;

const PORTAL = SCENE_INDEX.portal;

/** Nav / anchor hash -> scene index. */
const ANCHORS: Record<string, number> = {
  "#top": 0,
  "#signal": 1,
  "#programs": 3,
  "#method": 4,
  "#outcomes": 5,
  "#employers": 6,
  "#spatial-testimonials": 7,
  "#faq": 8,
};

type KidSpec = { sel: string; dx: number[]; dy: number[]; op: boolean; sc: number };
const KID_SPECS: Record<number, KidSpec> = {
  1: { sel: ".metric-rail > div", dx: [0, 0, 0], dy: [70, 70, 70], op: true, sc: 0.06 },
  3: { sel: ".program-card", dx: [-60, 0, 60], dy: [110, 150, 110], op: true, sc: 0.08 },
  4: { sel: ".method-visual", dx: [-160], dy: [0], op: true, sc: 0.25 },
  5: { sel: ".project-grid article", dx: [0, 0, 0, 0], dy: [90, 90, 90, 90], op: true, sc: 0.05 },
  6: { sel: ".talent-card", dx: [160], dy: [0], op: true, sc: 0.06 },
  7: { sel: ".spatial-card", dx: [-170, 0, 170], dy: [50, 120, 50], op: false, sc: 0.1 },
  8: { sel: ".faq-list article", dx: [70, 70, 70, 70], dy: [0, 0, 0, 0], op: true, sc: 0 },
};

type Pose = { x?: number; y?: number; z?: number; rx?: number; ry?: number; s?: number; b?: number; clip?: string };
/* per-scene cinematic transforms: a = 1-enter (0 once fully in), l = leave (0..1) */
const enterLeave = (a: number, l: number): Pose => ({ y: 40 * a - 30 * l, s: 1 - 0.03 * a - 0.03 * l, b: 0 });
const FX: ((a: number, l: number) => Pose)[] = [
  (_a, l) => ({ y: -30 * l, s: 1 - 0.04 * l, b: 0 }),
  enterLeave,
  enterLeave,
  enterLeave,
  enterLeave,
  enterLeave,
  enterLeave,
  enterLeave,
  enterLeave,
  (a) => ({ y: 40 * a, s: 1 - 0.03 * a, b: 0 }),
];

type Kid = { el: HTMLElement; last: string };
type Scene = {
  wrap: HTMLElement;
  fit: HTMLElement;
  spec: KidSpec | undefined;
  kids: Kid[];
  head: HTMLElement | null;
  headLast: string;
  f: number;
  off: number;
  over: number;
  base: number;
  start: number;
  end: number;
  vis: boolean | null;
  act: boolean;
  tf: string;
  fl: string;
  op: string;
  cl: string;
  fitTf: string;
};
type Stop = { scene: number; y: number; portal?: boolean };

export type CineEngine = {
  dispose: () => void;
  /** Index of the scene currently in front. */
  activeScene: () => number;
};

/** The pose of a portal card r positions away from the front, blended continuously. */
const cardPose = (r: number) => {
  const a = Math.abs(r),
    sg = r < 0 ? -1 : 1;
  if (a <= 1)
    return {
      x: 280 * sg * a,
      z: lerp(100, -220, a),
      ry: -28 * sg * a,
      s: lerp(1, 0.82, a),
      o: lerp(1, 0.55, a),
      br: lerp(1, 0.45, a),
      bl: lerp(0, 2, a),
    };
  const t = Math.min(1, a - 1);
  return {
    x: lerp(280, 0, t) * sg,
    z: lerp(-220, -450, t),
    ry: lerp(-28, 0, t) * sg,
    s: lerp(0.82, 0.65, t),
    o: lerp(0.55, 0.2, t),
    br: lerp(0.45, 0.2, t),
    bl: lerp(2, 4, t),
  };
};

export function startCineScroll(main: HTMLElement): CineEngine | null {
  const root = document.documentElement;
  const wraps = Array.from(main.querySelectorAll<HTMLElement>(":scope > .cine-scene"));
  const spacer = document.querySelector<HTMLElement>(".cine-spacer");
  if (!wraps.length || !spacer) return null;

  const d = new Disposer();
  /** Inline style properties we touch, so dispose() can clear exactly those. */
  const touched = new Map<HTMLElement, Set<string>>();
  const setStyle = (el: HTMLElement, prop: string, value: string) => {
    let props = touched.get(el);
    if (!props) touched.set(el, (props = new Set()));
    props.add(prop);
    el.style.setProperty(prop, value);
  };

  /* the scroll version of the academy portal */
  const portalSection = main.querySelector<HTMLElement>(".portal-scroll");
  const pCards = portalSection ? Array.from(portalSection.querySelectorAll<HTMLElement>(".portal-card")) : [];
  const pDots = portalSection ? Array.from(portalSection.querySelectorAll<HTMLElement>(".portal-dots .dot")) : [];
  let portalIdx = -1;
  let portalPos = 0;
  let pTrack: HTMLElement | null = null;
  const pLast: string[] = [];

  const setPortal = (idx: number) => {
    const n = pCards.length;
    pCards.forEach((card, i) => {
      card.classList.remove("active", "next", "prev", "far-next", "far-prev");
      const diff = (i - idx + n) % n;
      card.classList.add(diff === 0 ? "active" : diff === 1 ? "next" : diff === n - 1 ? "prev" : "far-next");
    });
    pDots.forEach((dot, i) => dot.classList.toggle("active", i === idx));
  };

  /* the "See how the academy works" pill that flies into the portal */
  const focusBtn = document.getElementById("open-3d-method-portal");
  const focusWrap = document.querySelector<HTMLElement>(".cine-focus");
  const focusPill = focusWrap?.querySelector<HTMLElement>("button") ?? null;
  let lastFocus = "";
  let focusFrom: { x: number; y: number } | null = null;

  const scenes: Scene[] = wraps.map((wrap, i) => {
    const fit = wrap.querySelector<HTMLElement>(":scope > .cine-fit") ?? wrap;
    const spec = KID_SPECS[i];
    const kids = spec ? Array.from(fit.querySelectorAll<HTMLElement>(spec.sel)).map((el) => ({ el, last: "" })) : [];
    const head = i > 0 ? fit.querySelector<HTMLElement>("h2") : null;
    if (head) {
      setStyle(head, "transform-origin", "50% 100%");
      if (head.parentElement) setStyle(head.parentElement, "perspective", "900px");
    }
    return {
      wrap,
      fit,
      spec,
      kids,
      head,
      headLast: "",
      f: 1,
      off: 0,
      over: 0,
      base: 0,
      start: 0,
      end: 0,
      vis: null,
      act: false,
      tf: "",
      fl: "",
      op: "",
      cl: "",
      fitTf: "",
    };
  });

  let vw = 0,
    vh = 0,
    mob = false,
    T = 0;
  let mx = 0,
    my = 0,
    tmx = 0,
    tmy = 0;
  const finePointer = !isCoarsePointer();

  const measure = () => {
    vw = window.innerWidth;
    vh = window.innerHeight;
    mob = vw <= 820;
    T = vh * (mob ? 0.25 : 0.3);
    const headerH = vw <= 760 ? 72 : 84;
    let pos = 0;
    scenes.forEach((s, i) => {
      setStyle(s.wrap, "display", "block");
      setStyle(s.wrap, "transform", "none");
      setStyle(s.fit, "--fit", "1");
      setStyle(s.fit, "transform", "none");
      const top = i === 0 ? 0 : headerH + 8;
      const avail = vh - top - 16;
      let h = s.fit.offsetHeight,
        f = 1;
      if (!mob && h > avail) {
        f = Math.max(0.78, avail / h);
        setStyle(s.fit, "--fit", String(f));
        h = s.fit.offsetHeight;
      }
      const eff = h * f;
      s.f = f;
      s.over = Math.max(0, eff - avail);
      s.off = s.over > 0 ? top : top + (avail - eff) / 2;
      if (i === 0) s.off = Math.max(0, (vh - eff) / 2);
      s.base = vh * (i === 0 ? 0.3 : i === PORTAL && pCards.length ? 0.4 : 0.25);
      if (i === 1 && focusBtn) {
        /* zoom origin = the "See how the academy works" button */
        const wr = s.wrap.getBoundingClientRect(),
          br = focusBtn.getBoundingClientRect();
        const bx = br.left - wr.left + br.width / 2,
          by = br.top - wr.top + br.height / 2;
        setStyle(s.wrap, "transform-origin", (bx * f).toFixed(1) + "px " + (s.off + by * f).toFixed(1) + "px");
      }
      s.start = pos;
      s.end = pos + s.base + s.over;
      pos = s.end + (i < scenes.length - 1 ? T : 0);
      s.vis = null;
      s.fitTf = "";
      s.tf = "";
      s.fl = "";
      s.op = "";
      s.cl = "";
    });
    setStyle(spacer, "height", pos + vh + "px");
  };

  let activeIndex = 0;

  const render = (y: number) => {
    let best = -1,
      bestOp = 0;
    scenes.forEach((s, i) => {
      const prev = scenes[i - 1];
      const nRaw = i === 0 || !prev ? 1 : clamp((y - prev.end) / T);
      const lRaw = i === scenes.length - 1 ? 0 : clamp((y - s.end) / T);
      const vis = nRaw > 0 && lRaw < 1;
      if (vis !== s.vis) {
        setStyle(s.wrap, "display", vis ? "block" : "none");
        s.vis = vis;
      }
      if (!vis) return;
      const n = ease(nRaw),
        l = ease(lRaw);
      const op = i === 0 ? 1 - clamp(lRaw / 0.6) : clamp((nRaw - 0.1) / 0.6) * (1 - clamp(lRaw / 0.6));
      if (op > bestOp) {
        bestOp = op;
        best = i;
      }
      const p = (FX[i] ?? enterLeave)(1 - n, l);
      const k = mob ? 0 : 1;
      const tiltX = -my * 2.4,
        tiltY = mx * 3.4;
      const tf =
        "translate3d(" +
        ((p.x || 0) * (mob ? 0.5 : 1)).toFixed(1) +
        "px," +
        (p.y || 0).toFixed(1) +
        "px," +
        ((p.z || 0) * k).toFixed(1) +
        "px) rotateX(" +
        (((p.rx || 0) + tiltX) * k).toFixed(2) +
        "deg) rotateY(" +
        (((p.ry || 0) + tiltY) * k).toFixed(2) +
        "deg) scale(" +
        (p.s || 1).toFixed(4) +
        ")";
      /* heading flips up in 3D as the slide arrives */
      if (s.head) {
        const c = ease(clamp((nRaw - 0.15) / 0.65));
        const hv = c >= 0.999 ? "" : "x " + ((1 - c) * 70).toFixed(1) + "deg|0 " + ((1 - c) * 36).toFixed(1) + "px";
        if (hv !== s.headLast) {
          s.headLast = hv;
          const hp = hv ? hv.split("|") : ["", ""];
          setStyle(s.head, "rotate", hp[0] ?? "");
          setStyle(s.head, "translate", hp[1] ?? "");
        }
      }
      /* glow on "See how the academy works" just before the camera flies into it */
      if (i === 1 && focusBtn) {
        const fo = clamp((y - s.end + T * 0.3) / (T * 0.5));
        const fs =
          fo > 0.01
            ? "drop-shadow(0 0 " +
              (6 + 30 * fo).toFixed(1) +
              "px rgba(255,200,90," +
              (0.95 * fo).toFixed(2) +
              ")) brightness(" +
              (1 + 0.8 * fo).toFixed(2) +
              ")"
            : "";
        if (fs !== lastFocus) {
          setStyle(focusBtn, "filter", fs);
          lastFocus = fs;
        }
      }
      /* the 4 academy cards rotate one by one with the scroll */
      if (i === PORTAL && pCards.length) {
        const count = pCards.length;
        const pp = clamp((y - s.start) / Math.max(1, (s.end - s.start) * 0.9));
        portalPos = pp * (count - 1);
        const idx = Math.round(portalPos);
        if (idx !== portalIdx) {
          portalIdx = idx;
          pDots.forEach((dot, kk) => dot.classList.toggle("active", kk === idx));
        }
        const now = performance.now() / 1000;
        pCards.forEach((card, kk) => {
          const ps = cardPose(kk - portalPos);
          const near = Math.max(0, 1 - Math.abs(kk - portalPos));
          const bob = Math.sin(now * 1.2 + kk * 1.7) * 6 * near;
          const v =
            "translate3d(" +
            (ps.x * (mob ? 0.5 : 1)).toFixed(1) +
            "px," +
            bob.toFixed(1) +
            "px," +
            ps.z.toFixed(1) +
            "px) rotateY(" +
            ps.ry.toFixed(2) +
            "deg) rotateX(" +
            (Math.cos(now * 0.9 + kk) * 2.5 * near).toFixed(2) +
            "deg) scale(" +
            ps.s.toFixed(4) +
            ")";
          if (pLast[kk] !== v) {
            pLast[kk] = v;
            setStyle(card, "transform", v);
            setStyle(card, "opacity", ps.o.toFixed(3));
            setStyle(card, "filter", "brightness(" + ps.br.toFixed(3) + ") blur(" + ps.bl.toFixed(2) + "px)");
            setStyle(card, "z-index", String(10 - Math.round(Math.abs(kk - portalPos) * 2)));
            card.classList.toggle("active", kk === idx);
          }
        });
        if (!pTrack) pTrack = s.fit.querySelector<HTMLElement>(".portal-3d-track");
        if (pTrack)
          setStyle(
            pTrack,
            "transform",
            "rotateX(" + (-my * 7).toFixed(2) + "deg) rotateY(" + (mx * 10).toFixed(2) + "deg)",
          );
      }
      if (tf !== s.tf) {
        setStyle(s.wrap, "transform", tf);
        s.tf = tf;
      }
      const fl = "none";
      if (fl !== s.fl) {
        setStyle(s.wrap, "filter", fl);
        s.fl = fl;
      }
      const opS = op.toFixed(3);
      if (opS !== s.op) {
        setStyle(s.wrap, "opacity", opS);
        s.op = opS;
      }
      const cl = mob ? "" : p.clip || "";
      if (cl !== s.cl) {
        setStyle(s.wrap, "clip-path", cl || "none");
        s.cl = cl;
      }
      /* hold: pan tall content with the timeline so nothing is cut off */
      const pan = Math.min(s.over, Math.max(0, y - s.start - s.base * 0.3));
      const ftf = "translate3d(0," + (s.off - pan).toFixed(1) + "px,0) scale(" + s.f.toFixed(4) + ")";
      if (ftf !== s.fitTf) {
        setStyle(s.fit, "transform", ftf);
        s.fitTf = ftf;
      }
      /* staggered children of the scene */
      const spec = s.spec;
      if (spec) {
        const cnt = s.kids.length;
        const span = 1 - (cnt - 1) * 0.12;
        s.kids.forEach((kid, j) => {
          const c = ease(clamp((nRaw - j * 0.12) / span));
          let v: string;
          if (c >= 0.999) v = "done";
          else {
            const dx = (spec.dx[j] || 0) * (mob ? 0.4 : 1),
              dy = (spec.dy[j] || 0) * (mob ? 0.6 : 1);
            v =
              ((1 - c) * dx).toFixed(1) +
              "px " +
              ((1 - c) * dy).toFixed(1) +
              "px|" +
              (1 - (1 - c) * spec.sc).toFixed(4) +
              "|" +
              c.toFixed(3);
          }
          if (v === kid.last) return;
          kid.last = v;
          if (v === "done") {
            setStyle(kid.el, "translate", "");
            setStyle(kid.el, "scale", "");
            if (spec.op) setStyle(kid.el, "opacity", "");
          } else {
            const parts = v.split("|");
            setStyle(kid.el, "translate", parts[0] ?? "");
            setStyle(kid.el, "scale", parts[1] ?? "");
            if (spec.op) setStyle(kid.el, "opacity", parts[2] ?? "");
          }
        });
      }
    });
    /* focus pill: the button lifts out of slide 2, flies to centre over the stars and opens into the portal */
    const s1f = scenes[1];
    if (focusWrap && focusPill && focusBtn && s1f) {
      const L = clamp((y - s1f.end) / T);
      if (L <= 0.001 || L >= 0.999) {
        if (focusWrap.style.opacity !== "0") setStyle(focusWrap, "opacity", "0");
        if (focusBtn.style.visibility) setStyle(focusBtn, "visibility", "");
        if (L <= 0.001 && s1f.vis) {
          const r = focusBtn.getBoundingClientRect();
          if (r.width) focusFrom = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        }
      } else {
        setStyle(focusBtn, "visibility", "hidden");
        const from = focusFrom || { x: vw / 2, y: vh * 0.6 };
        const a1 = ease(clamp(L / 0.45)),
          a2 = ease(clamp((L - 0.45) / 0.4));
        const cx = lerp(from.x, vw / 2, a1),
          cy = lerp(from.y, vh * 0.5, a1);
        const sc = lerp(1, mob ? 1.4 : 1.9, a1) * lerp(1, 1.5, a2);
        setStyle(
          focusWrap,
          "transform",
          "translate3d(" +
            cx.toFixed(1) +
            "px," +
            cy.toFixed(1) +
            "px,0) translate(-50%,-50%) perspective(700px) rotateX(" +
            (-my * 10).toFixed(2) +
            "deg) rotateY(" +
            (mx * 14).toFixed(2) +
            "deg) scale(" +
            sc.toFixed(4) +
            ")",
        );
        setStyle(focusWrap, "opacity", (1 - ease(clamp((L - 0.55) / 0.35))).toFixed(3));
        setStyle(
          focusPill,
          "box-shadow",
          "0 0 " + (20 + 90 * a1).toFixed(0) + "px rgba(225,166,60," + (0.18 + 0.5 * a1).toFixed(3) + ")",
        );
        setStyle(focusPill, "background", "rgba(225,166,60," + (0.08 + 0.16 * a1).toFixed(3) + ")");
      }
    }
    /* planet journey: moves left while slide 2 ("Proof beats prompts") comes in,
       then breaks into stars and zooms in as you leave it for the next slides */
    const s0 = scenes[0];
    const s1 = scenes[1];
    if (s0 && s1) {
      planetTarget.current = {
        move: ease(clamp((y - s0.start) / Math.max(1, (s0.end - s0.start) * 2.5))),
        explode: ease(clamp((y - s1.end + T * 0.2) / (T * 1.8))),
        zoom: clamp((y - s1.end) / (T * 2.5)),
      };
    }
    scenes.forEach((s, i) => {
      const act = i === best;
      if (act !== s.act) {
        s.wrap.classList.toggle("is-active", act);
        s.act = act;
      }
    });
    if (best >= 0) activeIndex = best;
  };

  /* STOP-BY-STOP SNAP ENGINE: one scroll gesture = one stop, played as one smooth animation.
     Every slide is a stop, and each of the 4 academy cards is its own stop. */
  const previousScrollBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto"; /* page css has smooth scrolling, which fights per-frame scrollTo */
  let curStop = 0;
  let isAnimatingSnap = false;
  let snapRaf = 0;
  let cur = window.scrollY,
    raf = 0;

  const getStops = (): Stop[] => {
    const stops: Stop[] = [];
    scenes.forEach((s, i) => {
      if (i === PORTAL && pCards.length > 1) {
        const count = pCards.length;
        for (let j = 0; j < count; j++)
          stops.push({ scene: i, y: Math.round(s.start + (j / (count - 1)) * (s.end - s.start) * 0.9), portal: true });
      } else {
        stops.push({ scene: i, y: Math.round(s.start + (s.end - s.start) * 0.4) });
      }
    });
    return stops;
  };
  const nearestStop = (y: number) => {
    const stops = getStops();
    let bi = 0,
      bd = Infinity;
    stops.forEach((st, i) => {
      const dist = Math.abs(st.y - y);
      if (dist < bd) {
        bd = dist;
        bi = i;
      }
    });
    return bi;
  };
  const sceneToStop = (sceneIdx: number) => getStops().findIndex((st) => st.scene === sceneIdx);

  const tick = () => {
    raf = 0;
    if (!isAnimatingSnap) {
      cur = window.scrollY;
      mx += (tmx - mx) * 0.07;
      my += (tmy - my) * 0.07;
      render(cur);
    }
    const mouseMoving = Math.abs(tmx - mx) > 0.002 || Math.abs(tmy - my) > 0.002;
    const portalLive = pCards.length > 0 && Boolean(scenes[PORTAL]?.vis);
    if (mouseMoving || portalLive) raf = requestAnimationFrame(tick);
  };
  const kick = () => {
    if (!raf && !isAnimatingSnap) raf = requestAnimationFrame(tick);
  };
  d.add(() => {
    cancelAnimationFrame(raf);
    cancelAnimationFrame(snapRaf);
  });

  const goToStop = (idx: number, duration?: number) => {
    const stops = getStops();
    if (!stops.length) return;
    curStop = Math.max(0, Math.min(stops.length - 1, idx));
    const startY = window.scrollY;
    const target = stops[curStop];
    if (!target) return;
    const targetY = target.y;
    if (Math.abs(targetY - startY) < 1) {
      render(targetY);
      return;
    }
    if (duration === undefined) {
      const from = stops[nearestStop(startY)];
      const sameScene = from?.scene === target.scene;
      const planetLeg = !sameScene && Math.max(from?.scene ?? 0, target.scene) <= 3;
      duration = sameScene ? 2000 : planetLeg ? 4200 : 2900;
    }
    const dur = duration;
    isAnimatingSnap = true;
    if (snapRaf) cancelAnimationFrame(snapRaf);
    const startTime = performance.now();

    const stepSnap = (now: number) => {
      const p = Math.min(1, (now - startTime) / dur);
      const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      const newY = startY + (targetY - startY) * e;
      window.scrollTo(0, newY);
      cur = newY;
      mx += (tmx - mx) * 0.07;
      my += (tmy - my) * 0.07;
      render(cur);
      if (p < 1) {
        snapRaf = requestAnimationFrame(stepSnap);
      } else {
        window.scrollTo(0, targetY);
        cur = targetY;
        render(cur);
        isAnimatingSnap = false;
        snapRaf = 0;
        kick();
      }
    };
    snapRaf = requestAnimationFrame(stepSnap);
  };
  const goToScene = (sceneIdx: number, duration?: number) => goToStop(Math.max(0, sceneToStop(sceneIdx)), duration);
  const step = (dir: 1 | -1) => {
    if (isAnimatingSnap) return;
    const stops = getStops();
    const current = stops[curStop];
    const base = current && Math.abs(current.y - window.scrollY) < 4 ? curStop : nearestStop(window.scrollY);
    const next = base + dir;
    if (next < 0 || next > stops.length - 1) return;
    goToStop(next);
  };

  /** Global handlers must not hijack input while a dialog / the mobile menu is open. */
  const standDown = () => isDialogOpen() || Boolean(document.querySelector(".mobile-menu.open"));

  d.on(
    window,
    "scroll",
    () => {
      if (!isAnimatingSnap) curStop = nearestStop(window.scrollY);
      kick();
    },
    { passive: true },
  );

  /* ONE GESTURE = ONE STOP. Trackpad inertia / rapid notches count as the same gesture until the wheel goes quiet. */
  let lastWheel = 0,
    gestureUsed = false;
  d.on(
    window,
    "wheel",
    (e) => {
      if (standDown()) return;
      e.preventDefault();
      const now = performance.now();
      if (now - lastWheel >= 110) gestureUsed = false;
      lastWheel = now;
      if (isAnimatingSnap || gestureUsed || Math.abs(e.deltaY) < 3) return;
      gestureUsed = true;
      step(e.deltaY > 0 ? 1 : -1);
    },
    { passive: false },
  );

  let touchStartY = 0;
  d.on(
    window,
    "touchstart",
    (e) => {
      const touch = e.touches[0];
      if (touch) touchStartY = touch.clientY;
    },
    { passive: true },
  );
  d.on(
    window,
    "touchend",
    (e) => {
      if (standDown()) return;
      const touch = e.changedTouches[0];
      if (!touch) return;
      const deltaY = touchStartY - touch.clientY;
      if (Math.abs(deltaY) > 30) step(deltaY > 0 ? 1 : -1);
    },
    { passive: true },
  );

  d.on(window, "keydown", (e) => {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || standDown() || isTypingTarget(e.target)) return;
    /* Space on a focused button/link activates it; leave that alone */
    const onControl = e.target instanceof HTMLElement && Boolean(e.target.closest("button, a, [role='button']"));
    if (["ArrowDown", "PageDown"].includes(e.key) || (e.key === " " && !onControl)) {
      e.preventDefault();
      step(1);
    } else if (["ArrowUp", "PageUp"].includes(e.key)) {
      e.preventDefault();
      step(-1);
    }
  });

  if (finePointer) {
    d.on(
      window,
      "pointermove",
      (e) => {
        tmx = (e.clientX / Math.max(1, vw)) * 2 - 1;
        tmy = (e.clientY / Math.max(1, vh)) * 2 - 1;
        kick();
      },
      { passive: true },
    );
    /* cards tilt toward the cursor */
    document.querySelectorAll<HTMLElement>(".program-card, .project-grid article").forEach((card) => {
      if (card.parentElement) setStyle(card.parentElement, "perspective", "1100px");
      d.on(card, "pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const dx = (e.clientX - r.left) / r.width - 0.5,
          dy = (e.clientY - r.top) / r.height - 0.5;
        setStyle(
          card,
          "rotate",
          (-dy).toFixed(3) + " " + dx.toFixed(3) + " 0 " + (Math.hypot(dx, dy) * 16).toFixed(2) + "deg",
        );
      });
      d.on(card, "pointerleave", () => {
        const from = card.style.rotate;
        setStyle(card, "rotate", "");
        if (from)
          card.animate([{ rotate: from }, { rotate: "0 0 1 0deg" }], {
            duration: 650,
            easing: "cubic-bezier(.16,1,.3,1)",
          });
      });
    });
  }

  /* arrows, dots and cards of the scroll portal jump to that card on the timeline */
  const goPortal = (i: number) => {
    const count = pCards.length;
    if (!count || isAnimatingSnap) return;
    goToStop(sceneToStop(PORTAL) + Math.max(0, Math.min(count - 1, i)));
  };
  if (portalSection && pCards.length) {
    const pb = portalSection.querySelector<HTMLElement>(".prev-btn"),
      nb = portalSection.querySelector<HTMLElement>(".next-btn");
    if (pb) d.on(pb, "click", () => goPortal(Math.max(0, portalIdx) - 1));
    if (nb) d.on(nb, "click", () => goPortal(Math.max(0, portalIdx) + 1));
    pDots.forEach((dot, i) => d.on(dot, "click", () => goPortal(i)));
    pCards.forEach((card, i) =>
      d.on(card, "click", () => {
        if (i !== portalIdx) goPortal(i);
      }),
    );
    setPortal(0);
  }

  let resizeTimer = 0;
  const remeasure = () => {
    measure();
    cur = window.scrollY;
    render(cur);
  };
  d.on(window, "resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(remeasure, 120);
  });
  d.add(() => window.clearTimeout(resizeTimer));
  if (document.readyState !== "complete") d.on(window, "load", remeasure);
  let alive = true;
  d.add(() => (alive = false));
  void document.fonts?.ready.then(() => {
    if (alive) remeasure();
  });
  const faqList = main.querySelector<HTMLElement>(".faq-list");
  if (faqList) {
    d.on(faqList, "click", () => {
      d.timeout(remeasure, 60);
      d.timeout(remeasure, 520);
    });
  }

  /* nav / anchor links jump to the matching point on the timeline */
  d.on(document, "click", (e) => {
    const target = e.target instanceof Element ? e.target : null;
    const a = target?.closest<HTMLAnchorElement>("a[href*='#']");
    if (!a) return;
    const url = new URL(a.href, window.location.href);
    if (url.pathname !== window.location.pathname) return;
    const idx = ANCHORS[url.hash];
    if (idx === undefined) return;
    e.preventDefault();
    goToScene(idx, 1000);
  });

  /* extra 3D life: cards and panels lean toward the mouse, each at its own depth */
  if (finePointer) {
    const leaners = Array.from(
      document.querySelectorAll<HTMLElement>(
        ".program-card, .talent-card, .project-grid article, .method-visual, .faq-list article",
      ),
    ).map((el, i) => ({ el, d: 0.6 + (i % 3) * 0.25, last: "" }));
    leaners.forEach((o) => {
      if (o.el.parentElement) setStyle(o.el.parentElement, "perspective", "1100px");
    });
    d.loop(() => {
      leaners.forEach((o) => {
        if (!o.el.getClientRects().length) return;
        const r = o.el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const ex = (((tmx + 1) / 2) * vw - (r.left + r.width / 2)) / vw;
        const ey = (((tmy + 1) / 2) * vh - (r.top + r.height / 2)) / vh;
        const v = (-ey * 9 * o.d).toFixed(2) + "|" + (ex * 11 * o.d).toFixed(2);
        if (v === o.last) return;
        o.last = v;
        const parts = v.split("|");
        const ax = parseFloat(parts[0] ?? "0"),
          ay = parseFloat(parts[1] ?? "0");
        const mag = Math.hypot(ax, ay);
        setStyle(
          o.el,
          "rotate",
          mag < 0.05 ? "" : (ax / mag).toFixed(3) + " " + (ay / mag).toFixed(3) + " 0 " + mag.toFixed(2) + "deg",
        );
      });
    });
  }

  measure();
  render(cur);

  /* 3D planet / stars follow the scroll through a damped glide, so they ease in and settle instead of snapping */
  let jLast = performance.now();
  d.loop((now) => {
    const tg = planetTarget.current;
    if (!tg) return;
    const jn = planetJourney.current ?? (planetJourney.current = { ...tg });
    const k = 1 - Math.exp(-Math.min(0.1, (now - jLast) / 1000) * 2.2);
    jLast = now;
    jn.move += (tg.move - jn.move) * k;
    jn.explode += (tg.explode - jn.explode) * k;
    jn.zoom += (tg.zoom - jn.zoom) * k;
  });

  return {
    activeScene: () => activeIndex,
    dispose: () => {
      d.dispose();
      root.style.scrollBehavior = previousScrollBehavior;
      touched.forEach((props, el) => props.forEach((prop) => el.style.removeProperty(prop)));
      touched.clear();
      scenes.forEach((s) => s.wrap.classList.remove("is-active"));
      resetJourney();
    },
  };
}
