var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);


  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    // console.log(list, arr);
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

//********************
//********************
// TO DO ITEM CHANGE
//********************
//********************

// when we click on the text of the li - the p, really - a text area will appear in lieu of the p designated and the text area will come into focus
$(".list-group").on("click", "p", function () {
  var text = $(this)
    .text()
    .trim()

  var textInput = $("<textarea>")
    .addClass("form-control")
    .val(text);

  // as it states, we're going to replace this element (in our case the p) with a <textinput> upon click
  $(this).replaceWith(textInput);

  // the trigger("focus") will put the element into focus
  textInput.trigger("focus")
  
  console.log(text)
})

// the element is on focus now... if we click on anythings else, it will blur, and when that happens the following function takes place
$(".list-group").on("blur", "textarea", function(){
  // vet the current value and text of the textarea
  var text = $(this)
    // we're going to get the value for the li and return it
    .val()
    // and to that content or value, we'll take away spaces
    .trim();

  // get the id attribute of the parent's ul
  var status = $(this)
    // go up to the closest class called list-group, which will be the ul
    .closest(".list-group")
    // find the id (list-toDo)
    .attr("id")
    // take away the "list-" part and replace it with nothing and we get just "toDo"
    .replace("list-", "");

  // we're going to figure out where we are in the order of the ul
  var index = $(this)
    // find the closest ancestor with the id "list-group-item" which happens to be this element
    .closest(".list-group-item")
    // and find the index number
    .index();

  // we're going to save to our local storage like this
  // tasks[status][index].text = text;

  saveTasks();

  // Now we want to return the textarea back to normal paragraph by recreating the p
  var taskP = $("<p>")
    .addClass("m-1")
    .text(text)
  // and replacing the textarea with newly created p
  $(this).replaceWith(taskP);
});

//********************
//********************
// DATE CHANGE
//********************
//********************

//editing the date when clicked: target the parent with the class name, tell it which element you're going to work with and make a function that edits the date
$(".list-group").on("click", "span", function(){
  // get current text by first creating a variable that holds that information
  var date = $(this)
    .text()
    .trim()
  // create new input element
  var dateInput = $("<input>")
    .attr("type", "text")
    .addClass("form-control")
    .val(date);
  // swap out elements
  $(this).replaceWith(dateInput);
  // automatically focus on new element
  dateInput.trigger("focus");
});

// value of due date was changed
$(".list-group").on("blur", "input[type='text']", function() {
  // get current text
  var date = $(this)
    .val()
    .trim();

  // get the parent ul's id attribute so that we put the date back into the same bucket, it could be toDO or whathaveya
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");

  // get the task's position in the list of other li elements so that the list can stay organized when we put it back into the array
  var index = $(this)
    .closest(".list-group-item")
    .index();

  // update task in array and re-save to localstorage
  // tasks[status][index].date = date;
  saveTasks();

  // recreate span element with bootstrap classes
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);

  // replace input with span element
  $(this).replaceWith(taskSpan);
});


// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// make items sortable
$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function(event) {
    // console.log("activate", this);
  },
  deactivate: function(event) {
    // console.log("deactivate", this);
  },
  over: function(event) {
    // console.log("over", event.target);
  },
  out: function(event) {
    // console.log("out", event.target);
  },
  update: function(event) {
    // array to store the task data in
    var tempArr = [];

    // loop over current set of children in sortable list
    $(this).children().each(function () {
      var text = $(this)
        .find("p")
        .text()
        .trim();

      var date = $(this)
        .find("span")
        .text()
        .trim();

      // add task data to the temp array as an object
      tempArr.push({
        text: text,
        date: date
      });
    });

    // trim down list's ID to match object property
    var arrName = $(this)
      .attr("id")
      .replace("list-", "");

    // update array on tasks object and save
    tasks[arrName] = tempArr;
    saveTasks();
    console.log(tempArr);
  }
});

//trash the block on the bottom drop
$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function(event, ui) {
    console.log("drop");
    ui.draggable.remove();
  },
  over: function(event, ui) {
    console.log("over");
  },
  out: function(event, ui) {
    console.log("out");
  }
});

// load tasks for the first time
loadTasks();


