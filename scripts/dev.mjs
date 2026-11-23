import { spawn, execFileSync } from 'node:child_process';
execFileSync('npm', ['run', 'build:css'], {stdio:'inherit'});
const children = [spawn('node_modules/.bin/tailwindcss', ['-i','assets/css/main.css','-o','static/css/main.css','--watch'], {stdio:'inherit'}), spawn('hugo', ['server','--bind','127.0.0.1','--port','1313','--disableFastRender'], {stdio:'inherit'})];
for (const signal of ['SIGINT','SIGTERM']) process.on(signal, () => {children.forEach(p => p.kill(signal)); process.exit();});
