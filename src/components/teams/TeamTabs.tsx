type TeamTabKey = 'team' | 'members' | 'tasks'

type TeamTabsProps = {
  activeTab: TeamTabKey
  onChangeTab: (tab: TeamTabKey) => void
}

const TeamTabs = ({ activeTab, onChangeTab }: TeamTabsProps) => (
  <ul className="nav nav-tabs profile-tabs">
    <li className="nav-item">
      <button
        type="button"
        className={`nav-link ${activeTab === 'team' ? 'active' : ''}`}
        onClick={() => onChangeTab('team')}
      >
        Equipe
      </button>
    </li>
    <li className="nav-item">
      <button
        type="button"
        className={`nav-link ${activeTab === 'members' ? 'active' : ''}`}
        onClick={() => onChangeTab('members')}
      >
        Membros
      </button>
    </li>
    <li className="nav-item">
      <button
        type="button"
        className={`nav-link ${activeTab === 'tasks' ? 'active' : ''}`}
        onClick={() => onChangeTab('tasks')}
      >
        Tarefas
      </button>
    </li>
  </ul>
)

export default TeamTabs
export type { TeamTabKey }
