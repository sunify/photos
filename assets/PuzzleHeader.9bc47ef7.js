import{S as q,i as F,s as R,e as y,a as V,c as E,b as I,d as k,f as z,g as p,h as P,j as M,k as b,n as A,l as w,o as W,m as N,r as B,t as G,p as J}from"./index.69988667.js";import{e as D}from"./each.3d878967.js";/* empty css                       */function K(){try{const r=window;return!1}catch{return!0}}function T(r,e,t){const n=r.slice();return n[12]=e[t],n}function C(r,e,t){const n=r.slice();return n[15]=e[t],n[17]=t,n}function H(r){let e,t,n,m,a;return{c(){e=y("div"),this.h()},l(i){e=E(i,"DIV",{class:!0,"data-num":!0,"data-pos":!0,role:!0,tabindex:!0}),I(e).forEach(k),this.h()},h(){p(e,"class",t="piece "+(r[3]===r[17]?"shake":"")+" svelte-kernkx"),p(e,"data-num",r[17]+1),p(e,"data-pos",n=r[15]),p(e,"role","button"),p(e,"tabindex","-1")},m(i,u){M(i,e,u),m||(a=[N(e,"click",r[5]),N(e,"keyup",r[5])],m=!0)},p(i,u){u&8&&t!==(t="piece "+(i[3]===i[17]?"shake":"")+" svelte-kernkx")&&p(e,"class",t),u&1&&n!==(n=i[15])&&p(e,"data-pos",n)},d(i){i&&k(e),m=!1,B(a)}}}function X(r){let e,t,n=r[12]+"",m,a;return{c(){e=y("div"),t=y("span"),m=G(n),a=V(),this.h()},l(i){e=E(i,"DIV",{class:!0,style:!0});var u=I(e);t=E(u,"SPAN",{class:!0});var o=I(t);m=J(o,n),o.forEach(k),a=z(u),u.forEach(k),this.h()},h(){p(t,"class","svelte-kernkx"),p(e,"class","letter svelte-kernkx"),p(e,"style",r[12]==="ё"?"font-style: italic":"")},m(i,u){M(i,e,u),b(e,t),b(t,m),b(e,a)},p:A,d(i){i&&k(e)}}}function Y(r){let e;return{c(){e=y("div"),this.h()},l(t){e=E(t,"DIV",{class:!0}),I(e).forEach(k),this.h()},h(){p(e,"class","shutter svelte-kernkx")},m(t,n){M(t,e,n)},d(t){t&&k(e)}}}function L(r){let e,t,n,m,a,i,u=D(r[0]),o=[];for(let s=0;s<u.length;s+=1)o[s]=H(C(r,u,s));let g=D(r[4]),h=[];for(let s=0;s<g.length;s+=1)h[s]=X(T(r,g,s));let c=r[1]&&Y();return{c(){e=y("header"),t=y("div"),n=y("div");for(let s=0;s<o.length;s+=1)o[s].c();m=V(),a=y("div");for(let s=0;s<h.length;s+=1)h[s].c();i=V(),c&&c.c(),this.h()},l(s){e=E(s,"HEADER",{class:!0});var _=I(e);t=E(_,"DIV",{class:!0,style:!0});var l=I(t);n=E(l,"DIV",{class:!0});var f=I(n);for(let d=0;d<o.length;d+=1)o[d].l(f);f.forEach(k),m=z(l),a=E(l,"DIV",{class:!0});var v=I(a);for(let d=0;d<h.length;d+=1)h[d].l(v);v.forEach(k),l.forEach(k),i=z(_),c&&c.l(_),_.forEach(k),this.h()},h(){p(n,"class","pieces"),p(a,"class","letters"),p(t,"class","cover-box svelte-kernkx"),P(t,"--gap-size",r[2]),p(e,"class","cover svelte-kernkx")},m(s,_){M(s,e,_),b(e,t),b(t,n);for(let l=0;l<o.length;l+=1)o[l]&&o[l].m(n,null);b(t,m),b(t,a);for(let l=0;l<h.length;l+=1)h[l]&&h[l].m(a,null);b(e,i),c&&c.m(e,null)},p(s,[_]){if(_&41){u=D(s[0]);let l;for(l=0;l<u.length;l+=1){const f=C(s,u,l);o[l]?o[l].p(f,_):(o[l]=H(f),o[l].c(),o[l].m(n,null))}for(;l<o.length;l+=1)o[l].d(1);o.length=u.length}if(_&16){g=D(s[4]);let l;for(l=0;l<g.length;l+=1){const f=T(s,g,l);h[l]?h[l].p(f,_):(h[l]=X(f),h[l].c(),h[l].m(a,null))}for(;l<h.length;l+=1)h[l].d(1);h.length=g.length}_&4&&P(t,"--gap-size",s[2]),s[1]?c||(c=Y(),c.c(),c.m(e,null)):c&&(c.d(1),c=null)},i:A,o:A,d(s){s&&k(e),w(o,s),w(h,s),c&&c.d()}}}function O(r,e,t){let n;const m="alexlunёv".split("");let a=Array.from({length:9},(f,v)=>v+1),i=!1,u="inherit",o=null;const g=f=>{const v=f%3,d=Math.floor(f/3);return[v,d]};function h(f,v){const[d,x]=g(f),[S,j]=g(v);return Math.abs(d-S)+Math.abs(x-j)===1}let c=null,s=null,_=null;function l(f){if(n)return;const v=f.target,d=Number(v.dataset.num)-1,x=Number(v.dataset.pos)-1;if(c!==d)if(c===null||s===null)c=d,s=x;else if(h(s,x)){const S=a[d];t(0,a[d]=a[c],a),t(0,a[c]=S,a),c=null,s=null}else t(3,_=d),setTimeout(()=>{t(3,_=null)},500)}return W(()=>{t(7,o=new Audio("shutter-sound.mp3")),setTimeout(()=>{t(0,a=a.sort(()=>.5-Math.random())),t(6,i=!0)},300)}),r.$$.update=()=>{r.$$.dirty&65&&t(1,n=!a.some((f,v,d)=>f>d[v+1])&&i&&!K()),r.$$.dirty&130&&n&&setTimeout(()=>{t(2,u="0px");try{o?.play()}catch{}},300)},[a,n,u,_,m,l,i,o]}class ee extends q{constructor(e){super(),F(this,e,O,L,R,{})}}export{ee as default};