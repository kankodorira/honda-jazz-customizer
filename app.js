import * as THREE from './vendor/three.module.js';

try {

// Owned procedural meshes. Metres; longitudinal +X = front, +Z = photograph side.
// Reference-informed JAZZ proportions. WB 1.325m; 16/12-inch rims.
const scene = new THREE.Scene(); scene.background = new THREE.Color('#e9e7e2');
const stage = document.getElementById('stage');
const mobile = matchMedia('(pointer: coarse)').matches || innerWidth < 720;
const renderer = new THREE.WebGLRenderer({antialias:!mobile,alpha:false,preserveDrawingBuffer:false,powerPreference:'low-power'});
renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.25:1.75));
renderer.shadowMap.enabled=true;
let running=true, dirty=true, pendingFrame=false;
function invalidate(){dirty=true;if(running&&!pendingFrame){pendingFrame=true;requestAnimationFrame(render);}}
renderer.domElement.addEventListener('webglcontextlost', event=>{
  event.preventDefault();running=false;
  window.JAZZ_SHOW_STATIC('3D描画が中断されたため、静止画に切り替えました。ページを再読み込みすると再試行できます。','webgl-context-lost');
});
renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
stage.appendChild(renderer.domElement);
const camera=new THREE.PerspectiveCamera(35,1,.02,30);
const bike=new THREE.Group();scene.add(bike);bike.name='Honda JAZZ — reference-informed geometry';
const C=THREE;
const mat=(color,metalness=0,roughness=.5,other={})=>new C.MeshStandardMaterial({color,metalness,roughness,...other});
const paint=mat('#080c10',.62,.2);const frame=mat('#080b0d',.55,.28);
const chrome=mat('#dce0e2',1,.14);const satin=mat('#a9adb0',.85,.3);
const alloy=mat('#aeb5b7',.8,.37);const rubber=mat('#161817',.02,.88);
const treadMat=mat('#222422',.02,.95);const leather=mat('#171b1b',.02,.59);
const dark=mat('#222728',.55,.4);const amber=mat('#f69b24',.15,.25,{emissive:'#9e4004',emissiveIntensity:.15});
const red=mat('#a62620',.1,.27);const lamp=mat('#e8e9dc',.15,.17);const boltmat=mat('#b9c2c4',.85,.24);
function mesh(g,m,p=[0,0,0],group=bike){const o=new C.Mesh(g,m);o.position.set(...p);o.castShadow=true;o.receiveShadow=true;group.add(o);return o;}
function tube(points,r,m=chrome,segments=60,group=bike){const crv=new C.CatmullRomCurve3(points.map(p=>new C.Vector3(...p)));return mesh(new C.TubeGeometry(crv,segments,r,10,false),m,[0,0,0],group);}
function rod(a,b,r,m=chrome,r2=r,group=bike){const A=new C.Vector3(...a),B=new C.Vector3(...b);const o=mesh(new C.CylinderGeometry(r2,r,A.distanceTo(B),20),m,A.clone().add(B).multiplyScalar(.5).toArray(),group);o.quaternion.setFromUnitVectors(new C.Vector3(0,1,0),B.sub(A).normalize());return o;}
function cyl(r,h,p,m=chrome,axis=[0,0,1],r2=r,group=bike){const o=mesh(new C.CylinderGeometry(r2,r,h,48),m,p,group);o.quaternion.setFromUnitVectors(new C.Vector3(0,1,0),new C.Vector3(...axis).normalize());return o;}
function ell(p,s,m=chrome,group=bike){const o=mesh(new C.SphereGeometry(1,40,24),m,p,group);o.scale.set(...s);return o;}
function ring(R,r,p,m=chrome,group=bike){return mesh(new C.TorusGeometry(R,r,10,96),m,p,group);}
function roundedBox(w,h,d,rad,p,m,bevel=.004,group=bike){const shape=new C.Shape();const x=-w/2,y=-h/2;shape.moveTo(x+rad,y);shape.lineTo(x+w-rad,y);shape.quadraticCurveTo(x+w,y,x+w,y+rad);shape.lineTo(x+w,y+h-rad);shape.quadraticCurveTo(x+w,y+h,x+w-rad,y+h);shape.lineTo(x+rad,y+h);shape.quadraticCurveTo(x,y+h,x,y+h-rad);shape.lineTo(x,y+rad);shape.quadraticCurveTo(x,y,x+rad,y);const g=new C.ExtrudeGeometry(shape,{depth:d,steps:1,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:bevel,bevelThickness:bevel,curveSegments:8});g.translate(0,0,-d/2);return mesh(g,m,p,group);}
function screw(p,r=.004){cyl(r,.004,p,boltmat);rod([p[0]-r*.55,p[1],p[2]+.0025],[p[0]+r*.55,p[1],p[2]+.0025],.00065,dark);}
const tireGroups=[],fenderGroups=[];
function toroidalTire(x,y,outer,rim,width){const startIndex=bike.children.length;const n=112,k=28,positions=[],idx=[];const mid=(outer+rim)/2,tr=(outer-rim)/2;for(let i=0;i<=n;i++){const t=i/n*Math.PI*2;for(let j=0;j<=k;j++){const a=j/k*Math.PI*2;const rad=mid+tr*Math.cos(a);positions.push(x+rad*Math.cos(t),y+rad*Math.sin(t),width/2*Math.sin(a));}}for(let i=0;i<n;i++)for(let j=0;j<k;j++){let a=i*(k+1)+j,b=a+k+1;idx.push(a,b,a+1,b,b+1,a+1);}const g=new C.BufferGeometry();g.setAttribute('position',new C.Float32BufferAttribute(positions,3));g.setIndex(idx);g.computeVertexNormals();mesh(g,rubber);for(const s of [-1,1]){ring(rim+.009,.0014,[x,y,s*width*.32],rubber);ring(outer-.017,.0009,[x,y,s*width*.31],treadMat);}for(let i=0;i<72;i++){const a=i/72*Math.PI*2;for(const s of [-1,0,1]){const rr=outer-(s?tr*.2:0)-.001;let b=mesh(new C.BoxGeometry(.008,.002,width*.28),treadMat,[x+rr*Math.cos(a),y+rr*Math.sin(a),s*width*.3]);b.rotation.z=a-Math.PI/2;b.rotateY(s*.35);}}const group=new C.Group();group.name=x>0?'Front tire':'Rear tire';const tireParts=bike.children.slice(startIndex);for(const p of tireParts){p.updateMatrix();p.geometry.applyMatrix4(p.matrix);p.position.set(0,0,0);p.quaternion.identity();p.scale.set(1,1,1);p.updateMatrix();const pos=p.geometry.getAttribute('position');for(let i=0;i<pos.count;i++){const dx=pos.getX(i)-x,dy=pos.getY(i)-y,r=Math.hypot(dx,dy);if(r>outer){pos.setXY(i,x+dx*outer/r,y+dy*outer/r);}}p.geometry.computeVertexNormals();p.userData.basePositions=new Float32Array(pos.array);group.add(p);}bike.add(group);tireGroups.push({group,x,y,rim,baselineRadius:outer});}
function wheel(x,y,outer,rim,width,rear=false){toroidalTire(x,y,outer,rim,width);const rimWidth=rear?.07:.035;for(const s of [-1,1]){ring(rim,.007,[x,y,s*rimWidth/2]);ring(rim-.009,.002,[x,y,s*rimWidth/2]);} // inner rim barrel, not a solid disc
const rshape=new C.Shape();rshape.absarc(0,0,rim-.002,0,Math.PI*2,false);const hole=new C.Path();hole.absarc(0,0,rim-.012,0,Math.PI*2,true);rshape.holes.push(hole);const rg=new C.ExtrudeGeometry(rshape,{depth:rimWidth,bevelEnabled:false,curveSegments:96});rg.translate(x,y,-rimWidth/2);mesh(rg,satin);
if(rear){for(const s of [-1,1]){const dish=mesh(new C.LatheGeometry([new C.Vector2(.069,.017),new C.Vector2(.085,.013),new C.Vector2(.119,.004),new C.Vector2(.145,0)],96),chrome,[x,y,s*.041]);dish.rotation.x=s*Math.PI/2;}}
const hubR=rear?.070:.069; cyl(hubR,rear?.085:.075,[x,y,0],alloy);for(const s of [-1,1]){cyl(hubR*.94,.009,[x,y,s*(rear?.048:.042)],satin);ring(hubR*.88,.002,[x,y,s*(rear?.054:.047)],chrome);for(let i=0;i<36;i++){const a=i/36*Math.PI*2,b=a+(i%2? .42:-.42);rod([x+hubR*.75*Math.cos(a),y+hubR*.75*Math.sin(a),s*.032],[x+(rim-.008)*Math.cos(b),y+(rim-.008)*Math.sin(b),s*rimWidth/2],.00135,chrome);if(s===1){const q=new C.Vector3(Math.cos(b),Math.sin(b),0);rod([x+(rim-.022)*q.x,y+(rim-.022)*q.y,s*rimWidth/2],[x+(rim-.010)*q.x,y+(rim-.010)*q.y,s*rimWidth/2],.0023,satin);}}
for(let i=0;i<6;i++){const a=i/6*Math.PI*2;screw([x+hubR*.70*Math.cos(a),y+hubR*.70*Math.sin(a),s*(rear?.056:.05)],.003);}}
cyl(.012,width+.052,[x,y,0],chrome);for(const s of [-1,1])cyl(.012,.009,[x,y,s*(width/2+.027)],chrome);
}
wheel(-.6625,.267,.267,.1524,.114,true);wheel(.6625,.267,.267,.2032,.0635);
// Sculpted fender shells, with rolled lips and real thickness.
function fender(cx,cy,R,w,start,end,m){const seg=70,cross=20,pts=[],ids=[],group=new C.Group();group.name=cx>0?'Front fender':'Rear fender';bike.add(group);for(let i=0;i<=seg;i++){const a=start+(end-start)*i/seg;for(let j=0;j<=cross;j++){const z=(j/cross-.5)*w;const rr=R+.013*Math.cos((j/cross-.5)*Math.PI);pts.push(cx+rr*Math.cos(a),cy+rr*Math.sin(a),z);}}for(let i=0;i<seg;i++)for(let j=0;j<cross;j++){let a=i*(cross+1)+j,b=a+cross+1;ids.push(a,b,a+1,b,b+1,a+1);}const g=new C.BufferGeometry();g.setAttribute('position',new C.Float32BufferAttribute(pts,3));g.setIndex(ids);g.computeVertexNormals();const mm=m.clone();mm.side=C.DoubleSide;mesh(g,mm,[0,0,0],group);for(const s of [-1,1]){let p=[];for(let i=0;i<=seg;i++){const a=start+(end-start)*i/seg;p.push([cx+R*Math.cos(a),cy+R*Math.sin(a),s*w/2]);}tube(p,.003,m,70,group);}fenderGroups.push({group,x:cx,y:cy,baselineRadius:R,baselineTireRadius:.267,midAngle:(start+end)/2});}
fender(.6625,.267,.282,.080,1.30,3.55,paint);
fender(-.6625,.267,.310,.145,.70,2.64,paint);
// Rear fender tail, lamp, mudguard / licence mount.
const mud=roundedBox(.16,.11,.004,.008,[-.882,.447,0],rubber);mud.rotation.y=Math.PI/2;mud.rotation.z=-.4;
tube([[-.59,.568,-.072],[-.76,.586,-.072],[-.88,.588,-.072]],.01,paint);
roundedBox(.032,.046,.13,.005,[-.886,.580,0],red);cyl(.004,.13,[-.899,.573,0],chrome);
// Double cradle frame. Thin, open frame triangles are central to the JAZZ silhouette.
for(const s of [-1,1]){const z=s*.061;tube([[-.406,.461,z],[-.347,.274,z],[-.29,.167,z],[-.07,.156,z],[.055,.178,z],[.244,.652,z]],.014,frame);tube([[-.406,.461,z],[-.22,.532,z],[.095,.628,z],[.244,.652,z]],.015,frame);rod([-.406,.461,z],[-.325,.25,z],.012,frame);rod([-.325,.25,z],[-.66,.259,z],.016,frame);rod([-.33,.245,z],[-.63,.208,z],.011,frame);rod([-.64,.25,z],[-.63,.37,z],.010,frame);}
rod([-.33,.245,-.09],[-.33,.245,.09],.024,frame);
rod([.233,.632,0],[.199,.702,0],.030,frame);
// Swing arms, rear drum lever and brake rod.
for(const s of [-1,1]){rod([-.348,.267,s*.085],[-.663,.262,s*.088],.019,frame);cyl(.017,.012,[-.348,.267,s*.096],satin);rod([-.66,.265,s*.068],[-.704,.229,s*.08],.009,satin);rod([-.70,.232,s*.08],[-.285,.216,s*.079],.003,chrome);}
// Twin inclined shock absorbers with real helical springs.
for(const s of [-1,1]){let a=new C.Vector3(-.551,.306,s*.102),b=new C.Vector3(-.406,.464,s*.105);rod(a.toArray(),b.toArray(),.014,chrome);const d=b.clone().sub(a),length=d.length();const spring=new C.Group();bike.add(spring);spring.position.copy(a);spring.quaternion.setFromUnitVectors(new C.Vector3(0,1,0),d.normalize());const points=[];for(let i=0;i<=240;i++){const u=i/240;points.push([.020*Math.cos(u*14*Math.PI),.018+u*(length-.038),.020*Math.sin(u*14*Math.PI)]);}tube(points,.0035,chrome,240,spring);rod(a.toArray(),a.clone().add(b.clone().sub(a).multiplyScalar(.36)).toArray(),.022,chrome);for(const p of [a,b]){cyl(.015,.016,[p.x,p.y,p.z+s*.009],chrome);screw([p.x,p.y,p.z+s*.019],.007);}}
// Swept chrome rear supports, sissy bar and narrow padded backrest.
for(const s of [-1,1]){tube([[-.405,.465,s*.103],[-.47,.49,s*.115],[-.58,.521,s*.115],[-.727,.524,s*.115],[-.781,.584,s*.104]],.012,chrome);tube([[-.72,.526,s*.103],[-.788,.589,s*.094],[-.791,.734,s*.094]],.006,chrome);}
rod([-.79,.734,-.094],[-.79,.734,.094],.006,chrome);
const back=roundedBox(.025,.110,.155,.009,[-.79,.692,0],leather);back.rotation.z=.012;
// Seat: a smooth, genuinely concave single saddle, rising at rear and at tank.
function loft(stations,m,n=60,k=44,group=bike){const positions=[],ids=[];const v=stations.map(a=>new C.Vector4(...a));function value(i,u){const p0=v[Math.max(i-1,0)],p1=v[i],p2=v[Math.min(i+1,v.length-1)],p3=v[Math.min(i+2,v.length-1)];let out=[];for(let d=0;d<4;d++){const a=p0.getComponent(d),b=p1.getComponent(d),c=p2.getComponent(d),e=p3.getComponent(d);out.push(.5*((2*b)+(-a+c)*u+(2*a-5*b+4*c-e)*u*u+(-a+3*b-3*c+e)*u*u*u));}return out;}for(let i=0;i<=n;i++){let t=i/n*(v.length-1),ii=Math.min(Math.floor(t),v.length-2),u=t-ii;const [x,y,ry,rz]=value(ii,u);for(let j=0;j<=k;j++){const a=j/k*Math.PI*2;positions.push(x,y+ry*Math.cos(a),rz*Math.sin(a));}}for(let i=0;i<n;i++)for(let j=0;j<k;j++){const a=i*(k+1)+j,b=a+k+1;ids.push(a,a+1,b,b,a+1,b+1);}const g=new C.BufferGeometry();g.setAttribute('position',new C.Float32BufferAttribute(positions,3));g.setIndex(ids);g.computeVertexNormals();return mesh(g,m,[0,0,0],group);}
const seatStations=[[-.55,.598,0,0],[-.535,.595,.034,.09],[-.49,.563,.040,.116],[-.41,.547,.039,.119],[-.33,.553,.035,.105],[-.24,.58,.032,.077],[-.195,.602,.022,.05],[-.181,.599,0,0]];
loft(seatStations,leather);
for(const s of [-1,1])tube([[-.54,.613,s*.04],[-.50,.584,s*.098],[-.42,.574,s*.108],[-.34,.58,s*.094],[-.25,.606,s*.066],[-.20,.617,s*.038]],.0018,dark);
// Reference-derived tank silhouettes. The normal specification preserves the original geometry exactly.
const tankVariants={};
const tankSpecs={
 normal:{stations:[[-.176,.569,0,0],[-.145,.590,.021,.036],[-.09,.625,.042,.063],[-.02,.660,.060,.085],[.055,.690,.074,.099],[.118,.702,.073,.100],[.164,.696,.060,.085],[.192,.687,.036,.052],[.205,.683,0,0]],trim:[[-.15,.583,.027],[-.095,.598,.051],[-.01,.615,.073],[.075,.635,.087],[.143,.650,.081],[.18,.679,.054]],crest:[[-.11,.627,.059],[-.035,.671,.081],[.048,.714,.093],[.113,.727,.091],[.155,.712,.072]],cap:[.092,.779],capRod:[[.078,.791],[.104,.789]],badge:[.11,.7,.098,.113,.056,.24]},
 teardrop:{stations:[[-.175,.580,0,0],[-.145,.600,.020,.035],[-.085,.630,.042,.062],[-.010,.668,.060,.084],[.075,.700,.075,.100],[.145,.706,.070,.096],[.195,.695,.045,.066],[.220,.680,0,0]],trim:[[-.145,.594,.028],[-.080,.612,.051],[-.005,.637,.073],[.080,.665,.090],[.155,.682,.086],[.198,.686,.057]],crest:[[-.105,.632,.050],[-.025,.676,.077],[.065,.724,.093],[.145,.733,.088],[.185,.715,.067]],cap:[.135,.797],capRod:[[.120,.808],[.148,.806]],badge:[.105,.704,.097,.118,.056,.22]},
 peanut:{stations:[[-.135,.600,0,0],[-.115,.622,.035,.057],[-.065,.654,.061,.088],[-.005,.675,.068,.096],[.045,.676,.055,.083],[.095,.692,.070,.100],[.155,.700,.074,.101],[.195,.688,.048,.070],[.212,.675,0,0]],trim:[[-.112,.618,.040],[-.060,.638,.072],[-.005,.649,.081],[.045,.650,.069],[.105,.670,.087],[.175,.685,.080]],crest:[[-.080,.668,.070],[-.010,.696,.088],[.045,.693,.073],[.105,.718,.093],[.165,.724,.087]],cap:[.125,.797],capRod:[[.111,.808],[.139,.807]],badge:[.095,.695,.098,.105,.052,.12]},
 frisco:{stations:[[-.185,.575,0,0],[-.150,.594,.018,.030],[-.080,.620,.036,.055],[.000,.650,.052,.074],[.085,.684,.070,.091],[.155,.710,.072,.092],[.205,.704,.048,.066],[.225,.690,0,0]],trim:[[-.155,.590,.025],[-.080,.604,.046],[.005,.625,.064],[.090,.656,.082],[.165,.684,.084],[.205,.694,.057]],crest:[[-.120,.620,.043],[-.035,.651,.065],[.055,.688,.083],[.140,.730,.086],[.190,.728,.067]],cap:[.145,.798],capRod:[[.130,.810],[.159,.808]],badge:[.115,.698,.091,.120,.052,.20]},
 sportster:{stations:[[-.155,.585,0,0],[-.130,.610,.030,.045],[-.075,.650,.065,.087],[-.005,.685,.090,.110],[.075,.710,.105,.120],[.145,.708,.102,.115],[.195,.690,.074,.090],[.218,.668,0,0]],trim:[[-.130,.602,.035],[-.075,.620,.068],[-.005,.648,.092],[.080,.672,.104],[.155,.676,.100],[.198,.680,.074]],crest:[[-.090,.660,.068],[-.015,.704,.096],[.070,.744,.110],[.145,.744,.106],[.185,.716,.087]],cap:[.120,.830],capRod:[[.105,.842],[.134,.840]],badge:[.095,.704,.112,.118,.060,.12],panel:[.065,.682,.116,.080,.050]},
 'cafe-racer':{stations:[[-.180,.578,0,0],[-.145,.598,.020,.035],[-.075,.625,.044,.068],[.010,.660,.068,.095],[.095,.702,.090,.112],[.165,.714,.082,.104],[.205,.700,.055,.075],[.225,.681,0,0]],trim:[[-.150,.592,.027],[-.075,.610,.055],[.010,.635,.082],[.095,.670,.104],[.165,.687,.096],[.205,.692,.067]],crest:[[-.115,.625,.052],[-.030,.660,.079],[.060,.708,.104],[.145,.742,.098],[.195,.724,.078]],cap:[.135,.823],capRod:[[.120,.835],[.149,.833]],badge:[.105,.704,.105,.120,.054,.18],panel:[.040,.676,.107,.092,.052]},
 scrambler:{angular:true,stations:[[-.155,.590,0,0],[-.125,.620,.040,.055],[-.050,.650,.070,.090],[.035,.675,.083,.102],[.115,.695,.088,.105],[.180,.690,.075,.092],[.215,.670,.040,.060],[.228,.655,0,0]],trim:[[-.128,.610,.036],[-.055,.628,.068],[.035,.650,.090],[.120,.670,.096],[.190,.676,.079]],crest:[[-.095,.658,.060],[-.015,.690,.087],[.075,.720,.099],[.160,.722,.092],[.202,.700,.070]],cap:[.125,.803],capRod:[[.110,.815],[.139,.813]],badge:[.090,.687,.101,.110,.056,.12],panel:[.045,.675,.105,.085,.054]},
 'dirt-tracker':{angular:true,stations:[[-.180,.580,0,0],[-.150,.600,.022,.038],[-.075,.625,.047,.070],[.010,.650,.067,.092],[.100,.675,.083,.104],[.175,.698,.082,.102],[.215,.686,.048,.070],[.228,.668,0,0]],trim:[[-.150,.592,.030],[-.075,.606,.057],[.010,.626,.081],[.100,.650,.098],[.178,.675,.094],[.213,.680,.060]],crest:[[-.115,.624,.052],[-.030,.655,.078],[.060,.690,.099],[.150,.724,.098],[.195,.718,.077]],cap:[.145,.800],capRod:[[.130,.812],[.159,.810]],badge:[.100,.690,.101,.120,.052,.10]},
 bobber:{stations:[[-.145,.595,0,0],[-.120,.625,.038,.060],[-.060,.665,.075,.103],[.020,.700,.101,.126],[.095,.710,.105,.128],[.160,.700,.090,.114],[.205,.680,.060,.082],[.225,.660,0,0]],trim:[[-.122,.618,.045],[-.060,.644,.083],[.020,.670,.111],[.100,.682,.116],[.170,.682,.101],[.208,.674,.073]],crest:[[-.080,.680,.086],[.000,.726,.118],[.085,.744,.121],[.155,.735,.108],[.195,.708,.088]],cap:[.120,.836],capRod:[[.105,.848],[.135,.846]],badge:[.095,.714,.119,.116,.060,.08]},
 chopper:{stations:[[-.195,.570,0,0],[-.165,.585,.012,.024],[-.095,.610,.027,.044],[-.015,.642,.043,.064],[.070,.674,.060,.081],[.145,.696,.068,.088],[.200,.690,.050,.070],[.225,.674,0,0]],trim:[[-.168,.583,.020],[-.095,.596,.036],[-.015,.620,.053],[.070,.650,.072],[.148,.674,.080],[.205,.680,.060]],crest:[[-.130,.608,.034],[-.045,.642,.053],[.045,.681,.074],[.135,.716,.082],[.192,.710,.066]],cap:[.145,.786],capRod:[[.131,.798],[.159,.796]],badge:[.115,.690,.087,.122,.048,.20]},
 adventure:{angular:true,stations:[[-.165,.575,0,0],[-.140,.610,.035,.052],[-.075,.650,.072,.096],[.010,.690,.100,.124],[.085,.730,.115,.132],[.155,.735,.106,.126],[.210,.710,.082,.104],[.235,.680,.045,.066],[.245,.660,0,0]],trim:[[-.142,.602,.042],[-.075,.626,.080],[.010,.660,.108],[.090,.695,.121],[.165,.704,.115],[.215,.696,.091]],crest:[[-.105,.657,.077],[-.025,.708,.107],[.060,.760,.126],[.140,.772,.120],[.205,.742,.098]],cap:[.150,.858],capRod:[[.135,.870],[.165,.868]],badge:[.105,.727,.123,.118,.061,.12],panel:[.055,.706,.125,.090,.058]}
};
// Original typographic approximation only; no reference-image texture.
const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;const ctx=canvas.getContext('2d');ctx.clearRect(0,0,512,256);ctx.fillStyle='#bfc9d0';ctx.font='italic bold 100px Georgia';ctx.textAlign='center';ctx.fillText('Jazz',256,155);ctx.font='22px Arial';ctx.fillText('HONDA',256,63);const tex=new C.CanvasTexture(canvas);tex.colorSpace=C.SRGBColorSpace;const decalMat=new C.MeshStandardMaterial({map:tex,transparent:true,metalness:.65,roughness:.3,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2});
function facetedTank(stations,m,group){const sides=16,positions=[],ids=[];for(const [x,y,ry,rz] of stations){for(let j=0;j<sides;j++){const a=j/sides*Math.PI*2;positions.push(x,y+ry*Math.cos(a),rz*Math.sin(a));}}for(let i=0;i<stations.length-1;i++)for(let j=0;j<sides;j++){const a=i*sides+j,b=i*sides+(j+1)%sides,c=(i+1)*sides+j,d=(i+1)*sides+(j+1)%sides;ids.push(a,c,b,b,c,d);}const g=new C.BufferGeometry();g.setAttribute('position',new C.Float32BufferAttribute(positions,3));g.setIndex(ids);g.computeVertexNormals();return mesh(g,m,[0,0,0],group);}
function buildTankVariant(name,spec){const group=new C.Group();group.name=`${name} tank`;bike.add(group);if(spec.angular)facetedTank(spec.stations,paint,group);else loft(spec.stations,paint,84,64,group);for(const s of [-1,1]){tube(spec.trim.map(p=>[p[0],p[1],s*p[2]]),.0017,satin,60,group);tube(spec.crest.map(p=>[p[0],p[1],s*p[2]]),.001,chrome,60,group);if(spec.panel){const p=spec.panel,insert=ell([p[0],p[1],s*p[2]],[p[3],p[4],.0045],dark,group);insert.rotation.y=s*.08;}}cyl(.025,.010,[spec.cap[0],spec.cap[1],0],chrome,[.1,1,0],.025,group);cyl(.018,.004,[spec.cap[0],spec.cap[1]+.007,0],satin,[.1,1,0],.018,group);rod([spec.capRod[0][0],spec.capRod[0][1],0],[spec.capRod[1][0],spec.capRod[1][1],0],.003,chrome,.003,group);for(const s of [-1,1]){const badge=mesh(new C.PlaneGeometry(spec.badge[3],spec.badge[4]),decalMat,[spec.badge[0],spec.badge[1],s*spec.badge[2]],group);badge.rotation.y=s===1?-.15:Math.PI+.15;badge.rotation.z=spec.badge[5];}group.visible=name==='normal';tankVariants[name]=group;}
for(const [name,spec] of Object.entries(tankSpecs))buildTankVariant(name,spec);
// Thin side boxes, metal battery cover, ignition under tank.
for(const s of [-1,1]){const box=roundedBox(.15,.112,.025,.012,[-.322,.423,s*.074],paint);box.rotation.z=.15;roundedBox(.137,.113,.018,.002,[-.18,.436,s*.099],satin);roundedBox(.126,.102,.003,.001,[-.18,.436,s*.110],alloy,.001);for(let i=0;i<5;i++)rod([-.212+i*.012,.417,s*.113],[-.212+i*.012,.462,s*.113],.002,dark);for(const x of [-.238,-.122])for(const y of [.39,.482])screw([x,y,s*.116],.0024);}
// Small horizontal single-cylinder engine / crankcase. No V-twin geometry.
const caseBody=roundedBox(.205,.129,.135,.042,[-.155,.287,0],alloy,.012);cyl(.064,.017,[-.116,.294,.083],satin);cyl(.045,.021,[-.116,.294,.096],alloy);cyl(.036,.004,[-.116,.294,.109],satin);cyl(.033,.026,[-.245,.267,.071],alloy);cyl(.019,.008,[-.245,.267,.089],satin);
for(let i=0;i<8;i++){const a=i/8*Math.PI*2;screw([-.116+.055*Math.cos(a),.294+.055*Math.sin(a),.096],.0033);}for(const p of [[-.236,.323,.078],[-.228,.22,.079],[-.163,.222,.08],[-.071,.25,.082]])screw(p,.004);
// Cylinder projects forward, slightly upward; fin stack in planes normal to its axis.
const ca=new C.Vector3(-.045,.291,0),cb=new C.Vector3(.055,.326,0);rod(ca.toArray(),cb.toArray(),.049,dark);
for(let i=0;i<11;i++){const t=i/10,p=ca.clone().lerp(cb,t);const f=roundedBox(.005,.105,.122,.010,p.toArray(),alloy,.001);f.rotation.z=.32;}
const head=roundedBox(.047,.092,.115,.014,[.065,.329,0],alloy,.004);head.rotation.z=.32;for(const s of [-1,1]){for(let i=0;i<5;i++)rod([.046,.299+i*.014,s*.061],[.088,.312+i*.014,s*.061],.0023,satin);screw([.066,.338,s*.063],.006);}
// Intake, carburettor, spark lead and small hoses.
tube([[.019,.358,0],[-.005,.418,0],[-.052,.443,0],[-.069,.401,0]],.013,alloy);cyl(.022,.05,[-.07,.419,0],satin,[0,1,0]);ell([-.07,.392,0],[.026,.017,.021],alloy);tube([[-.07,.446,.02],[-.103,.504,.03],[-.002,.552,.025]],.003,rubber);tube([[.08,.35,.03],[.091,.396,.04],[.045,.475,.035],[.002,.523,.02]],.004,rubber);
// Low chromed exhaust: visible header loop and long tapered silencer.
tube([[.072,.31,.027],[.088,.25,.079],[.06,.175,.106],[-.005,.148,.118],[-.18,.148,.118],[-.292,.169,.118],[-.47,.166,.118]],.016,chrome,100);
rod([-.305,.157,.12],[-.79,.165,.12],.031,chrome,.027);cyl(.025,.012,[-.79,.165,.12],chrome,[-1,0,0]);cyl(.015,.014,[-.797,.165,.12],dark,[-1,0,0]);rod([-.32,.183,.142],[-.76,.188,.142],.004,chrome);
// Foot controls and rubber pegs, kick-start and brake pedal.
for(const s of [-1,1]){rod([.027,.196,s*.058],[.027,.196,s*.18],.009,chrome);cyl(.018,.075,[.027,.196,s*.192],rubber);for(let j=0;j<7;j++)ring(.017,.0018,[.027,.196,s*(.16+j*.01)],dark);}
tube([[.008,.205,.12],[.075,.215,.158],[.16,.236,.158],[.169,.265,.158]],.006,chrome);rod([.153,.265,.145],[.181,.265,.175],.009,satin);
tube([[-.21,.246,.10],[-.252,.205,.12],[-.267,.295,.15],[-.24,.324,.15]],.007,chrome);rod([-.24,.324,.15],[-.24,.324,.205],.011,rubber);
// Long raked front forks (34° from vertical), narrow yokes, forward axle.
for(const s of [-1,1]){const z=s*.076;rod([.657,.269,z],[.484,.507,z],.023,satin);rod([.484,.507,z],[.281,.807,z],.013,chrome);rod([.470,.526,z],[.443,.562,z],.025,chrome);rod([.303,.775,z],[.287,.80,z],.022,chrome);cyl(.014,.016,[.657,.269,z+s*.021],satin);screw([.657,.269,z+s*.031],.007);rod([.502,.48,z],[.53,.55,z],.003,chrome);}
rod([.428,.574,-.101],[.428,.574,.101],.020,frame);rod([.307,.752,-.096],[.307,.752,.096],.018,chrome);rod([.268,.814,-.091],[.268,.814,.091],.016,chrome);
// Headlamp points forward (+X), with modeled chrome shell, bezel and lens ribs.
ell([.365,.758,0],[.066,.051,.051],chrome);cyl(.052,.012,[.418,.758,0],chrome,[1,0,0]);cyl(.046,.003,[.426,.758,0],lamp,[1,0,0]);const headring=ring(.047,.003,[.429,.758,0]);headring.rotation.y=Math.PI/2;for(let i=-6;i<=6;i++){const zz=i*.006,hh=Math.sqrt(.044*.044-zz*zz);rod([.429,.758-hh,zz],[.429,.758+hh,zz],.00065,satin);}rod([.35,.72,-.062],[.35,.72,.062],.008,chrome);
// Complete handlebar assemblies derived from the user's front-view silhouette reference.
const handlebarVariants={};
const normalHandlebarSpec={bar:[[.268,.815,.038],[.233,.88,.05],[.191,.958,.12],[.128,.969,.257],[.071,.923,.32]],grip:[[.076,.928,.31],[.027,.881,.35]],control:[.087,.94,.286],lever:[[.091,.949,.294],[.037,.957,.337],[.004,.92,.362]],mirrorStem:[[.096,.949,.284],[.069,1.013,.273],[-.014,1.058,.276]],mirror:[-.026,1.082,.278],face:[-.036,1.083,.278],cable:[[.107,.95,.265],[.264,.972,.159],[.321,.839,.116],[.349,.738,.08],[.487,.526,.047]]};
const handlebarProfiles={
 tracker:{points:[[.038,.815],[.10,.825],[.16,.835],[.22,.870],[.34,.875]],endX:.08},
 clipons:{points:[[.038,.815],[.09,.835],[.16,.825],[.24,.795],[.34,.765]],endX:.12,gripDrop:-.018},
 moto:{points:[[.038,.815],[.10,.815],[.15,.875],[.23,.895],[.34,.900]],endX:.08,braces:[{x:.18,y:.858,z:.145}]},
 'zero-drag':{points:[[.038,.842],[.12,.842],[.23,.842],[.34,.842]],endX:.16,gripDrop:-.015},
 'low-drag':{points:[[.038,.815],[.075,.815],[.105,.865],[.20,.872],[.34,.872]],endX:.13},
 'high-drag':{points:[[.038,.815],[.075,.815],[.085,.980],[.19,.988],[.34,.988]],endX:.12},
 maynard:{points:[[.038,.815],[.13,.815],[.145,.875],[.23,.880],[.34,.885]],endX:.10},
 zed:{points:[[.038,.815],[.135,.815],[.150,.915],[.23,.915],[.34,.915]],endX:.09},
 frisco:{points:[[.038,.815],[.115,.815],[.145,.840],[.175,.910],[.24,.920],[.34,.920]],endX:.08},
 mustache:{points:[[.038,.815],[.13,.815],[.165,.845],[.20,.865],[.34,.880]],endX:.02},
 keystone:{points:[[.038,.815],[.135,.815],[.170,.925],[.205,.930],[.34,.875]],endX:.08},
 clubman:{points:[[.038,.815],[.13,.815],[.165,.850],[.205,.870],[.27,.845],[.34,.810]],endX:.00,gripDrop:-.015},
 'h-bar':{points:[[.038,.815],[.095,.815],[.105,.975],[.21,.975],[.34,.975]],endX:.10,braces:[{x:.19,y:.875,z:.105}]},
 window:{points:[[.038,.815],[.135,.815],[.145,.945],[.22,.945],[.34,.905]],endX:.08,braces:[{x:.18,y:.945,z:.145}]},
 chumps:{points:[[.038,.815],[.13,.815],[.165,.840],[.185,.915],[.24,.935],[.34,.925]],endX:.04},
 breezer:{points:[[.038,.815],[.12,.815],[.145,.845],[.175,.965],[.205,.975],[.34,.855]],endX:.06},
 ape:{points:[[.038,.815],[.12,.815],[.15,.845],[.175,1.055],[.22,1.105],[.28,1.115],[.34,1.050]],endX:.03}
};
function profileToHandlebar(spec){const last=spec.points.length-1,bar=spec.points.map(([z,y],i)=>[C.MathUtils.lerp(.268,spec.endX,i/last),y,z]),tip=bar[last],gripStart=[tip[0]+.005,tip[1]+.005,tip[2]-.010],gripEnd=[tip[0]-.050,tip[1]+(spec.gripDrop??-.035),tip[2]+.040],control=[gripStart[0]+.011,gripStart[1]+.012,gripStart[2]-.024],mirrorTop=[control[0]-.095,control[1]+.118,control[2]-.008];return {bar,grip:[gripStart,gripEnd],control,lever:[[control[0]+.004,control[1]+.009,control[2]+.008],[gripEnd[0]+.010,gripEnd[1]+.055,gripEnd[2]-.005],[gripEnd[0]-.020,gripEnd[1]+.015,gripEnd[2]+.022]],mirrorStem:[[control[0]+.009,control[1]+.009,control[2]+.006],[control[0]-.018,control[1]+.070,control[2]-.006],mirrorTop],mirror:[mirrorTop[0]-.012,mirrorTop[1]+.024,mirrorTop[2]+.002],face:[mirrorTop[0]-.022,mirrorTop[1]+.025,mirrorTop[2]+.002],cable:[[control[0]+.020,control[1]+.010,control[2]-.015],[.264,Math.max(.900,control[1]+.025),.159],[.321,.839,.116],[.349,.738,.08],[.487,.526,.047]],braces:spec.braces??[]};}
const handlebarSpecs={normal:normalHandlebarSpec};for(const [name,profile] of Object.entries(handlebarProfiles))handlebarSpecs[name]=profileToHandlebar(profile);
const mirrorGlass=mat('#9eafb5',1,.08);
function buildHandlebarVariant(name,spec){const group=new C.Group();group.name=`${name} handlebars`;bike.add(group);for(const s of [-1,1]){const signed=p=>[p[0],p[1],s*p[2]],bar=spec.bar.map(signed),gripStart=signed(spec.grip[0]),gripEnd=signed(spec.grip[1]),gripAxis=new C.Vector3(...gripEnd).sub(new C.Vector3(...gripStart)).normalize();tube(bar,.012,chrome,60,group);rod(gripStart,gripEnd,.017,rubber,.017,group);for(let j=0;j<8;j++){const t=j/7,p=new C.Vector3(...gripStart).lerp(new C.Vector3(...gripEnd),t),ringg=ring(.016,.0013,p.toArray(),dark,group);ringg.quaternion.setFromUnitVectors(new C.Vector3(0,0,1),gripAxis);}ell(signed(spec.control),[.022,.025,.024],dark,group);tube(spec.lever.map(signed),.004,chrome,60,group);tube(spec.mirrorStem.map(signed),.005,chrome,60,group);const mir=ell(signed(spec.mirror),[.016,.050,.032],chrome,group);mir.rotation.z=-.20;const face=ell(signed(spec.face),[.005,.043,.026],mirrorGlass,group);face.rotation.z=-.20;tube(spec.cable.map(signed),.0035,rubber,90,group);}for(const brace of spec.braces??[])rod([brace.x,brace.y,-brace.z],[brace.x,brace.y,brace.z],.006,chrome,.006,group);group.visible=name==='normal';handlebarVariants[name]=group;}
for(const [name,spec] of Object.entries(handlebarSpecs))buildHandlebarVariant(name,spec);
// Single tilted speedometer.
const meter=cyl(.033,.034,[.222,.882,0],chrome,[-.55,.83,0]);const meterface=cyl(.029,.002,[.212,.897,0],dark,[-.55,.83,0]);rod([.207,.903,0],[.222,.913,.014],.001,red);
// Turn indicators on chrome stalks, front and rear.
for(const [x,y,z] of [[.296,.836,.131],[-.691,.510,.153]])for(const s of [-1,1]){rod([x,y,s*(z-.06)],[x,y,s*z],.007,chrome);cyl(.021,.041,[x,y,s*z],chrome,[1,0,0]);cyl(.020,.009,[x+.024,y,s*z],amber,[1,0,0]);for(let i=-2;i<=2;i++)rod([x+.029,y-.014,s*z+i*.005],[x+.029,y+.014,s*z+i*.005],.0005,amber);}
// Rear chain (far side) and sprocket.
cyl(.071,.008,[-.6625,.267,-.062],satin);ring(.067,.004,[-.6625,.267,-.07],dark);tube([[-.665,.337,-.072],[-.225,.322,-.072],[-.171,.282,-.072],[-.225,.231,-.072],[-.662,.197,-.072],[-.727,.257,-.072],[-.665,.337,-.072]],.005,dark,90);
// Black brake and speedometer cable along fork.
tube([[.06,.929,.32],[.253,.941,.19],[.346,.727,.09],[.459,.499,.086],[.607,.307,.078]],.003,rubber,90);
// Consolidate draw objects, not shape detail. Tires remain separately editable.
function batchMeshes(parent, editable=false){
 const groups=new Map();
 for(const object of [...parent.children]){if(!object.isMesh)continue;const key=object.material.uuid;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(object);}
 for(const objects of groups.values()){
  let vertexCount=0,indexCount=0;for(const o of objects){vertexCount+=o.geometry.attributes.position.count;indexCount+=o.geometry.index?.count??o.geometry.attributes.position.count;}
  const positions=new Float32Array(vertexCount*3),normals=new Float32Array(vertexCount*3),uvs=new Float32Array(vertexCount*2),indices=new Uint32Array(indexCount);
  let vertexOffset=0,indexOffset=0;const point=new C.Vector3(),normal=new C.Vector3(),normalMatrix=new C.Matrix3();
  for(const object of objects){object.updateMatrix();const g=object.geometry,p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;normalMatrix.getNormalMatrix(object.matrix);
   for(let i=0;i<p.count;i++){point.fromBufferAttribute(p,i).applyMatrix4(object.matrix);positions.set([point.x,point.y,point.z],(vertexOffset+i)*3);normal.fromBufferAttribute(n,i).applyMatrix3(normalMatrix).normalize();normals.set([normal.x,normal.y,normal.z],(vertexOffset+i)*3);if(uv)uvs.set([uv.getX(i),uv.getY(i)],(vertexOffset+i)*2);}
   const count=g.index?.count??p.count;for(let i=0;i<count;i++)indices[indexOffset+i]=vertexOffset+(g.index?g.index.getX(i):i);vertexOffset+=p.count;indexOffset+=count;parent.remove(object);g.dispose();
  }
  const geometry=new C.BufferGeometry();geometry.setAttribute('position',new C.BufferAttribute(positions,3));geometry.setAttribute('normal',new C.BufferAttribute(normals,3));geometry.setAttribute('uv',new C.BufferAttribute(uvs,2));geometry.setIndex(new C.BufferAttribute(indices,1));geometry.computeBoundingSphere();
  const merged=mesh(geometry,objects[0].material,[0,0,0],parent);merged.name=editable?'Editable tire surface':'Batched frame/body surface';if(editable)merged.userData.basePositions=new Float32Array(positions);
 }
}
let originalDrawObjects=0;bike.traverse(o=>{if(o.isMesh)originalDrawObjects++;});
batchMeshes(bike);for(const t of tireGroups)batchMeshes(t.group,true);for(const f of fenderGroups)batchMeshes(f.group,true);for(const g of Object.values(handlebarVariants))batchMeshes(g);for(const g of Object.values(tankVariants))batchMeshes(g);
let batchedDrawObjects=0;bike.traverse(o=>{if(o.isMesh)batchedDrawObjects++;});

