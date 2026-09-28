const display = document.getElementById('display');
const expressionEl = document.getElementById('expression');
const historyList = document.getElementById('historyList');
const historyPanel = document.getElementById('historyPanel');
let current = '0', previous = null, operator = null, shouldReset = false, memory = 0;
let history = [];

const pretty = n => {
  if (!Number.isFinite(n)) return 'Error';
  if (Object.is(n, -0)) n = 0;
  return Number.parseFloat(n.toPrecision(12)).toString();
};
const number = () => Number(current);
function update(){ display.textContent = current; }
function clearAll(){ current='0'; previous=null; operator=null; shouldReset=false; expressionEl.textContent='Ready when you are'; update(); }
function inputDigit(d){
  if(current==='Error' || shouldReset){ current=d; shouldReset=false; }
  else if(current==='0') current=d;
  else if(current.replace('-','').length<16) current+=d;
  update();
}
function decimal(){
  if(current==='Error'||shouldReset){current='0.';shouldReset=false;}
  else if(!current.includes('.')) current+='.';
  update();
}
function chooseOperator(op){
  if(current==='Error') return;
  if(operator && !shouldReset) calculate(false);
  previous=number(); operator=op; shouldReset=true;
  expressionEl.textContent=`${pretty(previous)} ${op}`;
}
function calculate(save=true){
  if(operator===null || previous===null) return;
  const a=previous,b=number(); let result;
  if(operator==='+') result=a+b;
  if(operator==='−') result=a-b;
  if(operator==='×') result=a*b;
  if(operator==='÷') result=b===0?NaN:a/b;
  const exp=`${pretty(a)} ${operator} ${pretty(b)}`;
  current=pretty(result); expressionEl.textContent=exp;
  if(save) addHistory(exp,current);
  previous=null;operator=null;shouldReset=true;update();
}
function unary(action){
  if(current==='Error') return;
  const n=number(); let result=n, label='';
  if(action==='sqrt'){ result=n<0?NaN:Math.sqrt(n);label=`√(${pretty(n)})`; }
  if(action==='square'){result=n*n;label=`(${pretty(n)})²`;}
  if(action==='reciprocal'){result=n===0?NaN:1/n;label=`1 ÷ ${pretty(n)}`;}
  if(action==='percent'){result=n/100;label=`${pretty(n)}%`;}
  if(action==='sign'){result=-n;}
  if(action==='pi'){current=pretty(Math.PI);shouldReset=true;expressionEl.textContent='π';update();return;}
  current=pretty(result); expressionEl.textContent=label || 'Sign changed';shouldReset=true;update();
}
function backspace(){
  if(shouldReset||current==='Error'){current='0';shouldReset=false;}
  else {current=current.length<=1 || (current.length===2&&current[0]==='-')?'0':current.slice(0,-1);}
  update();
}
function addHistory(exp,res){
  if(res==='Error') return;
  history.unshift({exp,res}); history=history.slice(0,30); renderHistory();
}
function renderHistory(){
  if(!history.length){historyList.innerHTML='<div class="empty-history"><span>◷</span><p>Your calculations will appear here.</p></div>';return;}
  historyList.innerHTML='';
  history.forEach((item,i)=>{
    const btn=document.createElement('button');btn.className='history-item';
    const exp=document.createElement('span');exp.className='history-expression';exp.textContent=item.exp;
    const res=document.createElement('span');res.className='history-result';res.textContent='= '+item.res;
    btn.append(exp,res);btn.addEventListener('click',()=>{current=item.res;previous=null;operator=null;shouldReset=true;expressionEl.textContent=item.exp;update();});
    historyList.appendChild(btn);
  });
}
function action(name){
  switch(name){
    case 'clear':clearAll();break;
    case 'backspace':backspace();break;
    case 'decimal':decimal();break;
    case 'equals':calculate();break;
    case 'percent':unary('percent');break;
    case 'sign':unary('sign');break;
    case 'sqrt':unary('sqrt');break;
    case 'square':unary('square');break;
    case 'reciprocal':unary('reciprocal');break;
    case 'pi':unary('pi');break;
    case 'mc':memory=0;break;
    case 'mr':current=pretty(memory);shouldReset=true;update();break;
    case 'mplus':memory+=number();break;
    case 'mminus':memory-=number();break;
    case 'ms':memory=number();break;
  }
}
document.getElementById('keys').addEventListener('click',e=>{
  const btn=e.target.closest('button');if(!btn)return;
  if(btn.dataset.value!==undefined){
    const v=btn.dataset.value;
    if('0123456789'.includes(v)&&v.length===1)inputDigit(v);else chooseOperator(v);
  }else action(btn.dataset.action);
});
document.querySelectorAll('.mini-key,.extra-key').forEach(btn=>btn.addEventListener('click',()=>action(btn.dataset.action)));
document.getElementById('themeToggle').addEventListener('click',()=>document.body.classList.toggle('light'));
document.getElementById('historyToggle').addEventListener('click',()=>historyPanel.classList.toggle('history-hidden'));
document.getElementById('clearHistory').addEventListener('click',()=>{history=[];renderHistory();});
document.addEventListener('keydown',e=>{
  if(e.ctrlKey||e.metaKey||e.altKey)return;
  if(/^[0-9]$/.test(e.key)){inputDigit(e.key);return;}
  if(e.key==='.'||e.key===','){decimal();return;}
  const ops={'+':'+','-':'−','*':'×','/':'÷'};
  if(ops[e.key]){e.preventDefault();chooseOperator(ops[e.key]);return;}
  if(e.key==='Enter'||e.key==='='){e.preventDefault();calculate();return;}
  if(e.key==='Backspace'){backspace();return;}
  if(e.key==='Escape'||e.key==='Delete'){clearAll();return;}
  if(e.key==='%'){unary('percent');}
});
