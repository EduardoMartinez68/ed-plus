const rolFree=0
const database = require('../database');


async function this_email_exist(email){
    //we will search the company of the user 
    const queryText = `
    SELECT * FROM "Fud".users WHERE email = $1
    `;
    var values = [email];
    const result = await database.query(queryText, values);

    //return if exist or not exist
    return result.rows.length > 0;
}

//*---------------------------------------notifications----------------------------------------------------
const redis = require("redis"); //this is for save in the database redis
const { promisify } = require("util");

const client = redis.createClient({
    host: '127.0.0.1',  // Dirección de tu servidor Redis
    port: 6379,         // Puerto de Redis
    password: '',       // Si tienes contraseña
});


//promisify(client.rpush);
//promisify(client.rpush).bind(client);

/*
client.on('error', (err) => console.error('Redis Client Error', err));

client.on('ready', () => {
    console.log('Redis client connected');

    const rpushAsync = promisify(client.rpush).bind(client);
    const lrangeAsync = promisify(client.lrange).bind(client);

});
*/

async function create_notification(userEmail,userToEmail,message){
    try {
        const limit=100; 
        const key = `notifications:${userEmail}`;
        const dataMessage=create_data_notification(userEmail, userToEmail, message);

        // add the notification to the start of list
        await rpushAsync(key, dataMessage);

        // Keep only the latest `limit` notifications
        await ltrimAsync(key, -limit, -1);

        return true;
    } catch (err) {
        console.log("error in the function create_notification "+err);
        return false;
    }
}

function create_data_notification(userEmail,userToEmail,message){
    //we will make the object of the data message
    const dataMessage={
        from: userEmail,
        to: userToEmail,
        message:message,
        timestamp: Date.now(),
        status: "unread",
    }

    return JSON.stringify(dataMessage)
}

async function save_notification(){
  // chatId is the identifier unique of the (example: "user1:user2")
  // message is a object with the information (Who sent it and its content)
  const mensajeJSON = JSON.stringify(dataMessage);

  // Guardar el mensaje en una lista en Redis
  await rpushAsync(`chat:${idMessage}`, mensajeJSON);
  console.log(`Mensaje guardado en chat:${idMessage}`);
}

async function get_the_first_notification2(userEmail,cant){
    try {
        // this is the search key for search the notification of the user
        const key = `notifications:${userEmail}`;

        // get the first 'cant' elements of the list
        const notifications = await lrangeAsync(key, 0, cant - 1);

        // Return parsed notifications (if saved as JSON)
        return notifications.map((notification) => JSON.parse(notification));
    } catch (error) {
        console.error("Error al obtener las notificaciones get_the_first_notification:", error);
        return []
    }
}

function get_the_first_notification(userEmail, cant) {
    return []
}

//*---------------------------------------message----------------------------------------------------
async function get_the_new_message_of_the_user(id_user) {
    //we will search the company of the user 
    const queryText = `
    SELECT dc.*, pd.name AS department_name, pc.name AS category_name
    FROM "Kitchen".dishes_and_combos dc
    LEFT JOIN "Kitchen".product_department pd ON dc.id_product_department = pd.id
    LEFT JOIN "Kitchen".product_category pc ON dc.id_product_category = pc.id
    WHERE dc.id_companies = $1
`;
    var values = [id_user];
    const result = await database.query(queryText, values);

    return result.rows;
}

async function send_new_message(chatId, userId, message){
    //we will see if can save the new message in the database
    const idMessage=await save_a_new_message_in_the_database(chatId, userId, message);
    if(idMessage){
        return await save_status_message_in_the_database(idMessage,userId);
    }else{
        return false;
    }
}

async function save_a_new_message_in_the_database(chatId, userId, message){
    const queryText = `
        INSERT INTO "Chat".messages(
            chat_id, user_id, content
        )
        VALUES ($1, $2, $3)
        RETURNING id_message
    `;
    const values = [chatId,userId,message]; //this is for create the format of save
    
    try{
        const result = await database.query(queryText, values);
        return result.rows[0].id_message;
    } catch (error) {
        console.error('Error inserting into save_a_new_message_in_the_database database:', error);
        return false;
    }
}

async function save_status_message_in_the_database(idMessage,user_id){
    const queryText = `
        INSERT INTO "Chat".message_status(
            message_id, user_id
        )
        VALUES ($1, $2)
    `;
    const values = [idMessage,user_id]; //this is for create the format of save
    
    try{
        await database.query(queryText, values);
        return true;
    } catch (error) {
        console.error('Error inserting into save_status_message_in_the_database database:', error);
        return false;
    }
}

async function create_new_chat(user1_id, user2_id) {
    const queryTextCheck = `
        SELECT id_chat
        FROM "Chat".chats
        WHERE (user_one_id = $1 AND user_two_id = $2)
           OR (user_one_id = $2 AND user_two_id = $1)
    `;

    const queryTextInsert = `
        INSERT INTO "Chat".chats(user_one_id, user_two_id)
        VALUES ($1, $2)
        RETURNING id_chat
    `;

    try {
        // we will see if the chat exist
        const result = await database.query(queryTextCheck, [user1_id, user2_id]);

        if (result.rows.length > 0) {
            // if the chat exist, return the ID
            return result.rows[0].id_chat;
        } else {
            // if the chat not exist, we will make the chat and return the new ID
            const insertResult = await database.query(queryTextInsert, [user1_id, user2_id]);
            return insertResult.rows[0].id_chat;
        }
    } catch (error) {
        console.error('Error creating chat in the database:', error);
        return null;
    }
}



module.exports = {
    get_the_new_message_of_the_user,
    send_new_message,
    this_email_exist,
    create_new_chat,
    create_notification,
    get_the_first_notification,
};