// Studio lighting / geometry reflections, no photographic backplate.
const envScene=new C.Scene();envScene.background=new C.Color('#888b8a');const envMat=(c,i)=>new C.MeshBasicMaterial({color:c,toneMapped:false});function softbox(p,s,c){const m=new C.Mesh(new C.PlaneGeometry(...s),envMat(c));m.position.set(...p);m.lookAt(0,.3,0);envScene.add(m);}softbox([0,4,1],[5,2],'#ffffff');softbox([-3,2,1],[2,3],'#ffffff');softbox([1,1,-4],[4,.7],'#ffffff');softbox([2,.5,3],[1,2],'#c3c8ce');softbox([0,-1,0],[8,8],'#303838');const pmrem=new C.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(envScene,.06).texture;pmrem.dispose();
scene.add(new C.HemisphereLight('#f9faff','#8d958a',2.0));const key=new C.DirectionalLight('#fff9ee',3.5);key.position.set(-1,3,2);key.castShadow=true;key.shadow.mapSize.set(mobile?512:1024,mobile?512:1024);key.shadow.camera.left=-1.7;key.shadow.camera.right=1.7;key.shadow.camera.top=1.6;key.shadow.camera.bottom=-1.6;key.shadow.normalBias=.006;key.shadow.bias=-.0002;key.shadow.radius=4;scene.add(key);const fill=new C.DirectionalLight('#ecf3ff',1.8);fill.position.set(2,1,-2);scene.add(fill);
const floor=mesh(new C.PlaneGeometry(200,200),mat('#e9e7e2',0,.9),[0,-.0005,0],scene);floor.rotation.x=-Math.PI/2;floor.castShadow=false;floor.receiveShadow=true;
// Lightweight orbit controller with view presets and independent style variants.
let theta=0,phi=1.45,radius=3.40;const target=new C.Vector3(-.01,.52,0);let desired=null;
const presets={side:[0,Math.PI/2,2.8,'RIGHT PROFILE'],three:[.66,1.28,2.85,'FRONT THREE-QUARTER'],rear:[-.70,1.32,2.85,'REAR THREE-QUARTER'],left:[Math.PI,Math.PI/2,2.8,'LEFT PROFILE']};
function setView(v,instant=false){if(!Object.prototype.hasOwnProperty.call(presets,v))v='side';const p=presets[v];desired={theta:p[0],phi:p[1],radius:p[2]};if(instant){({theta,phi,radius}=desired);desired=null;}document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===v));document.getElementById('view-label').textContent=p[3];invalidate();}
function resize(){const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();invalidate();}window.addEventListener('resize',resize);resize();
let drag=false,last=[0,0],moved=false;const pointers=new Map();let pinch=0;
renderer.domElement.addEventListener('pointerdown',e=>{pointers.set(e.pointerId,[e.clientX,e.clientY]);drag=true;last=[e.clientX,e.clientY];renderer.domElement.setPointerCapture(e.pointerId);desired=null;if(pointers.size===2){const p=[...pointers.values()];pinch=Math.hypot(p[0][0]-p[1][0],p[0][1]-p[1][1]);}});
renderer.domElement.addEventListener('pointermove',e=>{if(!drag)return;pointers.set(e.pointerId,[e.clientX,e.clientY]);if(pointers.size===2){const p=[...pointers.values()],d=Math.hypot(p[0][0]-p[1][0],p[0][1]-p[1][1]);if(pinch)radius*=pinch/d;pinch=d;}else{theta-=(e.clientX-last[0])*.006;phi-= (e.clientY-last[1])*.005;}phi=C.MathUtils.clamp(phi,.35,1.7);radius=C.MathUtils.clamp(radius,1.8,5.5);last=[e.clientX,e.clientY];document.querySelectorAll('[data-view]').forEach(b=>b.classList.remove('active'));document.getElementById('view-label').textContent='ORBIT VIEW';invalidate();});
function release(e){pointers.delete(e.pointerId);drag=pointers.size>0;if(pointers.size===1)last=[...pointers.values()][0];pinch=0;}
renderer.domElement.addEventListener('pointerup',release);renderer.domElement.addEventListener('pointercancel',release);renderer.domElement.addEventListener('wheel',e=>{e.preventDefault();desired=null;radius=C.MathUtils.clamp(radius*Math.exp(e.deltaY*.001),1.8,5.5);invalidate();},{passive:false});
// Rigid chassis pitch from two circular tires touching the same ground plane.
function tirePose(frontMM,rearMM){const rf=frontMM/2000,rr=rearMM/2000;const angle=Math.asin((rf-rr)/1.325);return {angle,height:(rf+rr)/2-.267*Math.cos(angle),rf,rr};}
function setFenderClearance(f,newOuter){const radialOffset=newOuter-f.baselineTireRadius,newCenterRadius=f.baselineRadius+radialOffset,angularScale=f.baselineRadius/newCenterRadius;for(const part of f.group.children){const a=part.userData.basePositions,pos=part.geometry.getAttribute('position');for(let i=0;i<pos.count;i++){const dx=a[i*3]-f.x,dy=a[i*3+1]-f.y,baseRadius=Math.hypot(dx,dy);let angle=Math.atan2(dy,dx);while(angle-f.midAngle>Math.PI)angle-=Math.PI*2;while(angle-f.midAngle< -Math.PI)angle+=Math.PI*2;const adjustedAngle=f.midAngle+(angle-f.midAngle)*angularScale,adjustedRadius=baseRadius+radialOffset;pos.setXYZ(i,f.x+Math.cos(adjustedAngle)*adjustedRadius,f.y+Math.sin(adjustedAngle)*adjustedRadius,a[i*3+2]);}pos.needsUpdate=true;part.geometry.computeVertexNormals();part.geometry.computeBoundingSphere();}}
function setTires(frontMM,rearMM){const p=tirePose(frontMM,rearMM);for(const t of tireGroups){const newOuter=t.x>0?p.rf:p.rr;const spanScale=(newOuter-t.rim)/(t.baselineRadius-t.rim);for(const part of t.group.children){const a=part.userData.basePositions,pos=part.geometry.getAttribute('position');for(let i=0;i<pos.count;i++){const dx=a[i*3]-t.x,dy=a[i*3+1]-t.y,r=Math.hypot(dx,dy),newR=t.rim+(r-t.rim)*spanScale;pos.setXYZ(i,t.x+dx*newR/r,t.y+dy*newR/r,a[i*3+2]);}pos.needsUpdate=true;part.geometry.computeVertexNormals();part.geometry.computeBoundingSphere();}}for(const f of fenderGroups)setFenderClearance(f,f.x>0?p.rf:p.rr);bike.rotation.z=p.angle;bike.position.y=p.height;document.getElementById('front-value').value=frontMM+' mm';document.getElementById('rear-value').value=rearMM+' mm';document.getElementById('pitch').textContent=(p.angle*180/Math.PI).toFixed(1)+'°';document.getElementById('front-diameter').value=frontMM;document.getElementById('rear-diameter').value=rearMM;invalidate();return p;}
for(const id of ['front-diameter','rear-diameter'])document.getElementById(id).addEventListener('input',()=>setTires(+document.getElementById('front-diameter').value,+document.getElementById('rear-diameter').value));document.getElementById('tires-reset').addEventListener('click',()=>setTires(534,534));setTires(534,534);
function setHandlebar(name){if(!Object.prototype.hasOwnProperty.call(handlebarVariants,name))name='normal';for(const [key,group] of Object.entries(handlebarVariants))group.visible=key===name;document.getElementById('handlebar-style').value=name;invalidate();return name;}
function setTank(name){if(!Object.prototype.hasOwnProperty.call(tankVariants,name))name='normal';for(const [key,group] of Object.entries(tankVariants))group.visible=key===name;document.getElementById('tank-style').value=name;invalidate();return name;}
document.getElementById('handlebar-style').addEventListener('change',event=>setHandlebar(event.target.value));
document.getElementById('tank-style').addEventListener('change',event=>setTank(event.target.value));
document.getElementById('custom-reset').addEventListener('click',()=>{setHandlebar('normal');setTank('normal');});setHandlebar('normal');setTank('normal');
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{if(window.JAZZ_STATE.active3D)setView(b.dataset.view);}));document.getElementById('reset').addEventListener('click',()=>setView('side'));
const initialView=new URLSearchParams(location.search).get('view');setView(Object.prototype.hasOwnProperty.call(presets,initialView)?initialView:'side',true);
function render(){
 pendingFrame=false;if(!running)return;
 try {
  if(desired){theta=C.MathUtils.lerp(theta,desired.theta,.14);phi=C.MathUtils.lerp(phi,desired.phi,.14);radius=C.MathUtils.lerp(radius,desired.radius,.14);if(Math.abs(theta-desired.theta)+Math.abs(phi-desired.phi)+Math.abs(radius-desired.radius)<.0001)desired=null;}
  const responsive=camera.aspect<1.1?1.1/camera.aspect:1;
  camera.position.set(target.x+radius*responsive*Math.sin(theta)*Math.sin(phi),target.y+radius*responsive*Math.cos(phi),target.z+radius*responsive*Math.cos(theta)*Math.sin(phi));camera.lookAt(target);
  if(dirty||desired){renderer.render(scene,camera);dirty=false;}if(desired)invalidate();
 } catch(error){running=false;window.JAZZ_SHOW_STATIC('3D描画を続けられないため、静止画に切り替えました。','render-error');console.warn('JAZZ render error:',error?.message);}
}
// Initial render must succeed before the static image and disabled controls disappear.
render();if(running)window.JAZZ_READY();
document.addEventListener('visibilitychange',()=>{if(!document.hidden)invalidate();});
window.JAZZ_PROTOTYPE={version:'0.3.0',model:'Owned procedural approximation based on supplied reference',wheelbase:1.325,frontRimDiameter:.4064,rearRimDiameter:.3048,meshes:batchedDrawObjects,originalDrawObjects,mobile,setView,setTires,setHandlebar,setTank,tirePose,renderer,scene,camera,bike};

} catch(error) {
 const message=/WebGL|context/i.test(error?.message||'')
  ? 'このブラウザでは3D描画を開始できないため、静止画を表示しています。待ち続ける必要はありません。WebGL対応のSafariやChromeで開いてください。'
  : '3Dの起動中にエラーが発生したため、静止画を表示しています。ページを再読み込みすると再試行できます。';
 window.JAZZ_SHOW_STATIC(message,'initialization-error');console.warn('JAZZ initialization error:',error?.message);
}
