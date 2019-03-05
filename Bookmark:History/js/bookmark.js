$("#editbutton").click(function(){
 
    console.log($(this).html());
    if($(this).html() == "Edit")
    {
        $("#editbutton").text("Cancel");
        $("#saveButton").attr("style","visibility:visible");
        $("#deleteButton").attr("style","visibility:visible");
        $(".input-group-addon").attr("style","visibility:visible");
    }
    else if($(this).html() == "Cancel")
    {
        $("#editbutton").text("Edit");
        $("#saveButton").attr("style","visibility:hidden");
        $("#deleteButton").attr("style","visibility:hidden");
        $(".input-group-addon").attr("style","visibility:hidden");
    }
    
    });

    $("#editbutton1").click(function(){
 
        console.log($(this).html());
        if($(this).html() == "Edit")
        {
            $("#editbutton1").text("Cancel");
            $("#saveButton1").attr("style","visibility:visible");
            $("#deleteButton1").attr("style","visibility:visible");
            $(".input1").attr("style","visibility:visible");
        }
        else if($(this).html() == "Cancel")
        {
            $("#editbutton1").text("Edit");
            $("#saveButton1").attr("style","visibility:hidden");
            $("#deleteButton1").attr("style","visibility:hidden");
            $(".input1").attr("style","visibility:hidden");
        }
        
        });

$('#deleteButton').click(function(){
        copyText($(this));
})
        
$('#deleteButton1').click(function(){
        copyText($(this));
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
document.ondragover = function(e){e.preventDefault();}          // 必须设置dragover阻止默认事件
document.ondrop = function(e){e.preventDefault();}

var source = $('.list-group-item');
source.each(function(){
    bindDrag($(this));
});

