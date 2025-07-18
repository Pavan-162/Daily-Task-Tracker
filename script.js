class TaskTracker {
    constructor() {
        this.tasks = [];
        this.recurringTasks = [];
        this.currentFilter = 'all';
        this.editingTaskId = null;
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.currentTab = 'today';
        
        this.initializeElements();
        this.attachEventListeners();
        this.loadData();
        this.updateDisplay();
        this.updateDate();
        this.setDefaultDates();

        this.elements.bulkTaskTitle = document.getElementById('bulkTaskTitle');
        this.elements.bulkTaskPriority = document.getElementById('bulkTaskPriority');
        this.elements.bulkStartDate = document.getElementById('bulkStartDate');
        this.elements.bulkEndDate = document.getElementById('bulkEndDate');
        this.elements.bulkAddBtn = document.getElementById('bulkAddBtn');

        this.elements.bulkAddBtn.addEventListener('click', () => this.bulkAddTasks());

        
    }

    initializeElements() {
        this.elements = {
            // Common elements
            currentDate: document.getElementById('currentDate'),
            
            // Today's tasks elements
            newTaskInput: document.getElementById('newTaskInput'),
            taskPriority: document.getElementById('taskPriority'),
            addTaskBtn: document.getElementById('addTaskBtn'),
            tasksContainer: document.getElementById('tasksContainer'),
            emptyState: document.getElementById('emptyState'),
            progressCircle: document.getElementById('progressCircle'),
            progressNumber: document.getElementById('progressNumber'),
            completedTasks: document.getElementById('completedTasks'),
            totalTasks: document.getElementById('totalTasks'),
            activeTasks: document.getElementById('activeTasks'),
            filterButtons: document.querySelectorAll('.filter-btn'),
            
            // Tab elements
            navTabs: document.querySelectorAll('.nav-tab'),
            tabContents: document.querySelectorAll('.tab-content'),
            
            
            // Calendar elements
            calendarGrid: document.getElementById('calendarGrid'),
            calendarTitle: document.getElementById('calendarTitle'),
            prevMonth: document.getElementById('prevMonth'),
            nextMonth: document.getElementById('nextMonth'),
            selectedDateTasks: document.getElementById('selectedDateTasks'),
            selectedDateTitle: document.getElementById('selectedDateTitle'),
            dateTasksContainer: document.getElementById('dateTasksContainer'),
            
            // Recurring tasks elements
            recurringTaskInput: document.getElementById('recurringTaskInput'),
            startDate: document.getElementById('startDate'),
            endDate: document.getElementById('endDate'),
            recurringPriority: document.getElementById('recurringPriority'),
            addRecurringBtn: document.getElementById('addRecurringBtn'),
            recurringTasksContainer: document.getElementById('recurringTasksContainer'),
            recurringEmptyState: document.getElementById('recurringEmptyState')
        };
    }

    attachEventListeners() {
        // Tab navigation
        this.elements.navTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Today's tasks
        this.elements.addTaskBtn.addEventListener('click', () => this.addTask());
        this.elements.newTaskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        // Filter buttons
        this.elements.filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                this.setFilter(filter);
            });
        });

        // Calendar navigation
        this.elements.prevMonth.addEventListener('click', () => this.changeMonth(-1));
        this.elements.nextMonth.addEventListener('click', () => this.changeMonth(1));

        // Recurring tasks
        this.elements.addRecurringBtn.addEventListener('click', () => this.addRecurringTask());
        this.elements.recurringTaskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addRecurringTask();
        });
    }

    setDefaultDates() {
        const today = new Date();
        const maxDate = new Date();
        maxDate.setMonth(maxDate.getMonth() + 3);
        
        this.elements.startDate.value = today.toISOString().split('T')[0];
        this.elements.endDate.value = maxDate.toISOString().split('T')[0];
        
        // Set max date to 3 months from now
        this.elements.startDate.max = maxDate.toISOString().split('T')[0];
        this.elements.endDate.max = maxDate.toISOString().split('T')[0];
        this.elements.startDate.min = today.toISOString().split('T')[0];
        this.elements.endDate.min = today.toISOString().split('T')[0];
    }

    switchTab(tabName) {
        this.currentTab = tabName;
        
        // Update tab buttons
        this.elements.navTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        // Update tab content
        this.elements.tabContents.forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}Tab`);
        });
        
        // Update display based on active tab
        if (tabName === 'calendar') {
            this.renderCalendar();
            this.renderSelectedDateTasks();
        } else if (tabName === 'recurring') {
            this.renderRecurringTasks();
        }
    }

    generateId() {
        return '_' + Math.random().toString(36).substr(2, 9);
    }

    addTask() {
        const title = this.elements.newTaskInput.value.trim();
        const priority = this.elements.taskPriority.value;

        if (!title) return;

        const task = {
            id: this.generateId(),
            title,
            completed: false,
            priority,
            date: this.formatDate(new Date()),
            createdAt: new Date().toISOString()
        };

        this.tasks.unshift(task);
        this.saveData();
        this.updateDisplay();
        
        // Clear input
        this.elements.newTaskInput.value = '';
        this.elements.taskPriority.value = 'medium';
    }

    addRecurringTask() {
        const title = this.elements.recurringTaskInput.value.trim();
        const startDate = this.elements.startDate.value;
        const endDate = this.elements.endDate.value;
        const priority = this.elements.recurringPriority.value;

        if (!title || !startDate || !endDate) {
            alert('Please fill in all fields');
            return;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (start > end) {
            alert('End date must be after start date');
            return;
        }

        const recurringTask = {
            id: this.generateId(),
            title,
            priority,
            startDate,
            endDate,
            completedDates: [],
            createdAt: new Date().toISOString()
        };

        this.recurringTasks.unshift(recurringTask);
        this.saveData();
        this.renderRecurringTasks();
        
        // Clear inputs
        this.elements.recurringTaskInput.value = '';
        this.elements.recurringPriority.value = 'medium';
        this.setDefaultDates();
    }

    toggleTask(id, date = null) {
        if (date) {
            // Toggle recurring task for specific date
            const recurringTask = this.recurringTasks.find(t => t.id === id);
            if (recurringTask) {
                const dateStr = this.formatDate(new Date(date));
                const index = recurringTask.completedDates.indexOf(dateStr);
                if (index > -1) {
                    recurringTask.completedDates.splice(index, 1);
                } else {
                    recurringTask.completedDates.push(dateStr);
                }
                this.saveData();
                this.renderRecurringTasks();
                if (this.currentTab === 'calendar') {
                    this.renderCalendar();
                    this.renderSelectedDateTasks();
                }
            }
        } else {
            // Toggle regular task
            const task = this.tasks.find(t => t.id === id);
            if (task) {
                task.completed = !task.completed;
                this.saveData();
                this.updateDisplay();
            }
        }
    }

    deleteTask(id, isRecurring = false) {
        if (confirm('Are you sure you want to delete this task?')) {
            if (isRecurring) {
                this.recurringTasks = this.recurringTasks.filter(t => t.id !== id);
                this.renderRecurringTasks();
            } else {
                this.tasks = this.tasks.filter(t => t.id !== id);
                this.updateDisplay();
            }
            this.saveData();
        }
    }

    startEdit(id) {
        this.editingTaskId = id;
        this.renderTasks();
    }

    saveEdit(id, newTitle) {
        const task = this.tasks.find(t => t.id === id);
        if (task && newTitle.trim()) {
            task.title = newTitle.trim();
            this.saveData();
        }
        this.editingTaskId = null;
        this.updateDisplay();
    }

    cancelEdit() {
        this.editingTaskId = null;
        this.renderTasks();
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update filter buttons
        this.elements.filterButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        this.renderTasks();
    }

    getFilteredTasks() {
        const todayStr = this.formatDate(new Date());
        const todayTasks = this.tasks.filter(task => task.date === todayStr);
        
        switch (this.currentFilter) {
            case 'active':
                return todayTasks.filter(task => !task.completed);
            case 'completed':
                return todayTasks.filter(task => task.completed);
            default:
                return todayTasks;
        }
    }

    getTasksForDate(date) {
        const dateStr = this.formatDate(date);
        const regularTasks = this.tasks.filter(task => task.date === dateStr);
        const recurringTasks = this.getRecurringTasksForDate(date);
        return [...regularTasks, ...recurringTasks];
    }

    getRecurringTasksForDate(date) {
        const dateStr = this.formatDate(date);
        return this.recurringTasks.filter(task => {
            const startDate = new Date(task.startDate);
            const endDate = new Date(task.endDate);
            return date >= startDate && date <= endDate;
        }).map(task => ({
            ...task,
            isRecurring: true,
            completed: task.completedDates.includes(dateStr),
            date: dateStr
        }));
    }

    renderTasks() {
        const filteredTasks = this.getFilteredTasks();
        
        if (filteredTasks.length === 0) {
            this.elements.tasksContainer.style.display = 'none';
            this.elements.emptyState.classList.add('show');
            return;
        }

        this.elements.tasksContainer.style.display = 'flex';
        this.elements.emptyState.classList.remove('show');

        this.elements.tasksContainer.innerHTML = filteredTasks.map(task => {
            const isEditing = this.editingTaskId === task.id;
            
            return `
                <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                    <div class="task-checkbox ${task.completed ? 'completed' : ''}" 
                         onclick="taskTracker.toggleTask('${task.id}')">
                        ${task.completed ? '✓' : ''}
                    </div>
                    
                    <div class="task-content">
                        <span class="task-text ${isEditing ? 'editing' : ''}">${this.escapeHtml(task.title)}</span>
                        <input type="text" 
                               class="task-edit-input ${isEditing ? 'active' : ''}" 
                               value="${this.escapeHtml(task.title)}"
                               onkeypress="if(event.key==='Enter') taskTracker.saveEdit('${task.id}', this.value)"
                               onkeydown="if(event.key==='Escape') taskTracker.cancelEdit()">
                        
                        <span class="priority-badge priority-${task.priority}">
                            ${task.priority}
                        </span>
                    </div>

                    <div class="task-actions">
                        ${isEditing ? `
                            <button class="task-btn save-btn" 
                                    onclick="taskTracker.saveEdit('${task.id}', this.parentElement.parentElement.querySelector('.task-edit-input').value)">
                                ✓
                            </button>
                            <button class="task-btn cancel-btn" onclick="taskTracker.cancelEdit()">
                                ✕
                            </button>
                        ` : `
                            <button class="task-btn edit-btn" onclick="taskTracker.startEdit('${task.id}')">
                                ✎
                            </button>
                            <button class="task-btn delete-btn" onclick="taskTracker.deleteTask('${task.id}')">
                                🗑
                            </button>
                        `}
                    </div>
                </div>
            `;
        }).join('');

        // Focus on edit input if editing
        if (this.editingTaskId) {
            const editInput = document.querySelector('.task-edit-input.active');
            if (editInput) {
                editInput.focus();
                editInput.select();
            }
        }
    }

    bulkAddTasks() {
    const title = this.elements.bulkTaskTitle.value.trim();
    const priority = this.elements.bulkTaskPriority.value;
    const startDateStr = this.elements.bulkStartDate.value;
    const endDateStr = this.elements.bulkEndDate.value;

    if (!title) {
        alert('Please enter a task title.');
        return;
    }
    if (!startDateStr || !endDateStr) {
        alert('Please select both start and end dates.');
        return;
    }

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    if (endDate < startDate) {
        alert('End date must be the same or after start date.');
        return;
    }

    const newTasks = [];

    // Loop through dates and add tasks
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = this.formatDate(d);
        newTasks.push({
            id: this.generateId(),
            title,
            completed: false,
            priority,
            date: dateStr,
            createdAt: new Date().toISOString()
        });
    }

    this.tasks = this.tasks.concat(newTasks);
    this.saveData();
    this.updateDisplay();

    // Clear inputs after adding
    this.elements.bulkTaskTitle.value = '';
    this.elements.bulkStartDate.value = '';
    this.elements.bulkEndDate.value = '';
}


    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // Update calendar title
        this.elements.calendarTitle.textContent = new Date(year, month).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
        });

        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        // Clear calendar
        this.elements.calendarGrid.innerHTML = '';

        // Add day headers
        const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayHeaders.forEach(day => {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day calendar-day-header';
            dayElement.textContent = day;
            this.elements.calendarGrid.appendChild(dayElement);
        });

        // Add empty cells for days before month starts
        for (let i = 0; i < startingDayOfWeek; i++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day other-month';
            this.elements.calendarGrid.appendChild(dayElement);
        }

        // Add days of the month
        const today = new Date();
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            const currentDate = new Date(year, month, day);
            const tasksForDay = this.getTasksForDate(currentDate);
            
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;
            
            // Add classes for styling
            if (this.isSameDay(currentDate, today)) {
                dayElement.classList.add('today');
            }
            
            if (this.isSameDay(currentDate, this.selectedDate)) {
                dayElement.classList.add('selected');
            }
            
            if (tasksForDay.length > 0) {
                dayElement.classList.add('has-tasks');
            }
            
            // Add click event
            dayElement.addEventListener('click', () => {
                this.selectedDate = currentDate;
                this.renderCalendar();
                this.renderSelectedDateTasks();
            });
            
            this.elements.calendarGrid.appendChild(dayElement);
        }
    }

    renderSelectedDateTasks() {
        const tasks = this.getTasksForDate(this.selectedDate);
        const dateStr = this.selectedDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        this.elements.selectedDateTitle.textContent = `Tasks for ${dateStr}`;
        
        if (tasks.length === 0) {
            this.elements.dateTasksContainer.innerHTML = `
                <div class="empty-state show">
                    <div class="empty-icon">📅</div>
                    <h3>No tasks for this date</h3>
                    <p>Add tasks to get started!</p>
                </div>
            `;
            return;
        }

        this.elements.dateTasksContainer.innerHTML = tasks.map(task => `
            <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <div class="task-checkbox ${task.completed ? 'completed' : ''}" 
                     onclick="taskTracker.toggleTask('${task.id}', '${task.isRecurring ? this.selectedDate.toISOString() : ''}')">
                    ${task.completed ? '✓' : ''}
                </div>
                
                <div class="task-content">
                    <span class="task-text">${this.escapeHtml(task.title)}</span>
                    <span class="priority-badge priority-${task.priority}">
                        ${task.priority}
                    </span>
                    ${task.isRecurring ? '<span class="priority-badge" style="background: #e0e7ff; color: #3730a3;">Multi-day</span>' : ''}
                </div>

                <div class="task-actions">
                    <button class="task-btn delete-btn" onclick="taskTracker.deleteTask('${task.id}', ${task.isRecurring || false})">
                        🗑
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderRecurringTasks() {
        if (this.recurringTasks.length === 0) {
            this.elements.recurringTasksContainer.style.display = 'none';
            this.elements.recurringEmptyState.classList.add('show');
            return;
        }

        this.elements.recurringTasksContainer.style.display = 'flex';
        this.elements.recurringEmptyState.classList.remove('show');

        this.elements.recurringTasksContainer.innerHTML = this.recurringTasks.map(task => {
            const startDate = new Date(task.startDate);
            const endDate = new Date(task.endDate);
            const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
            const completedDays = task.completedDates.length;
            const progressPercentage = Math.round((completedDays / totalDays) * 100);

            return `
                <div class="recurring-task-item" data-id="${task.id}">
                    <div class="recurring-task-header">
                        <div class="recurring-task-info">
                            <div class="recurring-task-title">${this.escapeHtml(task.title)}</div>
                            <div class="recurring-task-dates">
                                ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}
                            </div>
                        </div>
                        <div class="task-actions">
                            <span class="priority-badge priority-${task.priority}">${task.priority}</span>
                            <button class="task-btn delete-btn" onclick="taskTracker.deleteTask('${task.id}', true)">
                                🗑
                            </button>
                        </div>
                    </div>
                    
                    <div class="recurring-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progressPercentage}%"></div>
                        </div>
                        <div class="progress-text">${completedDays} of ${totalDays} days completed (${progressPercentage}%)</div>
                    </div>
                    
                    <div class="daily-checkboxes">
                        ${this.generateDailyCheckboxes(task)}
                    </div>
                </div>
            `;
        }).join('');
    }

    generateDailyCheckboxes(task) {
        const startDate = new Date(task.startDate);
        const endDate = new Date(task.endDate);
        const today = new Date();
        const checkboxes = [];

        for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
            const dateStr = this.formatDate(date);
            const isCompleted = task.completedDates.includes(dateStr);
            const isToday = this.isSameDay(date, today);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const dayNumber = date.getDate();

            checkboxes.push(`
                <div class="daily-checkbox ${isCompleted ? 'completed' : ''} ${isToday ? 'today' : ''}"
                     onclick="taskTracker.toggleTask('${task.id}', '${date.toISOString()}')">
                    <div class="checkbox-date">${dayNumber}</div>
                    <div class="checkbox-day">${dayName}</div>
                    <div class="checkbox-mark">${isCompleted ? '✓' : ''}</div>
                </div>
            `);
        }

        return checkboxes.join('');
    }

    changeMonth(direction) {
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        this.renderCalendar();
    }

    updateProgress() {
        const todayStr = this.formatDate(new Date());
        const todayTasks = this.tasks.filter(task => task.date === todayStr);
        const completed = todayTasks.filter(task => task.completed).length;
        const total = todayTasks.length;
        const active = total - completed;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        // Update progress circle
        const degrees = (percentage / 100) * 360;
        this.elements.progressCircle.style.background = 
            `conic-gradient(#4facfe ${degrees}deg, #f0f0f0 ${degrees}deg)`;

        // Update numbers
        this.elements.progressNumber.textContent = `${percentage}%`;
        this.elements.completedTasks.textContent = completed;
        this.elements.totalTasks.textContent = total;
        this.elements.activeTasks.textContent = active;
    }

    updateDate() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        this.elements.currentDate.textContent = now.toLocaleDateString('en-US', options);
    }

    updateDisplay() {
        this.renderTasks();
        this.updateProgress();
        if (this.currentTab === 'calendar') {
            this.renderCalendar();
            this.renderSelectedDateTasks();
        }
    }

    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    isSameDay(date1, date2) {
        return this.formatDate(date1) === this.formatDate(date2);
    }

    saveData() {
        localStorage.setItem('dailyTasks', JSON.stringify(this.tasks));
        localStorage.setItem('recurringTasks', JSON.stringify(this.recurringTasks));
    }

    loadData() {
        // Load regular tasks
        const savedTasks = localStorage.getItem('dailyTasks');
        if (savedTasks) {
            try {
                this.tasks = JSON.parse(savedTasks);
            } catch (e) {
                console.error('Error loading tasks:', e);
                this.tasks = [];
            }
        }

        // Load recurring tasks
        const savedRecurringTasks = localStorage.getItem('recurringTasks');
        if (savedRecurringTasks) {
            try {
                this.recurringTasks = JSON.parse(savedRecurringTasks);
            } catch (e) {
                console.error('Error loading recurring tasks:', e);
                this.recurringTasks = [];
            }
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.taskTracker = new TaskTracker();
});

