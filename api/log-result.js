const OWNER='CarlosMElliot';const REPO='relative-clauses-test-app';const PATH='logs/results.jsonl';
export default async function handler(req,res){
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
 const token=process.env.GITHUB_RESULTS_TOKEN;
 if(!token)return res.status(503).json({error:'Results logging is not configured'});
 const b=req.body||{};const clean=x=>String(x??'').replace(/[\r\n]/g,' ').slice(0,160);
 const entry={name:clean(b.name),group:clean(b.group),score:Number(b.score)||0,correct:Number(b.correct)||0,total:Number(b.total)||50,status:clean(b.status),startedAt:clean(b.startedAt),submittedAt:clean(b.submittedAt),loggedAt:new Date().toISOString()};
 try{
  const url=`https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`;
  const h={Authorization:`Bearer ${token}`,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'erc-test-results'};
  let sha,existing='';const get=await fetch(url,{headers:h});
  if(get.ok){const j=await get.json();sha=j.sha;existing=Buffer.from(j.content,'base64').toString('utf8')}else if(get.status!==404)throw new Error('read failed');
  const content=existing+JSON.stringify(entry)+'\n';
  const put=await fetch(url,{method:'PUT',headers:{...h,'Content-Type':'application/json'},body:JSON.stringify({message:`Log test result: ${entry.name||'student'} - ${entry.score}/100`,content:Buffer.from(content).toString('base64'),...(sha?{sha}:{})})});
  if(!put.ok)throw new Error('write failed');return res.status(200).json({ok:true});
 }catch(e){return res.status(500).json({error:'Could not log result'})}
}