import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/environments/RoomEnvironment.js';

const viewport = document.querySelector('#viewport');
const renderer = new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.setSize(innerWidth,innerHeight);
renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.08;
renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap; viewport.append(renderer.domElement);
const scene=new THREE.Scene(); scene.background=new THREE.Color(0xc7d3dc); scene.fog=new THREE.Fog(0xc7d3dc,11,26);
const camera=new THREE.PerspectiveCamera(26,innerWidth/innerHeight,.05,60);
const reference={position:new THREE.Vector3(5.3,4.75,12.8),target:new THREE.Vector3(-.45,2.55,0)};
camera.position.copy(reference.position);
const controls=new OrbitControls(camera,renderer.domElement); controls.enableDamping=true; controls.dampingFactor=.055; controls.minDistance=7; controls.maxDistance=20; controls.maxPolarAngle=Math.PI*.52; controls.target.copy(reference.target);

const pmrem=new THREE.PMREMGenerator(renderer); scene.environment=pmrem.fromScene(new RoomEnvironment(),.04).texture;
const wallMat=new THREE.MeshStandardMaterial({color:0xb8c6d1,roughness:.92});
const wall=new THREE.Mesh(new THREE.PlaneGeometry(30,22),wallMat); wall.position.set(0,6,-3.4); wall.receiveShadow=true; scene.add(wall);
const wood=new THREE.MeshStandardMaterial({color:0xcbd1d2,roughness:.82,metalness:0});
function box(name,size,pos,mat=wood){const m=new THREE.Mesh(new THREE.BoxGeometry(...size),mat);m.name=name;m.position.set(...pos);m.castShadow=m.receiveShadow=true;scene.add(m);return m}
box('worn painted tabletop',[11.5,.32,4.2],[.5,1.42,0]);
box('table apron',[10.7,.82,.25],[.5,.9,1.68]); box('drawer',[4.4,.58,.12],[1.1,.91,1.83]);
[-4.5,5.2].forEach(x=>box('table leg',[.42,3.2,.42],[x,-.38,1.35]));
const knob=new THREE.Mesh(new THREE.SphereGeometry(.13,20,12),wood);knob.position.set(1.1,.9,1.98);scene.add(knob);
// Restrained wear lines in the old paint.
const wearMat=new THREE.MeshBasicMaterial({color:0x8e9ba2,transparent:true,opacity:.22});
for(let i=0;i<18;i++){const line=new THREE.Mesh(new THREE.PlaneGeometry(.3+Math.random()*1.2,.006),wearMat);line.rotation.x=-Math.PI/2;line.position.set(-4.8+Math.random()*10.6,1.585,-1.7+Math.random()*3.4);scene.add(line)}

// Rotationally inferred rear half: an open lathed shell, not a photographic impostor.
const glass=new THREE.MeshPhysicalMaterial({color:0xddeaf2,metalness:0,roughness:.08,transmission:1,thickness:.32,ior:1.47,attenuationColor:new THREE.Color(0xb7cad5),attenuationDistance:4.5,envMapIntensity:.8,transparent:true,opacity:1,side:THREE.DoubleSide});
const profile=[[.08,0],[1.18,.015],[1.48,.08],[1.67,.2],[1.82,.58],[1.92,1.08],[1.84,1.65],[1.6,2.15],[1.19,2.48],[1.02,2.66],[1.03,2.81]].map(([x,y])=>new THREE.Vector2(x,y));
const bowlGroup=new THREE.Group(); bowlGroup.position.set(-.55,1.58,.03); scene.add(bowlGroup);
const shell=new THREE.Mesh(new THREE.LatheGeometry(profile,96),glass);shell.castShadow=true;shell.renderOrder=3;bowlGroup.add(shell);
const rim=new THREE.Mesh(new THREE.TorusGeometry(1.08,.09,20,96),glass);rim.rotation.x=Math.PI/2;rim.position.y=2.82;bowlGroup.add(rim);
const innerRim=new THREE.Mesh(new THREE.TorusGeometry(.91,.055,16,96),glass);innerRim.rotation.x=Math.PI/2;innerRim.position.y=2.77;bowlGroup.add(innerRim);
const base=new THREE.Mesh(new THREE.TorusGeometry(1.32,.17,28,96),glass);base.rotation.x=Math.PI/2;base.scale.z=.63;base.position.y=.12;bowlGroup.add(base);

