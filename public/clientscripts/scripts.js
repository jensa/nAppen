$("#eventblock").click(function(){
		$("#eventblock").css ("background", "#F400A1");
		window.location=$(this).find("a").attr("href"); 
		return false;
	});