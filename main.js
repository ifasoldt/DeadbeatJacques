$(document).ready(function(){
  var api_root = 'http://localhost:3001/api/'
  var temp_api_token = '8f383b545bda4fc2115a'



  function titleBuilder(punctuation, tagName){
    $('#title').empty()
    console.log(tagName)
    var titleSource = $("#title-handlebars").html()
    var titleTemplate = Handlebars.compile(titleSource)
    var titleContext = {punctuation: punctuation, tagName: tagName}
    var titleHtml = titleTemplate(titleContext)
    $('#title').prepend(titleHtml)
  }


  function fetchNotes(){
    $.getJSON(api_root + 'notes', function(data){
      console.log(data.notes)
      $.each(data.notes, function(i, note){
      noteBuilder(note)
    })
  })
  titleBuilder()
}

function noteBodySplit(body){
  lines = body.split(/\n+/)
  return lines
}

function noteBuilder(note, prepend){
  var noteSource = $("#note-handlebars").html()
  var noteTemplate = Handlebars.compile(noteSource)

  var noteContext = {noteTitle: note.title, noteBody: noteBodySplit(note.body), noteTags:note.tags, noteCreatedAt: moment(note.created_at, "YYYYMMDD").fromNow()}
  var noteHtml = noteTemplate(noteContext)
  if(prepend === true){
    $("#body").prepend(noteHtml)
  }
  else {
    $("#body").prepend(noteHtml)
    }
}

$(document.body).on('click', '.tag-link', function(ev){
  ev.preventDefault()
  $.getJSON(api_root + `tags/${ev.target.getAttribute('data-name')}`, function(data){
    titleBuilder(":", data.tag.name )
    $("#body").empty()
    $.each(data.notes, function(i, note){
      noteBuilder(note)
    })
  })
})

$(document.body).on('click', '#post-note', function(ev){
  ev.preventDefault()
  $.post(api_root + "notes",
  {
   api_token: temp_api_token,
   title: $('#note-title').val(),
   body: $('#note-body').val(),
   tags: $('#note-tags').val()
 }).success(function(data){
  noteBuilder(data.note, true)
  $('#new-post-modal').modal('hide')
  $('#note-title').empty()
  $('#note-body').empty()
  $('#note-tags').empty()

}).error(function(data){
  $('#errors').empty()
  $.each(data.responseJSON.errors, function(i, x){$('#errors').prepend(`<h6 class="error-messages">${x.error + '. '} </h6>`)})
})
})

$('#home-button').on('click', function(ev){
  fetchNotes()
})

fetchNotes()

if ("onhashchange" in window) {
    alert("The browser supports the hashchange event!");
}



})
