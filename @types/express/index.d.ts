declare namespace Express {
  export interface Request {
    auth: IUserDecoded | false
  }
}
