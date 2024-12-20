const database = require('../database');
const rolFree=0

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

async function get_the_new_message_of_the_user(id_user) {
    //we will search the company of the user 
    const queryText = `
    SELECT dc.*, pd.name AS department_name, pc.name AS category_name
    FROM "Kitchen".dishes_and_combos dc
    LEFT JOIN "Kitchen".product_department pd ON dc.id_product_department = pd.id
    LEFT JOIN "Kitchen".product_category pc ON dc.id_product_category = pc.id
    WHERE dc.id_companies = $1
`;
    var values = [id];
    const result = await database.query(queryText, values);

    return result.rows;
}

async function send_new_message(chatId, userId, message){
    //we will see if can save the new message in the database
    const idMessage=await save_a_new_message_in_the_database(chatId, userId, message);
    if(idMessage){
        //if we can save the new message, we will save the status in the database
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
    create_new_chat
};