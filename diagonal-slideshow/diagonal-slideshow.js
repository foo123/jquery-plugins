(function($){
	var images,$ul,coords,wl,hl,duration,overlap,easing,delay,index,timer=null;
	
	var cutimage=function(img,hl,wl,coords)
	{
		var el=[];
		for (var i=0;i<wl;i++)
		{
			for (var j=0;j<hl;j++)
			{
				if (coords[j+hl*i].vis)
				{
					var $div=$("<div class='diag-inside' data-coords='"+i+" "+j+"'></div>");
					$div.css({position:"absolute","z-index":100,left:coords[j+hl*i].left+"px",top:coords[j+hl*i].top+"px",width:coords[j+hl*i].side+"px", height:coords[j+hl*i].side+"px","background-position":coords[j+hl*i].posx+"px "+coords[j+hl*i].posy+"px","background-image":"url("+img+")","background-repeat":"no-repeat"});
					el.push({piece:$div,li:coords[j+hl*i].li});
				}
			}
		}
		return(el);
	};
	
	//+ Jonas Raoni Soares Silva
	//@ http://jsfromhell.com/array/shuffle [v1.0]
	var shuffle = function(o){ //v1.0
		for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
		return o;
	};	
	
	var endTransition=function(){
		if (timer!=null)
			clearTimeout(timer);
		$ul.children("li").children(".diag-remove").remove();
		index=(index+1)%images.length;
		var nextimg=new Image();
		nextimg.onload=function(){
			setTimeout(function(){doTransition(index);},1000*delay);
		};
		nextimg.onerror=nextimg.onload;
		nextimg.src=images[index];
	};
	
	var doTransition=function(ind)
	{
		var p=cutimage(images[ind],wl,hl,coords);
		
		for (var i=0;i<p.length;i++)
		{
			//var $li=$ul.children("li[data-coords='"+p[i].coords.i+" "+p[i].coords.j+"']");
			p[i].li.children("div").css({'z-index':0}).addClass("diag-remove");
			p[i].piece.css({opacity:0}).appendTo(p[i].li);
		}
		var p=shuffle(p);
		var ngroups=p.length;
		var d=1000*duration/(ngroups-(ngroups-1)*overlap);
		var o=d*overlap;
		var sd=d-o;
		for (var i=0;i<p.length;i++)
		{
			var animateoptions={duration:d, easing:easing};
			var animateoptions2={duration:d, easing:easing};
			if (i==p.length-1)
				animateoptions2.complete=function(){endTransition();};
			//p[i].li.children(".diag-remove").delay(i*sd).animate({opacity:0},animateoptions);
			p[i].piece.delay(i*sd).animate({opacity:1},animateoptions2);
		}
	};
	
	
$.fn.diagonalSlideshow=function(options){
	
	var defaults={
		width:500,
		height:500,
		side:100,
		easing:'linear',
		duration:3,
		delay:5,
		overlap:0.9,
		strict:true,
		images:[]
	};
	options = $.extend(defaults, options);

	
	var w=options.width;
	var h=options.height;
	var side=options.side;
	duration=options.duration;
	overlap=options.overlap;
	easing=options.easing;
	delay=options.delay;
	images=options.images;
	var i,j;
	$this=$(this);
	$this.empty();
	var $cont=$("<div class='diag-container'></div>");
	$cont.appendTo($this);//$this.append($cont);
	$ul=$("<ul class='diag-list'></ul>");
	$ul.appendTo($cont); //$cont.append($ul);
	coords=[];
	wl=Math.round(w/side);
	hl=Math.round(h/side);
	// re-adjust side if not exact multiple
	side=Math.min(Math.round(w/wl),Math.round(h/hl));
	//var mrg=Math.floor(Math.sin(Math.PI/4)*Math.sqrt(2*(side*side)));
	// angle is 45 degrees
	var mrg=Math.floor(0.5*Math.sqrt(2*(side*side)));
	var mrg2=0.5*mrg;
	var mrgx2=2*mrg;
	wl=Math.round((w/mrg));
	hl=Math.round((0.5*h/mrg))+1;
	$cont.css({position:"relative",/*"margin-left":mrg2+"px",*/"margin-top":/*mrg+*/mrg2+"px",width:(w)+"px",height:(h)+"px"});
	var offset=0;
	//console.log(mrg,wl,hl);
	for (i=0;i<wl;i++)
	{
		for (j=0;j<hl;j++)
		{
			
			var $li=$("<li data-coords='"+i+" "+j+"'></li>");
			$li.css({position:"absolute",width:(side)+"px", height:(side)+"px",left:(i*(mrg))+"px",top:(j*(mrgx2)+offset)+"px"});
			var imgx=(-i*(mrg));
			var imgy=(-j*(mrgx2)-offset);
			coords[j+hl*i]={li:$li,i:i,j:j,posx:imgx,posy:imgy,top:-mrg2,left:-mrg2,side:side+mrg,vis:false};
			// skip showing empty cells (no image)
			if (options.strict)
			{
				if (-imgx<(w-mrgx2) && -imgy<(h-mrgx2) && imgx<=0 && imgy<=0)
				{
					$li.appendTo($ul); //$cont.append(el);
					coords[j+hl*i].vis=true;
				}
			}
			else
			{
				if (-imgx<(w) && -imgy<(h))
				{
					$li.appendTo($ul); //$cont.append(el);
					coords[j+hl*i].vis=true;
				}
			}
		}
		if (offset==0)
		{
			offset=-mrg;
		}
		else
		{
			offset=0;
		}
	}
	
	// init
	if (images.length>0)
	{
		index=0;
		var nextimg=new Image();
		nextimg.onload=function(){
			doTransition(index);
		};
		nextimg.onerror=nextimg.onload;
		nextimg.src=images[index];
	}
};

})(jQuery);


