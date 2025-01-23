function this_user_have_this_permission(user, id_company, id_branch, permission){
    /**
     * Variables with relation of the branch and the company of the user:
     * 
     * - `user.id_company`: the branch  where job the user.
     * - `user.id_branch`: the company  where job the user.
     * 
     * Variables with relation of the branch and the company where the user would like in:
     * - `id_branch`: the branch  where the user would like in.
     * - `id_company`: the company  where the user would like in..
     * Note:
     */

    //we will see if the user is in the branch and the company where he would like in
    const belongsToCompanyAndBranch = user.id_company === id_company && user.id_branch === id_branch;

    //we will see if the user have the permission. If not have the permission we will redirect to the page of permission denied
    return belongsToCompanyAndBranch && user[permission];
}



module.exports = {
    this_user_have_this_permission
};