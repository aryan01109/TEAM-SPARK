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

  grid.innerHTML="";
  document.getElementById("resultsInfo").innerText = `Showing ${list.length} of ${departments.length}`;

  // Update stats (match IDs in HTML)
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
document.getElementById("searchInput").oninput=e=>{searchTerm=e.target.value.toLowerCase();render()};
document.getElementById("statusFilter").onchange=e=>{statusFilter=e.target.value;render()};
document.getElementById("sortBy").onchange=e=>{sortBy=e.target.value;render()};
document.getElementById("sortOrderBtn").onclick=()=>{sortOrder=sortOrder==="asc"?"desc":"asc"; document.getElementById("sortOrderBtn").innerText = sortOrder==="asc"?"↑":"↓"; render()};
document.getElementById("clearFiltersBtn").onclick=()=>{searchTerm="";statusFilter="all";sortBy="name";sortOrder="asc";render()};

document.getElementById("addDepartmentBtn").onclick=()=>openModal();

/* ---------------- MODAL ---------------- */
function openModal(dept=null){
  const modal = document.getElementById("departmentModal");
  if(!modal) return;
  modal.classList.remove("hidden");
  document.getElementById("modalTitle").innerText = dept?"Edit Department":"Add Department";
  document.getElementById("departmentForm").reset();
  document.getElementById("deptId").value = dept?dept.id:"";

  if(dept){
    // populate by id (inputs now have name and id)
    const fields = ["name","head","email","phone","budget","employees","status","description"];
    fields.forEach(f=>{ if(document.getElementById(f)) document.getElementById(f).value = dept[f] ?? ""; });
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
  // open delete confirmation modal
  pendingDeleteId = id;
  const dept = departments.find(d=>d.id===id);
  const text = dept? `Delete department \"${dept.name}\"?` : `Delete selected department?`;
  const deleteModal = document.getElementById("deleteModal");
  if(document.getElementById("deleteText")) document.getElementById("deleteText").innerText = text;
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
document.getElementById("departmentForm").onsubmit=e=>{
  e.preventDefault();
  const data=Object.fromEntries(new FormData(e.target));
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

document.getElementById("logoutBtn").onclick=()=>{localStorage.clear();location.href="/login"};