/*
$(function(){
	
	var $desc = $('.desc');
	var $main = $('#main');
		   
	$('li').click(function() {
		
		var $self = $(this),
	    	_feature_id = $self.attr('data-id'),
			_content = $self.find('.content').html();
			
		
		// add/remove featured work class		
		$main.removeClass().addClass('feature ' + _feature_id);
		
		
		// find content depending on what project is loaded
		$desc.html(_content);		
		
		
		_intro();		
	});
	
	
	function _intro() {
		
		//animate the full-screen project image
		$('li[data-id] .wrap').each(
			
			function(index) {
			
				$(this)
					.stop()
					.css({ opacity: 0 })
					.animate({ padding: 0 }, 50*index)
					.animate({ opacity: 1 }, 500,'easeOutCubic' );
				}
			
		);
		
		//animate the project content
		$desc
			.stop()
			.css({ opacity: 0})
			.animate({ opacity: 1}, 500, 'easeInOutQuart');
			
		}
	
		
		
	
	
		   
});



jQuery.easing["jswing"]=jQuery.easing["swing"];jQuery.extend(jQuery.easing,{def:"easeOutQuad",swing:function(x,t,b,c,d){return jQuery.easing[jQuery.easing.def](x,t,b,c,d);},easeInQuad:function(x,t,b,c,d){return c*(t/=d)*t+b;},easeOutQuad:function(x,t,b,c,d){return -c*(t/=d)*(t-2)+b;},easeInOutQuad:function(x,t,b,c,d){if((t/=d/2)<1){return c/2*t*t+b;}return -c/2*((--t)*(t-2)-1)+b;},easeInCubic:function(x,t,b,c,d){return c*(t/=d)*t*t+b;},easeOutCubic:function(x,t,b,c,d){return c*((t=t/d-1)*t*t+1)+b;},easeInOutCubic:function(x,t,b,c,d){if((t/=d/2)<1){return c/2*t*t*t+b;}return c/2*((t-=2)*t*t+2)+b;},easeInQuart:function(x,t,b,c,d){return c*(t/=d)*t*t*t+b;},easeOutQuart:function(x,t,b,c,d){return -c*((t=t/d-1)*t*t*t-1)+b;},easeInOutQuart:function(x,t,b,c,d){if((t/=d/2)<1){return c/2*t*t*t*t+b;}return -c/2*((t-=2)*t*t*t-2)+b;},easeInQuint:function(x,t,b,c,d){return c*(t/=d)*t*t*t*t+b;},easeOutQuint:function(x,t,b,c,d){return c*((t=t/d-1)*t*t*t*t+1)+b;},easeInOutQuint:function(x,t,b,c,d){if((t/=d/2)<1){return c/2*t*t*t*t*t+b;}return c/2*((t-=2)*t*t*t*t+2)+b;},easeInSine:function(x,t,b,c,d){return -c*Math.cos(t/d*(Math.PI/2))+c+b;},easeOutSine:function(x,t,b,c,d){return c*Math.sin(t/d*(Math.PI/2))+b;},easeInOutSine:function(x,t,b,c,d){return -c/2*(Math.cos(Math.PI*t/d)-1)+b;},easeInExpo:function(x,t,b,c,d){return (t==0)?b:c*Math.pow(2,10*(t/d-1))+b;},easeOutExpo:function(x,t,b,c,d){return (t==d)?b+c:c*(-Math.pow(2,-10*t/d)+1)+b;},easeInOutExpo:function(x,t,b,c,d){if(t==0){return b;}if(t==d){return b+c;}if((t/=d/2)<1){return c/2*Math.pow(2,10*(t-1))+b;}return c/2*(-Math.pow(2,-10*--t)+2)+b;},easeInCirc:function(x,t,b,c,d){return -c*(Math.sqrt(1-(t/=d)*t)-1)+b;},easeOutCirc:function(x,t,b,c,d){return c*Math.sqrt(1-(t=t/d-1)*t)+b;},easeInOutCirc:function(x,t,b,c,d){if((t/=d/2)<1){return -c/2*(Math.sqrt(1-t*t)-1)+b;}return c/2*(Math.sqrt(1-(t-=2)*t)+1)+b;},easeInElastic:function(x,t,b,c,d){var s=1.70158;var p=0;var a=c;if(t==0){return b;}if((t/=d)==1){return b+c;}if(!p){p=d*0.3;}if(a<Math.abs(c)){a=c;var s=p/4;}else{var s=p/(2*Math.PI)*Math.asin(c/a);}return -(a*Math.pow(2,10*(t-=1))*Math.sin((t*d-s)*(2*Math.PI)/p))+b;},easeOutElastic:function(x,t,b,c,d){var s=1.70158;var p=0;var a=c;if(t==0){return b;}if((t/=d)==1){return b+c;}if(!p){p=d*0.3;}if(a<Math.abs(c)){a=c;var s=p/4;}else{var s=p/(2*Math.PI)*Math.asin(c/a);}return a*Math.pow(2,-10*t)*Math.sin((t*d-s)*(2*Math.PI)/p)+c+b;},easeInOutElastic:function(x,t,b,c,d){var s=1.70158;var p=0;var a=c;if(t==0){return b;}if((t/=d/2)==2){return b+c;}if(!p){p=d*(0.3*1.5);}if(a<Math.abs(c)){a=c;var s=p/4;}else{var s=p/(2*Math.PI)*Math.asin(c/a);}if(t<1){return -0.5*(a*Math.pow(2,10*(t-=1))*Math.sin((t*d-s)*(2*Math.PI)/p))+b;}return a*Math.pow(2,-10*(t-=1))*Math.sin((t*d-s)*(2*Math.PI)/p)*0.5+c+b;},easeInBack:function(x,t,b,c,d,s){if(s==undefined){s=1.70158;}return c*(t/=d)*t*((s+1)*t-s)+b;},easeOutBack:function(x,t,b,c,d,s){if(s==undefined){s=1.70158;}return c*((t=t/d-1)*t*((s+1)*t+s)+1)+b;},easeInOutBack:function(x,t,b,c,d,s){if(s==undefined){s=1.70158;}if((t/=d/2)<1){return c/2*(t*t*(((s*=(1.525))+1)*t-s))+b;}return c/2*((t-=2)*t*(((s*=(1.525))+1)*t+s)+2)+b;},easeInBounce:function(x,t,b,c,d){return c-jQuery.easing.easeOutBounce(x,d-t,0,c,d)+b;},easeOutBounce:function(x,t,b,c,d){if((t/=d)<(1/2.75)){return c*(7.5625*t*t)+b;}else{if(t<(2/2.75)){return c*(7.5625*(t-=(1.5/2.75))*t+0.75)+b;}else{if(t<(2.5/2.75)){return c*(7.5625*(t-=(2.25/2.75))*t+0.9375)+b;}else{return c*(7.5625*(t-=(2.625/2.75))*t+0.984375)+b;}}}},easeInOutBounce:function(x,t,b,c,d){if(t<d/2){return jQuery.easing.easeInBounce(x,t*2,0,c,d)*0.5+b;}return jQuery.easing.easeOutBounce(x,t*2-d,0,c,d)*0.5+c*0.5+b;}});*/