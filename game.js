
const STORE='fox_academy_v1_alpha';
let S=JSON.parse(localStorage.getItem(STORE)||'{"xp":0,"coins":0,"correct":0,"claimed":{},"wrong":{},"stars":{},"review":{},"reviewed":{},"login":{},"done":{},"cards":{}}');
let hp=210;
const today=new Date().toDateString();

const school=[
 ['🍎 apple','Fruits','Apple is a fruit.'],['🍌 banana','Fruits','Bananas are yellow fruits.'],['🥛 milk','Dairy','Milk is dairy.'],['🧀 cheese','Dairy','Cheese is dairy.'],['🍚 rice','Grains','Rice is a grain.'],['🍞 bread','Grains','Bread is made from grain.'],['🥚 egg','Protein','Egg is protein.'],['🐟 fish','Protein','Fish is protein.'],['🥕 carrot','Vegetables','Carrot is a vegetable.'],['🥬 spinach','Vegetables','Spinach is leafy vegetable.']
];
const extended=[
 ['🥝 kiwi','Fruits','Kiwi is green inside.'],['🍇 grape','Fruits','Grapes grow in bunches.'],['🍑 peach','Fruits','Peach is a sweet fruit.'],['🍐 pear','Fruits','Pear is a fruit.'],['🫘 beans','Protein','Beans are protein food.'],['🥣 cereal','Grains','Cereal is a grain product.']
];
const life=[
 ['🛒 supermarket','Place','We buy fruit at the supermarket.'],['🌱 seed','Nature','Apples have seeds.'],['☀️ warm','Adjective','Bananas grow in warm places.'],['💪 calcium','Nutrition','Milk has calcium.']
];
const reading=[
 ['Welcome to my blog! This is my little sister. Her name is Eva.','Who is Eva?','little sister',['little sister','teacher','doctor'],'Eva is family.'],
 ['She likes big portions of salty snacks.','What kind of snacks does Eva like?','salty snacks',['salty snacks','vegetables','milk'],'Look for salty snacks.'],
 ['Whole fruit is healthier than fruit juice.','Which is healthier?','whole fruit',['whole fruit','fruit juice','candy'],'The sentence says whole fruit is healthier.'],
 ['Whole grains are better for you than refined grains.','Which grains are better?','whole grains',['whole grains','refined grains','no grains'],'Better means healthier.']
];
const grammar=[
 ['Whole fruit is ______ than fruit juice.',['healthier','healthy','healthiest'],'healthier','Use -er to compare two things.'],
 ['I ______ going to eat fruit.',['am','is','are'],'am','I am.'],
 ['She ______ going to exercise.',['am','is','are'],'is','She is.'],
 ['They ______ going to drink water.',['am','is','are'],'are','They are.'],
 ['good 的比較級是？',['better','gooder','best'],'better','good is irregular: better.'],
 ['bad 的比較級是？',['worse','badder','worst'],'worse','bad is irregular: worse.']
];
const animals=[
 ['🦁 a group of lions',['pride','pack','school'],'pride','Lions live in a pride.'],['🐺 a group of wolves',['pack','flock','bed'],'pack','Wolves are a pack.'],['🐟 a group of fish',['school','pod','army'],'school','Fish swim in a school.'],['🐬 a group of dolphins',['pod','herd','tower'],'pod','Dolphins are a pod.'],['🦒 a group of giraffes',['tower','cloud','nest'],'tower','Giraffes are tall like a tower.'],['🐝 a group of bees',['swarm','clowder','parade'],'swarm','Bees fly in a swarm.'],['animals with backbones',['vertebrates','invertebrates','mollusks'],'vertebrates','Backbone means vertebrate.'],['animals without backbones',['invertebrates','mammals','birds'],'invertebrates','No backbone means invertebrate.']
];
const diary=[
 'Today I ate an apple and drank milk. I made a healthy choice!',
 'I saw a pride of lions at the zoo.',
 'I am going to exercise after school.',
 'Whole fruit is healthier than fruit juice.',
 'My fox bought grapes at the supermarket.',
 'Milk has calcium. It helps my body grow.'
];

