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
    var holder, diags, W, H, wl, hl, index, timer = null, i, j, x, y, bx, by, w, margin, margin2, offset;

    var endTransition = function( ) {
        if ( null != timer ) clearTimeout(timer);
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
        var p = cutimage(options.images[ind], diags, W, H), i, ngroups, d, sd, animateoptions, last, max;

        p = shuffle(p);
        ngroups = p.length;
        d = 1000*options.duration/(ngroups-(ngroups-1)*options.overlap);
        sd = d*(1-options.overlap);
        //last = null; max = -1;
        for(i=0; i<ngroups; i++)
        {
            p[i].prev().addClass("diag-remove");
            p[i].css({opacity:0});
            //if ( i*sd >= max ) { last = i; max = i*sd; }
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
    };

    options = $.extend({
        aspectRatio: 1.0,
        side: 200,
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

    w = options.side*sqrt2; wl = 2*stdMath.ceil(W/w)+1; hl = 2*stdMath.ceil(H/w)+1;
    margin = w/2; margin2 = margin/2; offset = 0;

    diags = [];
    for (i=0;i<wl;i++)
    {
        for (j=0;j<hl;j++)
        {
            x = margin*i-margin; y = w*j-margin+offset;
            bx = -x+margin2; by = -y+margin2;
            diags.push({
                i: i, j: j, x: x, y: y, imgx: bx, imgy: by, side: options.side, margin: margin, rows: wl, columns: hl,
                div: $('<div class="diag" data-coords="'+i+' '+j+'"></div>').css({
                    left: String(x)+"px",
                    top: String(y)+"px",
                    width: String(options.side)+"px",
                    height: String(options.side)+"px"
                }).appendTo(holder)
            });
        }
        offset = 0===offset ? -margin : 0;
    }

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
            $el.data('diagonal-slideshow', new DiagonalSlideshow($el, options));
    });
    return this; // chainable
};

})(jQuery);