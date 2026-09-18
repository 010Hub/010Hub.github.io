const state={tree:{},records:[],selected:null,q:"",expanded:new Set(),theme:"dark"};
const emoji={Aosp:"🤖",CTF:"🚩",Forum:"💬",Game:"🎮",Hook:"🪝",LLVM:"🧩","PE&ELF":"📦",Packer:"🔐",Pwn:"💥",RE:"🔬",Risk:"⚠️",Sandbox:"🧪",Tools:"🛠️",UavSec:"🚁",WP:"📝",eBPF:"⚙️"};
const $=s=>document.querySelector(s),esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
function* walk(n,path=[]){for(const [name,v] of Object.entries(n)){if(v&&typeof v==="object"&&!Array.isArray(v))yield*walk(v,[...path,name]);else yield{name,url:String(v),folder_path:path.join(" / "),category:path[0]||"未分类"};}}
function count(n){return Object.values(n).reduce((a,v)=>a+(v&&typeof v==="object"&&!Array.isArray(v)?count(v):1),0)}
function treeHtml(n,path=[],depth=0){
  return Object.entries(n).filter(([,v]) =>
    v && typeof v === "object" && !Array.isArray(v)
  ).map(([name,v])=>{
    const p=[...path,name];
    const key=p.join(" / ");
    const open=state.expanded.has(key);
    const selected=state.selected===key;
    const c=count(v);
    const hasCategories=Object.values(v).some(x =>
      x && typeof x === "object" && !Array.isArray(x)
    );

    return `<div>
      <button class="tree-row ${selected?"selected":""}"
        data-key="${esc(key)}"
        data-folder="true"
        style="--depth:${depth}"
        type="button">
        <span class="tree-arrow ${hasCategories?(open?"open":""):"empty"}">
          ${hasCategories?"▸":""}
        </span>
        <span class="tree-icon">${emoji[name]||(depth?"📁":"📂")}</span>
        <span class="tree-name">${esc(name)}</span>
        <span class="tree-count">${c}</span>
      </button>
      ${open ? `<div>${treeHtml(v,p,depth+1)}</div>` : ""}
    </div>`;
  }).join("");
}
function favicon(u){try{return`https://www.google.com/s2/favicons?domain=${encodeURIComponent(new URL(u).hostname)}&sz=64`}catch{return""}}
function cards(){let a=state.records;if(state.selected)a=a.filter(x=>x.folder_path===state.selected||x.folder_path.startsWith(state.selected+" / "));if(state.q){const q=state.q.toLowerCase();a=a.filter(x=>`${x.name} ${x.url} ${x.folder_path}`.toLowerCase().includes(q))}$("#result-count").textContent=`${a.length} 个书签`,$("#cards").innerHTML=a.length?a.map(x=>`<a class="bookmark-card" href="${esc(x.url)}" target="_blank" rel="noopener noreferrer"><div class="bookmark-icon"><img src="${esc(favicon(x.url))}" alt="" loading="lazy" onerror="this.style.display='none'"></div><div class="bookmark-main"><div class="bookmark-title" title="${esc(x.name)}">${esc(x.name)}</div><div class="bookmark-url" title="${esc(x.url)}">${esc(x.url)}</div></div></a>`).join(""):`<div class="empty-state">没有找到匹配的书签</div>`}
function render(){$("#sidebar-tree").innerHTML=treeHtml(state.tree);$("#all-row").classList.toggle("selected",!state.selected);$("#page-title").textContent=state.selected||"All Bookmarks";$("#all-count").textContent=state.records.length;cards()}
async function init(){const r=await fetch("data/bookmarks.json");if(!r.ok)throw Error(r.status);state.tree=await r.json();state.records=[...walk(state.tree)];document.documentElement.dataset.theme="dark";$("#search").addEventListener("input",e=>{state.q=e.target.value;cards()});$("#all-row").addEventListener("click",()=>{state.selected=null;render()});$("#sidebar-tree").addEventListener("click",e=>{const b=e.target.closest(".tree-row");if(!b)return;const k=b.dataset.key;
if(state.expanded.has(k)) state.expanded.delete(k);
else state.expanded.add(k);
state.selected=k;
render()});$("#theme-toggle").addEventListener("click",()=>{state.theme=state.theme==="dark"?"light":"dark";document.documentElement.dataset.theme=state.theme;$("#theme-toggle").textContent=state.theme==="dark"?"☀":"☾"});render()}
init().catch(e=>{$("#cards").innerHTML='<div class="empty-state">无法加载 bookmarks.json</div>';console.error(e)})