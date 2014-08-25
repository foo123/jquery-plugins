/*
Documentation

Transitions (ie the specific effect to apply):

    random (a combination of the rest transitions)
	rotate-tiles
	rotate-tiles-reverse
    flip-tiles-horizontal
    flip-tiles-vertical
    iris
    iris-reverse
    fade-tiles
    fade-grow-tiles
    fade-shrink-tiles
    shrink-tiles
    grow-tiles
    shrink-tiles-horizontal
    grow-tiles-horizontal
    grow-tiles-vertical
    grow-fade-tiles-horizontal
    grow-fade-tiles-vertical
    shrink-tiles-vertical
    move-tiles-vertical-down
    move-tiles-vertical-up
    move-tiles-vertical-up-down
    move-tiles-horizontal-right
    move-tiles-horizontal-left
    move-tiles-horizontal-left-right
    move-fade-tiles-vertical-down
    move-fade-tiles-vertical-up
    move-fade-tiles-vertical-up-down
    move-fade-tiles-horizontal-right
    move-fade-tiles-horizontal-left
    move-fade-tiles-horizontal-left-right
    fly-top-left
    fly-bottom-left
    fly-top-right
    fly-bottom-right
    fly-left
    fly-right
    fly-top
    fly-bottom
    pan-top-left
    pan-top-right
    pan-bottom-right
    pan-bottom-left
    pan-left
    pan-right
    pan-top
    pan-bottom

Orderings (ie the order of the tiles in the transition animation):

    checkerboard
    diagonal-top-left
    diagonal-top-right
    diagonal-bottom-left
    diagonal-bottom-right
    rows
    rows-reverse
    columns
    columns-reverse
    rows-first
    rows-first-reverse
    columns-first
    columns-first-reverse
    spiral-top-left
    spiral-top-right
    spiral-bottom-left
    spiral-bottom-right
    spiral-top-left-reverse
    spiral-top-right-reverse
    spiral-bottom-left-reverse
    spiral-bottom-right-reverse
    random
    up-down
    up-down-reverse
    left-right
    left-right-reverse


Easing

i use a jquery easings plugin (jquery.animation.easing.js)
however u can use your own easings, just include the js file and use the name of the easing function in the easing parameter
note: some default transitions use the easing functions from jquery.animation.easing.js so include it in ur scripts
Duration

The duration of the transition in seconds
Delay

The duration of the image after the transition until the next transition in seconds
Rows

The number of rows to slice image for transition
note: some transitions use default rows regardless of parameter
Columns

The number of columns to slice image for transition
note: some transitions use default columns regardless of parameter
Overlap

The percentage of overlap between each slice during animation
0: next slice starts after previous finishes(no overlap), 1: all start simultaneously (full overlap)
Javascript-only parameters

Previous parameters can be applied either through html or through javascript the next set of parameters are applied only as plugin parameters through javascript
Caption

Boolean, wether to show captions or not, default true
Controls

Boolean, wether to show controls or not, default true
randomOrder

Boolean, wether to randomize order of images, default false
Preload

Boolean, wether to preload images, default true
preloaderClass

String, css class of div that contains the preloader (look at noflash.css)
captionClass

String, css class to apply to caption holder
controlsClass

String, css class to apply to controls holder
backColor

String, color code for background color of slideshow
width,height

The width and height of the images in pixels, numbers
imgs

Array of additional images with the transitions etc to add to the slideshow, the parameters are the same as the html parameters (ie transition, easing, ordering, rows,etc) additional parameters are
src: the url of the image,
caption: the caption text/html for image,
alt: the alt attribute for the image
Note:

If no transition, rows etc parameters are provided for each image then the javascript options parameters act as default
Also if multiple elements match the selector only the first will be the slideshow (the code would be too messy if multiple elements were matched)
If u want to have multiple copies just run the plugin once for each matched element


version 1.8
Note this software is provided AS IS with no warranty. It is provided free of charge for u to use.
Author: Nikos M.
Site: http://nikos-web-development.netai.net
*/
;(function($){
// attach core functions to jquery as singleton/static
if (typeof $.noflashCore=='undefined' || $.noflashCore==null)
{
	// override default animation step to animate custom props for advanced fx
	var $_fx_step_default = $.fx.step._default;
	$.fx.step._default = function (fx) {
	  if (!fx.elem._customAnimate) return $_fx_step_default(fx);
	  fx.elem[fx.prop] = fx.now;
	};

// core plugin functions used by all plugin instances
$.noflashCore={	
			Matrix2D:function(){
				// default eye matrix
				this.eye=function(){
					this.val={M11:1,M12:0,M21:0,M22:1};
				};
				
				this.eye();
				
				// drop in any values given
				if (arguments.length>0)
				{
					this.val=$.extend(true,this.val,arguments[0]);
				}
				
				// public methods
				this.add=function(m){
					this.val.M11+=m.val.M11;
					this.val.M12+=m.val.M12;
					this.val.M21+=m.val.M21;
					this.val.M22+=m.val.M22;
				};
				
				this.leftMult=function(m){
					var t11,t12,t21,t22;
					t11=m.val.M11*this.val.M11+m.val.M12*this.val.M21;
					t12=m.val.M11*this.val.M12+m.val.M12*this.val.M22;
					t21=m.val.M21*this.val.M11+m.val.M22*this.val.M21;
					t22=m.val.M21*this.val.M12+m.val.M22*this.val.M22;
					this.val.M11=t11;
					this.val.M12=t12;
					this.val.M21=t21;
					this.val.M22=t22;
				};
				
				this.rightMult=function(m){
					var t11,t12,t21,t22;
					t11=this.val.M11*m.val.M11+this.val.M12*m.val.M21;
					t12=this.val.M11*m.val.M12+this.val.M12*m.val.M22;
					t21=this.val.M21*m.val.M11+this.val.M22*m.val.M21;
					t22=this.val.M21*m.val.M12+this.val.M22*m.val.M22;
					this.val.M11=t11;
					this.val.M12=t12;
					this.val.M21=t21;
					this.val.M22=t22;
				};
				
				this.display=function(){
					return("M11="+this.val.M11+", "+"M12="+this.val.M12+", "+"M21="+this.val.M21+", "+"M22="+this.val.M22);
				};
	},

	cutimage:function(img,rows,columns,ow,oh)
				{
					var iw=ow;//img.width();
					var ih=oh;//img.height();
					var w=Math.round(iw/columns);
					var h=Math.round(ih/rows);
					var pieces=[];
					for (var i=0;i<columns; i++)
					{
						for (var j=0; j<rows; j++)
						{
							var dd=$("<div></div>");
							var x=i*w;
							var y=j*h;
							dd.css({margin:0,padding:0,overflow:"hidden",position:"absolute",top:y+"px",left:x+"px",width:w+"px",height:h+"px",background:"transparent url('"+img.attr('src')+"') no-repeat "+(-x)+"px "+(-y)+"px"});
							pieces[i*rows+j]={piece:dd,w:w,h:h,x:x,y:y,iw:iw,ih:ih};
						}
					}
					return(pieces);
				},
	
	destroypieces:function(pieces){
						if (pieces!=null)
						{
						for (var i=0;i<pieces.length;i++)
						{
							pieces[i].piece.children().remove();
							pieces[i].piece.remove();
							pieces[i].piece=null;
							pieces[i]=null;
						}
						pieces=null;
						}
						return(pieces);
					},
					
	transitions:{
			"rotate-tiles":{animate:{_custom_step:1},start:{position:"absolute"},easing:"linear"},
			"rotate-tiles-reverse":{reverse:true,animate:{_custom_step:0},start:{position:"absolute"},easing:"linear"},
			"flip-tiles-horizontal":{animate:{_custom_step:1},start:{position:"absolute"},easing:"linear"},
			"flip-tiles-vertical":{animate:{_custom_step:1},start:{position:"absolute"},easing:"linear"},
			"iris":{rows:1,columns:1,animate:{width:"X(w)px",height:"X(h)px",top:"0px",left:"0px"},start:{"background-position":"50% 50%",width:"0px",height:"0px",top:"OH2",left:"OW2"},easing:"linear"},
			"iris-reverse":{reverse:true,rows:1,columns:1,animate:{width:"0px",height:"0px",top:"OH2",left:"OW2"},start:{"background-position":"50% 50%",width:"X(w)px",height:"X(h)px",top:"0px",left:"0px"},easing:"linear"},
			"fade-tiles":{animate:{opacity:1},start:{opacity:0},easing:"linear"},
			"fade-grow-tiles":{animate:{opacity:1,width:"X(w)px",height:"X(h)px"},start:{opacity:0,width:"0px",height:"0px"},easing:"linear"},
			"fade-shrink-tiles":{animate:{opacity:0,width:"0px",height:"0px"},start:{opacity:1,width:"X(w)px",height:"X(h)px"},easing:"linear",reverse:true},
			"shrink-tiles":{animate:{width:"0px",height:"0px"},start:{width:"X(w)px",height:"X(h)px"},easing:"linear",reverse:true},
			"grow-tiles":{animate:{width:"X(w)px",height:"X(h)px"},start:{width:"0px",height:"0px"},easing:"linear"},
			"shrink-tiles-horizontal":{animate:{width:"0px"},start:{width:"X(w)px"},easing:"linear",reverse:true},
			"grow-tiles-horizontal":{animate:{width:"X(w)px"},start:{width:"0px"},easing:"linear"},
			"grow-fade-tiles-vertical":{animate:{height:"X(h)px",opacity:1},start:{height:"0px",opacity:0},easing:"linear"},
			"grow-fade-tiles-horizontal":{animate:{width:"X(w)px",opacity:1},start:{width:"0px",opacity:0},easing:"linear"},
			"grow-tiles-vertical":{animate:{height:"X(h)px"},start:{height:"0px"},easing:"linear"},
			"shrink-tiles-vertical":{animate:{height:"0px"},start:{height:"X(h)px"},easing:"linear",reverse:true},
			"move-tiles-vertical-down":{animate:{top:"X(y)px"},start:{top:"-X(h)px"},easing:"linear"},
			"move-tiles-vertical-up":{animate:{top:"X(y)px"},start:{top:"X(ih)px"},easing:"linear"},
			"move-tiles-vertical-up-down":{animate:{top:"X(y)px"},start1:{top:"-X(h)px"},start2:{top:"X(ih)px"},easing:"linear"},
			"move-tiles-horizontal-right":{animate:{left:"X(x)px"},start:{left:"-X(w)px"},easing:"linear"},
			"move-tiles-horizontal-left":{animate:{left:"X(x)px"},start:{left:"X(iw)px"},easing:"linear"},
			"move-tiles-horizontal-left-right":{animate:{left:"X(x)px"},start1:{left:"-X(w)px"},start2:{left:"X(iw)px"},easing:"linear"},
			"move-fade-tiles-vertical-down":{animate:{top:"X(y)px",opacity:1},start:{top:"-X(h)px",opacity:0},easing:"linear"},
			"move-fade-tiles-vertical-up":{animate:{top:"X(y)px",opacity:1},start:{top:"X(ih)px",opacity:0},easing:"linear"},
			"move-fade-tiles-vertical-up-down":{animate:{top:"X(y)px",opacity:1},start1:{top:"-X(h)px",opacity:0},start2:{top:"X(ih)px",opacity:0},easing:"linear"},
			"move-fade-tiles-horizontal-right":{animate:{left:"X(x)px",opacity:1},start:{left:"-X(w)px",opacity:0},easing:"linear"},
			"move-fade-tiles-horizontal-left":{animate:{left:"X(x)px",opacity:1},start:{left:"X(iw)px",opacity:0},easing:"linear"},
			"move-fade-tiles-horizontal-left-right":{animate:{left:"X(x)px",opacity:1},start1:{left:"-X(w)px",opacity:0},start2:{left:"X(iw)px",opacity:0},easing:"linear"},
			"fly-top-left":{animate:{left:"0px",top:"0px"},start:{left:"X(iw)px",top:"X(ih)px"},rows:1,columns:1,easing:"linear"},
			"fly-bottom-left":{animate:{left:"0px",top:"0px"},start:{left:"X(iw)px",top:"-X(ih)px"},rows:1,columns:1,easing:"linear"},
			"fly-top-right":{animate:{left:"0px",top:"0px"},start:{left:"-X(iw)px",top:"X(ih)px"},rows:1,columns:1,easing:"linear"},
			"fly-bottom-right":{animate:{left:"0px",top:"0px"},start:{left:"-X(iw)px",top:"-X(ih)px"},rows:1,columns:1,easing:"linear"},
			"fly-left":{animate:{left:"0px"},start:{left:"X(iw)px"},rows:1,columns:1,easing:"linear"},
			"fly-right":{animate:{left:"0px"},start:{left:"-X(iw)px"},rows:1,columns:1,easing:"linear"},
			"fly-top":{animate:{top:"0px"},start:{top:"X(ih)px"},rows:1,columns:1,easing:"linear"},
			"fly-bottom":{animate:{top:"0px"},start:{top:"-X(ih)px"},rows:1,columns:1,easing:"linear"},
			"pan-top-left":{animate:{top:"-X(h)px",left:"-X(w)px"},start:{top:"X(y)px",left:"X(x)px"},rows:1,columns:1,easing:"linear",current:{top:"0px",left:"0px"},next:{top:"X(h)px",left:"X(w)px"}},
			"pan-top-right":{animate:{top:"-X(h)",left:"X(w)"},start:{top:"X(y)px",left:"X(x)px"},rows:1,columns:1,easing:"linear",current:{top:"0px",left:"0px"},next:{top:"X(h)px",left:"-X(w)px"}},
			"pan-bottom-right":{animate:{top:"X(h)px",left:"X(w)px"},start:{top:"X(y)px",left:"X(x)px"},rows:1,columns:1,easing:"linear",current:{top:"0px",left:"0px"},next:{top:"-X(h)px",left:"-X(w)px"}},
			"pan-bottom-left":{animate:{top:"X(h)px",left:"-X(w)px"},start:{top:"X(y)px",left:"X(x)px"},rows:1,columns:1,easing:"linear",current:{top:"0px",left:"0px"},next:{top:"-X(h)px",left:"X(w)px"}},
			"pan-left":{animate:{left:"-X(w)px"},start:{top:"X(y)px",left:"X(x)px"},rows:1,columns:1,easing:"linear",current:{top:"0px",left:"0px"},next:{top:"0px",left:"X(w)px"}},
			"pan-right":{animate:{left:"X(w)px"},start:{top:"X(y)px",left:"X(x)px"},rows:1,columns:1,easing:"linear",current:{top:"0px",left:"0px"},next:{top:"0px",left:"-X(w)px"}},
			"pan-top":{animate:{top:"-X(h)px"},start:{top:"X(y)px",left:"X(x)px"},rows:1,columns:1,easing:"linear",current:{top:"0px",left:"0px"},next:{top:"X(h)px",left:"0px"}},
			"pan-bottom":{animate:{top:"X(h)px"},start:{top:"X(y)px",left:"X(x)px"},rows:1,columns:1,easing:"linear",current:{top:"0px",left:"0px"},next:{top:"-X(h)px",left:"0px"}}
	},
	
	randomTransitions:[
		{transition:"rotate-tiles-reverse",easing:"quintEaseOut",duration:2.5,overlap:1,rows:6,columns:6,ordering:"columns-first"},
		{transition:"flip-tiles-vertical",easing:"backEaseOut",duration:2,overlap:0.9,rows:4,columns:4,ordering:"spiral-top-left"},
		{transition:"iris-reverse",easing:"quintEaseOut",duration:2,overlap:0.9,rows:1,columns:1,ordering:"rows-first"},
		{transition:"grow-tiles",easing:"linear",duration:2,overlap:0.9,rows:6,columns:6,ordering:"rows-first"},
		{transition:"fade-shrink-tiles",easing:"linear",duration:2,overlap:0.9,rows:6,columns:6,ordering:"left-right"},
		{transition:"shrink-tiles",easing:"quintEaseOut",duration:2,overlap:1,rows:6,columns:6,ordering:"columns-first"},
		{transition:"fade-tiles",easing:"linear",duration:2,overlap:0.9,rows:6,columns:6,ordering:"diagonal-top-left"},
		{transition:"fade-tiles",easing:"linear",duration:2,overlap:0.9,rows:5,columns:5,ordering:"random"},
		{transition:"fade-tiles",easing:"linear",duration:2,overlap:0.9,rows:5,columns:5,ordering:"spiral-top-left"},
		{transition:"fade-tiles",easing:"linear",duration:2,overlap:0.9,rows:5,columns:5,ordering:"left-right"},
		{transition:"fly-top-left",easing:"backEaseOut",duration:2,overlap:0.9,rows:1,columns:1,ordering:"columns-first"},
		{transition:"pan-top-left",easing:"backEaseOut",duration:2,overlap:0.9,rows:1,columns:1,ordering:"columns-first"},
		{transition:"move-tiles-horizontal-left-right",easing:"backEaseOut",duration:2,overlap:0.8,rows:7,columns:1,ordering:"columns-first"},
		{transition:"move-tiles-horizontal-right",easing:"backEaseOut",duration:2,overlap:0.8,rows:7,columns:1,ordering:"columns-first"},
		{transition:"move-tiles-vertical-up-down",easing:"backEaseOut",duration:2,overlap:0.9,rows:1,columns:7,ordering:"columns-first"},
		{transition:"move-tiles-vertical-up",easing:"quintEaseOut",duration:2,overlap:0.9,rows:1,columns:7,ordering:"columns-first"},
		{transition:"grow-tiles-horizontal",easing:"linear",duration:2,overlap:0.9,rows:1,columns:6,ordering:"random"},
		{transition:"grow-tiles-vertical",easing:"linear",duration:2,overlap:0.9,rows:6,columns:1,ordering:"random"}
	],
	
	getRandomTransition:function(){
				/*var obj=randomTransitions;
				var keys = [];
				for (var prop in obj) {
					if (obj.hasOwnProperty(prop)) {
						keys.push(obj[prop]);
					}
				}
				return keys[Math.round((keys.length-1) * Math.random())];*/
				return($.noflashCore.randomTransitions[Math.round(($.noflashCore.randomTransitions.length-1)*Math.random())]);
			},
	
	translate:function(where,what,ow,oh){
				for (var n in where)
				{
					//if (where.hasOwnProperty(n))
					{
					var r=(/(?:X\()(\w+)(?:\))/).exec(where[n]+"");
					if (r!=null)
						where[n]=where[n].replace(/X\(\w+\)/,what[r[1]]);
					var rw=(/OW2/).exec(where[n]+"");
					if (rw!=null)
						where[n]=where[n].replace(/OW2/,ow);
					var rh=(/OH2/).exec(where[n]+"");
					if (rh!=null)
						where[n]=where[n].replace(/OH2/,oh);
					}
				}
			},
	
	linearArray:function(howmany)
	{
		var a=[];
		for (var i=0;i<howmany;i++)
			a[i]=i;
		return(a);
	},
	
	rows:function(pieces,rowsi,columnsi)
	{
		var delays=[];
		for (var i=0;i<columnsi;i++)
		{
			for (var j=0;j<rowsi;j++)
			{
				delays[i*rowsi+j]=j;
			}
		}
		return({pieces:pieces, delays:delays, groups:rowsi});
	},
	
	rowsReverse:function(pieces,rowsi,columnsi)
	{
		var delays=[];
		for (var i=0;i<columnsi;i++)
		{
			for (var j=0;j<rowsi;j++)
			{
				delays[i*rowsi+j]=rowsi-1-j;
			}
		}
		return({pieces:pieces, delays:delays, groups:rowsi});
	},
	
	columns:function(pieces,rowsi,columnsi)
	{
		var delays=[];
		for (var i=0;i<columnsi;i++)
		{
			for (var j=0;j<rowsi;j++)
			{
				delays[i*rowsi+j]=i;
			}
		}
		return({pieces:pieces, delays:delays, groups:columnsi});
	},
	
	columnsReverse:function(pieces,rowsi,columnsi)
	{
		var delays=[];
		for (var i=0;i<columnsi;i++)
		{
			for (var j=0;j<rowsi;j++)
			{
				delays[i*rowsi+j]=columnsi-1-i;
			}
		}
		return({pieces:pieces, delays:delays, groups:columnsi});
	},
	
	columnsFirst:function(pieces,rows,columns){
					return({pieces:pieces,delays:$.noflashCore.linearArray(pieces.length),groups:pieces.length});
				},
	
	columnsFirstReverse:function(pieces,rows,columns){
					var o=$.noflashCore.columnsFirst(pieces,rows,columns);
					return({pieces:o.pieces.reverse(),delays:o.delays,groups:o.groups});
				},
	rowsFirst:function(pieces,rows,columns){
					var newpieces=[];
					
					for (var i=0; i<rows; i++)
					{
						for (var j=0;j<columns;j++)
						{
							newpieces[i*columns+j]=pieces[j*rows+i];
						}
					}
					return({pieces:newpieces,delays:$.noflashCore.linearArray(pieces.length),groups:pieces.length});
				},
	
	rowsFirstReverse:function(pieces,rows,columns){
						var o=$.noflashCore.rowsFirst(pieces,rows,columns);
						return({pieces:o.pieces.reverse(),delays:o.delays,groups:o.groups});
				},
	spiral:function(pieces,rows,columns,type){
		var temp=[];
		var i=0;
		var j=0;
		var order=[0,1,2,3];
		var min_i=0;
		var min_j=0;
		var max_i=rows-1;
		var max_j=columns-1;
		var dir=1;
		var mode=0;
		var inc=true;
		
		switch(type%4)
		{
			case 1: i=min_i;
					j=max_j;
					order=[2,1,0,3];
					dir=-1;
					break;
			case 2: i=max_i;
					j=min_j;
					order=[0,3,2,1];
					dir=-1;
					break;
			case 3: i=max_i;
					j=max_j;
					order=[2,3,0,1];
					dir=1;
					break;
			default: i=min_i;
					j=min_j;
					order=[0,1,2,3]; // 0=>,  1=\/, 2=<, 3=/\
					dir=1;
					break;
		}
		while ((max_i>=min_i) && (max_j>=min_j))
		{
			if (inc)
			{
				temp.push(pieces[j*rows+i]);
			}
			inc=true;
			switch (order[mode]) 
			{
			case 0:	// left to right
				if (j>=max_j)
				{
					mode=(mode+1)%4;
					inc=false;
					if (dir==1)
						min_i++;
					else
						max_i--;
				}
				else
					j++;
				break;
			case 1: // top to bottom 
				if (i>=max_i)
				{
					mode=(mode+1)%4;
					inc=false;
					if (dir==1)
						max_j--;
					else
						min_j++;
				}
				else
					i++;
				break;
			case 2:	// right to left 
				if (j<=min_j)
				{
					mode=(mode+1)%4;
					inc=false;
					if (dir==1)
						max_i--;
					else
						min_i++;
				}
				else
					j--;
				break;
			case 3:  // bottom to top
				if (i<=min_i)
				{
					mode=(mode+1)%4;
					inc=false;
					if (dir==1)
						min_j++;
					else
						max_j--;
				}
				else
					i--;
				break;
			}
		}
		if (type>=4) temp.reverse();
		return({pieces:temp,delays:$.noflashCore.linearArray(temp.length),groups:temp.length});
				},
				
	spiralTopLeft:function(pieces,rows,columns){
						return($.noflashCore.spiral(pieces,rows,columns,0));
					},
	spiralTopRight:function(pieces,rows,columns){
						return($.noflashCore.spiral(pieces,rows,columns,1));
					},
	spiralBottomLeft:function(pieces,rows,columns){
						return($.noflashCore.spiral(pieces,rows,columns,2));
					},
	spiralBottomRight:function(pieces,rows,columns){
						return($.noflashCore.spiral(pieces,rows,columns,3));
					},
	spiralTopLeftRev:function(pieces,rows,columns){
						return($.noflashCore.spiral(pieces,rows,columns,4));
					},
	spiralTopRightRev:function(pieces,rows,columns){
						return($.noflashCore.spiral(pieces,rows,columns,5));
					},
	spiralBottomLeftRev:function(pieces,rows,columns){
						return($.noflashCore.spiral(pieces,rows,columns,6));
					},
	spiralBottomRightRev:function(pieces,rows,columns){
						return($.noflashCore.spiral(pieces,rows,columns,7));
					},
	upDown:function(pieces,rows,columns){
					var newpieces=[];
					var odd=false;
					for (var i=0;i<columns;i++)
					{
						for (var j=0;j<rows;j++)
						{
							if (!odd)
							newpieces[i*rows+j]=pieces[i*rows+j];
							else
							newpieces[i*rows+j]=pieces[(i)*rows+rows-1-j];
						}
						odd=!odd;
					}
					return({pieces:newpieces,delays:$.noflashCore.linearArray(pieces.length),groups:pieces.length});
				},
	
	upDownReverse:function(pieces,rows,columns){
					var o=$.noflashCore.upDown(pieces,rows,columns);
					return({pieces:o.pieces.reverse(),delays:o.delays,groups:o.groups});
				},
	
	leftRight:function(pieces,rows,columns){
					var newpieces=[];
					var odd=false;
					for (var i=0;i<rows;i++)
					{
						for (var j=0;j<columns;j++)
						{
							if (!odd)
							newpieces[i*columns+j]=pieces[j*rows+i];
							else
							newpieces[i*columns+j]=pieces[(columns-1-j)*rows+i];
						}
						odd=!odd;
					}
					return({pieces:newpieces,delays:$.noflashCore.linearArray(pieces.length),groups:pieces.length});
				},
	
	leftRightReverse:function(pieces,rows,columns){
					var o=$.noflashCore.leftRight(pieces,rows,columns);
					return({pieces:o.pieces.reverse(),delays:o.delays,groups:o.groups});
				},
	random : function(pieces,rows,columns){ //v1.0
					for(var j, x, i = pieces.length; i; j = parseInt(Math.random() * i), x = pieces[--i], pieces[i] = pieces[j], pieces[j] = x);
					return ({pieces:pieces,delays:$.noflashCore.linearArray(pieces.length),groups:pieces.length});
					},
	
	diagonalTopLeft:function(pieces,rows,columns)
	{ 	
		var delays=[];
		for (var i=0;i<columns;i++)
		{
			for (var j=0;j<rows;j++)
			{
				delays[i*rows+j]=(i+j);
			}
		}
		return ({pieces:pieces, delays:delays, groups:rows+columns-1});
	},
	
	diagonalBottomRight:function(pieces,rows,columns)
	{ 	
		var delays=[];
		for (var i=0;i<columns;i++)
		{
			for (var j=0;j<rows;j++)
			{
				delays[i*rows+j]=(columns-1-i+rows-1-j);
			}
		}
		return ({pieces:pieces, delays:delays, groups:rows+columns-1});
	},
	
	diagonalBottomLeft:function(pieces,rows,columns)
	{ 	
		var delays=[];
		for (var i=0;i<columns;i++)
		{
			for (var j=0;j<rows;j++)
			{
				delays[i*rows+j]=(i+rows-1-j);
			}
		}
		return ({pieces:pieces, delays:delays, groups:rows+columns-1});
	},
	
	diagonalTopRight:function(pieces,rows,columns)
	{ 	
		var delays=[];
		for (var i=0;i<columns;i++)
		{
			for (var j=0;j<rows;j++)
			{
				delays[i*rows+j]=(columns-1-i+j);
			}
		}
		return ({pieces:pieces, delays:delays, groups:rows+columns-1});
	},
	
	checkerBoard:function(pieces,rows,columns)
	{ 	
		var delays=[];
		var odd1=false,odd2;
		for (var i=0;i<columns;i++)
		{
			odd2=odd1;
			for (var j=0;j<rows;j++)
			{
				delays[i*rows+j]=(odd2)?1:0;
				odd2=!odd2;
			}
			odd1=!odd1;
		}
		return ({pieces:pieces, delays:delays, groups:2});
	}
}
$.noflashCore.ordering={
		"checkerboard":$.noflashCore.checkerBoard,
		"diagonal-top-left":$.noflashCore.diagonalTopLeft,
		"diagonal-top-right":$.noflashCore.diagonalTopRight,
		"diagonal-bottom-left":$.noflashCore.diagonalBottomLeft,
		"diagonal-bottom-right":$.noflashCore.diagonalBottomRight,
		"rows":$.noflashCore.rows,
		"rows-reverse":$.noflashCore.rowsReverse,
		"rows-first":$.noflashCore.rowsFirst,
		"rows-first-reverse":$.noflashCore.rowsFirstReverse,
		"columns":$.noflashCore.columns,
		"columns-reverse":$.noflashCore.columnsReverse,
		"columns-first":$.noflashCore.columnsFirst,
		"columns-first-reverse":$.noflashCore.columnsFirstReverse,
		"spiral-top-left":$.noflashCore.spiralTopLeft,
		"spiral-top-right":$.noflashCore.spiralTopRight,
		"spiral-bottom-left":$.noflashCore.spiralBottomLeft,
		"spiral-bottom-right":$.noflashCore.spiralBottomRight,
		"spiral-top-left-reverse":$.noflashCore.spiralTopLeftRev,
		"spiral-top-right-reverse":$.noflashCore.spiralTopRightRev,
		"spiral-bottom-left-reverse":$.noflashCore.spiralBottomLeftRev,
		"spiral-bottom-right-reverse":$.noflashCore.spiralBottomRightRev,
		"random":$.noflashCore.random,
		"up-down":$.noflashCore.upDown,
		"up-down-reverse":$.noflashCore.upDownReverse,
		"left-right":$.noflashCore.leftRight,
		"left-right-reverse":$.noflashCore.leftRightReverse
	};

}

// actual plugin code
$.fn.noflash=function(options){

	var defaults={
		rows:1,
		columns:1,
		delay:5,
		duration:2,
		caption:true,
		controls:true,
		transition:"random",
		easing:"linear",
		ordering:"random",
		randomOrder:false,
		width:500,
		height:500,
		overlap:0.9,
		imgs:null,
		preload:true,
		preloaderClass:"noflash-preloader",
		captionClass:"noflash-caption",
		controlsClass:"noflash-controls",
		backColor:"#000"
	};
	
	options = $.extend(defaults, options);

	
	var toRad = Math.PI / 180;
	
	// determine css transform support if any
	var cssTransform=["transformProperty", "WebkitTransform", "OTransform", "msTransform", "MozTransform"];
	var cssTransformOrigin=["transformOriginProperty", "WebkitTransformOrigin", "OTransformOrigin", "msTransformOrigin", "MozTransformOrigin"];
	var cssTransformProp=null;
	var cssOriginProp=null;
	var obj=this.eq(0)[0];
	for (var i=0;i<cssTransform.length;i++)
	{
		if (obj.style[cssTransform[i]]!=null)
		{
			cssTransformProp=cssTransform[i];
		}
		if (obj.style[cssTransformOrigin[i]]!=null)
		{
			cssOriginProp=cssTransformOrigin[i];
		}
		if (cssTransformProp!=null && cssOriginProp!=null)
		{
			break;
		}
	}
	
	
	// take first matched element only to avoid more coding for multiple elements
	// global vars
	var $this=this.eq(0);
	var holder;
	var caption;
	var controls;
	var thisimg;
	var nextimg;
	var imgs=[];
	var fx=[];
	var captions=[];
	var current,prevcurrent=-1;
	var timer;
	var dotimer=true;
	var paused=false;
	var p=null,p2=null;
	var ind=[];
	var howmany=0;
	var failed=[];
	var loadimgs=[];
	var mutex=false;
	
	var prediv=$("<div><div class='"+options.preloaderClass+"'></div></div>");
	
	var preload=function(callback){
		howmany=0;
		loadimgs=[];
		failed=[];
		holder.append(prediv);
		var load=function(e){
				howmany++;
				if (e.type=="error")
				{
					failed.push($(this).attr("src"));
				}
				if (imgs.length==howmany)
				{
					callback();
				}
			};
		for (var i=0;i<imgs.length;i++)
		{
			loadimgs[i]=$(new Image(options.width,options.height));
			loadimgs[i].load(load);
			loadimgs[i].error(load);
			loadimgs[i].attr("src",imgs[i].attr("src"));
		}
		//callback();
	};
	
	var afterpreload=function(){
		if (options.preload)
		{
			if (prediv!=null)
			{
			prediv.remove();
			prediv=null;
			}
			// delete failed elements
			for (var i=0;i<failed.length;i++)
			{
				var j=0
				while(j<imgs.length)
				{
					if (imgs[j].attr("src")==failed[i])
					{
						imgs.splice(j,1);
						fx.splice(j,1);
						captions.splice(j,1);
					}
					j++;
				}
			}
		}
		
		for (var i=0;i<imgs.length;i++)
		{
			ind[i]=i;
			if (options.controls)
			{
			var anc=$("<a class='bullet' href='javascript:void(0)' rel='"+i+"'></a>");
			controls.find(".bullets").append(anc);
			}
		}
		if (options.controls)
		{
			controls.find(".controls").append("<a class='prev' href='javascript:void(0)'></a><a class='play-pause' href='javascript:void(0)'></a><a class='next' href='javascript:void(0)'></a>");
			controls.find(".bullet").click(function(){
						if (!paused)
						{
						var c=parseInt($(this).attr("rel"));
						if (!mutex)
						doTransition(c+"");
						}
			});
			controls.find(".prev").click(function(){
						if (!paused)
						{
							prevTransition();
						}
			});
			controls.find(".next").click(function(){
						if (!paused)
						{
							nextTransition();
						}
			});
			controls.find(".play-pause").click(function(){
							paused=!paused;
							if (paused)
							{
								stopPlay();
								$(this).addClass('paused');
							}
							else
							{
								resumePlay();
								$(this).removeClass('paused');
							}
			});
		}
		
		// randomize order
		if (options.randomOrder)
			ind=$.noflashCore.random(ind,0,0).pieces;
		prevcurrent=0;
		current=0;
		thisimg.append(imgs[ind[current]]);
		if (options.controls)
		{
			toggleActive();
		}
		
		if (options.caption && captions[ind[current]]!=null && captions[ind[current]]!="")
		{
			caption.html(captions[ind[current]]).show();//fadeIn(parseFloat(fx[ind[current]].delay)*200,"linear");
		}
		prepareTransition();
		
	};
	
	var toggleActive=function(){
			/*if (prevcurrent>-1)
			controls.find('[rel="'+prevcurrent+'"]').removeClass("active");*/
			controls.find(".bullet").removeClass("active");
			controls.find('[rel="'+current+'"]').addClass("active");
	};
	
	var init=function(){
				holder=$("<div></div>");
				holder.css({margin:"0px",padding:"0px",overflow:"hidden",position:"absolute",top:"0px",left:"0px",width:options.width+"px",height:options.height+"px","background-color":options.backColor});
				// parse dom data
				$this.children("div").each(function(){
									imgs.push($(this).children("img").filter(":first").css({position:"absolute"}));
									captions.push($(this).children("span").filter(":first").html());
									var thisfx={};
									//var data=$(this)[0].className.split(" ");
									thisfx.transition=options.transition;
									thisfx.delay=options.delay;
									thisfx.easing=options.easing;
									thisfx.ordering=options.ordering;
									thisfx.rows=options.rows;
									thisfx.columns=options.columns;
									thisfx.overlap=options.overlap;
									thisfx.duration=options.duration;
									if ($(this).attr("class")!="" && $(this).attr("class")!=null)
									{
									var data=$(this).attr("class").split(" ");
									for (var i=0;i<data.length;i++)
									{
										var foo=data[i].split("=");
										thisfx[foo[0]]=foo[1];
									}
									thisfx.delay=parseFloat(thisfx.delay);
									thisfx.rows=parseInt(thisfx.rows);
									thisfx.columns=parseInt(thisfx.columns);
									thisfx.overlap=parseFloat(thisfx.overlap);
									thisfx.duration=parseFloat(thisfx.duration);
									/*thisfx.transition=data[0];
									thisfx.easing=data[3];
									thisfx.ordering=data[6];
									thisfx.delay=parseFloat(data[7]);
									thisfx.rows=parseInt(data[1]);
									thisfx.columns=parseInt(data[2]);
									thisfx.overlap=parseFloat(data[5]);
									thisfx.duration=parseFloat(data[4]);*/
									}
									/*else
									{
									thisfx.transition=options.transition;
									thisfx.easing=options.easing;
									thisfx.ordering=options.ordering;
									thisfx.delay=options.delay;
									thisfx.rows=options.rows;
									thisfx.columns=options.columns;
									thisfx.overlap=options.overlap;
									thisfx.duration=options.duration;
									}*/
									fx.push(thisfx);
									$(this).remove();
									});
				
				// add options data
				if (options.imgs!=null)
				{
					for (var i=0;i<options.imgs.length;i++)
					{
						if (options.imgs[i].alt!=null)
						imgs.push($("<img src='"+options.imgs[i].src+"' alt='"+options.imgs[i].alt+"' title='"+options.imgs[i].alt+"'/>"));
						else
						imgs.push($("<img src='"+options.imgs[i].src+"'/>"));
						var thisfx={};
						
						if (options.imgs[i].transition!=null)
						thisfx.transition=options.imgs[i].transition;
						else
						thisfx.transition=options.transition;
						
						if (options.imgs[i].easing!=null)
						thisfx.easing=options.imgs[i].easing;
						else
						thisfx.easing=options.easing;
						
						if (options.imgs[i].ordering!=null)
						thisfx.ordering=options.imgs[i].ordering;
						else
						thisfx.ordering=options.ordering;
						
						if (options.imgs[i].delay!=null)
						thisfx.delay=options.imgs[i].delay;
						else
						thisfx.delay=options.delay;
						
						if (options.imgs[i].rows!=null)
						thisfx.rows=options.imgs[i].rows;
						else
						thisfx.rows=options.rows;
						
						if (options.imgs[i].columns!=null)
						thisfx.columns=options.imgs[i].columns;
						else
						thisfx.columns=options.columns;
						
						if (options.imgs[i].overlap!=null)
						thisfx.overlap=options.imgs[i].overlap;
						else
						thisfx.overlap=options.overlap;
						
						if (options.imgs[i].duration!=null)
						thisfx.duration=options.imgs[i].duration;
						else
						thisfx.duration=options.duration;
						
						fx.push(thisfx);
						
						if (options.imgs[i].caption!=null)
						captions.push(options.imgs[i].caption);
						else
						captions.push("");
					}
				}
				
				$this.append(holder);
				
				thisimg=$("<div id='thisimg'></div>");
				thisimg.css({margin:0,padding:0,position:"absolute",top:"0px",left:"0px","z-index":2});
				nextimg=$("<div id='nextimg'></div>");
				nextimg.css({margin:0,padding:0,position:"absolute",top:"0px",left:"0px","z-index":1});
				holder.append(thisimg);
				holder.append(nextimg);
				caption=$("<div class='"+options.captionClass+"'></div>");
				caption.css({"z-index":4});
				caption.hide();
				if (options.caption)
					holder.append(caption);
				controls=$("<div class='"+options.controlsClass+"'></div>");
				controls.css({"z-index":10});
				controls.append("<div class='bullets'></div><div class='controls'></div>");
				if (options.controls)
					holder.append(controls);
				
				if (options.preload)
					preload(afterpreload);
				else
					afterpreload();
	};
	var numpiec=0,stopped=false,animation_in_progress=false;
	var doTransition=function(dir){
			clearTimeout(timer);
			// stop previous animations
			if (p!=null /*&& animation_in_progress*/)
			{
			for (var i=0;i<p.length;i++)
				p[i].piece.stop(true,false);
			}
			prevcurrent=current;
			if (imgs.length>0)
			{
				if (dir=="+1")
				{
					current=(current+1)%imgs.length;
				}
				else if (dir=="-1")
				{
					current=(current+imgs.length-1)%imgs.length;
				}
				else
					current=parseInt(dir);
			}
			if (options.caption) caption.stop(true,true).hide();
			if (options.controls)
			{
				toggleActive();
			}
			
			var fxi=fx[ind[current]];
			if (fxi.transition=="random")
			{
				fxi=$.noflashCore.getRandomTransition();
			}
			var ord=fxi.ordering;
			var r=($.noflashCore.transitions[fxi.transition].rows!=null)?$.noflashCore.transitions[fxi.transition].rows:fxi.rows;
			var c=($.noflashCore.transitions[fxi.transition].columns!=null)?$.noflashCore.transitions[fxi.transition].columns:fxi.columns;
			
			if (p2!=null)
				p2=$.noflashCore.destroypieces(p2);
			if (p!=null)
				p=$.noflashCore.destroypieces(p);
			
			if ($.noflashCore.transitions[fxi.transition].reverse==true)
			{
				p=$.noflashCore.cutimage(imgs[ind[prevcurrent]],r,c,options.width,options.height);
				thisimg.append(imgs[ind[current]]);
			}
			else
				p=$.noflashCore.cutimage(imgs[ind[current]],r,c,options.width,options.height);
			
			howMany=0;
			numpiec=p.length;
			if (fxi.transition=="flip-tiles-horizontal" || fxi.transition=="flip-tiles-vertical")
			{
				p2=$.noflashCore.cutimage(imgs[ind[prevcurrent]],r,c,options.width,options.height);
				for (var i=0;i<p.length;i++)
				{
				var dd=$("<div></div>");
				//dd.css({position:"absolute",margin:0,padding:0,top:parseFloat(p[i].piece.css("top"))+p[i].piece.height()/2+"px",left:parseFloat(p[i].piece.css("left"))+p[i].piece.width()/2+"px"});
				dd.css({position:"absolute",margin:0,padding:0,top:p[i].y+"px",left:p[i].x+"px",width:p[i].w+"px",height:p[i].h+"px"});
				// to animate custom properties like rotation, scaling etc
				dd[0]._custom_step=0;
				dd[0]._customAnimate=true;
				dd[0]._p1=p[i].piece[0];
				dd[0]._p2=p2[i].piece[0];
				dd[0]._x=p[i].x;
				dd[0]._y=p[i].y;
				dd[0]._w=p[i].w;
				dd[0]._h=p[i].h;
				//dd.append(p2[i].piece);
				//dd.append(p[i].piece);
				p2[i].piece.appendTo(dd);
				p[i].piece.appendTo(dd);
				//p[i].piece.css({position:"absolute",top:-p[i].piece.height()/2+"px",left:-p[i].piece.width()/2+"px",visibility:"hidden"});
				//p2[i].piece.css({position:"absolute",top:-p2[i].piece.height()/2+"px",left:-p2[i].piece.width()/2+"px",visibility:"visible"});
				p[i].piece.css({position:"absolute",top:"0px",left:"0px",visibility:"hidden"});
				p2[i].piece.css({position:"absolute",top:"0px",left:"0px",visibility:"visible"});
				p[i].piece=dd;
				}
				thisimg.empty();
			}
			if (fxi.transition=="rotate-tiles" || fxi.transition=="rotate-tiles-reverse")
			{
				for (var i=0;i<p.length;i++)
				{
				// to animate custom properties like rotation, scaling etc
				if (fxi.transition=="rotate-tiles")
					p[i].piece[0]._custom_step=0;
				if (fxi.transition=="rotate-tiles-reverse")
					p[i].piece[0]._custom_step=1;
				p[i].piece[0]._customAnimate=true;
				p[i].piece[0]._x=p[i].x;
				p[i].piece[0]._y=p[i].y;
				p[i].piece[0]._w=p[i].w;
				p[i].piece[0]._h=p[i].h;
				}
			}
			if ($.noflashCore.transitions[fxi.transition].current!=null || $.noflashCore.transitions[fxi.transition].next!=null)
			{
				p2=$.noflashCore.cutimage(imgs[ind[prevcurrent]],r,c,options.width,options.height);
				for (var i=0;i<p.length;i++)
				{
				var temp = $.extend(true,{}, $.noflashCore.transitions[fxi.transition]);
				$.noflashCore.translate(temp.current,p2[i],options.width/2+"px",options.height/2+"px");
				$.noflashCore.translate(temp.next,p[i],options.width/2+"px",options.height/2+"px");
				p2[i].piece.css(temp.current);
				p[i].piece.css(temp.next);
				var dd=$("<div></div>");
				//dd.append(p2[i].piece);
				//dd.append(p[i].piece);
				p2[i].piece.appendTo(dd);
				p[i].piece.appendTo(dd);
				p[i].piece=dd;
				dd.css({position:"absolute",margin:0,padding:0});
				}
				thisimg.empty();
			}
			var ordobj=$.noflashCore.ordering[ord](p,r,c);
			p=ordobj.pieces;
			nextimg.empty();
			thisimg.css({"z-index":0});
			fxi.overlap=Math.min(1,Math.max(0,fxi.overlap));
			//fxi.overlap=Math.min(1,fxi.overlap);
			var ngroups=ordobj.groups;
			var d=1000*fxi.duration/(ngroups-(ngroups-1)*fxi.overlap);
			var o=d*fxi.overlap;
			var sd=d-o;
			var odd=false;
			animation_in_progress=true;
			for (var i=0;i<numpiec;i++)
			{
				var temp = $.extend(true,{}, $.noflashCore.transitions[fxi.transition]);
				if (temp.start1 && temp.start2)
				{
					if (odd)
						temp.start=temp.start1;
					else
						temp.start=temp.start2;
				}
				$.noflashCore.translate(temp.start,p[i],options.width/2+"px",options.height/2+"px");
				$.noflashCore.translate(temp.animate,p[i],options.width/2+"px",options.height/2+"px");
				
				var animateoptions={duration:d, easing:fxi.easing};
				if (i==p.length-1)
					animateoptions.complete=function(){endTransition();};
				
				if (fxi.transition=="flip-tiles-horizontal")
				{
					animateoptions.step=function(now,fx){
						var sc=2*(1-now)-1;
						if (sc<0)
						{
							//$(this).children(":eq(0)").css("visibility","hidden");
							//$(this).children(":eq(1)").css("visibility","visible");
							this._p1.style.visibility="visible";
							this._p2.style.visibility="hidden";
							sc=-sc;
						}
						else
						{
							//$(this).children(":eq(1)").css("visibility","hidden");
							//$(this).children(":eq(0)").css("visibility","visible");
							this._p2.style.visibility="visible";
							this._p1.style.visibility="hidden";
						}
						if (sc>1)
							sc-=2*(sc-1);
						
						var sk=-(1-sc)*2;
						
						var m=new $.noflashCore.Matrix2D();
						m.leftMult(new $.noflashCore.Matrix2D({M11:1,M12:Math.tan(sk*toRad),M21:0,M22:1}));
						m.leftMult(new $.noflashCore.Matrix2D({M11:sc,M12:0,M21:0,M22:1}));
						
						if (cssTransformProp!=null)
						{
							this.style[cssTransformProp]="matrix("+m.val.M11+","+m.val.M21+","+m.val.M12+","+m.val.M22+",0,0)";
							this.style[cssOriginProp]="50% 50%";
						}
						else if (this.style.filter!=null)
						{
							this.style.filter='progid:DXImageTransform.Microsoft.Matrix(sizingMethod="auto expand", M11 = ' + m.val.M11 + ', M12 = ' + m.val.M12 + ', M21 = ' + m.val.M21 + ', M22 = ' + m.val.M22 + ')';
							this.style.left=this._x+0.5*(1-sc)*this._w+"px";
						}
					};
				}
				if (fxi.transition=="flip-tiles-vertical")
				{
					animateoptions.step=function(now,fx){
						var sc=2*(1-now)-1;
						if (sc<0)
						{
							//$(this).children(":eq(0)").css("visibility","hidden");
							//$(this).children(":eq(1)").css("visibility","visible");
							this._p1.style.visibility="visible";
							this._p2.style.visibility="hidden";
							sc=-sc;
						}
						else
						{
							//$(this).children(":eq(1)").css("visibility","hidden");
							//$(this).children(":eq(0)").css("visibility","visible");
							this._p2.style.visibility="visible";
							this._p1.style.visibility="hidden";
						}
						if (sc>1)
							sc-=2*(sc-1);
						
						var sk=-(1-sc)*2;
						
						var m=new $.noflashCore.Matrix2D();
						m.leftMult(new $.noflashCore.Matrix2D({M11:1,M12:0,M21:Math.tan(sk*toRad),M22:1}));
						m.leftMult(new $.noflashCore.Matrix2D({M11:1,M12:0,M21:0,M22:sc}));
						
						if (cssTransformProp!=null)
						{
							this.style[cssTransformProp]="matrix("+m.val.M11+","+m.val.M21+","+m.val.M12+","+m.val.M22+",0,0)";
							this.style[cssOriginProp]="50% 50%";
						}
						else if (this.style.filter!=null)
						{
							this.style.filter='progid:DXImageTransform.Microsoft.Matrix(sizingMethod="auto expand", M11 = ' + m.val.M11 + ', M12 = ' + m.val.M12 + ', M21 = ' + m.val.M21 + ', M22 = ' + m.val.M22 + ')';
							this.style.top=this._y+0.5*(1-sc)*this._h+"px";
						}
					};
				}
				if (fxi.transition=="rotate-tiles" || fxi.transition=="rotate-tiles-reverse")
				{
					animateoptions.step=function(now,fx){
						var sc=now;
						var rot=((now*720)%360)*toRad;
						if (sc>1)
							sc-=2*(sc-1);
						
						if (sc<0)
							sc+=-2*sc;
						
						var m=new $.noflashCore.Matrix2D();
						var c=Math.cos(rot);
						var s=Math.sin(rot);
						m.leftMult(new $.noflashCore.Matrix2D({M11:c,M12:-s,M21:s,M22:c}));
						m.leftMult(new $.noflashCore.Matrix2D({M11:sc,M12:0,M21:0,M22:sc}));
						
						if (cssTransformProp!=null)
						{
							this.style[cssTransformProp]="matrix("+m.val.M11+","+m.val.M21+","+m.val.M12+","+m.val.M22+",0,0)";
							this.style[cssOriginProp]="50% 50%";
						}
						else if (this.style.filter!=null)
						{
							this.style.filter='progid:DXImageTransform.Microsoft.Matrix(sizingMethod="auto expand", M11 = ' + m.val.M11 + ', M12 = ' + m.val.M12 + ', M21 = ' + m.val.M21 + ', M22 = ' + m.val.M22 + ')';
						
						var h=this.clientHeight;
						var w=this.clientWidth;
						this.style.left=this._x/*+0.5*(1-sc)*this._w*/+0.5*(w-this.offsetWidth)+"px";
						this.style.top=this._y/*+0.5*(1-sc)*this._h*/+0.5*(h-this.offsetHeight)+"px";
						}
					};
				}
				p[i].piece.css(temp.start).appendTo(nextimg).delay(ordobj.delays[i]*sd).animate(temp.animate,animateoptions);
				// replacing delay with dummy animation which is cancelable
				//p[i].piece.appendTo(nextimg).css(temp.start).animate({"foodummy":1},ordobj.delays[i]*sd).animate(temp.animate,animateoptions);
				
				odd=!odd;
			}
	};
	
	
	var stopPlay=function(){
				dotimer=false;
				clearTimeout(timer);
			};
			
	var resumePlay=function(){
				dotimer=true;
				//prepareTransition();
				doTransition("+1");
			};
			
	var nextTransition=function(){
				if (imgs.length>0)
				{
				//prevcurrent=current;
				//current=(current+1)%imgs.length;
				//if (!mutex)
				doTransition("+1");
				}
			};
			
	var prevTransition=function(){
				if (imgs.length>0)
				{
				//prevcurrent=current;
				//current=(current+imgs.length-1)%imgs.length;
				//if (!mutex)
				doTransition("-1");
				}
			};
			
	var prepareTransition=function(){
			if (imgs.length>0)
			{
			if (dotimer)
				timer=setTimeout(function(){/*if (!mutex)*/ doTransition("+1");},fx[ind[current]].delay*1000);
			//prevcurrent=current;
			//current=(current+1)%imgs.length;
			}
			};
	
	var endTransition=function(){
			//howMany++;
			//if (howMany==numpiec)
			{
				thisimg.empty();
				thisimg.append(imgs[ind[current]]);
				thisimg.css({"z-index":2});
				nextimg.empty();
				if (options.caption && captions[ind[current]]!=null && captions[ind[current]]!="")
				{
					caption.html(captions[ind[current]]).stop(true,true).show();//fadeIn(parseFloat(fx[ind[current]].delay)*200,"linear");
				}
				animation_in_progress=false;
				prepareTransition();
			}
	};
	
	// go
	init();
	// it is chainable
	return(this);
};
})(jQuery);
