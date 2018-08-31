//boxdoc is a wrapper for jsPDF
//jsPDF homepage https://parall.ax/products/jspdf
//jsPDF github https://github.com/MrRio/jsPDF
//jsPDF documentation https://rawgit.com/MrRio/jsPDF/master/docs/index.html
//jsPDF latest source https://unpkg.com/jspdf@latest/dist/jspdf.debug.js

(function(window){	
	"use strict";
	
	var errors = true;
	
	window["BD"] = {
		
		//defaults
		defaults:{
			methodOrder:["fill", "paddingFill", "border", "text"],
			text:{
				font:"helvetica",
				size:12,
				style:"normal",
				color:{r:0,g:0,b:0,rgb:true},
				align:"left"
			},
			draw:{
				width:1,
				color:{r:0,g:0,b:0},
				fill:{r:255,g:255,b:255,rgb:true}
			}
		},	
		errors:function(errorOn){
			errors = !!errorOn;
			return this;
		},	
		error:function(error){			
			throw new Error(error);
		},
		
		
		is:function(object, matchIs){	
			var is = Object.prototype.toString.call(object).split(" ")[1].slice(0, -1).toLowerCase();	
			if(matchIs === undefined){
				return is;
			}
			else if( matchIs.indexOf("numeric") > -1 && !isNaN(parseFloat(object)) && isFinite(object)){
				return true;
			}
			return matchIs.indexOf(is) > -1
		},
		
		extend:function(){			
			var args =  Array.prototype.slice.call(arguments);
			var checkKeys = typeof args[args.length-1] === "boolean" ? args.pop() : false;
			if( errors ) for(var i = 0, iLen = args.length; i < iLen; i++){
				if( BD.is(args[i]) !== "object" ){
					BD.error("When using the BD.extend function, all arguments must be objects.");
				}
			}
			var returnObject = args[0];
			for(var i = 1, iLen = args.length; i < iLen; i++){
				for(var key in args[i]){
					if(errors && checkKeys && !returnObject.hasOwnProperty(key)){
						BD.error("When using the BD.extend function with checkKeys enabled, when extending an object the new object must have the same keys. The following key isn't on the original object: "+key);
					}
					if( BD.is(args[i][key]) === "object" ){
						if( BD.is(returnObject[key]) !== "object"){
							returnObject[key] = {};
						}
						returnObject[key] = BD.extend(returnObject[key], args[i][key])
					}
					else{
						returnObject[key] = args[i][key];
					}
				}				
			}
			return returnObject;	
		},
		setter:function(setTo, key, options){
			if( errors && typeof key !== "string" ){
				BD.error("When using BD.setter, the key argument must be a string.");
			}
			if( BD.is(setTo[key]) === "object" && BD.is(options) === "object"){
				setTo[key] = BD.extend(setTo[key], options);
			}
			else{
				setTo[key] = options;				
			}
			return this;
		},
		getter: function(getFrom, key){
			if( errors && typeof key !== "string" ){
				BD.error("When using BD.getter, the key argument must be a string.");
			}
			return typeof getFrom[key] === "undefined" ? undefined : getFrom[key];
		},
		set: function(key, options){
			return BD.setter(BD.defaults, key, options);
		},
		get: function(key){
			return BD.getter(BD.defaults, key);
		},
		each:function(object, callback, apply){
			if( BD.is(object) === "array" ){
				for(var index = 0, iLen = object.length; index < iLen; index++){
					if( typeof callback.apply(apply, [object[index], index, object]) === "boolean" ){
						break;
					}
				}
			}
			else{
				if( errors && BD.is(object) !== "object" ){
					BD.error("When using BD.each, the object argument must either be an array or an object with properties.");
				}
				for(var index in object){
					if( typeof callback.apply(apply, [object[index], index, object]) === "boolean" ) {
						break;
					}
				}
			}
		},
		calculatePercent: function(percent, value){
			if(	BD.is(percent, "numeric") ){
				return +percent;
			}
			if( typeof percent !== "string" ){
				if(errors){
					BD.error("When using BD.calculatePercent, the percent argument must be a number type or a string.");
				}
				return value; 
			}
			var original = percent;
			percent = percent.trim();
			if(!( /^[0-9\.\%\*\/\-\+\(\)\s]{1,}$/.test(percent) )){
				return value; 
			}		
			var match, pattern = /([0-9\.]{1,})(?:\%)(?:[^0-9])?/g;
			while ((match = pattern.exec(percent)) != null) {
				var replaceWith = (value * (+match[1]/100)).toFixed(2);
				percent = percent.replace(match[1]+"%", replaceWith);
			}
			try {
				var returnValue = eval(percent); 
			} 
			catch (e) {
				if(errors){
					BD.error("BD.calculatePercent failed to evaulate the following arithmatic: " +  original);
				}
				var returnValue = value;
			}
			return +returnValue;
		},
		positions:["top", "right", "bottom", "left"],
		standardiseSpacing:function(top){
			var returnSpacing = {standardised:true};			
			var spacing = [];			
			if( arguments.length === 1 ){
				var topIs = BD.is(top, "numeric") ? "numeric" : BD.is(top);
				if( topIs === "object" ){
					if( top.hasOwnProperty("standardised") ){
						return top;
					}
					for(var i = 0; i < 4; i++){
						var position = BD.positions[i];
						returnSpacing[ position ] = BD.is( top[ position ], "numeric") ? +top[ position ] : 0;
					}
					return returnSpacing;
				}
				if( topIs === "numeric" ){
					spacing = [top, top, top, top];
				}
				else if( topIs === "string" ){
					spacing = spacing.trim().replace(/\,| {1,}/g, " ").split(" ");					
				}
				else if( topIs === "array" ){
					spacing = top.length > 1 ? top : [top[0], top[0], top[0], top[0]];
				}
			}
			else{
				for(var i = 0, iLen = arguments.length; i < iLen; i++){
					spacing[i] = arguments[i];
				}
			}
			
			if(spacing.length === 2){
				spacing = spacing.concat(spacing);
			}		
			for(var i = 0; i < 4; i++){
				returnSpacing[ BD.positions[i] ] = BD.is( spacing[ i ], "numeric") ? +spacing[ i ] : 0;
			}
			return returnSpacing;
		},
		rgb:["r","g","b"],
		color: function(color){
			var colorIs = BD.is(color);	
			if( colorIs === "object" ){
				if( color.hasOwnProperty("rgb") ){
					return color;
				}
				color = BD.objectToRGB(color);		
			}
			else if( colorIs === "string"){
				color = BD.stringToRGB(color);
			}
			else if ( colorIs === "array" ){
				color = BD.arrayToRGB(color);
			} 
			else if( errors ){
				BD.error("When using BD.color, the color argument must be an object, string or an array.");
			}
			else{
				color = null;
			}			
			color.rgb = true;
			return color;
		},
		stringToRGB: function(str){
			str = str.trim();
			if(str.indexOf(",") > 0){		
				return BD.arrayToRGB( str.split(",") );
			}
			else if( str.indexOf("#") === 0 ){				
				var match = false;
				var mul = 1;
				if(str.length > 5){
					match = str.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);			
				}
				else{
					match = str.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i);
					mul = 0x11;					
				}
				if (match) {
					match = match.slice(1,4);
					for(var i = 0, iLen = match.length; i < iLen; i++){
						match[i] = mul * parseInt(match[i], 16);
					}
					return BD.arrayToRGB( match );
				}
			}
			if(errors){				
				BD.error(str + " is not a supported color format of the BD.stringToRGB function.");
			}
			return null;
		},
		arrayToRGB: function(arr){
			var returnObj = {r:0,g:0,b:0,rgb:true};
			for(var i = 0; i < 3; i++){				
				if(errors && +arr[i] < 0 && +arr[i] > 255){					
					BD.error("RGB values must be >= 0 and <= 255");	
				}
				else{
					returnObj[ BD.rgb[i] ] = +arr[i];
				}
			}
			return returnObj;
		},
		objectToRGB: function(obj){
			var returnObj = {r:0,g:0,b:0,rgb:true};
			for(var i = 0; i < 3; i++){				
				if(errors && !obj.hasOwnProperty(BD.rgb[i]) && +obj[ BD.rgb[i] ] < 0 && +obj[ BD.rgb[i] ] > 255){
					BD.error("RGB values must be >= 0 and <= 255");	
				}
				else{				
					returnObj[BD.rgb[i]] = +obj[ BD.rgb[i] ];
				}	
			}
			return returnObj;
		},
		
		
		
		
		//extendability
		pdfMethods:{},
		pdfMethod: function(name, settings){		
			
			if( errors && typeof name !== "string" ){
				BD.error("The name argument for BD.pdfMethod must be a string.");
			}		
			if( errors && BD.is(settings) !== "object" ){
				BD.error("The settings argument for BD.pdfMethod must be an object.");
			}		
			
			settings = BD.extend({
				setting:null,
				method:null,
				overwrite:false
			}, settings, true);	
			
			if( !BD.pdfMethods.hasOwnProperty(name) || settings.overwrite ){
				BD.pdfMethods[name] = typeof settings.setting === "function" ? settings.setting : null;
				if(typeof settings.method === "function"){
					BD.pdf.prototype[name] = settings.method;
				}
			}
			else if(errors){
				BD.error("BD.pdfMethod: you must use the overwrite option set to true to replace the exisiting "+name+" method.");
			}
			settings = null;
			
		},
		pdfInit: function(settings){
			settings = settings || {};
			
			if(errors && BD.is(settings) !== "object"){
				BD.error("For BD.pdf, the settings argument must be an object.");
			}
			
			this.settings = BD.extend({}, BD.defaults, {
				jsPDF:[]
			}, settings);
			
			for(var option in this.settings){
				if( typeof BD.pdfMethods[option] === "function" ){					
					var arg = BD.is(this.settings[option]) === "array" ? this.settings[option] : [this.settings[option]];
					this.settings[option] = BD.pdfMethods[option].apply(this, arg);				
				}
			}
			return this;
		},
		
		
		
		
		boxMethods:{},
		boxMethod: function(name, settings){	
			
			if( errors && typeof name !== "string" ){
				BD.error("The name argument for BD.boxMethod must be a string.");
			}		
			if( errors && BD.is(settings) !== "object" ){
				BD.error("The settings argument for BD.boxMethod must be an object.");
			}		
			
			settings = BD.extend({
				always:null,
				preCommit:null,
				postCommit:null,
				overwrite:false
			}, settings, true);
			
			if(errors){
				if( !BD.is(settings.always, ["null", "function"]) ){
					BD.error("BD.boxMethod: The always option must be a function");
				}
				if( !BD.is(settings.preCommit, ["null", "function"]) ){
					BD.error("BD.boxMethod: The preCommit option must be a function");
				}
				if( !BD.is(settings.postCommit, ["null", "function"]) ){
					BD.error("BD.boxMethod: The postCommit option must be a function");
				}				
			}
			
			if( !BD.boxMethods.hasOwnProperty(name) || settings.overwrite ){
				
				BD.boxMethods[name] = {
					always: settings.always,
					preCommit: typeof settings.always === "function" ? null : settings.preCommit,
					postCommit: settings.postCommit
				};
				
				BD.box.prototype[name] = function(){
					
					this.focus();
					
					var ret = this;
					
					var BM = BD.boxMethods[name];
					
					if( typeof BM.always === "function" ){
						ret = BM.always.apply(this, arguments);
					}
					
					var preCommitIsFn = typeof BM.preCommit === "function";
					var postCommitIsFn = typeof BM.postCommit === "function";
					
					if(preCommitIsFn || postCommitIsFn){
						if(!this.committed){
							if(preCommitIsFn){
								ret = BM.preCommit.apply(this, arguments);							
							}
							if(postCommitIsFn){
								this.queue.push({method:name,arguments:arguments});					
							}
						}
						else if(errors){
							BD.error("You can not use the " + name + " method after the box is committed");
						}
					}
					
					
					return ret;
				}
				
				
			}
			else if(errors){
				BD.error("BD.boxMethods: you must use the overwrite option set to true to replace the exisiting "+name+" method.");
			}
			
			settings = null;
			
		},
		boxInit: function(settings, parentBox, siblingBox, positionToSibling){
			settings = settings || {};
			
			if( errors && BD.is(settings) !== "object" ){
				BD.error("For BD.pdf.addBox / BD.box, the settings argument must be an object.");
			}		
			
			this.settings = BD.extend({
				float:"left",
				width: parentBox.settings.innerPositions.right - parentBox.settings.innerPositions.left,
				height: parentBox.settings.innerPositions.bottom - parentBox.settings.innerPositions.top,
				margin:{top:0,right:0,bottom:0,left:0},
				padding:{top:0,right:0,bottom:0,left:0},
				outerPositions:{},
				positions:{},
				innerPositions:{},
			}, settings);
			
			
			
			this.queue = [];
			this.parentBox = parentBox;
			this.pdf = parentBox.pdf;
			this.pageNumber = parentBox.pageNumber;
			this.siblingBox = siblingBox || false;
			this.positionToSibling = positionToSibling || false;
			
			this.focus();
			
			for(var option in this.settings){
				if( BD.boxMethods.hasOwnProperty(option) ){
					var arg = BD.is(this.settings[option]) === "array" ? this.settings[option] : [this.settings[option]];
					this[option].apply(this, arg);
				}
			}
			
			return this;
		},
		
		
		
		
		
		
		
		
		
		textMethods:{},
		textMethod: function(name, fn){
			
			if( errors && typeof name !== "string" ){
				BD.error("The name argument for BD.textMethod must be a string.");
			}		
			if( errors && typeof fn !== "function" ){
				BD.error("The fn argument for BD.boxMethod must be an function.");
			}
			
			BD.textMethods[name] = true;
			BD.text.prototype[name] = fn;
		},
		textInit: function(settings, box){
			
			settings = settings || {};
			
			if(errors && BD.is(settings) !== "object"){
				BD.error("For box.text / BD.text, the settings argument must be an object.");
			}
			
			this.box = box;
			this.pdf = box.pdf;
			this.committed = false;
			this.formatted = {
				queue:[],
				styles:[],
				inheritedStyles:{maxLines:[],mustFit:[],maxWidth:[]},
				fits:[],
				remaining:[]
			}
			
			this.settings = BD.extend({
				style: BD.extend({}, this.getPDF("text")),
				styles: {},
				align: "left",
				width: box.settings.innerPositions.right - box.settings.innerPositions.left
			}, settings);
			
			for(var option in this.settings){
				if(typeof BD.textMethods[option] !== "undefined"){
					var arg = BD.is(this.settings[option]) === "array" ? this.settings[option] : [this.settings[option]];
					this[option].apply(this, arg);
				}
			}
			
			
			return this;
		},
		
		
		
		
		
		copyPDFmethod: function(to, methodName){			
			var newName = methodName;
			if( BD.is(methodName) === "array" ){
				newName = methodName[1];
				methodName = methodName[0];
			}
			if(errors && typeof BD.pdf.prototype[methodName] !== "function"){
				BD.error("BD.copyPDFmethod : jsPDF does not have the following method " + methodName)
			}
			BD[to].prototype[newName] = function(){
				return this.pdf[methodName].apply(this.pdf, arguments);
			}
		},
		copyPDFmethods: function(to, methodNames){
			for(var i = 0, iLen = methodNames.length; i<iLen; i++){
				BD.copyPDFmethod(to, methodNames[i]);
			}
		}
		
		
	}	
	
	
	
	
	
	
	BD.pdf = function(){
		return BD.pdfInit.apply(this, arguments);
	}
	
	BD.pdf.prototype = {
		addPage: function(){
			var internal = this.jsPDF().addPage().internal;
			var width = internal.pageSize.getWidth(), height = internal.pageSize.getHeight();
			this.enforceDefaults();	
			return new BD.box({}, {
				settings:{
					width:width,
					height:height,
					outerPositions:{top:0,right:width,bottom:height,left:0},
					positions:{top:0,right:width,bottom:height,left:0},
					innerPositions:{top:0,right:width,bottom:height,left:0},
				},
				pdf: this,
				pageNumber: internal.getCurrentPageInfo().pageNumber,
			}).commit();
		},
		set: function(key, options){
			BD.setter(this.settings, key, options);
			return this;
		},
		get: function(key){
			return BD.getter(this.settings, key);
		},
		enforceDefaults: function(){
			var text = this.get("text");
			var draw = this.get("draw");			
			var colors = {
				textColor: text.color,
				drawColor: draw.color,
				fillColor: draw.fill
			}			
			for(var key in colors){
				colors[key] = BD.color(colors[key]);
			}			
			this.jsPDF()
			.setFont(text.font)
			.setFontSize(text.size)
			.setFontStyle(text.style)
			.setTextColor( colors.textColor.r, colors.textColor.g, colors.textColor.b  )
			.setLineWidth(draw.width)
			.setDrawColor( colors.drawColor.r, colors.drawColor.g, colors.drawColor.b  )
			.setFillColor( colors.fillColor.r, colors.fillColor.g, colors.fillColor.b  );
			return this;
		}
	};
	
	BD.pdfMethod("jsPDF", {
		setting: function(){
			var args = [null].concat( Array.prototype.slice.call(arguments) );
			var _jsPDF = new (Function.prototype.bind.apply(jsPDF, args));
			_jsPDF.deletePage(1);
			return _jsPDF;
		},
		method: function(){
			return this.settings.jsPDF;
		}
	});
	
	
	
	
	
	
	
	
	
	BD.box = function(){
		return BD.boxInit.apply(this, arguments);
	}	
	
	BD.box.prototype = {
		focus: function(){
			this.jsPDF().setPage( this.pageNumber );
		},
		addBox: function(settings){
			if(this.committed){
				return new BD.box(settings, this);				
			}
			else if(errors){
				BD.error("box.addBox: You can not add a box until the current one is comitted.");	
			}
		},
		insertBox:function(settings, position){
			settings = settings || {};
			if(errors && !BD.is(position, ["array", "string"])){
				BD.error("box.insertBox: The position argument must be a string or an array");
			}			
			position = BD.is(position) === "array" ? position : position.split(/\s+/);
			
			var around = ["right", "above", "below", "left"];
			var alignment = {
				above:["left", "center", "right"],
				right:["bottom", "top", "center"],
				below:"above",
				left:"right"
			};
			
			if( around.indexOf(position[0]) < 0){
				around = around[0];
				if(errors){
					BD.error("box.insertBox: " + position[0] + " is not a valid position and has been defaulted to " +  around);
				}
			}
			else{
				around = position[0];
			}
			
			var alignments = typeof alignment[around] === "string" ? alignment[alignment[around]] : alignment[around];
			if( typeof position[1] === "undefined"){
				alignment = alignments[0];
			}
			else if( alignments.indexOf(position[1]) > -1){
				alignment = position[1];
			}
			else{
				alignment = alignments[0];
				if(errors){
					BD.error("box.insertBox: " + position[1] + " is not a valid alignment and has been defaulted to " +  alignment);
				}
				
			}
			if(this.committed){
				return new BD.box(settings, this.parentBox, this, [around, alignment]);	
			}
			else if(errors){
				BD.error("box.insertBox: You can not insert boxes until the current one has been committed.");	
			}
		},
		set:function(key, options){
			return BD.setter(this.settings, key, options);
		},
		get:function(key){
			return BD.getter(this.settings, key);
		},
		text: function(settings){
			if(this.committed){
				return new BD.text(settings, this);
			}
			else if(errors){
				BD.error("box.text: You can not add text to a box that has not been comitted.");	
			}			
		}		
	};
	BD.boxMethod("commit", {
		preCommit: function(){
			
			if(errors){
				if(this.committed){
					BD.error("box.commit: this box has already been comitted.");
				}
				if( !BD.is(this.settings.float, ["string", "array"]) ){
					BD.error("box.commit: The float setting must be an array or string");
				}
			}
			
			
			var width = this.settings.width,
			height = this.settings.height,
			parentWidth = this.parentBox.settings.innerPositions.right - this.parentBox.settings.innerPositions.left,
			parentHeight = this.parentBox.settings.innerPositions.bottom - this.parentBox.settings.innerPositions.top,
			_float = typeof this.settings.float === "string" ?  this.settings.float.trim().toLowerCase().split(/\s+/) : this.settings.float;
			
			
			
			var outerPositionsTop = 0,
			outerPositionsLeft = 0,
			marginTop = this.settings.margin.top,
			marginLeft = this.settings.margin.left,
			marginRight = this.settings.margin.right,
			marginBottom = this.settings.margin.bottom;
			
			if(this.siblingBox && this.positionToSibling){
				var around = this.positionToSibling[0];
				var position = this.positionToSibling[1];
				
				if(around === "above"){
					outerPositionsTop = -this.settings.height - this.siblingBox.settings.margin.top;
				}
				else if(around === "right"){
					outerPositionsLeft = this.siblingBox.settings.width + this.siblingBox.settings.margin.right;
				}
				else if(around === "below"){
					outerPositionsTop = this.siblingBox.settings.height+ this.siblingBox.settings.margin.bottom;					
				}
				else if(around === "left"){
					outerPositionsLeft = -this.settings.width - this.siblingBox.settings.margin.left;					
				}
				
				if(position === "center"){
					if(["above", "below"].indexOf(around) > -1){
						outerPositionsLeft = (this.siblingBox.settings.width - this.settings.width)/2
					}
					else{
						outerPositionsTop = (this.siblingBox.settings.height-this.settings.height)/2;	
						
					}
				}
				else if(position === "right"){
					outerPositionsLeft = this.siblingBox.settings.width - this.settings.width;					
				}
				else if(position === "bottom"){
					outerPositionsTop = this.siblingBox.settings.height-this.settings.height;					
				}
				
				
				this.settings.outerPositions.top = outerPositionsTop + this.siblingBox.settings.positions.top;
				this.settings.outerPositions.bottom = this.settings.outerPositions.top + marginTop + height + marginBottom;
				this.settings.positions.top = this.settings.outerPositions.top + marginTop;
				this.settings.positions.bottom = this.settings.positions.top + height;
				this.settings.innerPositions.top = this.settings.positions.top + this.settings.padding.top;
				this.settings.innerPositions.bottom = this.settings.positions.bottom - this.settings.padding.bottom;
				
				
				this.settings.outerPositions.left = outerPositionsLeft + this.siblingBox.settings.positions.left;
				this.settings.outerPositions.right = this.settings.outerPositions.left + marginLeft + width + marginRight;
				this.settings.positions.left = this.settings.outerPositions.left + marginLeft;
				this.settings.positions.right = this.settings.positions.left + width;		
				this.settings.innerPositions.left = this.settings.positions.left + this.settings.padding.left;
				this.settings.innerPositions.right = this.settings.positions.right - this.settings.padding.right;	
				
			}
			else{
				var vertical = ["top", "center", "bottom"];
				var horizontal = ["left", "center", "right"];
				
				if( _float.length === 1 && _float[0] === "middle" ){
					vertical = horizontal = "center";
				}
				else if ( _float.length === 1 ){
					if( horizontal.indexOf(_float[0]) >= 0 ){
						vertical = "top";
						horizontal = _float[0];
					}
					else if( vertical.indexOf(_float[0]) >= 0 ){
						vertical = _float[0];
						horizontal = "left";	
					}
					else{
						vertical = "top";
						horizontal = "left";
					}
				}
				else{
					vertical = vertical.indexOf(_float[0]) >= 0 ? _float[0] : "top";
					horizontal = horizontal.indexOf(_float[1]) >= 0 ? _float[1] : "left";
				}
				
				
				if( horizontal === "right" ){	
					outerPositionsLeft = parentWidth - width - marginLeft - marginRight;
				}
				else if( horizontal === "center" ){
					outerPositionsLeft = (parentWidth - width)/2 - marginLeft;
				}
				
				if( vertical === "bottom" ){
					outerPositionsTop = parentHeight - height - marginTop - marginBottom;
				}
				else if( vertical === "center" ){
					outerPositionsTop = (parentHeight - height)/2 - marginTop;
				}
				
				
				this.settings.outerPositions.top = outerPositionsTop + this.parentBox.settings.innerPositions.top;
				this.settings.outerPositions.bottom = this.settings.outerPositions.top + marginTop + height + marginBottom;
				this.settings.positions.top = this.settings.outerPositions.top + marginTop;
				this.settings.positions.bottom = this.settings.positions.top + height;
				this.settings.innerPositions.top = this.settings.positions.top + this.settings.padding.top;
				this.settings.innerPositions.bottom = this.settings.positions.bottom - this.settings.padding.bottom;
				
				
				this.settings.outerPositions.left = outerPositionsLeft + this.parentBox.settings.innerPositions.left;
				this.settings.outerPositions.right = this.settings.outerPositions.left + marginLeft + width + marginRight;
				this.settings.positions.left = this.settings.outerPositions.left + marginLeft;
				this.settings.positions.right = this.settings.positions.left + width;		
				this.settings.innerPositions.left = this.settings.positions.left + this.settings.padding.left;
				this.settings.innerPositions.right = this.settings.positions.right - this.settings.padding.right;		
				
				
			}
			
			this.settings.text = {
				yPosition: this.settings.innerPositions.top
			}
			
			
			var methodOrder = BD.get("methodOrder");
			
			if( BD.is(methodOrder) === "array" ){
				for(var i = 0, iLen = methodOrder.length; i < iLen; i++){
					var method = methodOrder[i];				
					for(var j = 0, jLen = this.queue.length; j < jLen; j++){
						if(this.queue[j] === null || this.queue[j].method !== method){
							continue;
						}			
						BD.boxMethods[ method ].postCommit.apply(this, this.queue[j].arguments);
						this.enforceDefaults();
						this.queue[j] = null;					
					}					
				}
			}
			else if(errors){
				BD.error("box.commit: the BD.methodOrder option must be an array.");
			}
			
			for(var j = 0, jLen = this.queue.length; j < jLen; j++){
				if(this.queue[j] === null){
					continue;
				}
				BD.boxMethods[ this.queue[j].method ].postCommit.apply(this, this.queue[j].arguments);
				this.enforceDefaults();
				this.queue[j] = null;
			}
			
			this.committed = true;			
			return this;
		}		
	});
	
	
	BD.boxMethod("width", {
		preCommit: function(width){
			this.settings.width = BD.calculatePercent(width, this.parentBox.settings.innerPositions.right - this.parentBox.settings.innerPositions.left);
			return this;
		}
	});
	
	BD.boxMethod("height", {
		preCommit:function(height){
			this.settings.height = BD.calculatePercent(height, this.parentBox.settings.innerPositions.bottom - this.parentBox.settings.innerPositions.top);
			return this;
		}
	});
	
	BD.boxMethod("margin", {
		preCommit: function(top, right, bottom, left){
			this.settings.margin = BD.standardiseSpacing.apply(null, arguments);
			return this;
		}
	});
	
	BD.boxMethod("padding", {
		preCommit:function(top, right, bottom, left){
			var padding = BD.standardiseSpacing.apply(null, arguments);
			if(BD.is(this.settings.padding) !== "object"){
				this.settings.padding = {top:0,right:0,bottom:0,left:0};
			}
			for(var position in this.settings.padding){
				this.settings.padding[ position ] += padding[position];
			}		
			return this;
		}
	});	
	
	BD.boxMethod("fill", {
		postCommit: function(color){		
			color = BD.color(color);
			this.jsPDF().setFillColor(color.r, color.g, color.b);
			this.jsPDF().rect(this.settings.positions.left, this.settings.positions.top, this.settings.width, this.settings.height, "F");
			return this;
		}
	});	
	
	BD.boxMethod("paddingFill", {
		postCommit: function(color){
			color = BD.color(color);
			this.jsPDF().setFillColor(color.r, color.g, color.b);
			this.jsPDF().rect(this.settings.innerPositions.left, this.settings.innerPositions.top, this.settings.innerPositions.right - this.settings.innerPositions.left, this.settings.innerPositions.bottom - this.settings.innerPositions.top, "F");
			return this;
		}
	});	
	
	BD.boxMethod("border",{
		preCommit: function(width){
			width =  width === undefined ? this.getPDF("draw").width : +width;
			for(var position in this.settings.padding){
				this.settings.padding[ position ] += width;
			}
			return this;
		},
		postCommit: function(width, color){
			width =  width === undefined ? this.getPDF("draw").width : +width;
			color =  color === undefined ? this.getPDF("draw").color : BD.color(color);
			this.jsPDF().setLineWidth(width)
			this.jsPDF().setDrawColor(color.r, color.g, color.b)
			this.jsPDF().rect(this.settings.positions.left + width/2, this.settings.positions.top + width/2, this.settings.width - width, this.settings.height - width, "S");
			return this;
		}
	});
	
	
	BD.copyPDFmethods("box", ["jsPDF", ["set", "setPDF"], ["get", "getPDF"], "enforceDefaults"]);
	
	
	
	
	
	
	
	
	
	
	
	
	BD.text =  function(){
		return BD.textInit.apply(this, arguments);
	}	
	BD.text.prototype = {
		format: function(content){
			if(this.formatted.queue.length){
				return this;
			}
			var styles = this.settings.styles = BD.is(this.settings.styles) === "object" ? this.settings.styles : {};
			var defaultStyle = BD.extend({}, this.settings.style);
			this.formatted.styles.push( defaultStyle );
			
			var jsPDF = this.jsPDF();			
			var scaleFactor = jsPDF.internal.scaleFactor;
			var stylesKeys = Object.keys( styles );
			
			var inheritStyles = {
				maxLines : {
					idKey: "mLId",
					active:false,
					name: false,
					id:0					
				},
				mustFit : {
					idKey: "mFId",
					active:false,
					name: false,
					id:0
				},
				maxWidth : {
					idKey: "mWId",
					active:false,
					name: false,
					id:0
				}
			}
			
			if(stylesKeys.length){
				var splitText = content.split(new RegExp('(\\[\\/?' + stylesKeys.join('\\]|\\[\\/?') + '\\])'));
				var activeStyleRegex = new RegExp('^\\[(\\/)?(' + stylesKeys.join('|') + ')\\]');
				var activeStyles = [];
				var formattedStylesTrack = {};
				
				
				
				for(var i = 0, iLen = splitText.length; i < iLen; i++){
					var textSplit = splitText[i];					
					if(!textSplit.length) continue;					
					
					var activeStylesFound = textSplit.match(activeStyleRegex);
					if(activeStylesFound) {
						if(activeStylesFound[1] == "/") {
							activeStyles.splice(activeStyles.lastIndexOf(activeStylesFound[2]), 1);							
							for(var inheritStyleName in inheritStyles){
								var inheritedStyle = inheritStyles[inheritStyleName];
								if(inheritedStyle.active && inheritedStyle.name === activeStylesFound[2]){
									inheritedStyle.name = false;
									inheritedStyle.active = false;
									inheritedStyle.id++;								
								}
								
							}
						} 
						else{
							activeStyles.push(activeStylesFound[2]);
							for(var inheritStyleName in inheritStyles){
								var inheritedStyle = inheritStyles[inheritStyleName];
								if(!inheritedStyle.active && styles[activeStylesFound[2]].hasOwnProperty(inheritStyleName)){	
									inheritedStyle.name = activeStylesFound[2];
									inheritedStyle.active = true;						
									this.formatted.inheritedStyles[inheritStyleName][inheritedStyle.id] = styles[activeStylesFound[2]][inheritStyleName];
								}
								
							}
						}
						continue;
					}
					else if(activeStyles.length) {				
						var formattedStylesKey = activeStyles.join("-");
						
						
						for(var inheritStyleName in inheritStyles){
							var inheritedStyle = inheritStyles[inheritStyleName];
							if(inheritedStyle.active){
								formattedStylesKey += "-" + inheritedStyle.id;
							}							
						}
						
						if(typeof formattedStylesTrack[formattedStylesKey] !== "undefined"){
							var styleIndex = formattedStylesTrack[formattedStylesKey];
						}
						else{
							var argsArr = [{}, defaultStyle];
							for(var j = 0, jLen = activeStyles.length; j < jLen; j++){
								if(typeof styles[activeStyles[j]] !== "undefined"){
									if(typeof styles[activeStyles[j]].color !== "undefined"){
										styles[activeStyles[j]].color = BD.color(styles[activeStyles[j]].color);
									}
									for(var inheritStyleName in inheritStyles){
										var inheritedStyle = inheritStyles[inheritStyleName];
										if(inheritedStyle.active){
											styles[activeStyles[j]][inheritedStyle.idKey] = inheritedStyle.id;
										}
										
									}
									argsArr.push(styles[activeStyles[j]]);
								}
							}
							var styleIndex = formattedStylesTrack[formattedStylesKey] = this.formatted.styles.length;
							this.formatted.styles.push( BD.extend.apply(null, argsArr) );
						}
					} 
					else{
						var styleIndex = 0;
					}
					
					textSplit = textSplit.split("\n");
					
					var textSplitSorted = [];
					
					for(var j = 0, jLen = textSplit.length; j < jLen; j++){
						textSplitSorted = textSplitSorted.concat(  textSplit[j].split(/(\s{1,})/) );
						textSplit[j] = null;
						if(j !== jLen-1) textSplitSorted.push("\n")
					}		
					var size  = this.formatted.styles[styleIndex].size;
					var height = +(size/scaleFactor).toFixed(3);
					jsPDF.setFontSize( size );
					for(var j = 0, jLen = textSplitSorted.length; j < jLen; j++){
						if(!textSplitSorted[j].length) continue;
						this.formatted.queue.push({
							c:textSplitSorted[j],
							s:styleIndex,
							w: +jsPDF.getTextWidth( textSplitSorted[j] ).toFixed(3),
							h:height
						});
					}
					
				}
				
				
			}
			else{
				
				for(var inheritStyleName in inheritStyles){
					if(this.formatted.styles[0].hasOwnProperty(inheritStyleName)){		
						var inheritedStyle = inheritStyles[inheritStyleName];					
						this.formatted.styles[0][inheritedStyle.idKey] = inheritedStyle.id;
						this.formatted.inheritedStyles[inheritStyleName][inheritedStyle.id] = this.formatted.styles[0][inheritStyleName];
					}					
				}
				
				var textSplit = content.split("\n");		
				var textSplitSorted = [];		
				for(var j = 0, jLen = textSplit.length; j < jLen; j++){
					textSplitSorted = textSplitSorted.concat(  textSplit[j].split(/(\s{1,})/) );
					textSplit[j] = null;
					if(j !== jLen-1) textSplitSorted.push("\n")
				}		
				var size  = this.formatted.styles[0].size;					
				var height = +(size/scaleFactor).toFixed(3);
				jsPDF.setFontSize( size );					
				for(var j = 0, jLen = textSplitSorted.length; j < jLen; j++){
					if(!textSplitSorted[j].length) continue;
					this.formatted.queue.push({
						c:textSplitSorted[j],
						s:0,
						w: +jsPDF.getTextWidth( textSplitSorted[j] ).toFixed(3),
						h:height
					});
				}					
			}
			
			this.settings.content = null;
			
			
			return this;
		},
		fits: function(){	
			if(errors && !this.formatted.queue.length){
				BD.error("text.fits: You can not call fits until you have added content.");
			}
			if(this.formatted.fits.length || this.formatted.remaining.length){
				return !this.formatted.remaining.length;
			}
			
			var jsPDF = this.jsPDF();
			var scaleFactor = jsPDF.internal.scaleFactor;
			
			var yPosition = this.box.settings.text.yPosition;
			var yEnd = this.box.settings.innerPositions.bottom;
			var xPosition = this.box.settings.innerPositions.left;
			var xEnd = this.box.settings.innerPositions.right;			
			var boxWidth = xEnd - xPosition;
			
			var queue = this.formatted.queue.slice();
			
			var widths = {};
			
			for(var index = 0; index < queue.length; index++){
				var text = queue[index];
				if(text===null) continue;
				if(text.hasOwnProperty("b")){
					continue;
				}
				var style = this.formatted.styles[text.s];
				if( style.hasOwnProperty("maxWidth") && !widths.hasOwnProperty(style.mWId) ){
					widths[style.mWId] = BD.calculatePercent(style.maxWidth, boxWidth);
				}
				
				var width = !!style.mWId ? widths[style.mWId] : boxWidth;
				
				if(text.w > width){
					jsPDF.setFontSize( style.size );
					var words = [];
					var word = "";
					var wordWidth;
					for(var i = 0, iLen = text.c.length; i < iLen; i++){						
						wordWidth = jsPDF.getTextWidth(word + text.c[i] + "-");
						if( wordWidth < width ){
							word += text.c[i];
						}
						else{
							words.push({
								c:word,
								s:text.s,
								w: +wordWidth.toFixed(3),
								h:text.h,
								b:true
							});
							word = text.c[i];
						}
					}
					if(word.length){
						words.push({
							c:word,
							s:text.s,
							w: +wordWidth.toFixed(3),
							h: text.h,
							b:true
						});
					}					
					words[words.length-1].b = false;
					words[words.length-1].w = +jsPDF.getTextWidth(words[words.length-1].c).toFixed(3);					
					queue = queue.slice(0,index).concat(words).concat(queue.slice(index+1, queue.length));
				}
			}
			
			queue.push({c: " ", s: 0, w: 0, h: 0})
			
			
			var curYPosition = yPosition;
			var curXPosition = xPosition;
			var lines = [];
			var line = [];
			var remaining = [];
			var lineHeight = 0;
			var lineWidth = 0;
			
			var style = null;
			var styleI = null;
			var textHeight = 0;
			
			var width = boxWidth;
			
			var mFId = null;
			var mLId = null;
			var lineCount = 0;
			
			for(var index = 0; index < queue.length; index++){
				var text = queue[index];
				if(text===null) continue;
				
				
				if(text.c === "\n"){
					line.width = lineWidth;
					line.height = lineHeight;
					lines.push(line);
					curYPosition += lineHeight;
					curXPosition = xPosition;
					line = [];
					lineHeight = textHeight;
					lineWidth = 0;
				}
				
				
				if(styleI !== text.s){
					styleI = text.s;
					style = this.formatted.styles[styleI];					
					width = style.maxWidth ? widths[style.mWId] : boxWidth;
					xEnd = xPosition + width;
					textHeight = style.hasOwnProperty("lineHeight") ? +(style.lineHeight/scaleFactor).toFixed(3): text.h;
					mLId = style.hasOwnProperty("mLId") ? style.mLId : null;
					mFId = style.hasOwnProperty("mFId") ? style.mFId : null;
					lineCount = 0;
				}
				
				if(textHeight > lineHeight){
					lineHeight = textHeight
				}
				
				if(lineHeight + curYPosition > yEnd){
					var remainder = [];
					
					for(var i = 0, iLen = lines.length; i < iLen; i++){
						for(var j = 0, jLen = lines[i].length; j < jLen; j++){							
							if(this.formatted.styles[lines[i][j].s].mFId === mFId){
								remainder.push(lines[i][j]);
								lines[i][j] = null;
							}
						}
					}
					
					queue.pop();
					remaining = remainder.concat(remaining).concat(line, queue.slice(index, queue.length));
					
					var bIndex = null;
					var fullText = "";
					var fullTextW = 0;
					for(var i = 0; i < remaining.length; i++){
						var t = remaining[i];
						if(t.hasOwnProperty("b")){
							fullText += t.c;
							fullTextW += t.w;
							if(bIndex === null){
								bIndex = i;
							}
							else{
								remaining[i] = null;
							}
							if(!t.b){
								remaining[bIndex].c = fullText;
								remaining[bIndex].w = fullTextW;
								delete remaining[bIndex].b;
								bIndex = null;
								fullText = "";
								fullTextW = 0;
							}
						}
					}
					
					for(var i = 0; i < remaining.length; i++){
						if(remaining[i]==null){
							remaining.splice(i,1);
						}
					}
					this.formatted.remaining = remaining;
					break;
					
				}
				else if(text.w + curXPosition > xEnd || index === queue.length - 1){					
					line.height = lineHeight;
					line.width = lineWidth;
					lines.push(line);
					
					curYPosition += lineHeight;
					curXPosition = xPosition;
					line = [];
					lineHeight = textHeight;
					lineWidth = 0;
					if(lineCount === this.formatted.inheritedStyles.maxLines[mLId]){
						for(var i = index; i < queue.length; i++){
							if(this.formatted.styles[queue[i].s].mLId === mLId){
								remaining.push(queue[i]);
							}
							else{
								remaining = [];
								index = i-1;
								mLId = null;
								lineCount = 0;
								break;
							}
						}
						lineHeight = 0;
						continue;
					}
					lineCount++;
				}
				if(text.c !== "\n"){
					lineWidth += text.w;
					line.push(text);
					curXPosition += text.w;
				}
			}			
			this.formatted.fits = lines;
			this.formatted.widths = widths;
			
			return !this.formatted.remaining.length;
			
		},
		commit: function(){
			this.fits();						
			var jsPDF = this.jsPDF();
			
			var yPosition = this.box.settings.text.yPosition;
			var xPosition = this.box.settings.innerPositions.left;
			var boxWidth = this.box.settings.innerPositions.right - xPosition;
			
			var curYPosition = yPosition;
			var curXPosition = xPosition;
			var styles = this.formatted.styles;
			var styleIndex = null;
			var style = null;
			
			var aligns = ["left", "center", "right", "justify"];
			var lineAlign = "left";
			
			
			var lineStyle, width, align;
			for(var i = 0, iLen = this.formatted.fits.length; i < iLen; i++){
				var line = this.formatted.fits[i];				
				if(!line.length) continue;
				
				var lineHeight = line.height;
				var lineWidth = line.width;
				var wordsInLine = line.length;
				var addWidth = 0;
				
				lineStyle = styles[line[0].s];
				align = lineStyle.align; align = aligns.indexOf(align) < 0 ? "left" : align;				
				width = lineStyle.maxWidth ? this.formatted.widths[lineStyle.mWId] : boxWidth;				
				
				
				if(align === "center"){
					curXPosition += (width - lineWidth)/2;					
				}
				else if(align === "right"){
					curXPosition += width - lineWidth;					
				}
				else if(align === "justify" && lineWidth > 0.6*width){
					addWidth = (width - lineWidth)/(line.length - 1);
				}
				
				for(var j = 0; j < wordsInLine; j++){
					var text = line[j];
					if(text===null) continue;
					if(text.c==="\n") continue;
					if( text.c === " " ){
						if(align === "right" && j === wordsInLine-1) continue;
						if(j===0) continue;
					}
					var word = text.hasOwnProperty("b") && text.b ? text.c + "-" : text.c;
					if(text.s !== styleIndex){
						styleIndex = text.s;
						style = styles[styleIndex];
						
						style.color = BD.color(style.color);
						jsPDF
						.setFont(style.font)
						.setFontSize(style.size)
						.setFontStyle(style.style)
						.setTextColor( style.color.r, style.color.g, style.color.b  )
					}
					jsPDF.text(word, curXPosition, curYPosition + lineHeight);
					curXPosition += text.w + addWidth;
				}
				
				curYPosition += lineHeight;
				curXPosition = this.box.settings.innerPositions.left;
				
				
			}
			
			this.box.settings.text.yPosition = curYPosition;
			
			this.comitted = true;
			
			this.enforceDefaults();
			return this;
		}
	}
	
	
	BD.textMethod("width", function(width){	
		this.settings.width = BD.calculatePercent(width, this.box.settings.innerPositions.right - this.box.settings.innerPositions.left);
		return this;		
	});
	
	BD.textMethod("content", function(content){
		if(errors && this.formatted.isFormatted){
			BD.error("text.content: You can not add content more than once.")
		}
		if( BD.is(content) === "array" ){
			this.formatted.queue = content;
		}
		else{
			this.format(content);
		}
		this.formatted.isFormatted = true;
		return this;
	});
	
	BD.textMethod("styles", function(styles){
		if(errors && this.formatted.isFormatted){
			BD.error("text.styles: styles must be added before content.")
		}
		if( BD.is(styles) === "array" ){
			this.formatted.styles = styles;
		}
		else{
			BD.extend(this.settings.styles, styles);
		}
		return this;
	});
	
	BD.textMethod("inheritedStyles", function(inheritedStyles){
		this.formatted.inheritedStyles = inheritedStyles;
		return this;
	});
	BD.textMethod("destroy", function(textObject){
		textObject = null;
		return this;
	});
	
	BD.textMethod("switchBox", function(box, destroy){
		destroy = destroy === undefined ? true : !!destroy;
		return new BD.text({}, box)
		.inheritedStyles(BD.extend({}, this.formatted.inheritedStyles))
		.styles(this.formatted.styles.slice())
		.content((this.comitted ? this.formatted.remaining : this.formatted.queue).slice())
		.destroy(destroy ? this : null);
		
	});
	
	
	BD.copyPDFmethods("text", ["jsPDF", ["set", "setPDF"], ["get", "getPDF"], "enforceDefaults"]);
	
	
	
})(window)																																						