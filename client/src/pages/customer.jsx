  import React, { useState, useEffect } from 'react';
  import axios from 'axios';
  import './customer.css';
  import { IoCloseSharp } from "react-icons/io5";
  import toast, { Toaster } from 'react-hot-toast';
  import otherIcon from '../assets/other.png';
  import maleIcon from '../assets/male-2.png';
  import femaleIcon from '../assets/female-2.png';
  import CustomerDetailModal from '../components/CustomerDetailProfile';


  export const calculateStatus = (customer) => {
    const now = new Date();
    const dateAdded = new Date(customer.date_added);
    let duration;
    switch (customer.subscription) {
      case 'basic':
        duration = 1 * 24 * 60 * 60 * 1000; // 1 day
        break;
      case 'premium':
        duration = 7 * 24 * 60 * 60 * 1000; // 1 week
        break;
      case 'vip-monthly':
        duration = 30 * 24 * 60 * 60 * 1000; // 1 month
        break;
      case 'vip-yearly':
        duration = 365 * 24 * 60 * 60 * 1000; // 1 year
        break;
      case '5-min-test': // 5-minute duration for testing
        duration = 5 * 60 * 1000; // 5 minutes
      break;
      default:
        duration = 0;
    }
    const expiryDate = new Date(dateAdded.getTime() + duration);
    const isActive = now < expiryDate;
    const remainingTime = expiryDate - now;

    return {
      status: isActive ? 'active' : 'expired',
      remainingTime: isActive ? remainingTime : 0,
    };
  };

  export const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const days = Math.floor(totalSeconds / (24 * 60 * 60));
    const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  const Subscription = ({ onSubscriptionChange, onSubscriptionTypeChange }) => {
    const [subscriptionType, setSubscriptionType] = useState('');
    const [charge, setCharge] = useState('');
    const [quantity, setQuantity] = useState(1);

    const handleSubscriptionChange = (event) => {
      const selectedSubscription = event.target.value;
      setSubscriptionType(selectedSubscription);
      onSubscriptionTypeChange(selectedSubscription);
      updateCharge(selectedSubscription, quantity);
    };

    const handleQuantityChange = (event) => {
      const quantity = Number(event.target.value);
      setQuantity(quantity);
      updateCharge(subscriptionType, quantity);
    };

    const updateCharge = (subscription, quantity) => {
      let charge;
      switch (subscription) {
        case 'basic':
          charge = 50;
          break;
        case 'premium':
          charge = 200;
          break;
        case 'vip-monthly':
          charge = 400;
          break;
        case 'vip-yearly':
          charge = 4000;
          break;
        case '5-min-test':
          charge = 10;
          break;
        default:
          charge = 0;
      }
      const totalCharge = charge * quantity;
      setCharge(totalCharge);
      onSubscriptionChange(totalCharge);
    };

    return (
      <div className="subscription">
        <select onChange={handleSubscriptionChange} value={subscriptionType}>
          <option value="" disabled>Subscription</option>
          <option value="basic">Daily</option>
          <option value="premium">Weekly</option>
          <option value="vip-monthly">Monthly</option>
          <option value="vip-yearly">Yearly</option>
          <option value="5-min-test">Test</option>
        </select>
        <input type="number" min="1" value={quantity} onChange={handleQuantityChange} />
      </div>
    );
  };

  const Modal = ({ show, onClose, onAddCustomer }) => {
    const [charge, setCharge] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [address, setAddress] = useState('');
    const [birthdate, setBirthdate] = useState('');
    const [gender, setGender] = useState('');
    const [instructor, setInstructor] = useState('');
    const [subscriptionType, setSubscriptionType] = useState('');

    const handleSubscriptionChange = (newCharge) => {
      setCharge(newCharge);
    };

    const handleSubscriptionTypeChange = (type) => {
      setSubscriptionType(type);
    }

    useEffect(() => {
      if (!show) {
        setCharge('');
        setFirstName('');
        setLastName('');
        setAddress('');
        setBirthdate('');
        setGender('');
        setInstructor('');
        setSubscriptionType('');
      }
    }, [show]);

    const handleAddClick = async () => {
      if (
        firstName && lastName && address && birthdate && gender && instructor && subscriptionType && charge
      ) {
        try {
          const newCustomer = { 
            firstName, 
            lastName, 
            address, 
            birthdate, 
            gender, 
            instructor, 
            subscription: subscriptionType, 
            charge, 
            date_added: new Date().toISOString() // Include date_added field
          };
          await axios.post('http://localhost:8800/customer', newCustomer);
          toast.success('Member added successfully!');
          onAddCustomer(newCustomer);
          setTimeout(() => {
            onClose();
          }, 1000);
        } catch (error) {
          toast.error('Failed to add member.');
          console.error('Error adding customer:', error);
        }
      } else {
        toast.error('Please fill out all fields.');
      }
    };
    

    if (!show) {
      return null;
    }

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="title-container-modal">
            <h2>Add Member</h2>
          </div>
          <IoCloseSharp className="close-icon" onClick={onClose} />
          <div className="modal-body">
            <div className="input-row">
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <input
              type="text"
              placeholder="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <input
              type="text"
              placeholder="Birthdate (YYYY-DD-MM)"
              className="birthdate-input"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
            />
            <select value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="" disabled>Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <select value={instructor} onChange={(e) => setInstructor(e.target.value)}>
              <option value="" disabled>Instructor</option>
              <option value="instructor1">Instructor 1</option>
              <option value="instructor2">Instructor 2</option>
              <option value="instructor3">Instructor 3</option>
            </select>
            <Subscription onSubscriptionChange={handleSubscriptionChange} onSubscriptionTypeChange={handleSubscriptionTypeChange} />
            <div className="charge-container">
              <h4>Charge:</h4>
              <h4>${charge}</h4>
            </div>
            <div className="button-row">
              <button className="cancel-btn" onClick={onClose}>Cancel</button>
              <button className="add-btn" onClick={handleAddClick}>Add</button>
            </div>
          </div>
        </div>
        <Toaster />
      </div>
    );
  };

