import React, { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard, CheckSquare, BookOpen, Target, BriefcaseBusiness, FileText,
  Plus, Search, Bell, LogOut, Menu, X, Trash2, Pencil, Check, Clock3,
  TrendingUp, Sparkles, GraduationCap, ArrowUpRight, CalendarDays, Layers3
} from "lucide-react";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import api from "./api";

const nav = [
  ["Overview", LayoutDashboard], ["Tasks", CheckSquare], ["Study planner", BookOpen],
  ["Goals", Target], ["Career", BriefcaseBusiness], ["Notes", FileText]
];
const dateLabel = new Intl.DateTimeFormat("en", { weekday:"long", month:"long", day:"numeric" }).format(new Date());
const errorText = e => e.response?.data?.message || "Something went wrong. Please try again.";

function Auth({ onAuth }) {
  const [mode,setMode] = useState("login");
  const [form,setForm] = useState({name:"",email:"",password:""});
  const [busy,setBusy] = useState(false), [error,setError] = useState("");
  const submit = async e => {
    e.preventDefault(); setBusy(true); setError("");
    try {
      const {data} = await api.post(`/auth/${mode}`,form);
      localStorage.setItem("elevate_token",data.token); onAuth(data.user);
    } catch(e) { setError(errorText(e)); } finally { setBusy(false); }
  };
  return <div className="auth-wrap"><div className="auth-card">
    <div className="brand large"><span className="brand-icon"><Sparkles size={22}/></span> elevate</div>
    <div className="eyebrow">YOUR PERSONAL GROWTH HUB</div>
    <h1>{mode==="login"?"Welcome back.":"Create your space."}</h1>
    <p className="muted">Make every day count. Your goals, learning and next big move — all in one place.</p>
    <form onSubmit={submit} className="form">
      {mode==="register" && <label>Full name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Your name"/></label>}
      <label>Email address<input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com"/></label>
      <label>Password<input required minLength="6" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="At least 6 characters"/></label>
      {error && <div className="error">{error}</div>}
      <button className="btn primary full" disabled={busy}>{busy?"Please wait…":mode==="login"?"Sign in":"Create account"}</button>
    </form>
    <p className="switch">{mode==="login"?"New to Elevate?":"Already have an account?"} <button onClick={()=>{setMode(mode==="login"?"register":"login");setError("");}}>{mode==="login"?"Create an account":"Sign in"}</button></p>
  </div><div className="auth-side"><div className="orb orb1"/><div className="orb orb2"/><div className="side-copy"><span className="pill light">A little progress adds up</span><h2>Build a life<br/>you’re proud of.</h2><p>Plan with purpose. Learn with focus. Grow at your own pace.</p><div className="quote-card"><Sparkles size={18}/><span>“Small steps every day lead to big change.”</span></div></div></div></div>;
}

function App() {
  const [user,setUser] = useState(null), [checking,setChecking] = useState(true);
  const [page,setPage] = useState("Overview"), [mobile,setMobile] = useState(false);
  const [toast,setToast] = useState(""), [refresh,setRefresh] = useState(0);
  useEffect(()=>{ const token=localStorage.getItem("elevate_token"); if(!token){setChecking(false);return;}
    api.get("/auth/me").then(r=>setUser(r.data.user)).catch(()=>localStorage.removeItem("elevate_token")).finally(()=>setChecking(false));
  },[]);
  const notify = msg => { setToast(msg); window.setTimeout(()=>setToast(""),2600); };
  const logout = () => {localStorage.removeItem("elevate_token");setUser(null);};
  if(checking) return <div className="loading"><div className="loader"/>Loading your workspace…</div>;
  if(!user) return <Auth onAuth={setUser}/>;
  const navigate = p => {setPage(p);setMobile(false);};
  return <div className="app-shell">
    <aside className={`sidebar ${mobile?"open":""}`}>
      <div className="brand"><span className="brand-icon"><Sparkles size={20}/></span> elevate</div>
      <div className="workspace-label">WORKSPACE</div>
      <nav>{nav.map(([name,Icon])=><button key={name} className={`nav-item ${page===name?"active":""}`} onClick={()=>navigate(name)}><Icon size={18}/><span>{name}</span>{name==="Tasks"&&<span className="nav-dot"/>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="upgrade"><div className="upgrade-icon"><GraduationCap size={20}/></div><b>Keep growing</b><p>Your future is built one focused day at a time.</p></div><button className="nav-item logout" onClick={logout}><LogOut size={18}/> Sign out</button></div>
    </aside>
    {mobile&&<div className="scrim" onClick={()=>setMobile(false)}/>}
    <main className="main-area">
      <header className="topbar"><button className="mobile-menu icon-btn" onClick={()=>setMobile(!mobile)}>{mobile?<X/>:<Menu/>}</button><div className="crumb">Workspace <span>/</span> <b>{page}</b></div><div className="top-actions"><span className="today"><CalendarDays size={15}/>{dateLabel}</span><div className="avatar">{user.name?.[0]?.toUpperCase()}</div><div className="user-meta"><b>{user.name}</b><small>Student account</small></div></div></header>
      <section className="page-content">
        {page==="Overview"&&<Dashboard user={user} go={navigate} notify={notify} refresh={refresh}/>}
        {page==="Tasks"&&<Tasks notify={notify} bump={()=>setRefresh(x=>x+1)}/>}
        {page==="Study planner"&&<Study notify={notify} refresh={refresh}/>}
        {page==="Goals"&&<Goals notify={notify}/>}
        {page==="Career"&&<Career notify={notify}/>}
        {page==="Notes"&&<Notes notify={notify}/>}
      </section>
    </main>
    {toast&&<div className="toast"><Check size={17}/>{toast}</div>}
  </div>;
}

function PageTitle({eyebrow,title,sub,action}) {return <div className="page-title"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{sub}</p></div>{action}</div>;}
function Dashboard({user,go,notify,refresh}) {
  const [data,setData]=useState(null),[tasks,setTasks]=useState([]);
  useEffect(()=>{Promise.all([api.get("/dashboard"),api.get("/tasks")]).then(([a,b])=>{setData(a.data);setTasks(b.data);}).catch(e=>notify(errorText(e)));},[refresh]);
  if(!data)return <div className="loading"><div className="loader"/>Loading dashboard…</div>;
  const s=data.stats, pct=s.totalTasks?Math.round(s.completedTasks/s.totalTasks*100):0;
  return <>
    <PageTitle eyebrow="YOUR OVERVIEW" title={`Good ${new Date().getHours()<12?"morning":new Date().getHours()<18?"afternoon":"evening"}, ${user.name.split(" ")[0]} ✨`} sub="A fresh day is another chance to move closer to your goals." action={<button className="btn primary" onClick={()=>go("Tasks")}><Plus size={17}/> Add a task</button>}/>
    <div className="hero-banner"><div><span className="pill light"><Sparkles size={13}/> YOUR GROWTH JOURNEY</span><h2>Make today<br/>meaningful.</h2><p>Consistency beats intensity. Keep showing up for yourself.</p><button className="btn white" onClick={()=>go("Study planner")}>Plan your day <ArrowUpRight size={16}/></button></div><div className="hero-art"><div className="hero-ring ring-a"/><div className="hero-ring ring-b"/><div className="hero-emoji">✦</div><div className="float-card"><TrendingUp size={17}/><span><b>One day at a time</b><small>You're building momentum</small></span></div></div></div>
    <div className="stats-grid">
      <Stat icon={CheckSquare} label="Tasks completed" value={`${s.completedTasks}/${s.totalTasks}`} foot={`${pct}% completion rate`} tint="purple"/>
      <Stat icon={Clock3} label="Study time" value={`${Math.floor(s.studyMinutes/60)}h ${s.studyMinutes%60}m`} foot="Last 7 days" tint="blue"/>
      <Stat icon={Target} label="Active goals" value={s.goals} foot="Keep your eye on the prize" tint="orange"/>
      <Stat icon={Layers3} label="Career skills" value={s.skills} foot={`${s.notes} notes saved`} tint="green"/>
    </div>
    <div className="content-grid"><section className="panel chart-panel"><div className="panel-head"><div><h3>Study activity</h3><p>Your focus time over the last 7 days</p></div><span className="soft-tag">THIS WEEK</span></div><div className="chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={data.weekly} barSize={24}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ececf3"/><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill:"#9292a5",fontSize:12}}/><Tooltip cursor={{fill:"#f3f0ff"}} formatter={v=>[`${v} min`,"Study time"]}/><Bar dataKey="minutes" fill="#8170ed" radius={[7,7,0,0]}/></BarChart></ResponsiveContainer></div></section>
    <section className="panel progress-panel"><div className="panel-head"><div><h3>Task progress</h3><p>Little wins add up</p></div><span className="progress-icon"><TrendingUp size={18}/></span></div><div className="progress-number">{pct}<small>%</small></div><div className="progress-track"><span style={{width:`${pct}%`}}/></div><div className="progress-foot"><span>{s.completedTasks} completed</span><span>{s.pendingTasks} remaining</span></div><button className="text-link" onClick={()=>go("Tasks")}>View all tasks <ArrowUpRight size={15}/></button></section></div>
    <div className="content-grid lower-grid"><section className="panel"><div className="panel-head"><div><h3>Recent tasks</h3><p>Stay on top of what matters</p></div><button className="text-link" onClick={()=>go("Tasks")}>See all <ArrowUpRight size={15}/></button></div>{data.recentTasks.length?data.recentTasks.map(t=><div className="task-row" key={t._id}><span className={`task-check ${t.completed?"done":""}`}>{t.completed&&<Check size={13}/>}</span><span className={t.completed?"strike":""}>{t.title}</span><span className={`priority ${t.priority.toLowerCase()}`}>{t.priority}</span></div>):<Empty text="No tasks yet. Add your first task to get started."/>}</section>
    <section className="panel"><div className="panel-head"><div><h3>Your goals</h3><p>Keep moving forward</p></div><button className="text-link" onClick={()=>go("Goals")}>View all <ArrowUpRight size={15}/></button></div>{data.goals.length?data.goals.map(g=><div className="goal-mini" key={g._id}><div className="goal-mini-head"><b>{g.title}</b><span>{Math.min(100,Math.round(g.progress/g.target*100))}%</span></div><div className="progress-track"><span style={{width:`${Math.min(100,g.progress/g.target*100)}%`}}/></div><small>{g.progress} / {g.target} {g.unit}</small></div>):<Empty text="Set a goal and give your plans direction."/>}</section></div>
  </>;
}
function Stat({icon:Icon,label,value,foot,tint}){return <div className="stat-card"><div className={`stat-icon ${tint}`}><Icon size={19}/></div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-foot">{foot}</div></div>}
function Empty({text}){return <div className="empty">{text}</div>}

function Tasks({notify,bump}) {
  const [items,setItems]=useState([]),[q,setQ]=useState(""),[show,setShow]=useState(false),[edit,setEdit]=useState(null);
  const blank={title:"",category:"Study",priority:"Medium",dueDate:""};
  const [form,setForm]=useState(blank);
  const load=()=>api.get("/tasks").then(r=>setItems(r.data)).catch(e=>notify(errorText(e)));
  useEffect(()=>{load();},[]);
  const open=item=>{setEdit(item||null);setForm(item?{...item,dueDate:item.dueDate?item.dueDate.slice(0,10):""}:blank);setShow(true);};
  const save=async e=>{e.preventDefault();try{if(edit)await api.patch(`/tasks/${edit._id}`,form);else await api.post("/tasks",form);setShow(false);load();bump();notify(edit?"Task updated":"Task created");}catch(e){notify(errorText(e));}};
  const toggle=async t=>{try{await api.patch(`/tasks/${t._id}`,{completed:!t.completed});load();bump();}catch(e){notify(errorText(e));}};
  const remove=async id=>{if(!confirm("Delete this task?"))return;try{await api.delete(`/tasks/${id}`);load();bump();notify("Task deleted");}catch(e){notify(errorText(e));}};
  const filtered=items.filter(t=>t.title.toLowerCase().includes(q.toLowerCase()));
  return <><PageTitle eyebrow="GET THINGS DONE" title="Your tasks" sub="Turn your to-dos into done-and-dusted." action={<button className="btn primary" onClick={()=>open()}><Plus size={17}/> New task</button>}/>
    <div className="toolbar"><div className="searchbox"><Search size={17}/><input placeholder="Search tasks…" value={q} onChange={e=>setQ(e.target.value)}/></div><span className="soft-tag">{items.filter(x=>!x.completed).length} pending</span></div>
    <div className="panel list-panel">{filtered.length?filtered.map(t=><div className="manage-row" key={t._id}><button className={`round-check ${t.completed?"checked":""}`} onClick={()=>toggle(t)}>{t.completed&&<Check size={14}/>}</button><div className="manage-main"><b className={t.completed?"strike":""}>{t.title}</b><small>{t.category}{t.dueDate?` · Due ${new Date(t.dueDate).toLocaleDateString()}`:""}</small></div><span className={`priority ${t.priority.toLowerCase()}`}>{t.priority}</span><button className="icon-btn" onClick={()=>open(t)} aria-label="Edit"><Pencil size={16}/></button><button className="icon-btn danger-icon" onClick={()=>remove(t._id)} aria-label="Delete"><Trash2 size={16}/></button></div>):<Empty text="Nothing here yet. Add a task and make a start!"/>}</div>
    {show&&<Modal title={edit?"Edit task":"Create a task"} close={()=>setShow(false)}><form className="form" onSubmit={save}><label>Task title<input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Finish DSA assignment"/></label><div className="two-fields"><label>Category<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}><option>Study</option><option>Personal</option><option>Career</option><option>Project</option></select></label><label>Priority<select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}><option>Low</option><option>Medium</option><option>High</option></select></label></div><label>Due date<input type="date" value={form.dueDate} onChange={e=>setForm({...form,dueDate:e.target.value})}/></label><button className="btn primary full">{edit?"Save changes":"Create task"}</button></form></Modal>}
  </>;
}

function Study({notify,refresh}) {
  const [sessions,setSessions]=useState([]),[subject,setSubject]=useState(""),[minutes,setMinutes]=useState(45);
  const load=()=>api.get("/sessions").then(r=>setSessions(r.data)).catch(e=>notify(errorText(e)));
  useEffect(()=>{load();},[refresh]);
  const add=async e=>{e.preventDefault();try{await api.post("/sessions",{subject,minutes});setSubject("");load();notify("Study session logged!");}catch(e){notify(errorText(e));}};
  const total=sessions.reduce((a,s)=>a+s.minutes,0);
  return <><PageTitle eyebrow="FOCUS & LEARN" title="Study planner" sub="Track your focus sessions and celebrate the time you invest in yourself."/>
    <div className="study-hero"><div className="study-symbol"><BookOpen size={28}/></div><div><span className="eyebrow">YOUR STUDY TIME</span><h2>{Math.floor(total/60)}h {total%60}m</h2><p>Total time recorded across your sessions</p></div></div>
    <div className="content-grid"><section className="panel"><div className="panel-head"><div><h3>Log a study session</h3><p>Every focused minute counts.</p></div></div><form className="form" onSubmit={add}><label>What did you study?<input required value={subject} onChange={e=>setSubject(e.target.value)} placeholder="e.g. Data Structures"/></label><label>Duration (minutes)<input type="number" min="1" max="1440" required value={minutes} onChange={e=>setMinutes(e.target.value)}/></label><button className="btn primary full"><Plus size={16}/> Save session</button></form></section>
    <section className="panel"><div className="panel-head"><div><h3>Recent sessions</h3><p>Your learning history</p></div></div>{sessions.length?sessions.slice(0,8).map(s=><div className="session-row" key={s._id}><div className="session-icon"><BookOpen size={17}/></div><div className="manage-main"><b>{s.subject}</b><small>{new Date(s.studiedAt).toLocaleDateString()}</small></div><b>{s.minutes} min</b></div>):<Empty text="Your study sessions will appear here."/>}</section></div>
  </>;
}

function Goals({notify}) {
  const [items,setItems]=useState([]),[show,setShow]=useState(false),[form,setForm]=useState({title:"",target:10,unit:"sessions"});
  const load=()=>api.get("/goals").then(r=>setItems(r.data)).catch(e=>notify(errorText(e)));
  useEffect(()=>{load();},[]);
  const create=async e=>{e.preventDefault();try{await api.post("/goals",form);setShow(false);setForm({title:"",target:10,unit:"sessions"});load();notify("Goal created");}catch(e){notify(errorText(e));}};
  const change=async(g,delta)=>{try{await api.patch(`/goals/${g._id}`,{progress:Math.max(0,Math.min(g.target,g.progress+delta))});load();}catch(e){notify(errorText(e));}};
  const remove=async id=>{if(!confirm("Delete this goal?"))return;await api.delete(`/goals/${id}`);load();notify("Goal deleted");};
  return <><PageTitle eyebrow="DREAM IT. DO IT." title="Your goals" sub="Give your ambition a direction, then take one step at a time." action={<button className="btn primary" onClick={()=>setShow(true)}><Plus size={17}/> Add goal</button>}/>
    <div className="goal-grid">{items.map(g=>{const p=Math.min(100,Math.round(g.progress/g.target*100));return <div className="panel goal-card" key={g._id}><div className="goal-card-top"><span className="goal-badge"><Target size={19}/></span><button className="icon-btn danger-icon" onClick={()=>remove(g._id)}><Trash2 size={16}/></button></div><h3>{g.title}</h3><div className="goal-percent">{p}% <small>completed</small></div><div className="progress-track"><span style={{width:`${p}%`}}/></div><p className="muted small">{g.progress} of {g.target} {g.unit}</p><div className="goal-actions"><button className="btn subtle" onClick={()=>change(g,-1)}>-1</button><button className="btn primary" onClick={()=>change(g,1)}><Plus size={15}/> Add progress</button></div></div>})}{!items.length&&<div className="panel"><Empty text="No goals yet. Create one to get started."/></div>}</div>
    {show&&<Modal title="Create a goal" close={()=>setShow(false)}><form className="form" onSubmit={create}><label>Goal title<input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Solve 50 coding problems"/></label><div className="two-fields"><label>Target<input type="number" min="1" required value={form.target} onChange={e=>setForm({...form,target:Number(e.target.value)})}/></label><label>Unit<select value={form.unit} onChange={e=>setForm({...form,unit:e.target.value})}><option>sessions</option><option>problems</option><option>hours</option><option>projects</option><option>chapters</option></select></label></div><button className="btn primary full">Create goal</button></form></Modal>}
  </>;
}

function Career({notify}) {
  const [items,setItems]=useState([]),[show,setShow]=useState(false),[form,setForm]=useState({name:"",category:"Technical",level:1});
  const load=()=>api.get("/skills").then(r=>setItems(r.data)).catch(e=>notify(errorText(e)));
  useEffect(()=>{load();},[]);
  const create=async e=>{e.preventDefault();try{await api.post("/skills",form);setShow(false);setForm({name:"",category:"Technical",level:1});load();notify("Skill added");}catch(e){notify(errorText(e));}};
  const level=async(s,n)=>{try{await api.patch(`/skills/${s._id}`,{level:n});load();}catch(e){notify(errorText(e));}};
  const remove=async id=>{if(!confirm("Remove this skill?"))return;await api.delete(`/skills/${id}`);load();notify("Skill removed");};
  return <><PageTitle eyebrow="INVEST IN YOURSELF" title="Career toolkit" sub="Build a skill set that opens doors to your next opportunity." action={<button className="btn primary" onClick={()=>setShow(true)}><Plus size={17}/> Add skill</button>}/>
    <div className="career-banner"><BriefcaseBusiness size={26}/><div><b>Your future is a work in progress.</b><p>Track what you know, strengthen what you don't, and keep learning.</p></div></div>
    <div className="skill-grid">{items.map(s=><div className="panel skill-card" key={s._id}><div className="skill-top"><span className="skill-symbol"><Sparkles size={17}/></span><button className="icon-btn danger-icon" onClick={()=>remove(s._id)}><Trash2 size={15}/></button></div><b>{s.name}</b><small>{s.category}</small><div className="skill-level">{[1,2,3,4,5].map(n=><button key={n} onClick={()=>level(s,n)} className={n<=s.level?"filled":""} aria-label={`Set level ${n}`}/>)}</div><span className="muted tiny">Level {s.level} of 5</span></div>)}{!items.length&&<div className="panel"><Empty text="Add your first skill to start building your career toolkit."/></div>}</div>
    {show&&<Modal title="Add a skill" close={()=>setShow(false)}><form className="form" onSubmit={create}><label>Skill name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Java"/></label><label>Category<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}><option>Technical</option><option>Soft skill</option><option>Language</option><option>Tool</option></select></label><label>Current level<select value={form.level} onChange={e=>setForm({...form,level:Number(e.target.value)})}>{[1,2,3,4,5].map(n=><option value={n} key={n}>{n} — {["Beginner","Learning","Intermediate","Advanced","Expert"][n-1]}</option>)}</select></label><button className="btn primary full">Add skill</button></form></Modal>}
  </>;
}

function Notes({notify}) {
  const [items,setItems]=useState([]),[show,setShow]=useState(false),[edit,setEdit]=useState(null),[form,setForm]=useState({title:"",content:"",color:"violet"});
  const load=()=>api.get("/notes").then(r=>setItems(r.data)).catch(e=>notify(errorText(e)));
  useEffect(()=>{load();},[]);
  const open=n=>{setEdit(n||null);setForm(n?{title:n.title,content:n.content,color:n.color}:{title:"",content:"",color:"violet"});setShow(true);};
  const save=async e=>{e.preventDefault();try{if(edit)await api.patch(`/notes/${edit._id}`,form);else await api.post("/notes",form);setShow(false);load();notify("Note saved");}catch(e){notify(errorText(e));}};
  const remove=async id=>{if(!confirm("Delete this note?"))return;await api.delete(`/notes/${id}`);load();notify("Note deleted");};
  return <><PageTitle eyebrow="THOUGHTS & IDEAS" title="Your notes" sub="A home for the ideas you don't want to forget." action={<button className="btn primary" onClick={()=>open()}><Plus size={17}/> New note</button>}/>
    <div className="notes-grid">{items.map(n=><article className={`note-card ${n.color}`} key={n._id}><div className="note-actions"><button className="icon-btn" onClick={()=>open(n)}><Pencil size={15}/></button><button className="icon-btn" onClick={()=>remove(n._id)}><Trash2 size={15}/></button></div><h3>{n.title}</h3><p>{n.content}</p><small>Updated {new Date(n.updatedAt).toLocaleDateString()}</small></article>)}{!items.length&&<div className="panel"><Empty text="Your notes are waiting. Capture an idea, reminder or useful concept."/></div>}</div>
    {show&&<Modal title={edit?"Edit note":"Create a note"} close={()=>setShow(false)}><form className="form" onSubmit={save}><label>Title<input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Give your note a title"/></label><label>Content<textarea rows="6" value={form.content} onChange={e=>setForm({...form,content:e.target.value})} placeholder="Write your thoughts here…"/></label><label>Card colour<select value={form.color} onChange={e=>setForm({...form,color:e.target.value})}><option value="violet">Lavender</option><option value="peach">Peach</option><option value="mint">Mint</option><option value="blue">Blue</option></select></label><button className="btn primary full">Save note</button></form></Modal>}
  </>;
}

function Modal({title,close,children}){return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)close();}}><div className="modal"><div className="modal-head"><h3>{title}</h3><button className="icon-btn" onClick={close}><X size={19}/></button></div>{children}</div></div>}
export default App;
