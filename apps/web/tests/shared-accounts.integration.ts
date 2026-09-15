import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {test,after} from 'node:test';
import {readAccountConfig} from '../src/server/config.ts';
import {getDatabase} from '../src/server/database.ts';
import {syncSharedProfile,removeSharedProductData} from '../src/server/shared-account.ts';
import {saveMod,savedMods,publicMember} from '../src/server/community.ts';
const enabled=process.env.MODLOCK_TEST_SHARED==='1';
const integration=enabled?test:test.skip;
integration('reclaimed canonical handle moves no saved product data between users',async()=>{
 const config=readAccountConfig(),url=new URL(config.databaseUrl);
 assert.equal(config.mode,'shared');assert.ok(['localhost','127.0.0.1','[::1]'].includes(url.hostname));assert.match(url.pathname,/^\/modlock_shared_[a-f0-9]{12,32}$/);
 const db=getDatabase(),a=randomUUID(),b=randomUUID(),name=`qa_${a.slice(0,8)}`;
 const profile=(id:string,username:string)=>({issuer:'http://127.0.0.1:3012',session:{id:randomUUID(),createdAt:new Date().toISOString(),expiresAt:new Date(Date.now()+60000).toISOString()},user:{id,username,usernameDisplay:username,name:username,image:null,bio:'',email:null,emailVerified:false,verified:true,steamId:'76561198000000001',createdAt:new Date().toISOString()}});
 try {
  await syncSharedProfile(profile(a,name));await saveMod(a,'mod-123',true,null);
  await db.query('UPDATE member_profile SET is_public=true WHERE user_id=$1',[a]);
  await syncSharedProfile(profile(b,name)); // A renamed centrally, without returning here.
  assert.equal((await db.query('SELECT handle FROM member_profile WHERE user_id=$1',[b])).rows[0].handle,name);
  assert.equal((await db.query('SELECT handle FROM member_profile WHERE user_id=$1',[a])).rows[0].handle,null);
  assert.equal((await savedMods(a)).length,1);assert.equal((await savedMods(b)).length,0);
  assert.equal((await db.query('SELECT is_public FROM member_profile WHERE user_id=$1',[a])).rows[0].is_public,true);
  await syncSharedProfile(profile(a,`${name}_new`));
  assert.equal((await savedMods(a)).length,1);
  await db.query('DELETE FROM "user" WHERE id=$1',[a]);
  assert.equal((await savedMods(a)).length,0);
  assert.equal((await db.query('SELECT user_id FROM member_profile WHERE user_id=$1',[a])).rowCount,0);
 }finally{await db.query('DELETE FROM "user" WHERE id=ANY($1)',[[a,b]]);}
});

after(async()=>{if(enabled)await getDatabase().end();});
integration('shared public member rejects a renamed or centrally hidden account',async()=>{
 const db=getDatabase(),id=randomUUID(),handle=`qa_${id.slice(0,8)}`,originalFetch=globalThis.fetch;
 try{
  await db.query('INSERT INTO "user"(id,name,"createdAt","updatedAt") VALUES ($1,$2,now(),now())',[id,'Cached name']);
  await db.query('INSERT INTO member_profile(user_id,handle,bio,is_public) VALUES ($1,$2,$3,true)',[id,handle,'Cached private bio']);
  let current:unknown={id,username:handle,displayName:'Current name',bio:null};
  globalThis.fetch=async()=>Response.json({issuer:process.env.PORTFOLIO_ISSUER || 'https://buildlock.net',profile:current});
  assert.equal((await publicMember(handle))?.name,'Current name');assert.equal((await publicMember(handle))?.bio,'');
  current={id,username:handle+'_new',displayName:'Current name',bio:'public'};assert.equal(await publicMember(handle),null);
  for(const state of ['suspended','deletion requested','deleted']){current=null;assert.equal(await publicMember(handle),null,state);}
 }finally{globalThis.fetch=originalFetch;await db.query('DELETE FROM "user" WHERE id=$1',[id]);}
});
integration('shared data removal preserves data on failures and anonymizes retained reports on success',async()=>{
 const db=getDatabase(),id=randomUUID(),report=randomUUID();let revoked=0;
 try{
  await db.query('INSERT INTO "user"(id,name,"createdAt","updatedAt") VALUES ($1,$2,now(),now())',[id,'Removal fixture']);
  await db.query('INSERT INTO member_profile(user_id,handle) VALUES ($1,$2)',[id,`qa_${id.slice(0,8)}`]);
  await saveMod(id,'mod-123',true,null);
  await db.query("INSERT INTO mod_report(id,reporter_id,mod_key,reason,detail,request_key) VALUES ($1,$2,'mod-123','other','A synthetic fixture report',$3)",[report,id,randomUUID()]);
  await assert.rejects(()=>removeSharedProductData(id,async()=>{throw new Error('Issuer unavailable');}));
  assert.equal((await savedMods(id)).length,1);
  await db.query('CREATE TABLE removal_test_guard (id text REFERENCES "user"(id))');
  await db.query('INSERT INTO removal_test_guard VALUES ($1)',[id]);
  await assert.rejects(()=>removeSharedProductData(id,async()=>{revoked++;}));
  assert.equal(revoked,1);assert.equal((await savedMods(id)).length,1);
  await db.query('DROP TABLE removal_test_guard');
  await removeSharedProductData(id,async()=>{revoked++;});assert.equal(revoked,2);
  assert.equal((await savedMods(id)).length,0);
  assert.equal((await db.query('SELECT * FROM member_profile WHERE user_id=$1',[id])).rowCount,0);
  assert.equal((await db.query('SELECT reporter_id FROM mod_report WHERE id=$1',[report])).rows[0].reporter_id,null);
 }finally{await db.query('DROP TABLE IF EXISTS removal_test_guard');await db.query('DELETE FROM "user" WHERE id=$1',[id]);await db.query('DELETE FROM mod_report WHERE id=$1',[report]);}
});
