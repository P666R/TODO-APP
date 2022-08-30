// DOMContentLoaded event fires when parsing of the current page is complete 
document.addEventListener('DOMContentLoaded', main);

// main function

function main() {

    // theme switcher

    const theme = document.getElementById('theme-switcher');
    theme.addEventListener('click', () => {
        document.querySelector('body').classList.toggle('light');
        const themeIcon = theme.children[0];
        themeIcon.setAttribute('src', themeIcon.getAttribute('src') === "./assets/images/icon-sun.svg" ? "./assets/images/icon-moon.svg" : "./assets/images/icon-sun.svg");
    });

    // get alltodos and initialise listeners

    addTodo();

    // username from user input

    const nameInput = document.getElementById('name');

    const userName = localStorage.getItem("username") || '';

    nameInput.value = userName;

    nameInput.addEventListener('change', e => {
        localStorage.setItem('username', e.target.value);
    });

    // add new todos on user input

    const add = document.getElementById('add-btn');
    const txtInput = document.querySelector('.txt-input');
    add.addEventListener('click', () => {
        const item = txtInput.value.trim();
        if (item) {
            txtInput.value = ''; // clearing input field
            const todos = !localStorage.getItem("todos") ? [] : JSON.parse(localStorage.getItem("todos"));


            // creating a currentTodo object

            const currentTodo = {
                item,
                isCompleted: false
            };

            addTodo([currentTodo]);

            todos.push(currentTodo);

            // coverting todos to json format and storing it in local storage

            localStorage.setItem("todos", JSON.stringify(todos));
        }

        txtInput.focus();
    });

    // add todo on enter key event
    txtInput.addEventListener('keydown', (e) => {
        if (e.keyCode === 13) {
            add.click(); // emulating click event on enter key press
        }
    });


    // filter todo - all, active, completed

    document.querySelector('.filter').addEventListener('click', function (e) {
        const id = e.target.id; // to get id of the element that fired the event
        if (id) {
            document.querySelector('.on').classList.remove('on');
            document.getElementById(id).classList.add('on');
            document.querySelector('.todos').className = `todos ${id}`;
        }
    });

    // clear completed

    document.getElementById('clear-completed').addEventListener('click', function () {
        deleteIndexes = [];
        document.querySelectorAll('.card.checked').forEach(function (card) {
            deleteIndexes.push([...document.querySelectorAll('.todos .card')].indexOf(card));
            card.classList.add('anime');
            card.addEventListener('animationend', function (e) {
                setTimeout(function () {
                    card.remove();
                }, 100);
            });
        });
        removeManyTodo(deleteIndexes);
    });

    // dragover on .todos container

    document.querySelector(".todos").addEventListener("dragover", function (e) {
        e.preventDefault();
        if (!e.target.classList.contains("dragging") && e.target.classList.contains("card")
        ) {
            const draggingCard = document.querySelector(".dragging");
            const cards = [...this.querySelectorAll(".card")];
            const currPos = cards.indexOf(draggingCard);
            const newPos = cards.indexOf(e.target);
            if (currPos > newPos) {
                this.insertBefore(draggingCard, e.target);
            } else {
                this.insertBefore(draggingCard, e.target.nextSibling);
            }
            const todos = JSON.parse(localStorage.getItem("todos"));
            const removed = todos.splice(currPos, 1);
            todos.splice(newPos, 0, removed[0]);
            localStorage.setItem("todos", JSON.stringify(todos));
        }
    });

}


// todo function to create todos

