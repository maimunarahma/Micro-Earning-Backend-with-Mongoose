
export  interface Workers{
      user: String,
      status: "pending" |"approved"| "rejected"

}

export interface task{
  
    title: String,
    payableAmount: Number,
    buyer: String,
    requiredWorker: Number,
     details: String,
     workers: Workers[]
}