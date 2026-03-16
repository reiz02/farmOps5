import React, { useEffect, useState } from "react";

const ReportsPage = () => {

const [amount,setAmount] = useState("");
const [submissions,setSubmissions] = useState([]);


// =======================
// FETCH SUBMISSION HISTORY
// =======================

const fetchSubmissions = async () => {
 try{

  const res = await fetch("http://localhost:5000/api/earnings");
  const data = await res.json();

  setSubmissions(data);

 }catch(err){
  console.log("Fetch error:",err);
 }
};


// =======================
// LOAD DATA ON PAGE LOAD
// =======================

useEffect(()=>{
 fetchSubmissions();
},[]);


// =======================
// SUBMIT EARNINGS
// =======================

const handleSubmit = async (e) => {
 e.preventDefault();

 try{

  await fetch("http://localhost:5000/api/earnings",{
   method:"POST",
   headers:{
    "Content-Type":"application/json"
   },
   body:JSON.stringify({
    employeeEmail:"admin@farmops.com",
    amount:amount
   })
  });

  setAmount("");

  // 🔥 RELOAD HISTORY
  fetchSubmissions();

 }catch(err){
  console.log(err);
 }

};


// =======================
// DELETE
// =======================

const deleteRecord = async (id) =>{

 await fetch(`http://localhost:5000/api/earnings/${id}`,{
  method:"DELETE"
 });

 fetchSubmissions();
};


// =======================
// UI
// =======================

return(

<div>

<h2>Submit Monthly Earnings</h2>

<form onSubmit={handleSubmit}>
<input
 type="number"
 placeholder="Daily Income"
 value={amount}
 onChange={(e)=>setAmount(e.target.value)}
 required
/>

<button type="submit">Submit</button>

</form>


<h3>Submission History</h3>

<table>

<thead>
<tr>
<th>Employee</th>
<th>Amount</th>
<th>Date</th>
<th>Actions</th>
</tr>
</thead>

<tbody>

{submissions.map((item)=>(
<tr key={item._id}>

<td>{item.employeeEmail}</td>

<td>₱{item.amount}</td>

<td>{new Date(item.createdAt).toLocaleDateString()}</td>

<td>
<button onClick={()=>deleteRecord(item._id)}>
Delete
</button>
</td>

</tr>
))}

</tbody>

</table>

</div>

);

};

export default ReportsPage;