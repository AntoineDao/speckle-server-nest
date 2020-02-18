export class JwtPayload {

  constructor( id: string, name: string, role: string ) {
    this._id = id;
    this.name = name;
    this.role = role
  }

  _id: string

  name: string

  role: string

}