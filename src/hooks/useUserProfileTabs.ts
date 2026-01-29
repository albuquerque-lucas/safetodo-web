import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

type TabKey = 'profile' | 'logs' | 'notifications'

type Params = {
  canViewLogsTab: boolean
  canViewNotificationsTab: boolean
}

const useUserProfileTabs = ({
  canViewLogsTab,
  canViewNotificationsTab,
}: Params) => {
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState<TabKey>('profile')

  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam === 'notifications') {
      setActiveTab('notifications')
    } else if (tabParam === 'logs') {
      setActiveTab('logs')
    } else if (tabParam === 'profile') {
      setActiveTab('profile')
    }
  }, [searchParams])

  useEffect(() => {
    if (!canViewLogsTab && activeTab === 'logs') {
      setActiveTab('profile')
    }
  }, [activeTab, canViewLogsTab])

  useEffect(() => {
    if (!canViewNotificationsTab && activeTab === 'notifications') {
      setActiveTab('profile')
    }
  }, [activeTab, canViewNotificationsTab])

  return {
    activeTab,
    setActiveTab,
  }
}

export default useUserProfileTabs
export type { TabKey as UserProfileTabKey }
