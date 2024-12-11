const loadingOverlay = document.getElementById("loadingOverlay");
const messageHistoryElements = document.querySelectorAll('.message-history');

async function load_more_history(id_prospect){
    //this is for get how many history message exist in the container
    const messageHistoryCount = messageHistoryElements.length;

    //this number is the new range for get the new message
    const oldRange=messageHistoryCount;
    const newRange=oldRange+10;

    const answer = await get_answer_server(id_prospect, oldRange, newRange);
    add_new_messages(answer);

}

function add_new_messages(newMessages){
    newMessages.message.forEach((message) => {
        const messageHtml = `
            <div class="message-history">
                <div class="row">
                    <div class="col-2">
                        ${message.photo ? 
                            `<img src="${message.photo}" alt="" class="img-history-sales">` :
                            `<img src="https://cdn-icons-png.flaticon.com/512/3177/3177440.png" alt="" class="img-history-sales">`
                        }
                    </div>
                    <div class="col">
                        <label class="title-history">${message.first_name || ''} ${message.second_name || ''} ${message.last_name || ''}</label>
                        <label for="">-${timeago.format(new Date(message.history_creation_date))}</label>
                        ${message.link ? `<a href="${message.link}">${message.link}</a>` : ''}
                        <div class="container-message-history">
                            ${message.comment || ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
        // add the new message to the container
        containerHistory.insertAdjacentHTML('beforeend', messageHtml);
    });
}

async function get_answer_server(id_prospect, oldRange, newRange) {
    loadingOverlay.style.display = "flex"; // Show loading overlay
    try {
        const url = `/links/get-more-prospect`; // Corregir interpolación
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ oldRange, newRange, id_prospect }) // use a object for send data
        };

        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error en get_answer_server:', error);
        throw error;
    }finally{
        loadingOverlay.style.display = "none"; // hidden loading overlay
    }
}