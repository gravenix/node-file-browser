var http = require('http');
var fs = require('fs');


const header = "<html>"
				+"<head>"
				 +"<meta charset=\"uft-8\">"
				 +"<link rel=\"stylesheet\" href=\"style.css\">"
				 +"<title>Pliki - %filepath%</title>"
				+"</head>"
				+"<body>";

const footer = "</body></html>";

//load config
var _dir;
let fConfig = fs.readFileSync('./config.conf').toString().split('\n');
for(let e in fConfig){
	let el = fConfig[e].split('=');
	if(el.length>1){
		if(el[0]==='dir'){
			_dir = el[1].replace(/["]/g, "");
			console.log("Directory: "+_dir);
		}
	}
}
const dir = _dir;

http.createServer(generateWebpage).listen(8090);
console.log("HTTP server started... Press Ctrl+C to end task");

function generateWebpage(req, res){
	if(req.url==="/style.css"){
		fs.readFile('./style.css', (err, data) => {
			res.setHeader('Content-Type', 'text/css; charset=utf-8');
			res.write(data);
			res.end();
		});
		return;
	}
	res.setHeader('Content-Type', 'text/html; charset=utf-8');
	res.setHeader('Content-Language', 'pl-PL');

	res.write(header.replace("%filepath%", "/"));
	res.write('<h1>Przeglądarka plików!</h1>');
	getFiles(res);
}

function getFiles(res){
	fs.readdir(dir, (err, files) =>{
		for(let i in files){
			res.write("<a>"+files[i]+"</a>");
		}
		res.end(footer);
	});
}