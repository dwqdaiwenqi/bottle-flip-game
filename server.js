var express = require('express');
var bodyParser = require('body-parser');

var app = express();
var fs = require('fs');

var app = require('express')();

var http = require('http');
var request = require('request');
var colors = require('colors');
var cookieParser = require('cookie-parser');
app.use(require('cookie-parser')());


//nodemon --watch server.js server.js

// request('http://192.168.84.91:1234/api/aaa', function (error, response, body) {
// 	console.log(body);
//   //console.log(body);
// });
 
// //http://api/
// request.post({url:'http://192.168.84.91:1234/api/bbb', formData: {}}, function optionalCallback(err, httpResponse, body) {
//   if (err) {
//     return console.error('upload failed:', err);
//   }
//   console.log('Upload successful!  Server responded with:', body);
// });


app.use('/dist',express.static(__dirname + '/dist/'));
app.use('/src',express.static(__dirname + '/src/'));
app.use('/img',express.static(__dirname + '/img/'));
app.use('/music',express.static(__dirname + '/music/'));

app.use(
	bodyParser.urlencoded({extended: true ,limit: '10mb'})
);

app.get('/', function (req, res) {
  //res.send('niconiconi !!!niconiconi !!niconiconi ');
  res.sendFile(__dirname+'/index.html');
});

app.get('/2', function (req, res) {
  //res.send('niconiconi !!!niconiconi !!niconiconi ');
  res.sendFile(__dirname+'/index2.html');
});

app.get('/3',(req,res)=>{
	res.sendFile(__dirname+'/index3.html');
});


var setRndCookie = (res,prefix)=>{
	var v = `${prefix}`+(Math.random()*10000|0);
	res.cookie(v,1);
}
//那个域名下跨域请求
//请求api并携带了Credentials：true,cookie是存在在与浏览器中
//前后端的cookie被独立设置了，前后端无法共享
//后端如果响应头带了Credentials：true那么那些后端api cookie可共享
app.get('/api/getindexvideo',(req,res)=>{


	res.end(
		JSON.stringify({
			error:0
			,data:{target:'http://www.baidu.com',link:'...'}
		})

	);
});

app.get('/api/next_grid',(req,res)=>{

	setTimeout(()=>{	
		res.end(
			JSON.stringify({
				goods:Math.random()>.5? {name:'goods!',cdk:`cdk-${Date.now()}`}:null
			})

		);

	},666);
	

});


app.get('/api/receive_goods',(req,res)=>{
	res.end('recieve-goods!!!');

});

app.get('/api/game_info',(req,res)=>{


	setTimeout(()=>{

		res.end(
			JSON.stringify({
				num_of_game:1
				,goods:[ 
					{name:'name-a',cdk:`cdk-${Date.now()}`}
					,{name:'name-b',cdk:`cdk-${Date.now()}`}  
				]
			})
		);
	},1234);
});


app.get('/api/record_score',(req,res)=>{
	res.end('record_score!!!');

});



app.get('/api/getindexvideoa',(req,res)=>{


	//"Access-Control-Allow-Credentials", "true"
	//"Access-Control-Allow-Origin", 'https://www.google.com'

	res.header('Access-Control-Allow-Origin', 'http://niconiconi.cn'); 
	res.header('Access-Control-Allow-Credentials', 'true'); 

	setRndCookie(res,'bed-videoa-cross-');

	console.log(
		'videoa cross-------'.yellow
		,Object.keys(req.cookies).map(k=>{
			return k;
		})
		,'-------videoa cross end---'.yellow
		
	);
	
	

	const o = {
		data:{
		
		}
	}

	
	//console.log(req.cookies);

	if(req.cookies.aa){
		o.data.hasCookie=true;
		o.data.cookies = req.cookies.aa;
	}else{
		o.data.hasCookie=false;
		o.data.cookies = req.cookies.aa;
	
	}

	res.end(JSON.stringify(o));
})

//mu.xy.com/mufed/repo/xxx.html
//===>proxy
//mu.xy.com/weixin/api
//api.mu.xy.com/xxxxx

//host
//192.168.84.91 mu.xy.com 
//[get] host+'/weixin/api/repo/fed-kickstart/rankInclude'
app.get('/weixin/api/repo/:name/rankInclude',function(req,res){
	res.header('Access-Control-Allow-Origin', '*'); 

	console.log('repo_name:',req.params.name);
	console.log('someone openid:',req.query.openid);
	//res.json({ user: 'tobi' });
	const o = {
		message:{}
		,data:{
			thatone:{score:'23'}
			,list:[{openid:'openid-xxx3',score:80},{openid:'openid-xxx3434',score:10}]
		}
	}
	res.end(JSON.stringify(o));
});

app.get('/weixin/api/statistics/:repo_name',function(req,res){
	
	res.header('Access-Control-Allow-Origin', '*'); 

	res.end(JSON.stringify( { message:'statistics!' ,data:{repo:req.params.repo_name}} ));

})

app.get('/weixin/api/pv/:repo_name',function(req,res){
	res.header('Access-Control-Allow-Origin', '*'); 
	res.end(JSON.stringify( {message:'statistics pv!!!!'}  ));
});


app.get('/weixin/api/playerGetReward/:openid',function(req,res){
	res.header('Access-Control-Allow-Origin', '*');

	setTimeout(()=>{
		res.end(JSON.stringify( {message:'get jf ok'}  ));
	},566);
	

})

app.get('/weixin/api/playerInfo/:openid',function(req,res){
	res.header('Access-Control-Allow-Origin', '*');

	setTimeout(()=>{
		res.end(JSON.stringify( {
			message:'playerInfo'
			,canplay:true
			,exist_jf:false
			//,exist_jf:true
		} ));
	},566)
	//res.end(JSON.stringify( {message:'playerInfo'} ));
	
})



app.post('/upload', function(req, res){
	
	//接收前台POST过来的base64
	var imgData = req.body.imgData;
	//过滤data:URL
	var base64Data = imgData.replace(/^data:image\/\w+;base64,/, '');
	var dataBuffer = new Buffer(base64Data, 'base64');
	
	fs.writeFile(`abc/image-${Date.now()}.png`, dataBuffer, function(err) {
	    if(err){
	      res.send(err);
	    }else{
	      res.send('success!!!');
	    }
	});

});


var server = app.listen(83, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('listening at:%s', port);
});