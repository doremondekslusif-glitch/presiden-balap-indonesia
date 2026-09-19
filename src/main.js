import * as THREE from 'three';
import { characters } from './data/characters.js';
import { baliCircuit } from './data/circuits.js';
import { Input } from './game/Input.js';
import { Race } from './game/Race.js';
import { Hud } from './ui/Hud.js';
const scene=new THREE.Scene();scene.background=new THREE.Color(0x68c8ed);scene.fog=new THREE.Fog(0x68c8ed,55,180);
const camera=new THREE.PerspectiveCamera(62,innerWidth/innerHeight,.1,300);const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;document.querySelector('#app').prepend(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xe9faff,0x315327,2.7));const sun=new THREE.DirectionalLight(0xffefc4,2.5);sun.position.set(35,55,18);sun.castShadow=true;scene.add(sun);
const hud=new Hud();let race;function state(kind){const count=document.querySelector('#countdown');if(kind==='countdown'||kind==='go'){count.textContent=kind==='go'?'GO!':race.count;count.classList.add('show')}else if(kind==='clear')count.classList.remove('show');else if(kind==='finished'){count.classList.remove('show');document.querySelector('#results').classList.remove('hidden');document.querySelector('#result-list').innerHTML=race.rankings().map((k,i)=>`<li class="${k.isPlayer?'me':''}"><b>${i+1}</b><span>${k.character.avatar} ${k.character.name}</span><em>${k.isPlayer?'ANDA':'AI'}</em></li>`).join('')}}
race=new Race({scene,camera,input:new Input(),circuit:baliCircuit,characters,onUpdate:r=>{hud.update(r);const k=r.karts[0];camera.fov=62+(k.boost<99?7:0);camera.updateProjectionMatrix()},onState:state});
document.querySelector('#start').onclick=()=>{document.querySelector('#menu').classList.add('hidden');document.querySelector('#hud').classList.remove('hidden');race.start()};document.querySelector('#restart').onclick=()=>{document.querySelector('#results').classList.add('hidden');race.start()};addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});renderer.setAnimationLoop(()=>{race.update();renderer.render(scene,camera)});