function save(){localStorage.setItem(STORE,JSON.stringify(S))}
function go(id){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));document.getElementById(id).classList.add('active');window.scrollTo(0,0); if(id==='review')renderReview(); update();}
function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1500)}
function speak(text){const u=new SpeechSynthesisUtterance(text);u.lang='en-US';u.rate=.86;speechSynthesis.speak(u)}
function shuffle(a){return [...a].sort(()=>Math.random()-.5)}
function starsFromAttempts(n){return Math.max(1,4-n)}
function starText(n){return '⭐'.repeat(n)+'☆'.repeat(3-n)}
function markWrong(key,label){S.wrong[key]=(S.wrong[key]||0)+1;S.review[key]=label;save();update()}
function award(key,xp,attempts=1,label=''){if(S.claimed[key]){toast('已完成過 ✅');return false}let st=starsFromAttempts(attempts);S.claimed[key]=1;S.stars[key]=st;S.xp+=xp*st;S.coins+=st+Math.floor(xp/3);S.correct++;if(label)S.cards[label]=1;save();update();toast(starText(st)+' +'+(xp*st)+' XP');return true}
function answer(btn,a,ans,key,label,hintId,xp){let n=Number(btn.parentElement.dataset.attempts||1);if(btn.disabled)return;if(a===ans){btn.classList.add('correct');award(key,xp,n,label);btn.parentElement.querySelectorAll('button').forEach(b=>b.disabled=true)}else{btn.classList.add('wrong','locked');btn.disabled=true;markWrong(key,label);n++;btn.parentElement.dataset.attempts=n;if(n>=3&&hintId)document.getElementById(hintId).classList.remove('hidden');toast('錯的選項已鎖住')}}
function makeQuiz(items,prefix,xp){return shuffle(items).map((q,i)=>`<div class="quest"><h3>${q[0]}</h3><div class="hint hidden" id="${prefix}_hint_${i}">💡 Hint: ${q[3]}</div>${shuffle(q[1]).map(a=>`<button class="choice" onclick="answer(this,'${a}','${q[2]}','${prefix}_${i}_${q[0].replace(/\W/g,'')}','${q[0]}','${prefix}_hint_${i}',${xp})">${a}</button>`).join('')}</div>`).join('')}

