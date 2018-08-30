import TWEEN from 'miku-tween';

const Status = {
  'stading':'stading'
  ,'flipping':'flipping'
  ,'holding':'holding'
  ,'died':'died'
  ,'outside':'outside'
}

var ChessMan = ()=>{
  var co = new THREE.Color().setRGB(.1,.1,.1);
  var body = new THREE.Mesh(
    //new THREE.BoxGeometry(3,10,3)
    new THREE.CylinderGeometry( 1.5, 2, 10, 32 )
    ,new THREE.MeshPhongMaterial({
      color:co
      ,transparent:true
    })
  );
  body.material.opacity = 1;
  body.geometry.applyMatrix(
    new THREE.Matrix4().makeTranslation(0,body.geometry.parameters.height*.5,0)
  );

  body.castShadow = true;
  body.receiveShadow = true;

  
  

  var head = new THREE.Mesh(
    //new THREE.SphereGeometry(body.geometry.parameters.width*.7)
    new THREE.SphereGeometry(2)
    ,new THREE.MeshPhongMaterial({
      color:co
      ,transparent:true
    })
  )
  body.add(head);

  head.geometry.applyMatrix(
    new THREE.Matrix4().makeTranslation(0,body.geometry.parameters.height*1.333,0)
  );

  
  head.castShadow = true;
  head.receiveShadow = true;




  {
    // let cv_ = document.createElement('canvas');
    // cv_.width = cv_.height = 100;
    // let c = cv_.getContext('2d');
   

    // var msg = new THREE.Mesh(
    //   new THREE.PlaneGeometry(2,2)
    //   ,new THREE.MeshBasicMaterial({
    //     map:new THREE.Texture(cv_)
    //     ,transparent:true
    //   })
    // );
    // msg.material.map.needsUpdate = true;
    // head.add(msg);

    // msg.geometry.applyMatrix(
    //   new THREE.Matrix4()
    //   .makeTranslation(0,13.5,2)

    // );
  }


//	debugger;

  return Object.assign(body,{
    holding(){

      this.status = Status.holding;


      var increasing = .007;
      this.hold_coefficient += increasing;
      this.hold_coefficient > 1 && (this.hold_coefficient =1);
      
      this.scale.y = (1-this.hold_coefficient)*.7+.3;

      //console.log(this.scale.y);
    }
    ,start(){
      this.rotation.z = 0;
      this.status = Status.stading;

      //console.log('stading!!!!');

    }
    ,canHolding(){
      return (this.status === Status.stading) || (this.status === Status.holding);
    }

    ,canFlipping(){
      return this.status === Status.holding; 
    }
    ,_controlVertex(ty=0){
      body.geometry.applyMatrix(
        new THREE.Matrix4().makeTranslation(0,-ty,0)
      );
      head.geometry.applyMatrix(
        new THREE.Matrix4().makeTranslation(0,-ty,0)
      );
      this.position.y += ty;
    }
    ,onFilpEnd(fn){
      this._handle_flip_end = fn;
    }
    ,fewFlip({onUpdate,po_increments}){
      var that = this;
      return new Promise(r=>{
        var f = (len)=>{
          //hold_coefficient*1000
          that.hold_coefficient=.5;
         
          that.flipping((po)=>{
            onUpdate&&onUpdate(po);
          },123,200,600,false)
          .then(res=>{
            
            if(len===1) return r();

            f(--len);
          })


        }
  
        f(po_increments.length);
      })
    


    }
    ,isOutside(){
      return this.status === Status.outside;
    }
    ,isStading(){
      return this.status === Status.stading;
    }
    ,isDied(){
      return this.status === Status.died;
    }
    ,fallDown({rz=30,delay=333}={}){
      var that = this;
      this.status = Status.died;


      return new Promise(r=>{
        new TWEEN.Tween({y:this.position.y,rz:0})
        .delay(delay)
        .easing(TWEEN.Easing.Cubic.In)
        .to({y:0,rz},1234)
        .onUpdate(function(){ 
          that.position.y = this.y;
          that.rotation.z = this.rz;
        })
        .onComplete(()=>{
          r();
        })
        .start();

        //r();
      });


      

    }
    ,stopToTop(){
      this.tw_top1.stop();
      this.tw_top2.stop();
    }
    ,flipToTop({height,onUpdate,onPer,delay=0,onFlipStart,flip_dur=3333}={}){
      var that = this;
      return new Promise(r=>{

        this.status = 'fliptotop';

        var tw  = new TWEEN.Tween({scale:1})
        .to({scale:.6},566)
        .delay(delay)
        .onUpdate(function(){
          that.scale.y = this.scale;
        });


        var tw2 = new TWEEN.Tween({y:this.position.y,t:0})
        .to({y:height,t:1},flip_dur)
        .easing(TWEEN.Easing.Cubic.Out)
        .onStart(function(){
          this.once = false;
          that.scale.y = 1;
          onFlipStart && onFlipStart();
        })
        .onUpdate(function(){
          that.position.y = this.y;
          onUpdate&&onUpdate(that.position);
          if(this.t>=.2&&!this.once){
            this.once = true;
            onPer&&onPer(that.position);
          }

        })
        .onComplete(function(){
          //console.log('flip to top ..!!!')
          
          r();
        });

        this.tw_top1 = tw;
        this.tw_top2 = tw2;
        

        tw.chain(tw2);

        tw.start();

      });
      
    }
    ,flipping(fn,delay=0,dy=26,dur=433,statusx=true){
      this.scale.y = 1;

      var that = this;
      var ty = body.geometry.parameters.height*.5;

      var target_o = {
        // x:this.hold_coefficient*123
        x:this.hold_coefficient*150
        //z:this.hold_coefficient*50
        ,y:this.position.y 
      }

      //console.log('flipping!!');

      if(statusx) this.status = Status.flipping;

      return new Promise(r=>{

        new TWEEN.Tween({t:0})
        .to({t:1},dur)
        .delay(delay)
        .onStart(function(){
          that._controlVertex(ty);
        
          this.bef = {
            x:that.position.x
            ,y:that.position.y
          }
  
        })
        .onUpdate(function(){
          body.rotation.z = this.t*-PI*2;

          var x_ = this.bef.x + this.t*target_o.x;
          var y_ = this.bef.y + sin(this.t*PI)*dy;
          that.position.x = x_;
          that.position.y = y_;

          //console.log(that.position);
          fn&&fn(that.position);

        })
        .onComplete(function(){
          that._controlVertex(-ty);


          if(statusx) that.status = Status.stading;


          that._handle_flip_end&&that._handle_flip_end(that);

          r();

        })
        .start();

        this.hold_coefficient = 0;
      })
      
    }
    ,hold_coefficient:0
    ,status : Status.outside
  });


}

export default ChessMan;