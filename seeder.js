const UserModel=require("./Models/users");
const bcrypt=require("bcrypt");
function hashPassword(password) {
    return bcrypt.hashSync(password, 6);
  }
async function UserSeeder() {
    await UserModel.destroy({where:{}}).then(async (result) => {
        password = await hashPassword('11112222');
        UserModel.create({firstName:'Faizan',lastName:'zia',
        email:"Faizanzia472@gmail.com",isVerified:true,
        isAdmin:true,password:password
    });
    }).catch((err) => {
        console.log(err);
    });
}

UserSeeder();
