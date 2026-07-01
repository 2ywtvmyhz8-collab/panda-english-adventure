
const STORE='fox_academy_v20_beta';
let S=JSON.parse(localStorage.getItem(STORE)||'{"xp":0,"coins":0,"correct":0,"claimed":{},"wrong":{},"stars":{},"review":{},"reviewed":{},"login":{},"done":{},"cards":{},"owned":{},"badges":{}}');
const today=new Date().toDateString();

const cards=[
 {id:'apple',cat:'Food',emoji:'🍎',name:'Apple',type:'Fruits',zh:'蘋果',info:'Apple is a fruit. Apples have seeds.'},
 {id:'banana',cat:'Food',emoji:'🍌',name:'Banana',type:'Fruits',zh:'香蕉',info:'Bananas are yellow fruits. They grow in warm places.'},
 {id:'milk',cat:'Food',emoji:'🥛',name:'Milk',type:'Dairy',zh:'牛奶',info:'Milk is dairy. Milk has calcium.'},
 {id:'cheese',cat:'Food',emoji:'🧀',name:'Cheese',type:'Dairy',zh:'起司',info:'Cheese is dairy.'},
 {id:'rice',cat:'Food',emoji:'🍚',name:'Rice',type:'Grains',zh:'米飯',info:'Rice is a grain.'},
 {id:'bread',cat:'Food',emoji:'🍞',name:'Bread',type:'Grains',zh:'麵包',info:'Bread is made from grain.'},
 {id:'egg',cat:'Food',emoji:'🥚',name:'Egg',type:'Protein',zh:'蛋',info:'Egg is protein.'},
 {id:'fish',cat:'Food',emoji:'🐟',name:'Fish',type:'Protein',zh:'魚',info:'Fish is protein.'},
 {id:'carrot',cat:'Food',emoji:'🥕',name:'Carrot',type:'Vegetables',zh:'紅蘿蔔',info:'Carrot is a vegetable.'},
 {id:'spinach',cat:'Food',emoji:'🥬',name:'Spinach',type:'Vegetables',zh:'菠菜',info:'Spinach is a leafy vegetable.'},
 {id:'kiwi',cat:'Discovery',emoji:'🥝',name:'Kiwi',type:'Fruits',zh:'奇異果',info:'Kiwi is green inside.'},
 {id:'grape',cat:'Discovery',emoji:'🍇',name:'Grape',type:'Fruits',zh:'葡萄',info:'Grapes grow in bunches.'},
 {id:'peach',cat:'Discovery',emoji:'🍑',name:'Peach',type:'Fruits',zh:'桃子',info:'Peach is a sweet fruit.'},
 {id:'pear',cat:'Discovery',emoji:'🍐',name:'Pear',type:'Fruits',zh:'梨子',info:'Pear is a fruit.'},
 {id:'supermarket',cat:'Life',emoji:'🛒',name:'Supermarket',type:'Place',zh:'超市',info:'We buy fruit at the supermarket.'},
 {id:'seed',cat:'Life',emoji:'🌱',name:'Seed',type:'Nature',zh:'種子',info:'Apples have seeds.'},
 {id:'warm',cat:'Life',emoji:'☀️',name:'Warm',type:'Adjective',zh:'溫暖的',info:'Bananas grow in warm places.'},
 {id:'calcium',cat:'Life',emoji:'💪',name:'Calcium',type:'Nutrition',zh:'鈣',info:'Milk has calcium.'},
 {id:'lion_pride',cat:'Animal',emoji:'🦁',name:'Pride',type:'Animal Group',zh:'獅群',info:'A group of lions is a pride.'},
 {id:'wolf_pack',cat:'Animal',emoji:'🐺',name:'Pack',type:'Animal Group',zh:'狼群',info:'A group of wolves is a pack.'},
 {id:'fish_school',cat:'Animal',emoji:'🐟',name:'School',type:'Animal Group',zh:'魚群',info:'A group of fish is a school.'},
 {id:'bee_swarm',cat:'Animal',emoji:'🐝',name:'Swarm',type:'Animal Group',zh:'蜂群',info:'A group of bees is a swarm.'}
];
const grammar=[
 ['Whole fruit is ______ than fruit juice.',['healthier','healthy','healthiest'],'healthier','Use -er to compare two things.'],
 ['I ______ going to eat fruit.',['am','is','are'],'am','I am.'],
 ['She ______ going to exercise.',['am','is','are'],'is','She is.'],
 ['good 的比較級是？',['better','gooder','best'],'better','good is irregular: better.']
];
const reading=[
 ['Who is Eva?',['little sister','teacher','doctor'],'little sister','Eva is the writer’s little sister.'],
 ['Which is healthier?',['whole fruit','fruit juice','candy'],'whole fruit','Whole fruit is healthier than fruit juice.'],
 ['Which grains are better?',['whole grains','refined grains','no grains'],'whole grains','Whole grains are better for you.']
];

