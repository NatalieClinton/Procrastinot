// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Todo: create a function to generate a unique task id
function generateTaskId() {
    return nextId++;
}

// Todo: create a function to create a task card
function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = 'card mb-3';

    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';

    const title = document.createElement('h5');
    title.className = 'card-title';
    title.textContent = task.title;

    const description = document.createElement('p');
    description.className = 'card-text';
    description.textContent = task.description;

    const dueDate = document.createElement('p');
    dueDate.className = 'card-text';
    dueDate.textContent = 'Due Date: ' + task.dueDate;

    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn btn-danger';
    deleteButton.textContent = 'Delete';
    deleteButton.dataset.taskId = task.id; // Set the task ID as a data attribute
    deleteButton.addEventListener('click', handleDeleteTask);

    // Color coding based on due date
    const currentDate = dayjs();
    const taskDueDate = dayjs(task.dueDate);
    if (taskDueDate.isBefore(currentDate, 'day')) {
        card.classList.add('bg-danger');
    } else if (taskDueDate.diff(currentDate, 'day') <= 1) {
        card.classList.add('bg-warning');
    }

    cardBody.appendChild(title);
    cardBody.appendChild(description);
    cardBody.appendChild(dueDate);
    cardBody.appendChild(deleteButton);

    card.appendChild(cardBody);

    return card;
}

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
    // Clears existing task cards
    document.getElementById('todo-cards').innerHTML = '';
    document.getElementById('in-progress-cards').innerHTML = '';
    document.getElementById('done-cards').innerHTML = '';

    // Render task cards for each task in the task list
    taskList.forEach(task => {
        const taskCard = createTaskCard(task);

        // Make the task card draggable
        $(taskCard).draggable({
            revert: 'invalid',
            zIndex: 100,
            start: function() {
                $(this).addClass('dragging');
            },
            stop: function() {
                $(this).removeClass('dragging');
            }
        });

        // Append the task card to the appropriate swim lane
        if (task.status === 'todo') {
            document.getElementById('todo-cards').appendChild(taskCard);
        } else if (task.status === 'in-progress') {
            document.getElementById('in-progress-cards').appendChild(taskCard);
        } else if (task.status === 'done') {
            document.getElementById('done-cards').appendChild(taskCard);
        }
    });
}

// Todo: create a function to handle adding a new task
function handleAddTask(event) {
    event.preventDefault();

    // Retrieve task details from the form
    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDescription').value;
    const dueDate = document.getElementById('taskDueDate').value;

    // Generate a unique task ID
    const taskId = generateTaskId();

    // Create a new task object
    const newTask = {
        id: taskId,
        title: title,
        description: description,
        dueDate: dueDate,
        status: 'todo'
    };

    // Add the new task to the task list
    taskList.push(newTask);

    // Save the updated task list and nextId to localStorage
    localStorage.setItem('tasks', JSON.stringify(taskList));
    localStorage.setItem('nextId', nextId);

    // Render the updated task list
    renderTaskList();

    // Hide the modal
    $('#formModal').modal('hide');
}

// Todo: create a function to handle deleting a task
function handleDeleteTask(event) {
    const taskId = event.target.dataset.taskId;

    // Find the index of the task with the given ID
    const taskIndex = taskList.findIndex(task => task.id === taskId);

    // Remove the task from the task list
    if (taskIndex !== -1) {
        taskList.splice(taskIndex, 1);

        // Save the updated task list to localStorage
        localStorage.setItem('tasks', JSON.stringify(taskList));

        // Render the updated task list
        renderTaskList();
    }
}

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
    const taskId = ui.draggable.find('button').data('taskId');
    const newStatus = event.target.id; 

    // Find the task in the task list
    const taskIndex = taskList.findIndex(task => task.id === taskId);

    if (taskIndex !== -1) {
        // Update the status of the task
        taskList[taskIndex].status = newStatus;

        // Save the updated task list to localStorage
        localStorage.setItem('tasks', JSON.stringify(taskList));

        // Render the updated task list
        renderTaskList();
    }
}

// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
    // Render the task list
    renderTaskList();

    // Add event listener for the form submission
    $('#taskForm').submit(handleAddTask);

    // Make swim lanes droppable
    $('.lane').droppable({
        drop: handleDrop
    });

    // Make the due date field a date picker
    $('#taskDueDate').datepicker();
});