/**


 * Slideshow plugin for jQuery


 *


 * v0.10.0

 *

 * Extended and Updated 2011 based on a similar plugin by Fred Wu..


 *  Dual licensed under the MIT and GPL licenses:


 *   http://www.opensource.org/licenses/mit-license.php


 *   http://www.gnu.org/licenses/gpl.html


 */





/**


 * Configuration options:


 *


 * pauseSeconds  float    number of seconds between each photo to be displayed after transition


 * fadeSeconds     float    number of seconds for the fading transition


 * width         integer  width of the slideshow, in pixels


 * height        integer  height of the slideshow, in pixels


 * caption       boolean  display photo caption?


 * cssClass      string   name of the CSS class, defaults to 'slideshowlite'
 
 
 * pagination    string pagination type "controls", "pages", "none" etc..
 
 
 * fx           string indicating fx transition type "fade", "slide" etc
 
 
 * controlsText  object of Strings containing the text values for the controls buttons etc..
 
 
 * aData        array  optional array of objects containing image source and alt properties (instead of DOM image insertion)

     For documentation look at non-minified version or in the site.
    Note this software is provided AS IS with no warranty. It is provided free of charge for u to use.
    Author: Nikos M.
    Site: http://nikos-web-development.netai.net

*/





(function($){


    $.fn.slideshow = function(options){


        


        var defaults = {

            pauseSeconds: 7,

            fadeSeconds: 0.5,

            width: 500,

            height: 500,

            caption: true,

            cssClass: 'slideshowlite',
            
            pagination: 'controls',
            
            fx: "fade",
            
            controlsText: null,
            
            aData:null


        };


        


        var options = $.extend(defaults, options);


        // ----------------------------------------


        // slideshow objects and variables


        // ----------------------------------------

        var target = this;
        var maxw=0, maxh=0;

        if (options.aData)
        {
            var ind=0;
            options.aData.each(function(){
            $(target).append("<img src='"+options.aData[ind].src+"' alt='"+options.aData[ind].alt+"' width='"+options.aData[ind].width+"' height='"+options.aData[ind].height+"'/>");
            if (options.aData[ind].width && options.aData[ind].width>maxw) maxw=options.aData[ind].width;
            if (options.aData[ind].height && options.aData[ind].height>maxh) maxh=options.aData[ind].height;
            ind++;
            });
        }



        var items  = $(target).children("a");


        var instance;


        


        // ----------------------------------------


        // some mandontory styling


        // ----------------------------------------


        
        var maxwid=0;
        var maxhei=0;
        $(this).append("<div class='images'></div>");
        $(this).children("img").each(function(){
            $(target).children(".images").append($(this).clone());
            if ($(this).width()>maxwid) maxwid=$(this).width();
            if ($(this).height()>maxhei) maxhei=$(this).height();
            $(this).remove();
            });
        
        if ( ! $(this).hasClass(options.cssClass)) $(this).addClass(options.cssClass);

        if (maxw>0 && maxh>0) $(this).children(".images").css({"width":maxw+"px", "height":maxh+"px"});
        //if (maxw>0 && maxh>0) $(this).children(".images").css({"height":maxh+"px"});

        
/*

        $(this).css({


            width: options.width + "px",


            height: options.height + "px"


        });
        
*/      


        


        // ----------------------------------------


        // create anchor links to make the structure simpler for manupilation


        // ----------------------------------------


        

        $(this).children(".images").children("img").wrap(document.createElement("a"));


        $(this).children(".images").children("a").attr("target", "blank");


        


        // ----------------------------------------


        // add item sequence markups


        // ----------------------------------------


        


        var i = 1;

        $(this).children(".images").children("a").each(function(){

            $(this).attr("rel", i++);
            $(this).css({position:"absolute",left:0.5*(maxwid-$(this).width())+"px",top:0.5*(maxhei-$(this).height())+"px"});
        });


        


        // ----------------------------------------


        // create pagination and caption


        // ----------------------------------------

        var pagination;
        var caption;
        options.pagination=options.pagination.toLowerCase();
        options.fx=options.fx.toLowerCase();
        
        if (options.pagination=="pages" || options.pagination=="controls")
        {
        $(this).append("<div class='controls'></div>");
        pagination = $(this).children(".controls");
        }
        /*
        if (options.pagination=="pages")
        {
        $(this).append("<div class='pages'></div>");
        pagination = $(this).children(".pages");
        }
        else if (options.pagination=="controls")
        {
        $(this).append("<div class='controls'></div>");
        pagination=$(this).children(".controls");
        }
        */
        if (options.caption)
        {
        $(this).append("<div class='caption'></div>");
        caption = $(this).children(".caption");
        }
        
        var i = 1;


        var j = 0;
        
        var playpause=true;

        if (options.pagination=="controls")
        {
        pagination.append("<a href='javascript:void(0)' class='first'></a><a href='javascript:void(0)' class='prev'></a><a href='javascript:void(0)' class='pause'></a><a href='javascript:void(0)' class='play'></a><a href='javascript:void(0)' class='next'></a><a href='javascript:void(0)' class='last'></a>");
        if (options.controlsText!=null)
        {
            pagination.children('.first').text(options.controlsText["first"]);
            pagination.children('.last').text(options.controlsText["last"]);
            pagination.children('.prev').text(options.controlsText["prev"]);
            pagination.children('.next').text(options.controlsText["next"]);
            pagination.children('.play').text(options.controlsText["pause"]);
            pagination.children('.pause').text(options.controlsText["play"]);
        }
        }
        else if (options.pagination=="pages")
        $(this).children(".images").children("a").each(function(){
            pagination.append("<a href='javascript:void(0)' class='bullet'>" + i++ + "</a>");
        });
        
        if (options.caption)
        $(this).children(".images").children("a").each(function(){
            caption.append("<span>" + $("#" + $(target).attr("id") + " img:nth(" + j++ + ")").attr("alt") + "</span>");
        });
        
        if (options.pagination=="controls" || options.pagination=="pages")
        pagination.fadeTo(0, 0.8);
        
        if (options.caption)
        {
        caption.fadeTo(0, 0.6);

        caption.hide();
        }
        


        // ----------------------------------------


        // shortcuts


        // ----------------------------------------


        

        var firstItem   = $(target).children(".images").children("a:first");


        var lastItem    = $(target).children(".images").children("a:last");


        var currentItem = firstItem;
        var nextItem=currentItem;
        
        var manual=false;

        


        // ----------------------------------------


        // pagination highlight


        // ----------------------------------------


        


        var paginationHighlight = function(sequence){


            pagination.children("a").removeClass("current");


            pagination.children("a:nth(" + sequence + ")").addClass("current");

        }


        


        // ----------------------------------------


        // caption


        // ----------------------------------------


        


        var showCaption = function(sequence){


            caption.show();


            caption.children("span").hide();


            caption.children("span:nth(" + sequence + ")").stop(true,true).fadeIn(1000*options.fadeSeconds/2);


        };


        var startplay=function(){
                playpause=true;
                if (options.pagination=="controls")
                {
                pagination.children(".play").show();
                pagination.children(".pause").hide();
                }
        };


        // ----------------------------------------


        // slideshow logic


        // ----------------------------------------


        


        var makeSlideshow = function(){


            


        // pagination click

            if (options.pagination=="pages")
            {
            pagination.children("a").click(function(){


                if ( ! $(this).hasClass("current"))


                {


                    // select the current item after the pagination click


                    nextItem = $(target).children(".images").children("a:nth(" + ($(this).text()-1) + ")");





                    //nextItem.show();


                    startSlideshow();


                }


            });         

            }
            else if (options.pagination=="controls")
            {

            pagination.children(".play").click(function(){
                playpause=false;
                pagination.children(".play").hide();
                pagination.children(".pause").show();
                clearTimeout(instance);
            });
            
            pagination.children(".pause").click(function(){
                startplay();
                startSlideshow();
            });
            
            pagination.children(".first").click(function(){
                // select the current item after the pagination click
                startplay();
                nextItem = firstItem;
                //nextItem.show();
                manual=true;
                startSlideshow();
            });
            
            pagination.children(".last").click(function(){
                // select the current item after the pagination click
                startplay();
                nextItem = lastItem;
                //nextItem.show();
                manual=true;
                startSlideshow();
            });
            
            pagination.children(".prev").click(function(){
                startplay();
                if (currentItem.children("img").attr("src") == firstItem.children("img").attr("src"))
                {
                    nextItem = lastItem;
                }
                else
                {
                    nextItem=currentItem.prev();
                }
                //nextItem.show();
                manual=true;
                startSlideshow();
            });

            pagination.children(".next").click(function(){
                startplay();
                if (currentItem.children("img").attr("src") == lastItem.children("img").attr("src"))
                    nextItem = firstItem;
                else
                    nextItem = currentItem.next();
                //nextItem.show();
                manual=true;
                startSlideshow();
            });
            }
        };
        
        
        continueSlideshow=function(){
            // show caption



            


            // show the current slide

            if (playpause /*&& !manual*/)
            {
                $(target).children(".images").children("a").stop(true,true).hide();
                currentItem.show().css("z-index",0);
                
                if (options.caption == true)
                {
                    showCaption(nextItem.attr("rel")-1);
                }
                
                if (options.pagination=="pages")
                {
                    // pagination highlight
                    paginationHighlight(nextItem.attr("rel")-1);
                }
                
                var thisItem=currentItem;
                nextItem.css("z-index",1);
                var thatItem=nextItem;
                if (options.fx=="slide")
                nextItem.stop(true,true).slideDown(options.fadeSeconds*1000, function(){
                //nextItem.fadeIn(options.fadeSeconds*1000, function(){
                    //$(target).children("a").hide();
                    //if (!manual)
                    //{
                        $(this).show().css("z-index", 1);
                        if (thatItem!=thisItem)
                            thisItem.hide();
                    //}
                    //if (manual)  {$(this).hide();}
                    manual=false;
                instance = setTimeout(continueSlideshow, (options.pauseSeconds+options.fadeSeconds)*1000);
                });
                else
                nextItem.stop(true,true).fadeIn(options.fadeSeconds*1000, function(){
                    //$(target).children("a").hide();
                    //if (!manual)
                    //{
                        $(this).show().css("z-index", 1);
                        if (thatItem!=thisItem)
                            thisItem.hide();
                    //}
                    //if (manual)  {$(this).hide();}
                    manual=false;
                instance = setTimeout(continueSlideshow, (options.pauseSeconds+options.fadeSeconds)*1000);
                });
                currentItem=nextItem;
                // prepare for the next slide
                // determines the next item (or we need to rewind to the first item?)
                if (currentItem.children("img").attr("src") == lastItem.children("img").attr("src"))
                {
                    nextItem = firstItem;
                }
                else
                {
                    nextItem = currentItem.next();
                }
            }
            //else clearInterval(instance);
            manual=false;
        };

        var startSlideshow = function(){
            startplay();
            clearTimeout(instance);
            continueSlideshow();
        };


        


        // ----------------------------------------


        // start the slideshow!


        // ----------------------------------------


        


        makeSlideshow();
        startSlideshow();


    };


})(jQuery);