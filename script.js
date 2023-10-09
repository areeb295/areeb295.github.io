const taskForm = document.getElementById('taskForm');
const taskTable = document.getElementById('taskTable').getElementsByTagName('tbody')[0];
const taskInput = document.getElementById('myInput');
const totalTasks = document.getElementById('totalTasks');
const completedTasks = document.getElementById('completedTasks');
let editingRow = null;

taskForm.addEventListener('submit', function (event) {
    event.preventDefault();
    if (editingRow) {
        updateTask(editingRow);
        editingRow = null;
    } else {
        addTask();
    }
});

taskTable.addEventListener('click', function (event) {
    const target = event.target;

    // Check if the click was on an "Add Subtask" button
    if (target.classList.contains('add-subtask-btn')) {
        const parentRow = target.closest('tr');
        openAddSubtaskModal(parentRow);
    }
});

const subtasksMap = new Map();

function addTask() {
    const taskText = taskInput.value.trim();
    const dueDate = document.createElement('input');
    dueDate.type = 'date';
    const backgroundColor = document.getElementById('backgroundColorPicker').value;
    const textColor = document.getElementById('textColorPicker').value;

    if (taskText !== '') {
        const newRow = taskTable.insertRow(taskTable.rows.length);
        const cell1 = newRow.insertCell(0);
        const cell2 = newRow.insertCell(1);
        const cell3 = newRow.insertCell(2);
        const cell4 = newRow.insertCell(3);
        const cell5 = newRow.insertCell(4);

        newRow.style.backgroundColor = backgroundColor;
        cell1.style.color = textColor;
        taskInput.value = '';

        cell1.textContent = taskText;
        cell2.appendChild(dueDate);

        // Add subtask container and button for this specific row
        const subtaskContainer = document.createElement('div');
        subtaskContainer.classList.add('subtask-container');

        const addSubtaskButton = document.createElement('button');
        addSubtaskButton.textContent = 'Add Subtask';
        addSubtaskButton.classList.add('btn', 'btn-sm', 'btn-primary', 'ms-2');
        addSubtaskButton.addEventListener('click', function () {
            openAddSubtaskModal(newRow);
        });

        cell5.appendChild(subtaskContainer);
        cell5.appendChild(addSubtaskButton);

        const deleteButton = document.createElement('i');
        deleteButton.classList.add('fa', 'fa-trash', 'delete-icon');
        deleteButton.style.color = textColor;
        deleteButton.addEventListener('click', function () {
            deleteTask(newRow);
        });

        const editButton = document.createElement('i');
        editButton.classList.add('fa', 'fa-edit', 'edit-icon');
        editButton.style.color = textColor;
        editButton.addEventListener('click', function () {
            editTask(newRow);
        });

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.addEventListener('change', function () {
            newRow.classList.toggle('checked');
            updateTaskCount();
        });

        cell3.appendChild(checkbox);
        cell4.appendChild(editButton);
        cell4.appendChild(deleteButton);

        totalTasks.innerText = parseInt(totalTasks.innerText) + 1;
    }
}

function openAddSubtaskModal(parentRow) {
    const addSubtaskModal = new bootstrap.Modal(document.getElementById('addSubtaskModal'));
    const addSubtaskBtn = document.getElementById('addSubtaskBtn');

    // Store the parentRow as a property of the addSubtaskBtn
    addSubtaskBtn.parentRow = parentRow;

    addSubtaskBtn.addEventListener('click', function () {
        // Retrieve the parentRow from the button's property
        const parentRow = addSubtaskBtn.parentRow;

        const subtaskInput = document.getElementById('subtaskInput');
        const subtaskText = subtaskInput.value.trim();

        if (subtaskText !== '') {
            const subtaskItem = document.createElement('div');
            subtaskItem.classList.add('subtask-item');
            subtaskItem.textContent = subtaskText;

            // Apply styles to the subtask
            subtaskItem.style.backgroundColor = 'white';
            subtaskItem.style.color = 'black';
            subtaskItem.style.padding = '3px';
            subtaskItem.style.display = 'flex';
            subtaskItem.style.justifyContent = 'space-around';
            subtaskItem.style.marginBottom = '4px';

            const deleteSubtaskButton = document.createElement('i');
            deleteSubtaskButton.classList.add('fa', 'fa-trash', 'delete-icon');
            deleteSubtaskButton.style.color = 'red';
            deleteSubtaskButton.addEventListener('click', function () {
                deleteSubtask(parentRow, subtaskItem);
            });
            subtaskItem.appendChild(deleteSubtaskButton);

            // Append the subtask to the subtask container in the parent row
            const subtaskContainer = parentRow.querySelector('.subtask-container');
            subtaskContainer.appendChild(subtaskItem);

            // Update subtasksMap for this specific row
            if (subtasksMap.has(parentRow)) {
                subtasksMap.get(parentRow).push(subtaskItem);
            } else {
                subtasksMap.set(parentRow, [subtaskItem]);
            }
            subtaskInput.value = '';
            addSubtaskModal.hide();  // Close the modal upon adding a subtask
        }
    });

    addSubtaskModal.show();
}

function deleteSubtask(parentRow, subtaskItem) {
    const subtaskArray = subtasksMap.get(parentRow);
    if (subtaskArray) {
        const index = subtaskArray.indexOf(subtaskItem);
        if (index !== -1) {
            subtaskArray.splice(index, 1);
        }
    }

    // Remove the subtask from its parent
    subtaskItem.parentElement.removeChild(subtaskItem);
    updateTaskCount();
}


