const stars = document.querySelectorAll('.priority');
const message = document.getElementById('label-priority');

stars.forEach(star => {
    star.addEventListener('mouseover', function() {
        //show the message of the priority
        const hasActive = Array.from(stars).some(s => s.classList.contains('active'));
        if(!hasActive){
            message.textContent = this.getAttribute('data-message');
            message.classList.add('show');
        }
        

        // on the start and all the previous
        stars.forEach(s => s.classList.remove('hover'));
        this.classList.add('hover');
        let previousSibling = this.previousElementSibling;
        while (previousSibling) {
            previousSibling.classList.add('hover');
            previousSibling = previousSibling.previousElementSibling;
        }
    });

    star.addEventListener('mouseleave', function() {
        stars.forEach(s => s.classList.remove('hover'));

        const hasActive = Array.from(stars).some(s => s.classList.contains('active'));
        if(!hasActive){
            message.textContent = "Prioridad *";
        }
    });

    star.addEventListener('click', function() {
        // if the start was on, off all the previous
        if (this.classList.contains('active')) {
            stars.forEach(s => s.classList.remove('active'));
            message.textContent = "Prioridad";
            document.getElementById('priority').value=0;
        } else {
            // clean the class 'active' of all the starts
            stars.forEach(s => s.classList.remove('active'));

            // add rge class 'active' to the start that was select and all the previous (to the left)
            this.classList.add('active');
            let previousSibling = this.nextElementSibling;
            while (previousSibling) {
                previousSibling.classList.add('active');
                previousSibling = previousSibling.nextElementSibling;
            }

            // show the message
            let priorityValue=this.getAttribute('data-message')
            message.textContent = `Calificaste con ${this.getAttribute('data-value')} estrellas (${priorityValue})`;
            message.classList.add('show');

            //update the input of priority 
            document.getElementById('priority').value=priorityValue;
        }
    });
});