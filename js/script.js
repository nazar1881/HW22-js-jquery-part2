let input$ = $('#inputText');
let ul$ = $('#list');
let createBtn$ = $('#createBtn');
let requestURL = 'http://localhost:3000/todos';

class TodoList {
    constructor(el) {
        this.el = el;
        this.el.on('click', (event) => {
            let target = event.target;
            let todoId = target.closest('li').dataset.id;

            if (target.className.includes('set-status')) {
                this.changeTodoStatus(todoId);
            } else if (target.className.includes('delete-task')) {
                this.removeTodo(todoId);
                this.showTodos();
            }
        });
    }

    sendGETRequest() {
        return $.ajax({
            url: requestURL,
            dataType: "json"
        });
    }

    async showTodos() {
        try {
            let data = await this.sendGETRequest()
            this.render(data)
        } catch (error) {
            console.error('Ошибка:', error);
        }
    }

    render(data) {
        let lis = '';
        for (let item of data) {
            if (!item) {
                return;
            } else {
                lis +=
                    `<li class="not-done ${item.complited ? "done" : "not-done"}" data-id="${item.id}">${item.task}<button class="set-status">Change status</button><button class="delete-task"></button></li>`
            }
        }
        this.el.html(lis);
    }

    addTodo(todo) {
        $.ajax({
            url: requestURL,
            type: "POST",
            dataType: "json",
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                task: todo,
                complited: false,
            })
        });
       this.showTodos();
    }

    async changeTodoStatus(id) {
        try {
            let data = await this.sendGETRequest();

            for (let item of data) {
                if (item.id == id) {
                    item.complited = !item.complited;
                    let todoToChangeStatus = $(`[data-id="${id}"]`);

                    let res = $.ajax({
                        url: `${requestURL}/${id}`,
                        type: "PUT",
                        dataType: "json",
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        data: JSON.stringify({
                            task: item.task,
                            complited: item.complited,
                        })
                    });
                    res.done(this.changeTodoColor(todoToChangeStatus));
                }
            }
        } catch (error) {
            console.log(new Error(error));
        }
    }

    changeTodoColor(el) {
        el.toggleClass('done');
    }

    removeTodo(id) {
        $.ajax({
            url: `${requestURL}/${id}`,
            type: "DELETE",
            dataType: "json",
            headers: {
                'Content-Type': 'application/json'
            },
            data: null
        });
        this.showTodos();
    }
}

let todo = new TodoList(ul$);
todo.showTodos();

createBtn$.on('click', function () {
    if(input$.val()) {
        todo.addTodo(input$.val());
        todo.showTodos();
        input$.val("");
    } else {
        alert("Error, you can`t add empty task! Please enter task)")
    }
});