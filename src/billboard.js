import TWEEN from 'miku-tween';

var BillBoard = ({map})=>{
  var pillar = new THREE.Mesh(
    //new THREE.BoxGeometry(20,230,20)
    new THREE.CylinderGeometry( 9, 12, 230 )
    ,new THREE.MeshPhongMaterial({
      color:new THREE.Color().setRGB(.2,.2,.2)
    })
  )
  var board_materials = [...Array(4)].map(()=>new THREE.MeshPhongMaterial({
    color:0x2d2d2d
    ,specular: 0x05050
  }));

  //console.log(map);
  {
    

    let cv_ = document.createElement('canvas');
    cv_.width = 400,cv_.height =300;

    //debugger;
    
    let c = cv_.getContext('2d');
    //c.fillStyle = 'red';
    //c.fillRect(0,0,cv_.width,cv_.height);
    c.drawImage(map.image,0,0,cv_.width,cv_.height);

 
    var map = new THREE.Texture(cv_);
    

  }
  

  board_materials.push(
    new THREE.MeshPhongMaterial({
      map
      ,specular: 0xffffff
    })
    ,new THREE.MeshPhongMaterial({
      map
      ,specular: 0xffffff
    })
  );

  //board_materials.push();
  var board = new THREE.Mesh(
     new THREE.BoxGeometry(400,300,30)
    //new THREE.SphereGeometry(100,100,100)
    ,board_materials
   
  )



  board.material[board.material.length-1].map.needsUpdate = true;
  board.material[board.material.length-2].map.needsUpdate = true;


  pillar.add(board);


  board.geometry.applyMatrix(
    new THREE.Matrix4()
    .makeTranslation(0,pillar.geometry.parameters.height+board.geometry.parameters.height*.5,0)

  )
  
  // board.geometry.applyMatrix(
  // 	new THREE.Matrix4()
  // 	.makeTranslation(0,pillar.geometry.parameters.height*.5+50,0)

  // )
  
  pillar.geometry.applyMatrix(
    new THREE.Matrix4().makeTranslation(0,pillar.geometry.parameters.height*.5,0)
  )

  pillar.visible = false;
  //debugger;


  pillar.castShadow = true;
  pillar.receiveShadow = true;

  board.castShadow = true;
  board.receiveShadow = true;


  return Object.assign(pillar,{
    fallDown({delay=2000}={}){
      var that = this;
      //return;

      new TWEEN.Tween({y:1000})
      .to({y:0},1555)
      .easing(TWEEN.Easing.Cubic.In)
      .delay(delay)
      .onStart(function(){
        pillar.visible = true;
      })
      .onUpdate(function(){
        pillar.position.y = this.y;
        //console.log(pillar.position);
      })
      .onComplete(function(){
        that._handle_fall&&that._handle_fall();
      })
      .start();
    }
    ,onFallEnd(fn){
      this._handle_fall = fn;
    }
    ,comeOut({delay=3000}={}){
      
      new TWEEN.Tween({
        y:(pillar.geometry.parameters.height+board.geometry.parameters.height)*-1  
      })
      .to({y:0},2233)
      .easing(TWEEN.Easing.Cubic.In)
      .delay(delay)
      .onStart(function(){
        pillar.visible = true;
      })
      .onUpdate(function(){
        pillar.position.y = this.y;
        
        // Particle.renderIn(
        //   new THREE.Vector3(pillar.position.x,5,pillar.position.z) 
        //   ,{
        //     count:10
        //     ,co:new THREE.Color().setRGB(.8,.8,.8)
        //     ,range_po(t){
        //       return {
        //         x:cos(t)*
        //       }
        //     }
        //   }
        // )
        //console.log(pillar.position);
      })
      .onComplete(function(){
        
      })
      .start();
    }
  });

}

export default BillBoard;