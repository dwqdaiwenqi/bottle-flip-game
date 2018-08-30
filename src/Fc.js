
{
	// var str = ['x','y'];
	//    var count = 0;
	//    function arrange(s){
	//     for(var i=0,length=str.length; i<length; i++) {
	//      if(s.length == length - 1) {
	//       if(s.indexOf(str[i]) < 0) {
	//        count++;
	//        console.log(""+count+"="+s + str[i]);
	//       }
	//       continue;
	//      }
			 
	//      if(s.indexOf(str[i]) < 0) { arrange(s+str[i]); }
	//     }
	//    }
	//    arrange("");
	
		const Slerp = (v0,v1,rad)=>{
			var α,β;
			var eachPos = (s,t)=>α*v0[s]+β*v1[s];
			var _ = {
				pos(t){
					α = sin((1-t)*rad)/sin(rad);
					β = sin(t*rad)/sin(rad);
					return{
						x : eachPos('x',t)
						,y : eachPos('y',t)
						,z : eachPos('z',t)
					}
				}
				,tangent(t){
	
				}
				,v0,v1,rad
				,deg:rad/PI*180
			}
			return _;
		}
	
		const Vec = Miku.Vec;
		var FreeCamera = ({camera,el=window,mw=innerWidth,mh=innerHeight})=>{
	
			const behavior = {
				'rotate':1
				,'position':1
			};
			
			var [cx,cy] = [mw>>1,mh>>1];
			var [φ,θ]=[180,90];
			var [x,y,z] = [0,0,0];
			const _ = Object.defineProperties({
				update(){
	
					if(this.transition) return;
	
					Walk.update();
	
					//FC.fun[s].update
	
					var [φ,θ] = [this.φ/180*PI,this.θ/180*PI];
	
					this.v3_look = new Vec(sin(θ)*sin(φ),cos(θ),sin(θ)*cos(φ));
					
	
					this.v3_look_right = new Vec(
						sin(θ)*sin(φ-PI*.5)
						,cos(θ)
						,sin(θ)*cos(φ-PI*.5)
					);
	
					this.v3_look_up = this.v3_look.cross(this.v3_look_right);
	
					this.v3_camera = new Vec(
						x,y,z
					);
					camera.position.set(
						x,y,z
					);
	
					//...
					const v = this.v3_camera.add(this.v3_look);
					camera.lookAt(new THREE.Vector3(v.x,v.y,v.z));
				}
				,transition:0
				,movingPath({time=1000,θ,φ}){
	
				}
				,slerp(v3,{bit_dist,until=1,time=1000,θ,φ}={}){
					this.transition = 1;
	
					var complete_fn;
	
					const rad = this.v3_look.dot(v3);
					const slp = Slerp(this.v3_look,v3,rad);
	
					const tw = new TWEEN.Tween({t:0})
					.to({t:1},time)
					.onStart(function(){
						if(bit_dist){
							this.bv = new Vec(_.x,_.y,_.z);
						}
						
					})
					.onUpdate(function(){
						//console.log('aaa');
						const pos = slp.pos(this.t);
						_.v3_look = new Vec(
							pos.x,pos.y,pos.z
						);
						
						if(bit_dist){
							let [t1,t2]=[this.t,1-this.t];
							x = this.bv.x*t2+bit_dist.x*t1;
							y = this.bv.y*t2+bit_dist.y*t1;
							z = this.bv.z*t2+bit_dist.z*t1;
	
						}else{
							x = _.x;
							y = _.y;
							z = _.z;
						}
						
						camera.position.set(
							_.v3_camera.x,_.v3_camera.y,_.v3_camera.z
						);
	
	
						const v = _.v3_camera.add(_.v3_look);
	
	
						camera.lookAt(new THREE.Vector3(
							v.x,v.y,v.z
						));
	
	
					})
					.onComplete(function(){
						_.transition = 0;
						//相机路径的终点θ和φ 。。。注意直线和曲线的终值θ和φ
						_.θ = θ;
						_.φ = φ;
	
						complete_fn && complete_fn();
						
					})
					.start();
	
					return {
						complete(fn){
							complete_fn = fn;
						}
					}
	
				}
				//正前方方向
				,v3_look:new Vec()
				//后方向
				,v3_look_back:new Vec()
				//右方向
				,v3_look_right:new Vec()
				//左方向
				,v3_look_left:new Vec()
				//上方向
				,v3_look_up:new Vec()
	
				,v3_camera:new Vec()
	
				//为了检测在球内外的碰撞，在内部到球的外部。。会出现错误
				//所以要保证，到外部的时候，速度向量是于lookat向量不同的。。
				,v3_speed:new Vec()
	
				,camera : camera
				,speed :{
					front:1,back:1,right:1,left:1
				}
				//rotate position
				,cancelDefualt(){
					if(!arguments.length){
						behavior.rotate=behavior.position=0;
						return;
					}
					Array.from(arguments,(v)=>{
						if(!behavior[v]) return console.wran('!');
						behavior[v] = 0;
					})
	
				}
				,walkFront(n){
					Walk['front'].run = true;
				}
				,walkBack(n){
					Walk['back'].run = true;
	
				}
				,walkRight(n){
					Walk['right'].run = true;
	
				}
				,walkLeft(n){
					Walk['left'].run = true;
				}
			},{
				'θ':{
					get(){return θ;}
					,set(a){θ = a;}
				}
				,'φ':{
					get(){	return φ;}
					,set(a){φ = a;}
				}
				,rotate:{
					get(){return [θ,φ];}
					,set(a,b){
						θ = a;
						φ = b;
					}
				}
				,x:{
					get(){return x;}
					,set(a){
						x = a;
						this.v3_camera.x = x;
					}
				}
				,y:{
					get(){return y;	}
					,set(a){
						y = a;
						this.v3_camera.y = y;
	
						
					}
				}
				,z:{
					get(){
						//console.log('get z:',z);
						return z;
					}
					,set(a){
						z = a;
						//console.log('set z:',z);
						this.v3_camera.z = z;
					}
				}
				,position:{
					get(){return [x,y,z];}
					,set(a,b,c){
						x=a,y=b,z=c;
					}
				}
			});
	
			const Walk = {
				add(s,fn){
					Walk[s] = this.mp[s] = {
						run : 0
						,update(){
							fn();
						}
					}
				}
				,mp:{}
				,code_mp:{
					'87':'w'
					,'83':'s'
					,'65':'a'
					,'68':'d'
				}
				,update(){
					Object.keys(this.mp).forEach((s)=>{
						const o = this.mp[s];
						if(!o.run) return;
						o.update();
					})
				}
			}
	
	
			Walk.add('w',()=>{
				_.v3_speed = _.v3_look.clone();
				const v = _.v3_speed.scale(_.speed.front);
				x += v.x , z+=v.z;
				//console.log('ex:w')
			});
			Walk.add('s',()=>{
				_.v3_speed = _.v3_look.clone().scale(-1);
				const v = _.v3_speed.scale(_.speed.back);
				x += v.x,z += v.z;
			
			});
			Walk.add('d',()=>{
				_.v3_speed = _.v3_look_right.clone();
				const v = _.v3_speed.scale(_.speed.right);
				x += v.x,z += v.z;
			});
			Walk.add('a',()=>{
				_.v3_speed = _.v3_look_right.clone().scale(-1);
				const v = _.v3_speed.scale(_.speed.left);
				x += v.x,z += v.z;
				//console.log('ex:a')
			});
	
			let bx,by;
			let delta_x,delta_y;
	
			el.addEventListener('mousedown',e=>{
				if(!bx)bx = e.pageX;
				if(!by)by = e.pageY;
				
			});
	
			el.addEventListener('mousemove',e=>{
				if(!behavior.rotate) return;
				if(!bx || !by) return;
				delta_x = (e.pageX-bx)*-.2,delta_y = (e.pageY-by)*.3;
				bx = e.pageX,by = e.pageY;
				_.φ += delta_x,_.θ += delta_y;
	
				_.trigger('rotate',{delta_x,delta_y});
			});
	
			el.addEventListener('mouseup',e=>{
				bx = by = 0;
			});
	
			x = camera.position.x;
			y = camera.position.y;
			z = camera.position.z;
	
			var key_speed;
			var k1,k2;
			const keyFn = (e)=>{
				// if(_.transition){
				// 	//console.log('!!!!');
				// 	return;
				// } 
				const W = Walk;
				const o = W[W.code_mp[e.keyCode]];
				if(!o) return;
				if(!k1){
					k1=k2=new Vec(x,y,z);
				}
				k1 = new Vec(x,y,z);
				_.v3_key = new Vec(
					k1.x-k2.x,k1.y-k2.y,k1.z-k2.z
				);
	
				//_.v3_key
				k2.x = k1.x;
				k2.y = k1.y;
				k2.z = k1.z;
	
				if(e.type =='keyup'){
					o.run = 0;
					return;
				}
				o.run = 1;
				//console.log(e.keyCode,e.type);
			}
			addEventListener('keydown',keyFn);
			addEventListener('keyup',keyFn);
	
			return FreeCamera = _$.extend(_,_$.MxEvent);
		};
	
	
		//window['FC'] = FreeCamera;
	}
	
	
	