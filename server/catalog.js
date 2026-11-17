import {products} from './products.js';
export function searchCatalog({q='',category='All',sort='featured'}={}){
 const terms=String(q).toLowerCase().trim().split(/\s+/).filter(Boolean).map(t=>t.length>3?t.replace(/s$/,''):t);
 const result=products.filter(p=>(category==='All'||p.category===category)&&terms.every(term=>(p.name+' '+p.category+' '+p.description+' '+p.brand+' '+p.kind+' '+p.features.join(' ')).toLowerCase().includes(term)));
 if(sort==='price-asc')result.sort((a,b)=>a.price-b.price);
 if(sort==='price-desc')result.sort((a,b)=>b.price-a.price);
 if(sort==='rating')result.sort((a,b)=>b.rating-a.rating);
 return result;
}
