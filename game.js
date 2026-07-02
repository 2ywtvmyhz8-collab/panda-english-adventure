let S=JSON.parse(localStorage.getItem('fox_unit3_review_preview_v2')||'{"xp":0,"correct":0,"wrong":0,"learned":{},"preview":false,"answered":{},"weak":{},"lastTopic":"mixed","lastMode":"choice"}');
function $(id){return document.getElementById(id)}
function save(){localStorage.setItem('fox_unit3_review_preview_v2',JSON.stringify(S))}
function shuffle(a){return[...a].sort(()=>Math.random()-.5)}
function toast(m){let t=$('toast');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1300)}
function speak(text){let u=new SpeechSynthesisUtterance(text);u.lang='en-US';u.rate=.85;speechSynthesis.speak(u)}
function showScreen(id){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));$(id).classList.add('active');window.scrollTo(0,0);updateDashboard()}
function updateStats(){$('xp').textContent=S.xp;$('correct').textContent=S.correct;$('wrong').textContent=S.wrong;$('learnedCount').textContent=Object.keys(S.learned).length;save()}
function updateDashboard(){
 $('dXp').textContent=S.xp;
 $('dAccuracy').textContent=`答對 ${S.correct}｜答錯 ${S.wrong}`;
 $('dLearned').textContent=`已看過 ${Object.keys(S.learned).length} 張學習卡`;
 $('dPreview').textContent=S.preview?'今天已完成預習 ✅':'尚未完成預習';
 const weak=Object.entries(S.weak).sort((a,b)=>b[1]-a[1]).slice(0,6).map(x=>`${x[0]}：${x[1]}次`).join('、');
 $('dWeak').textContent=weak||'目前沒有明顯弱點';
 $('dSuggest').textContent=weak?'建議先用「反向題」或「填空題」重練弱點。':'可以用隨機挑戰增加新鮮感。';
 updateStats();
}
function renderLearn(){
 $('learnCards').innerHTML=LEARN_CARDS.map(c=>`<div class="learnCard"><div class="emoji">${c.emoji}</div><div class="en">${c.en}</div><p class="zh">${c.zh}<br>${c.sentence}<br><b>${c.type}</b></p><button onclick='speak(${JSON.stringify(c.en)})'>🔊 單字</button><button onclick='speak(${JSON.stringify(c.sentence)})'>🔊 句子</button><button onclick="markLearned('${c.id}')">${S.learned[c.id]?'已看過 ✅':'我看過了'}</button></div>`).join('')
}
function markLearned(id){if(!S.learned[id]){S.learned[id]=1;S.xp+=3;toast('+3 XP')}renderLearn();updateStats()}
function renderPreview(){
 $('previewCards').innerHTML=PREVIEW_CARDS.map(c=>`<div class="learnCard"><div class="emoji">${c.emoji}</div><div class="en">${c.en}</div><p class="zh">${c.zh}<br>${c.sentence}</p><button onclick='speak(${JSON.stringify(c.en)})'>🔊 單字</button><button onclick='speak(${JSON.stringify(c.sentence)})'>🔊 句子</button></div>`).join('')
 renderPreviewPractice('choice');
}
function markPreviewDone(){if(!S.preview){S.preview=true;S.xp+=10;toast('預習完成 +10 XP')}updateDashboard()}
function renderDiscovery(){
 $('discoveryCards').innerHTML=DISCOVERY_CARDS.map(c=>`<div class="miniCard"><div class="emoji">${c.emoji}</div><div class="en">${c.en}</div><p class="zh">${c.zh}<br>${c.sentence}</p><button onclick='speak(${JSON.stringify(c.sentence)})'>🔊</button></div>`).join('')
}
function norm(q){return {q:q[0],ans:q[1],choices:q[2],hint:q[3]}}
function getPool(type){
 if(type==='food')return FOOD_QUESTIONS.map(norm);
 if(type==='grammar')return GRAMMAR_QUESTIONS.map(norm);
 if(type==='reading')return READING_QUESTIONS.map(norm);
 if(type==='animals')return ANIMAL_QUESTIONS.map(norm);
 return [...FOOD_QUESTIONS,...GRAMMAR_QUESTIONS,...READING_QUESTIONS,...ANIMAL_QUESTIONS].map(norm);
}
function newPractice(mode){renderReview(S.lastTopic||'mixed',mode)}
function renderReview(type='mixed',mode='choice'){
 S.lastTopic=type;S.lastMode=mode;save();
 let pool=shuffle(getPool(type)).slice(0,type==='mixed'?24:16);
 if(mode==='challenge'){
   const modes=['choice','reverse','fill','truefalse'];
   $('reviewBox').innerHTML=pool.map((q,i)=>makeQuestion(q,type+'_'+modes[i%modes.length],i,modes[i%modes.length])).join('');
 }else{
   $('reviewBox').innerHTML=pool.map((q,i)=>makeQuestion(q,type,i,mode)).join('');
 }
}
function makeQuestion(q,keyPrefix,i,mode='choice'){
 const key=keyPrefix+'_'+mode+'_'+i+'_'+q.q.slice(0,12);
 if(mode==='reverse')return makeReverse(q,key,i);
 if(mode==='fill')return makeFill(q,key,i);
 if(mode==='truefalse')return makeTF(q,key,i);
 return makeChoice(q,key,i);
}
function makeChoice(q,key,i){
 const choices=shuffle(q.choices);
 return `<div class="q" data-attempts="1"><span class="smallTag">選擇題</span><h3>${q.q}</h3>${choices.map(c=>`<button class="choice" onclick='answerChoice(this,${JSON.stringify(c)},${JSON.stringify(q.ans)},${JSON.stringify(key)},${JSON.stringify(q.q)})'>${c}</button>`).join('')}<div class="hint hidden">💡 ${q.hint}</div></div>`;
}
function makeReverse(q,key,i){
 const wrongQs=shuffle(getPool('mixed').map(x=>x.q).filter(x=>x!==q.q)).slice(0,3);
 const choices=shuffle([q.q,...wrongQs]);
 return `<div class="q" data-attempts="1"><span class="smallTag">反向題</span><h3>答案是：<b>${q.ans}</b><br>這是在問哪一題？</h3>${choices.map(c=>`<button class="choice" onclick='answerChoice(this,${JSON.stringify(c)},${JSON.stringify(q.q)},${JSON.stringify(key)},${JSON.stringify(q.q)})'>${c}</button>`).join('')}<div class="hint hidden">💡 ${q.hint}</div></div>`;
}
function makeFill(q,key,i){
 let sentence=q.q;
 if(q.q.includes('= ?')) sentence=q.q.replace('= ?','= ______');
 else if(q.q.includes('______')) sentence=q.q;
 else sentence=q.q+' → ______';
 return `<div class="q" data-attempts="1"><span class="smallTag">填空題</span><h3>${sentence}</h3><input class="inputBox" id="input_${key}" placeholder="輸入答案，可大小寫不同"><button onclick='answerFill(${JSON.stringify(key)},${JSON.stringify(q.ans)},${JSON.stringify(q.q)})'>檢查</button><div class="hint hidden">💡 ${q.hint}<br>答案：${q.ans}</div></div>`;
}
function makeTF(q,key,i){
 let statement,ans;
 if(Math.random()<0.5){statement=`${q.q} → ${q.ans}`;ans='True'}else{let wrong=shuffle(q.choices.filter(x=>x!==q.ans))[0]||'wrong';statement=`${q.q} → ${wrong}`;ans='False'}
 return `<div class="q" data-attempts="1"><span class="smallTag">True / False</span><h3>${statement}</h3><button class="choice" onclick='answerChoice(this,"True",${JSON.stringify(ans)},${JSON.stringify(key)},${JSON.stringify(q.q)})'>True</button><button class="choice" onclick='answerChoice(this,"False",${JSON.stringify(ans)},${JSON.stringify(key)},${JSON.stringify(q.q)})'>False</button><div class="hint hidden">💡 ${q.hint}</div></div>`;
}
function answerChoice(btn,choice,ans,key,label){
 const box=btn.parentElement;if(btn.disabled)return;
 if(choice===ans){btn.classList.add('correct');box.querySelectorAll('button').forEach(b=>b.disabled=true);scoreCorrect(key)}
 else{btn.classList.add('wrongBtn');btn.disabled=true;markWrong(box,label)}
 updateDashboard();checkBossDone();
}
function answerFill(key,ans,label){
 const input=$('input_'+key); const box=input.parentElement;
 let val=input.value.trim().toLowerCase();
 if(!val){toast('先輸入答案');return}
 if(val===ans.toLowerCase()){input.style.borderColor='#16a34a';scoreCorrect(key);box.querySelectorAll('button,input').forEach(x=>x.disabled=true)}
 else{input.style.borderColor='#ef4444';markWrong(box,label)}
 updateDashboard();checkBossDone();
}
function scoreCorrect(key){if(!S.answered[key]){S.answered[key]=1;S.correct++;S.xp+=10;toast('Correct +10 XP')}else toast('已答對過 ✅')}
function markWrong(box,label){S.wrong++;S.weak[label]=(S.weak[label]||0)+1;let n=Number(box.dataset.attempts||1)+1;box.dataset.attempts=n;if(n>=3)box.querySelector('.hint').classList.remove('hidden');toast('再想一下')}
function renderPreviewPractice(mode='choice'){
 const qs=PREVIEW_CARDS.map(c=>({q:`${c.emoji} ${c.en} means ?`,ans:c.zh,choices:PREVIEW_CARDS.map(x=>x.zh),hint:c.sentence}));
 if(mode==='match'){
   $('previewPractice').innerHTML=shuffle(qs).map((q,i)=>makeReverse(q,'preview_match_'+i,i)).join('');
 }else if(mode==='truefalse'){
   $('previewPractice').innerHTML=shuffle(qs).map((q,i)=>makeTF(q,'preview_tf_'+i,i)).join('');
 }else{
   $('previewPractice').innerHTML=shuffle(qs).map((q,i)=>makeChoice(q,'preview_choice_'+i,i)).join('');
 }
}
function renderBoss(){const pool=shuffle(getPool('mixed')).slice(0,20);$('bossBox').innerHTML=pool.map((q,i)=>makeQuestion(q,'boss',i,['choice','reverse','fill','truefalse'][i%4])).join('')}
function checkBossDone(){const total=document.querySelectorAll('#bossBox .q').length;const done=document.querySelectorAll('#bossBox .q .correct, #bossBox input:disabled').length;if(total&&done>=total)$('bossDone').classList.remove('hidden')}
function resetAll(){localStorage.removeItem('fox_unit3_review_preview_v2');location.reload()}
renderLearn();renderPreview();renderDiscovery();renderReview('mixed','choice');renderBoss();updateDashboard();