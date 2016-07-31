$(document).ready(function(){
  var api_root = 'http://localhost:3001/api/'
  var temp_api_token = '8f383b545bda4fc2115a'
  var api_token = sessionStorage.getItem('api_token')

  function setApiToken(api_token){
    sessionStorage.setItem('api_token', api_token)
  }

  $(document.body).on('click', '#signup-button', function(ev){
    $('#signup-modal .login-signup').empty()
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
      alert('Sign-up Successful!')
    }).error(function(data){
      console.log(data.responseJSON.email)
      $('.errors').empty()
      $('.errors').prepend(`<h6 class="error-messages"> email ${data.responseJSON.email} </h6>`)
    })

  })

  $(document.body).on('click', '#login-button', function(ev){
    $('#signup-modal .login-signup').empty()
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
    $('#login-button').html('Log Out')
    $('#login-button').attr('id', 'logout-button')
  }).error(function(data){
    $('.errors').empty()
    $('.errors').prepend(`<h6 class="error-messages">${data.responseJSON.error} </h6>`)
  })

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
    if (api_token.length > 1){
      $('#login-button').html('Log Out')
      $('#login-button').attr('id', 'logout-button')
    }
    $.getJSON(api_root + 'notes', function(data){
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
  $('#show-note-modal').modal('hide')
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
