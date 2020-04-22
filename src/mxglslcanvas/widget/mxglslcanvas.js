define([
	"dojo/_base/declare",
	"mxui/widget/_WidgetBase",

	"mxui/dom",
	"dojo/dom",
	"dojo/dom-prop",
	"dojo/dom-geometry",
	"dojo/dom-class",
	"dojo/dom-style",
	"dojo/dom-construct",
	"dojo/_base/array",
	"dojo/_base/lang",
	"dojo/text",
	"dojo/html",
	"dojo/_base/event",
	"mxglslcanvas/lib/jquery-1.11.2",
	"mxglslcanvas/lib/GlslCanvas",

], function (declare, _WidgetBase, dom, dojoDom, dojoProp, dojoGeometry, dojoClass, dojoStyle, dojoConstruct, dojoArray, lang, dojoText, dojoHtml, dojoEvent, _jQuery,_GlslCanvas) {
	"use strict";

	var $ = _jQuery.noConflict(true);

	return declare("mxglslcanvas.widget.mxglslcanvas", [ _WidgetBase ], {


		// Internal variables.
		_handles: null,
		_contextObj: null,
		_objectChangeHandler:null,
		constructor: function () {
			this._handles = [];
		},

		postCreate: function () {
			logger.debug(this.id + ".postCreate");
			//<canvas class="glslCanvas" data-fragment-url="shader.frag" width="500" height="500"></canvas>
			this.canvas=dojo.create(
				'canvas',
				{
					'data-fragment-url':'shader.frag',//this.id+'.frag',
					'width':500,
					'height':500,
					'style':'width:100%;height:auto;'
				}
			);
			this.log=dojo.create(
				'code',
				{
					'style':'position:absolute'
				}
			);
			if(this.bool_canpopout){
				this.btn=dojo.create(
					'button',
					{
						'class':'btn btn-default',
						'innerHTML':'popout'
					}
				);
				this.domNode.appendChild(this.btn);
				this.connect(
					this.btn,
					"click",
					dojo.hitch(this.popout)
				);
			}
			this.domNode.appendChild(this.log);
			this.domNode.appendChild(this.canvas);
			this.sandbox=new _GlslCanvas(this.canvas);
		},

		update: function (obj, callback) {
			logger.debug(this.id + ".update");
			if(this._objectChangeHandler!==null) {
				this.unsubscribe(this._objectChangeHandler);
			}
			if(obj){
				this._objectChangeHandler=this.subscribe({
				guid: obj.getGuid(),
				callback:dojo.hitch(this,function(){
					this._updateRendering(callback);
				})
			});
			}else{}
			this._contextObj = obj;
			this._updateRendering(callback);
		},

		resize: function (box) {
			logger.debug(this.id + ".resize");
		},

		uninitialize: function () {
			logger.debug(this.id + ".uninitialize");
		},

		_updateRendering: function (callback) {
			logger.debug(this.id + "._updateRendering");

			if (this._contextObj !== null) {
				//dojoStyle.set(this.domNode, "display", "block");
				try{
					var string_frag_code = this._contextObj.get(this.attr_frag_code);//"main(){\ngl_FragColor = vec4(1.0);\n}\n";
					//var string_vert_code = this._contextObj.get(this.attr_vert_code);// "attribute vec4 a_position; main(){\ggl_Position = a_position;\n}\n";
					//console.log(string_frag_code )
					//console.log(string_vert_code )
					// Load only the Fragment Shader
					this.sandbox.load(string_frag_code);
					// Load a Fragment and Vertex Shader
					//this.sandbox.load(string_frag_code, string_vert_code);
				}catch(e){
					this.log.innerHTML='qwer';//e.toString();
					console.error(e);
				}
			} else {
			}

			this._executeCallback(callback, "_updateRendering");
		},
		popout:function(){
			if(this.bool_poppedout==null)this.bool_poppedout=false;
			if(!this.bool_poppedout){
				if(this.dlg==null)this.dlg=new mxui.widget.Dialog();
				this.glslwidorignod=this.domNode.parentElement
				this.placeAt(this.dlg._bodyNode);
				this.dlg.onClose=dojo.hitch(this,function(){
					this.placeAt(this.glslwidorignod)
					this.dlg.destroy();
					this.dlg=null;
					dojoStyle.set(this.btn, "display", "unset");
				});
				this.dlg.show()
				dojoStyle.set(this.btn, "display", "none");
			}else{
				this.dlg.close();
			}
		},
		// Shorthand for running a microflow
		_execMf: function (mf, guid, cb) {
			logger.debug(this.id + "._execMf");
			if (mf && guid) {
				mx.ui.action(mf, {
					params: {
						applyto: "selection",
						guids: [guid]
					},
					callback: lang.hitch(this, function (objs) {
						if (cb && typeof cb === "function") {
							cb(objs);
						}
					}),
					error: function (error) {
						console.debug(error.description);
					}
				}, this);
			}
		},

		// Shorthand for executing a callback, adds logging to your inspector
		_executeCallback: function (cb, from) {
			logger.debug(this.id + "._executeCallback" + (from ? " from " + from : ""));
			if (cb && typeof cb === "function") {
				cb();
			}
		}
	});
});

require(["mxglslcanvas/widget/mxglslcanvas"]);
