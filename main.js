$(document).ready(function(){
  var api_root = 'http://localhost:3001/api/'



  function api_token(){
    return sessionStorage.getItem('api_token')
  }

  function setApiToken(api_token){
    sessionStorage.setItem('api_token', api_token)
  }

  function emptySignLogForms(){
    $('#signup-modal .login-signup').empty()
    $('#signup-modal #signup-email').val("")
    $('#signup-modal #signup-password').val("")
  }

  function loggedIn(boolean){
    if(boolean === true){
      $('#login-button').html('Log Out')
      $('#login-button').attr('id', 'logout-button')
      $('#signup-button').prop('disabled', true)
    }
    if (boolean === false){
      $('#logout-button').html('Log In')
      $('#logout-button').attr('id', 'login-button')
      $('#signup-button').prop('disabled', false)
    }
  }

  $(document.body).on('click', '#signup-button', function(ev){
    emptySignLogForms()
    $('#signup-modal .login-signup').append('Signup')
    var submit = document.querySelector("#signup-modal .login-signup")
    submit.setAttribute('id', 'signup-submit')
    $('#signup-modal').modal('show')
  }
)


  $(document.body).on('click', '#signup-submit', function(ev){
    $.post(api_root + 'users',
    {
      email: $('#signup-email').val(),
      password: $('#signup-password').val()
    }).success(function(data){
      setApiToken(data.user.api_token)
      $('#signup-modal').modal('hide')
      loggedIn(true)
      fetchNotes()
    }).error(function(data){
      console.log(data.responseJSON.email)
      $('.errors').empty()
      $('.errors').prepend(`<h6 class="error-messages"> email ${data.responseJSON.email} </h6>`)
    })

  })

  $(document.body).on('click', '#login-button', function(ev){
    emptySignLogForms()
    $('#signup-modal .login-signup').append('Login')
    var submit = document.querySelector("#signup-modal .login-signup")
    submit.setAttribute('id', 'login-submit')
    $('#signup-modal').modal('show')
  }
)

$(document.body).on('click', '#login-submit', function(ev){
  $.post(api_root + 'login',
  {
    email: $('#signup-email').val(),
    password: $('#signup-password').val()
  }).success(function(data){
    setApiToken(data.user.api_token)
    $('#signup-modal').modal('hide')
    loggedIn(true)
    fetchNotes()
  }).error(function(data){
    $('.errors').empty()
    $('.errors').prepend(`<h6 class="error-messages">${data.responseJSON.error} </h6>`)
  })
})

$(document.body).on('click', '#logout-button', function(ev){
  setApiToken(null)
  fetchNotes()
})


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
    $('#body').empty()
    console.log(api_token())
    if((api_token() === undefined) || api_token() === null){
      console.log('hi!')
      loggedIn(false)
    }
    else{
      console.log('hello!')
      loggedIn(true)
    }
    // When I first log-in, api_token() is still undefined in the console.log on line 100. Why is this? Right afterwards, it isn't.
    //  Answer: It was beacuse I originally had fetchNotes() on line 66, where it running before I'd set the api_token. By putting it on line 61, I make it run a little afterward.
    console.log(api_token())
    $.getJSON(api_root + 'notes',{api_token: api_token()}, function(data){
      console.log(data.notes)
      $.each(data.notes, function(i, note){
      noteBuilder(note)
    })
  })
  titleBuilder()
}

fetchNotes()

function noteBodySplit(body){
  lines = body.split(/\n+/)
  return lines
}

function noteBuilder(note, prepend){
  var noteSource = $("#note-handlebars").html()
  var noteTemplate = Handlebars.compile(noteSource)

  var noteContext = {noteIdTitle: note.id, noteIdEdit: note.id, noteTitle: note.title, noteBody: noteBodySplit(note.body), noteTags:note.tags, noteCreatedAt: moment(note.created_at, "YYYYMMDD").fromNow()}
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
  $('#show-note-modal').modal('hide')
  $.getJSON(api_root + `tags/${ev.target.getAttribute('data-name')}`, function(data){
    titleBuilder(":", data.tag.name )
    $("#body").empty()
    $.each(data.notes, function(i, note){
      noteBuilder(note)
    })
  })
})
function editModalOpen(data){
  $('#new-post-modal-title').html('Edit Note')
  $('#post-note').attr('id', 'edit-note-submit')
  $('#edit-note-submit').attr('data-id', data.note.id)
  $('#note-title').val(data.note.title)
  $('#note-body').val(data.note.body)
  var tagNames = []
  data.note.tags.forEach(tag => tagNames.push(tag.name))
  console.log(tagNames)
  $('#note-tags').val(tagNames.join(", "))
  $('#new-post-modal').modal('show')
}

function editModalClose(){
  $('#new-post-modal').modal('hide')
  $('#new-post-modal-title').html('New Note')
  $('#edit-note-submit').attr('id', 'post-note')
  $('#note-title').val("")
  $('#note-body').val("")
  $('#note-tags').val("")
}


$(document.body).on('click', '#edit-note', function(ev){
  $.getJSON(api_root + `notes/${ev.target.getAttribute('data-id')}`, function(data){
    console.log(data)
    editModalOpen(data)
  })
})

$(document.body).on('click', '#edit-note-submit', function(ev){
  var editNote = $.ajax({
    url: api_root + `notes/${ev.target.getAttribute('data-id')}`,
    method: "PUT",
    data:{
          api_token: api_token(),
          id: ev.target.getAttribute('data-id'),
          title: $('#note-title').val(),
          body: $('#note-body').val(),
          tags: $('#note-tags').val(),
          dataType: "json"
        },
  })

  editNote.done(function(data){
    console.log(data)
    noteBuilder(data.note, true)
    editModalClose()
    // I know that I have all the information I need to write some code that will build a note and shove it where it goes, but I'm not sure how.
  })

  editNote.fail(function(data){
    console.log('data')
    $('.errors').empty()
    $.each(data.responseJSON.errors, function(i, x){$('.errors').prepend(`<h6 class="error-messages">${x.error + '. '} </h6>`)})

  })




})





$(document.body).on('click', '#post-note', function(ev){
  ev.preventDefault()
  $.post(api_root + "notes",
  {
   api_token: api_token(),
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
  $('.errors').empty()
  $.each(data.responseJSON.errors, function(i, x){$('.errors').prepend(`<h6 class="error-messages">${x.error + '. '} </h6>`)})
})
})

$('#home-button').on('click', function(ev){
  location.hash = ""
  fetchNotes()
})



window.addEventListener("hashchange", noteModal(), false)

function noteModal(){
  $.getJSON(api_root + 'notes_count', function(data){
    }).success(function(data){
    if ((location.hash[0] === '#') && (location.hash.substring(1) <= data)){
      console.log("hi")
      $.getJSON(api_root + 'notes/' + location.hash.substring(1), function(data){
        console.log(data.note.body)
        $('#show-note-modal-content').empty()
        $('#show-note-modal-title').append(data.note.title)
        $('#show-note-modal-created').append(moment(data.note.created_at, "YYYYMMDD").fromNow())
        noteBodySplit(data.note.body).forEach(par => $('#show-note-modal-body').append(`<p>${par}</p>`))
        data.note.tags.forEach(tag => $('#show-note-modal-tags').append(`<a class="tag-link" data-name="${tag.name}"> ${tag.name} </a>`))
        $('#show-note-modal').modal('show')
      })
  }
  }
)}


})
