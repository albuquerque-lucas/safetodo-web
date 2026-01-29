import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faGear,
  faHouse,
  faListCheck,
  faPeopleGroup,
  faUser,
  faUsers,
} from '@fortawesome/free-solid-svg-icons'

type SidebarProps = {
  isOpen: boolean
  isAdmin: boolean
}

const Sidebar = ({ isOpen, isAdmin }: SidebarProps) => (
  <motion.aside
    className="sidebar"
    aria-label="Menu lateral"
    initial={false}
    animate={{
      width: isOpen ? 220 : 72,
      transition: {
        type: 'spring',
        stiffness: 240,
        damping: 26,
        delay: isOpen ? 0 : 0.12,
      },
    }}
  >
    <nav className="sidebar-nav">
      <NavLink
        className={({ isActive }) =>
          `sidebar-link ${isActive ? 'active' : ''}`
        }
        to="/app"
        end
      >
        <span className="sidebar-icon">
          <FontAwesomeIcon icon={faHouse} />
        </span>
        <motion.span
          className="sidebar-text"
          initial={false}
          animate={isOpen ? 'open' : 'closed'}
          variants={{
            open: { opacity: 1, x: 0, maxWidth: 160 },
            closed: { opacity: 0, x: 8, maxWidth: 0 },
          }}
          transition={{
            type: 'tween',
            duration: 0.18,
            delay: isOpen ? 0.08 : 0,
          }}
        >
          Home
        </motion.span>
      </NavLink>
      <NavLink
        className={({ isActive }) =>
          `sidebar-link ${isActive ? 'active' : ''}`
        }
        to="/app/tasks"
      >
        <span className="sidebar-icon">
          <FontAwesomeIcon icon={faListCheck} />
        </span>
        <motion.span
          className="sidebar-text"
          initial={false}
          animate={isOpen ? 'open' : 'closed'}
          variants={{
            open: { opacity: 1, x: 0, maxWidth: 160 },
            closed: { opacity: 0, x: 8, maxWidth: 0 },
          }}
          transition={{
            type: 'tween',
            duration: 0.18,
            delay: isOpen ? 0.08 : 0,
          }}
        >
          Tasks
        </motion.span>
      </NavLink>
      <NavLink
        className={({ isActive }) =>
          `sidebar-link ${isActive ? 'active' : ''}`
        }
        to="/app/profile"
      >
        <span className="sidebar-icon">
          <FontAwesomeIcon icon={faUser} />
        </span>
        <motion.span
          className="sidebar-text"
          initial={false}
          animate={isOpen ? 'open' : 'closed'}
          variants={{
            open: { opacity: 1, x: 0, maxWidth: 160 },
            closed: { opacity: 0, x: 8, maxWidth: 0 },
          }}
          transition={{
            type: 'tween',
            duration: 0.18,
            delay: isOpen ? 0.08 : 0,
          }}
        >
          Perfil
        </motion.span>
      </NavLink>
      <NavLink
        className={({ isActive }) =>
          `sidebar-link ${isActive ? 'active' : ''}`
        }
        to="/app/users"
      >
        <span className="sidebar-icon">
          <FontAwesomeIcon icon={faUsers} />
        </span>
        <motion.span
          className="sidebar-text"
          initial={false}
          animate={isOpen ? 'open' : 'closed'}
          variants={{
            open: { opacity: 1, x: 0, maxWidth: 160 },
            closed: { opacity: 0, x: 8, maxWidth: 0 },
          }}
          transition={{
            type: 'tween',
            duration: 0.18,
            delay: isOpen ? 0.08 : 0,
          }}
        >
          Usuarios
        </motion.span>
      </NavLink>
      <NavLink
        className={({ isActive }) =>
          `sidebar-link ${isActive ? 'active' : ''}`
        }
        to="/app/teams"
      >
        <span className="sidebar-icon">
          <FontAwesomeIcon icon={faPeopleGroup} />
        </span>
        <motion.span
          className="sidebar-text"
          initial={false}
          animate={isOpen ? 'open' : 'closed'}
          variants={{
            open: { opacity: 1, x: 0, maxWidth: 160 },
            closed: { opacity: 0, x: 8, maxWidth: 0 },
          }}
          transition={{
            type: 'tween',
            duration: 0.18,
            delay: isOpen ? 0.08 : 0,
          }}
        >
          Equipes
        </motion.span>
      </NavLink>
      {isAdmin ? (
        <NavLink
          className={({ isActive }) =>
            `sidebar-link ${isActive ? 'active' : ''}`
          }
          to="/app/admin"
        >
          <span className="sidebar-icon">
            <FontAwesomeIcon icon={faGear} />
          </span>
          <motion.span
            className="sidebar-text"
            initial={false}
            animate={isOpen ? 'open' : 'closed'}
            variants={{
              open: { opacity: 1, x: 0, maxWidth: 160 },
              closed: { opacity: 0, x: 8, maxWidth: 0 },
            }}
            transition={{
              type: 'tween',
              duration: 0.18,
              delay: isOpen ? 0.08 : 0,
            }}
          >
            Admin
          </motion.span>
        </NavLink>
      ) : null}
    </nav>
  </motion.aside>
)

export default Sidebar
