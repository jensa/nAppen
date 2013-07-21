$(".eventblock").click(function(){
		$(this).css ("background", "#F400A1");
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
	var bodywidth = "90%";
	var center = false;
	if (width > 500){
		inputwidth = "300px";
		bodywidth = "300px";
		center = true;
	}
	$("input").css ("width", inputwidth);
	$("select").css ("width", inputwidth);
	$("textarea").css ("width", inputwidth);
	$("body").css ("width", bodywidth);
	if (center)
		$("body").css("margin", "0px auto");
	else{
		$("body").css("margin", "0px");
		$("body").css("margin-left", "1em");
	}
}