/* Ported verbatim from docs/poc/finaleee.html (main script). Do not edit without comparing against the POC. */
export const planetVertexShader = `
precision highp float;
attribute vec3 aPosition;
attribute vec4 aMeta;
attribute vec3 aColor;
attribute vec4 aKind;
attribute vec4 aOrbit;
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform vec2 uVelocity;
uniform float uPresence;
uniform float uImpulse;
uniform float uTime;
uniform float uPixelRatio;
uniform float uMove;
uniform float uExplode;
uniform float uZoom;
uniform float uSpin;
uniform float uYaw;
uniform float uBright;
uniform float uCamZ;
varying float vAlpha;
varying float vHeat;
varying float vField;
varying vec3 vColor;
float hash(float n){ return fract(sin(n) * 43758.5453123); }
vec3 rotY(vec3 p, float a){ float c = cos(a), s = sin(a); return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z); }
vec3 rotX(vec3 p, float a){ float c = cos(a), s = sin(a); return vec3(p.x, c * p.y - s * p.z, s * p.y + c * p.z); }
vec3 rotZ(vec3 p, float a){ float c = cos(a), s = sin(a); return vec3(c * p.x - s * p.y, s * p.x + c * p.y, p.z); }
void main(){
  float phase = aMeta.z;
  float speed = aMeta.w;
  float energy = aMeta.x;
  float kind = aKind.x;
  float viewportAspect = uResolution.x / max(uResolution.y, 1.0);
  float imageAspect = 2.0;
  vec2 coverScale = viewportAspect < imageAspect
    ? vec2(imageAspect / viewportAspect, 1.0)
    : vec2(1.0, viewportAspect / imageAspect);
  vec2 radius = vec2(0.16801 * 2.0 * coverScale.x, 0.33602 * 2.0 * coverScale.y);
  vec2 pc0 = vec2((0.72376 - 0.5) * 2.0 * coverScale.x, -(0.51027 - 0.5) * 2.0 * coverScale.y);
  float tiltX = -uPointer.y * 0.14 + sin(uTime * 0.13) * 0.035;
  float tiltY = uPointer.x * 0.22 + sin(uTime * 0.16) * 0.05;
  vec3 p;
  float depthCue = 1.0;
  if (kind < 0.5) {
    /* globe surface: spins like Earth around a slightly tilted axis */
    p = rotX(rotY(rotX(aPosition, -0.2), uSpin), 0.2);
    p = rotY(rotX(p, tiltX), tiltY);
    depthCue = mix(0.3, 1.0, smoothstep(-0.9, 0.9, p.z));
  } else if (kind < 1.5) {
    /* glowing limb stays a perfect circle */
    p = aPosition;
  } else if (kind < 2.5) {
    /* orbit dots flow around their tilted 3D ring */
    float th = aPosition.x + uTime * aKind.y + uSpin * aKind.z;
    float a = aOrbit.x + aPosition.y;
    vec3 q = vec3(a * cos(th), a * sin(th) * cos(aOrbit.y), a * sin(th) * sin(aOrbit.y));
    q.y += aPosition.z;
    p = rotY(rotZ(q, aOrbit.z), uYaw);
    p = rotY(rotX(p, tiltX), tiltY);
    float behind = (1.0 - step(0.0, p.z)) * (1.0 - smoothstep(0.92, 1.04, length(p.xy)));
    depthCue = mix(1.0, 0.22, behind) * mix(0.7, 1.0, smoothstep(-1.6, 1.6, p.z));
  } else {
    p = rotY(aPosition, uYaw * 1.4);
    p = rotY(rotX(p, tiltX), tiltY);
    depthCue = mix(0.5, 1.0, smoothstep(-2.0, 2.0, p.z));
  }
  float persp0 = 1.0 / (1.0 - p.z * 0.09);
  vec2 clip = pc0 + p.xy * radius * persp0;
  float localZ = p.z * 0.33602;
  float seed = phase * 13.7 + aPosition.x * 91.3 + aPosition.y * 57.1 + aPosition.z * 23.9 + kind * 7.1;
  float r1 = hash(seed);
  float r2 = hash(seed + 1.7);
  float r3 = hash(seed + 3.3);
  float r4 = hash(seed + 5.9);
  float microMotion = 0.00065 + energy * 0.00105;
  clip += vec2(sin(uTime * speed + phase), cos(uTime * speed * 0.83 + phase * 1.37)) * microMotion;
  /* ---- planet journey: orbit right -> left, then a real 3D burst into a star tunnel the camera flies through ---- */
  float arc = sin(3.14159 * uMove);
  vec2 pcMoved = vec2(pc0.x * mix(1.0, -0.82, 0.5 - 0.5 * cos(3.14159 * uMove)), pc0.y + 0.14 * arc);
  vec2 pc = mix(pcMoved, vec2(0.0), smoothstep(0.0, 0.7, uExplode));
  float orbitScale = 1.0 - 0.24 * arc;
  clip = pc + (clip - pc0) * orbitScale;
  float F = 2.1445;
  float W = 9.0 / F;
  float depthOn = min(1.0, uExplode * 3.0);
  vec3 planetW = vec3(clip.x * viewportAspect * W, clip.y * W, localZ * 2.0 * coverScale.y * W * orbitScale * depthOn);
  vec3 centerW = vec3(pc.x * viewportAspect * W, pc.y * W, 0.0);
  float leave = smoothstep(r1 * 0.55, r1 * 0.55 + 0.45, uExplode);
  float ang = r2 * 6.2831853;
  float rad = 0.6 + pow(r3, 0.7) * 17.0;
  vec3 starW = vec3(cos(ang) * rad, sin(ang) * rad * 0.75, -100.0 + r4 * 106.0);
  vec3 swirl = normalize(planetW - centerW + vec3(0.0001, 0.0002, 0.0003)) * (1.5 + r1 * 2.5);
  vec3 posW = mix(planetW, starW, leave) + sin(leave * 3.14159) * swirl;
  posW += leave * vec3(sin(uTime * 0.25 + r1 * 30.0), cos(uTime * 0.21 + r2 * 20.0), sin(uTime * 0.15 + r3 * 9.0)) * 0.22;
  float zRel = uCamZ - posW.z;
  float visible = step(0.05, zRel);
  vec2 proj = vec2(posW.x / viewportAspect, posW.y) * F / max(zRel, 0.05);
  float roll = 0.0;
  float cr = cos(roll);
  float sr = sin(roll);
  clip = vec2(proj.x * cr - proj.y * sr, proj.x * sr + proj.y * cr);
  float persp = clamp(9.0 / max(zRel, 0.05), 0.0, 3.0);
  float nearFade = smoothstep(0.15, 1.6, zRel) * visible;
  vec2 cursor = vec2(uPointer.x, -uPointer.y);
  vec2 deltaPx = (clip - cursor) * uResolution * 0.5;
  float cursorDistance = length(deltaPx);
  float cursorSpeed = min(1.0, length(uVelocity) * 12.0);
  float fieldRadius = 70.0 + cursorSpeed * 35.0;
  float field = (1.0 - smoothstep(0.0, fieldRadius, cursorDistance)) * uPresence;
  field *= field;
  float shockRadius = (1.0 - uImpulse) * 180.0;
  float shock = exp(-abs(cursorDistance - shockRadius) * 0.046) * uImpulse * uPresence;
  field = max(field, shock * 0.86);
  vec2 direction = cursorDistance > 0.1 ? deltaPx / cursorDistance : vec2(0.0);
  vec2 tangent = vec2(-direction.y, direction.x);
  float spiral = sin(uTime * 4.6 + phase + cursorDistance * 0.032);
  float wave = sin(cursorDistance * 0.075 - uTime * 7.0 + phase) * field;
  vec2 fieldOffsetPx = direction * ((18.0 + cursorSpeed * 16.0) * field + wave * 5.0 + shock * 22.0)
    + tangent * spiral * (7.0 + cursorSpeed * 13.0) * field;
  clip += fieldOffsetPx * 2.0 / uResolution;
  gl_Position = vec4(clip, 0.0, 1.0);
  float pulse = 0.88 + sin(uTime * (0.62 + speed) + phase) * 0.12;
  float depthScale = 1.0 + p.z * 0.1;
  float planetSize = min(14.5, (0.68 + aMeta.y * 2.15) * pulse * depthScale * (1.0 + field * 0.82) * uPixelRatio * 1.07);
  float twinkle = 0.45 + 0.55 * sin(uTime * (0.9 + r2 * 2.6) + r4 * 40.0);
  float starSize = min(26.0 * uPixelRatio, (1.2 + r3 * 2.6) * 20.0 * (1.0 + 0.7 * leave) / max(zRel, 0.05) * (1.0 + field * 0.82) * uPixelRatio);
  gl_PointSize = visible * mix(min(24.0 * uPixelRatio, planetSize * persp), starSize, leave);
  float planetAlpha = min(1.6, (0.42 + energy * 0.98) * pulse * (1.0 + field * 0.72) * 1.25) * depthCue * uBright;
  float starAlpha = (r1 > 0.5 ? 1.45 : 0.75) * (0.3 + 0.9 * twinkle) * (1.0 + field * 0.72);
  vAlpha = mix(planetAlpha, starAlpha, leave) * nearFade;
  vHeat = mix(energy, 0.7 + r3 * 0.3, leave);
  vField = field;
  vColor = mix(aColor, mix(vec3(0.95, 0.72, 0.32), vec3(1.0, 0.92, 0.72), r2), leave);
}`;
