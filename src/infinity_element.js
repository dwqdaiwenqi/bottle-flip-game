var InfinityElement = Class.create({
  init(props){
    this.els = [];
    this.groups = [];
    this.group_id = 0;

    this.in_group_num = props.in_group_num || 10;

    this.once= false;
    this.far =  props.far || 3000;
    this.allow_far = this.far;

    this.handle_each_child  = props.handle_each_child;

  }
  ,reset(scene){
    this.once = false;

    this.group_id = 0;

    if(scene){
      this.els.forEach((o)=>scene.remove(o));
    }

 
    this.els = [];

    this.groups = [];

    this.allow_far = this.far;


  }
  ,elForThatArea(po1,far,scene){

    this.group_id++;

    var objs = [...Array(this.in_group_num)].map((v,i)=>{

      var o = this.handle_each_child.call(this,po1,far,scene);
      scene.add(o);
      this.els.push(o);
      
      o.group_id = this.group_id;

      return o;

    });
    //debugger;

    return objs;
  }
  ,render(current_po,scene){
    var {groups,far,in_group_num} = this;

    if(!this.once){
      //console.log('oncex');
      //console.log(infinityCreateTree.once);
      this.once = true;
      
      this.groups = [
        this.elForThatArea(0,-far,scene)
        ,this.elForThatArea(0,far,scene)
        ,this.elForThatArea(far,far,scene)
      ];
      
      //console.log(groups);

      // -far   0  

    }

    var current_po = current_po.x;

    //return;
    //5000 10000
    if(current_po!=0&& current_po> this.allow_far ){
      this.allow_far+=far;
      //debugger;

      //console.log(this.groups);


      //debugger;
      let group = this.groups.shift();
      
      group.forEach((o)=>{
        scene.remove(o);
        //console.log(this.els);
        //this.els.remove(o);
      });
      
      this.groups.push( this.elForThatArea(current_po+far,far,scene) );
        //alert('creat and destory groups!!');
      console.log('%c creat and destory groups!!','font-size:30px;',groups);

    }
  }
});

export default InfinityElement;
