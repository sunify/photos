import{S as D,i as G,s as q,e as _,c as v,b as w,d as g,q as y,g as f,h as z,j as V,k,n as E,u as d,v as B,w as p,l as R,o as N,x as O,a as P,f as F,y as A,z as H,A as J,B as K,C as Q}from"./index.a18ea272.js";import{e as S}from"./each.3d878967.js";/* empty css                       */function b(o,a=2.1){const n=[];let i=[],r=0;function l(h){const t=e=>e.isVertical?.565:1,s=Math.max(h.map(t).reduce((e,c)=>e+c,0),a);h.forEach(e=>{e.gridSize=t(e)/s*100})}for(const h of o){const t=h.data.size.width<h.data.size.height,s=t?.565:1,e={item:h,isVertical:t,gridSize:0};i.push(e),r+=s,r>=a&&(n.push(i),l(i),i=[],r=0)}return i.length&&(n.push(i),l(i)),n}function T(o){let a,n,i,r,l,h,t,s,e;return{c(){a=_("a"),n=_("div"),i=_("img"),this.h()},l(c){a=v(c,"A",{href:!0,tabindex:!0,class:!0,style:!0});var u=w(a);n=v(u,"DIV",{class:!0});var m=w(n);i=v(m,"IMG",{src:!0,style:!0,loading:!0,alt:!0,class:!0}),m.forEach(g),u.forEach(g),this.h()},h(){y(i.src,r="images/thumbs/"+o[0].id+".jpg")||f(i,"src",r),z(i,"background-color",o[0].data.color),f(i,"loading",l=o[3]?"lazy":"eager"),f(i,"alt",h=o[0].data.title),f(i,"class","svelte-hmi9gp"),f(n,"class",t="image-container "+(o[2]?"-v":"-h")+" svelte-hmi9gp"),f(a,"href",s=`${o[0].id}/`),f(a,"tabindex","0"),f(a,"class",e="item "+(o[2]?"-v":"-h")+" svelte-hmi9gp"),z(a,"width",o[1]+"%")},m(c,u){V(c,a,u),k(a,n),k(n,i)},p(c,[u]){u&1&&!y(i.src,r="images/thumbs/"+c[0].id+".jpg")&&f(i,"src",r),u&1&&z(i,"background-color",c[0].data.color),u&8&&l!==(l=c[3]?"lazy":"eager")&&f(i,"loading",l),u&1&&h!==(h=c[0].data.title)&&f(i,"alt",h),u&4&&t!==(t="image-container "+(c[2]?"-v":"-h")+" svelte-hmi9gp")&&f(n,"class",t),u&1&&s!==(s=`${c[0].id}/`)&&f(a,"href",s),u&4&&e!==(e="item "+(c[2]?"-v":"-h")+" svelte-hmi9gp")&&f(a,"class",e),u&2&&z(a,"width",c[1]+"%")},i:E,o:E,d(c){c&&g(a)}}}function U(o,a,n){let{photo:i}=a,{gridSize:r}=a,{isVertical:l}=a,{lazy:h=!1}=a;return o.$$set=t=>{"photo"in t&&n(0,i=t.photo),"gridSize"in t&&n(1,r=t.gridSize),"isVertical"in t&&n(2,l=t.isVertical),"lazy"in t&&n(3,h=t.lazy)},[i,r,l,h]}class W extends D{constructor(a){super(),G(this,a,U,T,q,{photo:0,gridSize:1,isVertical:2,lazy:3})}}function M(o,a,n){const i=o.slice();return i[6]=a[n],i[8]=n,i}function I(o,a,n){const i=o.slice();return i[9]=a[n],i}function j(o){let a,n;return a=new W({props:{photo:o[9].item,gridSize:o[9].gridSize,isVertical:o[9].isVertical,lazy:o[8]>2}}),{c(){H(a.$$.fragment)},l(i){J(a.$$.fragment,i)},m(i,r){K(a,i,r),n=!0},p(i,r){const l={};r&1&&(l.photo=i[9].item),r&1&&(l.gridSize=i[9].gridSize),r&1&&(l.isVertical=i[9].isVertical),a.$set(l)},i(i){n||(d(a.$$.fragment,i),n=!0)},o(i){p(a.$$.fragment,i),n=!1},d(i){Q(a,i)}}}function C(o){let a,n,i,r=S(o[6]),l=[];for(let t=0;t<r.length;t+=1)l[t]=j(I(o,r,t));const h=t=>p(l[t],1,1,()=>{l[t]=null});return{c(){a=_("div");for(let t=0;t<l.length;t+=1)l[t].c();n=P(),this.h()},l(t){a=v(t,"DIV",{class:!0});var s=w(a);for(let e=0;e<l.length;e+=1)l[e].l(s);n=F(s),s.forEach(g),this.h()},h(){f(a,"class","row svelte-9lf595")},m(t,s){V(t,a,s);for(let e=0;e<l.length;e+=1)l[e]&&l[e].m(a,null);k(a,n),i=!0},p(t,s){if(s&1){r=S(t[6]);let e;for(e=0;e<r.length;e+=1){const c=I(t,r,e);l[e]?(l[e].p(c,s),d(l[e],1)):(l[e]=j(c),l[e].c(),d(l[e],1),l[e].m(a,n))}for(A(),e=r.length;e<l.length;e+=1)h(e);B()}},i(t){if(!i){for(let s=0;s<r.length;s+=1)d(l[s]);i=!0}},o(t){l=l.filter(Boolean);for(let s=0;s<l.length;s+=1)p(l[s]);i=!1},d(t){t&&g(a),R(l,t)}}}function X(o){let a,n,i,r=S(o[0]),l=[];for(let t=0;t<r.length;t+=1)l[t]=C(M(o,r,t));const h=t=>p(l[t],1,1,()=>{l[t]=null});return{c(){a=_("div");for(let t=0;t<l.length;t+=1)l[t].c();this.h()},l(t){a=v(t,"DIV",{class:!0});var s=w(a);for(let e=0;e<l.length;e+=1)l[e].l(s);s.forEach(g),this.h()},h(){f(a,"class",n="grid "+(o[1]?"loaded":"")+" svelte-9lf595")},m(t,s){V(t,a,s);for(let e=0;e<l.length;e+=1)l[e]&&l[e].m(a,null);i=!0},p(t,[s]){if(s&1){r=S(t[0]);let e;for(e=0;e<r.length;e+=1){const c=M(t,r,e);l[e]?(l[e].p(c,s),d(l[e],1)):(l[e]=C(c),l[e].c(),d(l[e],1),l[e].m(a,null))}for(A(),e=r.length;e<l.length;e+=1)h(e);B()}(!i||s&2&&n!==(n="grid "+(t[1]?"loaded":"")+" svelte-9lf595"))&&f(a,"class",n)},i(t){if(!i){for(let s=0;s<r.length;s+=1)d(l[s]);i=!0}},o(t){l=l.filter(Boolean);for(let s=0;s<l.length;s+=1)p(l[s]);i=!1},d(t){t&&g(a),R(l,t)}}}function Y(o,a,n){let i,r,{photos:l}=a;const h={0:1,900:2.1,1600:3.1,2e3:4.1,2300:5.1},t=new Map;function s(e){const c=e.target;c.matches&&n(0,i=b(l,t.get(c)))}return N(()=>{n(1,r=!0),Object.entries(h).map(([e,c])=>[Number(e),c]).forEach(([e,c],u,m)=>{if(m[u+1]){const[L]=m[u+1];t.set(window.matchMedia(`(min-width: ${e}px) and (max-width: ${L-1}px)`),c)}else t.set(window.matchMedia(`(min-width: ${e}px)`),c)});for(const e of t.keys())e.addEventListener("change",s),e.matches&&n(0,i=b(l,t.get(e)))}),O(()=>{for(const e of t.keys())e.removeEventListener("change",s)}),o.$$set=e=>{"photos"in e&&n(2,l=e.photos)},o.$$.update=()=>{o.$$.dirty&4&&n(0,i=b(l,2.1))},n(1,r=!1),[i,r,l]}class ee extends D{constructor(a){super(),G(this,a,Y,X,q,{photos:2})}}export{ee as default};