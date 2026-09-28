// Explicitly simulated collaboration; no other person is connected.
const collaborationRuns={};
function srsCollaborationDemo(){
 if(current().approved)return toast('The approved baseline is read-only.');
 sectionSave();const key=sectionKey();if(collaborationRuns[key])return showSectionVersions();
 const initial=docs()[sectionIndex];if(!sectionVersions[key]?.length)recordSectionVersion('Before collaboration demo',[{type:'paragraph',text:initial}]);
 const examples=[['Maya Chen','MC','Clarified the review workflow.','Stakeholders review the requirements and confirm unresolved questions before baseline approval.'],['Alex Morgan','AM','Added an engineering acceptance condition.','Acceptance condition: each approved requirement has a unique identifier and can be traced to its associated test cases.']];
 let text=initial;
 for(const [author,initials,reason,addition] of examples){text+='\n\n'+addition;const html='<p>'+esc(text).replaceAll('\n','<br>')+'</p>';sectionVersions[key].push({time:new Date().toISOString(),author:author+' (demo)',reason:'Simulated collaboration · '+reason,blocks:[{type:'paragraph',text}],text,html});docs()[sectionIndex]=text;richSections[key]={plain:text,html};}
 collaborationRuns[key]=true;current().reviewed=false;render();toast('Two demo edits saved. Open version history to compare both authors.');
}
const srsBeforeCollaboration=blueprintPageRoutes.srs;
blueprintPageRoutes.srs=function(){let html=srsBeforeCollaboration();const ran=collaborationRuns[sectionKey()];const banner='<section class="collaboration-demo" aria-label="Collaboration demo"><div class="collaboration-people"><span class="collab-avatar self" title="You">'+esc(profile.name.split(' ').map(x=>x[0]).slice(0,2).join(''))+'</span><span class="collab-avatar maya" title="Maya Chen — simulated editor">MC</span><span class="collab-avatar alex" title="Alex Morgan — simulated editor">AM</span><div><strong>Collaboration demo</strong><p>You · Maya Chen · Alex Morgan</p></div></div><div class="collaboration-actions"><span class="sub">'+(ran?'Both demo edits are saved in version history.':'Simulate two teammates editing this section.')+'</span><button '+(current().approved?'disabled':'')+' onclick="srsCollaborationDemo()">'+(ran?'View team edits':'Play collaboration demo')+'</button></div><p class="collab-notice">Simulated users · Adds example text to this draft section. Your original version stays in history. No live collaborators are connected.</p>'+(ran?'<div class="collab-activity"><span><b>Maya Chen (demo)</b> clarified the review workflow</span><span><b>Alex Morgan (demo)</b> added an acceptance condition</span></div>':'')+'</section>';return html.replace('<div class="srs-workspace',banner+'<div class="srs-workspace');};
Object.assign(localizedLabels,{'Collaboration demo':'共同編集デモ','Play collaboration demo':'共同編集デモを再生','View team edits':'チームの編集を表示','Simulate two teammates editing this section.':'2人のメンバーによるセクション編集をシミュレーションします。','Both demo edits are saved in version history.':'2人のデモ編集はバージョン履歴に保存されています。','Simulated users · Adds example text to this draft section. Your original version stays in history. No live collaborators are connected.':'ユーザーはシミュレーションです。この下書きにサンプル文を追加します。元の内容は履歴に保持されます。実際の共同編集接続はありません。'});
render();
// Figma-style presence simulation, anchored to actual text ranges.
let cursorDemoActive=false,cursorDemoTick=0,cursorDemoTimer=null;
srsCollaborationDemo=function(){cursorDemoActive=!cursorDemoActive;cursorDemoTick=0;clearInterval(cursorDemoTimer);render();if(cursorDemoActive){drawDemoCursors();cursorDemoTimer=setInterval(()=>{if(screen==='srs'){cursorDemoTick++;drawDemoCursors();}},2600);}};
function drawDemoCursors(){
 document.querySelectorAll('.remote-presence-layer').forEach(el=>el.remove());
 if(!cursorDemoActive||screen!=='srs')return;
 const editor=document.getElementById('srsRichEditor');if(!editor)return;
 const host=editor.parentElement;host.classList.add('remote-presence-host');
 const layer=document.createElement('div');layer.className='remote-presence-layer';layer.setAttribute('aria-hidden','true');
 const hostRect=host.getBoundingClientRect(),bounds=editor.getBoundingClientRect();
 layer.style.cssText='left:'+(bounds.left-hostRect.left)+'px;top:'+(bounds.top-hostRect.top)+'px;width:'+bounds.width+'px;height:'+bounds.height+'px';
 const walker=document.createTreeWalker(editor,NodeFilter.SHOW_TEXT),nodes=[];let node;while(node=walker.nextNode())if(node.textContent.trim())nodes.push(node);
 [['Maya Chen','#8b5cf6'],['Alex Morgan','#089981']].forEach(([name,color],i)=>{
 let x=30+i*120,y=40+i*65,rects=[];
 if(nodes.length){const n=nodes[(i+cursorDemoTick)%nodes.length],length=n.textContent.length;const start=Math.min(Math.floor(length*((cursorDemoTick%3)*.18+i*.12)),Math.max(0,length-1));const range=document.createRange();range.setStart(n,start);range.setEnd(n,Math.min(length,start+Math.max(1,Math.min(26,length-start))));rects=[...range.getClientRects()];const r=rects[0];if(r){x=r.left-bounds.left;y=r.top-bounds.top;}}
 if(y<0||y>bounds.height-30)return;
 for(const r of rects){if(r.bottom<bounds.top||r.top>bounds.bottom)continue;const selection=document.createElement('span');selection.className='remote-text-selection';selection.style.cssText='left:'+(r.left-bounds.left)+'px;top:'+(r.top-bounds.top)+'px;width:'+r.width+'px;height:'+r.height+'px;background:'+color+'25;border-bottom:2px solid '+color;layer.append(selection);}
 const cursor=document.createElement('div');cursor.className='remote-named-cursor';cursor.style.cssText='--person-color:'+color+';left:'+Math.max(8,Math.min(x,bounds.width-155))+'px;top:'+Math.max(5,Math.min(y,bounds.height-48))+'px';cursor.innerHTML='<svg width="18" height="23" viewBox="0 0 18 23"><path d="M1 1v18l5-5 4 8 4-2-4-7h7Z" fill="'+color+'" stroke="white" stroke-width="1.5"/></svg><span>'+name+'<small>'+(cursorDemoTick%2?'Selecting text':'Typing…')+'</small></span><i></i>';layer.append(cursor);
 });host.append(layer);
}
const srsWithPresenceBase=blueprintPageRoutes.srs;
blueprintPageRoutes.srs=function(){return srsWithPresenceBase().replace('Simulate two teammates editing this section.','See named cursors and selections inside the editor.').replace('Adds example text to this draft section. Your original version stays in history.','Cursor movements and selections are simulated; your text is unchanged.').replace('Play collaboration demo',cursorDemoActive?'Stop cursor demo':'Show live cursor demo').replace('View team edits',cursorDemoActive?'Stop cursor demo':'Show live cursor demo');};
const renderBeforePresence=render;render=function(){renderBeforePresence();if(screen==='srs'&&cursorDemoActive)requestAnimationFrame(drawDemoCursors);else document.querySelectorAll('.remote-presence-layer').forEach(el=>el.remove());};
document.addEventListener('scroll',e=>{if(e.target?.id==='srsRichEditor')drawDemoCursors();},true);
window.addEventListener('resize',drawDemoCursors);
Object.assign(localizedLabels,{'Show live cursor demo':'共同編集カーソルのデモを表示','Stop cursor demo':'カーソルデモを停止','See named cursors and selections inside the editor.':'エディター内に名前付きカーソルと選択範囲を表示します。'});
render();
