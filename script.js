// 课程表管理系统 JavaScript

class CourseManager {
    constructor() {
        this.courses = this.loadCourses();
        this.timeSlots = this.loadTimeSlots();
        this.currentTooltip = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderScheduleGrid();
        this.renderCourses();
        this.renderTimeSlotsInForm();

        // 添加窗口大小变化事件监听
        window.addEventListener('resize', () => {
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(() => {
                this.renderScheduleGrid();
                this.renderCourses();
            }, 200);
        });
    }

    bindEvents() {
        // 获取所有需要的DOM元素
        const form = document.getElementById('courseForm');
        const addBtn = document.getElementById('addCourseBtn');
        const closeBtn = document.getElementById('closeModal');
        const cancelBtn = document.getElementById('cancelBtn');
        const modal = document.getElementById('courseModal');
        const manageTimeSlotsBtn = document.getElementById('manageTimeSlotsBtn');
        const timeSlotsModal = document.getElementById('timeSlotsModal');
        const closeTimeSlotsModal = document.getElementById('closeTimeSlotsModal');
        const addTimeSlotBtn = document.getElementById('addTimeSlotBtn');
        const detailModal = document.getElementById('courseDetailModal');
        const closeDetailModal = document.getElementById('closeDetailModal');

        // 确保所有关键DOM元素存在
        if (!form || !addBtn || !manageTimeSlotsBtn || !modal || !timeSlotsModal) {
            console.error('关键DOM元素未找到');
            return;
        }

        // 安全地添加事件监听器（只对存在的元素添加）
        form.addEventListener('submit', (e) => this.handleSubmit(e));

        if (addBtn) {
            addBtn.addEventListener('click', () => this.openModal());
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeModal());
        }

        if (manageTimeSlotsBtn) {
            manageTimeSlotsBtn.addEventListener('click', () => this.openTimeSlotsModal());
        }

        if (closeTimeSlotsModal) {
            closeTimeSlotsModal.addEventListener('click', () => this.closeTimeSlotsModal());
        }

        if (addTimeSlotBtn) {
            addTimeSlotBtn.addEventListener('click', () => this.addNewTimeSlot());
        }

        if (closeDetailModal) {
            closeDetailModal.addEventListener('click', () => this.closeDetailModal());
        }

