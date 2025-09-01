#!/usr/bin/env python3
"""
综合性Python示例程序
包含多个模块和功能，演示各种Python编程概念
"""

import random
import datetime
import json
import hashlib
import re
import sys
import os
from abc import ABC, abstractmethod
from enum import Enum
from typing import List, Dict, Any, Optional, Union
import unittest


# 定义枚举类型
class UserRole(Enum):
    """用户角色枚举"""
    ADMIN = "admin"
    USER = "user"
    GUEST = "guest"


class Priority(Enum):
    """优先级枚举"""
    LOW = 1
    MEDIUM = 2
    HIGH = 3
    URGENT = 4


# 定义异常类
class CustomException(Exception):
    """自定义异常基类"""
    def __init__(self, message: str):
        self.message = message
        super().__init__(self.message)


class UserNotFoundException(CustomException):
    """用户未找到异常"""
    pass


class TaskNotFoundException(CustomException):
    """任务未找到异常"""
    pass


class InvalidCredentialsException(CustomException):
    """无效凭证异常"""
    pass


# 定义抽象基类
class BaseModel(ABC):
    """模型基类"""
    
    def __init__(self, id: int):
        self.id = id
        self.created_at = datetime.datetime.now()
        self.updated_at = datetime.datetime.now()
    
    @abstractmethod
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        pass
    
    def __str__(self) -> str:
        return f"{self.__class__.__name__}(id={self.id})"


# 定义具体类
class User(BaseModel):
    """用户类"""
    
    def __init__(self, id: int, username: str, email: str, role: UserRole = UserRole.USER):
        super().__init__(id)
        self.username = username
        self.email = email
        self.role = role
        self.is_active = True
        self.last_login = None
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "role": self.role.value,
            "is_active": self.is_active,
            "last_login": self.last_login.isoformat() if self.last_login else None,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }
    
    def login(self) -> None:
        """用户登录"""
        self.last_login = datetime.datetime.now()
        self.updated_at = datetime.datetime.now()
    
    def deactivate(self) -> None:
        """停用用户"""
        self.is_active = False
        self.updated_at = datetime.datetime.now()
    
    def activate(self) -> None:
        """激活用户"""
        self.is_active = True
        self.updated_at = datetime.datetime.now()


class Task(BaseModel):
    """任务类"""
    
    def __init__(self, id: int, title: str, description: str, 
                 priority: Priority = Priority.MEDIUM, assigned_to: Optional[User] = None):
        super().__init__(id)
        self.title = title
        self.description = description
        self.priority = priority
        self.assigned_to = assigned_to
        self.status = "pending"  # pending, in_progress, completed, cancelled
        self.due_date = None
        self.completed_at = None
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "priority": self.priority.name,
            "assigned_to": self.assigned_to.id if self.assigned_to else None,
            "status": self.status,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }
    
    def assign(self, user: User) -> None:
        """分配任务给用户"""
        self.assigned_to = user
        self.updated_at = datetime.datetime.now()
    
    def start(self) -> None:
        """开始任务"""
        if self.status == "pending":
            self.status = "in_progress"
            self.updated_at = datetime.datetime.now()
        else:
            raise CustomException("任务状态不允许开始")
    
    def complete(self) -> None:
        """完成任务"""
        if self.status in ["pending", "in_progress"]:
            self.status = "completed"
            self.completed_at = datetime.datetime.now()
            self.updated_at = datetime.datetime.now()
        else:
            raise CustomException("任务状态不允许完成")
    
    def cancel(self) -> None:
        """取消任务"""
        if self.status in ["pending", "in_progress"]:
            self.status = "cancelled"
            self.updated_at = datetime.datetime.now()
        else:
            raise CustomException("任务状态不允许取消")
    
    def set_due_date(self, due_date: datetime.datetime) -> None:
        """设置截止日期"""
        self.due_date = due_date
        self.updated_at = datetime.datetime.now()


