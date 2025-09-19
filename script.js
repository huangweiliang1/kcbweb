// 课程表管理系统 JavaScript

class CourseManager {
    constructor() {
        this.courses = this.loadCourses();
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderCourses();
    }

    bindEvents() {
        const form = document.getElementById('courseForm');
        const addBtn = document.getElementById('addCourseBtn');
        const closeBtn = document.getElementById('closeModal');
        const cancelBtn = document.getElementById('cancelBtn');
        const modal = document.getElementById('courseModal');

        form.addEventListener('submit', (e) => this.handleSubmit(e));
        addBtn.addEventListener('click', () => this.openModal());
        closeBtn.addEventListener('click', () => this.closeModal());
        cancelBtn.addEventListener('click', () => this.closeModal());
        
        // 点击模态框背景关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });

        // ESC键关闭模态框
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('show')) {
                this.closeModal();
            }
        });
    }

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
        document.body.style.overflow = 'hidden'; // 防止背景滚动
    }

    closeModal() {
        const modal = document.getElementById('courseModal');
        modal.classList.remove('show');
        document.body.style.overflow = 'auto'; // 恢复滚动
        this.clearForm();
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
        const emptyState = document.getElementById('emptyState');
        const scheduleGrid = document.getElementById('scheduleGrid');
        
        // 清空所有课程单元格
        const courseCells = document.querySelectorAll('.course-cell');
        courseCells.forEach(cell => {
            cell.innerHTML = '';
            cell.classList.remove('occupied');
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