function save(){localStorage.setItem(STORE,JSON.stringify(S))}
function $(id){return document.getElementById(id)}
function go(id){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));$(id).classList.add('active');window.scrollTo(0,0); if(id==='collection')renderCollection(); if(id==='review')renderReview(); if(id==='backpack')renderBackpack(); if(id==='homeFox')renderHome(); update();}
function toast(m){let t=$('toast');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1500)}
function shuffle(a){return [...a].sort(()=>Math.random()-.5)}
function speak(txt){let u=new SpeechSynthesisUtterance(txt);u.lang='en-US';u.rate=.86;speechSynthesis.speak(u)}
function confetti(){const layer=$('fxLayer');layer.innerHTML='';for(let i=0;i<90;i++){let s=document.createElement('span');s.className='confetti';s.textContent=['🎉','⭐','🦊','💰','✨','🎴'][Math.floor(Math.random()*6)];s.style.left=Math.random()*100+'%';s.style.top='-40px';s.style.animationDelay=Math.random()*.7+'s';layer.appendChild(s)}setTimeout(()=>layer.innerHTML='',3300)}
function star(n){return Math.max(1,4-n)} function starText(n){return '⭐'.repeat(n)+'☆'.repeat(3-n)}
function cardById(id){return cards.find(c=>c.id===id)}
function collect(id){if(!S.cards[id]){S.cards[id]=1;toast('收藏：'+cardById(id).name)}}
function markWrong(k,label,quiz){S.wrong[k]=(S.wrong[k]||0)+1;S.review[k]={label,quiz};save();update();}
function award(k,xp,att=1,cardId=null){if(S.claimed[k]){toast('已完成過 ✅');return false}let st=star(att);S.claimed[k]=1;S.stars[k]=st;S.xp+=xp*st;S.coins+=st+Math.floor(xp/3);S.correct++;if(cardId)collect(cardId);save();update();toast(starText(st)+' +'+(xp*st)+' XP');return true}
function answer(btn,a,ans,k,label,hid,xp,cardId,quizObj){let n=Number(btn.parentElement.dataset.attempts||1);if(btn.disabled)return;if(a===ans){btn.classList.add('correct');award(k,xp,n,cardId);btn.parentElement.querySelectorAll('button').forEach(b=>b.disabled=true)}else{btn.classList.add('wrong','locked');btn.disabled=true;markWrong(k,label,quizObj);n++;btn.parentElement.dataset.attempts=n;if(n>=3&&hid)$(hid).classList.remove('hidden');toast('錯的選項已鎖住')}}
function quizHtml(q,prefix,i,xp,cardId=null){
 const hid=`${prefix}_h_${i}`; const key=`${prefix}_${i}_${q.q.replace(/\W/g,'')}`;
 const quizObj={q:q.q,choices:q.choices,ans:q.ans,hint:q.hint,cardId};
 return `<div class="quest"><h3>${q.q}</h3><div class="hint hidden" id="${hid}">💡 Hint: ${q.hint}</div>${shuffle(q.choices).map(a=>`<button class="choice" onclick='answer(this,${JSON.stringify(a)},${JSON.stringify(q.ans)},${JSON.stringify(key)},${JSON.stringify(q.q)},${JSON.stringify(hid)},${xp},${JSON.stringify(cardId)},${JSON.stringify(quizObj)})'>${a}</button>`).join('')}</div>`;
}
function foodQuizzes(list){return list.map(c=>({q:`${c.emoji} ${c.name}`,choices:['Fruits','Vegetables','Grains','Protein','Dairy','Place','Nature','Adjective','Nutrition','Animal Group'],ans:c.type,hint:c.info,cardId:c.id}))}

