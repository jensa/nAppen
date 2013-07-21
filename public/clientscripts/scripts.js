$("#eventblock").click(function(){
		$("#eventblock").css ("background", "#F400A1");
		window.location=$(this).find("a").attr("href"); 
		return false;
	});

$(document).ready(function (){
	resizeCss ();
});

$(window).resize(function() {
	resizeCss ();
});

function resizeCss (){
	var width = $(window).width();
	var inputwidth = "100%";
	if (width > 400)
		inputwidth = "300px";
	$("input").css ("width", inputwidth);
	$("select").css ("width", inputwidth);
	$("textarea").css ("width", inputwidth);

}