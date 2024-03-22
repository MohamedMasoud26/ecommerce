import { roles } from "../../middleware/auth.js";



export const endPoint ={
    create:[roles.User],
    cancelOrder:[roles.User],
    adminUpdateOrder:[roles.Admin]
}