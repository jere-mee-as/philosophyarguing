import json,sys; import os; sys.path.insert(0,os.path.dirname(os.path.abspath(__file__))); from shell5 import page4
P=json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'philosophyarguing.json')))
tree=[];units=[]
for fi,f in enumerate(P):
    g={'n':f['n'],'i':f.get('i',''),'items':[]}
    for ui,u in enumerate(f['u']):
        iid=f'{fi}.{ui}'; g['items'].append({'id':iid,'n':u['n'],'i':u.get('i','')})
        for ci in u['t']:
            c=f['t'][ci]
            units.append({'it':iid,'t':c['t'],'r':[{'f':k['f'],'m':k.get('m','')} for k in c['k']],'who':u['n']})
    tree.append(g)
site={'tree':tree,'units':units,'noun':['claim','claims'],'LINKS':[['Just the rage bait →','https://jere-mee-as.github.io/philosophyragebait/']],'by':'field',
 'INTRO':'Every famous claim, answered three ways: serious, bait, rage bait.'}
theme=r'''
:root{--bg:#efe3c8;--fg:#1b140e;--fg2:#3a2e22;--dim:#6b5744;--line:#d4c09b;--line2:#e2d3b3;--acc:#c3261b;--hov:#e9dbbb;--sel:#e4d2ac;--hl:#ffd76a;--panel:#f4ead5;
--bar:#1b140e;--barfg:#f0e4c8;--bardim:#b3a284;--barline:#4a3c2e;--field:#2b211a;--sayacc:#ffd76a;
--display:Anton,Impact,sans-serif;--text:"Libre Caslon Text",Georgia,serif;--label:Oswald,"Arial Narrow",sans-serif;--right:380px;--L0:#1b140e;--L1:#9a5200;--L2:#c3261b}
#say{text-transform:uppercase;letter-spacing:.01em;font-size:26px}
.gh,.sub,.crumb .c,.d .lab,.hw h3,.hg .hgr h4{text-transform:uppercase;letter-spacing:.06em;font-weight:500}
.cols .rp{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
.row .p1{font-style:italic;font-size:16px;margin-bottom:8px}
.rp{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
.row .rp>div{font-size:13.5px;line-height:1.45;border-top:2px solid var(--L0);padding-top:6px}
.row .rp>div:nth-child(2){border-color:var(--L1)}.row .rp>div:nth-child(3){border-color:var(--L2);font-weight:700}
.lv{font:500 12px var(--label);letter-spacing:.08em;text-transform:uppercase}
.lv0{color:var(--L0)}.lv1{color:var(--L1)}.lv2{color:var(--L2)}
.d h3{font:italic 400 19px/1.35 var(--text)}
.d .ref{font-size:13px;color:var(--dim);border-left:2px solid var(--line);padding-left:10px;margin:0 0 6px}
.d .ans{font-size:15.5px;line-height:1.5;margin:0}
.fr .q{font-weight:700}.fr .who{font:500 12px var(--label);letter-spacing:.06em;text-transform:uppercase;color:var(--acc);white-space:nowrap}
@media (max-width:860px){.rp{grid-template-columns:1fr;gap:8px}.cols{display:none}}
'''
js=r'''
const LV=['○ serious','◐ bait','● rage bait'];
SITE.BLOB=u=>[u.who,u.t,...u.r.map(r=>r.f+' '+r.m)].join(' ');
SITE.SAY=(it,u,q)=>q?`So you’re arguing about “${esc(q)}”…`:!it?'So you’re arguing about…':`So you’re arguing about <b>${esc(it.n)}</b>${u?`, ${esc(u.t)}?`:'?'}`;
SITE.COLS=()=>`<div class="cols"><div class="rp">${LV.map((l,i)=>`<div class="lv lv${i}">${l}</div>`).join('')}</div></div>`;
SITE.ROW=(u,Q)=>`<span class="p1">${hl(u.t,Q)}</span><div class="rp">${u.r.map(r=>`<div>${hl(r.f,Q)}${cpb(r.f)}</div>`).join('')}</div>`;
SITE.COPY=u=>u.r[2]?u.r[2].f:u.r[0].f;
SITE.DETAIL=(u,Q)=>`<p class="m">${esc(u.who)} answers back</p>`+u.r.map((r,i)=>r.m?lab(`<span class="lv lv${i}">${LV[i]}</span>`)+`<p class="ans" title="${esc(r.f)}">${hl(r.m,Q)}${cpb(r.m)}</p>`:'').join('');
SITE.EMPTY='Pick a claim to see how the philosopher answers back.';
SITE.FEATURE=()=>{const pool=SITE.units.filter(u=>u.r[2]);const pick=[];for(let i=0;i<5&&pool.length;i++)pick.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]);
 return `<h3>Some rage bait to start with</h3><div class="feat">${pick.map(u=>`<button class="fr" data-jump="${u.ix}"><span class="q">${esc(u.r[2].f)}</span><span class="who">${esc(u.who)}</span></button>`).join('')}</div>`};
'''
page4('philosophyarguing','So you’re arguing about…','family=Anton&family=Oswald:wght@500&family=Libre+Caslon+Text:ital,wght@0,400;0,700;1,400',theme,site,js)
