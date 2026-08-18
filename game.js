const canvas = document.querySelector('#game'), ctx = canvas.getContext('2d');
const video = document.querySelector('#webcam');
const ui = { score:document.querySelector('#score'), best:document.querySelector('#best'), lives:document.querySelector('#lives'), combo:document.querySelector('#combo'), status:document.querySelector('#handStatus'), intro:document.querySelector('#intro'), over:document.querySelector('#gameOver'), final:document.querySelector('#finalScore') };
let W=0,H=0, objects=[], sparks=[], trail=[], score=0,lives=3, combo=0, lastSlice=0, playing=false, handLandmarker, cameraOn=false, lastVideo=0, nextSpawn=0;
// Throttle detection to reduce CPU/GPU usage (ms between detections)
let lastDetectAt = 0;
const detectIntervalMs = 66; // ~15 FPS
let best=+localStorage.getItem('slice-spark-best')||0; ui.best.textContent=String(best).padStart(4,'0');
const fruitTypes=[['#ff584e','#ffb547','APPLE'],['#f59ab1','#ffe1e5','PEACH'],['#f5bf27','#fff076','LEMON'],['#8ad153','#d5f790','KIWI'],['#a978db','#e5b8fa','PLUM']];
function resize(){ const r=canvas.getBoundingClientRect(), d=devicePixelRatio; canvas.width=r.width*d;canvas.height=r.height*d;ctx.setTransform(d,0,0,d,0,0);W=r.width;H=r.height; }
addEventListener('resize',resize); resize();
function freshGame(){ objects=[];sparks=[];trail=[];score=0;lives=3;combo=0;nextSpawn=0;playing=true;ui.intro.classList.add('hidden');ui.over.classList.add('hidden'); updateUI(); }
function updateUI(){ui.score.textContent=String(score).padStart(4,'0');ui.lives.textContent='♥ '.repeat(lives).trim()+' '+('♡ '.repeat(3-lives)).trim();ui.combo.textContent=combo>1?`${combo}x COMBO!`:'';}
function spawn(){ const bomb=Math.random()<Math.min(.12+score/3500,.31), type=fruitTypes[Math.floor(Math.random()*fruitTypes.length)], r=27+Math.random()*10; objects.push({x:60+Math.random()*(W-120),y:H+45,vx:(Math.random()-.5)*3.1,vy:-7.8-Math.random()*4.2,g:.17,r,bomb,type,spin:(Math.random()-.5)*.13,angle:0,sliced:false}); }
function drawFruit(o){ctx.save();ctx.translate(o.x,o.y);ctx.rotate(o.angle); if(o.bomb){ctx.fillStyle='#1f2631';ctx.beginPath();ctx.arc(0,0,o.r,0,7);ctx.fill();ctx.strokeStyle='#7e8994';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='#ff6b4a';ctx.beginPath();ctx.arc(0,-o.r*.25,5,0,7);ctx.fill();ctx.strokeStyle='#e8c575';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(5,-o.r+5);ctx.quadraticCurveTo(19,-o.r-13,25,-o.r-9);ctx.stroke();}else{ const [a,b,label]=o.type;ctx.fillStyle=a;ctx.beginPath();ctx.arc(0,0,o.r,0,7);ctx.fill();ctx.fillStyle=b;ctx.globalAlpha=.65;ctx.beginPath();ctx.arc(-o.r*.28,-o.r*.32,o.r*.28,0,7);ctx.fill();ctx.globalAlpha=1;ctx.strokeStyle='#536d2d';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(0,-o.r+3);ctx.quadraticCurveTo(4,-o.r-10,13,-o.r-8);ctx.stroke();ctx.fillStyle='#fff';ctx.font='700 8px DM Mono';ctx.textAlign='center';ctx.fillText(label,0,3);}ctx.restore(); }
function slash(x,y){ if(!playing)return; const now=performance.now(), prev=trail.at(-1); trail.push({x,y,t:now}); if(trail.length>14)trail.shift(); if(!prev||Math.hypot(x-prev.x,y-prev.y)<8)return; for(const o of objects){if(o.sliced)continue; if(Math.hypot(x-o.x,y-o.y)<o.r+12){o.sliced=true;if(o.bomb){lives--;combo=0;burst(o,'#ff6855',28);if(lives<=0)endGame();}else{combo++;score+=10*combo;burst(o,o.type[0],18);lastSlice=now;}updateUI();}} }
function burst(o,color,n){for(let i=0;i<n;i++)sparks.push({x:o.x,y:o.y,vx:(Math.random()-.5)*8,vy:(Math.random()-.5)*8,r:2+Math.random()*4,color,life:1});}
function endGame(){playing=false;best=Math.max(best,score);localStorage.setItem('slice-spark-best',best);ui.best.textContent=String(best).padStart(4,'0');ui.final.textContent=score;setTimeout(()=>ui.over.classList.remove('hidden'),450);}
function render(t){ctx.clearRect(0,0,W,H); const bg=ctx.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#12364a');bg.addColorStop(1,'#0c172b');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);ctx.globalAlpha=.13;ctx.strokeStyle='#b5e8d6';ctx.lineWidth=1;for(let i=-H;i<W;i+=52){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i+H,H);ctx.stroke();}ctx.globalAlpha=1;
 if(playing&&t>nextSpawn){spawn();if(score>250&&Math.random()<.35)spawn();nextSpawn=t+Math.max(420,1000-score*.11);} objects=objects.filter(o=>!o.sliced&&o.y<H+80);for(const o of objects){o.x+=o.vx;o.y+=o.vy;o.vy+=o.g;o.angle+=o.spin;drawFruit(o);if(o.y>H+20&&o.vy>0&&!o.bomb){o.sliced=true;lives--;combo=0;updateUI();if(lives<=0)endGame();}}
 sparks=sparks.filter(s=>s.life>.03);for(const s of sparks){s.x+=s.vx;s.y+=s.vy;s.vy+=.13;s.life*=.94;ctx.globalAlpha=s.life;ctx.fillStyle=s.color;ctx.fillRect(s.x,s.y,s.r,s.r);}ctx.globalAlpha=1;
 trail=trail.filter(p=>t-p.t<250);if(trail.length>1){ctx.lineCap='round';ctx.lineJoin='round';for(let i=1;i<trail.length;i++){ctx.strokeStyle=`rgba(215,255,84,${i/trail.length})`;ctx.lineWidth=2+i/trail.length*7;ctx.beginPath();ctx.moveTo(trail[i-1].x,trail[i-1].y);ctx.lineTo(trail[i].x,trail[i].y);ctx.stroke();}const p=trail.at(-1);ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(p.x,p.y,4,0,7);ctx.fill();} requestAnimationFrame(render);}
