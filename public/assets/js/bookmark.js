var isEditSearch = false;
var isEditSentence = false;

/**
 * Enter into Edit mode
 * @param #editbutton stands for search keyword
 * @param #editbutton1 stands for search sentence
 */
$("#editbutton").click(function(){
    
    if($(this).html() == "Edit")
    {
        $("#editbutton").text("Cancel");
        $("#addbutton").attr("style","display:none"); 
        $("#editCaption").attr("style","display:block");
        $("#deleteButton").attr("style","display:inline-block");
        $(".input").attr("style","display:inline-block");
        isEditSearch = true;
    }
    else if($(this).html() == "Cancel")
    {
        $("#editbutton").text("Edit");
        $("#addbutton").attr("style","display:inline-block"); 
        $("#editCaption").attr("style","display:none");
        $("#deleteButton").attr("style","display:none");
        $(".input").attr("style","display:none");
        isCheck($(this));
        isEditSearch = false;
    } 
});

$("#editbutton1").click(function(){

    if($(this).html() == "Edit")
    {
        $("#editbutton1").text("Cancel")       
        $("#addbutton1").attr("style","display:none"); 
        $("#editCaption1").attr("style","display:block");
        $("#deleteButton1").attr("style","display:inline-block");
        $(".input1").attr("style","display:inline-block");
        isEditSentence = true;
    }
    else if($(this).html() == "Cancel")
    {
        $("#editbutton1").text("Edit");
        $("#addbutton1").attr("style","display:inline-block");
        $("#editCaption1").attr("style","display:none");
        $("#deleteButton1").attr("style","display:none");
        $(".input1").attr("style","display:none");
      
        isCheck($(this));
        isEditSentence = false;
    }     
});

/**
 * Remove the checked status when back to normal mode
 * @param {*} butt parent class
 */
function isCheck(butt){
    butt.parent().next().children().children().each(function(){
            
        if($(this).find(":checked").length){
            $(this).find(":checked").prop( "checked", false);
        }
    });
}

/**
 * Check whether at least one checkbox is selected
 * @param {*} butt parent class
 */
function isSelect(butt){
    var value = false;
    butt.parent().next().children().children().each(function(){
        if($(this).find(":checked").length){ 
              value = true;
        }
    });
    return value;   
}

/**
 * Delete the bookmark search/sentenes
 */
$('#deleteButton').click(function(){
    if(isSelect($(this))){
        copyText($(this));
    }
    else{
        swal({
            text: "Please select an term",
        });
    }
})
        
$('#deleteButton1').click(function(){
    if(isSelect($(this))){
        copyText($(this));
    }
    else{
        swal({
            text: "Please select an term",
        });
    }
})
  
/**
 * Delete the item
 * @param {*} butt parent class
 */
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

/* Update content */
$('#list-sentences').on("click", "a", function(){
    if(isEditSentence){
        inText(this.id, this.rev, $(this).children(':first').text(), 'sentence');
    }
});

$('#list-searches').on("click", "a", function(){
    if(isEditSearch){
        inText(this.id, this.rev, $(this).children(':first').text(), 'search');
    }
});

/**
 * Create the local and remote database and start sync
 */
var syncHandler;
var dbName = document.getElementById("hiddendb").innerText;
var db = new PouchDB('ibm-communication');  //create the database
var remoteDb= new PouchDB("https://dcb15006-0d75-415e-9bc5-5451e89fb37d-bluemix:40517ab4561f6d35f5425fb308cefab7417325da9f6ebb630f534a75ad7a5775@dcb15006-0d75-415e-9bc5-5451e89fb37d-bluemix.cloudantnosqldb.appdomain.cloud/"+dbName);
syncHandler = db.sync(remoteDb, {
    live: true,
    retry: true
});
syncHandler.on('complete', function (info) {
    // replication was canceled!
    console.log("Sync cancelled");
    db.destroy();
    console.log("DB Destroyed");
});
syncHandler.on('error', function (err) {
    // boo, we hit an error!
    console.log("Error",err);
});

/**
 * Listen the database changes for deleting/inserting/updating
 */
db.changes({ 
    live: true,
    include_docs: true
}).on('change', function (change) {
    if(change.deleted){
        var deleteItem = $('#'+change.id);
        if(deleteItem.length) {
            deleteItem.remove();
        }
    } else if($('#'+change.id).length) {
        $('#'+change.id).children(':first').text(change.doc.term);
        $('#'+change.id).attr('rev', change.doc._rev);
    }
    else {
        var boxType = null;
        var listType = null;
        if(change.doc.type == "sentence"){
            boxType = "input1";
            listType = "#list-sentences";
        }
        else if(change.doc.type == "search"){
            boxType = "input";
            listType = "#list-searches";
        }
        var HTMLString = 
            '<a id="' + change.doc._id + '" rev="' + change.doc._rev + '" class="list-group-item' +
            ' d-flex justify-content-between align-items-center" href="#list-item-1">' +
                '<div>' + change.doc.term + '</div>' +
                '<span class="'+ boxType +'" style = "display:none">' +
                    '<div class="form-check">' + 
                        '<label class="form-check-label">' + 
                            '<input class="form-check-input" type="checkbox" value=""\>' + 
                            '<span class="form-check-sign"></span>' + 
                        '</label>' +
                    '</div>' +
                '</span>' +
            '</a>';
        var item = $.parseHTML(HTMLString);
        $(listType).append(item);
        $('#'+change.id).find('label').click(function(e){
            e.stopPropagation();
        });
       
    }
});

/**
 * Add new searches/sentences
 * Time out works for focus on input 
 */
$('#addbutton1').click(function(){
    $("#addSentence").modal('toggle');
    setTimeout(function(){
        $("#inputsentence").focus();
    }, 490)

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
        });
        $("#addSentence").modal('toggle');
        $("#inputsentence").val("");
    }
    else
    {
        $("#warninginput1").css("visibility", "visible");
    }
})

$("#inputsentence").focus(function() {
    $("#warninginput1").css("visibility", "hidden");
})

$('#addbutton').click(function(){

    $("#addSearch").modal('toggle');
    //$("#inputsearch").focus();
    setTimeout(function(){
        $("#inputsearch").focus();
    }, 490)
});

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
        $("#addSearch").modal('toggle');
        $("#inputsearch").val("");
    }
    else
    {
        $("#warninginput2").css("visibility", "visible");
    }
})

$("#inputsearch").focus(function() {
    $("#warninginput2").css("visibility", "hidden");
})

/**
 * Update the content in popup window
 * @param {String} getId obtain the current id
 * @param {String} rev obtain the current rev
 * @param {String} text obtain the text bound with the id
 * @param {String} type obtain the update information type: search/sentence
 */
function inText(getId, rev, text,type){
    swal("Enter what you want to update:", {
        content: {
            element: "input",
            attributes: {
              value: text,
            },
          },
        buttons: true,
        dangerMode: true,
   
      })
      .then((value) => {
        if(value)
        {
            db.get(getId).then(function(doc) {
                return db.put({
                  _id:  getId,
                  user: $("#userEmail").val(),
                  _rev: rev,
                  term: value,
                  type: type,
                });
              }).then(function(response) {
                // handle response
              }).catch(function (err) {
                console.log(err);
              });
            
            swal("Successfully Added");
        }
      });
}
