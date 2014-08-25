/*
	jQuery Plugin to setup Google Maps (API version 3) in divs
	
	version: 0.3.0
	You need to include the Google Map API js script by obtaining a key from Google, it's free
	
	new in version 0.3.0
	-- added support for kml file overlays
	
	Parameters are
	
	aData		:		Array of javascript objects that include the coordinates of each destination along with title and caption texts/html
						eg: [
								{lat:35.54567, lng:22.34546, title:"Foo City", info:"<img src='foocity.jpg' />"},
								{lat:35.5455, lng:22.345353, title:"Foo City2", info:"<div><a href='http://foocity2.com'><img src='foocity2.jpg' /></a></div>"}
							]
							lat is latitude, lng is longitude
	center		:		Object contating the coordinates for the center of the map long with zoom eg:
						{lat: 35.6788, long: 12.35566, zoom: 10}
						
	type		:     type of google map, eg google.maps.MapTypeId.ROADMAP etc
						default = google.maps.MapTypeId.ROADMAP
						
						basic map types are :
						google.maps.MapTypeId.ROADMAP displays the default road map view
						google.maps.MapTypeId.SATELLITE displays Google Earth satellite images
						google.maps.MapTypeId.HYBRID displays a mixture of normal and satellite views
						google.maps.MapTypeId.TERRAIN displays a physical map based on terrain information. 

	kml			:		kml (xml) url for overlay
	
	You can access the map object of each element through jquery data map property
	
	eg: var map=$("mydiv").data("map"); note : replace "mydiv" with your div selector
	
	For documentation look at non-minified version or in the site.
	Note this software is provided AS IS with no warranty. It is provided free of charge for u to use.
	Author: Nikos M.
	Site: http://nikos-web-development.netai.net

*/




(function($){
	$.fn.googlemapv3 = function(goptions){
		var defaults = {
			aData: null,
			center: null,
			type:google.maps.MapTypeId.ROADMAP,
			kml:null
		};

		var options = $.extend(defaults, goptions);
		
		var setgooglemap=function(what)
		{
			var mapOptions = {
			  zoom: options.center.zoom,
			  center: new google.maps.LatLng(options.center.lat,options.center.lng),
			  mapTypeId: options.type
			}

			var map = new google.maps.Map(what[0], mapOptions);
			what.data({map:map});
			for (var i=0;i<options.aData.length;i++)
			{
			// add markers, infos to map
				createMarker(i); 			
			}
			if (options.kml!=null)
			{
				var georssLayer = new google.maps.KmlLayer(options.kml);
				georssLayer.setMap(map);
			}
			function createMarker(index,mapi) 
			{ 
				var infowindow = new google.maps.InfoWindow({
					content: options.aData[index].info
				});

				var marker = new google.maps.Marker({
					position: new google.maps.LatLng(options.aData[index].lat,options.aData[index].lng),
					map: map,
					title: options.aData[index].title
				});
				google.maps.event.addListener(marker, 'click', function() {
				  infowindow.open(map,marker);
				});
			}
		};
		
		this.each(function(){setgooglemap($(this));});
		//setgooglemap();
		return this;
	}	
})(jQuery);