// Run --write before a redeploy, then --check after it, inside the deployed service.
import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID, createHash } from 'node:crypto';
const mode=process.argv[2];
if(!['--write','--check'].includes(mode))throw Error('Use --write antes do redeploy ou --check depois.');
const root=path.resolve(process.env.JAGUAR_UPLOAD_DIR||'/data/jaguar/uploads');
const directory=path.join(root,'products');const marker=path.join(directory,'.jaguar-persistence-check.json');
await fs.mkdir(directory,{recursive:true});
if(mode==='--write'){
 const content=randomUUID();const testName=`.jaguar-persistence-${content}.txt`;
 await fs.writeFile(path.join(directory,testName),content,{flag:'wx'});
 await fs.writeFile(marker,JSON.stringify({testName,hash:createHash('sha256').update(content).digest('hex'),createdAt:new Date().toISOString()}));
 console.log('Gravação confirmada. Faça o redeploy e execute --check. Diretório:',directory);
}else{
 const saved=JSON.parse(await fs.readFile(marker,'utf8'));
 if(!/^\.jaguar-persistence-[a-f0-9-]+\.txt$/.test(saved.testName))throw Error('Nome de verificação inválido.');
 const content=await fs.readFile(path.join(directory,saved.testName));
 if(createHash('sha256').update(content).digest('hex')!==saved.hash)throw Error('Conteúdo persistente divergente.');
 console.log('Arquivo anterior permanece acessível. Criado em:',saved.createdAt,'Diretório:',directory);
}
if(process.platform==='linux'){
 const mounts=await fs.readFile('/proc/self/mountinfo','utf8');
 console.log('Mounts sob /data (conferir origem/volume persistente no EasyPanel):');
 console.log(mounts.split('\n').filter(line=>line.split(' ')[4]?.startsWith('/data')).join('\n')||'Nenhum mount sob /data identificado; verifique a configuração do serviço.');
}