function claimLogin(){if(S.login.last===today){toast('今天已打卡 ✅');return}let y=new Date(Date.now()-86400000).toDateString();S.login.streak=(S.login.last===y)?(S.login.streak||0)+1:1;S.login.last=today;let r=20+S.login.streak*5;S.coins+=r;S.xp+=10;save();renderDaily();update();confetti();toast(`Day ${S.login.streak} +${r} coins`)}
function renderDaily(){let st=S.login.streak||0;$('dailyStatus').innerHTML=`目前連續登入：🔥 ${st} 天<br>${S.login.last===today?'今天已打卡 ✅':'今天尚未打卡'}`;$('streakRewards').innerHTML=[1,2,3,7,14,30].map(d=>`<div class="mini">${st>=d?'✅':'🎁'}<b>Day ${d}</b><small>${d===7?'Rare Fox Hat':d===30?'Legend Fox':'Coins Bonus'}</small></div>`).join('')}
function renderQuest(){let tasks=[['Vocabulary','完成核心單字','playWorld("Supermarket")'],['Reading','完成閱讀題','playReading()'],['Grammar','完成文法題','playGrammar()'],['Animal Note','老師補充','playWorld("Zoo")'],['Boss','打 Boss','completeQuest(4); bossClear()']];$('questList').innerHTML=tasks.map((t,i)=>`<div class="mission"><h3>${i+1}. ${t[0]}</h3><p>${t[1]}</p><button onclick='${t[2]}'>開始</button><button onclick="completeQuest(${i})">標記完成</button></div>`).join('')}
function completeQuest(i){S.done['quest_'+today+'_'+i]=1;save();update();toast('任務完成 ✅');let c=[0,1,2,3,4].filter(x=>S.done['quest_'+today+'_'+x]).length;if(c>=5&&!S.done['chest_'+today]){S.done['chest_'+today]=1;S.coins+=100;S.xp+=60;S.badges.daily=1;$('chestBox').classList.remove('hidden');$('chestBox').innerHTML='🎁 Daily Chest Open!<br>+100 Coins +60 XP<br>🦊 Daily Fox Badge';confetti();save();update()}}
function renderWorld(){let w=[['🛒','Supermarket','Food + 延伸水果','Supermarket'],['🌳','Forest','生活英文與探索','Forest'],['🦁','Zoo','Animal groups','Zoo'],['🏫','School','Grammar','School'],['📖','Library','Reading','Library']];$('worldBox').innerHTML=w.map(x=>`<div class="world"><div class="cardEmoji">${x[0]}</div><h3>${x[1]}</h3><p>${x[2]}</p><button onclick="playWorld('${x[3]}')">進入</button></div>`).join('')}
function playWorld(type){$('playCard').classList.remove('hidden');$('playTitle').textContent=type;let qs=[];if(type==='Supermarket')qs=foodQuizzes(cards.filter(c=>['Food','Discovery'].includes(c.cat)));else if(type==='Forest')qs=foodQuizzes(cards.filter(c=>c.cat==='Life'));else if(type==='Zoo')qs=foodQuizzes(cards.filter(c=>c.cat==='Animal'));else if(type==='School'){playGrammar();return}else{playReading();return}$('playBox').innerHTML=shuffle(qs).map((q,i)=>quizHtml(q,'world_'+type,i,6,q.cardId)).join('');go('world')}
function playGrammar(){$('playCard').classList.remove('hidden');$('playTitle').textContent='Grammar School';$('playBox').innerHTML=shuffle(grammar.map(g=>({q:g[0],choices:g[1],ans:g[2],hint:g[3]}))).map((q,i)=>quizHtml(q,'grammar',i,6)).join('');go('world')}
function playReading(){$('playCard').classList.remove('hidden');$('playTitle').textContent='Library Reading';$('playBox').innerHTML=shuffle(reading.map(g=>({q:g[0],choices:g[1],ans:g[2],hint:g[3]}))).map((q,i)=>quizHtml(q,'reading',i,7)).join('');go('world')}

let currentCat='All';function setCat(c){currentCat=c;renderCollection()}
function renderCollection(){let cats=['All','Food','Discovery','Life','Animal'];$('collectionTabs').innerHTML=cats.map(c=>`<button onclick="setCat('${c}')">${c}</button>`).join('');let list=currentCat==='All'?cards:cards.filter(c=>c.cat===currentCat);let owned=list.filter(c=>S.cards[c.id]).length;$('collectionProgress').innerHTML=`${currentCat} 收藏：${owned} / ${list.length}`;$('collectionBox').innerHTML=list.map(c=>{let ok=S.cards[c.id];return `<div class="collect ${ok?'':'lockedCard'}" onclick="${ok?`openCard('${c.id}')`:''}"><div class="cardEmoji">${ok?c.emoji:'❓'}</div><div class="en">${ok?c.name:'未收藏'}</div><p class="zh">${ok?c.zh+'｜'+c.type:'去冒險答對題目收集。'}</p></div>`}).join('')}
function openCard(id){let c=cardById(id);$('modalBody').innerHTML=`<div class="cardEmoji">${c.emoji}</div><h2>${c.name}</h2><p><b>${c.zh}</b>｜${c.cat}｜${c.type}</p><p class="story">${c.info}</p><button onclick="speak('${c.info}')">🔊 聽英文</button>`;$('modal').classList.remove('hidden')}
function closeModal(){$('modal').classList.add('hidden')}

