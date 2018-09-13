import './tiaoyitiao.less';
import './freecamera';
import Cube from './cube';
import TWEEN from 'miku-tween';
import Tree from './tree';
import InfinityElement from './infinity_element';
import ChessMan from './chessman';
import BillBoard from './billboard';
import {TextureManager} from './texture_manager';
import Detector from './detector';

var Api = { };

{
  let {offsetWidth,offsetHeight} = document.body;
  let $game_container = $('#game_container');

  $game_container.on('touchstart',e=>{
    e.preventDefault()
  });

  
  if(K.Brower.version.mobile){
    $('#holder').css({width:'100%',height:'100%'})

    $game_container.width(offsetHeight).height(offsetWidth)
    .css({
      'transform-origin':'0% 0%'
      ,'transform':'rotateZ(90deg) translate3d(0%,-100%,0)',
    })
    
  }else{
    $game_container.width(offsetWidth).height(offsetWidth*.5)
    $(`<p style="font-size:32px;text-align:center;">pc端长按空格=w=</p>`).appendTo('#holder')
  }
}


export default K.Event.extend({
  init(opt){
    this._super();

    

    this.options = {
      can_play:true
      ,$container:$(document.body)
      ,status_msg:''
      ,can_play:false
    }

    Object.assign(this.options,opt);


    Api = opt.Api;

    this.$container = $(this.options.$container);
    this.status_msg = this.options.status_msg;
    this.can_play = this.options.can_play;
    

    if(!this._supportGl()){

      return this._noGlForYou();
    }


    this._max_phase = 100;

    this._phase = 0;
    this.score = 0;
    this._good_i = 0;
    this.goods = opt.goods;

    this._request = false;

    this.can_update_camera = false;

    this.mesh_points = [];

    this.v3_look = new THREE.Vector3(0,0,-1)
    .applyAxisAngle(new THREE.Vector3(1,0,0), .1 )
    .applyAxisAngle(new THREE.Vector3(0,1,0), -.2 );


    this.num_of_game = this.options.num_of_game;
    this.score = 0;
    this.current_grid = null;
    this._keydown = false;

   
    this.Phases = {};

    this._createStage();


    this.on('round_',()=>{

      //debugger;

      this.num_of_game--;

      console.log('%c round_,score:%s,num_of_game:%s','color:black;',this.score,this.num_of_game);

      //if(this.num_of_game<=0) return console.log('次数用尽');

      this.trigger('round-of-game',{score:this.score,num_of_game:this.num_of_game});

      this._restart();
      
    });



    //return;


   this._getGameResult().then(res=>{

    this._textures = res;

    this._createActor();

    this._createPhases();

    this._run();

    this._render();

   });

  }

  ,_getGameResult(){

    return new Promise(r=>{

      TextureManager.initial({
        boards_small:[
          //  require('./common/img/boardx2.jpg'),require('./common/img/boardx3.jpg'),require('./common/img/boardx6.jpg')
          //  ,require('./common/img/boardx.jpg'),require('./common/img/board3.jpg'),require('./common/img/boarda.jpg')
           require('./common/img/boardb.jpg'),require('./common/img/boarde.jpg'),require('./common/img/board1.jpg')
          //  ,require('./common/img/boardf.jpg'),require('./common/img/boardg.jpg')
         ]
        ,boards_big:[require('./common/img/game-board1.jpg'),require('./common/img/game-board2.jpg')]
        ,floor:[require('./common/img/floor2.jpg')]
        ,points:[ require('./common/img/score-1.png'), require('./common/img/score-2.png') ]
        //,chacters:[require('./common/img/gangdan3.png')]
      });
    
      TextureManager.onComplate(res=>{
        r(res);

      });


    })
    

  }

  ,_supportGl(){

    // if(document.querySelector && !window.addEventListener){
    //     alert('IE8')
    // }else{
    //   alert('> ie8');
    // }

    //console.log(K.Brower.version);
    return Detector.webgl?true: void function(){
      //var warning = Detector.getWebGLErrorMessage();
      //$('body')[0].appendChild(warning);

      
    }();

    
  }
  ,_noGlForYou(){
    //alert('no gl for you!');
    let d = document.createElement('div');
    d.id = 'no-gl-for-you';
    $(this.$container).append(d);
    d.innerHTML = `
      <span>浏览器君需要升级！或者换个浏览器再试！</span>
    `;

    //console.log(this.$container);

  }

  ,_noChance(){
    alert('次数用尽！');
  }
  ,_restart(){

    var that = this;

    this._zoom.show({
      phase0(){
        {

          that.cubes.forEach(o=>{
            that.scene.remove(o);
          });
    
    
          let cube_num = 2;
          let grid_height = 800;
    
          that.cubes = [...Array(cube_num)].map((v,i)=>{
            var mesh = Cube({
              height:grid_height
              ,billboard_map :that._textures.boards_small[that._textures.boards_small.length-1]
            });
    
            mesh.position.x = i/cube_num*100;
    
            that.scene.add(mesh);
            return mesh;
    
          });
    
    
        }
    
        that.current_grid = null;
        that._phase = 0;
        that.score = 0;
    
        let po = that.cubes[0].position;
    
        let {po1,po2} = {
          po1 : po.clone().add( new THREE.Vector3(0,that.cubes[0].geometry.parameters.height*.6,0  ) )
          ,po2 : po.clone().add( new THREE.Vector3(0,that.cubes[0].geometry.parameters.height*.5,0  ) )
        }
    
        Object.assign(FreeCamera,{
          x:po2.x,y:po2.y+100,z:po2.z+150
          // x:120,y:50,z:296
          ,speed:{front:8,back:8,left:3,right:3}
          //90--55
          ,θ:116,φ:165
          //,φ:154
        });



        that._infinity_tree.reset(that.scene);
        that._infinity_ground.reset(that.scene);

        that.mesh_score.setScore(that.score);

        that.chessman.position.copy(po2);
        
        that.chessman.start();
      }
      ,phase1(){
        
      }
    });


    


  }
  ,_addScore({score=1}={}){

    var that = this;

    this.score += score;

    this.mesh_score.setScore(this.score);

    this.trigger('score',{score:this.score});


    //console.log(score);
    //debugger;

    var w = this.chessman.geometry.parameters.radiusBottom;
    w*=(score>1?10:5);
    var dify = score>1?w*1.23:w*2.23;

    
    var mesh_point = new THREE.Mesh(
      new THREE.PlaneGeometry(w,w )
      ,new THREE.MeshBasicMaterial({
        map:this._textures.points[score-1]
        ,transparent:true
        ,side:THREE.DoubleSide
        
      })
    );
    this.scene.add(mesh_point);
    this.mesh_points.push(mesh_point);
    
    mesh_point.position.copy(
      this.chessman.position.clone()
      .add(new THREE.Vector3(0,dify,0))
    );


    new TWEEN.Tween({opacity:1,y:mesh_point.position.y})
    .to({opacity:0,y:mesh_point.position.y+10},366)
    .onUpdate(function(){
      mesh_point.position.y = this.y;
      mesh_point.material.opacity = this.opacity;

    })
    .onComplete(()=>{
      //that.scene.remove(mesh_point);

    })
    .start();


  }
  ,_run(){

    var {MoveToSpecialPo,FlipToHeight} = this.Phases;

    var mtsp = new MoveToSpecialPo();
    var fth = new FlipToHeight();
    
    var that = this;


    mtsp.on('clear',()=>{

      //return;

      fth.execute();

    });

    fth.on('clear',()=>{

      that.on('_keydown',()=>{

        if(!that.can_play) return;
        

        if(that._zoom.hidding) return;
        
        if(that._request) return;
  
        if(that.num_of_game===0) return;
  
        //if(that.num_of_game===0) return that._noChance();
        //if(that.num_of_game===0) return console.log('nochance!');
  
        if(that.chessman.canHolding()){
          //console.log('e');
          that.chessman.holding();
        } 
  
        
  
      });
  
      that.on('_keyup',()=>{
  
        if(!that.can_play) return alert(that.status_msg);
  
        

        if(that.num_of_game===0) return that._noChance();
  
        if(that.chessman.canFlipping()){
          that.chessman.flipping();
        }
  
      });


      //debugger;

      //return;
      this.light.position.set( 17, 30, 138);

      //console.log('clear!!!!!!!!!!!!!');

      this.can_update_camera = true;

      let po = this.cubes[0].position;


      let {po1,po2} = {
        po1 : po.clone().add( new THREE.Vector3(0,this.cubes[0].geometry.parameters.height*.6,0  ) )
        ,po2 : po.clone().add( new THREE.Vector3(0,this.cubes[0].geometry.parameters.height*.5,0  ) )
      }

      Object.assign(FreeCamera,{
        x:po1.x,y:po2.y+100,z:po1.z+150
        //x:po1.x,y:po1.y,z:po1.z+150
        // x:120,y:50,z:296
        ,speed:{front:8,back:8,left:3,right:3}
        //90--55
        ,θ:116,φ:165
        //,φ:154
      });

      FreeCamera.update();

      //console.log(2333333333333333333);


      new TWEEN.Tween({x:po1.x,y:po1.y,z:po1.z})
      .to(po2,1234)
      .delay(566)
      //TWEEN.Easing.Elastic.Out
      .easing(TWEEN.Easing.Bounce.Out)
      .onUpdate(function(){
        that.chessman.position.copy(
          new THREE.Vector3(this.x,this.y,this.z)
        );
      })
      .onComplete(function(){
        that.chessman.start();

        that.mesh_score.show();

      })
      .start();


    });


    addEventListener('keydown',(e)=>{

      if(e.keyCode===32) e.preventDefault();

      if(e.keyCode===32) this._keydown = true;

    });

    addEventListener('keyup',(e)=>{

      if(e.keyCode===32) e.preventDefault();

      if(e.keyCode===32){
        this._keydown = false;
        this.trigger('_keyup');
      }

    });


    addEventListener('touchstart',(e)=>{

      e.preventDefault();

        this._keydown = true;

    });

    addEventListener('touchend',(e)=>{

       e.preventDefault();

      
      this._keydown = false;
      this.trigger('_keyup');
      

    });

    mtsp.execute();

    //////////////

  }
  ,_createPhases(){
   
    var Phases = K.Event.extend({
      init(){
        this._super();
      }
      ,execute(){

      }
    });
    var that = this;

    var MoveToSpecialPo = Phases.extend({
      init(){
        this._super();
      }
      ,execute(){
        let {po1,po2} = {
          po1:new THREE.Vector3(-300,0,0)
          ,po2:new THREE.Vector3(60,0,0)
        }

        that.chessman.position.copy(
         po1.clone()
        )

        var po_chessman = that.chessman.position;

        //////
        // var mesh_chacter = new THREE.Mesh(
        //   new THREE.PlaneBufferGeometry(600,600)
        //   ,new THREE.MeshPhongMaterial({
        //     color:0x2d2d2d
        //     ,specular: 0x05050
        //     ,map: that._textures.chacters[0]
        //     ,transparent:true
        //     ,fog:false
        //   })
        // );
        // window.mesh_chacter = mesh_chacter;
        // that.scene.add(mesh_chacter);
        // mesh_chacter.position.copy(
        //   po_chessman.clone().add(new THREE.Vector3(0,300,-900) )
        // );

        /////


        //console.log(that._textures.boards_big);
        let billboard = that._addBillBoard({
          // position:po_chessman.clone().add(new THREE.Vector3(0,0,-900) )
          // ,delay:100
          position:po_chessman.clone().add(new THREE.Vector3(0,0,-900) )
          ,delay:0
          ,active_fall:false

          ,map : that._textures.boards_big[0]

          //,map : TextureManager.boards_big[0]

        });

        // billboard.rotation.y = .2;

        billboard = that._addBillBoard({
          position:po_chessman.clone().add(new THREE.Vector3(900,0,-800) )
          ,delay:666
          ,active_fall:false

          ,map : that._textures.boards_big[1]

        });

        billboard.rotation.y = -.5;

        let dx = po2.x-po1.x;

        that.camera.lookAt(
          that.camera.position.clone()
          .add(  that.v3_look )
        );

        that.camera.position.copy(
          that.chessman.position.clone().add(new THREE.Vector3(0,10,150))
        );


        setTimeout(()=>{

          that.chessman.fewFlip({
            onUpdate(po){
              //FreeCamera.x = po.x-20;
              //FreeCamera.y = po.y+10;
  
  
              that.camera.position.copy(
                new THREE.Vector3(po.x,po.y+10,po.z+150)
              );
  
              that.camera.lookAt(
                that.camera.position.clone()
                .add(  that.v3_look )
              );
             // FreeCamera.update();
            }
            ,po_increments:[...Array(3)].map((v,i)=>{
  
              return new THREE.Vector3(po_chessman.x+i/3*dx, 0, 0 )
            })
          })
          .then(res=>{
            this.trigger('clear',{});
            
          });


        },666);


        //debugger;
      }
    });

    var FlipToHeight = Phases.extend({
      init(){
        this._super();
      }
      ,execute(){


        console.log('F')
        var rx = 0;
        var me = this;

        that.chessman.flipToTop({
          height:400
          ,delay:566
          ,flip_dur:3333

          ,onFlipStart(){
            
            
            
            setTimeout(()=>{
              that.chessman.stopToTop();

              that._zoom.show({
                phase0(){
                  me.trigger('clear',{});
                }
                
              });

              

            },888)

    
          }
          ,onUpdate(po){
            
            let n = .02;
            rx +=n;

            //console.log(rx);

            if(rx>=.6) return;


            that.camera.lookAt(
              that.camera.position.clone()
              .add( that.v3_look.applyAxisAngle(new THREE.Vector3(1,0,0), n )  )
            );


          }
          ,onPer(){
            //debugger;
            //console.log('per');
          }
        })
        .then(res=>{
          //this.trigger('clear',{});

        })

      }
    });

    this.Phases = {
      MoveToSpecialPo
      ,FlipToHeight
    }
    
  }
  ,assignGoods({goods}={}){
    //this.goods = goods;


  }
  ,_setRandGoods(mesh){

    //if(++this._good_i===1) return; 
    //if(this._good_i===3) return mesh.setGood(this.goods.shift());


  }
  ,_createActor(){

    var that = this;

    {
      this._infinity_tree = new InfinityElement({
        far:3000,in_group_num:123
        ,handle_each_child(po1,far){
          var tree = Tree();
          tree.position.copy( 
            new THREE.Vector3(
              po1+far*random(),0,-350-random()*1800
            ) 
          );
  
          return tree;
        }
      });
  
    }
    

    { 
      let w = 10000;
      let map_ = this._textures.floor[0];

      this._infinity_ground = new InfinityElement({
        far:w,in_group_num:1
        ,handle_each_child(po1,far){
  
          var ground = new THREE.Mesh(
            new THREE.PlaneBufferGeometry( far, far)
   
            ,new THREE.MeshPhongMaterial( { 
              color: 0xffffff, specular: 0x050505 
              , map:map_
              //,transparent:true
            } )
      
          );
  
          ground.rotation.x = -Math.PI/2;
          ground.material.map.wrapS = ground.material.map.wrapT = THREE.RepeatWrapping;
          ground.material.map.repeat.set(80,80);
          ground.receiveShadow = true;
          
          //debugger;
        
  
          ground.position.copy( 
            new THREE.Vector3(
              po1+far*.5,0,0
            ) 
          );
  
          //console.log(ground.position);
  
          return ground;
        }
      });

    }

    {
      ///
      // let mesh_author = new THREE.Mesh(
      //   new THREE.BoxGeometry()
      //   ,new THREE.MeshPhongMaterial({})
      // );
      // this.scene.add(author_board);

      
    }
    
    {
      let cube_num = 2;
      let grid_height = 800;
      this.cubes = [...Array(cube_num)].map((v,i)=>{
        var mesh = Cube({ 
          height:grid_height
          ,billboard_map :that._textures.boards_small[random()*that._textures.boards_small.length|0]
        });

        mesh.position.x = i/cube_num*100;
        this.scene.add(mesh);

        //this._setRandGoods(mesh);

        return mesh;

      });


    }

    {
     
      this.chessman = ChessMan({});
      this.scene.add(this.chessman);
      this.chessman.onFilpEnd(()=>{
       
        var effect_ring = new THREE.Mesh(
        // innerRadius,outerRadius
          new THREE.RingBufferGeometry( 5, 7, 32 )
          ,new THREE.MeshBasicMaterial( {
            color: 0xffffff, side: THREE.DoubleSide
            ,transparent:true
          } )
        );

        that.scene.add(effect_ring);
        effect_ring.rotation.x = PI*.5;

        effect_ring.position.copy( 
          this.chessman.position.clone()
          .add(new THREE.Vector3(0,this.chessman.geometry.parameters.height*.16,0 ))
        );

        new TWEEN.Tween({t:1,a:1})
        .to({t:3,a:0},333)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate(function(){
          effect_ring.scale.set(this.t,this.t,this.t);
          effect_ring.material.opacity = this.a;
        })
        .onComplete(()=>{
          that.scene.remove(effect_ring)
        })
        .start();


      });
      
    }
     
    {
      let {width,height} = this.renderer.getSize();

      let cv_ = document.createElement('canvas');
      cv_.width = cv_.height = 100;
      let c = cv_.getContext('2d');

      this.mesh_score = new THREE.Mesh(
        new THREE.PlaneGeometry(100,100)
        ,new THREE.MeshBasicMaterial({
          map:new THREE.Texture(cv_)
          ,transparent:true
        })
      );
      
     
      this.orth_scene.add(this.mesh_score);

      let {parameters} = this.mesh_score.geometry;
      //debugger;
      this.mesh_score.position.copy(
        new THREE.Vector3(width*.5-parameters.width*.5,height*.5-parameters.height*.5,0)
      );

      Object.assign(this.mesh_score,{
        setScore(score){
          c.clearRect(0,0,cv_.width,cv_.height);
          c.font='40px Georgia';
          c.textAlign = 'center'
          c.fillText(score,cv_.width*.5,cv_.height*.5);
          this.material.map.needsUpdate = true;
        }
        ,show(){
          this.visible = true;
        }
        ,hide(){
          this.visible = false;
        }
      });
      
      this.mesh_score.setScore(0);
      this.mesh_score.hide();


     
    }
    
    {


      let {width,height} = this.renderer.getSize();
      let zoom = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(width,height)
        ,new THREE.MeshBasicMaterial({
          color: new THREE.Color().setRGB(0,0,0)
          ,transparent:true
        })
      );
      that.orth_scene.add(zoom);
      

      Object.assign(zoom,{
        hidding:false
        ,show({delay=0,delay2=888,dur=433,phase0,phase1}={}){
          var that = this;
          return new Promise(r=>{
            this.itv && this.itv.stop();
            this.itv = new TWEEN.Tween({opacity:0})
            .delay(delay)
            .to({opacity:1},dur)
            .onUpdate(function(){
              that.material.opacity = this.opacity;
              //console.log(this.opacity,'111111');
            })
            .onComplete(function(){
             // console.log('complete tw1')
              phase0&&phase0();
            });
            
            this.itv2 && this.itv2.stop();
            this.itv2 = new TWEEN.Tween({opacity:1})
            .delay(delay2)
            .to({opacity:0},dur)
            .onUpdate(function(){
              that.material.opacity = this.opacity;
              //console.log(this.opacity,'222222');
            })
            .onComplete(function(){
              //console.log('complete tw2')
              phase1&&phase1();
            });
            

            this.itv.chain(this.itv2);

            this.itv.start();


              
          })
        }
        ,hide(){
         
        }
      });


      // that._zoom.show({}).then(res=>{

      // });

      // that._zoom.hide({}).then(res=>{

      // });
      zoom.material.opacity = 0;
      

      that._zoom = zoom;

    


    }

    
  }
  ,_addBillBoard({position=new THREE.Vector3(0,0,0),delay=0,active_fall=true,map}){

    var billboard = BillBoard({
      map
    });

    this.scene.add(billboard);

    billboard.position.copy(position);
 
    billboard.onFallEnd(()=>{
     // debugger;

      if(!active_fall) return;

      this._infinity_tree.els.forEach((o)=>{
        o.flip({delay:random()*50});
      })

    })

    billboard.fallDown({delay });

    return billboard;
  }
  ,_addNextGrid(){

    this._request = true;

    this._handel_next_grid=(props)=>{
      this._request = false;

      let grid_height = 800;

      var {goods} = props;
      
      //{name:'name233',cdk:'cdk-123456'}
      var mesh = Cube({
        height:grid_height
        //,goods
        ,goods
        //,billboard:this._phase%2===0?true:false
        ,billboard:random()<.3?true:false
        ,billboard_map :this._textures.boards_small[random()*this._textures.boards_small.length|0]
      });

      mesh.castShadow = false;

      //console.log(this.goods);

      mesh.material.opacity = 1;

      //mesh.position.x = this.current_grid.position.x + 100;

      //var gap =  min(this._phase/this._max_phase,1)*50;
      var gap =  min(this._phase/this._max_phase,1)*100;

      mesh.position.x = this.current_grid.position.x + 50+random()*gap;
      

      this.scene.add(mesh);

      this.cubes.push(mesh);


      //debugger;
    }

    this.trigger('next-grid',{ 
      _phase:this._phase
      ,fn:this._handel_next_grid.bind(this)  
    });


    ///////////////////////////////

   
  }
  ,_checkChessManOutSide(){

    var po_ = this.chessman.position.clone();
    po_.y = max(po_.y,  this.cubes[0].position.y+this.cubes[0].geometry.parameters.height);
    
    let ray = new THREE.Raycaster(
      po_
      ,new THREE.Vector3(0,-1,0)
    );


    let intersects = ray.intersectObjects([...this.cubes]);
    //console.log(intersects.length);

    //console.log('len:',intersects.length);
    if( this.chessman.isOutside()) return;

    // document.title = `len:${intersects.length},status:${this.chessman.status}`;
    

    // console.log(this.chessman.status,'####');
    //console.log(this.chessman.position,'####');
    if(!intersects.length&&this.chessman.isStading()){
      this.chessman.fallDown({}).then(res=>{
        this.trigger('round_',{});

      });


      console.log('%c outside! status:%s','color:teal;',this.chessman.status);
      return;
    }

    if(intersects.length&&this.chessman.isStading()){

      let {distance,point,object} = intersects[0];

      if(!this.current_grid){
        this.current_grid = object;
      }


      if(this.current_grid!=object){
        this.current_grid = object;
        this._phase++;

        if(this.current_grid.goods){
          this.current_grid.displayGoods(this.scene);
          this.trigger('receive-goods',{...this.current_grid.goods});
        }
       
        //console.log(point);

        {
 

          let point_center = this.current_grid.position.clone().add(
            new THREE.Vector3(0,this.current_grid.geometry.parameters.height*.5,0)
          );

          var len = point.clone().sub(point_center).length();


          //console.log(len);

         //
          
        }

        this._addScore({ score:len<4?2:1});
        //this._addScore({ score:2});

        //console.log(this.this._phase);
        if(this._phase>0){
          //debugger;

          //addNextCube();
          this._addNextGrid();

        }

        if(this._phase%4==0){
          //addBillboard();
        }

        

        console.log('%c _phase:%s','color:red;',this._phase);
      }


    }
  }
  ,_trackChessMan(){
    if(this.chessman.isDied()) return;

    FreeCamera.x = this.chessman.position.x;
  }
  ,_render(){
    var that = this;
    //debugger;

    requestAnimationFrame(function animate(){
      requestAnimationFrame(animate);

      if(that._keydown) that.trigger('_keydown');

      TWEEN.update();

      //that.renderer.render(that.scene , that.camera);

      that.renderer.clear();
      that.renderer.render(that.scene, that.camera);
      that.renderer.clearDepth();
      that.renderer.render(that.orth_scene, that.orth_camera);


      //renderer.setSize($container.width(), $container.height());

      //console.log(that.$container.width(), that.$container.height());
      

      
      that._infinity_tree.render({x:Cam.x},that.scene);
      that._infinity_ground.render({x:Cam.x},that.scene);

      
      that._checkChessManOutSide();
      that._trackChessMan();

      that.cubes.forEach(o=>{
        o.goodsLookAt( new THREE.Vector3(FreeCamera.x,FreeCamera.y,FreeCamera.z)  );

      });

      
      if(that.can_update_camera) FreeCamera.update();

      

      //
    });
  }

  ,_createStage(){

    
    var {$container} = this;

    let [width,height] = [$container.width(),$container.height()];

    let scene = new THREE.Scene();
    let camera = new THREE.PerspectiveCamera( 30, $container.width()/$container.height(), .1, 10000 );
		//let camera = new THREE.PerspectiveCamera( 45, $container.width()/$container.height(), .1, 10000 );
    let renderer = new THREE.WebGLRenderer( {antialias:true} );
  //let renderer = new THREE.WebGLRenderer( {} );
    //renderer.setClearColor(0xeeeeee, 1);
    renderer.autoClear = false; // To allow render overlay on top of sprited sphere
    renderer.setClearColor(0x000000, 1);
    renderer.setSize($container.width(), $container.height());

    

		let orth_scene = new THREE.Scene();
		let orth_camera = new THREE.OrthographicCamera( -width/2, width / 2, height / 2, height / - 2, .1, 6000 );
    orth_camera.position.copy(new THREE.Vector3(0,0,10)); 
    
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

    $container.append(renderer.domElement);


    scene.background = new THREE.Color().setRGB( 0.6, 1, 1 );
    scene.fog = new THREE.FogExp2(scene.background, 0.0006 );


    FreeCamera({camera,el:$container[0],keycode_move:true});
			
    FreeCamera.update();


    var ambientLight = new THREE.AmbientLight(new THREE.Color().setRGB(.2,.2,.2));
    scene.add(ambientLight);


    var dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
    dirLight.color.setHSL( 0.1, 1, 0.8 );
    

    //正式玩
    dirLight.position.set( 17, 30, 138);


    //场外
    //30 69 47
    dirLight.position.set( 30 ,69, 47);
    
    scene.add( dirLight );

    dirLight.castShadow = true;
    // dirLight.shadow.mapSize.width = 2048;
    // dirLight.shadow.mapSize.height = 2048;

    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;

    var d = 1500;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.camera.near = -d;
    dirLight.shadow.camera.far = d;
    dirLight.shadow.bias = -0.0001;

    scene.add(  new THREE.DirectionalLightHelper(dirLight))


    this.light = dirLight;


    this.scene = scene;
    this.camera = camera;
    this.orth_scene = orth_scene;
    this.orth_camera = orth_camera;

    this.Cam = Cam;
    this.renderer = renderer;



  }

  ,start(o){
    Object.assign(this.options,o);

    //this._handlePress();
  }


})