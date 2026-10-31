process.env.GOOGLE_CLIENT_ID='test'; process.env.GOOGLE_CLIENT_SECRET='test';
process.env.DATABASE_URL='postgresql://test:test@127.0.0.1:1/test';
process.env.SESSION_SECRET='test-only';
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const config = require('../dist/config/prisma');
const client = config.prisma;
const port = 33847;
async function main() {
    const rows=[];
    config.prisma={user:{
      findFirst: async ({where})=>rows.find(u=>u.email===where.email.equals),
      create: async ({data,select})=>{const u={...data,id:crypto.randomUUID(),memberships:[]};rows.push(u);return Object.fromEntries(Object.keys(select).map(k=>[k,u[k]]))},
      findUnique: async ({where,select})=>{const u=rows.find(u=>u.id===where.id);return u && Object.fromEntries(Object.keys(select).map(k=>[k,u[k]]))}
    }};
    const session=require('express-session');
    const sessionPath=require.resolve('../dist/config/session');
    require.cache[sessionPath]={loaded:true,exports:{sessionMiddleware:session({secret:crypto.randomUUID(),resave:false,saveUninitialized:false})}};
    process.env.PORT = String(port);
    require('../dist/index');
    let cookie = '';
    async function call(path, status, data) {
      const response = await fetch('http://127.0.0.1:'+port+'/api/'+path, {
        method: data ? 'POST' : 'GET', redirect:'manual',
        headers:{'Content-Type':'application/json', origin:'http://localhost:4200', cookie},
        body:data && JSON.stringify(data)
      });
      assert.equal(response.status,status,path);
      assert.equal(response.headers.get('access-control-allow-credentials'),'true');
      if (path==='auth/login' && status===200) {
        const header=response.headers.get('set-cookie');
        assert.match(header,/HttpOnly/i); cookie=header.split(';')[0];
      }
      if (status===302) { assert.match(response.headers.get('location'),/^https:\/\/accounts.google.com\//); return; }
      return response.json().catch(()=>null);
    }
    const email='gym-test-'+crypto.randomUUID()+'@example.invalid';
    const password=crypto.randomBytes(24).toString('hex');
    await call('dashboard',401);
    await call('auth/google',302);
    const {user}=await call('auth/register',201,{name:'Prueba de sesión',email,password,role:'admin'});
    assert.equal(user.role,'member');
    await call('auth/login',401,{email,password:'incorrecta'});
    const login=await call('auth/login',200,{email:' '+email.toUpperCase()+' ',password,role:'admin'});
    assert.equal(login.user.role,'member');
    assert.equal((await call('auth/me',200)).user.id,user.id);
    const profile=await call('users/me',200);
    assert.equal(profile.user.id,user.id);
    assert.equal(profile.user.passwordHash,undefined);
    await call('users/otra-cuenta',403);
    await call('dashboard',403);
    await call('auth/logout',200,{});
    await call('auth/me',401);
    rows[0].role='admin';
    assert.equal((await call('auth/login',200,{email,password})).user.role,'admin');
    await call('auth/logout',200,{});
    console.log('PASS registro, Google redirect, login member/admin, permisos, perfil, cookies, logout');

}
main().catch(error => {
  console.error('Prueba fallida:', error.message);
  process.exitCode = 1;
}).finally(async () => {
  await client.$disconnect();
  process.exit(process.exitCode || 0);
});
