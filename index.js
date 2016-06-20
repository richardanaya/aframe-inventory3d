// aframe-inventory3d.js
// repo    : https://github.com/richardanaya/aframe-inventory3d
// license : MIT

(function (window, module, AFRAME, reducerthread) {

	// parseUri 1.2.2
	// (c) Steven Levithan <stevenlevithan.com>
	// MIT License

	function parseUri (str) {
		var	o   = parseUri.options,
			m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
			uri = {},
			i   = 14;

		while (i--) uri[o.key[i]] = m[i] || "";

		uri[o.q.name] = {};
		uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
			if ($1) uri[o.q.name][$1] = $2;
		});

		return uri;
	};



	parseUri.options = {
		strictMode: false,
		key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
		q:   {
			name:   "queryKey",
			parser: /(?:^|&)([^&=]*)=?([^&]*)/g
		},
		parser: {
			strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
			loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
		}
	};


	"use strict";
	AFRAME = AFRAME.aframeCore || AFRAME;

	AFRAME.registerComponent('inventory-3d', {
		schema: {type: 'string'},

		loadBasicMaterial: function(materials,index,config){
			var texloader = new THREE.TextureLoader();
			texloader.load(config.image, function(tex) {
				materials[index] = new THREE.MeshBasicMaterial({map: tex});
			});
		},

		configureObject: function(obj,configuration){
			var _this = this;
			configuration.materials.forEach(function(mat,i){
				if(mat.index==undefined){
					mat.index = _this.getMaterialIndex(obj,mat.id);
				}
				if(mat.type=="color"){
					obj.children[0].material.materials[mat.index] = new THREE.MeshBasicMaterial( { color: mat.color } );
				}
				if(mat.type=="basic"){
					_this.loadBasicMaterial(obj.children[0].material.materials,mat.index,mat);
				}
			});
		},

		getMaterialIndex: function(obj,id){
			for(var j = 0 ; j < obj.children[0].geometry.faces.length; j++ ){
				var f = obj.children[0].geometry.faces[j];
				if(f.daeMaterial==id){
					return f.materialIndex;
				}
			}
			return null;
		},


		loadModel: function(configurations,url){
			var _this = this;
			var modelEl = document.createElement("a-entity");
			modelEl.setAttribute("collada-model", "url("+this.getURLRelativeToJson(url)+")");
			modelEl.addEventListener("model-loaded", function (e) {
				_this.model3dObj = modelEl.object3D;
				var colladaObjs = _this.getAllColladaObjects(_this.model3dObj);
				colladaObjs.forEach(function(co){
					var id = co.id;
					var configuration = null;
					configurations.objects.forEach(function(config){
						if(config.id==id){
							configuration = config;
						}
					})
					if(configuration){
						_this.configureObject(co.object3D,configuration);
					}
				})
			})
			_this.el.appendChild(modelEl);
		},

		getAllColladaObjects: function(object3D){
			function findColladaObjects(o, objs) {
				if (!o) {
					return
				}
				if (o.colladaId) {
					objs.push({id: o.colladaId, object3D: o})
				}
				if (o.children) {
					o.children.forEach(function (child) {
						findColladaObjects(child, objs)
					});
				}
			}

			var colladaObjs = [];
			findColladaObjects(object3D, colladaObjs);
			return colladaObjs;
		},

		findObjectById: function(object3D,id){
			var colladaObjs = this.getAllColladaObjects(object3D);
			for(var i in colladaObjs){
				if(colladaObjs[i].id==id){
					return colladaObjs[i].object3D;
				}
			}
			return null;
		},

		loadInventory3D: function (json) {
			this.el.innerHTML = "";
			var _this = this;
			json.scenes.forEach(function (scene) {
				_this.loadModel(scene.configuration, scene.url)
			})
			if(json.script) {
				var url = _this.getURLRelativeToJson(json.script);
				reducerthread({
					files: [url],
					maxTime: 10,
					onFrameComplete: function(e){
						_this.processScript(e.vms[0]);
					},
					onError: function (err) {
						console.log("there was an error: probably one of the vms timed out");
						console.log(err);
					}
				});
			}
		},

		getURLRelativeToJson:function(u){
			var url = parseUri(u)
			var baseUri = parseUri(this.baseUrl);
			var finalURL = u;
			if(url.authority=="."){
				finalURL = baseUri.protocol+"://"+baseUri.authority+""+baseUri.directory+url.path.substr(1);
			}
			return finalURL;
		},

		processScript: function(vm){
			for(var i in vm.state.requests){
				var request = vm.state.requests[i];
				if(request.type==="materialColor" && request.complete !== true)
				{
					if(this.model3dObj){
						var targetObj = this.findObjectById(this.model3dObj,request.target);
						var materialIndex = this.getMaterialIndex(targetObj,request.material);
						targetObj.children[0].material.materials[materialIndex] = new THREE.MeshBasicMaterial( { color: request.color } );
						request.complete = true;
					}
				}
			}
		},

		update: function () {
			var _this = this;
			_this.el.innerHTML = "";
			window.fetch(this.data)
				.then(function (response) {
					_this.baseUrl = response.url;
					return response.json()
				}).then(function (json) {
					_this.loadInventory3D(json);
				}).catch(function (ex) {
					console.log('parsing failed', ex)
				})
		}
	});
})(
	typeof window !== "undefined" ? window : {},
	typeof module !== "undefined" ? module : {},
	typeof require !== "undefined" ? (AFRAME || window.AFRAME) || require("aframe") : (AFRAME || window.AFRAME),
	typeof require !== "undefined" ? require("reducerthread") : reducerthread
);
