// Place page-level workflow actions in the heading, preserving handlers and forms.
function actionsAtTop(html,route){
 const template=document.createElement('template');template.innerHTML=html;
 const root=template.content,heading=root.querySelector('.page-head');
 if(!heading)return html;
 let actions=heading.querySelector('.actions');
 if(!actions){actions=document.createElement('div');actions.className='actions';heading.append(actions);}
 actions.classList.add('page-top-actions');
 const groups=route==='request'?[]:[...root.querySelectorAll('.page-actions,.request-bottom,.context-summary')];
 for(const group of groups){
  for(const control of [...group.children].filter(node=>node.matches('button,a'))){
   const form=control.closest('form');
   if(form&&control.tagName==='BUTTON'&&control.getAttribute('type')!=='button'){
    if(!form.id)form.id='page-action-form';
    control.setAttribute('form',form.id);
   }
   actions.append(control);
  }
  if(!group.textContent.trim()&&!group.children.length)group.remove();
 }
 // Keep the forward action at the far right after secondary actions and exports.
 const forward=[...actions.children].filter(node=>/^(Continue|Review baseline|Approve|Generate.*timeline|View (quality|traceability))/.test(node.textContent.trim()));
 forward.forEach(node=>actions.append(node));
 const previous=workflowPrevious[route];
 if(previous){
  const back=document.createElement('button');back.type='button';back.className='workflow-back';
  const label='← Back to '+previous[1];
  const accessibleLabel=interfaceLanguage==='ja'?(localizedLabels[label]||label):label;
  back.setAttribute('aria-label',accessibleLabel);back.title=accessibleLabel;
  back.innerHTML='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m14 6-6 6 6 6"/></svg>';
  back.setAttribute('onclick',"navigate('"+previous[0]+"')");
  heading.classList.add('has-workflow-back');heading.prepend(back);
 }
 return template.innerHTML;
}
const workflowPrevious={
 request:['projects','projects'],srs:['request','request'],baseline:['srs','SRS'],
 requirements:['baseline','baseline'],stories:['requirements','requirements'],
 timeline:['stories','user stories'],'timeline-result':['timeline','configuration'],
 architecture:['timeline-result','timeline'],tests:['architecture','architecture'],
 quality:['tests','test cases'],traceability:['quality','quality assurance']
};
Object.assign(localizedLabels,{'← Back to projects':'← プロジェクトに戻る','← Back to request':'← リクエストに戻る','← Back to SRS':'← SRSに戻る','← Back to baseline':'← ベースラインに戻る','← Back to requirements':'← 要件管理に戻る','← Back to user stories':'← ユーザーストーリーに戻る','← Back to configuration':'← 設定に戻る','← Back to timeline':'← スケジュールに戻る','← Back to architecture':'← アーキテクチャに戻る','← Back to test cases':'← テストケースに戻る','← Back to quality assurance':'← 品質保証に戻る'});
const topActionRoutes = new Set(['request','srs','baseline','requirements','stories','timeline','timeline-result','architecture','tests','quality','traceability']);
for(const [route,page] of Object.entries(blueprintPageRoutes)){
 if(!topActionRoutes.has(route))continue;
 blueprintPageRoutes[route]=function(...args){return actionsAtTop(page.apply(this,args),route);};
}
render();
