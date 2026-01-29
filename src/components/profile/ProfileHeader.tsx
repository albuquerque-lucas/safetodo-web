import { Link } from 'react-router-dom'

type ProfileHeaderProps = {
  title: string
  showBack: boolean
}

const ProfileHeader = ({ title, showBack }: ProfileHeaderProps) => (
  <div className="profile-header">
    <div>
      <p className="profile-eyebrow">Conta</p>
      <h1 className="h3 mb-1">{title}</h1>
      <p className="text-muted mb-0">Informacoes principais do usuario.</p>
    </div>
    {showBack ? (
      <Link to="/app/users" className="btn btn-outline-secondary">
        Voltar para usuarios
      </Link>
    ) : null}
  </div>
)

export default ProfileHeader
