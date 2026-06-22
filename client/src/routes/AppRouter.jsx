import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import useAuthStore from '../store/authStore'
import LoginPage from '../pages/manager/LoginPage'
import MenuPage from '../pages/customer/MenuPage'
import OrderStatusPage from '../pages/customer/OrderStatusPage'
import BillPage from '../pages/customer/BillPage'
import FeedbackPage from '../pages/customer/FeedbackPage'
import QRPage from '../pages/manager/QRPage'
import KitchenPage from '../pages/kitchen/KitchenPage'
import TablesPage from '../pages/manager/TablesPage'
import MenuManagementPage from '../pages/manager/MenuManagementPage'
import ReportsPage from '../pages/manager/ReportsPage'
import StaffManagementPage from '../pages/manager/StaffManagementPage'
import ManagerLayout from '../components/manager/ManagerLayout'
import RoleRoute from './RoleRoute'
import NotAuthorizedPage from '../pages/NotAuthorizedPage'
import NotFoundPage from '../pages/NotFoundPage'

const kitchenRoles = ['kitchen', 'manager', 'owner']
const managerRoles = ['manager', 'owner']
const tableRoles = ['manager', 'owner', 'waiter']
const ownerRoles = ['owner']

function AppRouter() {
  const initialize = useAuthStore((state) => state.initialize)
  useEffect(function() { initialize() }, [])
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/not-authorized" element={<NotAuthorizedPage />} />
        <Route path="/menu/:tableId" element={<MenuPage />} />
        <Route path="/order-status/:sessionId" element={<OrderStatusPage />} />
        <Route path="/bill/:orderId" element={<BillPage />} />
        <Route path="/feedback/:orderId" element={<FeedbackPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/kitchen" element={<RoleRoute allowedRoles={kitchenRoles}><ManagerLayout><KitchenPage /></ManagerLayout></RoleRoute>} />
        <Route path="/manager/tables" element={<RoleRoute allowedRoles={tableRoles}><ManagerLayout><TablesPage /></ManagerLayout></RoleRoute>} />
        <Route path="/manager/menu" element={<RoleRoute allowedRoles={managerRoles}><ManagerLayout><MenuManagementPage /></ManagerLayout></RoleRoute>} />
        <Route path="/manager/qr" element={<RoleRoute allowedRoles={managerRoles}><ManagerLayout><QRPage /></ManagerLayout></RoleRoute>} />
        <Route path="/manager/reports" element={<RoleRoute allowedRoles={ownerRoles}><ManagerLayout><ReportsPage /></ManagerLayout></RoleRoute>} />
        <Route path="/manager/staff" element={<RoleRoute allowedRoles={ownerRoles}><ManagerLayout><StaffManagementPage /></ManagerLayout></RoleRoute>} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter