const bycrypt = require('bcryptjs')


function hashPass(password){
    const salt = bycrypt.genSaltSync();  ///generates the salt and sync with password 
    return bycrypt.hashSync(password,salt)


}

function logPas(password,hash){
    return bycrypt.compareSync(password,hash)  // compare the sync
}

module.exports ={ hashPass,logPas}