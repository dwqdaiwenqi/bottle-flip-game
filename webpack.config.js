const fs = require('fs-extra');
const path = require('path');
const url = require('url');
const webpack = require('webpack');

const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CleanPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const AssetsPlugin = require('assets-webpack-plugin');
var cheerio = require('cheerio');
const shelljs = require('shelljs');

const pkg = require('./package.json');

var dir = path.parse(__filename).dir;

dir = dir.split(/\\/).pop();

const local_url = pkg['local-url']+dir+'/dist/';

const request = require('request');


const ENV = process.env.npm_lifecycle_event;


var config = {
  publicPath : 'dist/'
  ,path : __dirname+'/dist/'
  //,hmr : 0
  ,hmr :1

  ,static_sc:local_url

  ,plugins:[]
  ,port:2333

  ,filename:ENV!=='pro'? 'scripts/[name].js':'scripts/[name].js'
  ,chunkFilename:ENV!=='pro'?'scripts/chunk/[name]-[id].js':'scripts/chunk/[name]-[id].js'


}


config.plugins.push(function(){
  

  this.plugin('done',function(stats){

    try{
      if(fs.exists('src/common/img/_wxicon.jpg')){
        fs.copySync('src/common/img/_wxicon.jpg','dist/img/_wxicon.jpg');
      }


      fs.readdirSync('./').filter(s=>/\.html$/.test(s)).forEach(sss=>{

        fs.readFile(sss, 'utf-8', (err, data) => {

          const $ = cheerio.load(data, {
            decodeEntities: false
          });

          try{
            const json = fs.readJsonSync('./assets.json');
            const nodes = Object.keys(json).filter(s=>!(/metadata/.test(s)) ).map(s=>{
              var replacelist = [
                {tag:'script',name:s,attr:'src',val:json[s].js } 
                ,{tag:'css',name:s,attr:'href',val:json[s].css}
              ]
              replacelist.forEach(o=>{
                if(!o.val) return;     
                $(`${o.tag}[src*=${o.name}]`).attr(o.attr,o.val);
                //console.log(`${o.tag}[src*=${o.name}]`,o.attr,o.val);
              })
            })
          }catch(e){console.error(e);}
      
          
          request('http://'+pkg.local+'common/_publish.json', (error, response, body)=>{

            var obj = JSON.parse(body);

            
            const rg = (prefix,s)=> s.match(new RegExp(`\\/[\\w-]+\\/([\\w-]+?)(-\\w{6,8})?\\.${prefix}$`));

            $('script[src*=mu-mobile]').each((i,el)=>{
              var s = el.attribs.src;


              const ar = rg('js',s);


              $(el).attr('src' , 'http://'+(ENV==='pro'?pkg['pro-url']:pkg.local)+`common/${ar[1]}/${obj[ar[1]+'.js'].buildname}`);

              //console.log('//'+(ENV==='pro'?pkg['pro-url']:pkg.local)+`common/${ar[1]}/${obj[ar[1]+'.js'].buildname}`);
            });


            $('link[href*=mu-mobile]').each((i,el)=>{

              var s = el.attribs.href;
              const ar = rg('css',s);
             
              $(el).attr('href' , 'http://'+(ENV==='pro'?pkg['pro-url']:pkg.local)+`common/${ar[1]}/${obj[ar[1]+'.css'].buildname}`);

              //console.log('//'+(ENV==='pro'?pkg['pro-url']:pkg.local)+`common/${ar[1]}/${obj[ar[1]+'.css'].buildname}`);
              
            });

           
          });



          {
            const rg = /common\/(css|js)\/(.+)\.(js|css)$/;

            $('link[href*=normalize]').each(function(i,el){
              var s = el.attribs.href;
              const ar = s.match(rg);
              //console.log(`//${ENV==='dev'?pkg['dev-url']:pkg.local}common/${ar[1]}/${ar[2]}.${ar[3]}`);
              $(this).attr('href',`http://${ENV==='pro'?pkg['pro-url']:pkg.local}common/${ar[1]}/${ar[2]}.${ar[3]}`);

              //console.log(`//${ENV==='dev'?pkg['dev-url']:pkg.local}common/${ar[1]}/${ar[2]}.${ar[3]}`);
            });
           

            $('script[src*=jquery],script[src*=polyfill]').each(function(i,el){
              var s = el.attribs.src;

              if(!s) return;

              const ar = s.match(rg);
              if(!ar) return;
              //console.log(`//${ENV==='dev'?pkg['dev-url']:pkg.local}common/${ar[1]}/${ar[2]}.${ar[3]}`);
              $(this).attr('src',`http://${ENV==='pro'?pkg['pro-url']:pkg.local}common/${ar[1]}/${ar[2]}.${ar[3]}`);

            });
          }


          setTimeout(()=>{
            
            fs.writeFile(sss, $.html(), err => {
             //console.log('###');
            })
          },123);


        })
      })
    }catch(e){console.error(e);}
    
    

  })
});

