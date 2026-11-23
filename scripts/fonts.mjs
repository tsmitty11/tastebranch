import {mkdirSync,copyFileSync} from 'node:fs';
mkdirSync('static/fonts',{recursive:true});
for (const [source,target] of [['@fontsource-variable/mona-sans/files/mona-sans-latin-wdth-normal.woff2','mona-sans-latin-wdth-normal.woff2'],['@fontsource/inter/files/inter-latin-400-normal.woff2','inter-latin-400-normal.woff2']]) copyFileSync('node_modules/'+source,'static/fonts/'+target);
for (const [source,target] of [['@fontsource-variable/mona-sans/LICENSE','mona-sans-LICENSE.txt'],['@fontsource/inter/LICENSE','inter-LICENSE.txt']]) copyFileSync('node_modules/'+source,'static/fonts/'+target);
