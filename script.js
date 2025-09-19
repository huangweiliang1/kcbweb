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
        this.renderTimeSlotsInForm();
    }

    bindEvents() {
        const form = document.getElementById('courseForm');
        const addBtn = document.getElementById('addCourseBtn');
        const closeBtn = document.getElementById('closeModal');
        const cancelBtn = document.getElementById('cancelBtn');
        const modal = document.getElementById('courseModal');
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

    handleSubmit(event) {
        event.preventDefault();
        
        // 获取表单数据
        const courseName = document.getElementById('courseName').value;
        const teacher = document.getElementById('teacher').value;
        const day = document.getElementById('day').value;
        const time = document.getElementById('time').value;
        const location = document.getElementById('location').value;
        const description = document.getElementById('description').value;
        // 获取学生人数
        const studentCount = document.getElementById('studentCount').value;
        
        // 验证数据
        if (!courseName || !teacher || !day || !time || !location) {
            this.showErrorMessage('请填写所有必填字段');
            return;
        }
        
        // 检查是否已存在相同时间和日期的课程
        const exists = this.courses.some(course => course.day === day && course.time === time);
        if (exists) {
            this.showErrorMessage('该时间段已有课程');
            return;
        }
        
        // 创建新课程对象，包含学生人数
        const newCourse = {
            id: Date.now().toString(),
            name: courseName,
            teacher: teacher,
            day: day,
            time: time,
            location: location,
            description: description,
            studentCount: studentCount || '0'  // 如果未填写，默认为0
        };
        
        // 添加课程
        this.addCourse(newCourse);
        
        // 关闭模态框并清空表单
        this.closeModal();
        this.clearForm();
        
        // 显示成功消息
        this.showSuccessMessage('课程添加成功');
    }
    
    openModal() {
        const modal = document.getElementById('courseModal');
        modal.classList.add('show');
        document.body.style.overflow = 'hidden'; // 防止背景滚动
        this.renderTimeSlotsInForm();
    }

    closeModal() {
        const modal = document.getElementById('courseModal');
        modal.classList.remove('show');
        document.body.style.overflow = 'auto'; // 恢复滚动
        this.clearForm();
    }

    openTimeSlotsModal() {
        const modal = document.getElementById('timeSlotsModal');
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        this.renderTimeSlotsManagement();
    }

    closeTimeSlotsModal() {
        const modal = document.getElementById('timeSlotsModal');
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }

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

    renderCourses() {
        // 清空所有课程单元格
        document.querySelectorAll('.course-cell').forEach(cell => {
            cell.innerHTML = '';
        });
        
        // 根据课程数据渲染课程
        this.courses.forEach(course => {
            const { day, time } = course;
            const cell = document.querySelector(`.course-cell[data-day="${day}"][data-time="${time}"]`);
            
            if (cell) {
                // 创建课程项元素
                const courseItem = document.createElement('div');
                courseItem.className = 'course-item';
                courseItem.setAttribute('data-course-id', course.id);
                
                // 设置课程项的基本信息
                courseItem.innerHTML = `
                    <div class="course-name">${course.name}</div>
                    <div class="course-teacher">${course.teacher}</div>
                    <div class="course-location">${course.location}</div>
                    <button class="delete-btn" data-course-id="${course.id}">×</button>
                `;
                
                // 添加鼠标悬浮显示更多信息的功能
                courseItem.addEventListener('mouseenter', (e) => {
                    // 避免在点击删除按钮时显示提示
                    if (e.target.classList.contains('delete-btn')) return;
                    
                    // 创建提示框
                    const tooltip = document.createElement('div');
                    tooltip.className = 'course-tooltip';
                    tooltip.id = `tooltip-${course.id}`;
                    
                    // 设置提示框内容，包含所有额外信息
                    tooltip.innerHTML = `
                        <div class="tooltip-header">${course.name}</div>
                        <div class="tooltip-content">
                            <div><strong>教师：</strong>${course.teacher}</div>
                            <div><strong>时间：</strong>${day} ${time}</div>
                            <div><strong>地点：</strong>${course.location}</div>
                            <div><strong>学生人数：</strong>${course.studentCount}</div>
                            ${course.description ? `<div><strong>描述：</strong>${course.description}</div>` : ''}
                        </div>
                    `;
                    
                    // 设置提示框位置
                    const rect = courseItem.getBoundingClientRect();
                    tooltip.style.position = 'fixed';
                    tooltip.style.left = `${rect.right + 10}px`;
                    tooltip.style.top = `${rect.top}px`;
                    tooltip.style.zIndex = '1001';
                    
                    // 添加到文档
                    document.body.appendChild(tooltip);
                });
                
                // 鼠标离开时移除提示框
                courseItem.addEventListener('mouseleave', () => {
                    const tooltip = document.getElementById(`tooltip-${course.id}`);
                    if (tooltip) {
                        document.body.removeChild(tooltip);
                    }
                });
                
                // 添加删除课程的事件监听
                courseItem.querySelector('.delete-btn').addEventListener('click', (e) => {
                    e.stopPropagation(); // 阻止事件冒泡
                    this.deleteCourse(course.id);
                });
                
                // 将课程项添加到单元格
                cell.appendChild(courseItem);
            }
        });
        
        // 更新空状态显示
        this.updateEmptyState();
    }

    updateEmptyState() {
        const emptyState = document.getElementById('emptyState');
        
        if (this.courses.length === 0) {
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
        }
    }

    // 时间段管理相关方法
    renderTimeSlotsInForm() {
        const timeSelect = document.getElementById('time');
        timeSelect.innerHTML = '<option value="">请选择时间段</option>';
        
        this.timeSlots.forEach(timeSlot => {
            const option = document.createElement('option');
            option.value = timeSlot;
            option.textContent = timeSlot;
            timeSelect.appendChild(option);
        });
    }

    renderTimeSlotsManagement() {
        const timeSlotsList = document.getElementById('timeSlotsList');
        timeSlotsList.innerHTML = '';
        
        if (this.timeSlots.length === 0) {
            timeSlotsList.innerHTML = `
                <div class="empty-time-slots">
                    <p>暂无自定义时间段，请添加新的时间段</p>
                </div>
            `;
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
        
        // 清空列表，显示添加表单
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
            this.renderTimeSlotsManagement();
            this.renderCourses();
            this.renderTimeSlotsInForm();
            this.showSuccessMessage('时间段添加成功');
        });
        
        document.querySelector('.btn-cancel-time-slot').addEventListener('click', () => {
            this.renderTimeSlotsManagement();
        });
    }

    editTimeSlot(index) {
        const timeSlot = this.timeSlots[index];
        const [startTime, endTime] = timeSlot.split('-');
        const timeSlotsList = document.getElementById('timeSlotsList');
        
        // 清空列表，显示编辑表单
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
            if (hasCourses && confirm('该时间段已有课程，修改后课程时间也会相应更新，是否继续？')) {
                // 更新使用该时间段的课程
                this.courses.forEach(course => {
                    if (course.time === this.timeSlots[index]) {
                        course.time = updatedTimeSlot;
                    }
                });
                this.saveCourses();
            }
            
            this.timeSlots[index] = updatedTimeSlot;
            this.timeSlots.sort(); // 按时间排序
            this.saveTimeSlots();
            this.renderTimeSlotsManagement();
            this.renderCourses();
            this.renderTimeSlotsInForm();
            this.showSuccessMessage('时间段更新成功');
        });
        
        document.querySelector('.btn-cancel-time-slot').addEventListener('click', () => {
            this.renderTimeSlotsManagement();
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
        this.renderTimeSlotsManagement();
        this.renderCourses();
        this.renderTimeSlotsInForm();
        this.showSuccessMessage('时间段删除成功');
    }

    clearForm() {
        document.getElementById('courseForm').reset();
    }

    showSuccessMessage(text = '操作成功') {
        this.showMessage(`✅ ${text}！`, '#4CAF50');
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
            animation: messageSlideIn 0.3s ease-out;
            max-width: 300px;
            word-wrap: break-word;
        `;

        document.body.appendChild(message);

        // 3秒后自动移除
        setTimeout(() => {
            message.style.animation = 'messageSlideOut 0.3s ease-in';
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

    // 只保留带有错误处理的loadCourses方法
    loadCourses() {
        try {
            const saved = localStorage.getItem('courses');
            if (!saved) {
                return [];
            }
            
            const parsedData = JSON.parse(saved);
            if (Array.isArray(parsedData)) {
                return parsedData;
            } else {
                return [];
            }
        } catch (error) {
            console.error('Error parsing courses from localStorage:', error);
            return [];
        }
    }

    saveTimeSlots(timeSlots) {
        if (timeSlots) {
            localStorage.setItem('timeSlots', JSON.stringify(timeSlots));
        } else {
            localStorage.setItem('timeSlots', JSON.stringify(this.timeSlots));
        }
    }

    loadTimeSlots() {
        try {
            const saved = localStorage.getItem('timeSlots');
            // If there's no saved data or it's invalid, return default time slots
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
            
            // Try to parse the saved data
            const parsedData = JSON.parse(saved);
            // Verify that the parsed data is an array
            if (Array.isArray(parsedData)) {
                return parsedData;
            } else {
                // If data is not an array, use defaults
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
        } catch (error) {
            // If there's any error during parsing, use default time slots
            console.error('Error parsing time slots from localStorage:', error);
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
    }
}

// 添加CSS动画 - 移到了类外部，这是正确的位置
const style = document.createElement('style');
style.textContent = `
    @keyframes messageSlideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes messageSlideOut {
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
