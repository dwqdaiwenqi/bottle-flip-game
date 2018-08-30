import TWEEN from 'miku-tween';
import {TextureManager} from './texture_manager';

export default function({goods=null,height=600,billboard=false,billboard_map}={}){


  var color = new THREE.Color().setHSL(Math.random(),1,.9);
  var material = new THREE.MeshPhongMaterial({
    color
    ,transparent:true, specular: 0xffffff,flatShading: false

    //,map:new THREE.TextureLoader().load(require('./common/img/board1.jpg'))
  });

  // var materials = [
  //   material.clone(),material.clone()
  //   // ,new THREE.MeshPhongMaterial({
  //   //   color,transparent:true, specular: 0xffffff,flatShading: false
  //   //   ,map:new THREE.TextureLoader().load(require('./common/img/boardx2.jpg'))
  //   // })
  //   ,material.clone()
  //   ,material.clone(),material.clone(),material.clone()
  // ]


  var mesh;

  if(random()>.2){
    mesh = new THREE.Mesh(
      //new THREE.BoxGeometry(30,height,30)
      new THREE.CylinderGeometry( 15, 15, height, 32 )
      //,materials
      ,material
    );
    mesh.material.opacity = 0;
    mesh.position.y = mesh.geometry.parameters.height*.5;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
  
  
    var {parameters} = mesh.geometry;
  
  
    var billborad_ = new THREE.Mesh(
      new THREE.CylinderGeometry(15, 15, 20, 32, 32, true, 0, PI*.6)
      ,new THREE.MeshPhongMaterial({
        //map:new THREE.TextureLoader().load(require('./common/img/boardx2.jpg'))
        specular: 0xffffff,flatShading: false
        ,map:billboard_map
      })
    );


    billborad_.position.set(0,
      height*.5-billborad_.geometry.parameters.height*(.6+random()*1)
      ,.1);
    billborad_.rotation.y = -.5-random()*.433;
    mesh.add(billborad_);

  }else{
    
    mesh = new THREE.Mesh(
      new THREE.BoxGeometry(30,height,30)
      //,materials
      ,material
    );
    mesh.material.opacity = 0;
    mesh.position.y = mesh.geometry.parameters.height*.5;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
  }

  /////////////
  mesh.castShadow = false;

  if(goods){

    //190/207
    // var s = 190/207;
    // var goods_ = new THREE.Mesh(
    //   //new THREE.BoxGeometry(10,10,10)
    //   // ,new THREE.MeshPhongMaterial({
    //   //   color: new THREE.Color().setHSL(Math.random(),1,.9)
    //   //   ,transparent:true, specular: 0xffffff,flatShading: false
    //   // })
    //   new THREE.PlaneGeometry(15,15/s,10)
    //   ,new THREE.MeshBasicMaterial({
    //     map:new THREE.TextureLoader().load(require('./common/img/chest2.png'))
    //     ,transparent:true
    //     ,side :THREE.DoubleSide
    //   })
    // );

    // //mesh.add(goods_);

    // goods_.geometry.applyMatrix(
    //   new THREE.Matrix4().makeTranslation(0,height*.5+goods_.geometry.parameters.height*.5,0)
    // );
    // goods_.position.set(
    //   0,height*.5+goods_.geometry.parameters.height*.5,0
    // );

  }


  new TWEEN.Tween({opacity:0})
  .to({opacity:1},333)
  .onUpdate(function(){
    mesh.material.opacity = this.opacity;

    //console.log(this.opacity);
  })
  .start();

  return Object.assign(mesh,{
    goods
    ,displayGoods(scene){
      
      setTimeout(()=>{
        alert('OvO你得到了cdk：'+ this.goods.cdk);
      },433);

      

      //this.remove(goods_);

    }
    ,goodsLookAt(po){
      //if(goods_){

        //console.log(po);
        //goods_.lookAt(po);
        

        //goods_.lookAt(new THREE.Vector3(po.x,po.y,po.z))

      //}
    }
  });

}