canvas.addEventListener('pointermove',e=>{const r=canvas.getBoundingClientRect();slash(e.clientX-r.left,e.clientY-r.top)}); canvas.addEventListener('pointerdown',e=>{const r=canvas.getBoundingClientRect();slash(e.clientX-r.left,e.clientY-r.top)});
async function enableCamera(){try{const {FilesetResolver,HandLandmarker}=await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22');const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:320,height:240,frameRate:{ideal:20,max:25}}});video.srcObject=stream;await video.play();const vision=await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm');handLandmarker=await HandLandmarker.createFromOptions(vision,{baseOptions:{modelAssetPath:'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',delegate:'GPU'},runningMode:'VIDEO',numHands:2});cameraOn=true;video.classList.add('active');ui.status.innerHTML='<i></i> HAND READY'; document.querySelector('#cameraButton').textContent='Camera control enabled';trackHand();}catch(err){console.warn('Camera control could not start:',err);ui.status.innerHTML='<i></i> MOUSE READY';document.querySelector('#cameraButton').textContent='Camera unavailable — mouse mode works';}}

// Better camera error reporting + retry UI
function showCameraError(message, detail){
	ui.status.innerHTML = `<i></i> CAMERA ERROR`;
	let banner = document.querySelector('.camera-error-banner');
	if(!banner){
		banner = document.createElement('div');
		banner.className = 'camera-error-banner';
		banner.style.cssText = 'position:absolute;left:30px;right:30px;top:70px;z-index:6;padding:12px 14px;border-radius:10px;background:#261515cc;color:#fff;display:flex;justify-content:space-between;align-items:center;gap:12px;font:500 13px/1.1 Outfit, sans-serif;';
		const msg = document.createElement('div'); msg.className='camera-error-msg';
		const actions = document.createElement('div'); actions.style.display='flex'; actions.style.gap='8px';
		const retry = document.createElement('button'); retry.textContent='Retry Camera'; retry.style.cssText='background:#ffe082;border:0;padding:8px;border-radius:8px;cursor:pointer;font-weight:700';
		retry.onclick = ()=>{ banner.remove(); enableCamera(); };
		const help = document.createElement('button'); help.textContent='How to fix'; help.style.cssText='background:transparent;border:1px solid #fff3;padding:8px;border-radius:8px;cursor:pointer;color:#fff';
		help.onclick = ()=>{ alert('Ensure site is HTTPS (or localhost), allow camera permission, and check DevTools Console for errors like NotAllowedError or wasm load failures.'); };
		actions.appendChild(retry); actions.appendChild(help);
		banner.appendChild(msg); banner.appendChild(actions);
		document.querySelector('.game-card').appendChild(banner);
	}
	banner.querySelector('.camera-error-msg').textContent = message + (detail? (' — '+detail):'');
}

