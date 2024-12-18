
const columns = document.querySelectorAll('.column');

columns.forEach(column => {
    new Sortable(column, {
        group: 'shared',
        animation: 150,
        onEnd: function (evt) {
            const destinationColumn = evt.to;
            const idStage = destinationColumn.getAttribute('idStage');

            const tanks = evt.item;
            tanks.setAttribute('stageId', idStage)
        }
    });
});

document.getElementById('addColumnBtn').addEventListener('click', function () {
    const columnName = document.getElementById('newColumnName').value.trim();
    if (columnName) {
        const newColumn = document.createElement('div');
        newColumn.classList.add('column');
        newColumn.innerHTML = `<h3>${columnName}</h3><hr>`;
        document.querySelector('.board').appendChild(newColumn);

        new Sortable(newColumn, {
            group: 'shared',
            animation: 150,
            onEnd: function (evt) {
                console.log('Elemento movido:', evt.item);
            }
        });

        document.getElementById('newColumnName').value = '';
    }
});

document.addEventListener('DOMContentLoaded', function () {
    // get all the class of .dropdown-btn en title-column
    document.querySelectorAll('.dropdown-btn').forEach(button => {
        button.addEventListener('click', function (e) {
            e.stopPropagation();
            this.classList.toggle('active');
            const dropdown = this.nextElementSibling;
            if (dropdown) {
                dropdown.classList.toggle('active');
            }
        });
    });

    //get all the class of .edit-btn en .task
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', function (e) {
            e.stopPropagation();
            this.classList.toggle('active');
            const dropdown = this.nextElementSibling;
            if (dropdown) {
                dropdown.classList.toggle('active');
            }
        });
    });

    // Close any dropdown when clicking outside
    document.addEventListener('click', function () {
        document.querySelectorAll('.dropdown-btn.active, .edit-btn.active').forEach(button => {
            button.classList.remove('active');
            const dropdown = button.nextElementSibling;
            if (dropdown) {
                dropdown.classList.remove('active');
            }
        });
    });
});