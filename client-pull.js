(() => {
  const DB_KEY='santorytec.browser.v1';
  const DRAFT_KEY=`santorytec.report.${location.pathname.split('/').pop()}`;
  const report=document.querySelector('#relatorio, #form-container, #osGeralForm')||document.body;
  const labels=[...document.querySelectorAll('label')];
  const byLabel=part=>{const label=labels.find(x=>x.textContent.trim().toLocaleLowerCase('pt-BR').includes(part));return label?.querySelector('input,textarea,select')||(label?.nextElementSibling?.matches('input,textarea,select')?label.nextElementSibling:null)};
  const nameInput=report.querySelector('[name="cliente_nome"],#cliente_nome')||byLabel('nome do cliente')||byLabel('cliente')||report.querySelector('.topfields .field input[type="text"]');
  const phoneInput=report.querySelector('[name="cliente_fone"],#cliente_fone')||byLabel('telefone / whatsapp')||byLabel('telefone');
  if(!nameInput)return;
  let idInput=report.querySelector('[name="cliente_id"],#santoryClientId');
  if(!idInput){
    const host=nameInput.closest('.field')||nameInput.parentElement,field=document.createElement('div');
    const label=document.createElement('label');label.textContent='ID DO CLIENTE NO SISTEMA';
    const select=document.createElement('select');select.id='santoryClientId';select.name='cliente_id';select.setAttribute('aria-label','Escolher ID do cliente');
    field.className=host.className||'field';field.classList.add('client-id-field');field.append(label,select);
    if(host.classList.contains('col-span-7')){host.classList.remove('col-span-7');host.classList.add('col-span-5');field.className='col-span-2 client-id-field';host.insertAdjacentElement('afterend',field)}
    else host.insertAdjacentElement('afterend',field);
    idInput=select;
  }else if(idInput.tagName!=='SELECT'){
    const select=document.createElement('select');select.id=idInput.id||'santoryClientId';select.name=idInput.name||'cliente_id';select.className=idInput.className;select.setAttribute('aria-label','Escolher ID do cliente');idInput.replaceWith(select);idInput=select;
  }
  const style=document.createElement('style');style.textContent=`
    .client-id-field label{font-weight:700!important;color:#0b6473!important}
    .client-id-field select{font-weight:800!important;letter-spacing:.35px;color:#075b68!important;background:#eef8f6!important}
    @media screen{body{padding:12px!important;background:#f1f5f7!important}.sheet{width:min(100%,1220px)!important;max-width:1220px!important;min-height:0!important;height:auto!important;margin:10px auto!important;padding:24px!important;overflow:visible!important}.a4-page{width:min(100%,980px)!important;max-width:980px!important;min-height:0!important;height:auto!important;margin:10px auto!important;padding:26px!important;display:block!important}.topfields{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:9px!important}.field label,label{font-size:11px!important;line-height:1.35!important}input,textarea,select{height:auto!important;min-height:34px!important;padding:7px 9px!important;font-size:12px!important;border-radius:6px!important}textarea{min-height:58px!important}th,td{font-size:11px!important;padding:6px!important}h1{font-size:22px!important}h2,.st{font-size:14px!important}.toolbar,.actions{position:sticky!important;top:0!important;z-index:20!important;flex-wrap:wrap!important}.grid,.columns,.grid2,.grid3{gap:10px!important}}
    @media screen and (max-width:700px){body{padding:6px!important}.sheet,.a4-page{padding:14px!important}.topfields{grid-template-columns:repeat(2,minmax(0,1fr))!important}.columns{display:block!important}.columns>div{min-width:0!important}.grid,.grid2,.grid3{grid-template-columns:1fr 1fr!important}.toolbar button,.actions button{padding:8px 10px!important}}
  `;document.head.appendChild(style);
  let clients=[];
  const ping=el=>{el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}))};
  const fill=client=>{if(!client)return;nameInput.value=client.name||'';idInput.value=String(client.publicId||'');if(phoneInput)phoneInput.value=client.phone||'';[nameInput,phoneInput].filter(Boolean).forEach(ping);idInput.dispatchEvent(new Event('input',{bubbles:true}))};
  const sendSelection=client=>window.parent.postMessage({type:'santory-report-client-change',clientId:client?.id||''},'*');
  idInput.addEventListener('change',()=>{const client=clients.find(c=>String(c.publicId)===String(idInput.value));if(client)fill(client);else{nameInput.value='';if(phoneInput)phoneInput.value='';[nameInput,phoneInput].filter(Boolean).forEach(ping)}sendSelection(client)});
  window.addEventListener('message',event=>{
    if(event.source!==window.parent)return;
    if(event.data?.type==='santory-clients-sync'){
      clients=Array.isArray(event.data.clients)?[...event.data.clients].sort((a,b)=>String(a.publicId||'').localeCompare(String(b.publicId||''))):[];
      idInput.replaceChildren(new Option('Escolha o ID do cliente',''));
      clients.forEach(c=>idInput.add(new Option(`ID ${c.publicId||'—'} · ${c.name||'Cliente'}`,String(c.publicId||''))));
      const selected=clients.find(c=>c.id===event.data.selectedId);
      if(selected)fill(selected);else if(!idInput.value)idInput.value='';
    }
  });
  const controls=[...report.querySelectorAll('input,textarea,select')];
  controls.forEach((el,i)=>el.dataset.reportIndex=String(i));
  try{const saved=JSON.parse(localStorage.getItem(DRAFT_KEY)||'null');if(Array.isArray(saved))saved.forEach(item=>{const el=controls[Number(item.index)];if(!el)return;if(el.type==='checkbox'||el.type==='radio')el.checked=!!item.checked;else el.value=item.value??''})}catch{}
  const save=()=>{const data=controls.map(el=>({index:Number(el.dataset.reportIndex),value:el.value,checked:el.checked}));try{localStorage.setItem(DRAFT_KEY,JSON.stringify(data))}catch{}};
  report.addEventListener('input',save);report.addEventListener('change',save);
  try{const data=JSON.parse(localStorage.getItem(DB_KEY)||'{}'),selected=data.clients?.find(c=>c.id===localStorage.getItem('santorytec.activeClientId'));if(selected)fill(selected)}catch{}
})();