function renderReview(){let keys=Object.keys(S.review);if(!keys.length){$('reviewBox').innerHTML='<div class="win">目前沒有錯題。很棒！</div>';return}$('reviewBox').innerHTML=keys.map((k,i)=>{let r=S.review[k];let done=S.reviewed[k];return `<div class="reviewQuiz"><h3>${r.label}</h3><p>錯過 ${S.wrong[k]||0} 次｜${done?'已複習 ✅':'待複習'}</p>${done?'<button disabled>已完成</button>':reviewQuestionHtml(k,r.quiz,i)}</div>`}).join('')}
function reviewQuestionHtml(k,q,i){let hid='rev_h_'+i;return `<div class="hint hidden" id="${hid}">💡 Hint: ${q.hint}</div>${shuffle(q.choices).map(a=>`<button class="choice" onclick='answerReview(this,${JSON.stringify(a)},${JSON.stringify(q.ans)},${JSON.stringify(k)},${JSON.stringify(hid)},${JSON.stringify(q.cardId||null)})'>${a}</button>`).join('')}`}
function answerReview(btn,a,ans,k,hid,cardId){let n=Number(btn.parentElement.dataset.attempts||1);if(a===ans){btn.classList.add('correct');btn.parentElement.querySelectorAll('button').forEach(b=>b.disabled=true);S.reviewed[k]=1;S.xp+=10*star(n);S.coins+=2; if(cardId)collect(cardId); save();renderReview();update();toast('複習成功 +XP')}else{btn.classList.add('wrong','locked');btn.disabled=true;n++;btn.parentElement.dataset.attempts=n;if(n>=3)$(hid).classList.remove('hidden');toast('再想一次，錯誤選項已鎖住')}}

function bossClear(){if(S.done['boss_'+today])toast('今天 Boss 已領過');else{S.done['boss_'+today]=1;S.badges.boss=1;S.coins+=120;S.xp+=60;confetti();save();update();toast('Boss Clear! +120 Coins')}}
function renderBackpack(){let items=[];if(S.badges.daily)items.push(['🦊','Daily Fox Badge','完成今日冒險']);if(S.badges.boss)items.push(['👾','Boss Badge','打敗Boss']);Object.keys(S.cards).forEach(id=>{let c=cardById(id);if(c)items.push([c.emoji,c.name+' Card',c.info])});$('backpackBox').innerHTML=items.length?items.map(i=>`<div class="bagItem"><div class="cardEmoji">${i[0]}</div><h3>${i[1]}</h3><p>${i[2]}</p></div>`).join(''):'<div class="win">背包還是空的，去冒險收集吧！</div>'}
const shop=[['bed','🛏️ Bed',60],['plant','🪴 Plant',40],['books','📚 Bookshelf',80],['hat','🎩 Fox Hat',100],['dog','🐶 Puppy',150],['lamp','💡 Lamp',70]];
function renderHome(){let owned=Object.keys(S.owned);$('roomBox').innerHTML='🦊 '+(owned.length?owned.map(k=>shop.find(i=>i[0]===k)?.[1]||'').join(' '):'狐狸小屋還很空，去買家具吧！');$('shopBox').innerHTML=shop.map(i=>`<div class="shop ${S.owned[i[0]]?'correct':''}"><div class="cardEmoji">${i[1].split(' ')[0]}</div><h3>${i[1]}</h3><p>${i[2]} coins</p><button onclick="buy('${i[0]}',${i[2]})">${S.owned[i[0]]?'已擁有':'購買'}</button></div>`).join('')}
function buy(k,p){if(S.owned[k])return toast('已擁有');if(S.coins<p)return toast('Coins 不夠');S.coins-=p;S.owned[k]=1;save();renderHome();update();confetti();toast('購買成功')}

function update(){let lv=Math.floor(S.xp/300)+1;['xpA','pXp'].forEach(id=>$(id).textContent=S.xp);['coinA','pCoins'].forEach(id=>$(id).textContent=S.coins);$('levelA').textContent=lv;$('pLevel').textContent=lv;$('cardA').textContent=Object.keys(S.cards).length;$('pStreak').textContent=S.login.streak||0;$('barA').style.width=Math.min(100,(S.xp%300)/3)+'%';$('pCards').textContent=Object.keys(S.cards).length+' / '+cards.length;let vals=Object.values(S.stars);$('pStars').textContent=vals.length?`平均 ${(vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1)} 星｜共 ${vals.length} 題`:'尚無星星紀錄';let w=Object.entries(S.wrong).sort((a,b)=>b[1]-a[1]).slice(0,8).map(x=>`${S.review[x[0]]?.label||x[0]}：${x[1]}次`).join('、');$('pWrong').textContent=w||'目前沒有明顯錯題';$('pSuggest').textContent=w?'建議先進 Review Cave 真的答題複習，再玩自由冒險。':'可以挑戰自由冒險收集更多卡。'}
function resetGame(){if(confirm('確定清除所有紀錄？')){localStorage.removeItem(STORE);location.reload()}}
renderDaily();renderQuest();renderWorld();renderCollection();renderBackpack();renderHome();update();
