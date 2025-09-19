// 课程表管理系统 JavaScript

class CourseManager {
    constructor() {
        this.courses = this.loadCourses();
        this.timeSlots = this.loadTimeSlots();
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderCourses();
    }

    bindEvents() {
        // 原有事件绑定
        const form = document.getElementById('courseForm');
        const addBtn = document.getElementById('addCourseBtn');
        const closeBtn = document.getElementById('closeModal');
        const cancelBtn = document.getElementById('cancelBtn');
        const modal = document.getElementById('courseModal');
        
        // 新增时间段管理事件
        const manageTimeSlotsBtn = document.getElementById('manageTimeSlotsBtn');
        const timeSlotsModal = document.getElementById('timeSlotsModal');
        const closeTimeSlotsModal = document.getElementById('closeTimeSlotsModal');
        const addTimeSlotBtn = document.getElementById('addTimeSlotBtn');

        form.addEventListener('submit', (e) => this.handleSubmit(e));
        addBtn.addEventListener('click', () => this.openModal());
        closeBtn.addEventListener('click', () => this.closeModal());
        cancelBtn.addEventListener('click', () => this.closeModal());
        manageTimeSlotsBtn.addEventListener('click', () => this.openTimeSlotsModal());
        closeTimeSlotsModal.addEventListener('click', () => this.closeTimeSlotsModal());
        addTimeSlotBtn.addEventListener('click', () => this.addNewTimeSlot());
        
        // 点击模态框背景关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });

        timeSlotsModal.addEventListener('click', (e) => {
            if (e.target === timeSlotsModal) {
                this.closeTimeSlotsModal();
            }
        });

        // ESC键关闭模态框
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (modal.classList.contains('show')) {
                    this.closeModal();
                }
                if (timeSlotsModal.classList.contains('show')) {
                    this.closeTimeSlotsModal();
                }
            }
        });
    }

    // 原有方法保持不变
    handleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const course = {
            id: Date.now().toString(),
            name: formData.get('courseName'),
            teacher: formData.get('teacher'),
            day: formData.get('day'),
            time: formData.get('time'),
            location: formData.get('location'),
            description: formData.get('description'),
            createdAt: new Date().toLocaleString('zh-CN')
        };

        const success = this.addCourse(course);
        if (success) {
            this.clearForm();
            this.closeModal();
            this.showSuccessMessage();
        }
    }

    openModal() {
        const modal = document.getElementById('courseModal');
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        this.updateTimeSelect();
    }

    closeModal() {
        const modal = document.getElementById('courseModal');
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
        this.clearForm();
    }

    // 新增时间段管理方法
    openTimeSlotsModal() {
        const modal = document.getElementById('timeSlotsModal');
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        this.renderTimeSlotsList();
    }

    closeTimeSlotsModal() {
        const modal = document.getElementById('timeSlotsModal');
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }

    renderTimeSlotsList() {
        const timeSlotsList = document.getElementById('timeSlotsList');
        timeSlotsList.innerHTML = '';
        
        if (this.timeSlots.length === 0) {
            timeSlotsList.innerHTML = `<div class="empty-time-slots"><p>暂无自定义时间段，请添加新的时间段</p></div>`;
            return;
        }
        
        this.timeSlots.forEach((timeSlot, index) => {
            const timeSlotItem = document.createElement('div');
            timeSlotItem.className = 'time-slot-item';
            timeSlotItem.innerHTML = `
                <div class="time-slot-text">${timeSlot}</div>
                <div class="time-slot-actions">
                    <button class="btn-edit-time-slot" data-index="${index}">编辑</button>
                    <button class="btn-delete-time-slot" data-index="${index}">删除</button>
                </div>
            `;
            timeSlotsList.appendChild(timeSlotItem);
        });
        
        // 添加编辑和删除事件监听
        document.querySelectorAll('.btn-edit-time-slot').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.dataset.index);
                this.editTimeSlot(index);
            });
        });
        
        document.querySelectorAll('.btn-delete-time-slot').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.dataset.index);
                this.deleteTimeSlot(index);
            });
        });
    }

    addNewTimeSlot() {
        const timeSlotsList = document.getElementById('timeSlotsList');
        
        // 显示添加表单
        timeSlotsList.innerHTML = `
            <div class="time-slot-form">
                <h4>添加时间段</h4>
                <div class="time-inputs">
                    <input type="time" id="startTime" placeholder="开始时间">
                    <span class="time-separator">-</span>
                    <input type="time" id="endTime" placeholder="结束时间">
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-cancel-time-slot">取消</button>
                    <button type="button" class="btn-save-time-slot">保存</button>
                </div>
            </div>
        `;
        
        document.querySelector('.btn-save-time-slot').addEventListener('click', () => {
            const startTime = document.getElementById('startTime').value;
            const endTime = document.getElementById('endTime').value;
            
            if (!startTime || !endTime) {
                this.showErrorMessage('请输入完整的时间段');
                return;
            }
            
            const newTimeSlot = `${startTime}-${endTime}`;
            
            // 检查时间段是否已存在
            if (this.timeSlots.includes(newTimeSlot)) {
                this.showErrorMessage('该时间段已存在');
                return;
            }
            
            this.timeSlots.push(newTimeSlot);
            this.timeSlots.sort(); // 按时间排序
            this.saveTimeSlots();
            this.renderTimeSlotsList();
            this.renderCourses();
            this.updateTimeSelect();
            this.showSuccessMessage('时间段添加成功');
        });
        
        document.querySelector('.btn-cancel-time-slot').addEventListener('click', () => {
            this.renderTimeSlotsList();
        });
    }

    editTimeSlot(index) {
        const timeSlot = this.timeSlots[index];
        const [startTime, endTime] = timeSlot.split('-');
        const timeSlotsList = document.getElementById('timeSlotsList');
        
        // 显示编辑表单
        timeSlotsList.innerHTML = `
            <div class="time-slot-form">
                <h4>编辑时间段</h4>
                <div class="time-inputs">
                    <input type="time" id="editStartTime" value="${startTime}" placeholder="开始时间">
                    <span class="time-separator">-</span>
                    <input type="time" id="editEndTime" value="${endTime}" placeholder="结束时间">
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-cancel-time-slot">取消</button>
                    <button type="button" class="btn-save-time-slot" data-index="${index}">保存</button>
                </div>
            </div>
        `;
        
        document.querySelector('.btn-save-time-slot').addEventListener('click', (e) => {
            const index = parseInt(e.currentTarget.dataset.index);
            const startTime = document.getElementById('editStartTime').value;
            const endTime = document.getElementById('editEndTime').value;
            
            if (!startTime || !endTime) {
                this.showErrorMessage('请输入完整的时间段');
                return;
            }
            
            const updatedTimeSlot = `${startTime}-${endTime}`;
            
            // 检查时间段是否已存在（排除当前正在编辑的）
            if (this.timeSlots.includes(updatedTimeSlot) && this.timeSlots[index] !== updatedTimeSlot) {
                this.showErrorMessage('该时间段已存在');
                return;
            }
            
            // 检查是否有课程使用了该时间段
            const hasCourses = this.courses.some(course => course.time === this.timeSlots[index]);
            if (hasCourses) {
                // 更新使用该时间段的课程
                this.courses.forEach(course => {
                    if (course.time === this.timeSlots[index]) {
                        course.time = updatedTimeSlot;
                    }
                });
                this.saveCourses();
            }
            
            this.timeSlots[index] = updatedTimeSlot;
            this.timeSlots.sort();
            this.saveTimeSlots();
            this.renderTimeSlotsList();
            this.renderCourses();
            this.updateTimeSelect();
            this.showSuccessMessage('时间段更新成功');
        });
        
        document.querySelector('.btn-cancel-time-slot').addEventListener('click', () => {
            this.renderTimeSlotsList();
        });
    }

    deleteTimeSlot(index) {
        const timeSlot = this.timeSlots[index];
        
        // 检查是否有课程使用了该时间段
        const hasCourses = this.courses.some(course => course.time === timeSlot);
        
        if (hasCourses) {
            if (!confirm(`该时间段（${timeSlot}）已有课程，删除后课程也会被删除，是否继续？`)) {
                return;
            }
            
            // 删除使用该时间段的课程
            this.courses = this.courses.filter(course => course.time !== timeSlot);
            this.saveCourses();
        }
        
        this.timeSlots.splice(index, 1);
        this.saveTimeSlots();
        this.renderTimeSlotsList();
        this.renderCourses();
        this.updateTimeSelect();
        this.showSuccessMessage('时间段删除成功');
    }

    updateTimeSelect() {
        const timeSelect = document.getElementById('time');
        
        // 保存当前选中的值
        const selectedValue = timeSelect.value;
        
        // 清空并重新添加选项
        timeSelect.innerHTML = '<option value="">请选择时间段</option>';
        
        this.timeSlots.forEach(timeSlot => {
            const option = document.createElement('option');
            option.value = timeSlot;
            option.textContent = timeSlot;
            // 如果之前选中的值存在，则保持选中
            if (timeSlot === selectedValue) {
                option.selected = true;
            }
            timeSelect.appendChild(option);
        });
    }

    // 修改renderCourses方法，使其动态生成时间段行
    renderCourses() {
        const emptyState = document.getElementById('emptyState');
        const scheduleGrid = document.getElementById('scheduleGrid');
        
        // 清空课程表网格
        scheduleGrid.innerHTML = '';
        
        // 如果没有时间段，设置默认时间段
        if (this.timeSlots.length === 0) {
            this.timeSlots = [
                '08:00-09:30',
                '09:45-11:15',
                '11:30-13:00',
                '14:00-15:30',
                '15:45-17:15',
                '17:30-19:00',
                '19:15-20:45'
            ];
            this.saveTimeSlots();
            this.updateTimeSelect();
        }
        
        // 渲染时间段行
        this.timeSlots.forEach(timeSlot => {
            const timeSlotDiv = document.createElement('div');
            timeSlotDiv.className = 'time-slot';
            timeSlotDiv.innerHTML = `<div class="time-label">${timeSlot}</div>`;
            
            // 添加每天的课程单元格
            const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
            days.forEach(day => {
                const cell = document.createElement('div');
                cell.className = 'course-cell';
                cell.setAttribute('data-day', day);
                cell.setAttribute('data-time', timeSlot);
                timeSlotDiv.appendChild(cell);
            });
            
            scheduleGrid.appendChild(timeSlotDiv);
        });
        
        if (this.courses.length === 0) {
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');

        // 将课程放置到对应的网格位置
        this.courses.forEach(course => {
            const cell = document.querySelector(`[data-day="${course.day}"][data-time="${course.time}"]`);
            if (cell) {
                cell.classList.add('occupied');
                cell.innerHTML = `
                    <div class="course-item" data-course-id="${course.id}">
                        <button class="delete-btn" onclick="courseManager.deleteCourse('${course.id}')" title="删除课程">×</button>
                        <div class="course-name">${course.name}</div>
                        <div class="course-teacher">${course.teacher}</div>
                        <div class="course-location">教室：${course.location}</div>
                    </div>
                `;
            }
        });
    }

    // 原有方法保持不变
    addCourse(course) {
        // 检查是否有课程冲突
        const conflict = this.courses.find(existingCourse => 
            existingCourse.day === course.day && existingCourse.time === course.time
        );
        
        if (conflict) {
            this.showErrorMessage(`该时间段已有课程：${conflict.name}`);
            return false;
        }
        
        this.courses.push(course);
        this.saveCourses();
        this.renderCourses();
        return true;
    }

    deleteCourse(courseId) {
        this.courses = this.courses.filter(course => course.id !== courseId);
        this.saveCourses();
        this.renderCourses();
    }

    clearForm() {
        document.getElementById('courseForm').reset();
    }

    showSuccessMessage() {
        this.showMessage('✅ 课程添加成功！', '#4CAF50');
    }

    showErrorMessage(text) {
        this.showMessage(`❌ ${text}`, '#f56565');
    }

    showMessage(text, color) {
        // 创建消息提示
        const message = document.createElement('div');
        message.className = 'message';
        message.textContent = text;
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${color};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
            max-width: 300px;
            word-wrap: break-word;
        `;

        document.body.appendChild(message);

        // 3秒后自动移除
        setTimeout(() => {
            message.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (message.parentNode) {
                    message.parentNode.removeChild(message);
                }
            }, 300);
        }, 3000);
    }

    saveCourses() {
        localStorage.setItem('courses', JSON.stringify(this.courses));
    }

    loadCourses() {
        const saved = localStorage.getItem('courses');
        return saved ? JSON.parse(saved) : [];
    }

    // 新增时间段保存和加载方法
    saveTimeSlots() {
        localStorage.setItem('timeSlots', JSON.stringify(this.timeSlots));
    }

    loadTimeSlots() {
        const saved = localStorage.getItem('timeSlots');
        // 如果没有保存的时间段，返回默认时间段
        if (!saved) {
            const defaultTimeSlots = [
                '08:00-09:30',
                '09:45-11:15',
                '11:30-13:00',
                '14:00-15:30',
                '15:45-17:15',
                '17:30-19:00',
                '19:15-20:45'
            ];
            this.saveTimeSlots(defaultTimeSlots);
            return defaultTimeSlots;
        }
        return JSON.parse(saved);
    }
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// 初始化课程管理器
const courseManager = new CourseManager();