function claimLogin(){
 if(S.login.last===today){toast('今天已打卡 ✅');return}
 let yesterday=new Date(Date.now()-86400000).toDateString();
 S.login.streak=(S.login.last===yesterday)?(S.login.streak||0)+1:1;
 S.login.last=today;
 let reward=20+S.login.streak*5;
 S.coins+=reward;S.xp+=10;
 save();update();renderDaily();toast(`Day ${S.login.streak} +${reward} coins`);
}
function renderDaily(){
 const st=S.login.streak||0;
 document.getElementById('dailyStatus').innerHTML=`目前連續登入：🔥 ${st} 天<br>${S.login.last===today?'今天已打卡 ✅':'今天尚未打卡'}`;
 document.getElementById('streakRewards').innerHTML=[1,2,3,7,14,30].map(d=>`<div class="mini">${st>=d?'✅':'🎁'}<b>Day ${d}</b><small>${d===7?'Rare Fox Hat':d===30?'Legend Fox':'Coins Bonus'}</small></div>`).join('');
}
function renderQuest(){
 const tasks=[['Vocabulary','完成 5 題核心單字','playWorld("Supermarket")'],['Reading','完成 4 題閱讀理解','playReading()'],['Grammar','完成 4 題文法','playGrammar()'],['Animal Note','老師 7/1 補充','playAnimals()'],['Boss','打敗 Boss','go("boss")']];
 document.getElementById('questList').innerHTML=tasks.map((t,i)=>`<div class="mission"><h3>${i+1}. ${t[0]}</h3><p>${t[1]}</p><button onclick='${t[2]}'>開始 ▶</button><button onclick="completeQuest(${i})">標記完成</button></div>`).join('');
}
function completeQuest(i){S.done['quest_'+today+'_'+i]=1;save();update();toast('任務完成 ✅');let count=[0,1,2,3,4].filter(x=>S.done['quest_'+today+'_'+x]).length;if(count>=5 && !S.done['chest_'+today]){S.done['chest_'+today]=1;S.coins+=80;S.xp+=50;document.getElementById('chestBox').classList.remove('hidden');document.getElementById('chestBox').innerHTML='🎁 Daily Chest Open! +80 Coins +50 XP';save();update();}}
function renderWorld(){
 const worlds=[['🛒','Supermarket','Food + 延伸水果','Supermarket'],['🌳','Forest','Discovery Cards','Forest'],['🦁','Zoo','Animal groups','Zoo'],['🏫','School','Grammar practice','School'],['👾','Boss Rush','混合挑戰','Boss']];
 document.getElementById('worldBox').innerHTML=worlds.map(w=>`<div class="world"><div class="cardEmoji">${w[0]}</div><h3>${w[1]}</h3><p>${w[2]}</p><button onclick="playWorld('${w[3]}')">進入</button></div>`).join('');
}
function playWorld(type){
 document.getElementById('playCard').classList.remove('hidden');
 document.getElementById('playTitle').textContent=type;
 let data=[];
 if(type==='Supermarket') data=[...school.map(x=>[x[0],['Fruits','Vegetables','Grains','Protein','Dairy'],x[1],x[2]]) , ...extended.slice(0,4).map(x=>[x[0],['Fruits','Vegetables','Grains','Protein','Dairy'],x[1],x[2]])];
 else if(type==='Forest') data=life.map(x=>[x[0],['Place','Nature','Adjective','Nutrition'],x[1],x[2]]);
 else if(type==='Zoo') {playAnimals(); return;}
 else if(type==='School') {playGrammar(); return;}
 else {go('boss'); return;}
 document.getElementById('playBox').innerHTML=makeQuiz(data,'world_'+type,6);
 go('world');
}
function playReading(){document.getElementById('playCard').classList.remove('hidden');document.getElementById('playTitle').textContent='Reading Adventure';document.getElementById('playBox').innerHTML=makeQuiz(reading,'reading',7);go('world')}
function playGrammar(){document.getElementById('playCard').classList.remove('hidden');document.getElementById('playTitle').textContent='Grammar School';document.getElementById('playBox').innerHTML=makeQuiz(grammar,'grammar',6);go('world')}
function playAnimals(){document.getElementById('playCard').classList.remove('hidden');document.getElementById('playTitle').textContent='Animal Zoo';document.getElementById('playBox').innerHTML=makeQuiz(animals,'animal',6);go('world')}
function renderCards(){
 const all=[...school,...extended,...life];
 document.getElementById('cardBox').innerHTML=all.map((c,i)=>`<div class="wordcard"><div class="cardEmoji">${c[0].split(' ')[0]}</div><div class="en">${c[0]}</div><p class="zh">${c[2]}</p><button onclick="speak('${c[2]}')">🔊</button><button onclick="S.cards['${c[0]}']=1;save();update();toast('已收藏')">收藏</button></div>`).join('');
}
function renderReview(){
 const keys=Object.keys(S.review);
 document.getElementById('reviewBox').innerHTML=keys.length?keys.map(k=>`<div class="quest"><h3>${S.review[k]}</h3><p>錯過 ${S.wrong[k]||0} 次｜${S.reviewed[k]?'已複習 ✅':'待複習'}</p><button onclick="S.reviewed['${k}']=1;S.xp+=5;save();renderReview();update();toast('+5 XP 複習完成')">我已複習</button></div>`).join(''):'<div class="win">目前沒有錯題。很棒！</div>';
}
function renderBoss(){
 hp=210;document.getElementById('bossWin').classList.add('hidden');drawHp();
 const pool=[
  ['Which food group is milk?',['Dairy','Protein','Grains'],'Dairy','Milk is dairy.'],
  ['Which is healthier?',['whole fruit','fruit juice','fries'],'whole fruit','Whole fruit is healthier.'],
  ['I ___ going to exercise.',['am','is','are'],'am','I am.'],
  ['A group of lions is a ____.',['pride','pack','school'],'pride','Lions = pride.'],
  ['Which is an extended fruit?',['kiwi','rice','milk'],'kiwi','Kiwi is a fruit.'],
  ['Milk has ____.',['calcium','sand','paper'],'calcium','Milk has calcium.'],
  ['A group of fish is a ____.',['school','tower','pride'],'school','Fish swim in a school.']
 ];
 document.getElementById('bossBox').innerHTML=makeQuiz(pool,'boss',8)+`<button class="big" onclick="bossClear()">我完成 Boss</button>`;
}
function bossClear(){if(S.done['boss_'+today]){toast('今天 Boss 已領過')}else{S.done['boss_'+today]=1;S.coins+=120;S.xp+=60;document.getElementById('bossWin').classList.remove('hidden');save();update();toast('Boss Clear!')}}
function drawHp(){document.getElementById('hpBox').textContent='❤️❤️❤️❤️❤️❤️❤️ '+hp}
function newDiary(){document.getElementById('diaryBox').textContent=diary[Math.floor(Math.random()*diary.length)]}
function update(){
 const level=Math.floor(S.xp/300)+1;
 ['xpA','pXp'].forEach(id=>document.getElementById(id).textContent=S.xp);
 ['coinA','pCoins'].forEach(id=>document.getElementById(id).textContent=S.coins);
 document.getElementById('levelA').textContent=level;document.getElementById('pLevel').textContent=level;
 document.getElementById('streakA').textContent=S.login.streak||0;document.getElementById('pStreak').textContent=S.login.streak||0;
 document.getElementById('barA').style.width=Math.min(100,(S.xp%300)/3)+'%';
 document.getElementById('pDone').textContent=Object.keys(S.done).length+' 項｜收藏 '+Object.keys(S.cards).length+' 張';
 const vals=Object.values(S.stars);document.getElementById('pStars').textContent=vals.length?`平均 ${(vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1)} 星｜共 ${vals.length} 題`:'尚無星星紀錄';
 const w=Object.entries(S.wrong).sort((a,b)=>b[1]-a[1]).slice(0,8).map(x=>`${S.review[x[0]]||x[0]}：${x[1]}次`).join('、');document.getElementById('pWrong').textContent=w||'目前沒有明顯錯題';
 document.getElementById('pSuggest').textContent=w?'建議先玩「複習」與「自由冒險」中的弱點類別。':'可以挑戰自由冒險或 Boss Rush。';
}
function resetGame(){if(confirm('確定清除所有紀錄？')){localStorage.removeItem(STORE);location.reload()}}
renderDaily();renderQuest();renderWorld();renderCards();renderBoss();newDiary();update();
