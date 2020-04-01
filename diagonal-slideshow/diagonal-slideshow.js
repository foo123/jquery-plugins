(function($){
"use strict";

var stdMath = Math, sqrt2 = stdMath.sqrt(2);

function cutimage( img, diags, W, H )
{
    var divs = [], diag, k;
    for(k=0; k<diags.length; k++)
    {
        diag = diags[k];
        divs.push($('<div class="diag-inside"></div>').css({
            left: String(-diag.margin/2)+"px",
            top: String(-diag.margin/2)+"px",
            width: String(diag.side+diag.margin)+"px",
            height: String(diag.side+diag.margin)+"px",
            "background-position": String(diag.imgx)+"px "+String(diag.imgy)+"px",
            "background-size": String(W)+"px auto",
            "background-image": 'url("'+img+'")'
        }).appendTo(diag.div));
    }
    return divs;
}

function shuffle( a )
{
    //v1.0
    for(var j, x, i = a.length; i; j = ~~(stdMath.random() * i), x = a[--i], a[i] = a[j], a[j] = x);
    return a;
}

function debounce( fn, delay )
{
    var timer = null;
    return function( ) {
        var context = this, args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function () {
            fn.apply(context, args);
        }, delay);
    };
}

function DiagonalSlideshow( el, options )
{
    var self = this, holder, diags = null, W, H, wl, hl, index, timer = null, i, j, k, x, y, bx, by, w, side, margin, margin2, offset;

    if ( !(self instanceof DiagonalSlideshow) ) return new DiagonalSlideshow(el, options);

    var endTransition = function( ) {
        clearTimeout(timer);
        holder.find('.diag-remove').remove();
        index = (index+1) % options.images.length;
        var nextimg = new Image();
        nextimg.onload = function(){
            setTimeout(function(){doTransition(index);}, 1000*options.delay);
        };
        nextimg.onerror = nextimg.onload;
        nextimg.src = options.images[index];
    };

    var doTransition = function( ind ) {
        var p = cutimage(options.images[ind], diags, W, H), i, ngroups, d, sd, animateoptions;

        p = shuffle(p);
        ngroups = p.length;
        d = 1000*options.duration/(ngroups-(ngroups-1)*options.overlap);
        sd = d*(1-options.overlap);
        for(i=0; i<ngroups; i++)
        {
            p[i].prev().addClass("diag-remove");
            p[i].css({opacity:0});
        }
        for(i=0; i<ngroups; i++)
        {
            animateoptions = {duration:d, easing:options.easing};
            if ( i === ngroups-1 ) animateoptions.complete = function(){endTransition();};
            p[i].delay(i*sd).animate({opacity:1}, animateoptions);
        }
    };

    var autoResize = function( ) {
        W = stdMath.round(el.width()); H = stdMath.round(W/options.aspectRatio);
        holder.css({width:String(W)+'px', height:String(H)+'px'});
        if ( !diags )
        {
            wl = 2*stdMath.ceil(1/options.size)+2;
            hl = stdMath.ceil(1/(options.size*options.aspectRatio))+1;
            diags = new Array(wl*hl);
        }
        w = stdMath.max(2*W/(wl-2), H/(hl-1)); side = w/sqrt2;
        margin = w/2; margin2 = margin/2; offset = 0;
        for (k=0,i=0;i<wl;i++)
        {
            for (j=0;j<hl;j++,k++)
            {
                x = margin*i-margin; y = w*j-margin+offset;
                bx = -x+margin2; by = -y+margin2;
                diags[k] = {
                    i: i, j: j, x: x, y: y, imgx: bx, imgy: by, side: side, margin: margin, rows: wl, columns: hl,
                    div: (diags[k] ? diags[k].div : $('<div class="diag" data-coords="'+i+' '+j+'"></div>').appendTo(holder)).css({
                        left: String(x)+"px",
                        top: String(y)+"px",
                        width: String(side)+"px",
                        height: String(side)+"px"
                    })
                };
            }
            offset = 0===offset ? -margin : 0;
        }
    };

    options = $.extend({
        aspectRatio: 1.0,
        size: 0.3,
        easing: 'linear',
        duration: 3,
        delay: 5,
        overlap: 0.9,
        images: []
    }, options);

    holder = $('<div class="diag-container"></div>');
    holder.appendTo(el.empty());

    $(window).on('resize', debounce(autoResize, 300));
    autoResize();

    // init
    if ( 0 < options.images.length )
    {
        index = 0;
        var nextimg = new Image( );
        nextimg.onload = function( ) {
            doTransition(index);
        };
        nextimg.onerror = nextimg.onload;
        nextimg.src = options.images[index];
    }
}

$.DiagonalSlideshow = DiagonalSlideshow;
$.fn.diagonalSlideshow = function( options ) {
    $(this).each(function(){
        var $el = $(this);
        if ( !$el.data('diagonal-slideshow') )
            $el.data('diagonal-slideshow', new $.DiagonalSlideshow($el, options));
    });
    return this; // chainable
};

})(jQuery);