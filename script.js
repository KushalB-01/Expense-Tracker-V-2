const form = document.getElementById('expense-form');
const tableBody = document.getElementById('expense-table-body');
const totalAmountEl = document.getElementById('total-amount');
const categorySelect = document.getElementById('category');
const filterCategory = document.getElementById('filter-category');

const budgetDisplay = document.getElementById('budget-display');
const spentDisplay = document.getElementById('spent-display');
const remainingDisplay = document.getElementById('remaining-display');
const warningText = document.getElementById('warning-text');

const modal = document.getElementById('welcome-modal');
const budgetInput = document.getElementById('budget-input');
const budgetSubmit = document.getElementById('budget-submit');

let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let budget = parseFloat(localStorage.getItem('budget')) || 0;

// Dark/Light toggle
const toggleBtn = document.getElementById('toggle-theme');
toggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    toggleBtn.textContent = document.body.classList.contains('dark-mode') ? "☀️" : "🌙";
});

// Show modal on load
window.addEventListener('load', () => {
    setTimeout(()=>{
        modal.style.display='flex';
        modal.classList.add('show'); // triggers fadeIn animation
         document.body.classList.add('modal-open');
    }, 500);
});

// Set budget
budgetSubmit.addEventListener('click', ()=>{
    if(budgetInput.value && !isNaN(budgetInput.value)){
        budget = parseFloat(budgetInput.value);
        localStorage.setItem('budget', budget);
        modal.style.display='none';
        document.body.classList.remove('modal-open'); 
        renderExpenses();
    } else {
        alert("Enter a valid budget!");
    }
});

// Render expenses
function renderExpenses(filter="All"){
    tableBody.innerHTML = '';
    let totalSpent = 0;

    expenses.forEach((expense,index)=>{
        if(filter!=="All" && expense.category!==filter) return;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${expense.description}</td>
            <td>₹${expense.amount}</td>
            <td>${expense.category}</td>
            <td>${expense.date}</td>
            <td><button class="delete-btn" onclick="deleteExpense(${index})">Delete</button></td>
        `;
        tableBody.appendChild(tr);
        totalSpent += parseFloat(expense.amount);
    });

    totalAmountEl.textContent = totalSpent.toFixed(2);
    updateBudgetDisplays();
    updateChart(totalSpent);
}

// Add expense
form.addEventListener('submit',(e)=>{
    e.preventDefault();
    const description = document.getElementById('description').value.trim();
    const amount = parseFloat(document.getElementById('amount').value);
    const category = categorySelect.value;
    const date = document.getElementById('date').value;

    if(!description || !amount || !category || !date){
        alert("Please fill all fields");
        return;
    }

    expenses.push({description,amount,category,date});
    localStorage.setItem('expenses',JSON.stringify(expenses));
    form.reset();
    renderExpenses(filterCategory.value);
});

// Delete expense
function deleteExpense(index){
    expenses.splice(index,1);
    localStorage.setItem('expenses',JSON.stringify(expenses));
    renderExpenses(filterCategory.value);
}

// Filter by category
filterCategory.addEventListener('change',()=>{
    renderExpenses(filterCategory.value);
});

// Budget updates
function updateBudgetDisplays(){
    let spent = expenses.reduce((sum,exp)=>sum+parseFloat(exp.amount),0);
    let remaining = budget - spent;

    budgetDisplay.textContent = budget.toFixed(2);
    spentDisplay.textContent = spent.toFixed(2);
    remainingDisplay.textContent = remaining.toFixed(2);

    if(spent >= budget){
        warningText.textContent = "❌ You need to rethink your expenses!";
    } else if(spent > budget/2){
        warningText.textContent = "⚠️ Spend wisely!";
    } else {
        warningText.textContent = "";
    }
}

// Chart.js setup
let ctx = document.getElementById('budgetChart').getContext('2d');
let budgetChart = new Chart(ctx,{
    type:'doughnut',
    data:{
        labels:['Spent','Remaining'],
        datasets:[{
            data:[0,budget],
            backgroundColor:['#ff4e50','#7f8c8d'],
        }]
    },
    options:{ responsive:true, plugins:{legend:{position:'bottom'}} }
});

function updateChart(spent){
    let remaining = Math.max(budget - spent, 0);

    // Change chart colors if exceeded
    if(spent >= budget){
        budgetChart.data.datasets[0].backgroundColor = ['#c0392b','#bdc3c7']; // dark red + light grey
    } else {
        budgetChart.data.datasets[0].backgroundColor = ['#ff4e50','#7f8c8d']; // normal red + grey
    }

    budgetChart.data.datasets[0].data = [spent, remaining];
    budgetChart.update();
}
