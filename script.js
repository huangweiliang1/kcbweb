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
        
        // 初始化颜色选择器
        this.setupColorPickerListeners();
    }
    
    // 设置颜色选择器事件监听
    setupColorPickerListeners() {
        const colorInput = document.getElementById('courseColor');
        const colorPresets = document.querySelectorAll('.color-preset');
        
        if (colorInput && colorPresets.length > 0) {
            // 监听预设颜色点击
            colorPresets.forEach(preset => {
                preset.addEventListener('click', () => {
                    const color = preset.getAttribute('data-color');
                    if (color) {
                        colorInput.value = color;
                        
                        // 更新选中状态
                        colorPresets.forEach(p => p.classList.remove('selected'));
                        preset.classList.add('selected');
                    }
                });
            });
            
            // 监听颜色输入变化
            colorInput.addEventListener('input', () => {
                // 更新预设颜色的选中状态
                const currentColor = colorInput.value;
                colorPresets.forEach(preset => {
                    if (preset.getAttribute('data-color') === currentColor) {
                        preset.classList.add('selected');
                    } else {
                        preset.classList.remove('selected');
                    }
                });
            });
            
            // 设置初始选中状态
            const initialColor = colorInput.value;
            colorPresets.forEach(preset => {
                if (preset.getAttribute('data-color') === initialColor) {
                    preset.classList.add('selected');
                }
            });
        }
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
                // 获取课程颜色并计算合适的文字颜色
                const courseColor = course.color || '#667eea';
                const textColor = this.getContrastColor(courseColor);
                
                courseDetailContent.innerHTML = `
                    <div class="course-detail-item">
                        <strong>课程名称：</strong>
                        <span>${course.name || '未命名'}</span>
                    </div>
                    <div class="course-detail-item">
                        <strong>授课教师：</strong>
                        <span>${course.teacher || '未设置'}</span>
                    </div>
                    <div class="course-detail-item">
                        <strong>上课时间：</strong>
                        <span>${course.day} ${course.time}</span>
                    </div>
                    <div class="course-detail-item">
                        <strong>上课地点：</strong>
                        <span>${course.location || '未设置'}</span>
                    </div>
                    <div class="course-detail-item">
                        <strong>学生人数：</strong>
                        <span>${course.studentCount || '暂无数据'}</span>
                    </div>
                    <div class="course-detail-item">
                        <strong>课程分类：</strong>
                        <span>${course.type || '其他'}</span>
                    </div>
                    <div class="course-detail-item">
                        <strong>课程颜色：</strong>
                        <span class="color-display" style="background-color: ${courseColor}; border: 1px solid #ddd; width: 30px; height: 30px; display: inline-block; border-radius: 4px;"></span>
                        <span style="margin-left: 8px; color: #666;">${courseColor}</span>
                    </div>
                    <div class="course-detail-item">
                        <strong>课程描述：</strong>
                        <span>${course.description || '暂无描述'}</span>
                    </div>
                    <div class="modal-actions" style="margin-top: 20px;">
                        <button id="editCourseBtn" class="btn-primary" data-id="${course.id}" style="background-color: ${courseColor}; border-color: ${courseColor}; color: ${textColor};">编辑课程</button>
                    </div>
                `;
            }
            
            modal.classList.add('show');

            // 添加编辑按钮事件监听
            const editBtn = document.getElementById('editCourseBtn');
            if (editBtn) {
                editBtn.addEventListener('click', () => {
                    this.closeDetailModal();
                    this.editCourse(course);
                });
            }
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
            // 移除编辑模式标识
            form.dataset.editId = '';
            form.dataset.originalDay = '';
            form.dataset.originalTime = '';
            
            // 恢复day和time的可用状态
            const daySelect = document.getElementById('day');
            const timeSelect = document.getElementById('time');
            if (daySelect) daySelect.disabled = false;
            if (timeSelect) timeSelect.disabled = false;
            
            // 移除时间锁定提示
            const timeNote = daySelect?.parentElement?.querySelector('.time-lock-note');
            if (timeNote) {
                timeNote.remove();
            }
            
            // 恢复模态框标题
            const modalTitle = document.querySelector('#courseModal .modal-header h3');
            if (modalTitle) {
                modalTitle.textContent = '添加新课程';
            }
        }
    }

    // 编辑课程
    editCourse(course) {
        const modal = document.getElementById('courseModal');
        const form = document.getElementById('courseForm');
        
        if (modal && form) {
            // 设置编辑模式
            form.dataset.editId = course.id;
            // 存储原始的day和time，用于更新时保持位置不变
            form.dataset.originalDay = course.day;
            form.dataset.originalTime = course.time;
            
            // 修改模态框标题
            const modalTitle = document.querySelector('#courseModal .modal-header h3');
            if (modalTitle) {
                modalTitle.textContent = '编辑课程';
            }
            
            // 填充表单数据
            document.getElementById('courseName').value = course.name;
            document.getElementById('teacher').value = course.teacher;
            
            // 设置day和time为禁用状态，用户不需要选择时间位置
            const daySelect = document.getElementById('day');
            const timeSelect = document.getElementById('time');
            daySelect.value = course.day;
            timeSelect.value = course.time;
            daySelect.disabled = true;
            timeSelect.disabled = true;
            
            // 添加提示文本说明时间不可修改
            const timeContainer = daySelect.parentElement;
            if (timeContainer && !timeContainer.querySelector('.time-lock-note')) {
                const note = document.createElement('div');
                note.className = 'time-lock-note';
                note.style.fontSize = '0.8rem';
                note.style.color = '#666';
                note.style.marginTop = '4px';
                note.textContent = '时间位置已锁定，直接修改其他信息即可';
                timeContainer.appendChild(note);
            }
            
            document.getElementById('location').value = course.location;
            document.getElementById('studentCount').value = course.studentCount || '';
            document.getElementById('courseType').value = course.type || '必修课';
            document.getElementById('courseColor').value = course.color || '#667eea';
            document.getElementById('description').value = course.description || '';
            
            // 显示模态框
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
            this.renderTimeSlotsInForm();
        }
    }

    handleSubmit(event) {
        event.preventDefault();

        // 获取表单数据
        const courseName = document.getElementById('courseName')?.value || '';
        const teacher = document.getElementById('teacher')?.value || '';
        const location = document.getElementById('location')?.value || '';
        const description = document.getElementById('description')?.value || '';
        const studentCount = document.getElementById('studentCount')?.value || '0';
        const courseType = document.getElementById('courseType')?.value || '必修课';
        const courseColor = document.getElementById('courseColor')?.value || '#667eea';
        
        // 获取编辑模式标识和原始时间信息
        const form = document.getElementById('courseForm');
        const editId = form?.dataset?.editId;
        
        // 编辑模式下使用原始的day和time，保持位置不变
        let day, time;
        if (editId) {
            day = form?.dataset?.originalDay;
            time = form?.dataset?.originalTime;
        } else {
            // 添加新课程时需要选择时间
            day = document.getElementById('day')?.value || '';
            time = document.getElementById('time')?.value || '';
        }

        // 验证数据
        if (!courseName || !teacher || !location) {
            this.showErrorMessage('请填写课程名称、教师和地点');
            return;
        }
        
        // 添加新课程时需要验证时间
        if (!editId && (!day || !time)) {
            this.showErrorMessage('请选择上课时间');
            return;
        }

        // 检查是否已存在相同时间和日期的课程
        // 编辑模式下不需要检查，因为使用的是原始位置
        if (!editId) {
            const exists = this.courses.some(course => 
                course.day === day && 
                course.time === time
            );
            
            if (exists) {
                this.showErrorMessage('该时间段已有课程');
                return;
            }
        }

        if (editId) {
            // 编辑现有课程
            const courseIndex = this.courses.findIndex(course => course.id === editId);
            if (courseIndex !== -1) {
                this.courses[courseIndex] = {
                    ...this.courses[courseIndex],
                    name: courseName,
                    teacher: teacher,
                    day: day,
                    time: time,
                    location: location,
                    description: description,
                    studentCount: studentCount,
                    type: courseType,
                    color: courseColor
                };
                this.saveCourses();
                this.renderCourses();
                this.closeModal();
                this.clearForm();
                this.showSuccessMessage('课程修改成功');
            }
        } else {
            // 创建新课程对象，包含学生人数、分类和颜色
            const newCourse = {
                id: Date.now().toString(),
                name: courseName,
                teacher: teacher,
                day: day,
                time: time,
                location: location,
                description: description,
                studentCount: studentCount,
                type: courseType,
                color: courseColor
            };

            // 添加课程
            this.addCourse(newCourse);

            // 关闭模态框并清空表单
            this.closeModal();
            this.clearForm();

            // 显示成功消息
            this.showSuccessMessage('课程添加成功');
        }
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
            // 重置样式
            cell.style.backgroundColor = '';
            cell.style.color = '';
        });

        // 渲染课程
        this.courses.forEach(course => {
            // 查找对应的课程单元格
            const courseCell = document.querySelector(`.course-cell[data-day="${course.day}"][data-time="${course.time}"]`);

            if (courseCell) {
                // 获取课程颜色，如果没有设置则使用默认颜色
                const courseColor = course.color || '#667eea';
                
                // 根据背景色计算合适的文字颜色，确保对比度
                const textColor = this.getContrastColor(courseColor);

                // 创建课程项元素
                const courseItem = document.createElement('div');
                courseItem.className = 'course-item';
                
                // 应用颜色样式
                courseItem.style.backgroundColor = courseColor;
                courseItem.style.color = textColor;
                courseItem.style.border = `1px solid ${textColor}33`; // 添加半透明边框

                // 构建课程项的HTML内容，确保内容正常显示
                courseItem.innerHTML = `
                    <div class="course-type">${course.type || '其他'}</div>
                    <div class="course-name">${course.name || '未命名'}</div>
                    <div class="course-teacher">${course.teacher || '未设置'}</div>
                    <div class="course-location">${course.location || '未设置'}</div>
                    <button class="delete-btn" data-id="${course.id}" style="color: ${textColor};">×</button>
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

                // 设置课程单元格样式
                courseCell.style.backgroundColor = courseColor;
                courseCell.style.color = textColor;
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
        
        // 获取课程颜色和对应的文字颜色
        const courseColor = course.color || '#667eea';
        const textColor = this.getContrastColor(courseColor);
        
        // 应用适当的样式，确保良好的对比度
        tooltip.innerHTML = `
            <h4 style="background-color: ${courseColor}; color: ${textColor}; padding: 8px 12px; margin: 0; border-radius: 4px 4px 0 0; border: none;">${course.name || '未命名'}</h4>
            <div style="padding: 10px; background-color: #fff; border-radius: 0 0 4px 4px; border: none;">
                <p style="margin: 4px 0; color: #333;"><strong>分类：</strong>${course.type || '其他'}</p>
                <p style="margin: 4px 0; color: #333;"><strong>教师：</strong>${course.teacher || '未设置'}</p>
                <p style="margin: 4px 0; color: #333;"><strong>时间：</strong>${course.day} ${course.time}</p>
                <p style="margin: 4px 0; color: #333;"><strong>地点：</strong>${course.location || '未设置'}</p>
                <p style="margin: 4px 0; color: #333;"><strong>学生人数：</strong>${course.studentCount || '暂无数据'}</p>
                ${course.description ? `<p style="margin: 4px 0; color: #333;"><strong>描述：</strong>${course.description}</p>` : ''}
            </div>
        `;

        // 设置位置和样式，移除黑色边框
        tooltip.style.position = 'fixed';
        tooltip.style.left = (event.clientX + 10) + 'px';
        tooltip.style.top = (event.clientY + 10) + 'px';
        tooltip.style.zIndex = '1000';
        tooltip.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        tooltip.style.borderRadius = '4px';
        tooltip.style.border = `2px solid ${courseColor}`;
        tooltip.style.background = 'transparent';
        tooltip.style.padding = '0';

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

    // 获取对比度文字颜色 - 优化版
    getContrastColor(backgroundColor) {
        // 确保输入是有效的十六进制颜色
        if (!backgroundColor || typeof backgroundColor !== 'string') {
            return '#000000'; // 默认返回黑色
        }
        
        // 处理各种十六进制颜色格式 (#FFF, #FFFFFF)
        let hex = backgroundColor.replace('#', '');
        if (hex.length === 3) {
            hex = hex.split('').map(char => char + char).join('');
        }
        
        // 转换为RGB
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        // 计算相对亮度 (使用WCAG标准公式)
        const [R, G, B] = [r, g, b].map(component => {
            const value = component / 255;
            return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
        });
        
        // 计算相对亮度
        const luminance = 0.2126 * R + 0.7152 * G + 0.0722 * B;
        
        // 根据亮度返回高对比度文字颜色
        // 对于亮色背景使用深灰色代替纯黑，对于暗色背景使用近白色代替纯白
        // 这样可以避免过于刺眼的对比
        if (luminance > 0.5) {
            // 亮色背景 -> 深灰色文字
            return '#333333';
        } else {
            // 暗色背景 -> 近白色文字
            return '#FFFFFF';
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