        // 点击模态框背景关闭
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }

        if (timeSlotsModal) {
            timeSlotsModal.addEventListener('click', (e) => {
                if (e.target === timeSlotsModal) {
                    this.closeTimeSlotsModal();
                }
            });
        }

        if (detailModal) {
            detailModal.addEventListener('click', (e) => {
                if (e.target === detailModal) {
                    this.closeDetailModal();
                }
            });
        }

        // ESC键关闭模态框
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (modal && modal.classList.contains('show')) {
                    this.closeModal();
                }
                if (timeSlotsModal && timeSlotsModal.classList.contains('show')) {
                    this.closeTimeSlotsModal();
                }
                if (detailModal && detailModal.classList.contains('show')) {
                    this.closeDetailModal();
                }
            }
        });

        // 时间段管理模态框中的删除按钮和编辑按钮事件委托
        const timeSlotsContainer = document.getElementById('timeSlotsList');
        if (timeSlotsContainer) {
            timeSlotsContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('delete-time-slot')) {
                    const index = e.target.dataset.index;
                    this.deleteTimeSlot(index);
                } else if (e.target.classList.contains('edit-time-slot')) {
                    const index = e.target.dataset.index;
                    this.editTimeSlot(index);
                } else if (e.target.classList.contains('save-time-slot')) {
                    const index = e.target.dataset.index;
                    this.saveTimeSlot(index);
                } else if (e.target.classList.contains('cancel-edit-time-slot')) {
                    this.renderTimeSlotsManagement();
                }
            });
        }
    }

 openModal() {
    const modal = document.getElementById('courseModal');
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden'; // 防止背景滚动
        this.renderTimeSlotsInForm();

        // 移动端特殊处理
        if (window.innerWidth <= 768) {
            // 确保模态框内容可以滚动
            const modalContent = modal.querySelector('.modal-content');
            const modalBody = modal.querySelector('.modal-body');
            if (modalContent && modalBody) {
                modalContent.style.maxHeight = '90vh';
                modalBody.style.maxHeight = 'calc(90vh - 120px)';
                modalBody.style.overflowY = 'auto';
                modalBody.style.webkitOverflowScrolling = 'touch';
            }
        }
    }
}


    closeModal() {
        const modal = document.getElementById('courseModal');
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = 'auto'; // 恢复滚动
            this.clearForm();
        }
    }

    openTimeSlotsModal() {
        const modal = document.getElementById('timeSlotsModal');
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
            this.renderTimeSlotsManagement();
        }
    }

    closeTimeSlotsModal() {
        const modal = document.getElementById('timeSlotsModal');
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = 'auto';
        }
    }

    openCourseDetailModal(course) {
        const modal = document.getElementById('courseDetailModal');
        if (modal) {
            // 动态创建课程详情内容
            const courseDetailContent = document.getElementById('courseDetailContent');
            if (courseDetailContent) {
                courseDetailContent.innerHTML = `
                    <div class="course-detail-item">
                        <strong>课程名称：</strong>
                        <span>${course.name}</span>
                    </div>
                    <div class="course-detail-item">
                        <strong>授课教师：</strong>
                        <span>${course.teacher}</span>
                    </div>
                    <div class="course-detail-item">
                        <strong>上课时间：</strong>
                        <span>${course.day} ${course.time}</span>
                    </div>
                    <div class="course-detail-item">
                        <strong>上课地点：</strong>
                        <span>${course.location}</span>
                    </div>
                    <div class="course-detail-item">
                        <strong>学生人数：</strong>
                        <span>${course.studentCount || '暂无数据'}</span>
                    </div>
                    <div class="course-detail-item">
                        <strong>课程描述：</strong>
                        <span>${course.description || '暂无描述'}</span>
                    </div>
                `;
            }

            modal.classList.add('show');
        }
    }

    closeDetailModal() {
        const modal = document.getElementById('courseDetailModal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    clearForm() {
        const form = document.getElementById('courseForm');
        if (form) {
            form.reset();
        }
    }

    handleSubmit(event) {
        event.preventDefault();

        // 获取表单数据
        const courseName = document.getElementById('courseName')?.value || '';
        const teacher = document.getElementById('teacher')?.value || '';
        const day = document.getElementById('day')?.value || '';
        const time = document.getElementById('time')?.value || '';
        const location = document.getElementById('location')?.value || '';
        const description = document.getElementById('description')?.value || '';
        const studentCount = document.getElementById('studentCount')?.value || '0';

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
            studentCount: studentCount
        };

        // 添加课程
        this.addCourse(newCourse);

        // 关闭模态框并清空表单
        this.closeModal();
        this.clearForm();

        // 显示成功消息
        this.showSuccessMessage('课程添加成功');
    }

    addCourse(course) {
        this.courses.push(course);
        this.saveCourses();
        this.renderCourses();
    }

    deleteCourse(id) {
        this.courses = this.courses.filter(course => course.id !== id);
        this.saveCourses();
        this.renderCourses();
        this.showSuccessMessage('课程删除成功');
    }

    renderCourses() {
        // 清空所有课程单元格
        const courseCells = document.querySelectorAll('.course-cell');
        courseCells.forEach(cell => {
            cell.innerHTML = '';
            cell.classList.remove('occupied');
        });

        // 渲染课程
        this.courses.forEach(course => {
            // 查找对应的课程单元格
            const courseCell = document.querySelector(`.course-cell[data-day="${course.day}"][data-time="${course.time}"]`);

            if (courseCell) {
                // 创建课程项元素
                const courseItem = document.createElement('div');
                courseItem.className = 'course-item';

                // 构建课程项的HTML内容
                courseItem.innerHTML = `
                    <div class="course-name">${course.name}</div>
                    <div class="course-teacher">${course.teacher}</div>
                    <div class="course-location">${course.location}</div>
                    <button class="delete-btn" data-id="${course.id}">×</button>
                `;

                // 鼠标悬浮显示完整信息
                courseItem.addEventListener('mouseenter', (e) => {
                    this.showTooltip(e, course);
                });

                courseItem.addEventListener('mouseleave', () => {
                    this.hideTooltip();
                });

                // 点击课程项查看详情
                courseItem.addEventListener('click', (e) => {
                    if (!e.target.classList.contains('delete-btn')) {
                        this.openCourseDetailModal(course);
                    }
                });

                // 删除课程
                const deleteBtn = courseItem.querySelector('.delete-btn');
                if (deleteBtn) {
                    deleteBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.deleteCourse(course.id);
                    });
                }

                courseCell.appendChild(courseItem);
                courseCell.classList.add('occupied');
            }
        });
    }

    renderTimeSlotsInForm() {
        const timeSelect = document.getElementById('time');
        if (!timeSelect) return;

        timeSelect.innerHTML = '';

        // 添加默认选项
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '请选择时间段';
        timeSelect.appendChild(defaultOption);

        // 添加时间段选项
        this.timeSlots.forEach(timeSlot => {
            const option = document.createElement('option');
            option.value = timeSlot;
            option.textContent = timeSlot;
            timeSelect.appendChild(option);
        });
    }

    renderTimeSlotsManagement() {
        const container = document.getElementById('timeSlotsList');
        if (!container) return;

        container.innerHTML = '';

        this.timeSlots.forEach((timeSlot, index) => {
            const timeSlotItem = document.createElement('div');
            timeSlotItem.className = 'time-slot-item';
            timeSlotItem.innerHTML = `
                <span class="time-slot-text">${timeSlot}</span>
                <div class="time-slot-actions">
                    <button class="edit-time-slot" data-index="${index}">编辑</button>
                    <button class="delete-time-slot" data-index="${index}">删除</button>
                </div>
            `;

            container.appendChild(timeSlotItem);
        });
    }

    // 编辑时间段
    editTimeSlot(index) {
        const container = document.getElementById('timeSlotsList');
        if (!container) return;

        const timeSlotItems = container.querySelectorAll('.time-slot-item');
        if (index >= 0 && index < timeSlotItems.length) {
            const timeSlotItem = timeSlotItems[index];
            const timeSlotText = this.timeSlots[index];

            timeSlotItem.innerHTML = `
                <input type="text" class="time-slot-input" value="${timeSlotText}">
                <div class="time-slot-actions">
                    <button class="save-time-slot" data-index="${index}">保存</button>
                    <button class="cancel-edit-time-slot" data-index="${index}">取消</button>
                </div>
            `;

            // 聚焦到输入框
            const input = timeSlotItem.querySelector('.time-slot-input');
            if (input) {
                input.focus();
            }
        }
    }

    // 保存编辑后的时间段
    saveTimeSlot(index) {
        const container = document.getElementById('timeSlotsList');
        if (!container) return;

        const timeSlotItems = container.querySelectorAll('.time-slot-item');
        if (index >= 0 && index < timeSlotItems.length) {
            const timeSlotItem = timeSlotItems[index];
            const input = timeSlotItem.querySelector('.time-slot-input');

            if (input) {
                const newTimeSlot = input.value.trim();

                if (!newTimeSlot) {
                    this.showErrorMessage('时间段不能为空');
                    return;
                }

                // 检查是否与其他时间段重复
                if (this.timeSlots.includes(newTimeSlot) && newTimeSlot !== this.timeSlots[index]) {
                    this.showErrorMessage('该时间段已存在');
                    return;
                }

                // 检查是否有课程使用该时间段
                const hasCourses = this.courses.some(course => course.time === this.timeSlots[index]);

                if (hasCourses) {
                    if (!confirm(`该时间段（${this.timeSlots[index]}）已有课程，修改后课程的时间也会更新，是否继续？`)) {
                        return;
                    }

                    // 更新使用该时间段的课程
                    this.courses.forEach(course => {
                        if (course.time === this.timeSlots[index]) {
                            course.time = newTimeSlot;
                        }
                    });
                    this.saveCourses();
                    this.renderCourses();
                }

                // 更新时间段
                this.timeSlots[index] = newTimeSlot;
                this.saveTimeSlots();
                this.renderTimeSlotsManagement();
                this.renderTimeSlotsInForm();
                this.renderScheduleGrid();
                this.showSuccessMessage('时间段修改成功');
            }
        }
    }

    addNewTimeSlot() {
        const newTimeSlotInput = document.getElementById('newTimeSlot');
        if (!newTimeSlotInput) return;

        const newTimeSlot = newTimeSlotInput.value.trim();

        if (!newTimeSlot) {
            this.showErrorMessage('请输入时间段');
            return;
        }

        if (this.timeSlots.includes(newTimeSlot)) {
            this.showErrorMessage('该时间段已存在');
            return;
        }

        this.timeSlots.push(newTimeSlot);
        this.saveTimeSlots();
        this.renderTimeSlotsManagement();
        this.renderTimeSlotsInForm();
        newTimeSlotInput.value = '';
        this.showSuccessMessage('时间段添加成功');
    }

    deleteTimeSlot(index) {
        // 检查是否有课程使用该时间段
        if (this.courses.some(course => course.time === this.timeSlots[index])) {
            this.showErrorMessage('该时间段已有课程，无法删除');
            return;
        }

        this.timeSlots.splice(index, 1);
        this.saveTimeSlots();
        this.renderTimeSlotsManagement();
        this.renderTimeSlotsInForm();
        this.renderScheduleGrid(); // 重新渲染课程表网格
        this.showSuccessMessage('时间段删除成功');
    }

    showTooltip(event, course) {
        // 隐藏已有的提示框
        this.hideTooltip();

        // 创建提示框
        const tooltip = document.createElement('div');
        tooltip.className = 'course-tooltip';
        tooltip.innerHTML = `
            <h4>${course.name}</h4>
            <p><strong>教师：</strong>${course.teacher}</p>
            <p><strong>时间：</strong>${course.day} ${course.time}</p>
            <p><strong>地点：</strong>${course.location}</p>
            <p><strong>学生人数：</strong>${course.studentCount || '暂无数据'}</p>
            ${course.description ? `<p><strong>描述：</strong>${course.description}</p>` : ''}
        `;

        // 设置位置
        tooltip.style.position = 'fixed';
        tooltip.style.left = (event.clientX + 10) + 'px';
        tooltip.style.top = (event.clientY + 10) + 'px';

        // 添加到body
        document.body.appendChild(tooltip);

        // 保存引用
        this.currentTooltip = tooltip;
    }

    hideTooltip() {
        if (this.currentTooltip) {
            document.body.removeChild(this.currentTooltip);
            this.currentTooltip = null;
        }
    }

    showSuccessMessage(message) {
        this.showMessage(message, 'success');
    }

    showErrorMessage(message) {
        this.showMessage(message, 'error');
    }

    showMessage(message, type = 'info') {
        // 创建消息元素
        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}`;
        messageElement.textContent = message;

        // 添加到body
        document.body.appendChild(messageElement);

        // 设置动画
        messageElement.style.animation = 'messageSlideIn 0.5s forwards';

        // 3秒后移除
        setTimeout(() => {
            messageElement.style.animation = 'messageSlideOut 0.5s forwards';
            setTimeout(() => {
                if (document.body.contains(messageElement)) {
                    document.body.removeChild(messageElement);
                }
            }, 500);
        }, 3000);
    }

    saveCourses() {
        try {
            localStorage.setItem('courses', JSON.stringify(this.courses));
        } catch (error) {
            console.error('保存课程数据失败:', error);
            this.showErrorMessage('保存课程数据失败');
        }
    }

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
            console.error('读取课程数据失败:', error);
            return [];
        }
    }

    saveTimeSlots() {
        try {
            localStorage.setItem('timeSlots', JSON.stringify(this.timeSlots));
        } catch (error) {
            console.error('保存时间段数据失败:', error);
            this.showErrorMessage('保存时间段数据失败');
        }
    }

    loadTimeSlots() {
        try {
            const storedTimeSlots = localStorage.getItem('timeSlots');
            if (storedTimeSlots) {
                const parsedData = JSON.parse(storedTimeSlots);
                if (Array.isArray(parsedData) && parsedData.length > 0) {
                    return parsedData;
                }
            }

            // 默认时间段
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
        } catch (error) {
            // 如果解析出错，使用默认时间段
            console.error('读取时间段数据失败:', error);
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

    // 检测是否为移动设备
    isMobile() {
        return window.innerWidth <= 768;
    }

    // 渲染课程表网格
    renderScheduleGrid() {
        const scheduleGrid = document.getElementById('scheduleGrid');
        if (!scheduleGrid) return;

        scheduleGrid.innerHTML = '';

        // 检查是否为移动设备
        const isMobile = this.isMobile();

        // 设置容器样式以支持横向滚动
        const scheduleContainer = document.querySelector('.schedule-container');
        if (isMobile) {
            scheduleContainer.style.overflowX = 'auto';
            scheduleContainer.style.webkitOverflowScrolling = 'touch';
            scheduleContainer.style.minWidth = '600px';
        } else {
            scheduleContainer.style.overflowX = 'visible';
            scheduleContainer.style.minWidth = 'auto';
        }

        this.timeSlots.forEach(timeSlot => {
            const timeSlotElement = document.createElement('div');
            timeSlotElement.className = 'time-slot';

            let html = `<div class="time-label">${timeSlot}</div>`;

            const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
            days.forEach(day => {
                html += `<div class="course-cell" data-day="${day}" data-time="${timeSlot}"></div>`;
            });

            timeSlotElement.innerHTML = html;
            scheduleGrid.appendChild(timeSlotElement);
        });
    }
}

// 添加CSS动画
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
document.addEventListener('DOMContentLoaded', () => {
    window.courseManager = new CourseManager();
});
