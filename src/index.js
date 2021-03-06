var http = require('http');
var fs = require('fs');


const header = "<html>"
				+"<head>"
				 +"<meta charset=\"uft-8\">"
				 +"<link rel=\"stylesheet\" href=\"/style.css\">"
				 +"<title>Pliki - %filepath%</title>"
				+"</head>"
				+"<body>";

const footer = "</body></html>";

//load config
var _dir;
let fConfig = fs.readFileSync('./config.conf').toString().split(/\r?\n/);
for(let e in fConfig){
	let el = fConfig[e].split('=');
	if(el.length>1){
		if(el[0]==='dir'){
			_dir = el[1].replace(/["]/g, "");
			console.log("Directory: "+_dir);
		} else if(el[0]==='port'){
			_port = parseInt(el[1]);
		}
	}
}
//set config constants
const dir = _dir;
const port = _port;

//create server
http.createServer(generateWebpage).listen(port);
console.log("HTTP server started on port "+port.toString()+"... Press Ctrl+C to end task");

function generateWebpage(req, res){
	if(req.url==="/style.css"){
		fs.readFile('./style.css', (err, data) => {
			res.setHeader('Content-Type', 'text/css; charset=utf-8');
			res.write(data);
			res.end();
		});
		return;
	} else if(req.url.startsWith("/icon/")){
		fs.readFile('.'+req.url, (err, data) => {
			if(err) return;
			res.setHeader('Content-Type', 'image/*;');
			res.write(data);
			res.end();
		});
		return;
	}

	res.setHeader('Content-Type', 'text/html; charset=utf-8');
	//res.setHeader('Content-Language', 'pl-PL');

	try{
		getFiles(res, decodeURI(req.url));
	} catch(err){
		//TODO Error page
		console.log(err.toString());
	}
}

function getFiles(res,url){
	let path = dir + url;

	if(!path.endsWith("/")) path += "/";

	if(fs.lstatSync(path).isDirectory()){
		fs.readdir(path, (err, files) =>{
			res.write(header.replace("%filepath%", url));
			res.write('<h1>File Browser - '+url+'</h1>');
			res.write('<div>');
			res.write(getFilesHTML(files, path, url));
			res.write('</div>');
			res.end(footer);
		});
	} else{
		getFile(res, path);
	}
}

//puts file in response
function getFile(res, file){
	res.setHeader('Content-Type', 'text/plain;');
	fs.readFile(file, (err, data)=>{
		res.end(data);
	});
}

function getFilesHTML(files, path, url){
	let d="";
	let f="";
	let parent = url.split('/').slice(0, -1).join('/');
	let tmp;

	if(url!="/") 
		d += "<a href=\""+(parent==""?"/":parent)+"\">.. Back</a>";
	for(let i in files){
		tmp = getALinkTo(files[i], path, url);
		if(tmp.type === 'directory')
			d += tmp.html;
		else 
			f += tmp.html;
	}
	if(files.length===0){
		d += '<h2 class="notice">This directory is empty</h2>'
	}
	return d+f;
}

function getALinkTo(filename, path, url){
	let html = '<a href="'+url+(url.length>1?"/":"")+filename+'">';
	let type;
	let stat = fs.lstatSync(path+filename);

	if(stat.isDirectory()){
		html += '<img src="/icon/folder.png" />';
		type = 'directory';
	} else{
		html += '<img src="/icon/file.png" />';
		type = 'file';
	}
	html += '<span>'+filename+'</span>';
	if(type==='file') {
		html += '<span class="size">'+convertSize(stat.size)+'</span>';
		html += '<span class="date">'+stat.mtime.toDateString()+'</span>';
	}
	html += '</a>';
	return {
		type: type,
		html: html
	};
}

function convertSize(size){
	const unit = ['B', 'KB', 'MB', 'GB', 'TB'];
	let u_id=0;

	while(size>1024) {
		size=Math.round(size/1024);
		u_id++;
	}
	return size+" "+unit[u_id];
}