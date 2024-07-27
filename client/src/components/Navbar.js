import { NavLink } from 'react-router-dom';
import dashboard from '../assets/dashboard-logo.png';
import customer from '../assets/customer-logo.png';
import instructors from '../assets/instructor-logo.png';
import reports from '../assets/reports-logo.png';


const Navbar = ({ show }) => {
    return (
        <div className={`sidenav ${show ? 'active' : 'collapsed'}`}>
            <ul>
                <li>
                    <NavLink to='/dashboard' activeClassName='active'>
                        <img src={dashboard} alt='Dashboard' className='nav-icon' />
                        <span>Dashboard</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink to='/customer' activeClassName='active'>
                        <img src={customer} alt='Customer' className='nav-icon' />
                        <span>Customers</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink to='/instructors' activeClassName='active'>
                        <img src={instructors} alt='Instructors' className='nav-icon' />
                        <span>Instructors</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink to='/reports' activeClassName='active'>
                        <img src={reports} alt='Reports' className='nav-icon' />
                        <span>Reports</span>
                    </NavLink>
                </li>
            </ul>
        </div>
    );
}

export default Navbar;
