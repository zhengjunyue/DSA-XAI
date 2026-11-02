'use strict';
const datasets = {
  torgo: {name:'TORGO', classes:4, labels:'Typical, Mild, Moderate, Severe', insight:'For LR and MLP, supportive deletion lowers mean target-class accuracy as the deletion fraction increases, while counteracting deletion generally preserves or improves it. Whisper-based CNN curves are less regular. Inspect the individual classes to see which groups drive each average.'},
  uaspeech: {name:'UASpeech', classes:5, labels:'Low, Medium, High, Very High, Typical', insight:'LR and MLP show a clear separation between supportive deletion and the other strategies, particularly at larger deletion fractions. The Whisper-based CNN curves are more variable, including an initial rise after supportive deletion. The mean therefore should be read alongside the class-wise results.'}
};
const modelNames = {lr:'LR', mlp:'MLP', cnn:'CNN'};
const representationNames = {fbank:'FBank', whisper:'Whisper'};
const $ = id => document.getElementById(id);
let state = {dataset:'torgo', view:'average', representation:'fbank', classifier:'lr', scope:'full'};
let currentImage = '';
let toastTimer;
const dialog = $('image-dialog');

function readLocation() {
  const params = new URLSearchParams(location.search);
  for (const [key, allowed] of Object.entries({dataset:['torgo','uaspeech'],view:['average','classwise'],representation:['fbank','whisper'],classifier:['lr','mlp','cnn'],scope:['full','last']})) {
    state[key] = allowed.includes(params.get(key)) ? params.get(key) : {dataset:'torgo',view:'average',representation:'fbank',classifier:'lr',scope:'full'}[key];
  }
  if (state.classifier === 'lr') state.scope = 'full';
}
function assetStem() {return `assets/rq1_${state.dataset}_${state.view === 'average' ? 'average_class_curves' : 'deletion_curves'}`;}
function render(updateURL = true) {
  if (state.classifier === 'lr') state.scope = 'full';
  const d = datasets[state.dataset];
  const averaged = state.view === 'average';
  document.querySelectorAll('[data-dataset]').forEach(button=>button.setAttribute('aria-pressed', String(button.dataset.dataset===state.dataset)));
  document.querySelectorAll('[data-view]').forEach(button=>button.setAttribute('aria-pressed', String(button.dataset.view===state.view)));
  $('class-filters').hidden = averaged;
  for (const key of ['representation','classifier','scope']) $(key).value = state[key];
  $('scope').disabled = state.classifier === 'lr';
  $('scope-help').textContent = state.classifier==='lr' ? 'For LR, full-model and final-layer gradients are equivalent.' : 'Full uses all trainable parameters; final layer restricts the influence calculation to the output layer.';
  $('figure-kicker').textContent = `${d.name} / ${d.classes} target classes`;
  const config = `${representationNames[state.representation]} · ${modelNames[state.classifier]} · ${state.scope === 'last' ? 'Final layer' : 'Full model'}`;
  $('figure-title').textContent = averaged ? 'Accuracy averaged across target classes' : config;
  const page = (state.representation === 'whisper' ? 5 : 0) + (state.classifier==='lr' ? 1 : state.classifier==='mlp' ? (state.scope==='full'?2:3) : (state.scope==='full'?4:5));
  currentImage = averaged ? `${assetStem()}.png` : `assets/${state.dataset}-class-${String(page).padStart(2,'0')}.png`;
  const img = $('result-image');
  img.src = currentImage;
  img.alt = averaged ? `${d.name} mean target-class accuracy after deletion. Two rows show FBank and Whisper; five columns show LR full, MLP full, MLP final-layer, CNN full, and CNN final-layer settings. Red circles indicate supportive deletion, green squares counteracting deletion, and blue triangles random deletion.` : `${d.name}: ${config}. Target-class accuracy versus percentage of training samples removed, with separate panels for ${d.labels}. Red circles indicate supportive deletion, green squares counteracting deletion, and blue triangles random deletion.`;
  if (averaged) {img.width=2600; img.height=1153;} else if(state.dataset==='torgo') {img.width=2200;img.height=1640;} else {img.width=2400;img.height=1514;}
  $('current-pdf').href = `${assetStem()}.pdf${averaged?'':`#page=${page}`}`;
  $('figure-caption').textContent = averaged ? `Each panel averages target-class accuracy across ${d.classes===4?'four':'five'} separate class-specific deletion experiments. Rows indicate speech representation; columns indicate classifier and gradient scope.` : `Each panel shows accuracy on one target class after removing training utterances ranked for that class and retraining. Original PDF page ${page} of 10. Class labels and numeric IDs are preserved from the source figure.`;
  $('reading-note').textContent = averaged ? 'Each class has equal weight in the mean. This summarises separate target-class experiments; it is not the overall test accuracy of one retrained model.' : 'Check the vertical scale in each panel: ranges differ between classes. The deletion fraction is measured against the full training set, and each target class uses its own influence ranking.';
  $('insight-title').textContent = `What to look for in ${d.name}`;
  $('insight-text').textContent = d.insight;
  $('selection-status').textContent = `${d.name}, ${averaged?'class-averaged results':config+' class-wise results'} selected.`;
  if (updateURL && location.protocol !== 'file:') {
    const url = new URL(location.href);
    for (const [key,value] of Object.entries(state)) url.searchParams.set(key,value);
    history.replaceState(null,'',url);
  }
}

function openFigure() {
  $('dialog-title').textContent = `${datasets[state.dataset].name} / ${$('figure-title').textContent}`;
  $('zoom-image').src = currentImage;
  $('zoom-image').alt = $('result-image').alt;
  $('zoom').value='100';
  $('zoom-output').value='100%';
  $('zoom-image').style.width='100%';
  dialog.showModal();
  document.body.style.overflow='hidden';
  dialog.querySelector('.zoom-viewport').scrollTo(0,0);
}
function toast(message) {
  $('toast').textContent=message;
  $('toast').classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),3500);
}
document.querySelectorAll('[data-dataset]').forEach(button=>button.addEventListener('click',()=>{state.dataset=button.dataset.dataset;render();}));
document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>{state.view=button.dataset.view;render();}));
for (const key of ['representation','classifier','scope']) $(key).addEventListener('change',()=>{state[key]=$(key).value;render();});
$('enlarge').addEventListener('click',openFigure);
$('figure-button').addEventListener('click',openFigure);
$('close-dialog').addEventListener('click',()=>dialog.close());
dialog.addEventListener('close',()=>{document.body.style.overflow='';});
dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();}});
$('zoom').addEventListener('input',()=>{$('zoom-image').style.width=`${$('zoom').value}%`;$('zoom-output').value=`${$('zoom').value}%`;});
$('copy-link').addEventListener('click',async()=>{
  const url = new URL(location.href); for(const [key,value] of Object.entries(state))url.searchParams.set(key,value);url.hash='results';
  try {await navigator.clipboard.writeText(url.href);toast('Link to this figure view copied.');}
  catch {const link=document.createElement('textarea');link.value=url.href;link.style.position='fixed';link.style.left='-9999px';document.body.append(link);link.select();const copied=document.execCommand('copy');link.remove();toast(copied?'Link to this figure view copied.':'Copy the address from your browser to share this view.');}
});
window.addEventListener('popstate',()=>{readLocation();render(false);});
readLocation();render(false);
