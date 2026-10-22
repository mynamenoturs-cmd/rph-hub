import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';

const source=await fs.readFile('rph-fusion-edit.js','utf8');
const registry=new Map();
class FakeElement {
  constructor(id=''){
    this.id=id;
    this.dataset={};
    this.style={};
    this.listeners={};
    this.children=[];
    this.textContent='';
    this.value='';
    this.hidden=false;
    this.disabled=false;
    this.isConnected=true;
    this.attributes={};
    this.classSet=new Set();
    this.classList={
      contains:name=>this.classSet.has(name),
      add:name=>this.classSet.add(name),
      remove:name=>this.classSet.delete(name)
    };
    if(id)registry.set(id,this);
  }
  set innerHTML(value){
    this.html=String(value);
    for(const match of this.html.matchAll(/\bid="([^"]+)"/g)){
      if(registry.has(match[1]))continue;
      const child=new FakeElement(match[1]);
      this.children.push(child);
    }
  }
  get innerHTML(){return this.html||'';}
  addEventListener(name,fn){(this.listeners[name]||=[]).push(fn);}
  trigger(name){return (this.listeners[name]||[]).map(fn=>fn());}
  click(){return this.trigger('click');}
  querySelector(selector){return selector.startsWith('#')?registry.get(selector.slice(1))||null:null;}
  getAttribute(name){return this.attributes[name]||null;}
  setAttribute(name,value){this.attributes[name]=value;}
  hasAttribute(name){return name in this.attributes;}
  contains(other){return other===this||this.children.includes(other)||other===editable;}
  focus(){this.focused=true;}
  appendChild(el){this.children.push(el);return el;}
  insertBefore(el){this.children.push(el);return el;}
  querySelectorAll(selector){return this.id==='rphPreview'&&selector==='[data-rph-edit]'?[editable]:[];}
}
const body=new FakeElement();
const head=new FakeElement();
const preview=new FakeElement('rphPreview');
preview.parentElement=new FakeElement();
const editable=new FakeElement();
editable.attributes['data-rph-edit']='support.0.text';
editable.innerText='Murid menyebut jawapan.';
editable.textContent=editable.innerText;
const currentRph={edited:{}};
const messages=[];
const requests=[];
const fakeFetch=async (url,opts={})=>{
  requests.push({url,opts});
  if(url==='/api/fusion/health')return Response.json({ok:true,ready:true});
  if(url==='/api/fusion/edit'){
    assert.equal(opts.headers.authorization,'Bearer teacher-jwt');
    const input=JSON.parse(opts.body);
    assert.equal(input.blocks.length,1);
    return Response.json({ok:true,changed:[0],blocks:[{
      kind:'p',text:'Murid menyebut dan menerangkan jawapan.'
    }],violations:[],ms:15});
  }
  throw Error('Unexpected request: '+url);
};
const fakeDocument={
  readyState:'complete',
  body,head,
  getElementById:id=>registry.get(id)||null,
  createElement:()=>new FakeElement(),
  addEventListener:()=>{}
};
const context={
  window:{__rphFusionEdit:false,toast:(...args)=>messages.push(args),confirm:()=>true},
  document:fakeDocument,
  fetch:fakeFetch,
  state:{currentGeneratedRph:currentRph,client:{auth:{getSession:async()=>({
    data:{session:{access_token:'teacher-jwt'}}
  })}}},
  location:{origin:'https://rph-hub.pages.dev'},
  localStorage:{getItem:()=>null},
  MutationObserver:class {observe(){}},
  AbortSignal,
  console
};
vm.runInNewContext(source,context,{filename:'rph-fusion-edit.js'});
// boot() awaits health: allow the microtask and toolbar/panel initialization.
for(let i=0;i<8;i++)await Promise.resolve();
const open=registry.get('fusionOpen');
const run=registry.get('fusionRun');
const apply=registry.get('fusionApply');
const close=registry.get('fusionClose');
assert.ok(open,'Fusion toolbar was not created');
assert.equal(open.listeners.click?.length,1,'Open button must have exactly one listener');
assert.equal(run.listeners.click?.length,1,'Lazy Run button must be bound');
assert.equal(apply.listeners.click?.length,1,'Lazy Apply button must be bound');
assert.equal(close.listeners.click?.length,1,'Lazy Close button must be bound');

open.click();
assert.equal(registry.get('fusionPanel').classList.contains('hidden'),false);
assert.match(registry.get('fusionStatus').textContent,/Bersedia/);
registry.get('fusionInstruction').value='Perincikan aktiviti murid.';
const running=run.click();
assert.equal(run.disabled,true,'Run must disable immediately');
assert.equal(registry.get('fusionProgress').dataset.state,'busy','Spinner must become active');
assert.match(registry.get('fusionStatus').textContent,/Menyemak sesi|menyunting/);
await Promise.all(running);
assert.equal(run.disabled,false);
assert.equal(apply.disabled,false);
assert.equal(registry.get('fusionProgress').dataset.state,'success');
assert.match(registry.get('fusionStatus').textContent,/Selesai/);
assert.equal(requests.filter(r=>r.url==='/api/fusion/edit').length,1);

apply.click();
assert.equal(editable.textContent,'Murid menyebut dan menerangkan jawapan.');
close.click();
assert.equal(registry.get('fusionPanel').classList.contains('hidden'),true);
console.log('Fusion panel event wiring, progress, request, apply, close PASS');