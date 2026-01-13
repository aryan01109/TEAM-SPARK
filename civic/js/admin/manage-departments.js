/* Manage Departments (moved to civic/js/admin/manage-departments.js) */

/* ---------------- STATE ---------------- */
let departments = [];
let searchTerm = "";
let statusFilter = "all";
let sortBy = "name";
let sortOrder = "asc";
let pendingDeleteId = null;

/* ---------------- MOCK DATA ---------------- */
const mockDepartments = [
  { id:1,name:"Public Works",head:"John Smith",email:"public@city.gov",phone:"555-1234",status:"active",budget:2500000,employees:45,issuesCount:23,resolvedCount:18,description:"Infrastructure" },
  { id:2,name:"Parks & Recreation",head:"Sarah Johnson",email:"parks@city.gov",phone:"555-2345",status:"active",budget:1200000,employees:28,issuesCount:15,resolvedCount:12,description:"Parks" },
  { id:3,name:"Environmental Services",head:"Mike Davis",email:"env@city.gov",phone:"555-3456",status:"maintenance",budget:1800000,employees:32,issuesCount:8,resolvedCount:6,description:"Waste" }
];

/* ---------------- INIT ---------------- */
setTimeout(() => {
  departments = mockDepartments;
  render();
}, 800);

/* ---------------- HELPERS ---------------- */
function formatCurrency(n){
  return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n);
}

function getFiltered(){
  let list = departments.filter(d =>
    (d.name+d.head+d.description).toLowerCase().includes(searchTerm) &&
    (statusFilter==="all"||d.status===statusFilter)
  );

  list.sort((a,b)=>{
    let A=a[sortBy],B=b[sortBy];
    if(typeof A==="string"){A=A.toLowerCase();B=B.toLowerCase();}
    return sortOrder==="asc" ? A>B?1:-1 : A<B?1:-1;
  });

  return list;
}

/* ---------------- RENDER ---------------- */
function render(){
  const grid=document.getElementById("departmentsGrid");
  const list=getFiltered();

  if(!grid) return;

  grid.innerHTML="";
  const resultsInfo = document.getElementById("resultsInfo");
  if(resultsInfo) resultsInfo.innerText = `Showing ${list.length} of ${departments.length}`;

  const totalEmployees = departments.reduce((s,d)=>s + (parseInt(d.employees)||0),0);
  const totalBudget = departments.reduce((s,d)=>s + (parseInt(d.budget)||0),0);
  const totalIssues = departments.reduce((s,d)=>s + (d.issuesCount||0),0);

  if(document.getElementById("totalDepartments")) document.getElementById("totalDepartments").innerText = departments.length;
  if(document.getElementById("totalEmployees")) document.getElementById("totalEmployees").innerText = totalEmployees;
  if(document.getElementById("totalBudget")) document.getElementById("totalBudget").innerText = formatCurrency(totalBudget);
  if(document.getElementById("totalIssues")) document.getElementById("totalIssues").innerText = totalIssues;

  list.forEach(d=>{
    const card=document.createElement("div");
    card.className="department-card";
    card.innerHTML=`
      <div class="department-card-header">
        <h3>${d.name}</h3>
        <p class="department-description">${d.description || ''}</p>
      </div>
      <div class="department-card-body">
        <div class="info-row"><span class="info-label">Head:</span> <span class="info-value">${d.head}</span></div>
        <div class="info-row"><span class="info-label">Status:</span> <span class="status-badge ${d.status}">${d.status}</span></div>
        <div class="info-row"><span class="info-label">Budget:</span> <span class="budget-value">${formatCurrency(d.budget)}</span></div>
        <div class="info-row"><span class="info-label">Issues:</span> <span class="info-value">${d.resolvedCount}/${d.issuesCount}</span></div>
        <div class="department-actions">
          <button onclick="editDept(${d.id})" class="edit-btn">Edit</button>
          <button onclick="deleteDept(${d.id})" class="delete-btn">Delete</button>
        </div>
      </div>`;
    grid.appendChild(card);
  });
}

/* ---------------- EVENTS ---------------- */
function wireEvents(){
  const s = document.getElementById("searchInput"); if(s) s.oninput = e=>{searchTerm=e.target.value.toLowerCase();render()};
  const sf = document.getElementById("statusFilter"); if(sf) sf.onchange = e=>{statusFilter=e.target.value;render()};
  const sb = document.getElementById("sortBy"); if(sb) sb.onchange = e=>{sortBy=e.target.value;render()};
  const sortBtn = document.getElementById("sortOrderBtn"); if(sortBtn) sortBtn.onclick = ()=>{sortOrder=sortOrder==="asc"?"desc":"asc"; sortBtn.innerText = sortOrder==="asc"?"↑":"↓"; render()};
  const clearBtn = document.getElementById("clearFiltersBtn"); if(clearBtn) clearBtn.onclick = ()=>{searchTerm="";statusFilter="all";sortBy="name";sortOrder="asc";render()};
  const addBtn = document.getElementById("addDepartmentBtn"); if(addBtn) addBtn.onclick = ()=>openModal();
  const logout = document.getElementById("logoutBtn"); if(logout) logout.onclick = ()=>{localStorage.clear();location.href="/login"};
}

/* ---------------- MODAL ---------------- */
function openModal(dept=null){
  const modal = document.getElementById("departmentModal");
  if(!modal) return;
  modal.classList.remove("hidden");
  const title = document.getElementById("modalTitle"); if(title) title.innerText = dept?"Edit Department":"Add Department";
  const form = document.getElementById("departmentForm"); if(form) form.reset();
  const idField = document.getElementById("deptId"); if(idField) idField.value = dept?dept.id:"";

  if(dept){
    const fields = ["name","head","email","phone","budget","employees","status","description"];
    fields.forEach(f=>{ const el = document.getElementById(f); if(el) el.value = dept[f] ?? ""; });
  }
}

function closeModal(){
  const modal = document.getElementById("departmentModal");
  if(modal) modal.classList.add("hidden");
}

function editDept(id){
  openModal(departments.find(d=>d.id===id));
}

function deleteDept(id){
  pendingDeleteId = id;
  const dept = departments.find(d=>d.id===id);
  const text = dept? `Delete department \"${dept.name}\"?` : `Delete selected department?`;
  const deleteModal = document.getElementById("deleteModal");
  const deleteText = document.getElementById("deleteText"); if(deleteText) deleteText.innerText = text;
  if(deleteModal) deleteModal.classList.remove("hidden");
}

function closeDeleteModal(){
  const deleteModal = document.getElementById("deleteModal");
  if(deleteModal) deleteModal.classList.add("hidden");
  pendingDeleteId = null;
}

function confirmDelete(){
  if(pendingDeleteId==null) return closeDeleteModal();
  departments = departments.filter(d=>d.id!==pendingDeleteId);
  pendingDeleteId = null;
  closeDeleteModal();
  render();
}

/* ---------------- SAVE ---------------- */
function wireForm(){
  const form = document.getElementById("departmentForm");
  if(!form) return;
  form.onsubmit = e=>{
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    data.budget = parseInt(data.budget||0);
    data.employees = parseInt(data.employees||0);

    if(data.id){
      departments = departments.map(d=> d.id == data.id ? {...d, ...data, budget: data.budget, employees: data.employees} : d);
    } else {
      departments.push({id: Date.now(), ...data, issuesCount:0, resolvedCount:0});
    }
    closeModal();
    render();
  };
}

/* initialize after DOM loads */
document.addEventListener('DOMContentLoaded', ()=>{ wireEvents(); wireForm(); render(); });
