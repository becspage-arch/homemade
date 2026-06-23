import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
let d = __dirname
for (let i=0;i<12;i++){const c=resolve(d,'.env.credentials');if(existsSync(c)){loadEnv({path:c,override:true});break}const p=dirname(d);if(p===d)break;d=p}
import { generateWithFluxPro, FluxBillingError } from '../../../apps/web/src/lib/image-sourcing/flux-pro'
async function main(){
  let ok=0
  for(let i=0;i<5;i++){
    try { await generateWithFluxPro('a single red apple on a plate, food photo', {width:1024,height:768}); ok++; console.log(`call ${i+1}: OK`) }
    catch(e:any){ console.log(`call ${i+1}: ${e instanceof FluxBillingError?'BILLING':'OTHER'} -> ${String(e?.message||e).slice(0,200)}`); break }
  }
  console.log(`succeeded ${ok}/5`)
  process.exit(0)
}
main()
