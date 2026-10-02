const OWNER='CarlosMElliot',REPO='relative-clauses-test-app',RAW='logs/results.jsonl',TABLE='logs/RESULTS.md';
export default async function handler(req,res){
 const token=process.env.GITHUB_RESULTS_TOKEN,admin=process.env.TEACHER_ADMIN_PASSWORD;
 if(!token||!admin)return res.status(503).json({error:'Teacher management is not configured'});
 const auth=String(req.headers.authorization||'').replace(/^Bearer\s+/i,'');
 if(auth!==admin)return res.status(401).json({error:'Invalid teacher password'});
 const h={Authorization:`Bearer ${token}`,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'erc-test-results'};
 const get=async path=>{const u=`https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`;const r=await fetch(u,{headers:h});if(r.status===404)return{u,sha:null,content:''};if(!r.ok)throw Error('GitHub read failed');const j=await r.json();return{u,sha:j.sha,content:Buffer.from(j.content,'base64').toString('utf8')}};
 const put=async(path,content,sha,msg)=>{const u=`https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`;const r=await fetch(u,{method:'PUT',headers:{...h,'Content-Type':'application/json'},body:JSON.stringify({message:msg,content:Buffer.from(content).toString('base64'),...(sha?{sha}:{})})});if(!r.ok)throw Error('GitHub write failed')};
 const del=async(path,sha,msg)=>{if(!sha)return;const u=`https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`;const r=await fetch(u,{method:'DELETE',headers:{...h,'Content-Type':'application/json'},body:JSON.stringify({message:msg,sha})});if(!r.ok)throw Error('GitHub delete failed')};
 const safe=n=>(n||'student').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60)||'student';
 const esc=x=>String(x??'').replace(/\|/g,'\\|');
 const renderTable=rows=>{const header='| # | Student | Group | Score | Correct | Attempt | Status | Started (UTC) | Submitted (UTC) | Logged (UTC) |\n|---:|---|---|---:|---:|---:|---|---|---|---|\n';return '# Student Test Results\n\nNewest submissions appear at the bottom. Every attempt is retained.\n\n'+header+rows.map((r,i)=>`| ${i+1} | ${esc(r.name)} | ${esc(r.group||'—')} | ${r.score}/100 | ${r.correct}/${r.total} | ${r.attempt||1} | ${esc(r.status)} | ${esc(r.startedAt)} | ${esc(r.submittedAt)} | ${esc(r.loggedAt)} |`).join('\n')+'\n'};
 try{
  const raw=await get(RAW);let rows=raw.content.trim()?raw.content.trim().split('\n').filter(Boolean).map(x=>{try{return JSON.parse(x)}catch{return null}}).filter(Boolean):[];
  if(req.method==='DELETE'){
   const name=String(req.body?.name||'').trim();if(!name)return res.status(400).json({error:'Student name is required'});
   const target=name.toLowerCase();const before=rows.length;rows=rows.filter(r=>String(r.name||'').trim().toLowerCase()!==target);if(rows.length===before)return res.status(404).json({error:'Student not found'});
   await put(RAW,rows.map(r=>JSON.stringify(r)).join('\n')+(rows.length?'\n':''),raw.sha,`Delete stored results for ${name}`);
   const table=await get(TABLE);await put(TABLE,renderTable(rows),table.sha,`Remove ${name} from results table`);
   const sf=await get(`logs/students/${safe(name)}.md`);await del(`logs/students/${safe(name)}.md`,sf.sha,`Delete detailed answers for ${name}`);
  }else if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
  const map=new Map();for(const r of rows){const k=String(r.name||'').trim().toLowerCase();if(!k)continue;const old=map.get(k);if(!old||String(r.loggedAt)>String(old.loggedAt))map.set(k,{name:r.name,group:r.group,score:r.score,attempts:rows.filter(x=>String(x.name||'').trim().toLowerCase()===k).length,loggedAt:r.loggedAt})}
  return res.status(200).json({results:[...map.values()].sort((a,b)=>a.name.localeCompare(b.name))});
 }catch(e){return res.status(500).json({error:'Could not manage results'})}
}