// 启用热加载时 html中的‘／xx.js’引用服务器根目录，一定要改成绝对的"http://xxx.js"
if(ENV==='dev-hmr'){
  // config.plugins.push(new webpack.HotModuleReplacementPlugin());
  // Object.keys(config.entry).forEach((s)=>{
  //   config.entry[s].unshift('webpack/hot/dev-server');
  // });
  

} 

//每次重新启动webpack命令才会清空dist目录重新构建，就算用watch也没用！！
//启动了hmr，配置static_sc的话会情况目录导致错误！为了避免！

if(ENV==='pro'){
 

  config.filename='scripts/[name]-[chunkhash:6].js';
  //config.filename='scripts/[name].js';
 
  //config.plugins.push( new CleanPlugin(['dist/*/*.*']));
  config.plugins.push( new CleanPlugin(['dist/**/*']));
 
  config.plugins.push(new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false
    }
  }));

  //////////////
  config.publicPath =  '//'+pkg['pro-url']+dir+'/dist/';

}

config.plugins.push(

 new webpack.BannerPlugin(`@author  ${pkg.name}<${pkg.email}>\r\n@lastest ${new Date}}`)


 ,new AssetsPlugin({
  fullPath: true
  ,filename:'assets.json'
  ,metadata: {version: 1}
  ,processOutput: function (assets) {
    return JSON.stringify(assets);
  }
})

  ,new webpack.DefinePlugin({
   // __DEV__: JSON.stringify(process.env.npm_lifecycle_event),
    'process.env.NODE_ENV': JSON.stringify(ENV==='pro'?'production':'development')
  })

);

;

///

module.exports = {
  // entry: config.entry
  entry:{
    main1:'./src/main1.js'

  }
  ,devtool: ENV==='pro'?'source-map':'eval-source-map'
  ,output: {
    //console.log(path.join(__dirname,'/dist/scripts'));
    path: config.path
   
    ,publicPath : config.publicPath

    //相对path
    ,chunkFilename:config.chunkFilename
    ,filename: config.filename
    ,library:  'TiaoYiTiao'
    ,libraryTarget: 'umd'
  }

  ,resolve: {

    extensions: ['.js', '.jsx', '.css','.png','.jpg','.less', '.gif','.webp'] 

    ,alias: {

     
     XButton: '../Common/XButton/XButton'
   
    }
  }
  ,module: {
     rules: [
       {
         test: /\.(css|less)$/,
         use: [

           'style-loader',
           'css-loader',
           {
            loader: 'postcss-loader',
            options: {
              plugins: ()=>[require('autoprefixer')]
            }},  
           'less-loader'
         ]
       },

  
       {
        test: /\.(png|jpg|jpeg|gif|webp)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              publicPath:''
             ,name :'img/[name].[ext]?[hash:6]'

            }
          }
        ]
        },
   
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {

          presets: ['env', 'stage-3', 'react']

        }
      },
 
      {
        test: /\.(mp3|aac|ogg|mp4|wav)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name:'media/[name].[ext]?[hash:6]'
              
            }  
          }
        ]
      },
      {
        test: /\.(ttf|otf|svg)$/,
        use : [
          {
            loader:'file-loader',
            options: {
              name:'font/[name].[ext]?[hash:6]'
            }
          }

        ]
      },
      {
         test: /\.json$/ ,
         use:['json-loader']
      }
     ]
   }

  ,externals: {
      
  }
  ,plugins:config.plugins
  ,stats: {
    // Nice colored output
    colors: true
  }
  ,devServer: {
   //  hot: true
   // ,inline: true
   contentBase: path.join(__dirname)
  }
}

///////////////////
