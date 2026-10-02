const OWNER='CarlosMElliot';const REPO='relative-clauses-test-app';const PATH='logs/results.jsonl';
export default async function handler(req,res){
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
 const token=process.env.GITHUB_RESULTS_TOKEN;
 if(!token)return res.status(503).json({error:'Results logging is not configured'});
 const b=req.body||{};const clean=x=>String(x??'').replace(/[\r\n]/g,' ').slice(0,500);
 const answers=Array.isArray(b.answers)?b.answers.slice(0,50).map(a=>({id:Number(a.id)||0,part:clean(a.part),question:clean(a.question),choice:clean(a.choice),correctAnswer:clean(a.correctAnswer),isCorrect:Boolean(a.isCorrect)})):[];
 const bonusRaw=b.bonus&&typeof b.bonus==='object'?b.bonus:{};
 const bonus=Object.fromEntries(Object.entries(bonusRaw).map(([k,v])=>[clean(k).slice(0,8),clean(v)]));
 const entry={name:clean(b.name),group:clean(b.group),score:Number(b.score)||0,correct:Number(b.correct)||0,total:Number(b.total)||50,status:clean(b.status),startedAt:clean(b.startedAt),submittedAt:clean(b.submittedAt),loggedAt:new Date().toISOString(),attempt:Math.max(1,Number(b.attempt)||1),answers,bonus};
 try{
  const h={Authorization:`Bearer ${token}`,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'erc-test-results'};
  const getFile=async path=>{const url=`https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`;const r=await fetch(url,{headers:h});if(r.status===404)return{url,sha:null,content:''};if(!r.ok)throw new Error('read failed');const j=await r.json();return{url,sha:j.sha,content:Buffer.from(j.content,'base64').toString('utf8')}};
  const putFile=async(path,message,content,sha)=>{const url=`https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`;const r=await fetch(url,{method:'PUT',headers:{...h,'Content-Type':'application/json'},body:JSON.stringify({message,content:Buffer.from(content).toString('base64'),...(sha?{sha}:{})})});if(!r.ok)throw new Error('write failed')};

  const raw=await getFile(PATH);
  const rows=raw.content.trim()?raw.content.trim().split('\n').filter(Boolean).map(x=>{try{return JSON.parse(x)}catch{return null}}).filter(Boolean):[];
  rows.push(entry);
  await putFile(PATH,`Log test result: ${entry.name||'student'} - ${entry.score}/100`,raw.content+JSON.stringify(entry)+'\n',raw.sha);

  const esc=x=>String(x??'').replace(/\|/g,'\\|');
  const header='| # | Student | Group | Score | Correct | Attempt | Status | Started (UTC) | Submitted (UTC) | Logged (UTC) |\n|---:|---|---|---:|---:|---:|---|---|---|---|\n';
  const table=header+rows.map((r,i)=>`| ${i+1} | ${esc(r.name)} | ${esc(r.group||'—')} | ${r.score}/100 | ${r.correct}/${r.total} | ${r.attempt||1} | ${esc(r.status)} | ${esc(r.startedAt)} | ${esc(r.submittedAt)} | ${esc(r.loggedAt)} |`).join('\n')+'\n';
  const resultMd=await getFile('logs/RESULTS.md');
  await putFile('logs/RESULTS.md',`Update results table: ${entry.name||'student'}`,'# Student Test Results\n\nNewest submissions appear at the bottom. Every attempt is retained.\n\n'+table,resultMd.sha);

  const safeName=(entry.name||'student').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60)||'student';
  const studentPath=`logs/students/${safeName}.md`;
  const studentFile=await getFile(studentPath);
  const allForStudent=rows.filter(r=>String(r.name||'').trim().toLowerCase()===String(entry.name||'').trim().toLowerCase());
  const renderAttempt=(r,idx)=>{const answerRows=(Array.isArray(r.answers)?r.answers:[]).map(a=>`| ${a.id} | ${esc(a.part)} | ${esc(a.question)} | ${esc(a.choice||'—')} | ${esc(a.correctAnswer||'—')} | ${a.isCorrect?'✅':'❌'} |`).join('\n');const bonusRows=Object.entries(r.bonus||{}).map(([k,v])=>`- **${esc(k)}:** ${esc(v||'—')}`).join('\n');return `## Attempt ${r.attempt||idx+1} — ${r.score}/100\n\n- **Status:** ${esc(r.status)}\n- **Group:** ${esc(r.group||'—')}\n- **Started:** ${esc(r.startedAt)}\n- **Submitted:** ${esc(r.submittedAt)}\n- **Logged:** ${esc(r.loggedAt)}\n\n### Answers\n\n| # | Section | Question | Student choice | Correct answer | Result |\n|---:|---|---|---|---|:---:|\n${answerRows||'| — | — | No answer data was stored for this older attempt. | — | — | — |'}\n\n### Bonus responses\n\n${bonusRows||'_No bonus responses._'}\n`};
  const studentDoc=`# ${entry.name||'Student'} — Test Attempts\n\nAll stored attempts for this student, grouped by attempt.\n\n${allForStudent.map(renderAttempt).join('\n---\n\n')}`;
  await putFile(studentPath,`Update student answers: ${entry.name||'student'}`,studentDoc,studentFile.sha);

  return res.status(200).json({ok:true,studentPath});
 }catch(e){return res.status(500).json({error:'Could not log result'})}
}