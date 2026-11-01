const canvas=document.querySelector('#field'),ctx=canvas.getContext('2d'),stage=document.querySelector('.stage'),journey=document.querySelector('.journey');
const opening=document.querySelector('.opening'),about=document.querySelector('.about'),contact=document.querySelector('.contact-ending');
const themeToggle=document.querySelector('.theme-toggle'),root=document.documentElement;
function setTheme(mode,persist=true){root.dataset.mode=mode;themeToggle.setAttribute('aria-pressed',String(mode==='light'));themeToggle.setAttribute('aria-label',`Switch to ${mode==='light'?'dark':'light'} mode`);themeToggle.querySelector('.theme-label').textContent=mode==='light'?'Dark':'Light';themeToggle.querySelector('[aria-hidden="true"]').textContent=mode==='light'?'◑':'◐';if(persist){try{localStorage.setItem('hero-study-mode',mode)}catch{}}ambient=null;atlas=null;atlasCell=0;ripples=[];veilPresence=0;sculptureGlyphs.clear();cubeCharacterAtlas=null;if(portrait)cachePortrait();document.querySelectorAll('.hobby-art').forEach(target=>buildHobbyArt(target,0));needsDraw=true;update()}
themeToggle.addEventListener('click',()=>setTheme(root.dataset.mode==='light'?'dark':'light'));
let contactWordClock=0,contactInteraction=false,contactMasks=null,smoothScroll=null;
const TRANSITION_SPEED=1.6,CONTACT_HOLD=4.8,CONTACT_PERIOD=CONTACT_HOLD+2/TRANSITION_SPEED,contactFaces=['Bungee','Monoton','Dela Gothic One'];
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=x=>Math.max(0,Math.min(1,x)),mix=(a,b,p)=>a+(b-a)*p,ease=x=>{x=clamp(x);return x*x*(3-2*x)};
const glyphs=' .,:;-=+*#%@',PROJECT_START=4.5,PROJECT_LENGTH=2.1,CONTACT_START=12.65,END=15.3;
let w=0,h=0,time=0,last=0,raf=0,story=0,paused=reduced.matches,visible=true,portrait=null,portraitInk=null,portraitPhoto=null,portraitPoints=[],atlas=null,atlasCell=0;
// Interaction techniques adapted from React Bits' official sources:
// https://reactbits.dev/text-animations/ascii-text and https://reactbits.dev/animations/dither-veil
// (MIT + Commons Clause; notices retained by attribution, no component code vendored).
// The dither veil is a cell-resolution exposure mask thresholded against an 8x8
// Bayer matrix; ASCII Text contributes pointer tilt, hover scramble and click ripples.
// Both are reimplemented against this file's single canvas and tick loop.
const smoothstep=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t)};
const hashNoise=(x,y,s)=>{const v=Math.sin(x*12.9898+y*78.233+s*37.719)*43758.5453;return v-Math.floor(v)};
const BAYER=new Float32Array(64);
for(let by=0;by<8;by++)for(let bx=0;bx<8;bx++){const v=bx^by,m=((v&1)<<5)|((by&1)<<4)|((v&2)<<2)|((by&2)<<1)|((v&4)>>1)|((by&4)>>2);BAYER[by*8+bx]=(m+.5)/64}
let hover={x:.5,y:.5,inside:false},tiltX=0,tiltY=0,ripples=[];
let veilMask=null,veilMaskCtx=null,veilImageData=null,veilAlpha=null,veilCols=0,veilRows=0,veilScale=null,veilScratch=null,veilBrush={x:0,y:0},veilPresence=0;
let frameDelta=1/60,scrollDirty=true,needsDraw=true;
const projects=[
 {name:'Rekindle',slug:'rekindle',description:'A product recommender that learns from review histories, achieving about 46% higher offline NDCG@10 than its strongest baseline.',repo:'rekindle',background:[16,17,15]},
 {name:'MarketMind',slug:'marketmind',description:'An LLM research agent that combines prediction-market data with external evidence to investigate gaps between market prices and the news.',repo:'MarketMind-yHack26',background:[17,18,20]},
 {name:'AutoCPT',slug:'autocpt',description:'A speech-to-CPT prototype that suggests billing codes from live clinical transcripts to reduce manual code lookup.',repo:'AutoCPT',background:[19,18,17]},
 {name:'NBAnomaly',slug:'nbanomaly',description:'A basketball analytics platform that compares player statistics to surface unusual performance profiles.',repo:'NBAnomaly',background:[17,19,18]}
];
const panels=projects.map(project=>{const panel=document.createElement('section');panel.className='project-panel';panel.id=project.slug;panel.setAttribute('aria-labelledby',`${project.slug}-title`);panel.innerHTML=`<h2 id="${project.slug}-title">${project.name}</h2><p>${project.description}</p><a href="https://github.com/Techdude01/${project.repo}">View source ↗</a><canvas class="reduced-diagram" role="img" aria-label="Illustrative ${project.name} workflow animation"></canvas>`;stage.insertBefore(panel,document.querySelector('.stage-footer'));return panel});
// The drawing is explanatory artwork; its moving identifiers and numbers are illustrative.
canvas.setAttribute('role','presentation');
fetch('./marks.json').then(r=>r.json()).then(marks=>document.querySelectorAll('[data-mark]').forEach(svg=>{const mark=marks[svg.dataset.mark];svg.setAttribute('viewBox',mark.viewBox);mark.paths.forEach(d=>{const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',d);svg.append(path)})})).catch(()=>{});
const photo=new Image();photo.onload=()=>{portrait=photo;cachePortrait();draw()};photo.src='../images/portrait-720.webp';
function cachePortrait(){
 const cols=100,rows=Math.round(100*portrait.height/portrait.width),size=600,ph=Math.round(size*portrait.height/portrait.width);
 portraitPhoto=document.createElement('canvas');portraitPhoto.width=size;portraitPhoto.height=ph;
 const c=portraitPhoto.getContext('2d');
 // Exactly the same crop in the photograph and its character rendering. No masks or vignette.
 c.drawImage(portrait,portrait.width*.10,portrait.height*.10,portrait.width*.80,portrait.height*.80,0,0,size,ph);
 document.querySelector(".reduced-photo").src=portraitPhoto.toDataURL("image/webp");
 const sample=document.createElement('canvas');sample.width=cols;sample.height=rows;const sc=sample.getContext('2d');sc.drawImage(portraitPhoto,0,0,cols,rows);const pixels=sc.getImageData(0,0,cols,rows).data;
 portraitInk=document.createElement('canvas');portraitInk.width=size;portraitInk.height=ph;const ink=portraitInk.getContext('2d');ink.font='10px monospace';ink.textBaseline='middle';portraitPoints=[];
 veilCols=cols;veilRows=rows;veilAlpha=new Float32Array(cols*rows);veilBrush={x:cols/2,y:rows/2};veilPresence=0;
 veilMask=document.createElement('canvas');veilMask.width=cols;veilMask.height=rows;veilMaskCtx=veilMask.getContext('2d');veilImageData=veilMaskCtx.createImageData(cols,rows);
 veilScale=document.createElement('canvas');veilScale.width=size;veilScale.height=ph;veilScratch=document.createElement('canvas');veilScratch.width=size;veilScratch.height=ph;
 const asciiInk=root.dataset.mode==='light'?'rgb(41,65,101)':'rgb(230,230,220)';for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const k=(y*cols+x)*4,v=(pixels[k]*.2126+pixels[k+1]*.7152+pixels[k+2]*.0722)/255;const char=glyphs[Math.min(10,Math.floor(Math.pow(v,.7)*11))];ink.fillStyle=asciiInk;ink.globalAlpha=.2+v*.8;ink.fillText(char,x*6,y/rows*ph+3);ink.globalAlpha=1;if(v>.12&&x%2===0&&y%2===0)portraitPoints.push({x:x/cols,y:y/rows,char,alpha:.25+v*.7})}
}
function portraitRect(){const mobile=w<700,pw=mobile?Math.min(w*.52,310):Math.min(w*.40,h*.65);return {x:mobile?w*.40:w*.045,y:mobile?h*.025:h*.16,w:pw,h:pw*(portrait?portrait.height/portrait.width:1)}}
function drawPortrait(){
 if(!portraitInk||!veilMaskCtx||story<1.95)return;
 const toPhoto=ease((story-2.25)/.55),toAscii=ease((story-3.55)/.55),exit=ease((story-4.08)/.65),alpha=1-exit,r=portraitRect();
 if(alpha<.001)return;
 const photoMix=toPhoto*(1-toAscii),peak=updateVeil(r,photoMix);
 if(photoMix<.001&&peak<.02){ctx.globalAlpha=alpha;ctx.drawImage(portraitInk,r.x,r.y,r.w,r.h);ctx.globalAlpha=1;return}
 const sc=veilScratch.getContext('2d');
 sc.setTransform(1,0,0,1,0,0);sc.imageSmoothingEnabled=false;sc.globalCompositeOperation='source-over';
 sc.clearRect(0,0,veilScratch.width,veilScratch.height);sc.drawImage(portraitInk,0,0);
 sc.globalCompositeOperation='destination-out';sc.drawImage(veilScale,0,0);
 ctx.globalAlpha=alpha;ctx.drawImage(veilScratch,r.x,r.y,r.w,r.h);
 sc.globalCompositeOperation='source-over';sc.clearRect(0,0,veilScratch.width,veilScratch.height);sc.drawImage(portraitPhoto,0,0);
 sc.globalCompositeOperation='destination-in';sc.drawImage(veilScale,0,0);
 ctx.drawImage(veilScratch,r.x,r.y,r.w,r.h);ctx.globalAlpha=1;
}
function updateVeil(r,photoMix){
 const cols=veilCols,rows=veilRows,cells=veilAlpha,dt=Math.min(.05,Math.max(0,frameDelta));
 if(!cols||!rows||!cells)return 0;
 const cell=r.w/cols;
 // Pointer when present, otherwise the same slow wander Dither Veil uses when idle.
 let tx,ty,targetStrength;
 if(hover.inside&&!reduced.matches){tx=(hover.x*w-r.x)/r.w*cols;ty=(hover.y*h-r.y)/r.h*rows;targetStrength=1}
 else{tx=cols*(.5+.32*Math.sin(time*.31)+.07*Math.sin(time*.73+1.6));ty=rows*(.5+.26*Math.sin(time*.41+1.1)+.06*Math.cos(time*.9));targetStrength=.55}
 veilPresence=mix(veilPresence,targetStrength,1-Math.exp(-dt/.2));
 const follow=1-Math.exp(-dt/(hover.inside?.045:.35));
 veilBrush.x=mix(veilBrush.x,tx,follow);veilBrush.y=mix(veilBrush.y,ty,follow);
 // Linger: the trail decays rather than disappearing between brush moves.
 const fade=dt/1.35;
 for(let i=0;i<cells.length;i++){const v=cells[i]-fade;cells[i]=v>0?v:0}
 const radius=Math.max(46,Math.min(230,r.w*.24))*(.45+.55*veilPresence)/cell,soft=Math.max(1.2,radius*.62);
 const x0=Math.max(0,Math.floor(veilBrush.x-radius)),x1=Math.min(cols,Math.ceil(veilBrush.x+radius)),y0=Math.max(0,Math.floor(veilBrush.y-radius)),y1=Math.min(rows,Math.ceil(veilBrush.y+radius));
 for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){
  const d=Math.hypot(x+.5-veilBrush.x,y+.5-veilBrush.y);
  if(d>=radius)continue;
  const value=clamp((radius-d)/soft)*veilPresence,i=y*cols+x;
  if(value>cells[i])cells[i]=value;
 }
 // Click shockwave: an expanding ring that exposes the photo along its band.
 for(const rip of ripples){
  const rx=(rip.x*w-r.x)/r.w*cols,ry=(rip.y*h-r.y)/r.h*rows,reach=rip.age*Math.max(w,h)*.75/cell,band=Math.max(3,reach*.16),strength=(1-clamp(rip.age/1.3))*.9;
  if(strength<=.002)continue;
  for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
   const gap=Math.abs(Math.hypot(x+.5-rx,y+.5-ry)-reach);
   if(gap>=band)continue;
   const value=clamp(1-gap/band)*strength,i=y*cols+x;
   if(value>cells[i])cells[i]=value;
  }
 }
 // Quantize exposure against the Bayer matrix so the reveal is a 1-bit dither,
 // and the timeline blend can sit underneath it as a floor.
 const data=veilImageData.data;let peak=0;
 for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
  const i=y*cols+x,shown=clamp(photoMix+cells[i]),on=shown>BAYER[(x&7)*8+(y&7)];
  if(cells[i]>peak)peak=cells[i];
  const k=i*4;data[k]=255;data[k+1]=255;data[k+2]=255;data[k+3]=on?255:0;
 }
 veilMaskCtx.putImageData(veilImageData,0,0);
 const sc=veilScale.getContext('2d');
 sc.setTransform(1,0,0,1,0,0);sc.imageSmoothingEnabled=false;sc.clearRect(0,0,veilScale.width,veilScale.height);
 sc.drawImage(veilMask,0,0,cols,rows,0,0,veilScale.width,veilScale.height);
 return peak;
}
function glyphAtlas(cell,step){if(atlas&&atlasCell===cell)return atlas;atlasCell=cell;atlas=document.createElement('canvas');atlas.width=cell*11;atlas.height=step;const c=atlas.getContext('2d'),light=root.dataset.mode==='light';c.font=`${cell+1}px monospace`;c.textBaseline='middle';for(let i=0;i<11;i++){c.fillStyle=light?`rgba(31,64,109,${.1+i*.083})`:`rgba(218,220,210,${.1+i*.083})`;c.fillText(glyphs[i],i*cell,step/2)}return atlas}
function drawWaves(){
 const fold=ease((story-.4)/1.2),alpha=1-ease((story-1.1)/1.1);
 if(alpha<.001)return;
 const cell=Math.max(7,Math.ceil(w/145)),step=Math.ceil(cell*1.35),sprite=glyphAtlas(cell,step);
 const interactive=!paused&&!reduced.matches&&story<1.1,tick=Math.floor(time*18);
 // ASCII Text's tilt follow: eased toward the pointer, drifting on its own when idle.
 const follow=1-Math.exp(-6*Math.min(.05,frameDelta));
 const targetX=interactive&&hover.inside?(hover.y-.5)*1.4:Math.sin(time*.55)*.12;
 const targetY=interactive&&hover.inside?(hover.x-.5)*1.4:Math.sin(time*.4+1.3)*.2;
 tiltX+=(targetX-tiltX)*follow;tiltY+=(targetY-tiltY)*follow;
 const px=hover.x*w,py=hover.y*h,reach=Math.max(120,h*.18*1.6);
 const rings=interactive?ripples:[];
 ctx.globalAlpha=alpha;
 for(let y=0;y<h;y+=step){
  const v=y/h,ys=Math.sin(v*5.4-time*.18)*.52;
  for(let x=0;x<w;x+=cell){
   const cx=x+cell*.5,cy=y+step*.5;
   let ring=0,pushX=0,pushY=0;
   for(const rip of rings){
    const rx=rip.x*w,ry=rip.y*h,radius=rip.age*Math.max(w,h)*.75,band=Math.max(cell*3,24),gap=Math.abs(Math.hypot(cx-rx,cy-ry)-radius);
    const fall=(1-smoothstep(0,1.2,rip.age))*(1-smoothstep(0,band,gap));
    if(fall<=0)continue;
    ring=Math.max(ring,fall);
    const dx=cx-rx,dy=cy-ry,len=Math.hypot(dx,dy)||1;
    pushX+=dx/len*fall*cell*1.5;pushY+=dy/len*fall*cell*1.5;
   }
   // Tilt and ripple push both displace the sampled surface, not just the glyph.
   const u=x/w+(pushX+tiltY*(v-.5)*cell*2)/w,vv=v+(pushY+tiltX*(u-.5)*cell*2)/h;
   const a=u*3.8+vv*1.65+ys,b=vv*2.7-u*.8+Math.sin(u*6+time*.12)*.28;
   const surface=Math.sin(a*3.5+time*.13)+Math.cos(b*4.1-time*.09)*.57;
   const value=Math.exp(-((surface/.48)**2))*.76+((.5+.5*Math.cos(a*26+b*4))**3)*.25;
   if(value<.1&&ring<.08)continue;
   let index=value<.1?0:Math.min(10,Math.floor(value*10));
   const near=Math.hypot(cx-px,cy-py),scramble=hover.inside?clamp(1-smoothstep(reach*.35,reach,near))*.55:0;
   if(index>0&&hashNoise(x,y,tick)<scramble*.8)index=1+Math.floor(hashNoise(x,y,tick+7.13)*10);
   if(ring>0&&hashNoise(x,y,tick*3.1)<ring)index=1+Math.floor(hashNoise(x,y,tick*1.7)*10);
   const z=surface*.22*fold,p=(u-.5)*Math.cos(fold*1.1)+z*Math.sin(fold*1.1),perspective=1/(1-z*.3);
   if(ring>0)ctx.globalAlpha=alpha*Math.min(1,.72+ring*.5);
   ctx.drawImage(sprite,index*cell,0,cell,step,(.5+p*perspective)*w,(.5+(vv-.5)*(1-fold*.68)*perspective)*h,cell,step);
   if(ring>0)ctx.globalAlpha=alpha;
  }
 }
 ctx.globalAlpha=1;
}
let waveMorphOrigin=null;
function drawWavePortraitMorph(){
 if(!portraitPoints.length){drawWaves();return}
 const amount=ease((story-.85)/1.10),r=portraitRect();
 if(!waveMorphOrigin){
  waveMorphOrigin=[];
  const cell=Math.max(7,Math.ceil(w/145)),step=Math.ceil(cell*1.35),fold=ease((.85-.4)/1.2);
  // Capture the actual folded wave surface, then move these same characters into the portrait.
  for(let y=0;y<h;y+=step)for(let x=0;x<w;x+=cell){const u=x/w,v=y/h,a=u*3.8+v*1.65+Math.sin(v*5.4-time*.18)*.52,b=v*2.7-u*.8+Math.sin(u*6+time*.12)*.28,surface=Math.sin(a*3.5+time*.13)+Math.cos(b*4.1-time*.09)*.57,value=Math.exp(-((surface/.48)**2))*.76+((.5+.5*Math.cos(a*26+b*4))**3)*.25;if(value<.10)continue;const z=surface*.22*fold,px=(u-.5)*Math.cos(fold*1.1)+z*Math.sin(fold*1.1),perspective=1/(1-z*.3);waveMorphOrigin.push({x:(.5+px*perspective)*w,y:(.5+(v-.5)*(1-fold*.68)*perspective)*h,char:glyphs[Math.min(10,Math.floor(value*10))],alpha:.1+value*.8})}
 }
 const count=waveMorphOrigin.length;ctx.textBaseline='middle';ctx.fillStyle=root.dataset.mode==='light'?'#244a7c':'#dcddd6';ctx.font=`${mix(Math.max(8,w/145),r.w/100*1.67,amount)}px monospace`;
 for(let i=0;i<count;i++){
  const source=waveMorphOrigin[i],target=portraitPoints[Math.min(portraitPoints.length-1,Math.floor(i/count*portraitPoints.length))];
  const bend=Math.sin(amount*Math.PI)*Math.sin(i*.618)*22;
  ctx.globalAlpha=mix(source.alpha,target.alpha,amount);
  ctx.fillText(amount<.5?source.char:target.char,mix(source.x,r.x+target.x*r.w,amount)+bend,mix(source.y,r.y+target.y*r.h,amount));
 }
 ctx.globalAlpha=1;
}
// A small typographic drawing surface shared by every workflow.
function diagram(index,phase,clock){
 const points=[],symbolBanks=['.,:;`', '/\\|_-~', '()[]{}<>', '+*=#%@&'];
 // The project artwork uses only marks. All explanatory language lives in the HTML description.
 function point(x,y,z=0,light=.7){
  const a=Math.sin(clock*.09)*.13,rx=x*Math.cos(a)+z*Math.sin(a),rz=-x*Math.sin(a)+z*Math.cos(a),perspective=2.9/(2.9-rz);
  const value=clamp(light),bank=symbolBanks[Math.min(3,Math.floor(value*4))],variation=Math.abs(Math.floor(x*39+y*57+z*83));const char=bank[variation%bank.length];
  points.push({x:.5+rx*.43*perspective,y:.5+y*.43*perspective,char,alpha:.18+value*.78});
 }
 if(index===0){
  // Three lateral retrieval currents braid together before opening into ranking shelves.
  for(let stream=0;stream<3;stream++)for(let u=0;u<108;u++)for(let v=0;v<8;v++){
   const p=u/107,merge=ease((p-.12)/.78),width=(v/7-.5)*.15;
   point(-1.12+p*1.34,(stream-1)*.78*(1-merge)+Math.sin(p*8+stream*2.1-clock*.3)*(.07+merge*.13)+width,Math.cos(p*7+stream*2.1-clock*.2)*(.12+merge*.22),.27+.53*(.5+.5*Math.cos(p*35-clock*1.7+stream)));
  }
  for(let strand=0;strand<5;strand++)for(let i=0;i<76;i++){
   const p=i/75,angle=p*10+strand*Math.PI*.4-clock*.35,radius=.27*(1-p*.4);
   point(-.55+p*.8,Math.cos(angle)*radius,Math.sin(angle)*radius,.23+.30*Math.max(0,Math.sin(angle)));
  }
  const order=[2,0,4,1,5,3],cycle=(clock*.105)%1,turn=ease(cycle<.5?cycle*3:(cycle-.5)*3);
  for(let row=0;row<6;row++)for(let u=0;u<57;u++)for(let v=0;v<7;v++){
   const target=cycle<.5?order.indexOf(row):row,previous=cycle<.5?row:order.indexOf(row),rank=mix(previous,target,turn),p=u/56,q=v/6-.5,length=.47+(5-row)*.055;
   point(.29+p*length,-.84+rank*.33+q*.055+Math.sin(p*Math.PI)*.05,q*.24+Math.sin(p*4+clock*.13)*.10,(target<3?.88:.48)*(.72+.28*Math.cos(p*33-clock*.7)));
  }
 }else if(index===1){
  // Evidence arrives from all sides, folding into a broad central research surface.
  const cycle=(clock*.065)%1,gather=(1-Math.cos(cycle*Math.PI*2))*.5;
  for(let layer=0;layer<3;layer++)for(let u=0;u<45;u++)for(let v=0;v<28;v++){
   const x=(u/44-.5)*.76,y=(v/27-.5)*1.08,fold=Math.sin(x*7+clock*.24)*.15;
   point(x+layer*.025,y+fold+layer*.025,x*Math.sin(clock*.14)*.35-layer*.13,.30+.45*(.5+.5*Math.cos(v*.8+u*.16-clock*.4)));
  }
  for(let satellite=0;satellite<8;satellite++){
   const angle=satellite/8*Math.PI*2+Math.sin(clock*.1)*.10,radius=1-gather*.22,cx=Math.cos(angle)*radius,cy=Math.sin(angle)*radius*.91,cz=Math.sin(angle+clock*.12)*.20;
   for(let u=0;u<18;u++)for(let v=0;v<11;v++){
    const px=(u/17-.5)*.28,py=(v/10-.5)*.23;point(cx+px*Math.cos(angle*.5),cy+py+Math.sin(u*.3+clock*.12)*.03,cz+px*Math.sin(angle*.5),.28+.37*(.5+.5*Math.cos(u*.8+v*.25)));
   }
   for(let i=0;i<57;i++){
    const p=i/56,arc=Math.sin(p*Math.PI)*.19;point(cx*(1-p)+arc*Math.sin(angle),cy*(1-p)+arc*Math.cos(angle),cz*(1-p)+Math.sin(p*6)*.12,.18+.30*(.5+.5*Math.cos(p*24-clock*1.4)));
   }
  }
 }else if(index===2){
  // Speech occupies the left volume; fragments branch into a two-by-two field of code structures.
  for(let x=0;x<72;x++)for(let band=0;band<15;band++){
   const p=x/71,q=band/14*2-1,amplitude=.15+.57*(.5+.5*Math.sin(p*14-clock*1.3));
   point(-1.10+p*.62,q*amplitude*Math.sin(p*Math.PI),Math.sin(p*10-clock*.3+q)*.22,.26+.53*(1-Math.abs(q)));
  }
  const centers=[[.35,-.58],[.86,-.36],[.29,.43],[.83,.66]];
  for(let group=0;group<24;group++){
   const p=(clock*.055+group/24)%1,target=centers[group%4],cx=mix(-.45,target[0],p),cy=mix(Math.sin(group*2.1)*.49,target[1],p)+Math.sin(p*Math.PI)*Math.sin(group)*.20;
   for(let x=0;x<10;x++)for(let y=0;y<3;y++)point(cx+(x-5)*.014,cy+y*.018,Math.sin(p*7+group)*.17,.28+.46*p);
  }
  centers.forEach(([cx,cy],stack)=>{for(let layer=0;layer<3;layer++)for(let u=0;u<27;u++)for(let v=0;v<6;v++){
   const p=u/26,q=v/5-.5;point(cx+(p-.5)*.36,cy+layer*.085+Math.sin(p*Math.PI)*.035,q*.20+Math.sin(stack)*.08,.37+.40*(.5+.5*Math.cos(p*22-clock*.5+layer)));
  }});
 }else{
  // Peel coherent meridians from a recognizable basketball into a field of player distributions.
  const change=ease((phase-.1)/.79),rotation=clock*.19;
  for(let lat=1;lat<47;lat++)for(let lon=0;lon<90;lon++){
   const phi=lat/47*Math.PI,theta=lon/90*Math.PI*2+rotation,radius=.67,bx=-.48+Math.sin(phi)*Math.cos(theta)*radius,by=-.04+Math.cos(phi)*radius,bz=Math.sin(phi)*Math.sin(theta)*radius;
   if(bz<-.12)continue;
   const group=Math.floor(lon/9),delay=group/10*.42,peel=ease((change-delay)/Math.max(.1,1-delay)),column=group,tx=.19+column*.09+(lat%3)*.009,height=column===6?1.47:.43+Math.abs(Math.sin(column*1.9))*.66,ty=.80-lat/47*height;
   const seam=Math.min(Math.abs(Math.sin(theta*2)),Math.abs(Math.cos(phi))),arc=Math.sin(peel*Math.PI),lighting=.31+.55*Math.max(0,bz/radius);
   point(mix(bx,tx,peel)+arc*.13,mix(by,ty,peel)+arc*Math.sin(group*.7)*.22,bz*(1-peel)+arc*Math.cos(group)*.13,seam<.065?.14:lighting+(column===6?peel*.12:0));
  }
  // Remaining shell seams hold the ball's silhouette as its surface separates.
  for(let i=0;i<155;i++){
   const a=i/154*Math.PI*2,remain=1-change;point(-.48+Math.cos(a)*.67,-.04+Math.sin(a)*.67,0,.24*remain);
  }
  for(let col=0;col<10;col++)for(let layer=0;layer<3;layer++)for(let y=0;y<24;y++){
   const p=y/23,height=col===6?1.47:.43+Math.abs(Math.sin(col*1.9))*.66;point(.19+col*.09+layer*.01,.80-p*height,-.18+layer*.06,(col===6?.65:.22+p*.15)*(.3+change*.7));
  }
 }
 return points;
}
function diagramRect(){const mobile=w<700;if(mobile)return {x:w*.035,y:h*.035,w:w*.93,h:h*.43};const vh=Math.min(h,innerHeight),height=Math.min(vh*.80,w*.56);return {x:w*.02,y:(vh-height)*.5,w:w*.55,h:height}}
const sculptureGlyphs=new Map();
function sculptureGlyph(char,size){
 const key=char+':'+size;if(sculptureGlyphs.has(key))return sculptureGlyphs.get(key);
 const image=document.createElement('canvas'),width=Math.ceil(size*.92),height=Math.ceil(size*1.6),ratio=2;image.width=width*ratio;image.height=height*ratio;
 const c=image.getContext('2d');c.scale(ratio,ratio);c.font=`${size}px monospace`;c.textBaseline='middle';c.fillStyle=root.dataset.mode==='light'?'#244a7c':'#dcddd6';c.fillText(char,0,height*.5);
 const result={image,width,height};sculptureGlyphs.set(key,result);return result;
}
function renderPoints(context,from,to,amount,rect,sourceRect=rect){
 if(amount>.999)from=to;const count=Math.max(from.length,to.length),size=rect.glyphSize??Math.round(Math.max(8,rect.w/88*1.55)*2)/2;
 for(let i=0;i<count;i++){
  const a=from[i%from.length],b=to[i%to.length];if(!a||!b)continue;
  const x=mix(sourceRect.x+a.x*sourceRect.w,rect.x+b.x*rect.w,amount),y=mix(sourceRect.y+a.y*sourceRect.h,rect.y+b.y*rect.h,amount),bend=Math.sin(amount*Math.PI)*Math.sin(i*2.399)*Math.min(80,w*.08),sprite=sculptureGlyph(amount<.5?a.char:b.char,size);
  let dx=0,dy=0,ink=mix(a.alpha??1,b.alpha??1,amount),materialSprite=sprite;
  if(rect.material){
   const material=amount<.5?a:b,seed=material.seed??i,depth=material.depth ? .4 : 1;
   const wave=Math.sin(time*.29+x*.004+y*.008);
   dx=Math.cos(time*.21+y*.01+seed*.003)*.40*depth;dy=(wave*.95+Math.sin(time*.17+seed*.013)*.35)*depth;
   ink=clamp(ink*(1+Math.sin(time*.24+seed*.009)*.035));
   // Only a small share changes glyph at a time; the letter silhouette stays stable.
   if(material.bank&&!material.depth&&seed%11<2){const bank=material.bank,step=Math.floor(time*.18+seed*.017);materialSprite=sculptureGlyph(bank[Math.abs(Math.floor(seed)+step)%bank.length],size)}
  }
  context.globalAlpha=ink;context.drawImage(materialSprite.image,x+bend+dx,y+Math.cos(i)*bend*.5+dy-materialSprite.height/2,materialSprite.width,materialSprite.height);
 }context.globalAlpha=1;
}
function drawProjects(){if(story<4.08||story>=CONTACT_START)return;const position=(story-PROJECT_START)/PROJECT_LENGTH,index=Math.min(3,Math.max(0,Math.floor(position))),local=clamp(position-index),entry=ease(index===0?(story-4.08)/.85:local/.22);const next=diagram(index,local,time);if(entry>.999){renderPoints(ctx,next,next,1,diagramRect());return}const previous=index===0?portraitPoints:diagram(index-1,1,time);if(previous.length)renderPoints(ctx,previous,next,entry,diagramRect(),index===0?portraitRect():diagramRect());else renderPoints(ctx,next,next,1,diagramRect())}
let contactLayoutCache=null;
function textMask(text,family){
 const surface=document.createElement('canvas');surface.width=1100;surface.height=360;const c=surface.getContext('2d');
 let size=300;c.font=`400 ${size}px "${family}"`;size*=Math.min(1,1040/c.measureText(text).width);c.font=`400 ${size}px "${family}"`;c.fillStyle='#fff';
 const metrics=c.measureText(text),ascent=metrics.actualBoundingBoxAscent||size*.78,descent=metrics.actualBoundingBoxDescent||size*.08;
 c.fillText(text,4,(360+ascent-descent)/2);const pixels=c.getImageData(0,0,1100,360).data,face=[],depth=[];
 const banks=['.,:;`','-_=~','/\\|()[]{}<>','+*#%@&'];
 for(let y=0;y<360;y+=7)for(let x=0;x<1100;x+=7){const alpha=pixels[(y*1100+x)*4+3]/255;if(alpha<.25)continue;const seed=Math.floor(x/7)*17+Math.floor(y/7)*31,bank=banks[(Math.floor(x/21)+Math.floor(y/28))%banks.length],char=bank[seed%bank.length];face.push({x:x/1100,y:y/360,char,bank,seed,alpha:alpha*(.72+(1-y/360)*.22)});if((x+y)%3===0)depth.push({x:x/1100+.005,y:y/360+.018,char:':',seed,depth:true,alpha:.18})}
 return [...depth,...face];
}
function contactLayout(){
 if(contactLayoutCache)return contactLayoutCache;
 const vh=Math.min(h,innerHeight),top={x:w*.07,y:vh*.10,w:w*.86,h:vh*.26},bottom={x:w*.07,y:vh*.35,w:w*.86,h:vh*.30};
 const place=(points,r)=>points.map(p=>({...p,x:(r.x+p.x*r.w)/w,y:(r.y+p.y*r.h)/h}));
 contactLayoutCache={prefixes:contactMasks.prefixes.map(mask=>place(mask,top)),words:contactMasks.words.map(mask=>place(mask,bottom)),rect:{x:0,y:0,w,h,glyphSize:Math.max(5,w/1100*10.8),material:true}};return contactLayoutCache;
}
function drawContact(){
 if(story<CONTACT_START||!contactMasks)return;
 const layout=contactLayout(),entry=ease((story-CONTACT_START)/1.15);
 if(entry<.999){const previous=diagram(3,clamp((CONTACT_START-PROJECT_START)/PROJECT_LENGTH-3),time),target=[...layout.prefixes[0],...layout.words[0]];renderPoints(ctx,previous,target,entry,layout.rect,diagramRect());return}
 const index=Math.floor(contactWordClock/CONTACT_PERIOD)%3,part=contactWordClock%CONTACT_PERIOD,morph=ease((part-CONTACT_HOLD)/(CONTACT_PERIOD-CONTACT_HOLD)),next=(index+1)%3;
 renderPoints(ctx,layout.prefixes[index],layout.prefixes[next],morph,layout.rect);
 renderPoints(ctx,layout.words[index],layout.words[next],morph,layout.rect);
}
Promise.all(contactFaces.map(family=>document.fonts.load(`400 300px "${family}"`))).then(()=>{contactMasks={prefixes:contactFaces.map(family=>textMask('Let’s',family)),words:['build.','make.','talk.'].map((word,i)=>textMask(word,contactFaces[i]))};contactLayoutCache=null;draw()});
function draw(){ctx.clearRect(0,0,w,h);if(reduced.matches)return;drawAmbient();if(story<.85)drawWaves();else if(story<1.95)drawWavePortraitMorph();if(story<4.8)drawPortrait();drawProjects();drawContact()}
let ambient=null,ambientTheme=-2,ambientWidth=0;
function drawAmbient(){
 const strength=ease((story-1.1)/1.5);if(strength<.001)return;
 const theme=story<4.2?-1:Math.min(3,Math.max(0,Math.floor((story-PROJECT_START)/PROJECT_LENGTH)));
 if(!ambient||ambientWidth!==w||ambientTheme!==theme){
  ambientWidth=w;ambientTheme=theme;ambient=document.createElement('canvas');ambient.width=Math.min(1100,w);ambient.height=Math.round(ambient.width*h/w);
  const c=ambient.getContext('2d'),aw=ambient.width,ah=ambient.height,colors=root.dataset.mode==='light'?[[34,62,103],[39,68,112],[29,55,96],[38,67,108]]:[[145,158,145],[145,157,181],[180,157,139],[143,171,161]],index=Math.min(3,Math.max(0,Math.floor((story-PROJECT_START)/PROJECT_LENGTH))),color=story<4.2?(root.dataset.mode==='light'?[32,59,99]:[151,157,151]):colors[index];
  c.font='9px monospace';c.textBaseline='middle';
  for(let y=0;y<ah;y+=13)for(let x=0;x<aw;x+=11){
   const u=x/aw,v=y/ah,phase=u*8-v*6+Math.sin(v*4)*1.3;
   const ridge=Math.exp(-Math.pow(Math.sin(phase)*3.2,2)),fine=.5+.5*Math.cos(u*27+v*13);
   const quiet=u>.55&&v>.20&&v<.77?.3:1,alpha=(.025+ridge*.095)*quiet;
   c.fillStyle=`rgba(${color.join(',')},${alpha})`;c.fillText(['.',':','/','~','+'][Math.min(4,Math.floor(fine*5))],x,y);
  }
 }
 const driftX=Math.sin(time*.035)*w*.009,driftY=Math.cos(time*.03)*h*.008;
 ctx.globalAlpha=strength;ctx.drawImage(ambient,-w*.025+driftX,-h*.025+driftY,w*1.05,h*1.05);ctx.globalAlpha=1;
}
function setPanel(panel,alpha,offset=0){panel.style.opacity=alpha;panel.style.transform=`translateY(${offset}px)`;panel.inert=alpha<.5;panel.style.pointerEvents=alpha>.5?'auto':'none'}
function update(){story=clamp(-journey.getBoundingClientRect().top/Math.max(1,journey.offsetHeight-stage.offsetHeight))*END;if(!reduced.matches){if(story<.7)waveMorphOrigin=null;const exit=ease((story-.2)/.85),reveal=ease((story-1.5)/.65),leave=ease((story-3.95)/.65);setPanel(opening,1-exit,-exit*45);setPanel(about,reveal*(1-leave),leave*-35);panels.forEach((panel,i)=>{const start=PROJECT_START+i*PROJECT_LENGTH,entry=ease((story-start)/.30),exit=ease((story-start-PROJECT_LENGTH+.25)/.25);setPanel(panel,entry*(1-exit),(1-entry)*30-exit*25)});setPanel(contact,ease((story-CONTACT_START-.55)/.65));if(story<CONTACT_START)contactWordClock=0}
 if(root.dataset.mode!=='light'){let bg=[16,17,15];if(story>4){const p=(story-PROJECT_START)/PROJECT_LENGTH,index=Math.min(3,Math.max(0,Math.floor(p))),amount=ease(clamp(p-index)/.22);const previous=index===0?[16,17,15]:projects[index-1].background;bg=previous.map((v,k)=>Math.round(mix(v,projects[index].background[k],amount)))}document.body.style.backgroundColor=`rgb(${bg.join(',')})`}else document.body.style.backgroundColor='';needsDraw=true}
function resize(){waveMorphOrigin=null;contactLayoutCache=null;ambient=null;w=innerWidth;h=stage.clientHeight;const d=Math.min(devicePixelRatio||1,2);canvas.width=w*d;canvas.height=h*d;ctx.setTransform(d,0,0,d,0,0);update();if(reduced.matches)panels.forEach((panel,i)=>{const c=panel.querySelector('canvas');c.width=700;c.height=400;const p=diagram(i,.6,3);renderPoints(c.getContext('2d'),p,p,1,{x:20,y:20,w:650,h:350})})}
function tick(now){
 raf=0;if(document.hidden)return;
 frameDelta=Math.max(0,Math.min((now-last)/1000,.05));last=now;
 // Scroll and ASCII share one display-synchronized frame; never paint the scene twice per refresh.
 smoothScroll?.raf(now);
 if(scrollDirty){scrollDirty=false;update()}
 if(visible&&!paused&&!reduced.matches){
  time+=frameDelta;
  if(ripples.length)ripples=ripples.filter(rip=>(rip.age+=frameDelta)<1.3);
  if(story>CONTACT_START+1.15&&(!contactInteraction||contactWordClock%CONTACT_PERIOD>CONTACT_HOLD))contactWordClock+=frameDelta;
  needsDraw=true;
  if(story>1.45&&story<4.2)buildHobbyArt(cubeArt,time);
 }
 if(needsDraw&&visible){draw();needsDraw=false}
 raf=requestAnimationFrame(tick);
}
function sync(){document.body.dataset.motionPaused=String(paused);cancelAnimationFrame(raf);last=performance.now();raf=requestAnimationFrame(tick)}
contact.addEventListener('mouseenter',()=>{contactInteraction=true});contact.addEventListener('mouseleave',()=>{contactInteraction=contact.contains(document.activeElement)});contact.addEventListener('focusin',()=>{contactInteraction=true});contact.addEventListener('focusout',event=>{contactInteraction=contact.contains(event.relatedTarget)||contact.matches(':hover')});
document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',()=>{paused=reduced.matches;if(reduced.matches)[opening,about,...panels,contact].forEach(panel=>{panel.inert=false});resize();sync()});new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync()}).observe(journey);
window.addEventListener('scroll',()=>{scrollDirty=true},{passive:true});window.addEventListener('resize',resize);
window.addEventListener('pointermove',event=>{if(reduced.matches)return;hover.x=event.clientX/Math.max(1,w);hover.y=event.clientY/Math.max(1,h);hover.inside=true;needsDraw=true},{passive:true});
window.addEventListener('pointerdown',event=>{if(paused||reduced.matches||story>=4.1)return;if(event.pointerType==='mouse'&&event.button!==0)return;ripples.push({x:event.clientX/Math.max(1,w),y:event.clientY/Math.max(1,h),age:0});needsDraw=true},{passive:true});
document.documentElement.addEventListener('pointerleave',()=>{hover.inside=false;needsDraw=true});
window.addEventListener('pointercancel',()=>{hover.inside=false;needsDraw=true},{passive:true});
function setupSmoothScroll(){
 smoothScroll?.destroy();smoothScroll=null;
 if(reduced.matches||typeof window.Lenis!=='function')return;
 smoothScroll=new window.Lenis({autoRaf:false,lerp:1-Math.pow(1-.075,TRANSITION_SPEED),smoothWheel:true,syncTouch:false,wheelMultiplier:.92,anchors:false,virtualScroll:event=>{event.deltaY*=story<3.9?.70:.95}});
 smoothScroll.on('scroll',()=>{scrollDirty=true});
}
function scrollStory(target,duration){
 if(smoothScroll){smoothScroll.scrollTo(target,{duration:duration/TRANSITION_SPEED,lerp:0,easing:p=>p*p*p*(p*(p*6-15)+10)});return}
 window.scrollTo({top:target,behavior:reduced.matches?'instant':'smooth'});
}
reduced.addEventListener('change',setupSmoothScroll);
window.addEventListener('pagehide',()=>smoothScroll?.destroy());
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',event=>{
 const hash=a.getAttribute('href'),target=hash==='#about'?about:hash==='#work'?panels[0]:hash==='#contact'?contact:hash==='#top'?document.getElementById('top'):null;
 if(!target)return;event.preventDefault();
 const beat=hash==='#about'?2.85:hash==='#contact'?14.1:hash==='#top'?0:5.35;
 const position=reduced.matches?target.getBoundingClientRect().top+scrollY:journey.offsetTop+(journey.offsetHeight-stage.offsetHeight)*beat/END;
 const duration=a.classList.contains('scroll-link')?5.2:hash==='#top'?2.4:3.4;
 scrollStory(position,duration);
}));
const hobbyScratch=new WeakMap();let cubeCharacterAtlas=null;
function buildHobbyArt(target,clock=0){
 let scratch=hobbyScratch.get(target);if(!scratch){const source=document.createElement('canvas'),sample=document.createElement('canvas');source.width=400;source.height=300;sample.width=70;sample.height=51;scratch={source,sample};hobbyScratch.set(target,scratch)}
 const {source,sample}=scratch,c=source.getContext('2d');c.clearRect(0,0,400,300);
 function polygon(vertices,fill,stroke='#bbbcb2'){c.beginPath();vertices.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();c.strokeStyle=stroke;c.lineWidth=3;c.stroke()}
 if(target.dataset.hobby==='gundam'){
  // White helmet, long V-fin, forehead camera, recessed eyes, cheek grilles and red chin.
  polygon([[110,109],[126,64],[161,43],[235,43],[274,68],[290,111],[276,220],[235,258],[161,254],[115,218]],'#c0c4bd');
  polygon([[126,64],[161,43],[194,45],[191,117],[118,131],[110,109]],'#edece1');
  polygon([[194,45],[235,43],[274,68],[290,111],[254,131],[191,117]],'#c1c8c0');
  polygon([[108,132],[132,121],[137,216],[111,232],[94,205],[94,151]],'#a3aca4');
  polygon([[253,123],[282,132],[300,158],[294,207],[267,231],[247,215]],'#858f88');
  polygon([[176,32],[211,32],[219,111],[174,111]],'#ebeade');
  polygon([[183,40],[205,40],[208,65],[182,65]],'#a65d51');
  polygon([[38,19],[177,107],[194,131],[162,118]],'#eee8d0');
  polygon([[356,19],[217,107],[194,131],[233,118]],'#e1dcc3');
  polygon([[135,137],[179,118],[211,118],[253,137],[239,165],[194,152],[149,165]],'#272f2a');
  polygon([[146,137],[180,129],[177,145],[148,151]],'#dfd487');
  polygon([[208,129],[241,138],[237,151],[211,145]],'#dcd38a');
  polygon([[148,163],[178,153],[193,187],[181,224],[148,209]],'#e6e9dd');
  polygon([[211,153],[239,164],[239,209],[207,225],[193,187]],'#bac6b9');
  polygon([[182,152],[206,152],[213,180],[194,195],[176,180]],'#f0eee0');
  polygon([[180,224],[207,225],[205,251],[185,251]],'#ab6051');
  c.strokeStyle='#3c4940';c.lineWidth=6;
  for(let i=0;i<3;i++){c.beginPath();c.moveTo(150,177+i*10);c.lineTo(168,171+i*10);c.stroke();c.beginPath();c.moveTo(220,172+i*10);c.lineTo(237,178+i*10);c.stroke()}
  c.strokeStyle='#657266';c.lineWidth=4;c.beginPath();c.moveTo(102,160);c.lineTo(121,154);c.lineTo(122,203);c.moveTo(270,155);c.lineTo(288,163);c.lineTo(282,205);c.stroke();
 }else if(target.dataset.hobby==='cube'){
  const moves=[{axis:1,angle:1},{axis:0,angle:1},{axis:2,angle:1},{axis:2,angle:-1},{axis:0,angle:-1},{axis:1,angle:-1}],duration=1.8,cycle=(clock%(duration*moves.length))/duration,current=Math.floor(cycle),fraction=ease(clamp((cycle-current)/.75));
  const yaw=-.55+Math.sin(cycle/moves.length*Math.PI*2)*.14,tilt=.52;
  function rotate(p,axis,angle){const q=[...p],a=(axis+1)%3,b=(axis+2)%3;q[a]=p[a]*Math.cos(angle)-p[b]*Math.sin(angle);q[b]=p[a]*Math.sin(angle)+p[b]*Math.cos(angle);return q}
  function camera([x,y,z]){const rx=x*Math.cos(yaw)+z*Math.sin(yaw),rz=-x*Math.sin(yaw)+z*Math.cos(yaw);return [rx,y*Math.cos(tilt)-rz*Math.sin(tilt),y*Math.sin(tilt)+rz*Math.cos(tilt)]}
  const faces=[{n:[0,0,1],u:[1,0,0],v:[0,1,0],shade:174},{n:[1,0,0],u:[0,0,1],v:[0,1,0],shade:128},{n:[0,1,0],u:[1,0,0],v:[0,0,1],shade:217},{n:[0,0,-1],u:[1,0,0],v:[0,1,0],shade:148},{n:[-1,0,0],u:[0,0,1],v:[0,1,0],shade:163},{n:[0,-1,0],u:[1,0,0],v:[0,0,1],shade:102}],tiles=[];
  for(const face of faces)for(let row=0;row<3;row++)for(let col=0;col<3;col++){
   let center=face.n.map((n,k)=>n*1.5+face.u[k]*(col-1)+face.v[k]*(row-1)),normal=[...face.n],corners=[[-.44,-.44],[.44,-.44],[.44,.44],[-.44,.44]].map(([u,v])=>center.map((n,k)=>n+face.u[k]*u+face.v[k]*v));
   for(let step=0;step<=current;step++){const move=moves[step];if(center[move.axis]>.5){const angle=move.angle*Math.PI/2*(step<current?1:fraction);center=rotate(center,move.axis,angle);normal=rotate(normal,move.axis,angle);corners=corners.map(p=>rotate(p,move.axis,angle))}}
   if(camera(normal)[2]<.01)continue;corners=corners.map(camera);
   const shade=Math.round(face.shade*(.78+((row+col*2)%3)*.10));tiles.push({corners,depth:corners.reduce((sum,p)=>sum+p[2],0)/4,shade});
  }
  tiles.sort((a,b)=>a.depth-b.depth).forEach(({corners,shade})=>polygon(corners.map(([x,y])=>[200+x*55,157-y*55]),`rgb(${shade},${shade+3},${shade-7})`,'#343b35'));
 }else{
  c.save();c.translate(182,125);c.rotate(-.25);const glass=c.createRadialGradient(-25,-28,8,0,0,85);glass.addColorStop(0,'#c6cec6');glass.addColorStop(.6,'#778982');glass.addColorStop(1,'#3b4644');c.fillStyle=glass;c.beginPath();c.ellipse(0,0,85,80,0,0,Math.PI*2);c.fill();c.strokeStyle='#d5d7cd';c.lineWidth=12;c.stroke();c.strokeStyle='#8e9b93';c.lineWidth=30;c.beginPath();c.moveTo(62,60);c.lineTo(139,136);c.stroke();c.strokeStyle='#bec9bd';c.lineWidth=4;for(let i=0;i<7;i++){c.beginPath();c.ellipse(0,0,13+i*7,17+i*6,.2,.5,4.7);c.stroke()}c.restore();
 }
 const cols=70,rows=51,sc=sample.getContext('2d',{willReadFrequently:true});sc.clearRect(0,0,cols,rows);sc.drawImage(source,0,0,cols,rows);const pixels=sc.getImageData(0,0,cols,rows).data;
 if(target.width!==280||target.height!==204){target.width=280;target.height=204}const out=target.getContext('2d');out.clearRect(0,0,280,204);out.font='6px monospace';out.textBaseline='middle';const chars=' .,:/|=+*#%@';
 if(target.dataset.hobby==='cube'&&!cubeCharacterAtlas){cubeCharacterAtlas=document.createElement('canvas');cubeCharacterAtlas.width=chars.length*4;cubeCharacterAtlas.height=16*6;const ac=cubeCharacterAtlas.getContext('2d');ac.font='6px monospace';ac.textBaseline='middle';for(let shade=0;shade<16;shade++){const inverse=1-shade/15,red=root.dataset.mode==='light'?Math.round(10+inverse*14):Math.round(shade/15*255),green=root.dataset.mode==='light'?Math.round(23+inverse*29):Math.min(255,red+3),blue=root.dataset.mode==='light'?Math.round(47+inverse*42):Math.max(0,red-7);ac.fillStyle=`rgb(${red},${green},${blue})`;for(let char=0;char<chars.length;char++)ac.fillText(chars[char],char*4,shade*6+3)}}
 for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const k=(y*cols+x)*4;if(pixels[k+3]<80)continue;const value=(pixels[k]+pixels[k+1]+pixels[k+2])/765;const char=Math.min(chars.length-1,Math.floor(value*(chars.length-1)));if(target.dataset.hobby==='cube'){const shade=Math.min(15,Math.round(value*15));out.drawImage(cubeCharacterAtlas,char*4,shade*6,4,6,x*4,y*4,4,6)}else{const inverse=1-value,red=root.dataset.mode==='light'?Math.round(10+inverse*14):pixels[k],green=root.dataset.mode==='light'?Math.round(23+inverse*29):pixels[k+1],blue=root.dataset.mode==='light'?Math.round(47+inverse*42):pixels[k+2];out.fillStyle=`rgba(${red},${green},${blue},.95)`;out.fillText(chars[char],x*4,y*4+2)}}
}
document.querySelectorAll('.hobby-art').forEach(target=>buildHobbyArt(target,0));
const cubeArt=document.querySelector('[data-hobby="cube"]');
resize();setupSmoothScroll();sync();
