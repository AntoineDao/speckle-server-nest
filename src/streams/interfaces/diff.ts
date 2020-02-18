
export interface DiffObject {

  common: Array<String>

  inA: Array<String>

  inB: Array<String>

}


export interface Diff {

  objects: DiffObject

  layers: DiffObject

}