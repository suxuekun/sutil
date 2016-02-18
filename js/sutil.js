/**
* sutil javascript library version alpha 1.0.0
* https://github.com/suxuekun/sutil.git
*
* utils for Namespace Class Interface in javascript
*
* MIT LICENCE
* 
* @author suxuekun@gmail.com sillyboy
*/
(function(_global){
	'use strict';
	var factory = function(){
		var defineProp = Object.defineProperty;
		var defaultKeys = ["initialize","uper","constructor"];
		function _hasInterface(i){
			var name = "";
			if (typeof i == "string"){
				name = i;
			}else{
				name = i.name;
			}
			if (this.interfaces && this.interfaces.length){
				for (var k=0;k<this.interfaces.length;k++){
					var j = this.interfaces[k];
					if (name == j.name){
						return true;
					}
				}
			}
			return false;
		}
		function _override(clazz,key,method){
			clazz.prototype[key] = method;
			defineProp(clazz.prototype,key,customizedKeyConfig);
		}
		function _overrides(obj,methods){
			if (!methods) methods == {};
			for (var key in methods){
				_override(obj,key,methods[key]);
			}
		}
		// functions for Class only
		// not functions for instance
		var defaults = {
			override:function(key,method){
				_override(this,key,method);
			},
			overrides:function(methods){
				if (!methods) methods == {};
				for (var key in methods){
					this.override(key,methods[key]);
				}
			},
			impl:function(i,methods){
				this.overrides(methods);
				if (i){
					if(this.prototype.interfaces.indexOf(i) < 0){
						this.prototype.interfaces.push(i);
					}
					var notImplementedNames = i.check(this);
					if (notImplementedNames && notImplementedNames.length && i.warning){
						console.warn("Interface "+ i.name +" is not correctly implemented by Class " + this.name+"\n"
							+"missing methods: \n "+notImplementedNames.join("\n "));
					}
				}
			},
			hasInterface:function(i){
				return this.prototype.hasInterface(i);
			},

		}
		// not enumerable for initialize uper(super) constructor
		var defaultKeyConfig = {
			configurable:false,
			enumerable:false,
			writeable:false,
		}
		var customizedKeyConfig = {
			configurable:false,
			enumerable:true,
			writeable:false,
		}

		/**
		* <p> define a Class </p>
		* <p> Class extends Function </p>
		* <p> instance of A Class is usually a Object </p>
		* <p> example:</p>
		* var A = defineClass({className:"A"})//a empty class named "A".
		* var a = new A();// a.__proto__ = A.prototype
		* console.log(a);//a A {}
		* @param options : Object
		*			</br>{
		*			</br>	className:string, //name of this Class 
		*			</br>	initialize:function, // init func ( not same as constructor )
		*			</br>	uper:Class(super), //superClass
		*			</br>	methods:map.<string,function>, //ClassMethods
		*			</br>	attributes:map.{string,object}, // static attributes accross all instance of this class
		*			</br>	interfaces:list[Interface,...], // interfaces that this class should implements (in methods)
		*			</br>}
		* @see Interface
		* @return Class
		*/

		function defineClass(option){
			if (!option || typeof option != "object") {
				option = {};
			}
			var className = option.className || "";
			var initialize = option.initialize || function(){};
			var uper = option.uper || null;
			var methods = option.methods || {};
			var attributes = option.attributes || {};
			var interfaces = option.interfaces || [];

			// class
			var clazz = new Function(
			     "return function " + className + "(){this.initialize.apply(this,arguments);}"
			)();

			// super
			if (uper != null){
				clazz.prototype = Object.create(uper.prototype);
				clazz.prototype.uper = uper.prototype;
			}else{
				clazz.prototype = {
					uper:null
				};
			}
			// constructor
			clazz.prototype.constructor = clazz;
			// initialize
			clazz.prototype.initialize = initialize;

			//default class methods
			for (var l in defaults){
				clazz[l] = defaults[l];
			}
			for (var l in defaultKeys){
				var keyName = defaultKeys[l];
				defineProp(clazz.prototype,keyName,defaultKeyConfig);
			}

			//customize 
			// attributes
			// methods

			for (var key in methods){
				_override(clazz,key,methods[key]);
			}
			for (var key in attributes){
				_override(clazz,key,attributes[key]);
			}
			// interfaces
			clazz.prototype.hasInterface = _hasInterface;
			clazz.prototype.interfaces = [];
			if (uper && uper.interfaces && uper.interfaces.length){
				for (var k=0;k<uper.interfaces.length;k++){
					var i = uper.interfaces[k];
					clazz.impl(i);
				}
			}
			
			for (var k=0;k<interfaces.length;k++){
				var i = interfaces[k];
				clazz.impl(i);
			}
			return clazz;
		}
		/**
		* <p> get or create namespace </p>
		* <p> organize resource using namespace </p>
		* <p> example: </p>
		* </br>	var ns = getNamespace("org.example",window.app);// ns = window.app.org.example;
		* </br>	var data = {'test':'test'};
		* </br>	ns.data = data;// window.app.org.example.data == {'test':'test'}
		* </br>	this function ensure the namespace exist, if not exist ,create the namespace chain.
		* @param ns 	namespace to get or create, example: 'org.example'
		* @param root	root to add this namespace; 
		* 				</br> default is window, so that it's window.org.example in your browser
		*
		* @return required namespace reference
		*/
		function getNamespace(ns,root){
			if (!root) root = _global;
			var chain = ns.split("\.");
			var childName = "";
			var key = "";
			var currentChain = root;
			for (var i=0;i<chain.length;i++){
				childName = chain[i];
				currentChain = currentChain[childName] = currentChain[childName] || {};
			}
			return currentChain;
		}
		/**
		* <p> Interface </p>
		* <p> example: </p>
		*</br> 	var isomeInterface = new Interface({
		*</br>		name:'isomeInterface',
		*</br>		method:['someFunc'],
		*</br>		warning:false,
		*</br>	})
		*
		* <p> warning is false by default</p>
		* <p> to change the default setting of warning for All Interfaces :</p>
		* <p> sutil.Interface.override("warning",true);</p>
		*
		* @param	option : Object
		*				</br>{
		*				</br>	name:'isomeInterface', // InterfaceName
		*				</br>	methods:['someFuncNameThatShouldBeImplemented',...] // function names that should Implements
		*				</br>	warning:false, // weather show a warning information if a class failed to implements this Interface
		*				</br>}
		* @return	a Interface which can be implements by Class
		* @see 		defineClass
		*/
		var Interface = defineClass({
			className:"Interface",
			initialize:function(option){
				if (!option) option = {};
				this.name = option.name || "";
				this.methods=[];
				if (this.uper && this.uper.methods){
					for (var i = 0;i<uper.methods.length;i++){
						this.methods.push(uper.methods[i])
					}
				}
				if (option.methods && option.methods.length){
					for (var i = 0;i<option.methods.length;i++)
					this.methods.push(option.methods[i])
				}
				if (option.warning){
					this.warning = option.warning;
				} 
			},
			attributes:{
				warning:false,
			},
			methods:{
				check:function(clazz){
					var fails = [];
					if (!clazz) return null;
					for (var l in this.methods){
						var interface_method_name = this.methods[l];
						if (!clazz.prototype[interface_method_name]) {
							fails.push(interface_method_name);
							if (!this.warning){
								break;
							}
						}
					}
					if (fails.length >0){
						return fails;
					}else{
						return null;
					}
				}
			}
		});
		var ns = getNamespace("sutil",_global);
		var sutil = {
			getNamespace:getNamespace,
			defineClass:defineClass,
			Interface:Interface
		};
		for (var key in sutil){
			ns[key] = sutil[key];
		}
		return ns;
	}
	// for CMD AMD
	if (typeof define ==='function' && define.amd){
		define(factory);
	}else if (typeof module === "object" && module && typeof module.exports === "object" ){
		module.exports = factory;
	}else{
		factory();
	}
})(window)