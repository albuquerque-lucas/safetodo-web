import type { User } from '../../types/api'
import { formatDate } from '../../utils/profileUtils'

type ProfileTabProps = {
  profile: User
  displayName: string
  avatarInitials: string
}

const ProfileTab = ({ profile, displayName, avatarInitials }: ProfileTabProps) => (
  <div className="profile-body">
    <div className="profile-summary">
      <div className="profile-avatar" aria-hidden="true">
        {avatarInitials}
      </div>
      <div>
        <h2 className="h4 mb-1">{displayName}</h2>
        <p className="text-muted mb-2">@{profile.username}</p>
        <div className="profile-meta">
          <span className="profile-chip">ID {profile.id}</span>
          {profile.last_login ? (
            <span className="profile-chip">
              Ultimo acesso {formatDate(profile.last_login)}
            </span>
          ) : null}
        </div>
      </div>
    </div>

    <div className="profile-grid">
      <div>
        <span className="profile-label">Email</span>
        <span className="profile-value">{profile.email || '-'}</span>
      </div>
      <div>
        <span className="profile-label">Nome completo</span>
        <span className="profile-value">{displayName || '-'}</span>
      </div>
      <div>
        <span className="profile-label">Telefone</span>
        <span className="profile-value">{profile.phone || '-'}</span>
      </div>
      <div>
        <span className="profile-label">Data de cadastro</span>
        <span className="profile-value">{formatDate(profile.date_joined)}</span>
      </div>
    </div>

    <div className="profile-bio">
      <span className="profile-label">Bio</span>
      <p className="profile-value mb-0">{profile.bio?.trim() || '-'}</p>
    </div>
  </div>
)

export default ProfileTab