// Add some sample data for demonstration (only on first visit)
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const hasExistingTasks = localStorage.getItem('dailyTasks');
        const hasExistingRecurring = localStorage.getItem('recurringTasks');
        
        if (!hasExistingTasks) {
            const today = new Date();
            const todayStr = taskTracker.formatDate(today);
            
            const sampleTasks = [
                { id: 'sample1', title: 'Review project proposals', completed: false, priority: 'high', date: todayStr, createdAt: new Date().toISOString() },
                { id: 'sample2', title: 'Call dentist for appointment', completed: true, priority: 'medium', date: todayStr, createdAt: new Date().toISOString() },
                { id: 'sample3', title: 'Buy groceries', completed: false, priority: 'low', date: todayStr, createdAt: new Date().toISOString() }
            ];
            
            taskTracker.tasks = sampleTasks;
            taskTracker.saveData();
        }
        
        if (!hasExistingRecurring) {
            const today = new Date();
            const nextWeek = new Date();
            nextWeek.setDate(today.getDate() + 7);
            
            const sampleRecurringTasks = [
                {
                    id: 'recurring1',
                    title: 'Morning exercise routine',
                    priority: 'high',
                    startDate: taskTracker.formatDate(today),
                    endDate: taskTracker.formatDate(nextWeek),
                    completedDates: [taskTracker.formatDate(today)],
                    createdAt: new Date().toISOString()
                }
            ];
            
            taskTracker.recurringTasks = sampleRecurringTasks;
            taskTracker.saveData();
        }
        
        taskTracker.updateDisplay();
    }, 100);
});