const foil=new THREE.MeshPhysicalMaterial({color:0xc8d0d4,roughness:.34,metalness:.5,clearcoat:.25,side:THREE.DoubleSide});
const blister=new THREE.MeshPhysicalMaterial({color:0xe8eef1,roughness:.17,metalness:0,transmission:.18,thickness:.08,clearcoat:.8});
function makePack(w,h,cols,rows){const g=new THREE.Group();const plate=new THREE.Mesh(new THREE.BoxGeometry(w,.055,h),foil);plate.castShadow=true;g.add(plate);for(let x=0;x<cols;x++)for(let z=0;z<rows;z++){const dome=new THREE.Mesh(new THREE.SphereGeometry(.13,18,10,0,Math.PI*2,0,Math.PI*.48),blister);dome.scale.y=.72;dome.position.set((x-(cols-1)/2)*(w/(cols+.2)),.035,(z-(rows-1)/2)*(h/(rows+.2)));g.add(dome)}return g}
const packs=[[-.58,.54,.2,-.22,.1],[.2,.68,-.12,.18,-.34],[.7,.45,.26,.1,.24],[-.95,.33,-.18,.08,-.45],[-.05,.26,.38,-.08,.52],[.56,.22,-.26,-.1,-.2],[-.38,.16,.14,.25,-.55]];
packs.forEach((p,i)=>{const pack=makePack(i%2?1.15:1.32,i%3?1.02:.9,4,3);pack.position.set(p[0],p[1],p[4]);pack.rotation.set(p[2],p[3],p[2]*2.3);bowlGroup.add(pack)});
const tabletMat=new THREE.MeshStandardMaterial({color:0xf0f1ef,roughness:.94});
function tablet(x,y,z,r=.13){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,.07,28),tabletMat);m.position.set(x,y,z);m.rotation.x=Math.PI/2;m.castShadow=true;return m}
bowlGroup.add(tablet(-1.1,.26,.25),tablet(.92,.22,.18),tablet(.35,.18,-.65));
const loose=tablet(3.34,1.66,.42,.11);scene.add(loose);

// Four overlapping translucent sheets imply soft voile folds while remaining real geometry.
const curtainMat=new THREE.MeshPhysicalMaterial({color:0xf5f8fa,roughness:.72,transmission:.42,transparent:true,opacity:.46,side:THREE.DoubleSide,depthWrite:false});
for(let i=0;i<5;i++){const geo=new THREE.PlaneGeometry(1.05,10,18,1);const pos=geo.attributes.position;for(let j=0;j<pos.count;j++){const x=pos.getX(j);pos.setZ(j,Math.sin((x+i*.3)*8)*.13)}pos.needsUpdate=true;const c=new THREE.Mesh(geo,curtainMat);c.position.set(-5.1+i*.45,5.1,-.2+i*.08);c.rotation.y=.12;scene.add(c)}
const key=new THREE.RectAreaLight(0xeaf5ff,7,5,8);key.position.set(-4.8,6,4);key.lookAt(-.5,2,0);scene.add(key);
const fill=new THREE.DirectionalLight(0xbdd3e2,1.1);fill.position.set(3,7,5);fill.castShadow=true;fill.shadow.mapSize.set(2048,2048);fill.shadow.radius=7;fill.shadow.camera.left=-7;fill.shadow.camera.right=7;scene.add(fill);

document.querySelector('#resetView').onclick=()=>{camera.position.copy(reference.position);controls.target.copy(reference.target);controls.update()};
document.querySelector('#autoRotate').onchange=e=>controls.autoRotate=e.target.checked;controls.autoRotateSpeed=.35;
document.querySelectorAll('[data-mode]').forEach(button=>button.onclick=()=>{document.querySelectorAll('[data-mode]').forEach(b=>b.classList.toggle('active',b===button));document.body.classList.remove('split','reference');if(button.dataset.mode!=='render')document.body.classList.add(button.dataset.mode);resize()});
function resize(){const split=document.body.classList.contains('split');const w=split&&innerWidth>700?innerWidth/2:innerWidth;const h=split&&innerWidth<=700?innerHeight/2:innerHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h)}addEventListener('resize',resize);
const clock=new THREE.Clock();function animate(){requestAnimationFrame(animate);controls.update();renderer.render(scene,camera)}animate();
setTimeout(()=>document.querySelector('#loading').classList.add('hide'),450);
