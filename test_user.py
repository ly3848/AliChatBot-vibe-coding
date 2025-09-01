import unittest
import datetime
from demo import User, UserRole


class TestUserToDict(unittest.TestCase):
    """测试User类的to_dict方法"""

    def test_to_dict_basic_user(self):
        """测试基本用户转换为字典"""
        # 创建一个用户实例
        user = User(1, "testuser", "test@example.com")
        
        # 调用to_dict方法
        user_dict = user.to_dict()
        
        # 验证返回值类型
        self.assertIsInstance(user_dict, dict)
        
        # 验证字段值
        self.assertEqual(user_dict["id"], 1)
        self.assertEqual(user_dict["username"], "testuser")
        self.assertEqual(user_dict["email"], "test@example.com")
        self.assertEqual(user_dict["role"], "user")  # 默认角色
        self.assertEqual(user_dict["is_active"], True)
        self.assertIsNone(user_dict["last_login"])
        
        # 验证时间字段存在且格式正确
        self.assertIn("created_at", user_dict)
        self.assertIn("updated_at", user_dict)
        # 验证时间格式是否正确
        try:
            datetime.datetime.fromisoformat(user_dict["created_at"])
            datetime.datetime.fromisoformat(user_dict["updated_at"])
        except ValueError:
            self.fail("时间格式不正确")

    def test_to_dict_admin_user(self):
        """测试管理员用户转换为字典"""
        # 创建一个管理员用户实例
        admin_user = User(2, "adminuser", "admin@example.com", UserRole.ADMIN)
        
        # 调用to_dict方法
        admin_dict = admin_user.to_dict()
        
        # 验证角色字段
        self.assertEqual(admin_dict["role"], "admin")

    def test_to_dict_with_last_login(self):
        """测试带最后登录时间的用户转换为字典"""
        # 创建一个用户实例
        user = User(3, "loggedinuser", "loggedin@example.com")
        
        # 设置最后登录时间
        login_time = datetime.datetime(2023, 1, 1, 12, 0, 0)
        user.last_login = login_time
        
        # 调用to_dict方法
        user_dict = user.to_dict()
        
        # 验证最后登录时间
        self.assertEqual(user_dict["last_login"], "2023-01-01T12:00:00")
        
    def test_to_dict_inactive_user(self):
        """测试非活跃用户转换为字典"""
        # 创建一个用户实例
        user = User(4, "inactiveuser", "inactive@example.com")
        
        # 设置为非活跃状态
        user.is_active = False
        
        # 调用to_dict方法
        user_dict = user.to_dict()
        
        # 验证活跃状态
        self.assertEqual(user_dict["is_active"], False)

    def test_to_dict_all_fields(self):
        """测试所有字段的转换"""
        # 创建一个用户实例
        user = User(5, "completeuser", "complete@example.com", UserRole.GUEST)
        
        # 设置最后登录时间
        login_time = datetime.datetime(2023, 6, 15, 14, 30, 45)
        user.last_login = login_time
        
        # 设置为非活跃状态
        user.is_active = False
        
        # 调用to_dict方法
        user_dict = user.to_dict()
        
        # 验证所有字段
        self.assertEqual(user_dict["id"], 5)
        self.assertEqual(user_dict["username"], "completeuser")
        self.assertEqual(user_dict["email"], "complete@example.com")
        self.assertEqual(user_dict["role"], "guest")
        self.assertEqual(user_dict["is_active"], False)
        self.assertEqual(user_dict["last_login"], "2023-06-15T14:30:45")


if __name__ == '__main__':
    unittest.main()