class Project(BaseModel):
    """项目类"""
    
    def __init__(self, id: int, name: str, description: str):
        super().__init__(id)
        self.name = name
        self.description = description
        self.tasks: List[Task] = []
        self.members: List[User] = []
        self.start_date = datetime.datetime.now()
        self.end_date = None
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "tasks": [task.id for task in self.tasks],
            "members": [member.id for member in self.members],
            "start_date": self.start_date.isoformat(),
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }
    
    def add_task(self, task: Task) -> None:
        """添加任务"""
        if task not in self.tasks:
            self.tasks.append(task)
            self.updated_at = datetime.datetime.now()
    
    def remove_task(self, task: Task) -> None:
        """移除任务"""
        if task in self.tasks:
            self.tasks.remove(task)
            self.updated_at = datetime.datetime.now()
    
    def add_member(self, user: User) -> None:
        """添加成员"""
        if user not in self.members:
            self.members.append(user)
            self.updated_at = datetime.datetime.now()
    
    def remove_member(self, user: User) -> None:
        """移除成员"""
        if user in self.members:
            self.members.remove(user)
            self.updated_at = datetime.datetime.now()
    
    def set_end_date(self, end_date: datetime.datetime) -> None:
        """设置结束日期"""
        self.end_date = end_date
        self.updated_at = datetime.datetime.now()


# 数据管理器类
class DataManager:
    """数据管理器"""
    
    def __init__(self):
        self.users: Dict[int, User] = {}
        self.tasks: Dict[int, Task] = {}
        self.projects: Dict[int, Project] = {}
        self.next_user_id = 1
        self.next_task_id = 1
        self.next_project_id = 1
    
    def create_user(self, username: str, email: str, role: UserRole = UserRole.USER) -> User:
        """创建用户"""
        user = User(self.next_user_id, username, email, role)
        self.users[self.next_user_id] = user
        self.next_user_id += 1
        return user
    
    def get_user(self, user_id: int) -> User:
        """获取用户"""
        if user_id in self.users:
            return self.users[user_id]
        else:
            raise UserNotFoundException(f"用户ID {user_id} 未找到")
    
    def get_all_users(self) -> List[User]:
        """获取所有用户"""
        return list(self.users.values())
    
    def delete_user(self, user_id: int) -> None:
        """删除用户"""
        if user_id in self.users:
            del self.users[user_id]
        else:
            raise UserNotFoundException(f"用户ID {user_id} 未找到")
    
    def create_task(self, title: str, description: str, 
                   priority: Priority = Priority.MEDIUM, assigned_to: Optional[User] = None) -> Task:
        """创建任务"""
        task = Task(self.next_task_id, title, description, priority, assigned_to)
        self.tasks[self.next_task_id] = task
        self.next_task_id += 1
        return task
    
    def get_task(self, task_id: int) -> Task:
        """获取任务"""
        if task_id in self.tasks:
            return self.tasks[task_id]
        else:
            raise TaskNotFoundException(f"任务ID {task_id} 未找到")
    
    def get_all_tasks(self) -> List[Task]:
        """获取所有任务"""
        return list(self.tasks.values())
    
    def delete_task(self, task_id: int) -> None:
        """删除任务"""
        if task_id in self.tasks:
            del self.tasks[task_id]
        else:
            raise TaskNotFoundException(f"任务ID {task_id} 未找到")
    
    def create_project(self, name: str, description: str) -> Project:
        """创建项目"""
        project = Project(self.next_project_id, name, description)
        self.projects[self.next_project_id] = project
        self.next_project_id += 1
        return project
    
    def get_project(self, project_id: int) -> Project:
        """获取项目"""
        if project_id in self.projects:
            return self.projects[project_id]
        else:
            raise CustomException(f"项目ID {project_id} 未找到")
    
    def get_all_projects(self) -> List[Project]:
        """获取所有项目"""
        return list(self.projects.values())
    
    def delete_project(self, project_id: int) -> None:
        """删除项目"""
        if project_id in self.projects:
            del self.projects[project_id]
        else:
            raise CustomException(f"项目ID {project_id} 未找到")
    
    def get_user_tasks(self, user: User) -> List[Task]:
        """获取用户分配的任务"""
        return [task for task in self.tasks.values() if task.assigned_to == user]
    
    def get_project_tasks(self, project: Project) -> List[Task]:
        """获取项目任务"""
        return project.tasks


