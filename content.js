(() => {
  const MAX=3, KEY="threeJumpBookmarksV121", PENDING="threeJumpPendingV121";
  if(window.__threeJumpV121Loaded) return;
  window.__threeJumpV121Loaded=true;
  const state={bookmarks:[], selection:null};
  let activeSeek=null;

  function cancelSeek(){
    if(!activeSeek)return;
    activeSeek.cancelled=true;
    activeSeek=null;
  }
// Any user pointer interaction takes control back from automatic seeking
  document.addEventListener("pointerdown",()=>{
    cancelSeek();
  },true);

  const get=k=>new Promise(r=>chrome.storage.local.get(k,r));
  const set=o=>new Promise(r=>chrome.storage.local.set(o,r));
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));

  function convId(url=location.href){
    try{return new URL(url,location.origin).pathname.match(/\/c\/([^/?#]+)/)?.[1]||null}catch{return null}
  }
  function convUrl(){const id=convId();return id?`${location.origin}/c/${id}`:`${location.origin}${location.pathname}`}

  function rootFor(node){
    const el=node?.nodeType===1?node:node?.parentElement;
    return el?.closest?.('[data-message-author-role="assistant"],[data-message-author-role="user"],main article')||null;
  }

  function roots(){
    let r=[...document.querySelectorAll(
      '[data-message-author-role="assistant"],[data-message-author-role="user"]'
    )];
    if(!r.length) r=[...document.querySelectorAll("main article")];
    return r;
  }

  function captureSelection(){
    const sel=window.getSelection();
    if(!sel||sel.rangeCount===0||sel.isCollapsed)return null;
    const range=sel.getRangeAt(0);
    const a=rootFor(range.startContainer), b=rootFor(range.endContainer);
    if(!a||a!==b)return null;

    const text=sel.toString();
    if(!text.trim())return null;

    // Capture textual context around the selection to improve
    // disambiguation when restoring the jump point.
    const before=document.createRange();
    before.selectNodeContents(a);
    before.setEnd(range.startContainer,range.startOffset);
    const after=document.createRange();
    after.selectNodeContents(a);
    after.setStart(range.endContainer,range.endOffset);

    return {
      text,
      prefix:before.toString().slice(-160),
      suffix:after.toString().slice(0,160),
      preview:text.replace(/\s+/g," ").trim().slice(0,120)
    };
  }

  function updateSelection(){
    const c=captureSelection();
    if(c){state.selection=c;render()}
  }
  document.addEventListener("mouseup",()=>setTimeout(updateSelection,0),true);
  document.addEventListener("selectionchange",()=>{
    const s=window.getSelection();
    if(s&&!s.isCollapsed)setTimeout(updateSelection,0);
  },true);

  // Portions of the text re-anchoring implementation below are adapted
  // from Threadmark's open-source anchoring implementation (MIT License).
  // See THIRD_PARTY_NOTICES.md.
  //
  // Jump Points extends this anchoring layer with its own navigation and
  // restoration system for virtualized content, long-distance seeking,
  // bidirectional restoration, and cross-chat navigation.

  function commonSuffixLength(a,b){
    let i=0;
    while(
      i<a.length &&
      i<b.length &&
      a[a.length-1-i]===b[b.length-1-i]
    ) i++;
    return i;
  }
  
  function commonPrefixLength(a,b){
    let i=0;
    while(
      i<a.length &&
      i<b.length &&
      a[i]===b[i]
    ) i++;
    return i;
  }

  function mapStrippedToReal(original,strippedOffset){
    let count=0;
    for(let i=0;i<original.length;i++){
      const ch=original[i];
      if(ch&&!/\s/.test(ch)){
        if(count===strippedOffset)return i;
        count++;
      }
    }
    return original.length;
  }

  function findRanges(root,targetText,aggressive=false,context={}){
    const candidates=[], nodes=[];
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    let node;
    while((node=walker.nextNode())){
      const parent=node.parentElement;
      if(parent?.closest?.("#tjb-panel,.tjb-toast"))continue;
      nodes.push(node);
    }

    let fullText="";
    const offsets=[];
    for(const t of nodes){
      const val=t.nodeValue||"";
      const current=aggressive?val.replace(/\s+/g,""):val;
      if(current.length){
        offsets.push({node:t,start:fullText.length,end:fullText.length+current.length,original:val});
        fullText+=current;
      }
    }

    const searchFor=aggressive?targetText.replace(/\s+/g,""):targetText;
    if(!searchFor)return [];

    const prefix=aggressive?(context.prefix||"").replace(/\s+/g,""):(context.prefix||"");
    const suffix=aggressive?(context.suffix||"").replace(/\s+/g,""):(context.suffix||"");

    let searchIndex=0;
    while(true){
      const matchIndex=fullText.indexOf(searchFor,searchIndex);
      if(matchIndex===-1)break;
      const endIndex=matchIndex+searchFor.length;
      const startInfo=offsets.find(n=>matchIndex>=n.start&&matchIndex<n.end);
      const endInfo=offsets.find(n=>endIndex-1>=n.start&&endIndex-1<n.end);

      if(startInfo&&endInfo){
        const range=document.createRange();
        const so=matchIndex-startInfo.start;
        const eo=endIndex-endInfo.start;
        const realStart=aggressive?mapStrippedToReal(startInfo.original,so):so;
        const realEnd=aggressive?mapStrippedToReal(endInfo.original,eo):eo;
        try{
          range.setStart(startInfo.node,realStart);
          range.setEnd(endInfo.node,realEnd);
          let score=0;
          if(prefix){
            const docPrefix=fullText.substring(
              Math.max(0,matchIndex-prefix.length),
              matchIndex
            );
            score+=commonSuffixLength(prefix,docPrefix);
        }
          if(suffix){
            const docSuffix=fullText.substring(
              endIndex,
              endIndex+suffix.length
            );
            score+=commonPrefixLength(suffix,docSuffix);
          }
          candidates.push({range,score});
        }catch{}
      }
      searchIndex=matchIndex+1;
    }
    return candidates;
  }

  function findBestRange(b){
    let candidates=findRanges(
      document.body,
      b.text,
      false,
      {prefix:b.prefix,suffix:b.suffix}
    );
  
    if(!candidates.length){
      candidates=findRanges(
        document.body,
        b.text,
        true,
        {prefix:b.prefix,suffix:b.suffix}
      );
    }
  
    if(!candidates.length)return null;
  
    candidates.sort((a,b)=>b.score-a.score);
  
    // A unique text match is safe even without contextual evidence.
    if(candidates.length===1)
      return candidates[0].range;
  
    // Repeated text must have enough surrounding-context evidence.
    // It is safer to reject an ambiguous match than jump to the wrong place.
    if(candidates[0].score<12)
      return null;
  
    return candidates[0].range;
  }

  function highlightRange(range){
    const spans=[];
    const newNode=document.createElement("span");
    newNode.className="tjb-found-highlight";

    try{
      range.surroundContents(newNode);
      return [newNode];
    }catch{
      // Cross-element selections cannot always be wrapped with surroundContents().
      // Fall back to wrapping each intersecting text segment separately.
      const common=range.commonAncestorContainer;
      const walker=document.createTreeWalker(common,NodeFilter.SHOW_TEXT,{
        acceptNode:n=>range.intersectsNode(n)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT
      });
      const pieces=[]; let n;
      while((n=walker.nextNode())){
        const start=n===range.startContainer?range.startOffset:0;
        const end=n===range.endContainer?range.endOffset:n.length;
        if(end>start)pieces.push({node:n,start,end});
      }
      for(const p of pieces){
        try{
          const r=document.createRange();
          r.setStart(p.node,p.start);r.setEnd(p.node,p.end);
          const span=newNode.cloneNode(false);
          r.surroundContents(span);spans.push(span);
        }catch{}
      }
      return spans;
    }
  }

  function scrollHostCandidates(){
    const rootsNow=roots();
    const counts=new Map();

    // Strong signal: scrollable ancestors of actual chat messages.
    for(const r of rootsNow){
      let el=r.parentElement;
      let depth=0;
      while(el && el!==document.body && depth<18){
        const cs=getComputedStyle(el);
        const range=el.scrollHeight-el.clientHeight;
        if(range>200 && /(auto|scroll|overlay)/.test(cs.overflowY)){
          counts.set(el,(counts.get(el)||0)+1);
        }
        el=el.parentElement;
        depth++;
      }
    }

    let candidates=[...counts.entries()].map(([el,count])=>({
      el,
      score:count*1000 + Math.max(0,el.scrollHeight-el.clientHeight)
    }));

    // Fallbacks for ChatGPT DOM variations.
    for(const el of document.querySelectorAll('main,[class*="overflow-y-auto"],[class*="overflow-auto"]')){
      const cs=getComputedStyle(el);
      const range=el.scrollHeight-el.clientHeight;
      if(range>200 && /(auto|scroll|overlay)/.test(cs.overflowY)){
        candidates.push({el,score:range});
      }
    }

    const doc=document.scrollingElement||document.documentElement;
    if(doc) candidates.push({el:doc,score:Math.max(1,doc.scrollHeight-doc.clientHeight)});

    // Dedupe and sort.
    const best=new Map();
    for(const c of candidates){
      if(!best.has(c.el) || best.get(c.el).score<c.score) best.set(c.el,c);
    }
    return [...best.values()].sort((a,b)=>b.score-a.score).map(x=>x.el);
  }

  function scrollHost(){
    return scrollHostCandidates()[0] || document.scrollingElement || document.documentElement;
  }

  function getScrollProgress(){
    const h=scrollHost();
    const max=Math.max(1,h.scrollHeight-h.clientHeight);
    return Math.max(0,Math.min(1,h.scrollTop/max));
  }

  function wait(ms){return new Promise(r=>setTimeout(r,ms))}

  async function continuousCruise(direction,b,seek,maxMs=55000){
    let h=scrollHost();
    let lastTs=performance.now();
    let lastSearch=0;
    let lastMetrics=performance.now();
    let lastTop=h.scrollTop;
    let lastHeight=h.scrollHeight;
    let stableEdge=0;
    let found=false;

    // px/sec. Cruise quickly through long conversations; adaptive logic below
    // slows down when ChatGPT appears to be materializing/reshaping content.
    let speed=6500;
    const minSpeed=2800;
    const maxSpeed=10000;
    const started=performance.now();

    return await new Promise(resolve=>{
      function frame(ts){
        if(found)return;
    
        if(seek.cancelled){
          found=true;
          resolve(false);
          return;
        }

        // ChatGPT may replace the host during virtualization. Re-detect
        // periodically without interrupting visual motion.
        if(ts-lastMetrics>500){
          const newHost=scrollHost();
          if(newHost) h=newHost;
        }

        const dt=Math.min(40,ts-lastTs)/1000;
        lastTs=ts;

        const before=h.scrollTop;
        h.scrollTop=before + direction*speed*dt;

        // Search independently of animation frames. This avoids expensive DOM
        // Range scans at 60fps while keeping the scroll visually continuous.
        if(ts-lastSearch>=115){
          lastSearch=ts;
          if(jumpHere(b)){
            found=true;
            resolve(true);
            return;
          }
        }

        // Every ~500ms inspect virtualization and edge behavior.
        // Only treat a stable physical boundary as a real edge.
        if(ts-lastMetrics>=500){
          const height=h.scrollHeight;
          const top=h.scrollTop;
          const moved=Math.abs(top-lastTop)>=3;
          const heightChanged=Math.abs(height-lastHeight)>=3;
        
          const maxScroll=Math.max(0,height-h.clientHeight);
          const nearEdge=
            direction<0
              ? top<=3
              : top>=maxScroll-3;
        
          if(nearEdge && !moved && !heightChanged)
            stableEdge++;
          else
            stableEdge=0;
        
          // Height changes mean ChatGPT is actively materializing content:
          // ease off a bit to let rendering keep up. When stable and moving,
          // gradually accelerate.
          if(heightChanged) speed=Math.max(minSpeed,speed*.90);
          else if(moved) speed=Math.min(maxSpeed,speed*1.08);
        
          lastTop=top;
          lastHeight=height;
          lastMetrics=ts;
        
          if(stableEdge>=5){
            // Do one delayed final search before declaring a real edge.
            setTimeout(()=>{
              if(found)return;
              if(seek.cancelled){
                found=true;
                resolve(false);
                return;
              }
              if(jumpHere(b)){found=true;resolve(true)}
              else {found=true;resolve(false)}
            },500);
            return;
          }
        }

        if(ts-started>=maxMs){
          found=true;
          resolve(jumpHere(b));
          return;
        }

        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    });
  }

  async function seekDirection(direction,b,seek){
    return continuousCruise(direction,b,seek);
  }

  async function progressiveSeek(b,seek){
    if(seek.cancelled)return false;
    if(jumpHere(b))return true;

    // Approximate progress is only a hint for which direction to try first.
    // We no longer trust it as a stopping position.
    const saved=typeof b.approxProgress==="number"?b.approxProgress:0;
    const current=getScrollProgress();
    const first=saved<=current?-1:1;

    // Exhaust the likely direction all the way to a verified real edge.
    if(await seekDirection(first,b,seek))return true;
    if(seek.cancelled)return false;

    // If the coarse hint was wrong (common after cross-chat load or when
    // virtualization changed the document height), sweep the other direction
    // as well. This makes restoration exhaustive rather than percentage-based.
    if(await seekDirection(-first,b,seek))return true;
    if(seek.cancelled)return false;

    return jumpHere(b);
  }

  function jumpHere(b){
    const range=findBestRange(b);
    if(!range)return false;
    const spans=highlightRange(range);
    if(!spans.length)return false;
    const target=spans[0];
    target.scrollIntoView({behavior:"smooth",block:"center"});
    target.classList.add("tjb-found-flash");

    setTimeout(()=>{
      document.querySelectorAll(".tjb-found-highlight").forEach(el=>{
        const p=el.parentNode;if(!p)return;
        while(el.firstChild)p.insertBefore(el.firstChild,el);
        p.removeChild(el);p.normalize();
      });
    },1400);
    return true;
  }

  async function jump(b){
    const target=b.conversationId||convId(b.conversationUrl);
  
    if(target&&convId()!==target){
      await set({[PENDING]:b.id});
      location.assign(b.conversationUrl);
      return;
    }
  
    const seek={cancelled:false};
    activeSeek=seek;
  
    const ok=await progressiveSeek(b,seek);
  
    if(activeSeek===seek)activeSeek=null;
  
    if(!ok&&!seek.cancelled)
      toast("Jump point couldn't be restored.");
  }

  function conversationReadySnapshot(){
    const rs=roots();
    const h=scrollHost();
    return {
      messageCount:rs.length,
      height:h?.scrollHeight||0,
      top:h?.scrollTop||0,
      host:h
    };
  }

  async function waitForCrossChatReady(expectedConversationId){
    // URL must first resolve to the intended conversation.
    for(let i=0;i<40;i++){
      if(!expectedConversationId || convId()===expectedConversationId) break;
      await wait(150);
    }

    // Then require actual message DOM.
    for(let i=0;i<60;i++){
      if(roots().length>0 && scrollHost()) break;
      await wait(150);
    }

    // Finally require several consecutive stable snapshots. This prevents our
    // seek from fighting ChatGPT's own initial "restore to latest" behavior.
    let stable=0,last=null;
    for(let i=0;i<80;i++){
      const s=conversationReadySnapshot();
      const same=last &&
        s.messageCount===last.messageCount &&
        Math.abs(s.height-last.height)<4 &&
        Math.abs(s.top-last.top)<4 &&
        s.host===last.host;

      stable=same?stable+1:0;
      last=s;
      if(stable>=5){
        // A small quiet period catches delayed native scroll restoration.
        await wait(450);
        const verify=conversationReadySnapshot();
        if(verify.messageCount===s.messageCount &&
           Math.abs(verify.height-s.height)<4 &&
           Math.abs(verify.top-s.top)<4 &&
           verify.host===s.host) return true;
        stable=0;
        last=verify;
      }
      await wait(140);
    }
    return roots().length>0;
  }

  async function resume(){
    const d=await get([PENDING,KEY]);
    const id=d[PENDING];if(!id)return;
    const b=(d[KEY]||[]).find(x=>x.id===id);
    if(!b){await set({[PENDING]:null});return}

    const target=b.conversationId||convId(b.conversationUrl);
    if(target&&convId()!==target)return;

    // Cross-chat only: do not touch scroll position until ChatGPT's route,
    // messages, scroll host, and native scroll restoration have settled.
    await waitForCrossChatReady(target);

    const seek={cancelled:false};
    activeSeek=seek;
    
    const ok=await progressiveSeek(b,seek);
    
    if(activeSeek===seek)activeSeek=null;
    
    await set({[PENDING]:null});
    if(!ok&&!seek.cancelled)
      toast("Opened chat, but jump point couldn't be restored.");
  }

  async function saveIntoSlot(slot=null){
    const anchor=captureSelection()||state.selection;
    if(!anchor){
      toast("Select text first.");
      return;
    }

    const existing=slot!==null?state.bookmarks[slot]:null;
    const name=prompt(
      existing?"Replace jump point name:":"Jump point name:",
      existing?.name||""
    );
    if(!name?.trim()) return;

    const b={
      id:existing?.id||crypto.randomUUID(),
      name:name.trim(),
      platform:"chatgpt",
      conversationId:convId(),
      conversationUrl:convUrl(),
      createdAt:Date.now(),
      approxProgress:getScrollProgress(),
      ...anchor
    };

    if(slot===null){
      state.bookmarks=[...state.bookmarks,b].slice(0,MAX);
    }else{
      state.bookmarks=state.bookmarks.map((x,i)=>i===slot?b:x);
    }

    await set({[KEY]:state.bookmarks});
    state.selection=null;
    window.getSelection()?.removeAllRanges();
    render();
    toast(existing?`Replaced: ${b.name}`:`Saved: ${b.name}`);
  }

  async function add(){ return saveIntoSlot(null); }

  async function remove(id,e){
    e.stopPropagation();
    state.bookmarks=state.bookmarks.filter(b=>b.id!==id);
    await set({[KEY]:state.bookmarks});render();
  }

  function toast(msg){
    let t=document.querySelector(".tjb-toast");
    if(!t){t=document.createElement("div");t.className="tjb-toast";document.body.appendChild(t)}
    t.textContent=msg;t.classList.add("show");
    clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove("show"),1900);
  }

  function panel(){
    let p=document.querySelector("#tjb-panel");
    if(!p){
      p=document.createElement("div");p.id="tjb-panel";
      p.innerHTML='<div class="tjb-header"><span>Jump points</span><span class="tjb-count"></span></div><div class="tjb-list"></div>';
      document.body.appendChild(p);
    }
    return p;
  }

  function render(){
    const p=panel(),list=p.querySelector(".tjb-list");
    p.querySelector(".tjb-count").textContent=`${state.bookmarks.length}/${MAX}`;
    list.innerHTML="";

    state.bookmarks.forEach((b,i)=>{
      const row=document.createElement("div");
      row.className="tjb-row";
      row.title=b.preview||b.text||"";

      const jumpBtn=document.createElement("button");
      jumpBtn.className="tjb-jump";
      jumpBtn.innerHTML=`<span class="tjb-index">${i+1}</span><span class="tjb-name">${esc(b.name)}</span>`;
      jumpBtn.onclick=()=>jump(b);
      row.appendChild(jumpBtn);

      if(state.selection){
        const replace=document.createElement("button");
        replace.className="tjb-replace";
        replace.textContent="Replace";
        replace.title=`Replace ${b.name} with selected text`;
        replace.onclick=e=>{e.stopPropagation();saveIntoSlot(i)};
        row.appendChild(replace);
      }else{
        const removeBtn=document.createElement("button");
        removeBtn.className="tjb-remove";
        removeBtn.textContent="×";
        removeBtn.title="Remove";
        removeBtn.onclick=e=>remove(b.id,e);
        row.appendChild(removeBtn);
      }
      list.appendChild(row);
    });

    if(state.bookmarks.length<MAX){
      const a=document.createElement("button");
      a.className="tjb-add";
      a.textContent=state.selection?"+ Add selected text":"+ Add jump point";
      if(state.selection)a.classList.add("tjb-add-ready");
      a.onclick=add;list.appendChild(a);
    }else if(state.selection){
      const hint=document.createElement("div");
      hint.className="tjb-replace-hint";
      hint.textContent="Choose a slot to replace";
      list.appendChild(hint);
    }
  }

  new MutationObserver(()=>{
    if(!document.querySelector("#tjb-panel"))render();
  }).observe(document.documentElement,{childList:true,subtree:true});

  get([KEY]).then(d=>{state.bookmarks=(d[KEY]||[]).slice(0,MAX);render();resume()});
})();