// Try multiple CDN endpoints for MediaPipe Tasks and initialize camera
async function loadTasksVision(){
	// Prefer a local vendor copy if present (place files under /vendor)
	const localJs = '/vendor/tasks-vision.js';
	try{
		const head = await fetch(localJs, { method: 'HEAD' });
		if(head && head.ok){
			const mod = await import(localJs);
			return { mod, baseUrl: '/vendor' };
		}
	}catch(e){ /* ignore and fall back to CDNs */ }

	const urls = [
		'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22',
		'https://unpkg.com/@mediapipe/tasks-vision@0.10.22',
		'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision'
	];
	let lastErr = null;
	for(const u of urls){
		try{ const mod = await import(u); return {mod, baseUrl:u}; }catch(e){ console.warn('Import failed for',u,e); lastErr = e; }
	}
	const e = new Error('All tasks-vision CDN imports failed'); e.detail = lastErr && lastErr.message ? String(lastErr.message) : String(lastErr); throw e;
}

const originalEnableCamera = enableCamera;
enableCamera = async function(){
	try{
		const {mod, baseUrl} = await loadTasksVision();
		const {FilesetResolver, HandLandmarker} = mod;
		const stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:320,height:240,frameRate:{ideal:20,max:25}}});
		video.srcObject = stream; await video.play();
		const vision = await FilesetResolver.forVisionTasks(baseUrl + '/wasm');
		const modelAssetPath = baseUrl === '/vendor'
			? '/vendor/hand_landmarker.task'
			: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
		handLandmarker = await HandLandmarker.createFromOptions(vision, { baseOptions: { modelAssetPath, delegate: 'GPU' }, runningMode: 'VIDEO', numHands: 2 });
		cameraOn = true; video.classList.add('active'); ui.status.innerHTML = '<i></i> HAND READY'; document.querySelector('#cameraButton').textContent = 'Camera control enabled'; trackHand();
	}catch(err){
		console.warn('enableCamera error:', err);
		const name = err && err.name ? err.name : 'Error';
		const msg = err && err.message ? err.message : String(err);
		showCameraError(`${name}: ${msg}`, navigator.userAgent);
		ui.status.innerHTML = `<i></i> CAMERA ${name}`;
		document.querySelector('#cameraButton').textContent='Camera unavailable — mouse mode works';
	}
};
function trackHand(){
	if(!cameraOn || !handLandmarker){
		if(cameraOn) requestAnimationFrame(trackHand);
		return;
	}
	const now = performance.now();
	if(now - lastDetectAt >= detectIntervalMs && video.currentTime !== lastVideo){
		lastDetectAt = now;
		lastVideo = video.currentTime;
		try{
			const result = handLandmarker.detectForVideo(video, now);
			const hand = result.landmarks?.[0]?.[8];
			if(hand){
				slash((1-hand.x)*W, hand.y*H);
				ui.status.innerHTML = '<i></i> HAND TRACKED';
			} else {
				ui.status.innerHTML = '<i></i> SHOW HAND';
			}
		}catch(e){
			console.warn('hand detection error', e);
		}
	}
	if(cameraOn) requestAnimationFrame(trackHand);
}
document.querySelector('#startButton').onclick=freshGame;document.querySelector('#restartButton').onclick=freshGame;document.querySelector('#cameraButton').onclick=enableCamera;requestAnimationFrame(render);

