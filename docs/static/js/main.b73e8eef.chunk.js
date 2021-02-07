(this["webpackJsonpts-docuflux-angelic-theme"]=this["webpackJsonpts-docuflux-angelic-theme"]||[]).push([[0],{165:function(e,t,n){},216:function(e,t,n){},265:function(e,t,n){},266:function(e,t,n){"use strict";n.r(t),n.d(t,"useBasePath",(function(){return Te}));var a={};n.r(a),n.d(a,"LayoutMode",(function(){return S})),n.d(a,"layout",(function(){return L})),n.d(a,"THEME_KEY",(function(){return B})),n.d(a,"theme",(function(){return A}));var r={};n.r(r),n.d(r,"getPackageName",(function(){return ke})),n.d(r,"excerptTokensToString",(function(){return ye})),n.d(r,"getMembers",(function(){return we})),n.d(r,"parseComment",(function(){return je})),n.d(r,"groupMembers",(function(){return Oe}));var c=n(157),i=n(66),o=n(51),u=n.n(o),l=n(76),m=n(0),s=n.n(m),d=n(15),f=n.n(d),p=(n(165),n(272)),h=n(281),g=n(287),v=n(57),b=n(29),E=n(271),k=n(269),y=n(40),w=n(128),j=n.n(w),O=n(104),x=n.n(O),M=n(129),_=n.n(M);function N(e){var t;return null===(t=window)||void 0===t?void 0:t.js_beautify(e,{indent_size:"4",indent_char:" ",max_preserve_newlines:"5",preserve_newlines:!0,keep_array_indentation:!0,break_chained_methods:!1,indent_scripts:"keep",brace_style:"collapse,preserve-inline",space_before_conditional:!0,unescape_strings:!0,jslint_happy:!0,end_with_newline:!0,wrap_line_length:"0",indent_inner_html:!0,comma_first:!1,e4x:!0,indent_empty_lines:!0})}x.a.registerLanguage("typescript",_.a);var S,C=function(e){return s.a.createElement("div",{className:"markdown-body ".concat(e.narrow?"narrow":""),dangerouslySetInnerHTML:{__html:(t=e.markdown,j.a.setOptions({highlight:function(e){var t=k.a((function(){return x.a.highlight("typescript",e).value}));return y.b(t)?e:t}})(t))}});var t},P=n(55),z=n(91),R=n(130),T=n(12),I=n(270);!function(e){e[e.MOBILE=0]="MOBILE",e[e.DESKTOP=1]="DESKTOP"}(S||(S={}));var F=function(){function e(t){var n=this;if(Object(z.a)(this,e),this.breakpoints=t,this.screenSize=void 0,0===t.length)throw new Error("Please provide at least one breakpoint");this.screenSize=t[0].mode,this.calculateSize(),window.addEventListener("resize",(function(){n.calculateSize()}))}return Object(R.a)(e,[{key:"calculateSize",value:function(){var e=this.breakpoints.filter((function(e){return e.width<=window.innerWidth}));this.screenSize=I.a(e,(function(e){return e.width}))[0].mode}},{key:"size",value:function(e){return e[this.screenSize]}}]),e}(),L=Object(T.l)(new F([{width:1240,mode:"desktop"},{width:0,mode:"mobile"},{width:900,mode:"tablet"}])),B="ts-prime-theme",A=Object(T.l)(new function e(){Object(z.a)(this,e),this.theme="dark";var t=localStorage.getItem("ts-prime-theme")||"";this.theme=E.a(t,["dark","light"])?t:"dark"});Object(T.f)((function(){localStorage.setItem(B,A.theme)}));var D=p.a.Header,G=p.a.Content,K=p.a.Sider,H={home:{key:1,exact:!0,path:"/home",title:"Home"},documentation:{key:2,path:"/documentation",title:"Documentation"},documentationPage:{key:2,path:"/documentation/:fn",title:"Documentation"}},W=Object(P.a)((function(){var e=Te();return s.a.createElement(D,{className:"header"},s.a.createElement(v.b,{to:"/home"},s.a.createElement("div",{className:"logo"},s.a.createElement("img",{alt:"logo",style:{width:100,height:"auto"},src:"".concat(e,"/logo.svg")}))),s.a.createElement("div",{className:"flex"}),s.a.createElement("div",{style:{paddingRight:20}},s.a.createElement(g.a,{onChange:function(){a.theme.theme="dark"===a.theme.theme?"light":"dark"},checked:"light"===a.theme.theme,checkedChildren:"Dark",unCheckedChildren:"Light"})),"dark"===a.theme.theme?s.a.createElement("div",null,s.a.createElement("a",{href:"https://github.com/digimuza/ts-prime"},s.a.createElement("img",{alt:"Github",style:{width:"auto",height:"30px"},src:"".concat(e,"/github.white.svg")}))):s.a.createElement("div",null,s.a.createElement("a",{href:"https://github.com/digimuza/ts-prime"},s.a.createElement("img",{alt:"Github",style:{width:"auto",height:"30px"},src:"".concat(e,"/github.svg")}))))})),Y=function(e){var t;return s.a.createElement(p.a,{id:e.id,className:"".concat(null!==(t=e.className)&&void 0!==t?t:""),style:{padding:"0 24px 24px"}},s.a.createElement(G,{className:"content",style:{padding:24,margin:0,minWidth:380,minHeight:280}},e.children))},J=function(e){var t;return s.a.createElement(p.a,{className:"".concat(null!==(t=e.className)&&void 0!==t?t:""," view"),style:{height:"calc(100vh - 64px)",overflow:"hidden",overflowY:"auto"}},e.children)},$=function(){var e=Object(b.e)();return e.location.pathname.includes("/documentation")||null!=Object.values(H).find((function(t){return e.location.pathname===t.path}))||e.replace(H.home.path),null},q=Object(P.a)((function(e){return s.a.createElement(K,{width:L.size({mobile:"80%",desktop:400,tablet:300}),collapsible:!0,breakpoint:"lg",collapsedWidth:0,defaultCollapsed:L.size({mobile:!0,desktop:!1,tablet:!1}),className:"site-layout-background"},e.sideMenu)})),U=Object(P.a)((function(e){var t=E.a(a.theme.theme,["dark","light"])?a.theme.theme:"dark";return s.a.createElement(v.a,null,s.a.createElement(p.a,{className:"ts-prime-".concat(t)},s.a.createElement(W,null),s.a.createElement(b.a,H.home,s.a.createElement(J,null,s.a.createElement(q,{sideMenu:e.sideMenu}),s.a.createElement(Y,null,s.a.createElement(h.a,null,s.a.createElement(C,{markdown:e.readme,narrow:!0}))))),s.a.createElement(b.a,H.documentation,s.a.createElement(J,null,s.a.createElement(q,{sideMenu:e.sideMenu}),s.a.createElement(Y,{id:"main-view"},e.children))),s.a.createElement($,null)))})),Q=n(284),V=n(283),X=n(288),Z=n(79),ee=n(109),te=["#fa8c16","#1890ff","#006d75","#08979c","#7cb305","#13c2c2","#0050b3","#003a8c","#9e1068"],ne=[].concat(te),ae=new Map;function re(e){var t=ae.get(e);if(null!=t)return t;var n=ne.shift();return null==n?(ne=[].concat(te),re(e)):(ae.set(e,n),n)}var ce=Object(P.a)((function(e){var t=Object(b.e)(),n=e.groupedMembers,a=Object(m.useMemo)((function(){return n.flatMap((function(e){return ee.a(e.members,(function(e){return e.name})).filter((function(e){return"Function"===e.kind})).filter((function(e){return e.name.includes(xe.search)})).map((function(e){return s.a.createElement(Q.a.Item,{key:e.canonicalReferenceGroup},s.a.createElement("div",{onClick:function(){t.replace("/documentation/".concat(e.name)),Me("#link-".concat(e.name))},key:e.canonicalReference,style:{display:"flex",justifyContent:"space-between",alignItems:"center"}},s.a.createElement("div",null,s.a.createElement("strong",null,e.name)),s.a.createElement("div",null,e.tags.map((function(e){return"Pipe"===e.value?"P":e.value})).map((function(e){return s.a.createElement(X.a,{key:e,color:re(e)},e)})))))}))}))}),[xe.search]);return s.a.createElement("div",{className:"side-bar-content",style:{height:"calc(100vh - 64px - 72px - 96px)",overflow:"hidden",overflowY:"auto"}},s.a.createElement(Q.a,{mode:"inline",defaultSelectedKeys:["1"],defaultOpenKeys:["sub1"],style:{height:"90%",borderRight:0}},a,0===a.length&&s.a.createElement(m.Fragment,null,s.a.createElement("div",{style:{height:30}}),s.a.createElement(Z.a,null)),s.a.createElement("div",{style:{height:100}})))})),ie=n(282),oe=n(273),ue=(n(216),function(e){return s.a.createElement(h.a,{id:"link-".concat(e.docMember.name),key:"link-".concat(e.docMember.name),title:s.a.createElement(ie.a.Title,{level:4},e.docMember.name),style:{width:"100%"},extra:e.docMember.tags.map((function(e){return"Pipe"===e.value?"P":e.value})).map((function(e){return s.a.createElement(X.a,{key:e,color:re(e)},e)}))},s.a.createElement(C,{markdown:e.docMember.members[0].comment.description}),s.a.createElement("div",{style:{height:10}}),e.docMember.members[0].comment.parsed.filter((function(e){return"@warning"===e.tag})).map((function(e){return Array.isArray(e.content)?s.a.createElement("div",{key:e.tag,className:"warning"},s.a.createElement("div",{className:"dot"},"WARNING"),s.a.createElement("div",{className:"warning-text"},s.a.createElement(C,{markdown:e.content.join("\n")}))):null})),s.a.createElement("div",{style:{height:10}}),e.docMember.members[0].comment.parsed.filter((function(e){return"@description"===e.tag})).map((function(e){return Array.isArray(e.content)?s.a.createElement(C,{key:e.tag,markdown:e.content.join("\n")}):null})),s.a.createElement("div",{style:{height:10}}),s.a.createElement("div",null,s.a.createElement("div",null,oe.a(e.docMember.members,1).map((function(e){if(null==e.comment.example)return null;var t=N(e.comment.example);return s.a.createElement("div",{key:e.canonicalReference},s.a.createElement(C,{markdown:"\n```typescript\n".concat(N(t),"\n```\n")}))})))),s.a.createElement("div",{style:{height:10}}))}),le=n(286),me=n(98),se=n(131),de=n(274),fe=n(275),pe=n(276),he=n(277),ge=n(285),ve=n(278),be=n(279),Ee=n(280);function ke(e){return{name:e.name,version:e.version}}function ye(e){return e.map((function(e){return e.text})).join("").replace("declare","").replace(/\s+/gm," ")}function we(e){var t=e.members.find((function(e){return"EntryPoint"===e.kind}));if(null==t)throw new Error("Failed to find entry point");return se.a(t.members,de.a((function(e){return{kind:e.kind,name:e.name,comment:je(e.docComment),excerptTokens:e.excerptTokens,canonicalReference:e.canonicalReference,package:e.canonicalReference.replace(/(!.+)/gm,""),canonicalReferenceGroup:e.canonicalReference.replace(/(:.*)/,"")}})),fe.a((function(e){return e.canonicalReferenceGroup})),pe.a((function(e){var t=Object(i.a)(e,2),n=t[0],a=t[1];return[n,he.a(Object(me.a)({members:a.map((function(e){return he.a(e,["name","package"])}))},a[0]),["excerptTokens","comment"])]})),pe.a((function(e){var t=Object(i.a)(e,2),n=t[0],a=t[1],r=se.a(a.members,ge.a((function(e){return e.comment.parsed.filter((function(e){return["@category","@pipe"].includes(e.tag)})).flatMap((function(e){return y.a(e.content)?e.content.map((function(t){return{tag:e.tag,value:t}})):[]}))})),ve.a((function(e){return"".concat(e.tag,"/").concat(e.value)})),be.a((function(e){return"/"!==e.tag})));return[n,Object(me.a)(Object(me.a)({},a),{},{tags:r})]})),Ee.a,de.a((function(e){return Object(i.a)(e,2)[1]})))}function je(e){var t=e.replace("/**","").replace("*/","").split(/^[ ]+?\*/gm).join("\n").trim().replace(/(@\w+)/gm,"###$1").split("###").map((function(e){return e.trim()}));return{description:t.filter((function(e){return!/@\w+/.test(e)}))[0],example:"",parsed:t.filter((function(e){return/@\w+/.test(e)})).map((function(e){var t=e.replace(/(@\w+)/,"$1##").split("##"),n=t[0],a=se.a(t.slice(1),ge.a((function(e){return e.split("\n").map((function(e){return e.trim()})).filter((function(e){return e}))})));return"@param"===n?{tag:n,content:a.map((function(e){var t;return{description:e.replace(/\w+/,"").trim().replace(/^-/,"").trim(),name:null===(t=e.match(/\w+/))||void 0===t?void 0:t[0]}}))[0]}:"@example"===n?{tag:n,content:a.map((function(e){return e}))}:{tag:n,content:a}}))}}function Oe(e){return se.a(e,fe.a((function(e){var t=e.tags.find((function(e){return"@category"===e.tag}));return null==t?"utils":t.value.toLowerCase()})),Ee.a,de.a((function(e){var t=Object(i.a)(e,2);return{group:t[0],members:t[1]}})))}var xe=Object(T.l)({search:""});function Me(e){return _e.apply(this,arguments)}function _e(){return(_e=Object(l.a)(u.a.mark((function e(t){var n,a,r;return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,k.a(Object(l.a)(u.a.mark((function e(){return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",le.a((function(){return document.getElementById("main-view")}),1e3));case 1:case"end":return e.stop()}}),e)}))));case 2:if(n=e.sent,!y.b(n)){e.next=5;break}return e.abrupt("return");case 5:return e.next=7,k.a(Object(l.a)(u.a.mark((function e(){return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",le.a((function(){return document.querySelector(t)}),3e3));case 1:case"end":return e.stop()}}),e)}))));case 7:if(a=e.sent,!y.b(a)){e.next=10;break}return e.abrupt("return");case 10:r=a.getBoundingClientRect().top,n.scrollTo({top:r+n.scrollTop-100,behavior:"auto"});case 12:case"end":return e.stop()}}),e)})))).apply(this,arguments)}var Ne=Object(P.a)((function(e){var t=e.documentation.filter((function(e){return"Function"===e.kind})),n=r.groupMembers(t);return Object(m.useEffect)((function(){var e=window.location.hash.split("/").splice(-1)[0];Me("#link-".concat(e))}),[]),s.a.createElement(U,{readme:e.readme,sideMenu:s.a.createElement(m.Fragment,null,s.a.createElement(Q.a,{theme:"light",mode:"vertical"},s.a.createElement(Q.a.Item,{key:H.home.key},s.a.createElement(v.b,{to:H.home.path},H.home.title)),s.a.createElement(Q.a.Item,{key:H.documentation.key},s.a.createElement(v.b,{to:H.documentation.path},H.documentation.title))),s.a.createElement("div",{style:{padding:10},className:"search-input"},s.a.createElement(V.a,{size:"large",placeholder:"Search",onKeyUp:function(e){return xe.search=e.currentTarget.value}})),s.a.createElement(ce,{groupedMembers:n}))},n.map((function(e){return s.a.createElement("div",{key:e.group},s.a.createElement("div",{key:e.group},e.members.map((function(e){return s.a.createElement(m.Fragment,{key:e.canonicalReference},s.a.createElement(ue,{key:e.canonicalReference,docMember:e}),s.a.createElement("div",{style:{height:10}}))}))))})))})),Se=function(e){e&&e instanceof Function&&n.e(3).then(n.bind(null,289)).then((function(t){var n=t.getCLS,a=t.getFID,r=t.getFCP,c=t.getLCP,i=t.getTTFB;n(e),a(e),r(e),c(e),i(e)}))},Ce=n(156),Pe=n.n(Ce),ze=(n(265),function(){var e=Object(l.a)(u.a.mark((function e(){var t,n;return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,le.a((function(){var e,t;return null===(e=document.getElementsByName("basePath"))||void 0===e||null===(t=e.item(0))||void 0===t?void 0:t.getAttribute("content")}),3e3);case 2:return t=e.sent,e.next=5,Pe.a.get("".concat(t,"/data/data.json"));case 5:return n=e.sent,e.abrupt("return",n.data);case 7:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}()),Re=Object(m.createContext)("");function Te(){return Object(m.useContext)(Re)}function Ie(e,t){var n=Object(m.useState)(void 0),a=Object(i.a)(n,2),r=a[0],o=a[1];return Object(m.useEffect)((function(){e().then((function(e){o(e)}))}),Object(c.a)(t||[])),r}var Fe=function(){var e=Ie((function(){return ze()})),t=Ie((function(){return le.a((function(){var e,t;return null===(e=document.getElementsByName("basePath"))||void 0===e||null===(t=e.item(0))||void 0===t?void 0:t.getAttribute("content")}),3e3)}));return null==t||null==e?null:s.a.createElement(Re.Provider,{value:t},s.a.createElement(Ne,{key:"app",documentation:e.docs,readme:e.articles.readme}))};f.a.render(s.a.createElement(Fe,null),document.getElementById("root")),Se()}},[[266,1,2]]]);
//# sourceMappingURL=main.b73e8eef.chunk.js.map