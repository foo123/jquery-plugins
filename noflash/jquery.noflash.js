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
    zoom-fade
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


version 2.0.0
Note this software is provided AS IS with no warranty. It is provided free of charge for u to use.
Author: Nikos M.
Site: https://foo123.github.io
*/
;(function( $ ) {
"use strict";

var stdMath = Math, toRad = stdMath.PI / 180;

function Matrix2D( )
{
    // default eye matrix
    this.eye();
    // drop in any values given
    if ( arguments.length>0 ) this.val = $.extend(true, this.val, arguments[0]);
}
Matrix2D.prototype = {
    // public methods
    eye: function( ) {
        this.val = {M11:1,M12:0,M21:0,M22:1};
        return this;
    }
    ,add: function( m ) {
        this.val.M11 += m.val.M11;
        this.val.M12 += m.val.M12;
        this.val.M21 += m.val.M21;
        this.val.M22 += m.val.M22;
        return this;
    }
    ,leftMult: function( m ) {
        var t11, t12, t21, t22;
        t11 = m.val.M11*this.val.M11+m.val.M12*this.val.M21;
        t12 = m.val.M11*this.val.M12+m.val.M12*this.val.M22;
        t21 = m.val.M21*this.val.M11+m.val.M22*this.val.M21;
        t22 = m.val.M21*this.val.M12+m.val.M22*this.val.M22;
        this.val.M11 = t11;
        this.val.M12 = t12;
        this.val.M21 = t21;
        this.val.M22 = t22;
        return this;
    }
    ,rightMult: function( m ) {
        var t11, t12, t21, t22;
        t11 = this.val.M11*m.val.M11+this.val.M12*m.val.M21;
        t12 = this.val.M11*m.val.M12+this.val.M12*m.val.M22;
        t21 = this.val.M21*m.val.M11+this.val.M22*m.val.M21;
        t22 = this.val.M21*m.val.M12+this.val.M22*m.val.M22;
        this.val.M11 = t11;
        this.val.M12 = t12;
        this.val.M21 = t21;
        this.val.M22 = t22;
        return this;
    }
    ,display: function( ) {
        return ("M11="+this.val.M11+", "+"M12="+this.val.M12+", "+"M21="+this.val.M21+", "+"M22="+this.val.M22);
    }
};

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
function linearArray( howmany )
{
    var a = new Array(howmany), i;
    for(i=0;i<howmany;i++) a[i] = i;
    return a;
}
function rows( pieces, rowsi, columnsi )
{
    var delays = new Array(rowsi*columnsi), i, j;
    for(i=0;i<columnsi;i++)
    {
        for(j=0;j<rowsi;j++)
        {
            delays[i*rowsi+j] = j;
        }
    }
    return {pieces:pieces, delays:delays, groups:rowsi};
}
function rowsReverse( pieces, rowsi, columnsi )
{
    var delays = new Array(rowsi*columnsi), i, j;
    for(i=0;i<columnsi;i++)
    {
        for(j=0;j<rowsi;j++)
        {
            delays[i*rowsi+j] = rowsi-1-j;
        }
    }
    return {pieces:pieces, delays:delays, groups:rowsi};
}
function columns( pieces, rowsi, columnsi )
{
    var delays = new Array(rowsi*columnsi), i, j;
    for(i=0;i<columnsi;i++)
    {
        for(j=0;j<rowsi;j++)
        {
            delays[i*rowsi+j] = i;
        }
    }
    return {pieces:pieces, delays:delays, groups:columnsi};
}
function columnsReverse( pieces, rowsi, columnsi )
{
    var delays = new Array(rowsi*columnsi), i, j;
    for(i=0;i<columnsi;i++)
    {
        for(j=0;j<rowsi;j++)
        {
            delays[i*rowsi+j] = columnsi-1-i;
        }
    }
    return {pieces:pieces, delays:delays, groups:columnsi};
}
function columnsFirst( pieces, rows, columns )
{
    return({pieces:pieces,delays:linearArray(pieces.length),groups:pieces.length});
}
function columnsFirstReverse( pieces, rows, columns )
{
    var o = columnsFirst(pieces,rows,columns);
    return {pieces:o.pieces.reverse(),delays:o.delays,groups:o.groups};
}
function rowsFirst( pieces, rows, columns)
{
    var newpieces = new Array(rows*columns), i, j;
    for(i=0; i<rows; i++)
    {
        for(j=0;j<columns;j++)
        {
            newpieces[i*columns+j] = pieces[j*rows+i];
        }
    }
    return {pieces:newpieces,delays:linearArray(pieces.length),groups:pieces.length};
}
function rowsFirstReverse( pieces, rows, columns )
{
    var o = rowsFirst(pieces,rows,columns);
    return {pieces:o.pieces.reverse(),delays:o.delays,groups:o.groups};
}
function spiral( pieces, rows, columns, type)
{
    var temp = [], i = 0, j = 0, order = [0,1,2,3], min_i = 0, min_j = 0, max_i = rows-1, max_j = columns-1, dir = 1, mode = 0, inc = true;
    switch( type&3 )
    {
        case 1: i = min_i;
                j = max_j;
                order = [2,1,0,3];
                dir = -1;
                break;
        case 2: i = max_i;
                j = min_j;
                order = [0,3,2,1];
                dir = -1;
                break;
        case 3: i = max_i;
                j = max_j;
                order = [2,3,0,1];
                dir = 1;
                break;
        default: i = min_i;
                j = min_j;
                order = [0,1,2,3]; // 0=>,  1=\/, 2=<, 3=/\
                dir=1;
                break;
    }
    while( (max_i>=min_i) && (max_j>=min_j) )
    {
        if ( inc ) temp.push(pieces[j*rows+i]);
        inc = true;
        switch( order[mode] )
        {
            case 0: // left to right
                if ( j>=max_j )
                {
                    mode = (mode+1)&3;
                    inc = false;
                    if ( dir==1 )
                        min_i++;
                    else
                        max_i--;
                }
                else
                    j++;
                break;
            case 1: // top to bottom
                if ( i>=max_i )
                {
                    mode = (mode+1)&3;
                    inc = false;
                    if ( dir==1 )
                        max_j--;
                    else
                        min_j++;
                }
                else
                    i++;
                break;
            case 2: // right to left
                if ( j<=min_j )
                {
                    mode = (mode+1)&3;
                    inc = false;
                    if ( dir==1 )
                        max_i--;
                    else
                        min_i++;
                }
                else
                    j--;
                break;
            case 3:  // bottom to top
                if ( i<=min_i )
                {
                    mode = (mode+1)&3;
                    inc = false;
                    if ( dir==1 )
                        min_j++;
                    else
                        max_j--;
                }
                else
                    i--;
                break;
        }
    }
    if ( type>=4 ) temp.reverse();
    return {pieces:temp,delays:linearArray(temp.length),groups:temp.length};
}
function spiralTopLeft( pieces, rows, columns )
{
    return spiral(pieces,rows,columns,0);
}
function spiralTopRight( pieces, rows, columns )
{
    return spiral(pieces,rows,columns,1);
}
function spiralBottomLeft( pieces, rows, columns )
{
    return spiral(pieces,rows,columns,2);
}
function spiralBottomRight( pieces, rows, columns)
{
    return spiral(pieces,rows,columns,3);
}
function spiralTopLeftReverse( pieces, rows, columns )
{
    return spiral(pieces,rows,columns,4);
}
function spiralTopRightReverse( pieces, rows, columns )
{
    return spiral(pieces,rows,columns,5);
}
function spiralBottomLeftReverse( pieces, rows, columns )
{
    return spiral(pieces,rows,columns,6);
}
function spiralBottomRightReverse( pieces, rows, columns )
{
    return spiral(pieces,rows,columns,7);
}
function upDown( pieces, rows, columns )
{
    var newpieces = new Array(rows*columns), odd = false, i, j;
    for(i=0;i<columns;i++)
    {
        for(j=0;j<rows;j++)
        {
            newpieces[i*rows+j]= odd ? pieces[i*rows+rows-1-j] : pieces[i*rows+j];
        }
        odd = !odd;
    }
    return {pieces:newpieces,delays:linearArray(pieces.length),groups:pieces.length};
}
function upDownReverse( pieces, rows, columns )
{
    var o = upDown(pieces,rows,columns);
    return {pieces:o.pieces.reverse(),delays:o.delays,groups:o.groups};
}
function leftRight( pieces, rows, columns )
{
    var newpieces = new Array(rows*columns), odd = false, i, j;
    for(i=0;i<rows;i++)
    {
        for(j=0;j<columns;j++)
        {
            newpieces[i*columns+j] = odd ? pieces[(columns-1-j)*rows+i] : pieces[j*rows+i];
        }
        odd = !odd;
    }
    return {pieces:newpieces,delays:linearArray(pieces.length),groups:pieces.length};
}
function leftRightReverse( pieces, rows, columns )
{
    var o = leftRight(pieces,rows,columns);
    return {pieces:o.pieces.reverse(),delays:o.delays,groups:o.groups};
}
function random( pieces, rows, columns )
{
    //v1.0
    for(var j, x, i = pieces.length; i; j = ~~(Math.random() * i), x = pieces[--i], pieces[i] = pieces[j], pieces[j] = x);
    return {pieces:pieces,delays:linearArray(pieces.length),groups:pieces.length};
}
function diagonalTopLeft( pieces, rows, columns )
{
    var delays = new Array(rows*columns), i, j;
    for(i=0;i<columns;i++)
    {
        for(j=0;j<rows;j++)
        {
            delays[i*rows+j] = i+j;
        }
    }
    return {pieces:pieces, delays:delays, groups:rows+columns-1};
}
function diagonalBottomRight( pieces, rows, columns )
{
    var delays = new Array(rows*columns), i, j;
    for(i=0;i<columns;i++)
    {
        for(j=0;j<rows;j++)
        {
            delays[i*rows+j] = columns-1-i+rows-1-j;
        }
    }
    return {pieces:pieces, delays:delays, groups:rows+columns-1};
}
function diagonalBottomLeft( pieces, rows, columns )
{
    var delays = new Array(rows*columns), i, j;
    for(i=0;i<columns;i++)
    {
        for(j=0;j<rows;j++)
        {
            delays[i*rows+j] = i+rows-1-j;
        }
    }
    return {pieces:pieces, delays:delays, groups:rows+columns-1};
}
function diagonalTopRight( pieces, rows, columns )
{
    var delays = new Array(rows*columns), i, j;
    for(i=0;i<columns;i++)
    {
        for(j=0;j<rows;j++)
        {
            delays[i*rows+j] = columns-1-i+j;
        }
    }
    return {pieces:pieces, delays:delays, groups:rows+columns-1};
}
function checkerBoard( pieces, rows, columns )
{
    var delays = new Array(rows*columns), i, j, odd1 = false, odd2;
    for(i=0;i<columns;i++)
    {
        odd2 = odd1;
        for(j=0;j<rows;j++)
        {
            delays[i*rows+j] = odd2 ? 1 : 0;
            odd2 = !odd2;
        }
        odd1 = !odd1;
    }
    return {pieces:pieces, delays:delays, groups:2};
}
function piece( x, y, w, h )
{
    return $('<div style="position:absolute;overflow:hidden;margin:0px;padding:0px;border:0;left:'+String(x)+'%;top:'+String(y)+'%;width:'+String(w)+'%;height:'+String(h)+'%;"></div>');
}
function tile( x, y, w, h, img, i, j, r, c, W, H )
{
    return piece(x, y, w, h).css({
        'background': 'transparent url("'+String(img)+'") no-repeat '+String(-W/c*i)+'px '+String(-H/r*j)+'px',
        'background-size': (String(W)+'px')+' auto'
    });
}
function tiles( img, rows, columns, W, H )
{
        var i, j, x, y, w = W/columns*101/W, h = H/rows*101/H,
        pieces = new Array(rows*columns), imgsrc = img.attr('src');
    for(i=0;i<columns; i++)
    {
        for(j=0; j<rows; j++)
        {
            x = w/columns*i*100/w; y = h/rows*j*100/h;
            pieces[i*rows+j] = {piece:tile(x, y, w, h, imgsrc, i, j, rows, columns, W, H), x:x, y:y, w:w, h:h, i:i, j:j, r:rows, c:columns, img:imgsrc};
        }
    }
    return pieces;
}
/*function resize( pieces, W, H )
{
    if ( !pieces ) return pieces;
    for(var p=0;p<pieces.length;p++)
    {
        pieces[p].w = W/pieces[p].c*101/W;
        pieces[p].h = H/pieces[p].r*101/H;
        pieces[p].x = pieces[p].w/pieces[p].c*pieces[p].i*100/pieces[p].w;
        pieces[p].y = pieces[p].h/pieces[p].r*pieces[p].j*100/pieces[p].h;
        if ( pieces[p].piece.children().length )
        {
            pieces[p].piece.children().each(function(){
                $(this).css({
                    left: String(pieces[p].x)+'%',
                    top: String(pieces[p].y)+'%',
                    width: String(pieces[p].w)+'%',
                    height: String(pieces[p].h)+'%',
                    'background': 'transparent url("'+pieces[p].img)+'") no-repeat '+String(-W/pieces[p].c*pieces[p].i)+'px '+String(-H/pieces[p].r*pieces[p].j)+'px',
                    'background-size': (String(W)+'px')+' auto'
                });
            });
        }
        else
        {
            pieces[p].piece.css({
                left: String(pieces[p].x)+'%',
                top: String(pieces[p].y)+'%',
                width: String(pieces[p].w)+'%',
                height: String(pieces[p].h)+'%',
                'background': 'transparent url("'+pieces[p].img)+'") no-repeat '+String(-W/pieces[p].c*pieces[p].i)+'px '+String(-H/pieces[p].r*pieces[p].j)+'px',
                'background-size': (String(W)+'px')+' auto'
            });
        }
    }
    return pieces;
}*/
function destroy( pieces )
{
    if ( !pieces ) return pieces;
    for(var p=0;p<pieces.length;p++)
    {
        pieces[p].piece.children().remove();
        pieces[p].piece.remove();
        pieces[p].piece = null;
        pieces[p] = null;
    }
    pieces = null;
    return pieces;
}
function translate( where, what )
{
    var n, r, rw, rh;
    for(n in where)
    {
        if ( Object.prototype.hasOwnProperty.call(where, n) )
        {
            r = /(?:X\()(\w+)(?:\))/.exec(String(where[n]));
            if ( r && Object.prototype.hasOwnProperty.call(what, r[1]) )
                where[n] = where[n].replace(r[0], String(what[r[1]]));
        }
    }
    return where;
}
function ID( ){return ++ID.N;}
ID.N = 0;

var handlers = {};

// core plugin functions used by all plugin instances
var noflashCore = {

    VERSION: "2.0.0"

    ,Matrix2D: Matrix2D
    ,tiles: tiles
    ,translate: translate
    ,linearArray: linearArray
    ,rows: rows
    ,rowsReverse: rowsReverse
    ,columns: columns
    ,columnsReverse: columnsReverse
    ,columnsFirst: columnsFirst
    ,columnsFirstReverse: columnsFirstReverse
    ,rowsFirst: rowsFirst
    ,rowsFirstReverse: rowsFirstReverse
    ,spiral: spiral
    ,spiralTopLeft: spiralTopLeft
    ,spiralTopRight: spiralTopRight
    ,spiralBottomLeft: spiralBottomLeft
    ,spiralBottomRight: spiralBottomRight
    ,spiralTopLeftReverse: spiralTopLeftReverse
    ,spiralTopRightReverse: spiralTopRightReverse
    ,spiralBottomLeftReverse: spiralBottomLeftReverse
    ,spiralBottomRightReverse: spiralBottomRightReverse
    ,upDown: upDown
    ,upDownReverse: upDownReverse
    ,leftRight: leftRight
    ,leftRightReverse: leftRightReverse
    ,random: random
    ,diagonalTopLeft: diagonalTopLeft
    ,diagonalBottomRight: diagonalBottomRight
    ,diagonalBottomLeft: diagonalBottomLeft
    ,diagonalTopRight: diagonalTopRight
    ,checkerBoard: checkerBoard

    ,transitions: {
        "rotate-tiles":{animate:{_custom_step:1},start:{position:"absolute"},easing:"linear"}
        ,"rotate-tiles-reverse":{reverse:true,animate:{_custom_step:0},start:{position:"absolute"},easing:"linear"}
        ,"flip-tiles-horizontal":{animate:{_custom_step:1},start:{position:"absolute"},easing:"linear"}
        ,"flip-tiles-vertical":{animate:{_custom_step:1},start:{position:"absolute"},easing:"linear"}
        ,"iris":{rows:1,columns:1,animate:{width:"100%",height:"100%",top:"0%",left:"0%"},start:{"background-position":"50% 50%",width:"0%",height:"0%",top:"50%",left:"50%"},easing:"linear"}
        ,"iris-reverse":{reverse:true,rows:1,columns:1,animate:{width:"0%",height:"0%",top:"50%",left:"50%"},start:{"background-position":"50% 50%",width:"100%",height:"100%",top:"0%",left:"0%"},easing:"linear"}
        ,"zoom-fade":{rows:1,columns:1,animate:{_custom_step:1},start:{},easing:"linear"}
        ,"fade-tiles":{animate:{opacity:1},start:{opacity:0},easing:"linear"}
        ,"fade-grow-tiles":{animate:{opacity:1,width:"X(w)%",height:"X(h)%"},start:{opacity:0,width:"0%",height:"0%"},easing:"linear"}
        ,"fade-shrink-tiles":{animate:{opacity:0,width:"0%",height:"0%"},start:{opacity:1,width:"X(w)%",height:"X(h)%"},easing:"linear",reverse:true}
        ,"shrink-tiles":{animate:{width:"0%",height:"0%"},start:{width:"X(w)%",height:"X(h)%"},easing:"linear",reverse:true}
        ,"grow-tiles":{animate:{width:"X(w)%",height:"X(h)%"},start:{width:"0%",height:"0%"},easing:"linear"}
        ,"shrink-tiles-horizontal":{animate:{width:"0%"},start:{width:"X(w)%"},easing:"linear",reverse:true}
        ,"grow-tiles-horizontal":{animate:{width:"X(w)%"},start:{width:"0%"},easing:"linear"}
        ,"grow-fade-tiles-vertical":{animate:{height:"X(h)%",opacity:1},start:{height:"0%",opacity:0},easing:"linear"}
        ,"grow-fade-tiles-horizontal":{animate:{width:"X(w)%",opacity:1},start:{width:"0%",opacity:0},easing:"linear"}
        ,"grow-tiles-vertical":{animate:{height:"X(h)%"},start:{height:"0%"},easing:"linear"}
        ,"shrink-tiles-vertical":{animate:{height:"0%"},start:{height:"X(h)%"},easing:"linear",reverse:true}
        ,"move-tiles-vertical-down":{animate:{top:"X(y)%"},start:{top:"-X(h)%"},easing:"linear"}
        ,"move-tiles-vertical-up":{animate:{top:"X(y)%"},start:{top:"100%"},easing:"linear"}
        ,"move-tiles-vertical-up-down":{animate:{top:"X(y)%"},start1:{top:"-X(h)%"},start2:{top:"100%"},easing:"linear"}
        ,"move-tiles-horizontal-right":{animate:{left:"X(x)%"},start:{left:"-X(w)%"},easing:"linear"}
        ,"move-tiles-horizontal-left":{animate:{left:"X(x)%"},start:{left:"100%"},easing:"linear"}
        ,"move-tiles-horizontal-left-right":{animate:{left:"X(x)%"},start1:{left:"-X(w)%"},start2:{left:"100%"},easing:"linear"}
        ,"move-fade-tiles-vertical-down":{animate:{top:"X(y)%",opacity:1},start:{top:"-X(h)%",opacity:0},easing:"linear"}
        ,"move-fade-tiles-vertical-up":{animate:{top:"X(y)%",opacity:1},start:{top:"100%",opacity:0},easing:"linear"}
        ,"move-fade-tiles-vertical-up-down":{animate:{top:"X(y)%",opacity:1},start1:{top:"-X(h)%",opacity:0},start2:{top:"100%",opacity:0},easing:"linear"}
        ,"move-fade-tiles-horizontal-right":{animate:{left:"X(x)%",opacity:1},start:{left:"-X(w)%",opacity:0},easing:"linear"}
        ,"move-fade-tiles-horizontal-left":{animate:{left:"X(x)%",opacity:1},start:{left:"100%",opacity:0},easing:"linear"}
        ,"move-fade-tiles-horizontal-left-right":{animate:{left:"X(x)%",opacity:1},start1:{left:"-X(w)%",opacity:0},start2:{left:"100%",opacity:0},easing:"linear"}
        ,"fly-top-left":{animate:{left:"0%",top:"0%"},start:{left:"100%",top:"100%"},rows:1,columns:1,easing:"linear"}
        ,"fly-bottom-left":{animate:{left:"0%",top:"0%"},start:{left:"100%",top:"-100%"},rows:1,columns:1,easing:"linear"}
        ,"fly-top-right":{animate:{left:"0%",top:"0%"},start:{left:"-100%",top:"100%"},rows:1,columns:1,easing:"linear"}
        ,"fly-bottom-right":{animate:{left:"0%",top:"0%"},start:{left:"-100%",top:"-100%"},rows:1,columns:1,easing:"linear"}
        ,"fly-left":{animate:{left:"0%"},start:{left:"100%"},rows:1,columns:1,easing:"linear"}
        ,"fly-right":{animate:{left:"0%"},start:{left:"-100%"},rows:1,columns:1,easing:"linear"}
        ,"fly-top":{animate:{top:"0%"},start:{top:"100%"},rows:1,columns:1,easing:"linear"}
        ,"fly-bottom":{animate:{top:"0%"},start:{top:"-100%"},rows:1,columns:1,easing:"linear"}
        ,"pan-top-left":{animate:{top:"-X(h)%",left:"-X(w)%"},start:{top:"X(y)%",left:"X(x)%"},rows:1,columns:1,easing:"linear",current:{top:"0%",left:"0%"},next:{top:"X(h)%",left:"X(w)%"}}
        ,"pan-top-right":{animate:{top:"-X(h)%",left:"X(w)%"},start:{top:"X(y)%",left:"X(x)%"},rows:1,columns:1,easing:"linear",current:{top:"0%",left:"0%"},next:{top:"X(h)%",left:"-X(w)%"}}
        ,"pan-bottom-right":{animate:{top:"X(h)%",left:"X(w)%"},start:{top:"X(y)%",left:"X(x)%"},rows:1,columns:1,easing:"linear",current:{top:"0%",left:"0%"},next:{top:"-X(h)%",left:"-X(w)%"}}
        ,"pan-bottom-left":{animate:{top:"X(h)%",left:"-X(w)%"},start:{top:"X(y)%",left:"X(x)%"},rows:1,columns:1,easing:"linear",current:{top:"0%",left:"0%"},next:{top:"-X(h)%",left:"X(w)%"}}
        ,"pan-left":{animate:{left:"-X(w)%"},start:{top:"X(y)%",left:"X(x)%"},rows:1,columns:1,easing:"linear",current:{top:"0%",left:"0%"},next:{top:"0%",left:"X(w)%"}}
        ,"pan-right":{animate:{left:"X(w)%"},start:{top:"X(y)%",left:"X(x)%"},rows:1,columns:1,easing:"linear",current:{top:"0%",left:"0%"},next:{top:"0%",left:"-X(w)%"}}
        ,"pan-top":{animate:{top:"-X(h)%"},start:{top:"X(y)%",left:"X(x)%"},rows:1,columns:1,easing:"linear",current:{top:"0%",left:"0%"},next:{top:"X(h)%",left:"0%"}}
        ,"pan-bottom":{animate:{top:"X(h)%"},start:{top:"X(y)%",left:"X(x)%"},rows:1,columns:1,easing:"linear",current:{top:"0%",left:"0%"},next:{top:"-X(h)%",left:"0%"}}
    }

    ,ordering: {
        "checkerboard": checkerBoard
        ,"diagonal-top-left": diagonalTopLeft
        ,"diagonal-top-right": diagonalTopRight
        ,"diagonal-bottom-left": diagonalBottomLeft
        ,"diagonal-bottom-right": diagonalBottomRight
        ,"rows": rows
        ,"rows-reverse": rowsReverse
        ,"rows-first": rowsFirst
        ,"rows-first-reverse": rowsFirstReverse
        ,"columns": columns
        ,"columns-reverse": columnsReverse
        ,"columns-first": columnsFirst
        ,"columns-first-reverse": columnsFirstReverse
        ,"spiral-top-left": spiralTopLeft
        ,"spiral-top-right": spiralTopRight
        ,"spiral-bottom-left": spiralBottomLeft
        ,"spiral-bottom-right": spiralBottomRight
        ,"spiral-top-left-reverse": spiralTopLeftReverse
        ,"spiral-top-right-reverse": spiralTopRightReverse
        ,"spiral-bottom-left-reverse": spiralBottomLeftReverse
        ,"spiral-bottom-right-reverse": spiralBottomRightReverse
        ,"random": random
        ,"up-down": upDown
        ,"up-down-reverse": upDownReverse
        ,"left-right": leftRight
        ,"left-right-reverse": leftRightReverse
    }

    ,randomTransitions: [
        {transition:"rotate-tiles-reverse",easing:"quintEaseOut",duration:2.5,overlap:1,rows:6,columns:6,ordering:"columns-first"}
        ,{transition:"flip-tiles-vertical",easing:"backEaseOut",duration:2,overlap:0.9,rows:4,columns:4,ordering:"spiral-top-left"}
        ,{transition:"iris-reverse",easing:"quintEaseOut",duration:2,overlap:0.9,rows:1,columns:1,ordering:"rows-first"}
        ,{transition:"zoom-fade",easing:"quintEaseOut",duration:4,rows:1,columns:1,ordering:"rows-first"}
        ,{transition:"grow-tiles",easing:"linear",duration:2,overlap:0.9,rows:6,columns:6,ordering:"rows-first"}
        ,{transition:"fade-shrink-tiles",easing:"linear",duration:2,overlap:0.9,rows:6,columns:6,ordering:"left-right"}
        ,{transition:"shrink-tiles",easing:"quintEaseOut",duration:2,overlap:1,rows:6,columns:6,ordering:"columns-first"}
        ,{transition:"fade-tiles",easing:"linear",duration:2,overlap:0.9,rows:6,columns:6,ordering:"diagonal-top-left"}
        ,{transition:"fade-tiles",easing:"linear",duration:2,overlap:0.9,rows:5,columns:5,ordering:"random"}
        ,{transition:"fade-tiles",easing:"linear",duration:2,overlap:0.9,rows:5,columns:5,ordering:"spiral-top-left"}
        ,{transition:"fade-tiles",easing:"linear",duration:2,overlap:0.9,rows:5,columns:5,ordering:"left-right"}
        ,{transition:"fly-top-left",easing:"backEaseOut",duration:2,overlap:0.9,rows:1,columns:1,ordering:"columns-first"}
        ,{transition:"pan-top-left",easing:"backEaseOut",duration:2,overlap:0.9,rows:1,columns:1,ordering:"columns-first"}
        ,{transition:"move-tiles-horizontal-left-right",easing:"backEaseOut",duration:2,overlap:0.8,rows:7,columns:1,ordering:"columns-first"}
        ,{transition:"move-tiles-horizontal-right",easing:"backEaseOut",duration:2,overlap:0.8,rows:7,columns:1,ordering:"columns-first"}
        ,{transition:"move-tiles-vertical-up-down",easing:"backEaseOut",duration:2,overlap:0.9,rows:1,columns:7,ordering:"columns-first"}
        ,{transition:"move-tiles-vertical-up",easing:"quintEaseOut",duration:2,overlap:0.9,rows:1,columns:7,ordering:"columns-first"}
        ,{transition:"grow-tiles-horizontal",easing:"linear",duration:2,overlap:0.9,rows:1,columns:6,ordering:"random"}
        ,{transition:"grow-tiles-vertical",easing:"linear",duration:2,overlap:0.9,rows:6,columns:1,ordering:"random"}
    ]
    ,getRandomTransition: function( ) {
        return $.noflashCore.randomTransitions[stdMath.round(($.noflashCore.randomTransitions.length-1)*stdMath.random())];
    }
};

// determine css transform support if any
var cssTransform = ["transformProperty", "WebkitTransform", "OTransform", "msTransform", "MozTransform"],
    cssTransformOrigin = ["transformOriginProperty", "WebkitTransformOrigin", "OTransformOrigin", "msTransformOrigin", "MozTransformOrigin"],
    cssTransformProp = null, cssOriginProp = null;

// actual plugin code
function NoFlash( el, options )
{
    var self = this;
    if ( !(self instanceof NoFlash) ) return new NoFlash(el, options);

    var defaults = {
        rows: 1,
        columns: 1,
        delay: 5,
        duration: 2,
        caption: true,
        controls: true,
        transition: "random",
        easing: "linear",
        ordering: "random",
        randomOrder: false,
        aspectRatio: 1.0,
        width: 500,
        height: 500,
        overlap: 0.9,
        imgs: null,
        preload: true,
        preloaderClass: "noflash-preloader",
        captionClass: "noflash-caption",
        controlsClass: "noflash-controls",
        backColor: "#000"
    };

    options = $.extend(defaults, options||{});
    if ( !options.aspectRatio ) options.aspectRatio = 1.0;

    self.id = ID();
    self.el = $(el);
    self.options = options;


    if ( null == cssTransformProp )
    {
        for(var i=0;i<cssTransform.length;i++)
        {
            if ( self.el[0].style[cssTransform[i]] != null )
            {
                cssTransformProp = cssTransform[i];
            }
            if ( self.el[0].style[cssTransformOrigin[i]] != null )
            {
                cssOriginProp = cssTransformOrigin[i];
            }
            if ( cssTransformProp != null && cssOriginProp != null )
            {
                break;
            }
        }
        if ( !cssTransformProp ) cssTransformProp = false;
    }


    // take first matched element only to avoid more coding for multiple elements
    // global vars
    var holder, caption, controls, thisimg, nextimg, imgs = [], fx = [], captions = [],
        current, prevcurrent = -1, timer, dotimer = true, paused = false, p = null, p2 = null, ind = [], howmany = 0,
        failed = [], loadimgs = [], mutex = false,
        prediv = $("<div><div class='"+self.options.preloaderClass+"'></div></div>"),
        numpiec = 0, stopped = false, animation_in_progress = false,
        W, H
    ;

    var preload = function preload( callback ) {
        howmany = 0;
        loadimgs = [];
        failed = [];
        holder.append(prediv);
        var load = function load( e ) {
                howmany++;
                if ( e.type=="error" )
                {
                    failed.push($(this).attr("src"));
                }
                if ( imgs.length===howmany )
                {
                    callback();
                }
            };
        for(var i=0;i<imgs.length;i++)
        {
            loadimgs[i] = $(new Image(W, H));
            loadimgs[i].load(load);
            loadimgs[i].error(load);
            loadimgs[i].attr("src", imgs[i].attr("src"));
        }
    };

    var afterpreload = function afterpreload( ) {
        if ( self.options.preload )
        {
            if ( prediv!=null )
            {
                prediv.remove();
                prediv = null;
            }
            // delete failed elements
            for(var i=0;i<failed.length;i++)
            {
                var j = imgs.length-1;
                while( j>=0 )
                {
                    if ( imgs[j].attr("src")===failed[i] )
                    {
                        imgs.splice(j, 1);
                        fx.splice(j, 1);
                        captions.splice(j, 1);
                    }
                    j--;
                }
            }
        }

        for(var i=0;i<imgs.length;i++)
        {
            ind[i] = i;
            if ( self.options.controls )
            {
                var anc = $("<a class='bullet' href='javascript:void(0)' rel='"+i+"'></a>");
                controls.find(".bullets").append(anc);
            }
        }
        if ( self.options.controls )
        {
            controls.find(".controls").append("<a class='prev' href='javascript:void(0)'></a><a class='play-pause' href='javascript:void(0)'></a><a class='next' href='javascript:void(0)'></a>");
            controls.find(".bullet").click(function( ) {
                if ( paused ) return;
                if ( !mutex ) self.doTransition(String(parseInt($(this).attr("rel"), 10)));
            });
            controls.find(".prev").click(function( ) {
                if ( paused ) return;
                self.prevTransition();
            });
            controls.find(".next").click(function( ) {
                if ( paused ) return;
                self.nextTransition();
            });
            controls.find(".play-pause").click(function( ) {
                paused = !paused;
                if ( paused )
                {
                    self.stopPlay();
                    $(this).addClass('paused');
                }
                else
                {
                    self.resumePlay();
                    $(this).removeClass('paused');
                }
            });
        }

        // randomize order
        if ( self.options.randomOrder ) ind = random(ind,0,0).pieces;
        prevcurrent = 0;
        current = 0;
        //thisimg.append(imgs[ind[current]]);
        thisimg.css({'background-image':'url("'+imgs[ind[current]][0].src+'")'});
        if ( self.options.controls )
        {
            toggleActive();
        }

        if ( self.options.caption && captions[ind[current]]!=null && captions[ind[current]]!="" )
        {
            caption.html(captions[ind[current]]).show();
        }
        prepareTransition();
    };

    var toggleActive = function toggleActive( ) {
        controls.find(".bullet").removeClass("active");
        controls.find('[rel="'+current+'"]').addClass("active");
    };

    self.init = function init( ) {
        W = self.el.width(); H = stdMath.ceil(W/self.options.aspectRatio);
        holder = $("<div class=\"noflash-holder\"></div>");
        holder.css({margin:"0px",padding:"0px",border:'0',overflow:"hidden",position:"relative",top:"0px",left:"0px",width:String(W)+'px', height:String(H)+'px',"background-color":self.options.backColor||0});

        // resize handler
        handlers[self.id] = function(evt){
            W = self.el.width(); H = stdMath.ceil(W/self.options.aspectRatio);
            holder.css({width:String(W)+'px', height:String(H)+'px'});
            thisimg.css({'background-size':String(W)+'px auto'});
            nextimg.css({'background-size':String(W)+'px auto'});
        };

        // parse dom data
        self.el.children("div").each(function( ) {
            imgs.push($(this).children("img").filter(":first").css({position:"absolute",width:'100%',height:'auto'}));
            captions.push($(this).children("span").filter(":first").html());
            var thisfx = {};
            thisfx.transition = self.options.transition;
            thisfx.delay = self.options.delay;
            thisfx.easing = self.options.easing;
            thisfx.ordering = self.options.ordering;
            thisfx.rows = self.options.rows;
            thisfx.columns = self.options.columns;
            thisfx.overlap = self.options.overlap;
            thisfx.duration = self.options.duration;
            if ($(this).attr("class")!="" && $(this).attr("class")!=null)
            {
                var data = $(this).attr("class").split(/\s+/);
                for(var i=0;i<data.length;i++)
                {
                    var key_value = data[i].split("=");
                    if ( 2 <= key_value.length ) thisfx[key_value[0]] = key_value[1];
                }
                thisfx.delay = parseFloat(thisfx.delay, 10);
                thisfx.rows = parseInt(thisfx.rows, 10);
                thisfx.columns = parseInt(thisfx.columns, 10);
                thisfx.overlap = parseFloat(thisfx.overlap, 10);
                thisfx.duration = parseFloat(thisfx.duration, 10);
            }
            fx.push(thisfx);
            $(this).remove();
        });

        // add options data
        if ( self.options.imgs!=null )
        {
            for(var i=0;i<self.options.imgs.length;i++)
            {
                if ( self.options.imgs[i].alt!=null )
                    imgs.push($('<img src="'+self.options.imgs[i].src+'" style="position:absolute;width:100%;height:auto;" alt="'+self.options.imgs[i].alt+'" title="'+self.options.imgs[i].alt+'"/>'));
                else
                    imgs.push($('<img src="'+self.options.imgs[i].src+'" style="position:absolute;width:100%;height:auto;"/>'));

                var thisfx = {};

                if ( self.options.imgs[i].transition!=null )
                    thisfx.transition = self.options.imgs[i].transition;
                else
                    thisfx.transition = self.options.transition;

                if ( self.options.imgs[i].easing!=null )
                    thisfx.easing = self.options.imgs[i].easing;
                else
                    thisfx.easing = self.options.easing;

                if ( self.options.imgs[i].ordering!=null )
                    thisfx.ordering = self.options.imgs[i].ordering;
                else
                    thisfx.ordering = self.options.ordering;

                if ( self.options.imgs[i].delay!=null )
                    thisfx.delay = self.options.imgs[i].delay;
                else
                    thisfx.delay = self.options.delay;

                if ( self.options.imgs[i].rows!=null )
                    thisfx.rows = self.options.imgs[i].rows;
                else
                    thisfx.rows = self.options.rows;

                if ( self.options.imgs[i].columns!=null )
                    thisfx.columns = self.options.imgs[i].columns;
                else
                    thisfx.columns = self.options.columns;

                if ( self.options.imgs[i].overlap!=null )
                    thisfx.overlap = self.options.imgs[i].overlap;
                else
                    thisfx.overlap = self.options.overlap;

                if ( self.options.imgs[i].duration!=null )
                    thisfx.duration = self.options.imgs[i].duration;
                else
                    thisfx.duration = self.options.duration;

                fx.push(thisfx);

                if ( self.options.imgs[i].caption!=null )
                    captions.push(self.options.imgs[i].caption);
                else
                    captions.push("");
            }
        }

        self.el.append(holder);

        thisimg = $('<div class="noflash-thisimg"></div>');
        thisimg.css({margin:0,padding:0,position:"absolute",top:"0px",left:"0px",width:"100%",height:"100%","z-index":2,'background':'transparent none no-repeat 0 0','background-size':String(W)+'px auto'});
        nextimg = $('<div class="noflash-nextimg"></div>');
        nextimg.css({margin:0,padding:0,position:"absolute",top:"0px",left:"0px",width:"100%",height:"100%","z-index":1,'background':'transparent none no-repeat 0 0','background-size':String(W)+'px auto'});
        holder.append(thisimg);
        holder.append(nextimg);
        caption = $("<div class='"+self.options.captionClass+"'></div>");
        caption.css({"z-index":4});
        caption.hide();
        if ( self.options.caption ) holder.append(caption);
        controls = $("<div class='"+self.options.controlsClass+"'></div>");
        controls.css({"z-index":10});
        controls.append("<div class='bullets'></div><div class='controls'></div>");
        if ( self.options.controls ) holder.append(controls);

        if ( self.options.preload )
            preload(afterpreload);
        else
            afterpreload();
    };

    self.doTransition = function doTransition( dir ) {
        var i, dd, fxi, ord, r, c, temp, ordobj, ngroups, d, o, sd, odd, animateoptions;

        clearTimeout(timer);

        // stop previous animations
        if ( p!=null /*&& animation_in_progress*/ )
        {
            for(i=0;i<p.length;i++)
                p[i].piece.stop(true, false);
        }
        prevcurrent = current;
        if ( imgs.length>0 )
        {
            if ( dir=="+1" )
            {
                current = (current+1)%imgs.length;
            }
            else if ( dir=="-1" )
            {
                current = (current+imgs.length-1)%imgs.length;
            }
            else
                current = parseInt(dir);
        }
        if ( self.options.caption ) caption.stop(true,true).hide();
        if ( self.options.controls )
        {
            toggleActive();
        }

        fxi = fx[ind[current]];
        if ( fxi.transition=="random" ) fxi = $.noflashCore.getRandomTransition();
        ord = fxi.ordering;
        r = ($.noflashCore.transitions[fxi.transition].rows!=null) ? $.noflashCore.transitions[fxi.transition].rows : fxi.rows;
        c = ($.noflashCore.transitions[fxi.transition].columns!=null) ? $.noflashCore.transitions[fxi.transition].columns : fxi.columns;

        if ( p2!=null ) p2 = destroy(p2);
        if ( p!=null ) p = destroy(p);

        if ( $.noflashCore.transitions[fxi.transition].reverse )
        {
            p = tiles(imgs[ind[prevcurrent]], r, c, W, H);
            thisimg.css({'background-image':'url("'+imgs[ind[current]][0].src+'")'});
        }
        else
        {
            p = tiles(imgs[ind[current]], r, c, W, H);
        }

        howmany = 0;
        numpiec = p.length;
        if ( fxi.transition=="flip-tiles-horizontal" || fxi.transition=="flip-tiles-vertical" )
        {
            p2 = tiles(imgs[ind[prevcurrent]], r, c, W, H);
            for(i=0;i<p.length;i++)
            {
                dd = piece(p[i].x, p[i].y, p[i].w, p[i].h);
                // to animate custom properties like rotation, scaling etc
                dd[0]._custom_step = 0;
                dd[0]._customAnimate = true;
                dd[0]._p1 = p[i].piece[0];
                dd[0]._p2 = p2[i].piece[0];
                dd[0]._x = p[i].x;
                dd[0]._y = p[i].y;
                dd[0]._w = p[i].w;
                dd[0]._h = p[i].h;
                p2[i].piece.appendTo(dd);
                p[i].piece.appendTo(dd);
                p[i].piece.css({top:"0px",left:"0px",width:'100%',height:'100%',visibility:"hidden"});
                p2[i].piece.css({top:"0px",left:"0px",width:'100%',height:'100%',visibility:"visible"});
                p2[i].piece = dd;
                p[i].piece = dd;
            }
            //thisimg.empty();
            thisimg.css({'background-image':'none'});
        }
        else if ( fxi.transition=="rotate-tiles" || fxi.transition=="rotate-tiles-reverse" )
        {
            for(i=0;i<p.length;i++)
            {
                // to animate custom properties like rotation, scaling etc
                if ( fxi.transition=="rotate-tiles" )
                    p[i].piece[0]._custom_step = 0;
                if ( fxi.transition=="rotate-tiles-reverse" )
                    p[i].piece[0]._custom_step = 1;
                p[i].piece[0]._customAnimate = true;
                p[i].piece[0]._x = p[i].x;
                p[i].piece[0]._y = p[i].y;
                p[i].piece[0]._w = p[i].w;
                p[i].piece[0]._h = p[i].h;
            }
        }
        else if ( fxi.transition=="zoom-fade" )
        {
            p2 = tiles(imgs[ind[prevcurrent]], r, c, W, H);
            for(i=0;i<p.length;i++)
            {
                dd = piece(p[i].x, p[i].y, p[i].w, p[i].h);
                // to animate custom properties like rotation, scaling etc
                dd[0]._custom_step = 0;
                dd[0]._customAnimate = true;
                dd[0]._p1 = p[i].piece[0];
                dd[0]._p2 = p2[i].piece[0];
                dd[0]._x = p[i].x;
                dd[0]._y = p[i].y;
                dd[0]._w = p[i].w;
                dd[0]._h = p[i].h;
                p2[i].piece.appendTo(dd);
                p[i].piece.appendTo(dd);
                p[i].piece.css({top:"0px",left:"0px",width:'100%',height:'100%',opacity:0,'background-position':'center','background-size':'125%'});
                p2[i].piece.css({top:"0px",left:"0px",width:'100%',height:'100%',opacity:1,'background-position':'center','background-size':'100%'});
                p2[i].piece = dd;
                p[i].piece = dd;
            }
            //thisimg.empty();
            thisimg.css({'background-image':'none'});
        }
        else if ( $.noflashCore.transitions[fxi.transition].current!=null || $.noflashCore.transitions[fxi.transition].next!=null )
        {
            p2 = tiles(imgs[ind[prevcurrent]], r, c, W, H);
            for(i=0;i<p.length;i++)
            {
                temp = $.extend(true,{}, $.noflashCore.transitions[fxi.transition]);
                translate(temp.current, p2[i]);
                translate(temp.next, p[i]);
                p2[i].piece.css(temp.current);
                p[i].piece.css(temp.next);
                dd = piece(0, 0, 100, 100);
                p2[i].piece.appendTo(dd);
                p[i].piece.appendTo(dd);
                p[i].piece = dd;
                p2[i].piece = dd;
            }
            //thisimg.empty();
            thisimg.css({'background-image':'none'});
        }
        ordobj = $.noflashCore.ordering[ord](p,r,c);
        p = ordobj.pieces;
        nextimg.empty();
        thisimg.css({"z-index":0});
        fxi.overlap = stdMath.min(1,stdMath.max(0,fxi.overlap));
        ngroups = ordobj.groups;
        d = 1000*fxi.duration/(ngroups-(ngroups-1)*fxi.overlap);
        o = d*fxi.overlap;
        sd = d-o;
        odd = false;
        animation_in_progress = true;
        for(i=0;i<numpiec;i++)
        {
            temp = $.extend(true,{}, $.noflashCore.transitions[fxi.transition]);
            if ( temp.start1 && temp.start2 )
            {
                if ( odd )
                    temp.start = temp.start1;
                else
                    temp.start = temp.start2;
            }
            translate(temp.start,p[i]);
            translate(temp.animate,p[i]);

            animateoptions = {duration:d, easing:fxi.easing};
            if ( i==p.length-1 )
                animateoptions.complete = function( ){endTransition();};

            if ( fxi.transition=="zoom-fade" )
            {
                animateoptions.step = function( now, fx ) {
                    this._p1.style.opacity = now;
                    this._p2.style.opacity = 1-now;
                    this._p2.style.backgroundPosition = 'center';
                    this._p1.style.backgroundPosition = 'center';
                    this._p2.style.backgroundSize = String(100+25*now)+'%';
                    this._p1.style.backgroundSize = String(100+25*(1-now))+'%';
                };
            }
            else if ( fxi.transition=="flip-tiles-horizontal" )
            {
                animateoptions.step = function( now, fx ) {
                    var sc = 2*(1-now)-1, sk, m;
                    if ( sc<0 )
                    {
                        this._p1.style.visibility = "visible";
                        this._p2.style.visibility = "hidden";
                        sc = -sc;
                    }
                    else
                    {
                        this._p2.style.visibility = "visible";
                        this._p1.style.visibility = "hidden";
                    }
                    if ( sc>1 ) sc -= 2*(sc-1);

                    sk = -(1-sc)*2;

                    m = new Matrix2D();
                    m.leftMult(new Matrix2D({M11:1,M12:stdMath.tan(sk*toRad),M21:0,M22:1}));
                    m.leftMult(new Matrix2D({M11:sc,M12:0,M21:0,M22:1}));

                    if ( cssTransformProp )
                    {
                        this.style[cssTransformProp] = "matrix("+m.val.M11+","+m.val.M21+","+m.val.M12+","+m.val.M22+",0,0)";
                        this.style[cssOriginProp] = "50% 50%";
                    }
                    else if ( this.style.filter!=null )
                    {
                        this.style.filter = 'progid:DXImageTransform.Microsoft.Matrix(sizingMethod="auto expand", M11 = ' + m.val.M11 + ', M12 = ' + m.val.M12 + ', M21 = ' + m.val.M21 + ', M22 = ' + m.val.M22 + ')';
                        this.style.left = (this._x+0.5*(1-sc)*this._w)+"%";
                    }
                };
            }
            else if ( fxi.transition=="flip-tiles-vertical" )
            {
                animateoptions.step = function( now, fx ) {
                    var sc=2*(1-now)-1, sk, m;
                    if ( sc<0 )
                    {
                        this._p1.style.visibility = "visible";
                        this._p2.style.visibility = "hidden";
                        sc = -sc;
                    }
                    else
                    {
                        this._p2.style.visibility = "visible";
                        this._p1.style.visibility = "hidden";
                    }
                    if ( sc>1 ) sc -= 2*(sc-1);

                    sk = -(1-sc)*2;

                    m = new Matrix2D();
                    m.leftMult(new Matrix2D({M11:1,M12:0,M21:stdMath.tan(sk*toRad),M22:1}));
                    m.leftMult(new Matrix2D({M11:1,M12:0,M21:0,M22:sc}));

                    if ( cssTransformProp )
                    {
                        this.style[cssTransformProp] = "matrix("+m.val.M11+","+m.val.M21+","+m.val.M12+","+m.val.M22+",0,0)";
                        this.style[cssOriginProp] = "50% 50%";
                    }
                    else if ( this.style.filter!=null )
                    {
                        this.style.filter = 'progid:DXImageTransform.Microsoft.Matrix(sizingMethod="auto expand", M11 = ' + m.val.M11 + ', M12 = ' + m.val.M12 + ', M21 = ' + m.val.M21 + ', M22 = ' + m.val.M22 + ')';
                        this.style.top = (this._y+0.5*(1-sc)*this._h)+"%";
                    }
                };
            }
            else if ( fxi.transition=="rotate-tiles" || fxi.transition=="rotate-tiles-reverse" )
            {
                animateoptions.step = function( now, fx ) {
                    var sc = now, rot, m, c, s, h, w;
                    rot = ((now*720)%360)*toRad;
                    if ( sc>1 ) sc -= 2*(sc-1);

                    if ( sc<0 ) sc += -2*sc;

                    m = new Matrix2D();
                    c = stdMath.cos(rot); s = stdMath.sin(rot);
                    m.leftMult(new Matrix2D({M11:c,M12:-s,M21:s,M22:c}));
                    m.leftMult(new Matrix2D({M11:sc,M12:0,M21:0,M22:sc}));

                    if ( cssTransformProp )
                    {
                        this.style[cssTransformProp] = "matrix("+m.val.M11+","+m.val.M21+","+m.val.M12+","+m.val.M22+",0,0)";
                        this.style[cssOriginProp]=  "50% 50%";
                    }
                    else if ( this.style.filter!=null )
                    {
                        this.style.filter = 'progid:DXImageTransform.Microsoft.Matrix(sizingMethod="auto expand", M11 = ' + m.val.M11 + ', M12 = ' + m.val.M12 + ', M21 = ' + m.val.M21 + ', M22 = ' + m.val.M22 + ')';

                        h = this.clientHeight;
                        w = this.clientWidth;
                        this.style.left = (this._x*w/100/*+0.5*(1-sc)*this._w*/+0.5*(w-this.offsetWidth))+"px";
                        this.style.top = (this._y*h/100/*+0.5*(1-sc)*this._h*/+0.5*(h-this.offsetHeight))+"px";
                    }
                };
            }
            p[i].piece.css(temp.start).appendTo(nextimg).delay(ordobj.delays[i]*sd).animate(temp.animate,animateoptions);
            odd = !odd;
        }
    };

    self.stopPlay = function stopPlay( ) {
        dotimer = false;
        clearTimeout(timer);
    };

    self.resumePlay = function resumePlay( ) {
        dotimer = true;
        self.doTransition("+1");
    };

    self.nextTransition = function nextTransition( ) {
        if ( imgs.length>0 )
            self.doTransition("+1");
    };

    self.prevTransition = function prevTransition( ) {
        if ( imgs.length>0 )
            self.doTransition("-1");
    };

    var prepareTransition = function prepareTransition( ) {
        if ( imgs.length>0 && dotimer )
            timer = setTimeout(function(){self.doTransition("+1");}, fx[ind[current]].delay*1000);
    };

    var endTransition = function endTransition( ) {
        //thisimg.empty();
        //thisimg.append(imgs[ind[current]]);
        thisimg.css({'background-image':'url("'+imgs[ind[current]][0].src+'")', 'z-index':2});
        nextimg.empty();
        if ( self.options.caption && captions[ind[current]]!=null && captions[ind[current]]!="" )
        {
            caption.html(captions[ind[current]]).stop(true,true).show();//fadeIn(parseFloat(fx[ind[current]].delay)*200,"linear");
        }
        animation_in_progress = false;
        prepareTransition();
    };

    // go
    self.init();
};


// attach core functions to jquery as singleton/static
if ( null == $.noflashCore )
{
    // override default animation step to animate custom props for advanced fx
    var $_fx_step_default = $.fx.step._default;
    $.fx.step._default = function( fx ) {
      if ( !fx.elem._customAnimate ) return $_fx_step_default(fx);
      fx.elem[fx.prop] = fx.now;
    };

    // global window resize handler for all plugin instances
    $(window).on('resize', debounce(function(evt){
        for(var h in handlers)
        {
            if ( !Object.prototype.hasOwnProperty.call(handlers, h) || ("function" !== typeof handlers[h]) ) continue;
            handlers[h](evt);
        }
    }, 100));

    $.noflashCore = noflashCore;
    $.fn.noflash = function(options){
        this.each(function(){
            var o = $(this);
            if ( !o.data('noflash') )
                o.data('noflash', new NoFlash(o, options));
        });
        return this;
    };
}

})(jQuery);