document.addEventListener('keydown', function (event) {

    //first check if the menu is open
    if (event.key === "Escape") {
        //if the menu is open, close it
        const menu = document.querySelector('.menu');
        if (menu.classList.contains('active')) {
            menu.classList.remove('active');
        } else {
            open_menu(true); //if the menu is not open, open it
        }
        return;
    }

    //her we will get the id_company and id_branch from the url
    const id_company = document.getElementById('id_company_menu').value;
    const id_branch = document.getElementById('id_branch_menu').value;

    //this is the shortcut of eleventa for open module
    const simpleShortcuts = {
        'F1': '/point-sales', //point sales
        'F2': `${id_company}/${id_branch}/products-free`,
        'F3': `${id_company}/${id_branch}/supplies-free`,
        'F4': `${id_company}/${id_branch}/combos-free`,
        'F5': `${id_company}/${id_branch}/inventory`,
        'F6': `${id_company}/${id_branch}/mass-product-adjustment`,
        'F7': `${id_company}/${id_branch}/providers-free`,
        'F8': `${id_company}/${id_branch}/report-prescription`,
        'F9': `${id_company}/${id_branch}/customers-company`,
        'F10': `${id_company}/${id_branch}/employees-branch`,
        'F12': `${id_company}/${id_branch}/cashCut`
    };

    if (simpleShortcuts[event.key]) {
        event.preventDefault();
        const link = simpleShortcuts[event.key];
        nextWeb(link);
    }


    // Diccionario de atajos simples (F1, F2, etc.)
    const apps = {
        '1': '/point-sales', //point sales
        '2': `${id_company}/${id_branch}/customers-company`,
        '3': `${id_company}/${id_branch}/products-free`,
        '4': `${id_company}/${id_branch}/inventory`,
        '5': `${id_company}/${id_branch}/supplies-free`,
        '6': `${id_company}/${id_branch}/combos-free`,
        '7': `${id_company}/${id_branch}/mass-product-adjustment`,
        '8': `${id_company}/${id_branch}/report-prescription`,
        '9': `${id_company}/${id_branch}/cashCut`,
        '0': `${id_company}/${id_branch}/employees-branch`
    };

    //apps
    if (event.altKey && apps[event.key]) {
        event.preventDefault();
        const link = simpleShortcuts[event.key];
        nextWeb(link);
    }
});
