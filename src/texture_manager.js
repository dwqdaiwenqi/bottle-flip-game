
var TextureManager = {
  initial(results){

    var groups = 	Object.keys(results).map(s=>{
      var group = results[s];

      return Promise.all(  group.map( (s,i) =>{

        return new Promise(r=>{

          var loader = new THREE.TextureLoader();
          loader.crossOrigin = '*';
          loader.load(s,texture=>{
            r(texture);

          });

          })

        })

      ).then(res=>{
        
        results[s] = res;
        
        return new Promise(r=>{
          r(res);
        })
      
      });
    
    });

    Promise.all(groups).then(res=>{

      this._handle_complete&&this._handle_complete(results);

    });

  }
  ,onComplate(fn){
    this._handle_complete = fn;
  }
}

module.exports= {TextureManager};
