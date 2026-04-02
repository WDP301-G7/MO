import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
  StyleSheet,
  Dimensions,
  Animated,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as FaceDetector from "expo-face-detector";
import { WebView } from "react-native-webview";
import { GLView } from "expo-gl";
import { Renderer } from "expo-three";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";

const { width, height } = Dimensions.get("window");

// Face guide oval — glasses are locked to this coordinate space
const OVAL_W = width * 0.72;
const OVAL_H = height * 0.44;
const OVAL_LEFT = (width - OVAL_W) / 2;
const OVAL_TOP = height * 0.13;

// Glasses sit at the eye line (~37% from top of the oval)
const GLASSES_W = OVAL_W * 0.92;
const GLASSES_H = GLASSES_W / 3.2;
const GLASSES_LEFT = OVAL_LEFT + (OVAL_W - GLASSES_W) / 2;
const GLASSES_TOP = OVAL_TOP + OVAL_H * 0.33;

// 3D overlay view — taller than flat glasses to give depth room
const MODEL3D_W = GLASSES_W;
const MODEL3D_H = GLASSES_W * 0.75;
const MODEL3D_LEFT = GLASSES_LEFT;
const MODEL3D_TOP = GLASSES_TOP - (GLASSES_W * 0.75 - GLASSES_H) / 2;

const LARGE_FILE_THRESHOLD_BYTES = 10 * 1024 * 1024;

// Strip texture/image/sampler entries from a GLB's JSON chunk.
// React Native's Image.getSize() hangs silently for data: URIs, which is how
// Three.js's GLTFLoader serves embedded GLB textures in RN.  Removing them
// lets the model render immediately with material colour factors (no textures).
function stripGlbTextures(buffer) {
  try {
    const dv = new DataView(buffer);
    // Validate GLB magic bytes: 0x46546C67 = 'glTF'
    if (dv.getUint32(0, true) !== 0x46546c67) return buffer;
    const jsonLen = dv.getUint32(12, true);
    // Decode the UTF-8 JSON chunk (starts at byte 20 after 12B header + 8B chunk header)
    const jsonStr = new TextDecoder("utf-8").decode(
      new Uint8Array(buffer, 20, jsonLen),
    );
    const json = JSON.parse(jsonStr);
    // Remove all texture-related fields — geometry and material PBR factors stay intact
    delete json.textures;
    delete json.images;
    delete json.samplers;
    if (Array.isArray(json.materials)) {
      json.materials.forEach((m) => {
        const pbr = m.pbrMetallicRoughness;
        if (pbr) {
          delete pbr.baseColorTexture;
          delete pbr.metallicRoughnessTexture;
        }
        delete m.normalTexture;
        delete m.occlusionTexture;
        delete m.emissiveTexture;
        const sg = m.extensions?.KHR_materials_pbrSpecularGlossiness;
        if (sg) {
          delete sg.diffuseTexture;
          delete sg.specularGlossinessTexture;
        }
      });
    }
    // Re-encode JSON.  GLB chunks must be 4-byte aligned; pad with space (0x20).
    const newJsonBytes = new TextEncoder().encode(JSON.stringify(json));
    const pad = (4 - (newJsonBytes.length % 4)) % 4;
    const newJsonPadded = newJsonBytes.length + pad;
    // Everything after the original JSON chunk (binary mesh chunk + any trailing data)
    const binOffset = 20 + jsonLen;
    const binTail = new Uint8Array(
      buffer,
      binOffset,
      buffer.byteLength - binOffset,
    );
    const newTotal = 12 + 8 + newJsonPadded + binTail.length;
    const out = new ArrayBuffer(newTotal);
    const outDv = new DataView(out);
    const outU8 = new Uint8Array(out);
    outDv.setUint32(0, 0x46546c67, true); // magic
    outDv.setUint32(4, 2, true); // version
    outDv.setUint32(8, newTotal, true); // total length
    outDv.setUint32(12, newJsonPadded, true); // JSON chunk length
    outDv.setUint32(16, 0x4e4f534a, true); // JSON chunk type
    outU8.set(newJsonBytes, 20);
    for (let i = 0; i < pad; i++) outU8[20 + newJsonBytes.length + i] = 0x20;
    outU8.set(binTail, 20 + newJsonPadded);
    return out;
  } catch (e) {
    return buffer;
  }
}

// Neutral 3D overlay NDC origin — updated by face detector each frame.
const DEFAULT_FACE = {
  ndcX: 0,
  ndcY: 0.02,
  scale: 0.22,
  roll: 0,
  yaw: 0,
  vx: 0,
  vy: 0,
  lastT: 0,
};

