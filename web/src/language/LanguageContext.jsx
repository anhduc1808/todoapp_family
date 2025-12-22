import { createContext, useContext, useState, useEffect, useMemo } from 'react'

const LanguageContext = createContext(null)

const translations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    myTasks: 'My Task',
    settings: 'Settings',
    logout: 'Logout',
    home: 'Home',
    
    // Common
    searchPlaceholder: 'Search your task here...',
    welcome: 'Welcome back',
    welcomeBack: 'Welcome back',
    user: 'User',
    today: 'Today',
    thisWeek: 'This week',
    thisMonth: 'This month',
    all: 'All',
    addTask: 'Add task',
    toDo: 'To do',
    completed: 'Completed',
    inProgress: 'In progress',
    notStarted: 'Not started',
    priority: 'Priority',
    priorityLabel: 'Priority:',
    status: 'Status',
    statusLabel: 'Status:',
    createdDate: 'Created date',
    createdDateLabel: 'Created date:',
    noTasks: 'No tasks',
    noCompletedTasks: 'No completed tasks yet',
    completedTasks: 'Completed tasks',
    completedStatus: 'Completed',
    
    // Priority
    high: 'High',
    moderate: 'Moderate',
    low: 'Low',
    
    // Status
    done: 'Done',
    doing: 'Doing',
    todo: 'Todo',
    
    // Task Categories
    taskStatus: 'Task Status',
    taskPriority: 'Task Priority',
    addStatus: 'Add Status',
    addPriority: 'Add New Priority',
    edit: 'Edit',
    delete: 'Delete',
    
    // Family Tasks
    familyTasks: 'Family Tasks',
    inviteMember: 'Invite Member',
    inviteCode: 'Invitation Code',
    createInviteCode: 'Create Invite Code',
    noInviteCode: 'No invite code',
    copied: 'Copied',
    copy: 'Copy',
    
    // Settings
    changePassword: 'Change Password',
    darkMode: 'Dark Mode',
    language: 'Language',
    
    // Login/Register
    login: 'Login',
    register: 'Register',
    email: 'Email',
    password: 'Password',
    name: 'Name',
    confirmPassword: 'Confirm Password',
    enterFirstName: 'Enter First Name',
    enterLastName: 'Enter Last Name',
    enterUsername: 'Enter Username',
    enterEmail: 'Enter Email',
    enterPassword: 'Enter Password',
    rememberMe: 'Remember Me',
    agreeToTerms: 'I agree to all terms.',
    signIn: 'Sign In',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: "Don't have an account?",
    createOne: 'Create One',
    orLoginWith: 'Or, Login with',
    mustAgreeToTerms: 'You must agree to the terms',
    
    // Other
    goBack: 'Go Back',
    update: 'Update',
    cancel: 'Cancel',
    save: 'Save',
    calendar: 'Calendar',
    selectedDate: 'Selected Date',
    joinByLink: 'Join by Link',
    joinByCode: 'Join by Code',
    nameRequired: 'Name is required',
    familyGroupName: 'New family group name',
    familyGroupNameExample: 'Example: Nam\'s family',
    createGroup: 'Create Group',
    createGroupFailed: 'Failed to create group',
    joining: 'Joining...',
    joinGroupFailed: 'Failed to join group',
    joinGroupSuccess: 'Successfully joined the family group!',
    invalidInviteLink: 'Invalid invite link',
    invalidInviteLinkDesc: 'The invite link does not contain a valid invite code.',
    pleaseWait: 'Please wait...',
    inviteCodePlaceholder: 'INVITE CODE',
    
    // Dashboard
    family: 'Family',
    familyDay: 'Family Day',
    createNewGroup: 'Create New Group',
    joinGroup: 'Join Group',
    createFamilyForm: 'Create New Family Group',
    joinFamilyForm: 'Join Family Group',
    loadingFamilies: 'Loading families...',
    noFamilies: 'No family groups yet',
    noFamiliesDesc: 'Create a new group or use an invite code to join an existing family group.',
    clickToViewTasks: 'Click to view tasks in this family',
    
    // Task Categories
    taskCategories: 'Task Categories',
    actions: 'Actions',
    taskStatusName: 'Task Status Name',
    taskPriorityName: 'Task Priority Name',
    editTaskStatus: 'Edit Task Status',
    editTaskPriority: 'Edit Task Priority',
    
    // Settings
    accountInfo: 'Account Information',
    firstName: 'First Name',
    lastName: 'Last Name',
    emailAddress: 'Email Address',
    phoneNumber: 'Phone Number',
    position: 'Position',
    updating: 'Updating...',
    updateInfo: 'Update Information',
    
    // Add Task Modal
    addNewTask: 'Add New Task',
    taskTitle: 'Task Title',
    taskDescription: 'Task Description',
    uploadImage: 'Upload Image',
    dragDropImage: 'Drag & drop image here or click to select',
    assignTo: 'Assign To',
    selectMembers: 'Select Members',
    createTask: 'Create Task',
    creating: 'Creating...',
    
    // Invite Member Modal
    sendInvite: 'Send an invite to a new member',
    inviteByEmail: 'Invite by Email',
    sendInviteBtn: 'Send Invite',
    members: 'Members',
    role: 'Role',
    projectLink: 'Project Link',
    copyLink: 'Copy Link',
    linkCopied: 'Link copied!',
    
    // Messages
    updateSuccess: 'Update successful!',
    updateFailed: 'Update failed',
    createSuccess: 'Create successful!',
    createFailed: 'Create failed',
    inviteCodeCreated: 'Invite code created successfully!',
    inviteCodeFailed: 'Failed to create invite code',
    inviteCodeCopied: 'Invite code copied!',
    cannotCopyCode: 'Cannot copy invite code',
    inviteEmailSent: 'Invite email sent successfully!',
    
    // Login/Register Extended
    loginToStart: 'Login to start',
    registerNewAccount: 'Register new account',
    noAccount: "Don't have an account?",
    registerNow: 'Register now',
    haveAccount: 'Already have an account?',
    loginFailed: 'Login failed',
    registerFailed: 'Register failed',
    displayName: 'Display Name',
    pleaseEnterTitle: 'Please enter task title',
    imageProcessingError: 'Error processing image. Please try again.',
    pleaseEnterEmail: 'Please enter email',
    linkCopiedMessage: 'Link copied! Send this link to the person you want to invite.',
    inviteFailed: 'Failed to send invite',
    roleUpdated: 'Role updated successfully!',
    roleUpdateFailed: 'Failed to update role',
    cannotCopyLink: 'Cannot copy link',
    routeNotFound: 'Route not found. Backend may not be deployed with latest code.',
    unauthorized: 'Unauthorized. Please login first.',
    invalidInviteCode: 'Invalid invite code. Please check the code and try again.',
    
    // Roles
    owner: 'Owner',
    admin: 'Admin',
    member: 'Member',
    child: 'Child',
    
    // Family Tasks
    allMembers: 'All Members',
    filterByStatus: 'Filter by Status',
    filterByTime: 'Filter by Time',
    sortBy: 'Sort By',
    dueDate: 'Due Date',
    createdAt: 'Created At',
    ascending: 'Ascending',
    descending: 'Descending',
    noTasksFound: 'No tasks found',
    loadingTasks: 'Loading tasks...',
    dueDateLabel: 'Due Date',
    deleteTask: 'Delete Task',
    confirmDelete: 'Are you sure you want to delete this task?',
    deleteSuccess: 'Task deleted successfully!',
    deleteFailed: 'Failed to delete task',
    onlyOwnerCanDelete: 'Only owner and admin can delete tasks',
    saving: 'Saving...',
    saveChanges: 'Save Changes',
    
    // Family Tasks Extended
    familyTasksTitle: 'Family Tasks',
    trackAndAssign: 'Track and assign household tasks to each member',
    backToHome: 'Back to Home',
    membersInFamily: 'Members in Family',
    filterByMember: 'Filter by Member',
    progressStats: 'Progress Statistics',
    total: 'Total',
    tasksCompleted: 'tasks completed',
    upcomingDeadline: 'Upcoming deadline (within 60 minutes)',
    deadline: 'Deadline',
    noDeadline: 'No deadline set',
    onlyOwnerCanManage: 'Only owner and admin can create and manage tasks',
    time: 'Time',
    taskName: 'Task Name',
    numberOfAssignees: 'Number of Assignees',
    showingTasks: 'Showing {count} tasks',
    tryChangeFilter: 'Try changing filters to see more tasks',
    noTasksYet: 'No tasks yet',
    createFirstTask: 'Create the first task for your family',
    
    // Change Password
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    passwordMismatch: 'New passwords do not match',
    passwordMinLength: 'New password must be at least 6 characters',
    changePasswordSuccess: 'Password changed successfully!',
    changePasswordFailed: 'Failed to change password',
    processing: 'Processing...',
    
    // Additional
    serialNumber: 'SN',
    todayComma: 'Today,',
    roleUpdatedFor: 'Updated {name}\'s role to {role}',
    roleUpdateFailedGeneric: 'Failed to update role',
    deadlinePrefix: 'deadline',
    sortByLabel: 'Sort By',
    loadingTaskList: 'Loading task list...',
    completionRate: 'Completion Rate',
    overview: 'Overview',
    totalTasks: 'Total Tasks',
    taskList: 'Task List',
    noTasksForMember: 'No tasks assigned',
    noTasksForMemberDesc: '{name} has not been assigned any tasks yet.',
    backToTaskList: '← Back to task list',
    memberProgress: 'Member Progress',
    viewMemberProgress: 'View progress of each member',
    pleaseSelectMember: 'Please select a member to view progress.',
  },
  vi: {
    // Navigation
    dashboard: 'Bảng điều khiển',
    myTasks: 'Công việc của tôi',
    taskCategories: 'Danh mục công việc',
    settings: 'Cài đặt',
    logout: 'Đăng xuất',
    home: 'Trang chủ',
    
    // Common
    searchPlaceholder: 'Tìm kiếm công việc của bạn...',
    welcome: 'Chào mừng trở lại',
    welcomeBack: 'Chào mừng trở lại',
    user: 'Người dùng',
    today: 'Hôm nay',
    thisWeek: 'Tuần này',
    thisMonth: 'Tháng này',
    all: 'Tất cả',
    addTask: 'Thêm công việc',
    toDo: 'Cần làm',
    completed: 'Hoàn thành',
    inProgress: 'Đang làm',
    notStarted: 'Chưa làm',
    priority: 'Độ ưu tiên',
    priorityLabel: 'Độ ưu tiên:',
    status: 'Trạng thái',
    statusLabel: 'Trạng thái:',
    createdDate: 'Tạo ngày',
    createdDateLabel: 'Tạo ngày:',
    noTasks: 'Không có công việc nào',
    noCompletedTasks: 'Chưa có công việc hoàn thành nào',
    completedTasks: 'Công việc đã hoàn thành',
    completedStatus: 'Hoàn thành',
    
    // Priority
    high: 'Cao',
    moderate: 'Trung bình',
    low: 'Thấp',
    
    // Status
    done: 'Hoàn thành',
    doing: 'Đang làm',
    todo: 'Chưa làm',
    
    // Task Categories
    taskStatus: 'Trạng thái công việc',
    taskPriority: 'Độ ưu tiên công việc',
    addStatus: 'Thêm trạng thái',
    addPriority: 'Thêm độ ưu tiên mới',
    edit: 'Chỉnh sửa',
    delete: 'Xóa',
    
    // Family Tasks
    familyTasks: 'Công việc gia đình',
    inviteMember: 'Mời thành viên',
    inviteCode: 'Mã mời',
    createInviteCode: 'Tạo mã mời',
    noInviteCode: 'Chưa có mã',
    copied: 'Đã copy',
    copy: 'Copy',
    
    // Settings
    changePassword: 'Đổi mật khẩu',
    darkMode: 'Chế độ tối',
    language: 'Ngôn ngữ',
    
    // Login/Register
    login: 'Đăng nhập',
    register: 'Đăng ký',
    email: 'Email',
    password: 'Mật khẩu',
    name: 'Tên',
    confirmPassword: 'Xác nhận mật khẩu',
    
    // Other
    goBack: 'Quay lại',
    update: 'Cập nhật',
    cancel: 'Hủy',
    save: 'Lưu',
    calendar: 'Lịch',
    selectedDate: 'Ngày đã chọn',
    
    // Dashboard
    family: 'Gia đình',
    familyDay: 'Ngày của gia đình',
    createNewGroup: 'Tạo nhóm mới',
    joinGroup: 'Tham gia nhóm',
    createFamilyForm: 'Tạo nhóm gia đình mới',
    joinFamilyForm: 'Tham gia nhóm gia đình',
    loadingFamilies: 'Đang tải nhóm gia đình...',
    noFamilies: 'Chưa có nhóm gia đình nào',
    noFamiliesDesc: 'Hãy tạo nhóm mới hoặc dùng mã mời để tham gia nhóm gia đình đã có.',
    clickToViewTasks: 'Nhấp để xem công việc trong gia đình này',
    
    // Task Categories
    actions: 'Hành động',
    taskStatusName: 'Tên trạng thái công việc',
    taskPriorityName: 'Tên độ ưu tiên công việc',
    editTaskStatus: 'Chỉnh sửa trạng thái công việc',
    editTaskPriority: 'Chỉnh sửa độ ưu tiên công việc',
    
    // Settings
    accountInfo: 'Thông tin tài khoản',
    firstName: 'Tên',
    lastName: 'Họ',
    emailAddress: 'Địa chỉ email',
    phoneNumber: 'Số điện thoại',
    position: 'Chức vụ',
    updating: 'Đang cập nhật...',
    updateInfo: 'Cập nhật thông tin',
    
    // Add Task Modal
    addNewTask: 'Thêm công việc mới',
    taskTitle: 'Tiêu đề công việc',
    taskDescription: 'Mô tả công việc',
    uploadImage: 'Tải ảnh lên',
    dragDropImage: 'Kéo thả ảnh vào đây hoặc nhấp để chọn',
    assignTo: 'Giao cho',
    selectMembers: 'Chọn thành viên',
    createTask: 'Tạo công việc',
    creating: 'Đang tạo...',
    
    // Invite Member Modal
    sendInvite: 'Gửi lời mời đến thành viên mới',
    inviteByEmail: 'Mời qua Email',
    sendInviteBtn: 'Gửi lời mời',
    members: 'Thành viên',
    role: 'Vai trò',
    projectLink: 'Liên kết dự án',
    copyLink: 'Sao chép liên kết',
    linkCopied: 'Đã sao chép liên kết!',
    
    // Messages
    updateSuccess: 'Cập nhật thông tin thành công!',
    updateFailed: 'Cập nhật thông tin thất bại',
    createSuccess: 'Tạo thành công!',
    createFailed: 'Tạo thất bại',
    inviteCodeCreated: 'Đã tạo mã mời thành công!',
    inviteCodeCopied: 'Đã copy mã mời!',
    cannotCopyCode: 'Không thể copy mã mời',
    inviteEmailSent: 'Đã gửi email mời thành công!',
    inviteCodeFailed: 'Không tạo được mã mời',
    
    // Login/Register Extended
    loginToStart: 'Đăng nhập để bắt đầu',
    registerNewAccount: 'Đăng ký tài khoản mới',
    noAccount: 'Chưa có tài khoản?',
    registerNow: 'Đăng ký ngay',
    haveAccount: 'Đã có tài khoản?',
    loginFailed: 'Đăng nhập thất bại',
    registerFailed: 'Đăng ký thất bại',
    enterFirstName: 'Nhập tên',
    enterLastName: 'Nhập họ',
    enterUsername: 'Nhập tên người dùng',
    enterEmail: 'Nhập email',
    enterPassword: 'Nhập mật khẩu',
    rememberMe: 'Ghi nhớ đăng nhập',
    agreeToTerms: 'Tôi đồng ý với tất cả điều khoản.',
    signIn: 'Đăng nhập',
    alreadyHaveAccount: 'Đã có tài khoản?',
    dontHaveAccount: 'Chưa có tài khoản?',
    createOne: 'Tạo tài khoản',
    orLoginWith: 'Hoặc, đăng nhập bằng',
    mustAgreeToTerms: 'Bạn phải đồng ý với điều khoản',
    displayName: 'Tên hiển thị',
    pleaseEnterTitle: 'Vui lòng nhập tiêu đề công việc',
    imageProcessingError: 'Lỗi khi xử lý ảnh. Vui lòng thử lại.',
    pleaseEnterEmail: 'Vui lòng nhập email',
    linkCopiedMessage: 'Đã copy link mời! Gửi link này cho người bạn muốn mời.',
    inviteFailed: 'Gửi lời mời thất bại',
    roleUpdated: 'Đã cập nhật quyền thành công!',
    roleUpdateFailed: 'Cập nhật quyền thất bại',
    cannotCopyLink: 'Không thể copy link',
    routeNotFound: 'Route không tìm thấy. Backend có thể chưa được deploy với code mới nhất.',
    unauthorized: 'Chưa đăng nhập. Vui lòng đăng nhập trước.',
    invalidInviteCode: 'Mã mời không hợp lệ. Vui lòng kiểm tra lại mã mời.',
    
    // Roles
    owner: 'Chủ nhóm',
    admin: 'Quản trị viên',
    member: 'Thành viên',
    child: 'Con',
    
    // Family Tasks
    allMembers: 'Tất cả thành viên',
    filterByStatus: 'Lọc theo trạng thái',
    filterByTime: 'Lọc theo thời gian',
    sortBy: 'Sắp xếp theo',
    dueDate: 'Ngày hết hạn',
    createdAt: 'Ngày tạo',
    ascending: 'Tăng dần',
    descending: 'Giảm dần',
    noTasksFound: 'Không tìm thấy công việc nào',
    loadingTasks: 'Đang tải công việc...',
    dueDateLabel: 'Hạn hoàn thành',
    deleteTask: 'Xóa công việc',
    confirmDelete: 'Bạn có chắc muốn xóa công việc này?',
    deleteSuccess: 'Đã xóa công việc thành công!',
    deleteFailed: 'Xóa công việc thất bại',
    onlyOwnerCanDelete: 'Chỉ chủ nhóm và quản trị viên mới có quyền xóa công việc',
    saving: 'Đang lưu...',
    saveChanges: 'Lưu thay đổi',
    
    // Family Tasks Extended
    familyTasksTitle: 'Công việc trong gia đình',
    trackAndAssign: 'Theo dõi và phân công việc nhà cho từng thành viên',
    backToHome: 'Về trang chủ',
    membersInFamily: 'Thành viên trong gia đình',
    filterByMember: 'Lọc theo thành viên',
    progressStats: 'Thống kê tiến độ',
    total: 'Tổng số',
    tasksCompleted: 'công việc đã hoàn thành',
    upcomingDeadline: 'Nhắc việc sắp đến hạn (trong 60 phút tới)',
    deadline: 'Hạn',
    noDeadline: 'Chưa đặt hạn',
    onlyOwnerCanManage: 'Chỉ chủ nhóm và quản trị viên mới có quyền tạo và quản lý công việc',
    time: 'Thời gian',
    sortByLabel: 'Sắp xếp theo',
    taskName: 'Tên công việc',
    numberOfAssignees: 'Số người giao',
    showingTasks: 'Hiển thị {count} công việc',
    tryChangeFilter: 'Thử thay đổi bộ lọc để xem thêm công việc',
    noTasksYet: 'Chưa có công việc nào',
    createFirstTask: 'Hãy tạo việc đầu tiên cho gia đình bạn',
    
    // Change Password
    currentPassword: 'Mật khẩu hiện tại',
    newPassword: 'Mật khẩu mới',
    passwordMismatch: 'Mật khẩu mới không khớp',
    passwordMinLength: 'Mật khẩu mới phải có ít nhất 6 ký tự',
    changePasswordSuccess: 'Đổi mật khẩu thành công!',
    changePasswordFailed: 'Đổi mật khẩu thất bại',
    processing: 'Đang xử lý...',
    
    // Additional
    serialNumber: 'STT',
    todayComma: 'Hôm nay,',
    roleUpdatedFor: 'Đã cập nhật quyền của {name} thành {role}',
    roleUpdateFailedGeneric: 'Cập nhật quyền thất bại',
    deadlinePrefix: 'hạn',
    loadingTaskList: 'Đang tải danh sách công việc...',
    completionRate: 'Tỷ lệ hoàn thành',
    overview: 'Tổng quan',
    totalTasks: 'Tổng số việc',
    taskList: 'Danh sách công việc',
    noTasksForMember: 'Chưa có công việc nào',
    noTasksForMemberDesc: '{name} chưa được giao công việc nào.',
    backToTaskList: '← Quay lại danh sách công việc',
    memberProgress: 'Tiến độ thành viên',
    viewMemberProgress: 'Xem tiến độ công việc của từng thành viên',
    pleaseSelectMember: 'Vui lòng chọn thành viên để xem tiến độ.',
    joinByLink: 'Tham gia bằng link',
    joinByCode: 'Tham gia bằng mã code',
    nameRequired: 'Vui lòng nhập tên',
    familyGroupName: 'Tên nhóm gia đình mới',
    familyGroupNameExample: 'Ví dụ: Gia đình nhà Nam',
    createGroup: 'Tạo nhóm',
    createGroupFailed: 'Tạo nhóm thất bại',
    joining: 'Đang tham gia...',
    joinGroupFailed: 'Tham gia nhóm thất bại',
    joinGroupSuccess: 'Đã tham gia nhóm gia đình thành công!',
    invalidInviteLink: 'Link mời không hợp lệ',
    invalidInviteLinkDesc: 'Link mời không chứa mã mời hợp lệ.',
    pleaseWait: 'Vui lòng đợi...',
    inviteCodePlaceholder: 'MÃ MỜI',
  },
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('language')
      return saved || 'vi' // Mặc định tiếng Việt
    }
    return 'vi'
  })

  const t = (key) => {
    return translations[language]?.[key] || key
  }

  const changeLanguage = (lang) => {
    if (lang === language) {
      return
    }
    setLanguage(lang)
    localStorage.setItem('language', lang)
  }

  const contextValue = useMemo(() => ({
    language,
    changeLanguage,
    t,
  }), [language])

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    // Fallback để tránh lỗi khi hot reload
    // Không log warning để tránh spam console trong development
    const fallbackLanguage = typeof window !== 'undefined' ? (localStorage.getItem('language') || 'vi') : 'vi'
    const fallbackT = (key) => {
      return translations[fallbackLanguage]?.[key] || key
    }
    return {
      language: fallbackLanguage,
      changeLanguage: (lang) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('language', lang)
          // Reload để apply language change
          window.location.reload()
        }
      },
      t: fallbackT,
    }
  }
  return context
}