# 认证管理器
class AuthManager:
    """认证管理器"""
    
    def __init__(self, data_manager: DataManager):
        self.data_manager = data_manager
        self.current_user: Optional[User] = None
        self.sessions: Dict[str, Dict[str, Any]] = {}
    
    def register(self, username: str, email: str, password: str) -> User:
        """注册用户"""
        # 检查用户名和邮箱是否已存在
        for user in self.data_manager.get_all_users():
            if user.username == username:
                raise CustomException("用户名已存在")
            if user.email == email:
                raise CustomException("邮箱已存在")
        
        # 创建新用户
        user = self.data_manager.create_user(username, email)
        return user
    
    def login(self, username: str, password: str) -> User:
        """用户登录"""
        # 在实际应用中，这里需要验证密码
        # 为了简化示例，我们假设用户名存在即登录成功
        for user in self.data_manager.get_all_users():
            if user.username == username:
                user.login()
                self.current_user = user
                session_id = hashlib.md5(f"{user.id}{datetime.datetime.now()}".encode()).hexdigest()
                self.sessions[session_id] = {
                    "user_id": user.id,
                    "login_time": datetime.datetime.now()
                }
                return user
        
        raise InvalidCredentialsException("无效的用户名或密码")
    
    def logout(self) -> None:
        """用户登出"""
        self.current_user = None
    
    def is_authenticated(self) -> bool:
        """检查是否已认证"""
        return self.current_user is not None
    
    def has_permission(self, required_role: UserRole) -> bool:
        """检查权限"""
        if not self.is_authenticated():
            return False
        
        role_hierarchy = {
            UserRole.GUEST: 0,
            UserRole.USER: 1,
            UserRole.ADMIN: 2
        }
        
        user_role_level = role_hierarchy.get(self.current_user.role, 0)
        required_role_level = role_hierarchy.get(required_role, 0)
        
        return user_role_level >= required_role_level


# 报表生成器
class ReportGenerator:
    """报表生成器"""
    
    def __init__(self, data_manager: DataManager):
        self.data_manager = data_manager
    
    def generate_user_report(self) -> Dict[str, Any]:
        """生成用户报表"""
        users = self.data_manager.get_all_users()
        total_users = len(users)
        active_users = len([u for u in users if u.is_active])
        inactive_users = total_users - active_users
        
        role_distribution = {}
        for user in users:
            role = user.role.value
            role_distribution[role] = role_distribution.get(role, 0) + 1
        
        return {
            "total_users": total_users,
            "active_users": active_users,
            "inactive_users": inactive_users,
            "role_distribution": role_distribution,
            "generated_at": datetime.datetime.now().isoformat()
        }
    
    def generate_task_report(self) -> Dict[str, Any]:
        """生成任务报表"""
        tasks = self.data_manager.get_all_tasks()
        total_tasks = len(tasks)
        
        status_distribution = {}
        priority_distribution = {}
        
        for task in tasks:
            # 状态分布
            status = task.status
            status_distribution[status] = status_distribution.get(status, 0) + 1
            
            # 优先级分布
            priority = task.priority.name
            priority_distribution[priority] = priority_distribution.get(priority, 0) + 1
        
        completed_tasks = status_distribution.get("completed", 0)
        completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
        
        return {
            "total_tasks": total_tasks,
            "status_distribution": status_distribution,
            "priority_distribution": priority_distribution,
            "completion_rate": round(completion_rate, 2),
            "generated_at": datetime.datetime.now().isoformat()
        }
    
    def generate_project_report(self) -> Dict[str, Any]:
        """生成项目报表"""
        projects = self.data_manager.get_all_projects()
        total_projects = len(projects)
        
        tasks_per_project = []
        members_per_project = []
        
        for project in projects:
            tasks_per_project.append(len(project.tasks))
            members_per_project.append(len(project.members))
        
        avg_tasks_per_project = sum(tasks_per_project) / len(tasks_per_project) if tasks_per_project else 0
        avg_members_per_project = sum(members_per_project) / len(members_per_project) if members_per_project else 0
        
        return {
            "total_projects": total_projects,
            "avg_tasks_per_project": round(avg_tasks_per_project, 2),
            "avg_members_per_project": round(avg_members_per_project, 2),
            "generated_at": datetime.datetime.now().isoformat()
        }


