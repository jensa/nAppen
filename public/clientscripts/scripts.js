$(".eventblock").click(function(){
		$(this).css ("background", "#F400A1");
		window.location=$(this).find("a").attr("href");
		return false;
});

$(".eventblock").load (function (){
	$(this).css ("background", "");
});

$('#objectiveRow select').prop('selectedIndex', -1);

$(document).ready(function (){
	resizeCss ();
});

$(window).resize(function() {
	resizeCss ();
});
$(".imageUploadForm").submit(function(){
	var form = $(this);
	$('input[type="file"]').each(function() {
		var $this = $(this);
		if ($this.val() && $this.val() != '') 
			$.post("/uploadImage", $form.serialize());
	});
	return false;
});

function resetColors (){

}

function resizeCss (){
	var width = $(window).width();
	var inputwidth = "100%";
	var bodywidth = "90%";
	var center = false;
	if (width > 500){
		bodywidth = "300px";
		center = true;
	}
	$("body").css ("width", bodywidth);
	if (center)
		$("body").css("margin", "0px auto");
	else{
		$("body").css("margin", "0px");
		$("body").css("margin-left", "1em");
	}
	$("input").css ("width", inputwidth);
	$("select").css ("width", inputwidth);
	$("textarea").css ("width", inputwidth);
}

$(".toggle_container").hide();

$("p.trigger").click(function(){
    $(this).toggleClass("active").next().slideToggle("normal");
});