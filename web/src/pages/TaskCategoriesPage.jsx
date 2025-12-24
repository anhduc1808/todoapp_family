import { useState } from 'react'
import { Link } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import EditTaskStatusModal from '../components/EditTaskStatusModal'
import { useLanguage } from '../language/LanguageContext'
import Icon from '../components/Icon'

function TaskCategoriesPage() {
  const { t, language } = useLanguage()
  
  // Mapping để dịch các giá trị status và priority
  const statusTranslationMap = {
    'Hoàn thành': 'completed',
    'Đang làm': 'inProgress',
    'Chưa làm': 'notStarted',
    'Completed': 'completed',
    'In progress': 'inProgress',
    'Not started': 'notStarted',
  }
  
  const priorityTranslationMap = {
    'Cao': 'high',
    'Trung bình': 'moderate',
    'Thấp': 'low',
    'High': 'high',
    'Moderate': 'moderate',
    'Low': 'low',
  }
  
  const translateStatus = (name) => {
    const key = statusTranslationMap[name] || name
    return t(key) !== key ? t(key) : name
  }
  
  const translatePriority = (name) => {
    const key = priorityTranslationMap[name] || name
    return t(key) !== key ? t(key) : name
  }
  
  const [taskStatuses] = useState([
    { id: 1, name: 'Hoàn thành' },
    { id: 2, name: 'Đang làm' },
    { id: 3, name: 'Chưa làm' },
  ])

  const [taskPriorities] = useState([
    { id: 1, name: 'Cao' },
    { id: 2, name: 'Trung bình' },
    { id: 3, name: 'Thấp' },
  ])

  const [editStatusName, setEditStatusName] = useState('')
  const [editPriorityName, setEditPriorityName] = useState('')
  const [showEditStatusModal, setShowEditStatusModal] = useState(false)
  const [showEditPriorityModal, setShowEditPriorityModal] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState(null)
  const [selectedPriority, setSelectedPriority] = useState(null)

  return (
    <AppLayout>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('taskCategories')}</h1>
        <Link
          to="/"
          className="text-sm text-slate-900 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400"
        >
          {t('goBack')}
        </Link>
      </div>

      <div className="bg-white dark:bg-[#1F2937] rounded-xl shadow-sm border-2 border-slate-200 dark:border-slate-500 p-6 space-y-8">
        {/* Task Status Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t('taskStatus')}</h2>
            <button className="text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-500 font-medium">
              + {t('addStatus')}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-200 dark:border-slate-500">
                  <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">{t('serialNumber')}</th>
                  <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">{t('taskStatus')}</th>
                  <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {taskStatuses.map((status, index) => (
                  <tr key={status.id} className="border-b border-slate-200 dark:border-slate-600">
                    <td className="py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">{index + 1}</td>
                    <td className="py-3 px-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {translateStatus(status.name)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedStatus(status)
                            setEditStatusName(status.name)
                            setShowEditStatusModal(true)
                          }}
                          className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-medium transition flex items-center gap-1"
                        >
                          <Icon name="edit" className="text-white" size="sm" />
                          <span>{t('edit')}</span>
                        </button>
                        <button
                          onClick={() => {}}
                          className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium transition flex items-center gap-1"
                        >
                          <Icon name="trash" className="text-white" size="sm" />
                          <span>{t('delete')}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Task Priority Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t('taskPriority')}</h2>
            <button className="text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-500 font-medium">
              + {t('addPriority')}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-200 dark:border-slate-500">
                  <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">{t('serialNumber')}</th>
                  <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">{t('taskPriority')}</th>
                  <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {taskPriorities.map((priority, index) => (
                  <tr key={priority.id} className="border-b border-slate-200 dark:border-slate-600">
                    <td className="py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">{index + 1}</td>
                    <td className="py-3 px-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {translatePriority(priority.name)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedPriority(priority)
                            setEditPriorityName(priority.name)
                            setShowEditPriorityModal(true)
                          }}
                          className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-medium transition flex items-center gap-1"
                        >
                          <Icon name="edit" className="text-white" size="sm" />
                          <span>{t('edit')}</span>
                        </button>
                        <button
                          onClick={() => {}}
                          className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium transition flex items-center gap-1"
                        >
                          <Icon name="trash" className="text-white" size="sm" />
                          <span>{t('delete')}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <EditTaskStatusModal
        isOpen={showEditStatusModal}
        onClose={() => {
          setShowEditStatusModal(false)
          setSelectedStatus(null)
          setEditStatusName('')
        }}
        statusName={editStatusName}
        type="status"
        onUpdate={(newName) => {
          // Handle update logic here
          if (import.meta.env.DEV) {
            console.log('Update status:', selectedStatus?.id, 'to:', newName)
          }
          setShowEditStatusModal(false)
          setSelectedStatus(null)
          setEditStatusName('')
        }}
        onCancel={() => {
          setShowEditStatusModal(false)
          setSelectedStatus(null)
          setEditStatusName('')
        }}
      />

      <EditTaskStatusModal
        isOpen={showEditPriorityModal}
        onClose={() => {
          setShowEditPriorityModal(false)
          setSelectedPriority(null)
          setEditPriorityName('')
        }}
        statusName={editPriorityName}
        type="priority"
        onUpdate={(newName) => {
          if (import.meta.env.DEV) {
            console.log('Update priority:', selectedPriority?.id, 'to:', newName)
          }
          setShowEditPriorityModal(false)
          setSelectedPriority(null)
          setEditPriorityName('')
        }}
        onCancel={() => {
          setShowEditPriorityModal(false)
          setSelectedPriority(null)
          setEditPriorityName('')
        }}
      />
    </AppLayout>
  )
}

export default TaskCategoriesPage
