
(function () {
  function start(hero, canvas){
    const GRID=+(canvas.dataset.grid||28),RADIUS=+(canvas.dataset.radius||320),STRENGTH=+(canvas.dataset.strength||4),SEG=6,HILITE=(canvas.dataset.hi?canvas.dataset.hi.split(',').map(Number):[0,0,0]),HILITE2=(canvas.dataset.hi2?canvas.dataset.hi2.split(',').map(Number):null),HI_MAX=+(canvas.dataset.himax||0.06),GRAY_A=+(canvas.dataset.gray||0.01),PULL=false;
    const ctx=canvas.getContext('2d');
    let W=0,H=0,dpr=1,mx=-9999,my=-9999,act=0,target=0,loop=null,waveR=0;
    function resize(){dpr=window.devicePixelRatio||1;W=hero.clientWidth;H=hero.clientHeight;canvas.width=W*dpr;canvas.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);draw();}
    function smoothstep(t){t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);}
    function edgeFall(){const M=Math.max(48,RADIUS*0.5);const fx=Math.min(mx,W-mx)/M,fy=Math.min(my,H-my)/M;return smoothstep(Math.max(0,Math.min(fx,fy)));}
    function warp(x,y){if(act<0.002)return[x,y,0];const dx=x-mx,dy=y-my,d=Math.hypot(dx,dy);if(d>RADIUS||d===0)return[x,y,0];const e=smoothstep(1-d/RADIUS)*act;const move=STRENGTH*Math.sin(Math.PI*(d/RADIUS))*act;const dir=PULL?-1:1;return[x+(dx/d)*move*dir,y+(dy/d)*move*dir,e];}
    function strokeColor(e){const a=GRAY_A+(HI_MAX-GRAY_A)*e;if(HILITE2){var t=e;var r=Math.round(HILITE[0]+(HILITE2[0]-HILITE[0])*t),g=Math.round(HILITE[1]+(HILITE2[1]-HILITE[1])*t),b=Math.round(HILITE[2]+(HILITE2[2]-HILITE[2])*t);return'rgba('+r+','+g+','+b+','+a+')';}return'rgba('+HILITE[0]+','+HILITE[1]+','+HILITE[2]+','+a+')';}
    function drawLine(fixed,len,vert){var graystroke='rgba(0,0,0,'+GRAY_A+')';var calong=vert?my:mx,cperp=vert?mx:my;if(act<0.002||Math.abs(fixed-cperp)>RADIUS){ctx.beginPath();ctx.lineWidth=1;ctx.strokeStyle=graystroke;if(vert){ctx.moveTo(fixed+.5,0);ctx.lineTo(fixed+.5,len);}else{ctx.moveTo(0,fixed+.5);ctx.lineTo(len,fixed+.5);}ctx.stroke();return;}var atop=Math.max(0,calong-RADIUS),abot=Math.min(len,calong+RADIUS);if(atop>0){ctx.beginPath();ctx.lineWidth=1;ctx.strokeStyle=graystroke;if(vert){ctx.moveTo(fixed+.5,0);ctx.lineTo(fixed+.5,atop);}else{ctx.moveTo(0,fixed+.5);ctx.lineTo(atop,fixed+.5);}ctx.stroke();}if(abot<len){ctx.beginPath();ctx.lineWidth=1;ctx.strokeStyle=graystroke;if(vert){ctx.moveTo(fixed+.5,abot);ctx.lineTo(fixed+.5,len);}else{ctx.moveTo(abot,fixed+.5);ctx.lineTo(len,fixed+.5);}ctx.stroke();}var prev=null;for(var a=atop;a<=abot+0.0001;a+=SEG){var aa=Math.min(a,abot);var p=vert?warp(fixed,aa):warp(aa,fixed);if(prev){ctx.beginPath();ctx.lineWidth=1;ctx.strokeStyle=strokeColor(Math.max(prev[2],p[2]));ctx.moveTo(prev[0],prev[1]);ctx.lineTo(p[0],p[1]);ctx.stroke();}prev=p;}}
    function draw(){ctx.clearRect(0,0,W,H);for(let x=0;x<=W;x+=GRID)drawLine(x,H,true);for(let y=0;y<=H;y+=GRID)drawLine(y,W,false);}
    function tick(){act+=(target-act)*0.09;if(act<0.002&&target===0){act=0;draw();loop=null;return;}draw();loop=requestAnimationFrame(tick);}
    function ensure(){if(!loop)loop=requestAnimationFrame(tick);}
    function onMove(e){const r=hero.getBoundingClientRect();const sx=r.width?hero.clientWidth/r.width:1;const sy=r.height?hero.clientHeight/r.height:1;mx=(e.clientX-r.left)*sx;my=(e.clientY-r.top)*sy;target=edgeFall();ensure();}
    if(canvas.dataset.pulse){
      var pc0=null, cx=parseFloat(canvas.dataset.cx||0.5), cy=parseFloat(canvas.dataset.cy||0.5);
      function pulse(ts){
        if(!pc0)pc0=ts;
        var cyc=2800, p=((ts-pc0)%cyc)/cyc;
        mx=W*cx; my=H*cy;
        var a = p<0.12 ? (p/0.12) : Math.pow(1-(p-0.12)/0.88, 2.2);
        act = Math.max(0, Math.min(1, a));
        draw();
        requestAnimationFrame(pulse);
      }
      requestAnimationFrame(pulse);
    } else {
      hero.addEventListener('mousemove',onMove);
      hero.addEventListener('mouseleave',function(){target=0;ensure();});
    }
    window.addEventListener('resize',resize);
    resize();
    setTimeout(resize,400);
  }
  function init(){
    const hero=document.getElementById('hero');
    const canvas=document.getElementById('grid-canvas');
    if(!hero||!canvas||hero.clientHeight===0){return requestAnimationFrame(init);}
    if(canvas.__gridInit)return; canvas.__gridInit=true;
    start(hero,canvas);
  }
  init();
  function initExtra(tries){
    tries=tries||0;
    var hosts=document.querySelectorAll('[data-reactive-grid]');
    var pending=false;
    hosts.forEach(function(h){
      var c=h.querySelector('canvas.rg-canvas');
      if(!c||c.__gridInit) return;
      if(h.clientHeight===0){pending=true;return;}
      c.__gridInit=true; start(h,c);
    });
    if(pending || hosts.length===0){ if(tries<600) requestAnimationFrame(function(){initExtra(tries+1);}); }
  }
  initExtra(0);
  function pfReveal(){
    var vh=window.innerHeight||800;
    var all=document.querySelectorAll('.step-card');
    for(var i=0;i<all.length;i++){var el=all[i];if(!el.dataset.pf){el.dataset.pf='1';var rr=el.getBoundingClientRect();if(rr.top>vh*0.82)el.classList.add('pf-pre');}}
    var pre=document.querySelectorAll('.step-card.pf-pre');
    for(var j=0;j<pre.length;j++){var r=pre[j].getBoundingClientRect();if(r.top<vh*0.82&&r.bottom>0)pre[j].classList.remove('pf-pre');}
    requestAnimationFrame(pfReveal);
  }
  requestAnimationFrame(pfReveal);
  })();


