

//Add comments
$('#add').on('click', function(){
	$.ajax({
	    type: "POST",
	    url: '/comment',
	    dataType: 'json',
	    data: {
	      title: $('#title').val(),
	      author: $('#author').val(),
	      created: Date.now()
	    }
  })
  .done(function(data){
	    console.log(data);
	    $('#author').val("");
	    $('#title').val("");
  });
  return false;
	
});

//Delete comments
$('.list-group-item').on('click', function(){
	var comment = $(this).text().trim();
	var commID  = $(this).parent().data('id');
	var commDel = {
		comment: comment,
		commID: commID
	}
	console.log(commDel);

	var currentURL = window.location.origin;

    $.post(currentURL + "/delete", commDel);
  
});
