// Rendering only: input points passed to Hanzi Writer are never modified.
(function(root){
 'use strict';
 function outline(points){
  if(points.length<2)return '';
  const left=[],right=[],distance=[0];
  for(let i=1;i<points.length;i++)distance[i]=distance[i-1]+Math.hypot(points[i].x-points[i-1].x,points[i].y-points[i-1].y);
  const total=distance.at(-1);
  for(let i=0;i<points.length;i++){
   const p=points[i],a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)];
   const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1;
   // The moving tip tapers over the last 22 CSS pixels; no pressure sensor used.
   const tip=Math.max(.03,Math.min(1,(total-distance[i])/22));
   const start=.55+.45*Math.min(1,distance[i]/12);
   const radius=p.width*.5*tip*start;
   left.push([p.x-dy/len*radius,p.y+dx/len*radius]);
   right.push([p.x+dy/len*radius,p.y-dx/len*radius]);
  }
  const ring=left.concat(right.reverse());
  const mid=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2];
  const first=mid(ring.at(-1),ring[0]);
  let d=`M ${first.join(' ')}`;
  for(let i=0;i<ring.length;i++)d+=` Q ${ring[i].join(' ')} ${mid(ring[i],ring[(i+1)%ring.length]).join(' ')}`;
  return d+' Z';
 }
 function add(points,x,y,time){
  const last=points.at(-1);
  if(last&&Math.hypot(x-last.x,y-last.y)<.7)return;
  const speed=last?Math.hypot(x-last.x,y-last.y)/Math.max(8,time-last.time):0;
  const target=20-12*Math.min(1,speed/1.2);
  const width=last?last.width*.75+target*.25:14;
  points.push({x,y,time,width});
  // Bound cost of exceptionally long gestures, retaining recent detail.
  if(points.length>512)points.splice(0,points.length,...points.filter((_,i)=>i%2===0||i===points.length-1));
 }
 const api={outline,add};
 if(typeof module!=='undefined')module.exports=api;else root.Brush=api;
})(typeof window==='undefined'?globalThis:window);
