async function cash_movement(idEmployee,idBranch){
    //we will watching if the employee input a move 
    const data=await cash_movement_message();
    if(data){
        //we will see if the user input the cash and the comment 
        if(the_employee_entered_all_the_data(data)){
            await add_the_move_to_the_database(data,idEmployee,idBranch);
        }else{
            errorMessage('👁️ MUCHO OJO!!','Necesitas agregar todos los datos necesarios en el formulario');
        }
    }
}

async function cash_movement_message() {
    return new Promise((resolve, reject) => {
        Swal.fire({
            title: 'Movimiento de caja',
            html:
                '<img src="https://cdn-icons-png.flaticon.com/512/6149/6149018.png" class="img-message">' +
                '<br><label>Dinero ingresado o retirado *</label>' +
                '<input id="money" class="swal2-input" placeholder="Dinero que movere">' +
                '<br><br> <label>Motivo del movimiento de caja *</label>' +
                '<br> <textarea class="form-control" id="comment" rows="3" placeholder="Comentario"></textarea>',
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Save',
            confirmButtonColor: 'rgb(25, 135, 84)',
            cancelButtonColor: 'rgb(220, 53, 69)',
            preConfirm: () => {
                const cash = Swal.getPopup().querySelector('#money').value;
                const comment = Swal.getPopup().querySelector('#comment').value;
                const data = [cash, comment];
                resolve(data);
            },
            allowOutsideClick: () => !Swal.isLoading()
        });
    });
}

function the_employee_entered_all_the_data(data){
    //0 is the cash, 1 is the comment 
    return data[0]!='' && data[1]!='';
}

async function add_the_move_to_the_database(data,idEmployee,idBranch){
    loadingOverlay.style.display = "flex"; //this is for that the web show the load screen

    //we create the link of the server
    const idBox=0; //change the id
    const link='/fud/'+idBranch+'/'+idEmployee+'/'+idBox+'/move';

    //we will send the data to the server for add the move to the database 
    const answer=await get_answer_server(data,link);
    loadingOverlay.style.display = "none"; //this is for that the web hide the load screen

    //we will watching the answer of the serve and if can save the move in the database
    if(answer.message){
        //if we going to can add the cash move show a message of confirmation 
        regularMessage('😄 Efectivo actualizado','Se agrego el movimiento de la caja con exito');

        //now open the cahs drawer. First we will get the data of the printer
        const selectPrinter=document.getElementById('dataPrinter');
        const apiRouther="http://127.0.0.1:5656/";
        var printer = new PrinterEscPos(apiRouther);

        //her we will open the cash drawer
        printer.openCash();
        printer.openCashPartial();
    }else{
        //if we going to not can add the cash move show a message of error 
        errorMessage('👉👈 UPS!','No se pudo agregar este movimiento a la base de datos. Intentelo de nuevo.');
    }
}