// getUserMedia is blocked inside WKWebView in Expo Go — using native CameraView instead.
// The function below is intentionally unused (kept so diff is minimal if revisiting WebView AR).
function _generateARHtml_unused(glassesImageUrl, productName) {
  // Security: glassesImageUrl comes from our own backend (Supabase / S3),
  // productName is display-only escaped below.
  const safeName = productName
    ? productName.replace(/</g, "&lt;").replace(/>/g, "&gt;")
    : "Kính mắt";

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no">
<title>AR Try-On</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html, body { width:100%; height:100%; overflow:hidden; background:#000; }
  #container { position:relative; width:100%; height:100%; }
  video {
    position:absolute; inset:0;
    width:100%; height:100%;
    object-fit:cover;
    transform:scaleX(-1);   /* mirror front camera */
  }
  canvas {
    position:absolute; inset:0;
    width:100%; height:100%;
    transform:scaleX(-1);   /* keep glasses mirrored with video */
  }
  #status {
    position:absolute; bottom:12px; left:50%; transform:translateX(-50%);
    background:rgba(0,0,0,.55); color:#fff; font-size:13px;
    font-family:sans-serif; padding:6px 16px; border-radius:20px;
    white-space:nowrap; pointer-events:none; transition:opacity .4s;
  }
  #status.hidden { opacity:0; }
</style>
</head>
<body>
<div id="container">
  <video id="video" autoplay playsinline muted></video>
  <canvas id="canvas"></canvas>
  <div id="status">Đang khởi động camera...</div>
</div>

<!-- MediaPipe FaceMesh -->
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js" crossorigin="anonymous"></script>

<script>
(function() {
  'use strict';

  const video   = document.getElementById('video');
  const canvas  = document.getElementById('canvas');
  const ctx     = canvas.getContext('2d');
  const statusEl = document.getElementById('status');

  // ── Glasses image ──
  const glassesImg = new Image();
  glassesImg.crossOrigin = 'anonymous';
  glassesImg.src = ${JSON.stringify(glassesImageUrl || "")};
  let glassesReady = false;
  glassesImg.onload  = () => { glassesReady = true; };
  glassesImg.onerror = () => {
    // If external image fails, show nothing (graceful degrade)
    glassesReady = false;
  };

  // ── Capture requested flag (set by RN postMessage) ──
  let pendingCapture = false;
  let pendingShare   = false;

  // ── MediaPipe FaceMesh ──
  const faceMesh = new FaceMesh({
    locateFile: (file) =>
      'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/' + file
  });

  faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,   // enables iris landmarks (468 → 478 pts)
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });

  // Key landmark indices for glasses placement
  // 33  = left eye outer corner  (from user's perspective: right side of screen)
  // 263 = right eye outer corner (from user's perspective: left side of screen)
  // 168 = nose bridge top
  // 4   = nose tip
  const L_OUTER = 33,  R_OUTER = 263;
  const L_INNER = 133, R_INNER = 362;
  const NOSE_TOP = 168;

  function setStatus(msg, autoHide) {
    statusEl.textContent = msg;
    statusEl.classList.remove('hidden');
    if (autoHide) setTimeout(() => statusEl.classList.add('hidden'), 2000);
  }

  faceMesh.onResults((results) => {
    // Sync canvas size to actual rendered video element size
    const W = video.videoWidth  || canvas.offsetWidth;
    const H = video.videoHeight || canvas.offsetHeight;
    if (canvas.width !== W || canvas.height !== H) {
      canvas.width  = W;
      canvas.height = H;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      const lm = results.multiFaceLandmarks[0];

      // Helper: convert normalised [0,1] landmark to canvas px
      const px = (i) => ({ x: lm[i].x * canvas.width, y: lm[i].y * canvas.height });

      const lo = px(L_OUTER);   // left outer  eye corner
      const ro = px(R_OUTER);   // right outer eye corner
      const li = px(L_INNER);
      const ri = px(R_INNER);
      const noseTop = px(NOSE_TOP);

      // ── Geometry ──
      // eyeWidth: distance between the two outer eye corners
      const eyeW = Math.hypot(ro.x - lo.x, ro.y - lo.y);
      // glasses are ~1.6× eye width (accounting for frame border)
      const glassesW = eyeW * 1.65;
      // aspect ratio of glasses image (fall back to 3:1 if not loaded)
      const aspect = glassesReady && glassesImg.naturalHeight > 0
        ? glassesImg.naturalWidth / glassesImg.naturalHeight
        : 3.2;
      const glassesH = glassesW / aspect;

      // Mid-point of the two outer corners as glasses centre X
      const midX = (lo.x + ro.x) / 2;
      // Place glasses slightly above nose bridge — use nose top landmark
      const midY = noseTop.y - glassesH * 0.05;

      // Rotation angle from eye-line
      const angle = Math.atan2(ro.y - lo.y, ro.x - lo.x);

      // ── Draw glasses ──
      ctx.save();
      ctx.translate(midX, midY);
      ctx.rotate(angle);

      if (glassesReady) {
        ctx.drawImage(
          glassesImg,
          -glassesW / 2, -glassesH / 2,
          glassesW, glassesH
        );
      } else {
        // Fallback: draw simple wireframe glasses
        ctx.strokeStyle = 'rgba(46,134,171,0.9)';
        ctx.lineWidth = 3;
        const hw = glassesW * 0.38;
        const hh = glassesH * 0.45;
        // left lens
        ctx.beginPath();
        ctx.roundRect(-glassesW/2 + (glassesW/2 - hw)/2, -hh, hw*2, hh*2, 8);
        ctx.stroke();
        // right lens
        ctx.beginPath();
        ctx.roundRect(glassesW/2 - hw - (glassesW/2 - hw)/2, -hh, hw*2, hh*2, 8);
        ctx.stroke();
        // bridge
        ctx.beginPath();
        ctx.moveTo(-hw*0.1, 0); ctx.lineTo(hw*0.1, 0);
        ctx.stroke();
      }
      ctx.restore();

      setStatus('', false);
      statusEl.classList.add('hidden');
    } else {
      setStatus('Đưa khuôn mặt vào khung hình', false);
      statusEl.classList.remove('hidden');
    }

    // ── Capture ──
    if (pendingCapture || pendingShare) {
      // Composite video + canvas into one off-screen canvas
      const offscreen = document.createElement('canvas');
      offscreen.width  = canvas.width;
      offscreen.height = canvas.height;
      const offCtx = offscreen.getContext('2d');
      // draw mirrored video frame
      offCtx.translate(offscreen.width, 0);
      offCtx.scale(-1, 1);
      offCtx.drawImage(video, 0, 0, offscreen.width, offscreen.height);
      offCtx.setTransform(1,0,0,1,0,0);
      // draw glasses (canvas is already mirrored so un-mirror then draw)
      offCtx.translate(offscreen.width, 0);
      offCtx.scale(-1, 1);
      offCtx.drawImage(canvas, 0, 0);
      offCtx.setTransform(1,0,0,1,0,0);

      const dataUrl = offscreen.toDataURL('image/jpeg', 0.88);
      const action  = pendingShare ? 'share' : 'capture';
      pendingCapture = false;
      pendingShare   = false;
      // Send base64 image back to React Native
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: action, dataUrl }));
    }
  });

  // ── Camera ──
  const camera = new Camera(video, {
    onFrame: async () => { await faceMesh.send({ image: video }); },
    width: 1280, height: 720, facingMode: 'user',
  });

  camera.start()
    .then(() => setStatus('Đang nhận diện khuôn mặt...', true))
    .catch((err) => {
      setStatus('Không thể mở camera: ' + err.message, false);
      window.ReactNativeWebView?.postMessage(JSON.stringify({ type: 'cameraError', message: err.message }));
    });

  // ── Listen for commands from React Native ──
  window.addEventListener('message', (e) => {
    try {
      const msg = JSON.parse(e.data);
      if (msg.cmd === 'capture') pendingCapture = true;
      if (msg.cmd === 'share')   pendingShare   = true;
    } catch {}
  });
  // iOS WebView uses document.addEventListener
  document.addEventListener('message', (e) => {
    try {
      const msg = JSON.parse(e.data);
      if (msg.cmd === 'capture') pendingCapture = true;
      if (msg.cmd === 'share')   pendingShare   = true;
    } catch {}
  });

})();
</script>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// 3-D model viewer HTML (modal only — overlay now uses expo-gl natively)
// ---------------------------------------------------------------------------
function generate3DModelHtml(modelUrl, productName) {
  const safeName = productName
    ? productName.replace(/</g, "&lt;").replace(/>/g, "&gt;")
    : "Kính mắt";
  const JS_MODEL_URL = JSON.stringify(modelUrl || "");
  const SC = "</" + "script>";
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
  <title>${safeName}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    html,body{width:100%;height:100%;overflow:hidden;background:#F2F4F7;display:flex;flex-direction:column}
    #c3d{flex:1;width:100%;display:block;touch-action:none}
    #hint{padding:10px 16px;background:#E5E7EB;color:rgba(0,0,0,0.45);font-family:-apple-system,sans-serif;font-size:12px;text-align:center}
    #msg{display:none;position:fixed;bottom:60px;left:16px;right:16px;background:rgba(0,0,0,.7);color:#fff;padding:10px 14px;border-radius:10px;font:13px -apple-system,sans-serif;text-align:center;z-index:99}
  </style>
</head>
<body>
  <canvas id="c3d"></canvas>
  <div id="hint">Kéo để xoay · Chụm / Giãn để zoom</div>
  <div id="msg"></div>
<script src="https://cdn.jsdelivr.net/npm/three@0.140.0/build/three.min.js">${SC}
<script src="https://cdn.jsdelivr.net/npm/three@0.140.0/examples/js/loaders/GLTFLoader.js">${SC}
<script src="https://cdn.jsdelivr.net/npm/three@0.140.0/examples/js/environments/RoomEnvironment.js">${SC}
<script src="https://cdn.jsdelivr.net/npm/three@0.140.0/examples/js/controls/OrbitControls.js">${SC}
<script>
(function(){
  var MODEL_URL=${JS_MODEL_URL};
  var canvas=document.getElementById('c3d');
  var msgEl=document.getElementById('msg');
  var say=function(t){msgEl.textContent=t;msgEl.style.display='block';};

  if(typeof THREE==='undefined'){say('Không tải được thư viện 3D');return;}

  // Renderer — same settings as AR view
  var renderer=new THREE.WebGLRenderer({canvas:canvas,antialias:true,alpha:false});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,3));
  renderer.setClearColor(0xF2F4F7,1);
  try{renderer.physicallyCorrectLights=true;}catch(e){}
  try{renderer.outputEncoding=THREE.sRGBEncoding;}catch(e){}
  try{renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;}catch(e){}

  var scene=new THREE.Scene();
  var w=canvas.clientWidth||window.innerWidth;
  var h=canvas.clientHeight||(window.innerHeight-44);
  var camera=new THREE.PerspectiveCamera(45,w/h,0.001,100);
  camera.position.set(0,0,2.5);

  function resize(){
    var W=window.innerWidth,H=window.innerHeight-44;
    renderer.setSize(W,H,false);
    camera.aspect=W/H;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize',resize);

  // Lighting — identical to AR view
  scene.add(new THREE.AmbientLight(0xffffff,0.8));
  var hemi=new THREE.HemisphereLight(0xfff4e0,0x2a3a55,1.8);
  scene.add(hemi);
  var key=new THREE.DirectionalLight(0xfff5e6,3.8);
  key.position.set(0.8,1.5,1.5);scene.add(key);
  var fill=new THREE.DirectionalLight(0xe8f0ff,1.4);
  fill.position.set(-1.5,-0.5,1.0);scene.add(fill);
  var rim=new THREE.DirectionalLight(0xffffff,0.9);
  rim.position.set(0,-1.5,-2.0);scene.add(rim);

  // IBL — RoomEnvironment, same as AR view
  try{
    if(typeof THREE.RoomEnvironment!=='undefined'){
      var pmrem=new THREE.PMREMGenerator(renderer);
      pmrem.compileEquirectangularShader();
      scene.environment=pmrem.fromScene(new THREE.RoomEnvironment(),0.04).texture;
      pmrem.dispose();
    }
  }catch(e){}

  // OrbitControls
  var controls=null;
  if(typeof THREE.OrbitControls!=='undefined'){
    controls=new THREE.OrbitControls(camera,canvas);
    controls.enablePan=false;
    controls.enableDamping=true;
    controls.dampingFactor=0.08;
    controls.minDistance=0.3;
    controls.maxDistance=8;
    controls.autoRotate=true;
    controls.autoRotateSpeed=1.2;
  }

  // Load GLB
  new THREE.GLTFLoader().load(MODEL_URL,function(gltf){
    var obj=gltf.scene;
    var box=new THREE.Box3().setFromObject(obj);
    var center=box.getCenter(new THREE.Vector3());
    var size=box.getSize(new THREE.Vector3());
    var maxDim=Math.max(size.x,size.y,size.z)||1;
    var scale=1.5/maxDim;
    obj.scale.setScalar(scale);
    obj.position.sub(center.multiplyScalar(scale));
    scene.add(obj);
    // Disable auto-rotate on user interaction
    if(controls){
      canvas.addEventListener('pointerdown',function(){controls.autoRotate=false;},{once:true});
    }
    msgEl.style.display='none';
  },undefined,function(err){
    say('Không thể tải mô hình 3D');
  });

  // Render loop
  function animate(){
    requestAnimationFrame(animate);
    if(controls)controls.update();
    renderer.render(scene,camera);
  }
  animate();
})();
${SC}
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// MediaPipe FaceMesh 468+iris landmarks + Three.js AR — runs inside a WebView.
// three@0.140.0 UMD (last stable branch with examples/js + RoomEnvironment).
// Improvements over previous version:
//   • refineLandmarks:true  → full 478-pt mesh (iris included)
//   • Face normal (3-D cross-product) → dynamic Z push into curved face surface
//   • Pitch estimation from face-normal Y component
//   • Thin BoxGeometry face-plane occluder (replaces sphere)
//   • PMREMGenerator + RoomEnvironment IBL for physically-based reflections
//   • HemisphereLight sky/ground gradient
//   • Camera light estimation — samples 16×16 from video every ~2 s
//   • ACESFilmic tone-mapping + sRGB output encoding
// ---------------------------------------------------------------------------
function generateFaceMeshARHtml(modelUrl) {
  const JS_MODEL_URL = JSON.stringify(modelUrl || "");
  const SC = "</" + "script>";
  return `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no">
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:100%;height:100%;overflow:hidden;background:#000}
#vid{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transform:scaleX(-1)}
#c3d{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
#msg{position:fixed;bottom:80px;left:10px;right:10px;
  color:#000;background:#ffcc00;padding:12px 18px;border-radius:12px;
  font:bold 14px -apple-system,sans-serif;white-space:pre-wrap;
  text-align:center;pointer-events:none;z-index:9999;border:2px solid #e6a800}
</style>
</head><body>
<video id="vid" autoplay playsinline muted></video>
<canvas id="c3d"></canvas>
<div id="msg">\u0110ang t\u1ea3i th\u01b0 vi\u1ec7n...</div>
<script>
try{document.getElementById('msg').textContent='\u0110ang t\u1ea3i... (B1 JS ok)';window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(JSON.stringify({type:'debug',message:'STEP1: HTML inline script OK'}));}catch(e){}
${SC}
<script src="https://cdn.jsdelivr.net/npm/three@0.140.0/build/three.min.js">${SC}
<script src="https://cdn.jsdelivr.net/npm/three@0.140.0/examples/js/loaders/GLTFLoader.js">${SC}
<script src="https://cdn.jsdelivr.net/npm/three@0.140.0/examples/js/environments/RoomEnvironment.js">${SC}
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js" crossorigin="anonymous">${SC}
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js" crossorigin="anonymous">${SC}
<script>
try{
  var _st2='STEP2: THREE='+(typeof THREE)+' RoomEnv='+(typeof THREE!=='undefined'&&typeof THREE.RoomEnvironment)+' FaceMesh='+(typeof FaceMesh)+' Camera='+(typeof Camera);
  document.getElementById('msg').textContent=_st2;
  window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(JSON.stringify({type:'debug',message:_st2}));
}catch(e){}
${SC}
<script>
window.onerror=function(msg,_,line,col,err){
  var el=document.getElementById('msg');
  if(el){el.textContent='Lỗi JS: '+msg+(line?(' L'+line):'')+' '+(err&&err.stack?err.stack.split('\\n')[1]||'':'');el.style.background='rgba(180,0,0,.9)';}
  return false;
};
(function(){'use strict';
var dbg=function(m){window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(JSON.stringify({type:'debug',message:m}));};
var MODEL_URL=${JS_MODEL_URL};
var vid=document.getElementById('vid');
var c3d=document.getElementById('c3d');
var msgEl=document.getElementById('msg');
var say=function(t,err){msgEl.textContent=t;msgEl.style.display='block';msgEl.style.background=err?'rgba(180,0,0,.9)':'rgba(0,0,0,.7)';};
var quiet=function(){msgEl.style.display='none';};

if(typeof THREE==='undefined'){say('Lỗi: không tải được Three.js',true);return;}
if(typeof FaceMesh==='undefined'){say('Lỗi: không tải được FaceMesh',true);return;}
if(typeof Camera==='undefined'){say('Lỗi: không tải được Camera utils',true);return;}

// ── A: WebGL renderer ────────────────────────────────────────────────────────
var renderer;
try{
  renderer=new THREE.WebGLRenderer({canvas:c3d,alpha:true,antialias:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});
}catch(e){say('Lỗi WebGL: '+(e&&e.message||e),true);dbg('WebGL FAIL: '+e);return;}
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,3));
renderer.setClearColor(0x000000,0);
// Physically-correct light falloff — required for accurate PBR shading.
// Without this Three.js ignores the inverse-square law, making metal/glass look flat.
try{renderer.physicallyCorrectLights=true;}catch(e){}
// ACESFilmic tone-mapping gives more natural metal/glass highlights
try{renderer.outputEncoding=THREE.sRGBEncoding;}catch(e){}
try{renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;}catch(e){}

var FOV=60;
var scene=new THREE.Scene();
var cam3=new THREE.PerspectiveCamera(FOV,innerWidth/innerHeight,0.001,100);
cam3.position.z=1;
var resize=function(){
  renderer.setSize(innerWidth,innerHeight,false);
  cam3.aspect=innerWidth/innerHeight;
  cam3.updateProjectionMatrix();
};
resize();window.addEventListener('resize',resize);
renderer.render(scene,cam3);
dbg('STEP-A: renderer OK');
say('Đang khởi tạo...');

// ── A1: Physical lighting setup ───────────────────────────────────────────────
// physicallyCorrectLights=true uses SI units (candela/lux). Multiply previous
// "game-engine" intensities by ~Math.PI to get equivalent brightness.
var ambLight=new THREE.AmbientLight(0xffffff,0.8);
scene.add(ambLight);
var hemiLight=new THREE.HemisphereLight(0xfff4e0,0x2a3a55,1.8);
scene.add(hemiLight);
var keyLight=new THREE.DirectionalLight(0xfff5e6,3.8);
keyLight.position.set(0.8,1.5,1.5);scene.add(keyLight);
var fillLight=new THREE.DirectionalLight(0xe8f0ff,1.4);
fillLight.position.set(-1.5,-0.5,1.0);scene.add(fillLight);
var rimLight=new THREE.DirectionalLight(0xffffff,0.9);
rimLight.position.set(0,-1.5,-2.0);scene.add(rimLight);

// ── A2: IBL — PMREMGenerator + RoomEnvironment ────────────────────────────────
// Provides physically-based image-based lighting so metal/glass lenses get
// realistic reflections. Guarded: EXT_color_buffer_float is required and
// unavailable on some iOS devices — lights above act as fallback.
try{
  if(typeof THREE.RoomEnvironment!=='undefined'){
    var pmrem=new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    var roomEnvTex=pmrem.fromScene(new THREE.RoomEnvironment(),0.04).texture;
    scene.environment=roomEnvTex;
    pmrem.dispose();
    dbg('STEP-A2: RoomEnvironment IBL OK');
  } else {
    dbg('STEP-A2: RoomEnvironment not available, lights only');
  }
}catch(envErr){
  dbg('STEP-A2: PMREMGenerator failed (EXT_color_buffer_float?): '+envErr);
}

// ── A3: Camera light estimation ───────────────────────────────────────────────
// Samples a 16×16 thumbnail of the live video every ~2 s.
// Uses the average luminance + tint to dynamically adjust light intensities,
// so glasses brightness roughly matches the scene.
var _lCanvas=document.createElement('canvas');
_lCanvas.width=16;_lCanvas.height=16;
var _lCtx=_lCanvas.getContext('2d',{willReadFrequently:true});
var _lFrame=0;
function _updateLightEst(){
  _lFrame++;
  if(_lFrame%60!==0)return; // every ~2 s at 30 fps
  try{
    _lCtx.drawImage(vid,0,0,16,16);
    var d=_lCtx.getImageData(2,2,12,12).data;
    var r=0,g=0,b=0,n=d.length/4;
    for(var i=0;i<d.length;i+=4){r+=d[i];g+=d[i+1];b+=d[i+2];}
    var fr=r/n/255,fg=g/n/255,fb=b/n/255;
    var lum=0.2126*fr+0.7152*fg+0.0722*fb;
    ambLight.intensity=0.4+lum*1.2;
    hemiLight.intensity=0.8+lum*1.6;
    keyLight.intensity=2.4+lum*3.0;
    keyLight.color.setRGB(
      Math.min(1,0.96+fr*0.08),
      Math.min(1,0.96+fg*0.06),
      Math.min(1,0.91+fb*0.06)
    );
    fillLight.intensity=0.5+lum*1.2;
  }catch(e){}
}

// ── A4: Thin face-plane occluder ──────────────────────────────────────────────
// A flat box (thin in Z) writes depth-only so glasses temple arms that pass
// behind the face are correctly clipped when the head turns (yaw ≠ 0).
// renderOrder 0 ensures depth is written BEFORE glasses (order 1).
var occ=new THREE.Mesh(
  new THREE.BoxGeometry(1,1,0.04),
  new THREE.MeshBasicMaterial({colorWrite:false,depthWrite:true,side:THREE.FrontSide})
);
occ.renderOrder=0;
scene.add(occ);
dbg('STEP-A: thin face-plane occluder added');

// ── B: Load GLB ────────────────────────────────────────────────────────────────
// NOTE: Do NOT strip textures here — the WebView GLTFLoader handles embedded
// textures correctly. Stripping is only needed in the native expo-gl path.
var glasses=null,baseSize=1.0;
if(MODEL_URL){
  say('Đang tải mô hình 3D...');
  dbg('STEP-B: loading model '+MODEL_URL.slice(0,80));
  new THREE.GLTFLoader().load(MODEL_URL,function(gltf){
    var obj=gltf.scene;
    var box=new THREE.Box3().setFromObject(obj);
    var center=box.getCenter(new THREE.Vector3());
    var sz=box.getSize(new THREE.Vector3());
    // Normalise so the longest axis = 1 unit; tracking code then scales to IPD.
    baseSize=Math.max(sz.x,sz.y,sz.z)||1.0;
    obj.scale.setScalar(1/baseSize);
    // Shift origin to model centre so rotation is around the nose-bridge pivot.
    obj.position.sub(center.multiplyScalar(1/baseSize));
    // Front camera: model must face +Z (toward viewer). Most eyewear GLBs are
    // authored with the front facing +Z already; if yours faces -Z uncomment:
    // obj.rotation.y = Math.PI;
    obj.renderOrder=1;
    // ── Per-mesh quality settings ──────────────────────────────────────────────
    var maxAniso=renderer.capabilities.getMaxAnisotropy();
    obj.traverse(function(c){
      if(c.isMesh){
        c.renderOrder=1;
        var mats=Array.isArray(c.material)?c.material:[c.material];
        mats.forEach(function(m){
          // Boost IBL reflection contribution — makes metal/glass look shiny & realistic.
          if(m.envMapIntensity!==undefined) m.envMapIntensity=1.8;
          // DoubleSide for opaque parts only; skip transparent lenses.
          if(!m.transparent&&(m.opacity===undefined||m.opacity>=0.95)){
            m.side=THREE.DoubleSide;
          }
          // Max anisotropic filtering on every texture — prevents blurry look at angle.
          ['map','normalMap','roughnessMap','metalnessMap','aoMap','emissiveMap'].forEach(function(slot){
            if(m[slot]&&m[slot].isTexture){
              m[slot].anisotropy=maxAniso;
              m[slot].needsUpdate=true;
            }
          });
          m.needsUpdate=true;
        });
      }
    });
    scene.add(obj);glasses=obj;
    dbg('STEP-B: model loaded, baseSize='+baseSize.toFixed(3));
    say('Đang nhận diện khuôn mặt...');
  },undefined,function(e){
    dbg('STEP-B: model error '+e);
    say('Lỗi model: '+(e&&e.message||String(e)),true);
  });
}

// ── C: Tracking state ──────────────────────────────────────────────────────────
var px=0,py=0,ps=0.1,facing='user',faceDetected=false;
var qCur=new THREE.Quaternion(),qTgt=new THREE.Quaternion();

// ── Landmark indices (MediaPipe FaceMesh 468 + iris with refineLandmarks) ────
// Right/left are from the model's perspective (mirrored for front camera).
var IDX_L_OUTER=33,IDX_R_OUTER=263;         // eye outer corners
var IDX_NOSE_BRIDGE=168,IDX_NOSE_BASE=1;    // nose landmark
var IDX_FOREHEAD=10,IDX_CHIN=152;           // vertical axis
var IDX_L_CHEEK=234,IDX_R_CHEEK=454;        // horizontal face width

// ── C1: FaceMesh — full 478-pt mesh with iris ────────────────────────────────
var faceMesh=new FaceMesh({locateFile:function(f){
  return 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/'+f;
}});
faceMesh.setOptions({
  maxNumFaces:1,
  refineLandmarks:true,           // enables iris landmarks (468→478 pts)
  minDetectionConfidence:0.45,
  minTrackingConfidence:0.45
});
dbg('STEP-C: FaceMesh created (refineLandmarks=true, 478 pts)');

// ── C2: onResults — core tracking (468 landmarks + face normal + pitch) ───────
faceMesh.onResults(function(res){
  var lm=res.multiFaceLandmarks&&res.multiFaceLandmarks[0];
  if(!lm){
    faceDetected=false;
    say('Đưa khuôn mặt vào khung hình');
    return;
  }
  faceDetected=true;
  _updateLightEst();

  var halfH=Math.tan(THREE.MathUtils.degToRad(FOV/2));
  var halfW=halfH*cam3.aspect;

  // Front camera: MediaPipe outputs un-mirrored normalised coords (0→1).
  // The <video> element is CSS-mirrored (scaleX(-1)), but the WebGL canvas is
  // NOT mirrored. So for front cam we must flip x: ndcX = -(lm.x - 0.5)*2.
  // For rear cam no flip is needed.
  var FLIP=facing==='user'?-1:1;

  // ── Key landmarks ──────────────────────────────────────────────────────────
  var lo=lm[IDX_L_OUTER],ro=lm[IDX_R_OUTER]; // eye outer corners
  var nb=lm[IDX_NOSE_BRIDGE];                  // landmark 168 — nose bridge top
  var lc=lm[IDX_L_CHEEK],rc=lm[IDX_R_CHEEK];
  var fh=lm[IDX_FOREHEAD],ch=lm[IDX_CHIN];

  // ── Eye midpoint — glasses horizontal pivot ────────────────────────────────
  // Use the midpoint of the two OUTER eye corners as the glasses centre X.
  // Nose bridge (168) can drift vertically; eye midpoint is more stable.
  var eyeMidX=(lo.x+ro.x)*0.5;
  var eyeMidY=(lo.y+ro.y)*0.5;

  // World-space target position (camera at z=1, looking down -Z)
  var tx=(eyeMidX-0.5)*2*FLIP*halfW;
  // Glasses vertical centre: blend eye-line (70%) with nose-bridge (30%).
  // Outer corners tend to sit slightly above the nose-pad saddle; blending
  // brings the frame centre down to iris/nose-pad level for a snug fit.
  var blendY=eyeMidY*0.70+nb.y*0.30;
  var ty=-(blendY-0.5)*2*halfH;

  // ── IPD-based scale ────────────────────────────────────────────────────────
  // Eye spread in world units. Scale so the normalised model (longest axis=1)
  // spans ~1.9× the eye-to-eye distance (typical eyewear width ratio).
  var eyeDx_raw=ro.x-lo.x;  // raw, un-flipped (always positive: lo.x < ro.x)
  var eyeDy_raw=ro.y-lo.y;
  var eyeSpreadW=Math.hypot(eyeDx_raw*halfW*2,eyeDy_raw*halfH*2);
  // ts is the target THREE.js scale for the glasses object.
  // 1.75× eye-spread: glasses outer edge extends slightly past outer eye corners,
  // matching the typical physical width of eyewear frames.
  var ts=eyeSpreadW*1.35;

  // ── Roll — angle of the eye-line in screen space ───────────────────────────
  // We use RAW (un-flipped) x so the sign matches the visual tilt.
  // eyeDx_raw = ro.x - lo.x. For front cam the video is mirrored, so visually
  // left-tilt means ro.x < lo.x → negative slope. We negate for front cam.
  var roll=Math.atan2(eyeDy_raw, eyeDx_raw)*FLIP;

  // ── Yaw (head turn left/right) ────────────────────────────────────────────
  var faceW=rc.x-lc.x;
  var faceMidX=(lc.x+rc.x)*0.5;
  // Positive yaw = face turned to viewer's right (world +Y axis rotation).
  // For front cam: MediaPipe's x increases to the right of the raw image,
  // but the video is visually mirrored, so we apply FLIP.
  var yaw=faceW>0.01?((nb.x-faceMidX)/faceW)*Math.PI*0.50*FLIP:0;

  // ── Face normal via 3-D cross product ─────────────────────────────────────
  // Vector A: right_eye_outer → left_eye_outer in model coords (FLIP applied)
  var ax=(lo.x-ro.x)*FLIP,ay=lo.y-ro.y,az=(lo.z||0)-(ro.z||0);
  // Vector B: forehead → chin (downward face axis, FLIP applied for x)
  var bx=(ch.x-fh.x)*FLIP,by=ch.y-fh.y,bz=(ch.z||0)-(fh.z||0);
  var nx=ay*bz-az*by,ny=az*bx-ax*bz,nz=ax*by-ay*bx;
  var nlen=Math.sqrt(nx*nx+ny*ny+nz*nz)||1;
  nx/=nlen;ny/=nlen;nz/=nlen;

  // ── Pitch from face-normal Y component ────────────────────────────────────
  var pitch=Math.max(-0.30,Math.min(0.30,-ny*0.50));

  // ── Dynamic Z push — glasses stay flush on the curved face surface ─────────
  // pushDepth is negative (toward camera). Base 0.12 (was 0.055) makes the
  // glasses lie closer to the face surface. Magnitude grows with |yaw| so the
  // visible temple arm doesn't float when the head turns.
  var faceNormalZ=Math.max(0.10,nz);
  var pushDepth=-ts*(0.12+Math.abs(yaw)*0.28)/faceNormalZ;
  pushDepth=Math.max(pushDepth,-ts*0.40); // clamp

  // ── Quaternion target ──────────────────────────────────────────────────────
  qTgt.setFromEuler(new THREE.Euler(pitch,yaw,-roll,'YXZ'));

  // ── Lerp — position fast, scale medium, rotation smooth ───────────────────
  px+=(tx-px)*0.55;
  py+=(ty-py)*0.55;
  ps+=(ts-ps)*0.40;
  qCur.slerp(qTgt,0.42);

  // ── Apply to glasses model ─────────────────────────────────────────────────
  if(glasses){
    glasses.position.set(px,py,pushDepth);
    glasses.scale.setScalar(ps);
    glasses.quaternion.copy(qCur);
  }

  // ── Thin face-plane occluder ───────────────────────────────────────────────
  var faceWorldW=eyeSpreadW*2.1;
  var noseCx=(lm[IDX_NOSE_BASE].x-0.5)*2*FLIP*halfW;
  var noseCy=-(lm[IDX_NOSE_BASE].y-0.5)*2*halfH;
  occ.position.set(noseCx,noseCy,pushDepth*0.55);
  occ.scale.set(faceWorldW,faceWorldW*1.45,1);
  occ.quaternion.copy(qCur);

  quiet();
});

// ── D: RAF render loop ────────────────────────────────────────────────────────
var rafActive=true;
(function tick(){
  if(!rafActive)return;
  requestAnimationFrame(tick);
  renderer.render(scene,cam3);
  // Capture / share composite (video frame + 3-D overlay)
  if(window._vtoCapture||window._vtoShare){
    var action=window._vtoShare?'share':'capture';
    window._vtoCapture=window._vtoShare=false;
    var W=vid.videoWidth||innerWidth,H=vid.videoHeight||innerHeight;
    var off=document.createElement('canvas');off.width=W;off.height=H;
    var ctx=off.getContext('2d');
    if(facing==='user'){ctx.translate(W,0);ctx.scale(-1,1);}
    ctx.drawImage(vid,0,0,W,H);
    if(facing==='user')ctx.setTransform(1,0,0,1,0,0);
    ctx.drawImage(c3d,0,0,W,H);
    window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(
      JSON.stringify({type:action,dataUrl:off.toDataURL('image/jpeg',0.88)}));
  }
})();
dbg('STEP-D: RAF loop started');

// ── E: Camera (MediaPipe camera_utils) ───────────────────────────────────────
say('Đang mở camera...');
dbg('STEP-E: starting camera');
var mpCam=new Camera(vid,{
  onFrame:async function(){await faceMesh.send({image:vid});},
  width:1280,height:720,facingMode:'user'
});
mpCam.start()
  .then(function(){
    dbg('STEP-E: camera started OK, videoW='+vid.videoWidth+' videoH='+vid.videoHeight);
    say(glasses?'Đang nhận diện khuôn mặt...':'Đưa khuôn mặt vào khung hình');
  })
  .catch(function(e){
    dbg('STEP-E: camera error '+e);
    say('Lỗi camera: '+(e&&e.message||String(e)),true);
    window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(
      JSON.stringify({type:'cameraError',message:e&&e.message||String(e)}));
  });

// Camera flip handler
setInterval(function(){
  if(window._vtoFlip){
    var f=window._vtoFlip;window._vtoFlip=null;facing=f;
    mpCam.stop();
    mpCam=new Camera(vid,{onFrame:async function(){await faceMesh.send({image:vid});},width:1280,height:720,facingMode:f});
    mpCam.start().catch(function(e){say('Lỗi camera: '+(e&&e.message||e),true);});
    vid.style.transform=f==='user'?'scaleX(-1)':'scaleX(1)';
    // Reset position tracking so glasses don't jump when camera switches
    px=0;py=0;ps=0.1;
    qCur.identity();
  }
},200);

})();
${SC}
</body></html>`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function VirtualTryOnScreen({ navigation, route }) {
  const product = route.params?.product || null;
  const model3dUrl = route.params?.model3dUrl || product?.model3dUrl || null;
  const model3dSizeBytes =
    route.params?.model3dSizeBytes || product?.model3dSizeBytes || null;
  const glassesImageUrl = product?.imageUrl || product?.image || null;

  const [permission, requestPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] =
    MediaLibrary.usePermissions();
  const [facing, setFacing] = useState("front");
  const [glassesOn, setGlassesOn] = useState(true);
  const [show3DModel, setShow3DModel] = useState(false);
  // arHtml: pre-built HTML string (computed once per model URL)
  // Served with baseUrl='https://localhost/' so WKWebView grants getUserMedia
  // baseUrl='https://localhost/' lets WKWebView grant getUserMedia + load CDN scripts.
  const arHtml = model3dUrl ? generateFaceMeshARHtml(model3dUrl) : "";
  const cameraRef = useRef(null);
  const animFrameRef = useRef(null);
  const glModelRef = useRef(null); // holds the Three.js model group
  const faceRef = useRef({ ...DEFAULT_FACE });
  const glCameraRef = useRef(null);
  const webViewRef = useRef(null);

  // Pulse animation on flat-image fallback
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.75,
          duration: 850,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 850,
          useNativeDriver: true,
        }),
      ]),
    );
    anim.start();
    const t = setTimeout(() => {
      anim.stop();
      pulseAnim.setValue(1);
    }, 3600);
    return () => {
      anim.stop();
      clearTimeout(t);
    };
  }, [pulseAnim]);

  // Cleanup GL animation loop on unmount (kept for safety — loop only runs if GLView active)
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // ── WebView message handler (capture / share from MediaPipe AR view) ──────
  const handleWebViewMessage = useCallback(
    async (event) => {
      try {
        const msg = JSON.parse(event.nativeEvent.data);
        // Debug messages from inside the WebView
        if (msg.type === "debug") {
          return;
        }
        if (msg.type === "capture" || msg.type === "share") {
          const base64 = msg.dataUrl.replace(/^data:image\/\w+;base64,/, "");
          const fileUri =
            FileSystem.cacheDirectory + "vto_" + Date.now() + ".jpg";
          await FileSystem.writeAsStringAsync(fileUri, base64, {
            encoding: "base64",
          });
          if (msg.type === "capture") {
            let granted = mediaPermission?.granted;
            if (!granted) {
              const r = await requestMediaPermission();
              granted = r.granted;
            }
            if (!granted) {
              Alert.alert(
                "C\u1ea7n quy\u1ec1n",
                "Vui l\u00f2ng c\u1ea5p quy\u1ec1n truy c\u1eadp th\u01b0 vi\u1ec7n \u1ea3nh.",
              );
              return;
            }
            await MediaLibrary.saveToLibraryAsync(fileUri);
            Alert.alert(
              "\u0110\u00e3 l\u01b0u!",
              "\u1ea2nh th\u1eed k\u00ednh \u0111\u00e3 \u0111\u01b0\u1ee3c l\u01b0u v\u00e0o th\u01b0 vi\u1ec7n.",
            );
          } else {
            const ok = await Sharing.isAvailableAsync();
            if (ok)
              await Sharing.shareAsync(fileUri, { mimeType: "image/jpeg" });
            else
              Alert.alert(
                "Th\u00f4ng b\u00e1o",
                "Chia s\u1ebb kh\u00f4ng kh\u1ea3 d\u1ee5ng tr\u00ean thi\u1ebft b\u1ecb n\u00e0y.",
              );
          }
        }
      } catch (e) {
        // ignore
      }
    },
    [mediaPermission, requestMediaPermission],
  );

  // Native OpenGL renderer — called once when GLView is ready
  const onGLContextCreate = useCallback(
    async (gl) => {
      const { drawingBufferWidth: w, drawingBufferHeight: h } = gl;

      const renderer = new Renderer({ gl, alpha: true, antialias: true });
      renderer.setSize(w, h);
      renderer.setClearColor(0x000000, 0);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(30, w / h, 0.001, 100);
      camera.position.set(0, 0.08, 3.2); // đẩy camera xa hơn
      glCameraRef.current = camera;

      // LIGHTING RẤT MẠNH ĐẶC BIỆT CHO MODEL TỐI MÀU
      scene.add(new THREE.AmbientLight(0xffffff, 3.2)); // tăng mạnh
      const hemi = new THREE.HemisphereLight(0xffffff, 0xdddddd, 2.0);
      scene.add(hemi);

      const key = new THREE.DirectionalLight(0xffffff, 4.5);
      key.position.set(4, 5, 6);
      scene.add(key);

      const fill = new THREE.DirectionalLight(0xffffff, 2.8);
      fill.position.set(-4, -2, 3);
      scene.add(fill);

      // Environment map
      try {
        const pmremGen = new THREE.PMREMGenerator(renderer);
        scene.environment = pmremGen.fromScene(
          new RoomEnvironment(),
          0.08,
        ).texture;
        pmremGen.dispose();
      } catch (e) {
        // IBL not available
      }

      // Occluder
      const occluder = new THREE.Mesh(
        new THREE.SphereGeometry(0.7, 32, 24),
        new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: true }),
      );
      occluder.renderOrder = 0;
      scene.add(occluder);

      // Load model
      const loader = new GLTFLoader();
      fetch(model3dUrl)
        .then((res) => res.arrayBuffer())
        .then((buffer) => {
          const data = stripGlbTextures(buffer);
          loader.parse(data, "", (gltf) => {
            const obj = gltf.scene;
            const box = new THREE.Box3().setFromObject(obj);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);

            // Scale lớn hơn cho model Gucci
            obj.scale.setScalar(1.35 / maxDim);
            obj.position.sub(center);

            obj.rotation.x = -0.06;

            obj.traverse((child) => {
              if (!child.isMesh) return;
              child.renderOrder = 1;

              const mat = child.material;
              if (!mat) return;

              const name = (child.name || "").toLowerCase();

              if (
                name.includes("lens") ||
                name.includes("glass") ||
                mat.transparent
              ) {
                // Lens trong cho Gucci
                child.material = new THREE.MeshPhysicalMaterial({
                  color: 0x222222,
                  metalness: 0.2,
                  roughness: 0.05,
                  transmission: 0.95, // tăng độ trong
                  thickness: 0.8,
                  envMapIntensity: 2.5,
                  clearcoat: 1.0,
                  transparent: true,
                  depthWrite: false,
                  side: THREE.DoubleSide,
                });
              } else {
                // Frame tối → tăng độ sáng và reflection
                if (mat.isMeshStandardMaterial || mat.isMeshPhysicalMaterial) {
                  mat.metalness = 0.9;
                  mat.roughness = 0.18;
                  mat.envMapIntensity = 3.0; // tăng mạnh reflection
                  mat.needsUpdate = true;
                }
              }
            });

            scene.add(obj);
            glModelRef.current = obj;
          });
        })
        .catch(() => {});

      // Animation loop
      const animate = () => {
        requestAnimationFrame(animate);

        const face = faceRef.current;
        const L = 0.9;

        if (glModelRef.current) {
          // Đẩy kính xuống thấp hơn một chút
          glModelRef.current.position.x +=
            (face.ndcX * 1.08 - glModelRef.current.position.x) * L;
          glModelRef.current.position.y +=
            (face.ndcY * 1.18 - 0.04 - glModelRef.current.position.y) * L; // -0.04 để hạ xuống
        }

        renderer.render(scene, camera);
        gl.endFrameEXP();
      };

      animate();
    },
    [model3dUrl],
  );

  const handleTakePicture = async () => {
    if (glassesOn && model3dUrl && webViewRef.current) {
      webViewRef.current.injectJavaScript("window._vtoCapture=true; true;");
      return;
    }
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.88 });
      let granted = mediaPermission?.granted;
      if (!granted) {
        const res = await requestMediaPermission();
        granted = res.granted;
      }
      if (!granted) {
        Alert.alert("Cần quyền", "Vui lòng cấp quyền truy cập thư viện ảnh.");
        return;
      }
      await MediaLibrary.saveToLibraryAsync(photo.uri);
      Alert.alert("Đã lưu!", "Ảnh thử kính đã được lưu vào thư viện.");
    } catch {
      Alert.alert("Lỗi", "Không thể chụp ảnh. Vui lòng thử lại.");
    }
  };

  const handleShare = async () => {
    if (glassesOn && model3dUrl && webViewRef.current) {
      webViewRef.current.injectJavaScript("window._vtoShare=true; true;");
      return;
    }
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.88 });
      const ok = await Sharing.isAvailableAsync();
      if (ok) {
        await Sharing.shareAsync(photo.uri, { mimeType: "image/jpeg" });
      } else {
        Alert.alert("Thông báo", "Chia sẻ không khả dụng trên thiết bị này.");
      }
    } catch {
      Alert.alert("Lỗi", "Không thể chia sẻ.");
    }
  };

  const handleOpen3DModel = () => {
    const isLargeFile =
      model3dSizeBytes && model3dSizeBytes > LARGE_FILE_THRESHOLD_BYTES;
    if (isLargeFile) {
      const sizeMB = (model3dSizeBytes / (1024 * 1024)).toFixed(1);
      Alert.alert(
        "File mô hình 3D lớn",
        `Mô hình 3D có kích thước ${sizeMB} MB. Việc tải có thể mất một chút thời gian.`,
        [
          { text: "Huỷ", style: "cancel" },
          { text: "Vẫn xem", onPress: () => setShow3DModel(true) },
        ],
      );
    } else {
      setShow3DModel(true);
    }
  };

  // Permission screens
  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={styles.permScreen}>
        <StatusBar style="dark" />
        <Ionicons name="camera-outline" size={72} color="#2E86AB" />
        <Text style={styles.permTitle}>Cần quyền truy cập camera</Text>
        <Text style={styles.permDesc}>
          Tính năng thử kính ảo cần dùng camera để hiển thị kính lên khuôn mặt
          của bạn.
        </Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnTxt}>Cấp quyền camera</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.permBack}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.permBackTxt}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* ── AR: MediaPipe FaceLandmarker + Three.js in WebView (zero-lag 30fps)
           Falls back to native CameraView when no 3D model is available. ── */}
      {glassesOn && model3dUrl ? (
        <WebView
          ref={webViewRef}
          style={StyleSheet.absoluteFill}
          source={{ html: arHtml, baseUrl: "https://localhost/" }}
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled
          domStorageEnabled
          originWhitelist={["*"]}
          mediaCapturePermissionGrantType="grant"
          allowsAirPlayForMediaPlayback={false}
          onMessage={handleWebViewMessage}
        />
      ) : (
        <>
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            facing={facing}
            mute
          />
          {glassesOn && glassesImageUrl && (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.glassesWrap,
                {
                  top: GLASSES_TOP,
                  left: GLASSES_LEFT,
                  width: GLASSES_W,
                  height: GLASSES_H,
                  opacity: pulseAnim,
                },
              ]}
            >
              <Image
                source={{ uri: glassesImageUrl }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="contain"
              />
            </Animated.View>
          )}
        </>
      )}

      {/* ── Face guide oval removed ── */}

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {product?.name ? `Thử: ${product.name}` : "Thử kính ảo"}
        </Text>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => {
            const nf = facing === "front" ? "back" : "front";
            setFacing(nf);
            // If WebView AR is active, flip camera inside WebView (no remount)
            webViewRef.current?.injectJavaScript(
              "window._vtoFlip='" +
                (nf === "front" ? "user" : "environment") +
                "'; true;",
            );
          }}
        >
          <Ionicons name="camera-reverse-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* ── Floating badge ── */}
      <View style={styles.badges} pointerEvents="none">
        <View style={[styles.badge, { backgroundColor: "#F18F01" }]}>
          <Text style={styles.badgeTxt}>AR Live</Text>
        </View>
        {model3dUrl && (
          <View
            style={[styles.badge, { backgroundColor: "#2E86AB", marginTop: 6 }]}
          >
            <Text style={styles.badgeTxt}>3D Model</Text>
          </View>
        )}
      </View>

      {/* ── Camera controls ── */}
      <View style={styles.controls}>
        {glassesImageUrl && (
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setGlassesOn((v) => !v)}
          >
            <Ionicons
              name={glassesOn ? "glasses" : "glasses-outline"}
              size={26}
              color="#fff"
            />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.shutterOuter}
          onPress={handleTakePicture}
        >
          <View style={styles.shutterInner} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={handleShare}>
          <Ionicons name="share-outline" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* ── Bottom product panel ── */}
      <View style={styles.bottomPanel}>
        <View style={styles.panelHandle} />

        {product && (
          <View style={styles.productRow}>
            {glassesImageUrl ? (
              <Image
                source={{ uri: glassesImageUrl }}
                style={styles.productThumb}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.productThumb, styles.productThumbEmpty]}>
                <Ionicons name="glasses-outline" size={24} color="#999" />
              </View>
            )}
            <View style={styles.productMeta}>
              <Text style={styles.productName} numberOfLines={1}>
                {product.name}
              </Text>
              {product.price ? (
                <Text style={styles.productPrice}>
                  {Number(product.price).toLocaleString("vi-VN")}đ
                </Text>
              ) : null}
            </View>
            <TouchableOpacity
              style={styles.buyBtn}
              onPress={() =>
                navigation.navigate("ProductDetail", { productId: product.id })
              }
            >
              <Text style={styles.buyBtnTxt}>Mua ngay</Text>
            </TouchableOpacity>
          </View>
        )}

        {model3dUrl && (
          <TouchableOpacity
            style={styles.view3DBtn}
            onPress={handleOpen3DModel}
          >
            <Ionicons name="cube-outline" size={20} color="#2E86AB" />
            <Text style={styles.view3DTxt}>Xem mô hình 3D tương tác</Text>
            <Ionicons name="chevron-forward" size={16} color="#2E86AB" />
          </TouchableOpacity>
        )}

        {!product && (
          <Text style={styles.hint}>
            Mở tính năng này từ trang chi tiết sản phẩm để thử kính lên khuôn
            mặt bạn.
          </Text>
        )}
      </View>

      {/* ── 3D Model Viewer Modal ── */}
      {model3dUrl && (
        <Modal
          visible={show3DModel}
          animationType="slide"
          onRequestClose={() => setShow3DModel(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setShow3DModel(false)}
              >
                <Ionicons name="chevron-down" size={26} color="#333" />
              </TouchableOpacity>
              <Text style={styles.modalTitle} numberOfLines={1}>
                {product?.name || "Mô hình 3D"}
              </Text>
              <View style={{ width: 40 }} />
            </View>
            <WebView
              source={{
                html: generate3DModelHtml(
                  model3dUrl,
                  product?.name || "Kính mắt",
                ),
              }}
              style={{ flex: 1 }}
              allowsInlineMediaPlayback
              mediaPlaybackRequiresUserAction={false}
              javaScriptEnabled
              domStorageEnabled
              originWhitelist={["*"]}
              onError={() => Alert.alert("Lỗi", "Không thể tải mô hình 3D.")}
            />
            <View style={styles.arHintRow}>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color="#666"
              />
              <Text style={styles.arHintTxt}>
                Dùng ngón tay để xoay mô hình. Nhấn biểu tượng AR để thử kính
                trong không gian thực.
              </Text>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },

  /* Header */
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 20,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },

  /* Badges */
  badges: { position: "absolute", top: 118, right: 16, zIndex: 10 },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  badgeTxt: { color: "#fff", fontSize: 11, fontWeight: "700" },

  /* Controls */
  controls: {
    position: "absolute",
    bottom: 200,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 28,
    zIndex: 10,
  },
  shutterOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: "#fff",
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  shutterInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fff",
  },

  /* Bottom panel */
  bottomPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: 34,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  panelHandle: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#ddd",
    alignSelf: "center",
    marginBottom: 16,
  },
  productRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  productThumb: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
  },
  productThumbEmpty: { alignItems: "center", justifyContent: "center" },
  productMeta: { flex: 1, marginLeft: 12 },
  productName: { fontSize: 14, fontWeight: "700", color: "#333" },
  productPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2E86AB",
    marginTop: 2,
  },
  buyBtn: {
    backgroundColor: "#2E86AB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  buyBtnTxt: { color: "#fff", fontWeight: "700", fontSize: 13 },
  view3DBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#2E86AB",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 8,
  },
  view3DTxt: { flex: 1, color: "#2E86AB", fontWeight: "700", fontSize: 14 },
  hint: {
    textAlign: "center",
    color: "#999",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 4,
  },

  /* 3D Modal */
  modalContainer: { flex: 1, backgroundColor: "#0d0d1a" },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: "#fff",
  },
  modalCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333",
    flex: 1,
    textAlign: "center",
  },
  arHintRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#f5f5f5",
    gap: 8,
  },
  arHintTxt: { flex: 1, fontSize: 12, color: "#666", lineHeight: 18 },

  /* AR overlay */
  glassesWrap: { position: "absolute", zIndex: 8 },
  faceOval: {
    position: "absolute",
    zIndex: 7,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.55)",
    borderStyle: "dashed",
    borderRadius: 999,
  },
  eyeLine: {
    position: "absolute",
    height: 1,
    backgroundColor: "rgba(46,134,171,0.4)",
    zIndex: 7,
  },
  guideLabelWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 7,
  },
  guideLabelTxt: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    fontWeight: "600",
    backgroundColor: "rgba(0,0,0,0.35)",
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
  },

  /* Permission screen */
  permScreen: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  permTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1a1a1a",
    marginTop: 20,
    textAlign: "center",
  },
  permDesc: {
    fontSize: 14,
    color: "#666",
    lineHeight: 22,
    textAlign: "center",
    marginTop: 12,
  },
  permBtn: {
    marginTop: 32,
    backgroundColor: "#2E86AB",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 36,
  },
  permBtnTxt: { color: "#fff", fontWeight: "800", fontSize: 15 },
  permBack: { marginTop: 16 },
  permBackTxt: { color: "#2E86AB", fontWeight: "600", fontSize: 14 },
});