function addTodo(todos = JSON.parse(localStorage.getItem("todos"))) {
    if (!todos) {
        return null;
    }

    const itemsLeft = document.getElementById('items-left');

    // create cards

    todos.forEach((todo) => {

        const card = document.createElement("li");
        const cbContainer = document.createElement('div');
        const cbInput = document.createElement('input');
        const check = document.createElement('span');

        const item = document.createElement("input");
        const buttonEdit = document.createElement('button');
        const buttonDel = document.createElement('button');

        buttonEdit.innerHTML = 'Edit';
        buttonDel.innerHTML = 'Delete';

        // add classes

        card.classList.add("card");
        cbContainer.classList.add("cb-container");
        cbInput.classList.add("cb-input");
        item.classList.add("item");
        check.classList.add("check");
        buttonEdit.classList.add('edit');
        buttonDel.classList.add('delete');

        // add attributes

        card.setAttribute("draggable", true);
        cbInput.setAttribute("type", "checkbox");
        item.setAttribute("readonly", true);
        item.setAttribute("type", "text");
        item.setAttribute("value", `${todo.item}`);

        // set todo to card item

        item.textContent = todo.item;

        // appending child elements

        cbContainer.appendChild(cbInput);
        cbContainer.appendChild(check);
        card.appendChild(cbContainer);
        card.appendChild(item);
        card.appendChild(buttonEdit);
        card.appendChild(buttonDel);

        document.querySelector('.todos').appendChild(card);

        // set class and attributes on task completion

        if (todo.isCompleted) {
            card.classList.add("checked");
            cbInput.setAttribute("checked", "checked");
        }

        // set dragstart and dragend listener to card

        card.addEventListener('dragstart', function () {
            this.classList.add('dragging');
        });

        card.addEventListener('dragend', function () {
            this.classList.remove('dragging');
        });

        // set event listener for checkbox

        cbInput.addEventListener("click", function () {
            const correspondingCard = this.parentElement.parentElement;
            const checked = this.checked;
            stateTodo(
                [...document.querySelectorAll(".todos .card")].indexOf(
                    correspondingCard
                ),
                checked
            );
            checked
                ? correspondingCard.classList.add("checked")
                : correspondingCard.classList.remove("checked");
            itemsLeft.textContent = document.querySelectorAll(
                ".todos .card:not(.checked)"
            ).length;
        });

        // set click event listener for delete button

        buttonDel.addEventListener('click', function () {
            const correspondingCard = this.parentElement;
            correspondingCard.classList.add('anime');

            // calling removeTodo()

            removeTodo([...document.querySelectorAll('.todos .card')].indexOf(correspondingCard));

            correspondingCard.addEventListener('animationend', function () {
                setTimeout(function () {
                    correspondingCard.remove();
                    itemsLeft.textContent = document.querySelectorAll(".todos .card:not(.checked)").length;
                }, 100);
            });
        });

        // set click event listener for edit button

        buttonEdit.addEventListener("click", function () {
            const correspondingCard = this.parentElement;
            const correspondingInput = this.previousSibling;
            correspondingInput.removeAttribute("readonly");
            correspondingInput.focus();
            correspondingInput.addEventListener("blur", function (e) {
                correspondingInput.setAttribute("readonly", true);
                const index = ([...document.querySelectorAll('.todos .card')].indexOf(correspondingCard));
                const todos = JSON.parse(localStorage.getItem("todos"));
                todos[index].item = e.target.value;
                localStorage.setItem("todos", JSON.stringify(todos));

            });

        });

    });

    // updating items left

    itemsLeft.textContent = document.querySelectorAll('.todos .card:not(.checked)').length;

}

// removeTodo function to remove a single todo

function removeTodo(index) {
    const todos = JSON.parse(localStorage.getItem("todos"));
    todos.splice(index, 1);
    localStorage.setItem("todos", JSON.stringify(todos));
}

// removeManyTodo function to remove a single todo

function removeManyTodo(indexes) {
    let todos = JSON.parse(localStorage.getItem("todos"));
    todos = todos.filter(function (todo, index) {
        return !indexes.includes(index);
    });
    localStorage.setItem("todos", JSON.stringify(todos));
}

// stateTodo function to update todo of completion

function stateTodo(index, completed) {
    const todos = JSON.parse(localStorage.getItem("todos"));
    todos[index].isCompleted = completed;
    localStorage.setItem("todos", JSON.stringify(todos));
}

