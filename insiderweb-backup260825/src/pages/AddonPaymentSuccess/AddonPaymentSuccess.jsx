// ─────────────────────────────────────────────────────────────
// Add-On – PaymentSuccess (4-dígitos)
// ─────────────────────────────────────────────────────────────
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { CheckCircle, Download } from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

/* ENV */
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

/* styles rápidos */
const css = {
  page:   { minHeight:"100vh", padding:"2rem", background:"#f8f8f8", fontFamily:"Inter, sans-serif" },
  card:   { background:"#fff", borderRadius:12, padding:"2rem", maxWidth:720, margin:"0 auto", boxShadow:"0 2px 6px rgba(0,0,0,.1)" },
  icon:   { width:80, height:80, background:"#dcfce7", borderRadius:"50%", display:"flex", justifyContent:"center", alignItems:"center",
            margin:"0 auto 1rem" },
  h1:     { textAlign:"center", fontSize:"1.75rem", fontWeight:700, marginBottom:".5rem" },
  p:      { textAlign:"center", color:"#555", marginBottom:"1.25rem" },
  grid:   { display:"grid", gap:"1rem", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", marginTop:"1.5rem" },
  row:    { display:"flex", justifyContent:"space-between" },
  label:  { fontWeight:600, color:"#444" },
  val:    { color:"#333" },
  btnBox: { display:"flex", gap:"1rem", justifyContent:"center", marginTop:"1.5rem", flexWrap:"wrap" },
  btn:    { padding:"0.7rem 1.4rem", borderRadius:8, border:"none", cursor:"pointer", fontWeight:600, display:"flex",gap:6,alignItems:"center" },
  primary:{ background:"#2563eb", color:"#fff" },
  dark:   { background:"#000",   color:"#fff" },
  loading:{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"60vh" },
};

export default function AddonPaymentSuccess() {
  const [search] = useSearchParams();
  const codeId   = search.get("codeId");
  const [data, setData] = useState(null);
  const [load, setLoad] = useState(true);
  const [err,  setErr ] = useState(null);
  const [pdf,  setPdf ] = useState(false);

  /* fetch */
  useEffect(() => {
    if (!codeId) { setErr("Code id missing"); setLoad(false); return;}
    (async()=>{
      try{
        const {data}=await axios.get(`${API_URL}/upsell-code/${codeId}`); // endpoint GET único
        setData(data);
      }catch(e){
        setErr(e.response?.data?.error||"Error retrieving info");
      }finally{ setLoad(false);}
    })();
  },[codeId]);

  /* pdf */
  const downloadPDF = async()=>{
    if(!data) return;
    setPdf(true);
    const el=document.getElementById("ticket");
    const canvas=await html2canvas(el,{scale:2});
    const pdfDoc=new jsPDF();
    const img=canvas.toDataURL("image/jpeg",0.95);
    const w=210;
    const h=(canvas.height* w)/canvas.width;
    pdfDoc.addImage(img,"JPEG",0,0,w,h);
    pdfDoc.save(`addon-${codeId}.pdf`);
    setPdf(false);
  };

  if(load) return(<div style={css.loading}><h2>Loading…</h2></div>);
  if(err)  return(<div style={css.loading}><h2>{err}</h2><Link to="/">Home</Link></div>);
  if(!data) return null;

  return(
    <div style={css.page}>
      <div style={css.card}>
        <div style={css.icon}><CheckCircle size={48} color="#16a34a"/></div>
        <h1 style={css.h1}>Add-On payment confirmed!</h1>
        <p style={css.p}>Your service has been added to your booking.</p>

        <div style={css.grid}>
          <div style={css.row}><span style={css.label}>Service</span><span style={css.val}>{data.addOn.name}</span></div>
          <div style={css.row}><span style={css.label}>Room</span><span style={css.val}>{data.roomNumber}</span></div>
          <div style={css.row}><span style={css.label}>Total</span><span style={css.val}>${data.total}</span></div>
          <div style={css.row}><span style={css.label}>Code</span><span style={css.val}>{data.code}</span></div>
        </div>

        <div style={css.btnBox}>
          <Link to="/" style={{...css.btn,...css.primary}}>Go to Home</Link>
          <button onClick={downloadPDF} disabled={pdf} style={{...css.btn,...css.dark}}>
            {pdf? "Creating…" : <><Download size={16}/> PDF</>}
          </button>
        </div>
      </div>

      {/* invisible ticket */}
      <div style={{position:"absolute",left:"-9999px",top:"0"}}>
        <div id="ticket" style={{width:"600px",padding:"24px",background:"#fff"}}>
          <h2>Upsell Confirmation</h2>
          <p>Service: {data.addOn.name}</p>
          <p>Room: {data.roomNumber}</p>
          <p>Total: ${data.total}</p>
          <p>Code: {data.code}</p>
          <small>Thank you for choosing Insider.</small>
        </div>
      </div>
    </div>
  );
}
