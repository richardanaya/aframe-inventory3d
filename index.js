// aframe-inventory3d.js
// repo    : https://github.com/richardanaya/aframe-inventory3d
// license : MIT

(function (window, module, AFRAME) {
	"use strict";
	AFRAME = AFRAME.aframeCore || AFRAME;

	AFRAME.registerComponent('inventory-3d', {
		schema: {type: 'string'},

		loadBasicMaterial: function(materials,index,config){
			debugger;
			var texloader = new THREE.TextureLoader();
			texloader.load(config.image, function(tex) {
				materials[index] = new THREE.MeshBasicMaterial({map: tex});
			});
		},

		configureObject: function(obj,configuration){
			var _this = this;
			var texloader = new THREE.TextureLoader();
			configuration.materials.forEach(function(mat,i){
				if(mat.index==undefined){
					for(var j = 0 ; j < obj.children[0].geometry.faces.length; j++ ){
						var f = obj.children[0].geometry.faces[j];
						if(f.daeMaterial==mat.id){
							mat.index = f.materialIndex;
							break;
						}
					}
				}
				if(mat.type=="color"){
					obj.children[0].material.materials[mat.index] = new THREE.MeshBasicMaterial( { color: mat.color } );
				}
				if(mat.type=="basic"){
					_this.loadBasicMaterial(obj.children[0].material.materials,mat.index,mat);
				}
			});
		},

		loadModel: function(configurations,url){
			var _this = this;
			var modelEl = document.createElement("a-entity");
			modelEl.setAttribute("collada-model", "url("+url+")");
			modelEl.addEventListener("model-loaded", function (e) {
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
				findColladaObjects(modelEl.object3D, colladaObjs);
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

		attributeChangedCallback: {
			value: function (attr, oldVal, newVal) {
				debugger
			}
		},

		loadInventory3D: function (json) {
			this.el.innerHTML = "";
			var _this = this;
			json.scenes.forEach(function (scene) {
				_this.loadModel(scene.configuration, scene.url)
			})
		},

		update: function () {
			var _this = this;
			_this.el.innerHTML = "";
			window.fetch(this.data)
				.then(function (response) {
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
	typeof require !== "undefined" ? AFRAME || window.AFRAME || require("aframe") : (AFRAME || window.AFRAME)
);
