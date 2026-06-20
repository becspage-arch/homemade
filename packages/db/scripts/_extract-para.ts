import fs from 'fs';
import path from 'path';

const [,, filePath, paraIndexStr] = process.argv;
if (!filePath || !paraIndexStr) {
  console.error('Usage: tsx _extract-para.ts <file> <paraIndex>');
  process.exit(1);
}

const absPath = path.resolve(process.cwd(), filePath);
const d = JSON.parse(fs.readFileSync(absPath, 'utf-8'));

function extractParas(content: any[]): { idx: number; blockIdx: number; text: string }[] {
  const result: { idx: number; blockIdx: number; text: string }[] = [];
  for (let i = 0; i < content.length; i++) {
    const block = content[i];
    if (block.type === 'paragraph') {
      const text = (block.content || []).map((n: any) => n.text || '').join('');
      result.push({ idx: result.length, blockIdx: i, text });
    }
  }
  return result;
}

const paras = extractParas(d.body.content);
const targetIdx = parseInt(paraIndexStr, 10);
const para = paras[targetIdx];
if (!para) {
  console.log('All paragraphs:');
  for (const p of paras) {
    console.log(`[${p.idx}] (block ${p.blockIdx}): ${p.text.substring(0, 120)}`);
  }
} else {
  console.log(`paragraph[${targetIdx}] at block[${para.blockIdx}]:`);
  console.log(para.text);
}
