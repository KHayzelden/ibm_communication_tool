$("#editbutton").click(function(){
    console.log($(this).html());
    if($(this).html() == "Edit")
    {
        $("#editbutton").text("Cancel");
        //$("#saveButton").attr("style","display:inline-block");
        $("#addbutton").attr("style","display:none"); 
        $("#editCaption").attr("style","display:block");
        $("#deleteButton").attr("style","display:inline-block");
        $(".input").attr("style","display:inline-block");
    }
    else if($(this).html() == "Cancel")
    {
        $("#editbutton").text("Edit");
        //$("#saveButton").attr("style","display:none");
        $("#addbutton").attr("style","display:inline-block"); 
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
        $("#addbutton1").attr("style","display:none"); 
        //$("#saveButton1").attr("style","display:inline-block");
        $("#editCaption1").attr("style","display:block");
        $("#deleteButton1").attr("style","display:inline-block");
        $(".input1").attr("style","display:inline-block");
    }
    else if($(this).html() == "Cancel")
    {
        $("#editbutton1").text("Edit");
        $("#addbutton1").attr("style","display:inline-block");
        //$("#saveButton1").attr("style","display:none");
        $("#editCaption1").attr("style","display:none");
        $("#deleteButton1").attr("style","display:none");
        $(".input1").attr("style","display:none");
    }     
});

$('#deleteButton').click(function(){
    copyText($(this));
});
        
$('#deleteButton1').click(function(){
    copyText($(this));
});
  
/* delete the item */
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
                butt.parent().next().children().children().each(function(){
                    if($(this).find(":checked").length) {
                        var node = $(this).closest("a");
                        db.remove({"_id":node.attr("id"), "_rev":node.attr("rev")});
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

/* update content */
$('#list-sentences').click(function(){
    var html = '<span class="input-group-addon" style = "visibility:hidden"><input type="checkbox"></span></a>';
    inText($(this), html);
});

$('#list-searches').on("click", "a", function(){
    //var html = '<span class="input1 input-group-addon" style = "visibility:hidden"><input type="checkbox"></span></a>';
    //inText($(this), html);
    
    console.log("Clicked on " + this.id);
    inText(this.id, this.rev);
});


var db = new PouchDB('ibm-communication');  //create the database
db.changes({ 
    live: true,
    include_docs: true
}).on('change', function (change) {
    if(change.deleted){
        var deleteItem = $('#'+change.id);
        if(deleteItem.length) {
            deleteItem.remove();
        }
    } else {
        if(change.doc.type == 'sentence')
        {
            console.log(change.doc._rev);
            var HTMLString = 
            '<a id="' + change.doc._id + '" rev="' + change.doc._rev + '" class="list-group-item' +
            ' d-flex justify-content-between align-items-center draggable="true" " href="#list-item-1">' +
                change.doc.term + 
                '<span class="input1" style = "display:none">' +
                    '<div class="form-check">' + 
                        '<label class="form-check-label">' + 
                            '<input class="form-check-input" type="checkbox" value=""\>' + 
                            '<span class="form-check-sign"></span>' + 
                        '</label>' +
                    '</div>' +
                '</span>' +
            '</a>';

            var HTMLString1 = '<a id="' + change.doc._id + '" rev="' + change.doc._rev + '"class="list-group-item' +  'd-flex justify-content-between align-items-center" >' +change.doc.term+  '</a>'
            console.log(HTMLString);
            console.log(HTMLString1);
            $('#list-sentences').append($.parseHTML(HTMLString));
            $('#list-sentences1').append($.parseHTML(HTMLString));

        }
        else if(change.doc.type == 'search')
        {
            var HTMLString = 
            '<a id="' + change.doc._id + '" rev="' + change.doc._rev + '" class="list-group-item' +
            ' d-flex justify-content-between align-items-center draggable="true" " href="#list-item-1">' +
                change.doc.term + 
                '<span class="input" style = "display:none">' +
                    '<div class="form-check">' + 
                        '<label class="form-check-label">' + 
                            '<input class="form-check-input" type="checkbox" value=""\>' + 
                            '<span class="form-check-sign"></span>' + 
                        '</label>' +
                    '</div>' +
                '</span>' +
            '</a>';
            $('#list-searches').append($.parseHTML(HTMLString));
            $('#list-searches1').append($.parseHTML(HTMLString));
        }
    }
});

$('#savebookmark1').click(function(){
   
    if($("#inputsentence").val() != '')
    {
        db.post({
            user: $("#userEmail").val(),
            term: $("#inputsentence").val(), 
            type: 'sentence',
        }, function (err, res) {
            if (err) {
                throw new Error(err)
            }
        })
        $(".modal-backdrop").remove();
        $("#addSentence").hide();
    }
    else
    {
        $("#warninginput1").css("visibility", "visible");
    }
})

$("#inputsentence").focus(function() {
    $("#warninginput1").css("visibility", "hidden");
})

$('#savebookmark2').click(function(){
   
    if($("#inputsearch").val() != '')
    {
        db.post({
            user: $("#userEmail").val(),
            term: $("#inputsearch").val(), 
            type: 'search',
        }, function (err, res) {
            if (err) {
            throw new Error(err)
            }
        })
        $(".modal-backdrop").remove();
        $("#addSearch").hide();
    }
    else
    {
        $("#warninginput2").css("visibility", "visible");
    }
})

$("#inputsearch").focus(function() {
    $("#warninginput2").css("visibility", "hidden");
})

/* Update content */
function inText(getId, rev){
    swal("Enter what you want to update:", {
        content: "input",
        buttons: true,
        dangerMode: true,
      })
      .then((value) => {
        if(value)
        {
            console.log(value);
           /* db.put({
                _id:  getId,
                user: $("#userEmail").val(),
                _rev: rev,
                search: value, 
                type: 'search',
            }, function (err, res) {
                if (err) {
                throw new Error(err)
                }
            })*/

            db.get(getId).then(function(doc) {
                return db.put({
                  _id:  getId,
                  user: $("#userEmail").val(),
                  _rev: rev,
                  term: value,
                  type: 'search',
                });
              }).then(function(response) {
                // handle response
              }).catch(function (err) {
                console.log(err);
              });
            /*html = '<a class="list-group-item  d-flex justify-content-between align-items-center draggable="true"" href="#list-item-1">' + value + html;
            var source = $( html );
            bindDrag(source);
            source.appendTo( butt.parent().prev() ); */
            swal("Successfully Added");
        }
      });
}

var iosDragDropShim = { enableEnterLeave: true } 
var dragElement = null;
function bindDrag(source) {
    source.on('dragstart', function (event) {
        dragElement = $(this);
        $(this).css("background-color","#f8f8f8");
    });

    source.on('dragend', function (event) {
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

/* log out jump function*/
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



