// ─────────────────────────────────────────────────────────────
// Add-On – PaymentFailure
// ─────────────────────────────────────────────────────────────
"use client";

import { Link, useSearchParams } from "react-router-dom";

const box = {
  maxWidth:420,margin:"80px auto",padding:"2rem",
  border:"1px solid #fecaca",borderRadius:12,
  background:"#fef2f2",textAlign:"center",fontFamily:"Inter,sans-serif"
};
const h1 ={fontSize:"1.5rem",fontWeight:700,color:"#b91c1c",marginBottom:"1rem"};
const p  ={color:"#444",marginBottom:"1.5rem"};
const btn={padding:".7rem 1.4rem",background:"#2563eb",color:"#fff",borderRadius:8,textDecoration:"none",
           fontWeight:600};

export default function AddonPaymentFailure(){
  const [search]=useSearchParams();
  const codeId = search.get("codeId") || "";

  return(
    <div style={{padding:"1rem"}}>
      <div style={box}>
        <h1 style={h1}>Payment failed</h1>
        <p style={p}>We couldn’t process the payment for your add-on {codeId && `(code #${codeId})`}.  
           You can try again or pick another payment method.</p>
        <Link to="/" style={btn}>Back to Home</Link>
      </div>
    </div>
  );
}