const Customers = () => {
  const [showModal, setShowModal] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get('http://localhost:8800/customer');
        setCustomers(response.data);
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };

    fetchCustomers();

    const interval = setInterval(fetchCustomers, 1000 * 60); // Fetch every minute
    return () => clearInterval(interval); // Clean up interval on unmount
  }, []);

  const handleAddButtonClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleAddCustomer = (newCustomer) => {
    setCustomers((prevCustomers) => [newCustomer, ...prevCustomers]);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };
  const handleRowClick = (customer) => {
    setSelectedCustomer(customer);
    setShowDetailModal(true);
  }
  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedCustomer(null);
  }

  // Filter customers based on the search query
  

 

  const filteredCustomers = customers.filter((customer) =>
    `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCustomers = filteredCustomers.filter(
    (customer) => calculateStatus(customer).status === 'active'
  );
  const expiredCustomers = filteredCustomers.filter(
    (customer) => calculateStatus(customer).status === 'expired' 
  );
  

  return (
    <div className="customer-content">
      <div className="title">
        <h1>Customers</h1>
      </div>
      <div className="search-remove-add">
        <input 
          name="myInput" 
          placeholder="Search" 
          value={searchQuery} 
          onChange={handleSearchChange}
        />

        <div className="buttons">
          <button className="remove-btn">Remove</button>
          <button className="add-btn-modal" onClick={handleAddButtonClick}>Member</button>
        </div>
      </div>

      <div className="tables-container">
        <div className="customer-table-container">
          <table className="customer-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Subscription</th>
                <th>Instructor</th>
                <th>Status</th>
                <th>Remaining Time</th>
              </tr>
            </thead>
            <tbody>
            {activeCustomers.map((customer, index) => {
                const { status, remainingTime } = calculateStatus(customer);
                const statusClass = status === 'active' ? 'status-active' : 'status-inactive';
                return (
                  <tr key={index} className="customer-row" onClick={() => handleRowClick(customer)}>
                    <td>
                      <div className="cell-content">
                        {customer.gender === 'male' && <img src={maleIcon} alt="Male" className="gender-icon" />}
                        {customer.gender === 'female' && <img src={femaleIcon} alt="Female" className="gender-icon" />}
                        {customer.gender === 'other' && <img src={otherIcon} alt="Other" className="gender-icon" />}
                        {`${customer.firstName} ${customer.lastName}`}
                      </div>
                    </td>
                    <td><div className="cell-content">{customer.subscription}</div></td>
                    <td><div className="cell-content">{customer.instructor}</div></td>
                    <td><div className={`cell-content-status ${statusClass}`}>{status}</div></td>
                    <td><div className="cell-content">{formatTime(remainingTime)}</div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="customer-table2-container">
          <div className="title-container">
            <h3>Expired Membership</h3>
          </div>
          <table className="customer-table">
        
            <tbody>
              {expiredCustomers.map((customer, index) => (
                <tr key={index} className="customer-row" onClick={() => handleRowClick(customer)}>
                  <td>
                    <div className="cell-content">
                      {customer.gender === 'male' && <img src={maleIcon} alt="Male" className="gender-icon" />}
                      {customer.gender === 'female' && <img src={femaleIcon} alt="Female" className="gender-icon" />}
                      {customer.gender === 'other' && <img src={otherIcon} alt="Other" className="gender-icon" />}
                      {`${customer.firstName} ${customer.lastName}`}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Modal show={showModal} onClose={handleCloseModal} onAddCustomer={handleAddCustomer} />
      {selectedCustomer && (
        <CustomerDetailModal show={showDetailModal} onClose={handleCloseDetailModal} customer={selectedCustomer} />
      )}
    </div>
  );
};

export default Customers;
