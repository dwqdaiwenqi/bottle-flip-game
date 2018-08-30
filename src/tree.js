import TWEEN from 'miku-tween';

var Tree = ()=>{
  var trunk = new THREE.Mesh(
    new THREE.BoxGeometry(3,200,3)
    ,new THREE.MeshLambertMaterial({color:0xe3cf73})
  );
  var leaf = new THREE.Mesh(
    new THREE.OctahedronGeometry(20,1)
    //new THREE.BoxGeometry(30,30,30)
    ,new THREE.MeshLambertMaterial({color:0x005910})
  );
  trunk.add(leaf);

  leaf.geometry.applyMatrix(
    new THREE.Matrix4().makeTranslation(0,trunk.geometry.parameters.height*.5,0)
  ) 

  trunk.castShadow = true;
  leaf.castShadow = true;

  return Object.assign(trunk,{
    flip({delay=200}){
      var that = this;
      new TWEEN.Tween({t:0})
      .to({t:1},200+random()*200)
      .delay(delay)
      .onStart(function(){
        this.by = that.position.y;
        this.dy = 8+random()*8;
      })
      .onUpdate(function(){
        that.position.y = this.by+sin(this.t*PI)*this.dy;

        //console.log(that.position.y);
      })
      .start();
    }
  });
}

export default Tree;