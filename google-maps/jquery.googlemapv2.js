/*
	jQuery Plugin to setup Google Maps V2 in divs
	
	version: 0.3.0
	You need to include the Google Map API Version 2 js script by obtaining a key from Google, it's free
	
	new in version 0.3.0
	-- added support for kml overlays
	
	Parameters are
	
	aData		:		Array of javascript objects that include the coordinates of each destination along with title and caption texts/html
						eg: [
								{lat:35.54567, lng:22.34546, title:"Foo City", info:"<img src='foocity.jpg' />"},
								{lat:35.5455, lng:22.345353, title:"Foo City2", info:"<div><a href='http://foocity2.com'><img src='foocity2.jpg' /></a></div>"}
							]
							lat is latitude, lng is longitude
	center		:		Object contating the coordinates for the center of the map long with zoom eg:
						{lat: 35.6788, long: 12.35566, zoom: 10}
	
	kml			:		kml(xml) file url for overlay
	
	You can access the map object of each element through jquery data map property
	
	eg: var map=$("mydiv").data("map");
	
	For documentation look at non-minified version or in the site.
	Note this software is provided AS IS with no warranty. It is provided free of charge for u to use.
	Author: Nikos M.
	Site: http://nikos-web-development.netai.net

*/




(function($){
	$.fn.googlemapv2 = function(goptions){
		var defaults = {
			aData: null,
			center: null,
			kml:null
		};

		var options = $.extend(defaults, goptions);
		
		var setgooglemap=function(what)
		{
			if (GBrowserIsCompatible()) 
			{ 
			var map = new GMap2(what[0]); 
			var point=new GLatLng(options.center.lat,options.center.lng);
			map.setCenter(point, options.center.zoom); 
			map.setMapType(G_NORMAL_MAP);
			map.setUIToDefault(); 
			what.data({map:map});
			for (var i=0;i<options.aData.length;i++)
			{
			// add markers, infos to map
				map.addOverlay(createMarker(i)); 			
			}
			if (options.kml!=null)
			{
				var gx = new GGeoXml(options.kml);
				map.addOverlay(gx);	
			}
			}			
			function createMarker(index) 
			{ 
				var pointm=new GLatLng(options.aData[index].lat,options.aData[index].lng);
				var titlem=options.aData[index].title
				var markeroptions={title:titlem};
				var marker = new GMarker(pointm,markeroptions);	
				marker.value = index;			
				GEvent.addListener(marker, "click", function(){ 
					marker.openInfoWindowHtml(options.aData[index].info);
				});
				return marker; 
			}
		};
		
		this.each(function(){setgooglemap($(this));});
		return this;
	}	
})(jQuery);