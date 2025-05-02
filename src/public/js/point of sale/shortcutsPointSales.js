document.addEventListener('keydown', function (event) {
    const id_branch = document.getElementById('id_branch_menu').value;
    const id_company = document.getElementById('id_company_menu').value;
    const id_user = document.getElementById('id_employee_menu').value;
    console.log(event.key);
    if (event.ctrlKey) {
        if (event.key === 'Enter') {
            openPopSales();
        } else {
            switch (event.key.toLowerCase()) {
                case 'c':
                    select_customer(id_company);
                    break;
                case 'u':
                    // agregarVariasUnidades();
                    break;
                case '+':
                    // incrementarCantidad();
                    break;
                case '-':
                    // decrementarCantidad();
                    break;
                case 'd':
                    eliminarProducto();
                    break;
                case 'p':
                    print_the_last_ticket();
                    break;
                case 's':
                    create_a_sale_in_wait();
                    break;
                case 'r':
                    show_popup_cart_in_wait();
                    break;
                case 'm':
                    cash_movement(id_user, id_branch);
                    break;
            }
        }
    }
});