# 数据验证器
class DataValidator:
    """数据验证器"""
    
    @staticmethod
    def validate_email(email: str) -> bool:
        """验证邮箱格式"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    @staticmethod
    def validate_username(username: str) -> bool:
        """验证用户名格式"""
        # 用户名应该包含3-20个字符，只能包含字母、数字和下划线
        pattern = r'^[a-zA-Z0-9_]{3,20}$'
        return re.match(pattern, username) is not None
    
    @staticmethod
    def validate_password(password: str) -> bool:
        """验证密码强度"""
        # 密码应该至少8个字符，包含至少一个大写字母、一个小写字母和一个数字
        if len(password) < 8:
            return False
        
        has_upper = any(c.isupper() for c in password)
        has_lower = any(c.islower() for c in password)
        has_digit = any(c.isdigit() for c in password)
        
        return has_upper and has_lower and has_digit


# 日志记录器
class Logger:
    """简单的日志记录器"""
    
    def __init__(self, log_file: str = "app.log"):
        self.log_file = log_file
    
    def log(self, level: str, message: str) -> None:
        """记录日志"""
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_entry = f"[{timestamp}] {level.upper()}: {message}\n"
        
        with open(self.log_file, "a", encoding="utf-8") as f:
            f.write(log_entry)
    
    def info(self, message: str) -> None:
        """记录信息日志"""
        self.log("info", message)
    
    def warning(self, message: str) -> None:
        """记录警告日志"""
        self.log("warning", message)
    
    def error(self, message: str) -> None:
        """记录错误日志"""
        self.log("error", message)


# 配置管理器
class ConfigManager:
    """配置管理器"""
    
    def __init__(self, config_file: str = "config.json"):
        self.config_file = config_file
        self.config = self.load_config()
    
    def load_config(self) -> Dict[str, Any]:
        """加载配置"""
        try:
            if os.path.exists(self.config_file):
                with open(self.config_file, "r", encoding="utf-8") as f:
                    return json.load(f)
            else:
                # 默认配置
                return {
                    "app_name": "TaskManager",
                    "version": "1.0.0",
                    "debug": False,
                    "max_users": 1000,
                    "max_tasks_per_user": 50
                }
        except Exception as e:
            print(f"加载配置文件时出错: {e}")
            return {}
    
    def save_config(self) -> None:
        """保存配置"""
        try:
            with open(self.config_file, "w", encoding="utf-8") as f:
                json.dump(self.config, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"保存配置文件时出错: {e}")
    
    def get(self, key: str, default: Any = None) -> Any:
        """获取配置值"""
        return self.config.get(key, default)
    
    def set(self, key: str, value: Any) -> None:
        """设置配置值"""
        self.config[key] = value


# 主应用程序类
class TaskManagerApp:
    """任务管理应用程序"""
    
    def __init__(self):
        self.data_manager = DataManager()
        self.auth_manager = AuthManager(self.data_manager)
        self.report_generator = ReportGenerator(self.data_manager)
        self.validator = DataValidator()
        self.logger = Logger()
        self.config_manager = ConfigManager()
        self.running = False
    
    def initialize_sample_data(self) -> None:
        """初始化示例数据"""
        # 创建示例用户
        admin_user = self.data_manager.create_user("admin", "admin@example.com", UserRole.ADMIN)
        regular_user = self.data_manager.create_user("user1", "user1@example.com", UserRole.USER)
        guest_user = self.data_manager.create_user("guest", "guest@example.com", UserRole.GUEST)
        
        # 创建示例任务
        task1 = self.data_manager.create_task("设计数据库", "设计应用程序的数据库结构", Priority.HIGH, admin_user)
        task2 = self.data_manager.create_task("实现用户认证", "实现用户注册和登录功能", Priority.HIGH, regular_user)
        task3 = self.data_manager.create_task("编写文档", "编写用户手册和开发者文档", Priority.MEDIUM, regular_user)
        task4 = self.data_manager.create_task("测试应用", "进行全面的功能测试", Priority.LOW)
        
        # 设置任务截止日期
        task1.set_due_date(datetime.datetime.now() + datetime.timedelta(days=7))
        task2.set_due_date(datetime.datetime.now() + datetime.timedelta(days=5))
        task3.set_due_date(datetime.datetime.now() + datetime.timedelta(days=10))
        task4.set_due_date(datetime.datetime.now() + datetime.timedelta(days=3))
        
        # 创建示例项目
        project1 = self.data_manager.create_project("Web应用开发", "开发一个新的Web应用程序")
        project2 = self.data_manager.create_project("移动应用开发", "开发移动应用程序")
        
        # 将任务添加到项目
        project1.add_task(task1)
        project1.add_task(task2)
        project1.add_task(task3)
        
        project2.add_task(task4)
        
        # 添加项目成员
        project1.add_member(admin_user)
        project1.add_member(regular_user)
        
        project2.add_member(regular_user)
        project2.add_member(guest_user)
        
        self.logger.info("示例数据初始化完成")
    
    def start(self) -> None:
        """启动应用程序"""
        self.running = True
        self.logger.info("应用程序启动")
        self.initialize_sample_data()
        print(f"欢迎使用 {self.config_manager.get('app_name')} v{self.config_manager.get('version')}")
        print("示例数据已加载")
        
        # 自动登录管理员用户
        try:
            self.auth_manager.login("admin", "password")
            print(f"已自动登录为 {self.auth_manager.current_user.username}")
        except Exception as e:
            print(f"自动登录失败: {e}")
    
    def stop(self) -> None:
        """停止应用程序"""
        self.running = False
        self.logger.info("应用程序停止")
        print("应用程序已停止")
    
    def show_menu(self) -> None:
        """显示菜单"""
        print("\n=== 任务管理系统 ===")
        print("1. 查看所有用户")
        print("2. 查看所有任务")
        print("3. 查看所有项目")
        print("4. 创建新任务")
        print("5. 分配任务")
        print("6. 开始任务")
        print("7. 完成任务")
        print("8. 生成报表")
        print("9. 用户管理")
        print("0. 退出")
        print("====================")
    
    def run(self) -> None:
        """运行应用程序主循环"""
        self.start()
        
        while self.running:
            try:
                self.show_menu()
                choice = input("请选择操作: ").strip()
                
                if choice == "1":
                    self.show_all_users()
                elif choice == "2":
                    self.show_all_tasks()
                elif choice == "3":
                    self.show_all_projects()
                elif choice == "4":
                    self.create_new_task()
                elif choice == "5":
                    self.assign_task()
                elif choice == "6":
                    self.start_task()
                elif choice == "7":
                    self.complete_task()
                elif choice == "8":
                    self.generate_reports()
                elif choice == "9":
                    self.user_management()
                elif choice == "0":
                    self.stop()
                else:
                    print("无效的选择，请重新输入")
                
            except KeyboardInterrupt:
                print("\n收到中断信号，正在退出...")
                self.stop()
            except Exception as e:
                print(f"发生错误: {e}")
                self.logger.error(f"应用程序错误: {e}")
    
    def show_all_users(self) -> None:
        """显示所有用户"""
        users = self.data_manager.get_all_users()
        if not users:
            print("没有用户")
            return
        
        print("\n=== 用户列表 ===")
        for user in users:
            print(f"ID: {user.id}, 用户名: {user.username}, 邮箱: {user.email}, "
                  f"角色: {user.role.value}, 状态: {'激活' if user.is_active else '停用'}")
    
    def show_all_tasks(self) -> None:
        """显示所有任务"""
        tasks = self.data_manager.get_all_tasks()
        if not tasks:
            print("没有任务")
            return
        
        print("\n=== 任务列表 ===")
        for task in tasks:
            assigned_user = task.assigned_to.username if task.assigned_to else "未分配"
            print(f"ID: {task.id}, 标题: {task.title}, 优先级: {task.priority.name}, "
                  f"状态: {task.status}, 分配给: {assigned_user}")
    
    def show_all_projects(self) -> None:
        """显示所有项目"""
        projects = self.data_manager.get_all_projects()
        if not projects:
            print("没有项目")
            return
        
        print("\n=== 项目列表 ===")
        for project in projects:
            print(f"ID: {project.id}, 名称: {project.name}, 任务数: {len(project.tasks)}, "
                  f"成员数: {len(project.members)}")
    
    def create_new_task(self) -> None:
        """创建新任务"""
        if not self.auth_manager.is_authenticated():
            print("请先登录")
            return
        
        print("\n=== 创建新任务 ===")
        title = input("任务标题: ").strip()
        if not title:
            print("标题不能为空")
            return
        
        description = input("任务描述: ").strip()
        
        # 选择优先级
        print("优先级选项:")
        for priority in Priority:
            print(f"{priority.value}. {priority.name}")
        
        try:
            priority_choice = int(input("请选择优先级 (1-4): "))
            priority = next((p for p in Priority if p.value == priority_choice), Priority.MEDIUM)
        except ValueError:
            priority = Priority.MEDIUM
            print("无效选择，使用默认优先级")
        
        task = self.data_manager.create_task(title, description, priority)
        print(f"任务创建成功，ID: {task.id}")
        self.logger.info(f"用户 {self.auth_manager.current_user.username} 创建了任务 {task.id}")
    
    def assign_task(self) -> None:
        """分配任务"""
        if not self.auth_manager.is_authenticated():
            print("请先登录")
            return
        
        try:
            task_id = int(input("请输入任务ID: "))
            task = self.data_manager.get_task(task_id)
            
            user_id = int(input("请输入用户ID: "))
            user = self.data_manager.get_user(user_id)
            
            task.assign(user)
            print(f"任务 {task_id} 已分配给用户 {user.username}")
            self.logger.info(f"用户 {self.auth_manager.current_user.username} 将任务 {task_id} 分配给 {user.username}")
        except ValueError:
            print("无效的ID")
        except (TaskNotFoundException, UserNotFoundException) as e:
            print(f"错误: {e.message}")
        except Exception as e:
            print(f"分配任务时出错: {e}")
    
    def start_task(self) -> None:
        """开始任务"""
        if not self.auth_manager.is_authenticated():
            print("请先登录")
            return
        
        try:
            task_id = int(input("请输入任务ID: "))
            task = self.data_manager.get_task(task_id)
            task.start()
            print(f"任务 {task_id} 已开始")
            self.logger.info(f"用户 {self.auth_manager.current_user.username} 开始了任务 {task_id}")
        except ValueError:
            print("无效的ID")
        except TaskNotFoundException as e:
            print(f"错误: {e.message}")
        except CustomException as e:
            print(f"错误: {e.message}")
        except Exception as e:
            print(f"开始任务时出错: {e}")
    
    def complete_task(self) -> None:
        """完成任务"""
        if not self.auth_manager.is_authenticated():
            print("请先登录")
            return
        
        try:
            task_id = int(input("请输入任务ID: "))
            task = self.data_manager.get_task(task_id)
            task.complete()
            print(f"任务 {task_id} 已完成")
            self.logger.info(f"用户 {self.auth_manager.current_user.username} 完成了任务 {task_id}")
        except ValueError:
            print("无效的ID")
        except TaskNotFoundException as e:
            print(f"错误: {e.message}")
        except CustomException as e:
            print(f"错误: {e.message}")
        except Exception as e:
            print(f"完成任务时出错: {e}")
    
    def generate_reports(self) -> None:
        """生成报表"""
        if not self.auth_manager.is_authenticated():
            print("请先登录")
            return
        
        print("\n=== 报表 ===")
        user_report = self.report_generator.generate_user_report()
        task_report = self.report_generator.generate_task_report()
        project_report = self.report_generator.generate_project_report()
        
        print("\n用户报表:")
        print(f"  总用户数: {user_report['total_users']}")
        print(f"  激活用户: {user_report['active_users']}")
        print(f"  停用用户: {user_report['inactive_users']}")
        print("  角色分布:")
        for role, count in user_report['role_distribution'].items():
            print(f"    {role}: {count}")
        
        print("\n任务报表:")
        print(f"  总任务数: {task_report['total_tasks']}")
        print(f"  完成率: {task_report['completion_rate']}%")
        print("  状态分布:")
        for status, count in task_report['status_distribution'].items():
            print(f"    {status}: {count}")
        print("  优先级分布:")
        for priority, count in task_report['priority_distribution'].items():
            print(f"    {priority}: {count}")
        
        print("\n项目报表:")
        print(f"  总项目数: {project_report['total_projects']}")
        print(f"  平均每个项目的任务数: {project_report['avg_tasks_per_project']}")
        print(f"  平均每个项目的成员数: {project_report['avg_members_per_project']}")
    
    def user_management(self) -> None:
        """用户管理"""
        if not self.auth_manager.is_authenticated():
            print("请先登录")
            return
        
        if not self.auth_manager.has_permission(UserRole.ADMIN):
            print("权限不足")
            return
        
        print("\n=== 用户管理 ===")
        print("1. 创建用户")
        print("2. 停用用户")
        print("3. 激活用户")
        print("0. 返回")
        
        choice = input("请选择操作: ").strip()
        
        if choice == "1":
            self.create_user()
        elif choice == "2":
            self.deactivate_user()
        elif choice == "3":
            self.activate_user()
        elif choice == "0":
            return
        else:
            print("无效的选择")
    
    def create_user(self) -> None:
        """创建用户"""
        username = input("用户名: ").strip()
        if not self.validator.validate_username(username):
            print("用户名格式无效")
            return
        
        email = input("邮箱: ").strip()
        if not self.validator.validate_email(email):
            print("邮箱格式无效")
            return
        
        # 检查用户是否已存在
        for user in self.data_manager.get_all_users():
            if user.username == username:
                print("用户名已存在")
                return
            if user.email == email:
                print("邮箱已存在")
                return
        
        try:
            user = self.data_manager.create_user(username, email)
            print(f"用户创建成功，ID: {user.id}")
            self.logger.info(f"管理员 {self.auth_manager.current_user.username} 创建了用户 {user.username}")
        except Exception as e:
            print(f"创建用户时出错: {e}")
    
    def deactivate_user(self) -> None:
        """停用用户"""
        try:
            user_id = int(input("请输入用户ID: "))
            user = self.data_manager.get_user(user_id)
            user.deactivate()
            print(f"用户 {user.username} 已停用")
            self.logger.info(f"管理员 {self.auth_manager.current_user.username} 停用了用户 {user.username}")
        except ValueError:
            print("无效的ID")
        except UserNotFoundException as e:
            print(f"错误: {e.message}")
        except Exception as e:
            print(f"停用用户时出错: {e}")
    
    def activate_user(self) -> None:
        """激活用户"""
        try:
            user_id = int(input("请输入用户ID: "))
            user = self.data_manager.get_user(user_id)
            user.activate()
            print(f"用户 {user.username} 已激活")
            self.logger.info(f"管理员 {self.auth_manager.current_user.username} 激活了用户 {user.username}")
        except ValueError:
            print("无效的ID")
        except UserNotFoundException as e:
            print(f"错误: {e.message}")
        except Exception as e:
            print(f"激活用户时出错: {e}")


# 工具函数
def generate_random_string(length: int = 10) -> str:
    """生成随机字符串"""
    characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    return "".join(random.choice(characters) for _ in range(length))


def format_datetime(dt: datetime.datetime) -> str:
    """格式化日期时间"""
    return dt.strftime("%Y-%m-%d %H:%M:%S")


def calculate_days_between(start: datetime.datetime, end: datetime.datetime) -> int:
    """计算两个日期之间的天数"""
    return (end - start).days


def get_priority_color(priority: Priority) -> str:
    """根据优先级获取颜色"""
    colors = {
        Priority.LOW: "green",
        Priority.MEDIUM: "yellow",
        Priority.HIGH: "orange",
        Priority.URGENT: "red"
    }
    return colors.get(priority, "white")


# 测试类
class TestTaskManager(unittest.TestCase):
    """任务管理器测试类"""
    
    def setUp(self) -> None:
        """测试前准备"""
        self.data_manager = DataManager()
        self.user = self.data_manager.create_user("testuser", "test@example.com")
        self.task = self.data_manager.create_task("测试任务", "这是一个测试任务")
    
    def test_create_user(self) -> None:
        """测试创建用户"""
        user = self.data_manager.create_user("newuser", "new@example.com")
        self.assertIsInstance(user, User)
        self.assertEqual(user.username, "newuser")
        self.assertEqual(user.email, "new@example.com")
    
    def test_create_task(self) -> None:
        """测试创建任务"""
        task = self.data_manager.create_task("新任务", "任务描述", Priority.HIGH)
        self.assertIsInstance(task, Task)
        self.assertEqual(task.title, "新任务")
        self.assertEqual(task.priority, Priority.HIGH)
    
    def test_assign_task(self) -> None:
        """测试分配任务"""
        self.task.assign(self.user)
        self.assertEqual(self.task.assigned_to, self.user)
    
    def test_start_task(self) -> None:
        """测试开始任务"""
        self.task.start()
        self.assertEqual(self.task.status, "in_progress")
    
    def test_complete_task(self) -> None:
        """测试完成任务"""
        self.task.start()
        self.task.complete()
        self.assertEqual(self.task.status, "completed")
        self.assertIsNotNone(self.task.completed_at)
    
    def test_cancel_task(self) -> None:
        """测试取消任务"""
        self.task.cancel()
        self.assertEqual(self.task.status, "cancelled")
    
    def test_user_to_dict(self) -> None:
        """测试用户转字典"""
        user_dict = self.user.to_dict()
        self.assertIsInstance(user_dict, dict)
        self.assertIn("id", user_dict)
        self.assertIn("username", user_dict)
        self.assertIn("email", user_dict)
    
    def test_task_to_dict(self) -> None:
        """测试任务转字典"""
        task_dict = self.task.to_dict()
        self.assertIsInstance(task_dict, dict)
        self.assertIn("id", task_dict)
        self.assertIn("title", task_dict)
        self.assertIn("description", task_dict)


# 主函数
def main() -> None:
    """主函数"""
    if len(sys.argv) > 1 and sys.argv[1] == "test":
        # 运行测试
        unittest.main(argv=[''], exit=False, verbosity=2)
    else:
        # 运行应用程序
        app = TaskManagerApp()
        app.run()


if __name__ == "__main__":
    main()