function deleteMainTaskWithSubtasks(mainRow) {
    taskTable.removeChild(mainRow);

    const subtaskArray = subtasksMap.get(mainRow);
    if (subtaskArray) {
        for (const subtaskRow of subtaskArray) {
            taskTable.removeChild(subtaskRow);
        }
    }
    subtasksMap.delete(mainRow);

    if (mainRow.classList.contains('checked')) {
        completedTasks.innerText = parseInt(completedTasks.innerText) - 1;
    }

    // Update the total tasks count
    updateTotalTasksCount(-1);
}

function updateTotalTasksCount(countChange) {
    const currentTotalTasks = parseInt(totalTasks.innerText);
    totalTasks.innerText = currentTotalTasks + countChange;
}



function deleteTask(row) {
    const subtaskArray = subtasksMap.get(row);
    if (subtaskArray && subtaskArray.length > 0) {
        const confirmDelete = confirm("Deleting this task will also delete its subtasks. Are you sure you want to proceed?");
        if (confirmDelete) {
            deleteMainTaskWithSubtasks(row);
        }
    } else {
        taskTable.removeChild(row);

        if (row.classList.contains('checked')) {
            completedTasks.innerText = parseInt(completedTasks.innerText) - 1;
        }
        totalTasks.innerText = parseInt(totalTasks.innerText) - 1;
    }
}


function editTask(row) {
    const taskText = row.cells[0].textContent;
    const dueDate = row.cells[1].querySelector('input[type="date"]').value;
    taskInput.value = taskText;
    row.cells[1].querySelector('input[type="date"]').value = dueDate;
    editingRow = row;

    // Clear task actions (edit, delete)
    const actionsCell = row.cells[3];
    actionsCell.innerHTML = '';

    const updateButton = document.createElement('i');
    updateButton.classList.add('fa', 'fa-edit', 'edit-icon');
    updateButton.style.color = textColor;
    updateButton.addEventListener('click', function () {
        updateTask(row);
        // Reset the button text to 'Add'
        const submitButton = taskForm.querySelector('button[type="submit"]');
        submitButton.innerText = 'Add';
    });

    const deleteButton = document.createElement('i');
    deleteButton.classList.add('fa', 'fa-trash', 'delete-icon');
    deleteButton.style.color = textColor;
    deleteButton.addEventListener('click', function () {
        deleteTask(row);
    });

    // Re-add updated task actions (edit, delete)
    actionsCell.appendChild(updateButton);
    actionsCell.appendChild(deleteButton);

    // Change the submit button text to "Update"
    const submitButton = taskForm.querySelector('button[type="submit"]');
    submitButton.innerText = 'Update';

    const backgroundColorPicker = document.getElementById('backgroundColorPicker');
    const textColorPicker = document.getElementById('textColorPicker');
    backgroundColorPicker.value = row.style.backgroundColor || '';
    textColorPicker.value = row.cells[0].style.color || '';
}

function updateTask(row) {
    const taskText = taskInput.value.trim();
    const dueDate = row.cells[1].querySelector('input[type="date"]').value;
    const backgroundColor = document.getElementById('backgroundColorPicker').value;
    const textColor = document.getElementById('textColorPicker').value;

    if (taskText !== '') {
        const cell = row.cells[0];
        cell.textContent = taskText;

        // Update due date
        const dueDateInput = row.cells[1].querySelector('input[type="date"]');
        dueDateInput.value = dueDate;

        // Update colors
        row.style.backgroundColor = backgroundColor;
        cell.style.color = textColor;

        // Clear task actions (edit, delete)
        const actionsCell = row.cells[3];
        actionsCell.innerHTML = '';

        const editButton = document.createElement('i');
        editButton.classList.add('fa', 'fa-edit', 'edit-icon');
        editButton.style.color = textColor;
        editButton.addEventListener('click', function () {
            editTask(row);
        });

        const deleteButton = document.createElement('i');
        deleteButton.classList.add('fa', 'fa-trash', 'delete-icon');
        deleteButton.style.color = textColor;
        deleteButton.addEventListener('click', function () {
            deleteTask(row);
        });

        // Re-add updated task actions (edit, delete)
        actionsCell.appendChild(editButton);
        actionsCell.appendChild(deleteButton);

        taskInput.value = '';

        // Reset the button text to 'Add'
        const submitButton = taskForm.querySelector('button[type="submit"]');
        submitButton.innerText = 'Add';
    }
}

// Make sure textColor is properly defined
const textColor = document.getElementById('textColorPicker').value;

function updateTaskCount() {
    const checkedTasks = taskTable.getElementsByClassName('checked').length;
    completedTasks.innerText = checkedTasks;

    if (checkedTasks > 0) {
        // Check if the task was just checked (not unchecked)
        if (checkedTasks > lastCheckedTaskCount) {
            // Play celebratory sound
            const celebratorySound = document.getElementById('celebratorySound');
            celebratorySound.play();

            // Add a visual effect (e.g., background color change) to the page
            document.body.classList.add('celebrate');
            setTimeout(() => {
                document.body.classList.remove('celebrate');
            }, 3000);  // Remove the effect after 3 seconds (adjust as needed)
        }
    }

    // Update the last checked task count for comparison in the next update
    lastCheckedTaskCount = checkedTasks;
}

let lastCheckedTaskCount = 0;