(function(){
  function bind(){
    var grids=document.querySelectorAll('.card-tilt-zone');
    requestAnimationFrame(bind);
    grids.forEach(function(g){
      if(g.__tilt)return; g.__tilt=1;
      var ph=g.querySelector('.bb-photo'); if(!ph)return;
      var P=+(g.dataset.persp||1200), MX=+(g.dataset.mx||10), MY=+(g.dataset.my||7), SC=(g.dataset.scale!=null?g.dataset.scale:'1.02');
      var raf=null, tx=0, ty=0;
      function apply(){ ph.style.transform='perspective('+P+'px) rotateY('+tx.toFixed(2)+'deg) rotateX('+ty.toFixed(2)+'deg) scale('+SC+')'; raf=null; }
      g.addEventListener('mousemove', function(e){
        var r=g.getBoundingClientRect();
        var nx=(e.clientX-r.left)/r.width-0.5, ny=(e.clientY-r.top)/r.height-0.5;
        tx=nx*MX*2; ty=-ny*MY*2;
        if(!raf) raf=requestAnimationFrame(apply);
      });
      g.addEventListener('mouseleave', function(){ ph.style.transform='perspective('+P+'px) rotateY(0deg) rotateX(0deg) scale(1)'; });
    });
  }
  requestAnimationFrame(bind);
})();

