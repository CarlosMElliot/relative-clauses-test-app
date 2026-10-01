const OWNER='CarlosMElliot';const REPO='relative-clauses-test-app';const PATH='logs/results.jsonl';
export default async function handler(req,res){
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
 const token=process.env.GITHUB_RESULTS_TOKEN;
 if(!token)return res.status(503).json({error:'Results logging is not configured'});
 const b=req.body||{};const clean=x=>String(x??'').replace(/[\r\n]/g,' ').slice(0,160);
 const entry={name:clean(b.name),group:clean(b.group),score:Number(b.score)||0,correct:Number(b.correct)||0,total:Number(b.total)||50,status:clean(b.status),startedAt:clean(b.startedAt),submittedAt:clean(b.submittedAt),loggedAt:new Date().toISOString(),attempt:Math.max(1,Number(b.attempt)||1)};
 try{
  const url=`https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`;
  const h={Authorization:`Bearer ${token}`,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'erc-test-results'};
  let sha,existing='';const get=await fetch(url,{headers:h});
  if(get.ok){const j=await get.json();sha=j.sha;existing=Buffer.from(j.content,'base64').toString('utf8')}else if(get.status!==404)throw new Error('read failed');
  const rows=existing.trim()?existing.trim().split('\n').filter(Boolean).map(x=>{try{return JSON.parse(x)}catch{return null}}).filter(Boolean):[];rows.push(entry);
  const header='| # | Student | Group | Score | Correct | Attempt | Status | Started (UTC) | Submitted (UTC) | Logged (UTC) |\n|---:|---|---|---:|---:|---:|---|---|---|---|\n';
  const esc=x=>String(x??'').replace(/\\|/g,'\\\\|');
  const table=header+rows.map((r,i)=>`| ${i+1} | ${esc(r.name)} | ${esc(r.group||'—')} | ${r.score}/100 | ${r.correct}/${r.total} | ${r.attempt||1} | ${esc(r.status)} | ${esc(r.startedAt)} | ${esc(r.submittedAt)} | ${esc(r.loggedAt)} |`).join('\n')+'\n';
  const content=existing+JSON.stringify(entry)+'\n';
  const put=await fetch(url,{method:'PUT',headers:{...h,'Content-Type':'application/json'},body:JSON.stringify({message:`Log test result: ${entry.name||'student'} - ${entry.score}/100`,content:Buffer.from(content).toString('base64'),...(sha?{sha}:{})})});
  if(!put.ok)throw new Error('write failed');
  const tableUrl=`https://api.github.com/repos/${OWNER}/${REPO}/contents/logs/RESULTS.md`;let tableSha;const tg=await fetch(tableUrl,{headers:h});if(tg.ok)tableSha=(await tg.json()).sha;
  const tp=await fetch(tableUrl,{method:'PUT',headers:{...h,'Content-Type':'application/json'},body:JSON.stringify({message:`Update results table: ${entry.name||'student'}`,content:Buffer.from('# Student Test Results\n\nNewest submissions appear at the bottom. Every attempt is retained.\n\n'+table).toString('base64'),...(tableSha?{sha:tableSha}:{})})});if(!tp.ok)throw new Error('table write failed');
  return res.status(200).json({ok:true});
 }catch(e){return res.status(500).json({error:'Could not log result'})}
}