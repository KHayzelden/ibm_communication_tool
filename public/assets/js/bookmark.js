$("#editbutton").click(function(){
 
    console.log($(this).html());
    if($(this).html() == "Edit")
    {
        $("#editbutton").text("Cancel");
        $("#saveButton").attr("style","display:inline-block");
        $("#editCaption").attr("style","display:block");
        $("#deleteButton").attr("style","display:inline-block");
        $(".input").attr("style","display:inline-block");
    }
    else if($(this).html() == "Cancel")
    {
        $("#editbutton").text("Edit");
        $("#saveButton").attr("style","display:none");
        $("#editCaption").attr("style","display:none");
        $("#deleteButton").attr("style","display:none");
        $(".input").attr("style","display:none");
    }
    
    });

    $("#editbutton1").click(function(){
 
        console.log($(this).html());
        if($(this).html() == "Edit")
        {
            $("#editbutton1").text("Cancel")       
            $("#saveButton1").attr("style","display:inline-block");
            $("#editCaption1").attr("style","display:block");
            $("#deleteButton1").attr("style","display:inline-block");
            $(".input1").attr("style","display:inline-block");
        }
        else if($(this).html() == "Cancel")
        {
            $("#editbutton1").text("Edit");
            $("#saveButton1").attr("style","display:none");
            $("#editCaption1").attr("style","display:none");
            $("#deleteButton1").attr("style","display:none");
            $(".input1").attr("style","display:none");
        }
        
        });

$('#deleteButton').click(function(){
        copyText($(this));
})
        
$('#deleteButton1').click(function(){
        copyText($(this));
})
  
$('#clearButton').click(function(){

    if($(this).html() == "Clear History")
    {
        swal({
            title: "Are you sure?",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
    .then((willDelete) => {
            if (willDelete) 
            {
                swal("Successfully Deleted!", {
                icon: "success",
                });
            } else 
            {
                swal("Your History is safe!");
            }
        });
    }
    else if($(this).html() == "Back")
    {
        $("#showdate").text("History");
        $("#clearButton").text("Clear History");
    }
 
})

$('#logout').click(function(){
    swal({
            title: "Do you want to log out??",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
    .then((willDelete) => {
            if (willDelete) 
            {
                window.location.href = "/logout";
                swal("Logging out", {
                icon: "success",
                });
            }
        });
})

function copyText(butt){
    swal({
            title: "Are you sure?",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
    .then((willDelete) => {
            if (willDelete) 
            {
                butt.parent().next().children().each(function(){
                    if($(this).children(":first-child").children(":checked").length) {
                        $(this).remove();
                        $("#editbutton").text("Edit");
                        $("#saveButton").attr("style","visibility:hidden");
                        $("#deleteButton").attr("style","visibility:hidden");
                        $(".input-group-addon").attr("style","visibility:hidden");
                    }
                });
                swal("Successfully Deleted!", {
                icon: "success",
                });
            } else 
            {
                swal("Your Bookmark is safe!");
            }
        });
}

$('#list-example1').click(function(){
    var html = '<span class="input-group-addon" style = "visibility:hidden"><input type="checkbox"></span></a>';
    inText($(this), html);
})

$('#list-example2').click(function(){
    var html = '<span class="input1 input-group-addon" style = "visibility:hidden"><input type="checkbox"></span></a>';
    inText($(this), html);
})

$('#savebookmark1').click(function(){
   
    if($("#inputsentence").val() != '')
    {
        console.log($("#inputsentence").val());

        var db = new PouchDB('bookmarkSentence');
        db.post({
            user: $("#userEmail").val(),
            sentence: $("#inputsentence").val(), 
        }, function (err, res) {
            if (err) {
            throw new Error(err)
            }
            console.log(res)
        })

        $(".modal-backdrop").remove();
        $("#addSentence").hide();
       
    }
    else
    {
        $("#warninginput1").css("visibility", "visible");

        console.log("null");
    }
})

$("#inputsentence").focus(function() {
    $("#warninginput1").css("visibility", "hidden");
})

$('#savebookmark2').click(function(){
   
    if($("#inputsearch").val() != '')
    {
        console.log($("#inputsearch").val());
        var dbsearch = new PouchDB('bookmarkSearch');
        dbsearch.post({
            user: $("#userEmail").val(),
            sentence: $("#inputsearch").val(), 
        }, function (err, res) {
            if (err) {
            throw new Error(err)
            }
            console.log(res)
        })
        $(".modal-backdrop").remove();
        $("#addSearch").hide();
    }
    else
    {
        $("#warninginput2").css("visibility", "visible");

        console.log("null");
    }
})

$("#inputsearch").focus(function() {
    $("#warninginput2").css("visibility", "hidden");
})

function inText(butt, html){
    swal("Enter new sentences:", {
        content: "input",
        buttons: true,
        dangerMode: true,
      })
      .then((value) => {
        if(value)
        {
            console.log(value);
            html = '<a class="list-group-item  d-flex justify-content-between align-items-center draggable="true"" href="#list-item-1">' + value + html;
            var source = $( html );
            bindDrag(source);
            source.appendTo( butt.parent().prev() ); 
            swal("Successfully Added");
        }
       
      });
}

var iosDragDropShim = { enableEnterLeave: true } 
var dragElement = null;
function bindDrag(source) {
    source.on('dragstart', function (event) {
        console.log(1);
        dragElement = $(this);
        $(this).css("background-color","#f8f8f8");
    });

    source.on('dragend', function (event) {
        console.log(2);
        $(event.target).css("background-color","#fff");
        event.preventDefault();
    });

    source.on('dragenter', function (event) {
        if($(this).prev().is(dragElement)){
            dragElement.insertAfter($(this)); 
        } else if($(this).next().is(dragElement)){
            dragElement.insertBefore($(this)); 
        }
    });
}
document.ondragover = function(e){e.preventDefault();}        
document.ondrop = function(e){e.preventDefault();}

var source = $('.list-group-item');
source.each(function(){
    bindDrag($(this));
});