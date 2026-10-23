// Minimal HTML-token tree for renderer-generated fragments (not a browser DOM).
// Monetary values may legitimately repeat across different price columns; controls
// act on distinct items. Detect duplicated textual labels/reasons, not those values.
const decode=s=>s.replace(/&(?:amp|lt|gt|quot|#39);/g,x=>({'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&#39;':"'"}[x])).replace(/[\u200e\u200f\u2066-\u2069]/g,'').normalize('NFKC').replace(/\s+/g,' ').trim();
function tree(html){const root={tag:'root',attrs:'',text:'',children:[]},stack=[root];for(const m of html.matchAll(/<\/?([a-zA-Z][\w:-]*)\b[^>]*>|([^<]+)/g)){if(m[2]!==undefined){stack.at(-1).text+=m[2];continue;}if(m[0].startsWith('</')){if(stack.length>1)stack.pop();continue;}const n={tag:m[1].toLowerCase(),attrs:m[0],text:'',children:[]};stack.at(-1).children.push(n);if(!['input','br','img','hr','meta','link'].includes(n.tag))stack.push(n);}return root;}
function walk(n){return [n,...n.children.flatMap(walk)]}
function labels(n){return walk(n).filter(x=>!x.children.length&&!['button','a','summary','script','style'].includes(x.tag)).map(x=>decode(x.text)).filter(s=>/[א-תA-Za-z]/.test(s))}
function duplicates(n){const counts=new Map();for(const label of labels(n))counts.set(label,(counts.get(label)||0)+1);return [...counts].filter(([,count])=>count>1)}
function rows(html){return walk(tree(html)).filter(n=>/data-(?:network|unavailable|unknown)-chain=/.test(n.attrs))}
module.exports={tree,walk,labels,duplicates,rows};
